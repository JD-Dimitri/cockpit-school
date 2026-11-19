<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use SymfonyCasts\Bundle\ResetPassword\Exception\ResetPasswordExceptionInterface;
use SymfonyCasts\Bundle\ResetPassword\ResetPasswordHelperInterface;

/**
 * Mot de passe oublié : lien à usage unique et à durée limitée (SymfonyCasts ResetPasswordBundle).
 * La réponse est la même que l'adresse existe ou non : on ne révèle pas qui a un compte.
 */
final class PasswordController extends AbstractController
{
    private const SENT = 'Si un compte existe pour cette adresse, un e-mail vient d\'être envoyé.';

    public function __construct(
        private readonly ResetPasswordHelperInterface $resetHelper,
        #[Autowire('%env(FRONT_URL)%')] private readonly string $frontUrl,
        #[Autowire('%env(MAILER_FROM)%')] private readonly string $mailFrom,
    ) {
    }

    #[Route('/api/password/forgot', name: 'api_password_forgot', methods: ['POST'])]
    public function forgot(
        Request $request,
        UserRepository $users,
        MailerInterface $mailer,
        LoggerInterface $logger,
        #[Autowire(service: 'limiter.password_forgot')] RateLimiterFactory $limiter,
    ): JsonResponse {
        if (!$limiter->create($request->getClientIp() ?? 'anon')->consume()->isAccepted()) {
            return $this->json(['message' => 'Trop de demandes. Réessayez dans quelques minutes.'], Response::HTTP_TOO_MANY_REQUESTS);
        }
        $body = json_decode($request->getContent(), true);
        $email = \is_array($body) ? (string) ($body['email'] ?? '') : '';
        $user = $email !== '' ? $users->findOneByEmail($email) : null;
        if (null === $user) {
            return $this->json(['message' => self::SENT]);
        }
        try {
            $token = $this->resetHelper->generateResetToken($user);
        } catch (ResetPasswordExceptionInterface $e) {
            // Demande trop rapprochée de la précédente : même réponse, rien n'est envoyé.
            return $this->json(['message' => self::SENT]);
        }
        $link = rtrim($this->frontUrl, '/').'/#/reinitialiser/'.rawurlencode($token->getToken());
        try {
            $mailer->send((new TemplatedEmail())
                ->from($this->mailFrom)
                ->to($user->getEmail())
                ->subject('PLANE SIMULATOR — choisir un nouveau mot de passe')
                ->htmlTemplate('email/reset.html.twig')
                ->textTemplate('email/reset.txt.twig')
                ->context(['name' => $user->getName(), 'link' => $link, 'expires' => $token->getExpirationMessageKey(), 'expiresData' => $token->getExpirationMessageData()]));
        } catch (\Throwable $e) {
            $logger->error('Envoi du lien de réinitialisation impossible', ['exception' => $e]);
        }

        return $this->json(['message' => self::SENT]);
    }

    #[Route('/api/password/reset', name: 'api_password_reset', methods: ['POST'])]
    public function reset(
        Request $request,
        UserPasswordHasherInterface $hasher,
        ValidatorInterface $validator,
        EntityManagerInterface $em,
    ): JsonResponse {
        $body = json_decode($request->getContent(), true);
        $token = \is_array($body) ? (string) ($body['token'] ?? '') : '';
        $plain = \is_array($body) ? (string) ($body['password'] ?? '') : '';

        $errors = $validator->validate($plain, AuthController::passwordConstraints());
        if (\count($errors) > 0) {
            return $this->json(['message' => 'Mot de passe : '.$errors[0]->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        try {
            $user = $this->resetHelper->validateTokenAndFetchUser($token);
        } catch (ResetPasswordExceptionInterface $e) {
            return $this->json(['message' => 'Ce lien est invalide ou expiré. Demandez-en un nouveau.'], Response::HTTP_BAD_REQUEST);
        }
        // Le jeton ne sert qu'une fois.
        $this->resetHelper->removeResetRequest($token);
        $user->setPassword($hasher->hashPassword($user, $plain));
        $em->flush();

        return $this->json(['message' => 'Mot de passe changé.']);
    }
}
