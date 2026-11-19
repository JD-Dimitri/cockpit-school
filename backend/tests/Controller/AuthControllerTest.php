<?php

namespace App\Tests\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/** Comptes : inscription, connexion, session, déconnexion, mot de passe oublié et réinitialisation. */
final class AuthControllerTest extends WebTestCase
{
    private KernelBrowser $client;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $em = static::getContainer()->get(EntityManagerInterface::class);
        $tool = new SchemaTool($em);
        $meta = $em->getMetadataFactory()->getAllMetadata();
        $tool->dropSchema($meta);
        $tool->createSchema($meta);
    }

    private function post(string $url, array $body): array
    {
        $this->client->request('POST', $url, server: ['CONTENT_TYPE' => 'application/json'], content: json_encode($body));

        return json_decode((string) $this->client->getResponse()->getContent(), true) ?? [];
    }

    public function testRegisterLoginMeLogout(): void
    {
        $r = $this->post('/api/register', ['name' => 'Alex', 'email' => 'Alex@Example.org', 'password' => 'decollage2026']);
        self::assertResponseStatusCodeSame(201);
        self::assertSame(['email' => 'alex@example.org', 'name' => 'Alex'], $r);

        $this->client->request('GET', '/api/me');
        self::assertResponseIsSuccessful();

        $this->post('/api/logout', []);
        self::assertResponseIsSuccessful();
        $this->client->request('GET', '/api/me');
        self::assertResponseStatusCodeSame(401);

        $r = $this->post('/api/login', ['email' => 'alex@example.org', 'password' => 'decollage2026']);
        self::assertResponseIsSuccessful();
        self::assertSame('Alex', $r['name']);
        self::assertArrayNotHasKey('password', $r);
    }

    public function testWrongPasswordIs401(): void
    {
        $this->post('/api/register', ['name' => 'Alex', 'email' => 'alex@example.org', 'password' => 'decollage2026']);
        $this->post('/api/logout', []);
        $this->post('/api/login', ['email' => 'alex@example.org', 'password' => 'mauvais-mot-2026']);
        self::assertResponseStatusCodeSame(401);
    }

    public function testWeakPasswordAndDuplicateEmailAreRefused(): void
    {
        $r = $this->post('/api/register', ['name' => 'Alex', 'email' => 'alex@example.org', 'password' => 'court1']);
        self::assertResponseStatusCodeSame(422);
        self::assertStringContainsString('10 caractères', $r['message']);

        $this->post('/api/register', ['name' => 'Alex', 'email' => 'alex@example.org', 'password' => 'decollage2026']);
        $this->post('/api/logout', []);
        $r = $this->post('/api/register', ['name' => 'Bis', 'email' => 'ALEX@example.org', 'password' => 'decollage2026']);
        self::assertResponseStatusCodeSame(422);
        self::assertStringContainsString('existe déjà', $r['message']);
    }

    public function testForgotDoesNotRevealAccounts(): void
    {
        $known = $this->post('/api/password/forgot', ['email' => 'personne@example.org']);
        self::assertResponseIsSuccessful();
        $this->post('/api/register', ['name' => 'Alex', 'email' => 'alex@example.org', 'password' => 'decollage2026']);
        $real = $this->post('/api/password/forgot', ['email' => 'alex@example.org']);
        self::assertResponseIsSuccessful();
        self::assertSame($known, $real);
        self::assertEmailCount(1);
        $mail = self::getMailerMessage();
        self::assertEmailHtmlBodyContains($mail, '#/reinitialiser/');
    }

    public function testResetWithLinkFromEmail(): void
    {
        $this->post('/api/register', ['name' => 'Alex', 'email' => 'alex@example.org', 'password' => 'decollage2026']);
        $this->post('/api/logout', []);
        $this->post('/api/password/forgot', ['email' => 'alex@example.org']);
        preg_match('~#/reinitialiser/([^"\s<]+)~', (string) self::getMailerMessage()->getHtmlBody(), $m);
        $token = rawurldecode($m[1]);

        $this->post('/api/password/reset', ['token' => $token, 'password' => 'atterrissage2026']);
        self::assertResponseIsSuccessful();
        // Le lien ne sert qu'une fois.
        $this->post('/api/password/reset', ['token' => $token, 'password' => 'atterrissage2027']);
        self::assertResponseStatusCodeSame(400);

        $this->post('/api/login', ['email' => 'alex@example.org', 'password' => 'atterrissage2026']);
        self::assertResponseIsSuccessful();
    }

    public function testCoursePdf(): void
    {
        $this->client->request('GET', '/api/pdf/cours/p1/avion');
        self::assertResponseIsSuccessful();
        self::assertResponseHeaderSame('Content-Type', 'application/pdf');
        self::assertStringStartsWith('%PDF-', (string) $this->client->getResponse()->getContent());
        $this->client->request('GET', '/api/pdf/cours/p1/inexistant');
        self::assertResponseStatusCodeSame(404);
    }
}
