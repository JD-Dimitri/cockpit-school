<?php

namespace App\Command;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * Crée un compte administrateur, ou donne le rôle à un compte existant.
 * Le mot de passe est demandé au clavier (masqué) : il n'apparaît ni dans le dépôt, ni dans l'historique du terminal.
 *
 *   php bin/console app:admin:create vous@exemple.fr
 */
#[AsCommand(name: 'app:admin:create', description: 'Crée un administrateur (ou donne le rôle ROLE_ADMIN à un compte existant)')]
final class AdminCreateCommand extends Command
{
    public function __construct(
        private readonly UserRepository $users,
        private readonly EntityManagerInterface $em,
        private readonly UserPasswordHasherInterface $hasher,
        private readonly ValidatorInterface $validator,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addArgument('email', InputArgument::REQUIRED, 'Adresse e-mail du compte');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $email = mb_strtolower(trim((string) $input->getArgument('email')));
        $user = $this->users->findOneBy(['email' => $email]);

        if (null === $user) {
            $user = (new User())->setEmail($email)->setName((string) $io->ask('Prénom ou pseudonyme', 'Admin'));
            $password = (string) $io->askHidden('Mot de passe (10 caractères minimum, lettres et chiffres)');
            if (mb_strlen($password) < 10 || !preg_match('/[a-zA-Z]/', $password) || !preg_match('/\d/', $password)) {
                $io->error('Mot de passe trop faible : au moins 10 caractères, avec des lettres et des chiffres.');

                return Command::FAILURE;
            }
            $user->setPassword($this->hasher->hashPassword($user, $password));
            $errors = $this->validator->validate($user);
            if (\count($errors) > 0) {
                $io->error((string) $errors);

                return Command::FAILURE;
            }
            $this->em->persist($user);
        }

        $roles = array_values(array_diff($user->getRoles(), ['ROLE_USER']));
        if (!\in_array('ROLE_ADMIN', $roles, true)) {
            $roles[] = 'ROLE_ADMIN';
        }
        $user->setRoles($roles);
        $this->em->flush();
        $io->success($email.' est administrateur.');

        return Command::SUCCESS;
    }
}
