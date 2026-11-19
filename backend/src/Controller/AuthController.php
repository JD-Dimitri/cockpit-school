<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * Comptes élèves (JSON). Connexion : « json_login » du pare-feu (config/packages/security.yaml),
 * qui authentifie puis laisse la main à login() ; tentatives limitées (login_throttling).
 */
final class AuthController extends AbstractController
{
    /** Règle partagée avec l'interface (frontend/src/auth.ts, passwordProblem). */
    public static function passwordConstraints(): array
    {
        return [
            new Assert\NotBlank(message: 'Mot de passe obligatoire.'),
            new Assert\Length(min: 10, max: 4096, minMessage: 'Au moins 10 caractères.'),
            new Assert\Regex(pattern: '/[a-zA-Z]/', message: 'Mélangez lettres et chiffres.'),
            new Assert\Regex(pattern: '/[0-9]/', message: 'Mélangez lettres et chiffres.'),
            new Assert\NotCompromisedPassword(message: 'Ce mot de passe figure dans des fuites connues : choisissez-en un autre.', skipOnError: true),
        ];
    }

    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request,
        UserPasswordHasherInterface $hasher,
        ValidatorInterface $validator,
        EntityManagerInterface $em,
        Security $security,
    ): JsonResponse {
        $body = json_decode($request->getContent(), true);
        if (!\is_array($body)) {
            return $this->json(['message' => 'Requête invalide.'], Response::HTTP_BAD_REQUEST);
        }
        $user = (new User())
            ->setEmail((string) ($body['email'] ?? ''))
            ->setName((string) ($body['name'] ?? ''));
        $plain = (string) ($body['password'] ?? '');

        $errors = $validator->validate($user);
        $pwErrors = $validator->validate($plain, self::passwordConstraints());
        if (\count($errors) > 0 || \count($pwErrors) > 0) {
            $first = \count($errors) > 0 ? $errors[0]->getMessage() : 'Mot de passe : '.$pwErrors[0]->getMessage();

            return $this->json(['message' => $first], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user->setPassword($hasher->hashPassword($user, $plain));
        $em->persist($user);
        $em->flush();

        // Connecté directement après l'inscription.
        $security->login($user, 'json_login', 'main');

        return $this->json($user->toArray(), Response::HTTP_CREATED);
    }

    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(#[CurrentUser] ?User $user): JsonResponse
    {
        // Atteint seulement si json_login a réussi ; en cas d'échec, le pare-feu répond 401.
        if (null === $user) {
            return $this->json(['message' => 'E-mail ou mot de passe incorrect.'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json($user->toArray());
    }

    #[Route('/api/me', name: 'api_me', methods: ['GET'])]
    public function me(#[CurrentUser] ?User $user): JsonResponse
    {
        if (null === $user) {
            return $this->json(['message' => 'Non connecté.'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json($user->toArray());
    }

    #[Route('/api/logout', name: 'api_logout', methods: ['POST'])]
    public function logout(): never
    {
        // Intercepté par le pare-feu (logout), voir App\Security\JsonLogoutSubscriber.
        throw new \LogicException('Intercepté par le pare-feu.');
    }
}
