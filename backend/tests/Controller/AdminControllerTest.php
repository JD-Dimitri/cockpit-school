<?php

namespace App\Tests\Controller;

use App\Tests\LoggedInTrait;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/** Espace administrateur : réservé à ROLE_ADMIN (visiteur 401, élève 403, administrateur 200). */
final class AdminControllerTest extends WebTestCase
{
    use LoggedInTrait;

    public function testVisiteurRefuse(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/admin/doc');
        self::assertResponseStatusCodeSame(401);
    }

    public function testEleveRefuse(): void
    {
        $client = static::createClient();
        self::loggedIn($client);
        $client->request('GET', '/api/admin/doc');
        self::assertResponseStatusCodeSame(403);
        $client->request('GET', '/api/me');
        self::assertFalse(json_decode((string) $client->getResponse()->getContent(), true)['admin']);
    }

    public function testAdministrateurAutorise(): void
    {
        $client = static::createClient();
        $u = self::loggedIn($client);
        $u->setRoles(['ROLE_ADMIN']);
        static::getContainer()->get(EntityManagerInterface::class)->flush();
        $client->loginUser($u);
        $client->request('GET', '/api/admin/doc');
        self::assertResponseIsSuccessful();
        $doc = json_decode((string) $client->getResponse()->getContent(), true);
        self::assertSame('Comment ce projet a été réalisé ?', $doc['title']);
        self::assertStringContainsString('Three.js', $doc['html']);
        $client->request('GET', '/api/me');
        self::assertTrue(json_decode((string) $client->getResponse()->getContent(), true)['admin']);
    }
}
