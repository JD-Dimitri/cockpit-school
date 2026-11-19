<?php

namespace App\Tests;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;

/** Base de test vide + élève connecté (F41 : l'API est réservée aux comptes connectés). */
trait LoggedInTrait
{
    private static function loggedIn(KernelBrowser $client): User
    {
        $em = static::getContainer()->get(EntityManagerInterface::class);
        $tool = new SchemaTool($em);
        $meta = $em->getMetadataFactory()->getAllMetadata();
        $tool->dropSchema($meta);
        $tool->createSchema($meta);
        $u = (new User())->setEmail('eleve@example.org')->setName('Élève');
        $u->setPassword('non-utilise');
        $em->persist($u);
        $em->flush();
        $client->loginUser($u);

        return $u;
    }
}
