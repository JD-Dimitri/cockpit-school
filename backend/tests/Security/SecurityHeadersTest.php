<?php

namespace App\Tests\Security;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/** Audit du 20/11/2026 : en-têtes de sécurité et limite des inscriptions. */
final class SecurityHeadersTest extends WebTestCase
{
    public function testEnTetes(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/health');
        self::assertResponseHeaderSame('X-Content-Type-Options', 'nosniff');
        self::assertResponseHeaderSame('X-Frame-Options', 'SAMEORIGIN');
        self::assertResponseHeaderSame('Referrer-Policy', 'strict-origin-when-cross-origin');
        $client->request('GET', '/api/me');
        self::assertStringContainsString('no-store', (string) $client->getResponse()->headers->get('Cache-Control'));
    }

    public function testInscriptionsLimitees(): void
    {
        $client = static::createClient();
        $client->disableReboot();   // même noyau : le compteur en mémoire est gardé d'une requête à l'autre
        $last = 0;
        for ($i = 0; $i < 6; ++$i) {
            $client->request('POST', '/api/register', server: ['CONTENT_TYPE' => 'application/json'], content: '{"name":"x","email":"pas-une-adresse","password":"court"}');
            $last = $client->getResponse()->getStatusCode();
        }
        self::assertSame(429, $last);
    }

    public function testJsonObligatoire(): void
    {
        $client = static::createClient();
        // formulaire « texte » d'un autre site : refusé sans rien créer
        $client->request('POST', '/api/register', server: ['CONTENT_TYPE' => 'text/plain'], content: '{"name":"x","email":"a@example.org","password":"motdepasse123"}');
        self::assertResponseStatusCodeSame(415);
        $client->request('POST', '/api/password/forgot', server: ['CONTENT_TYPE' => 'application/x-www-form-urlencoded'], content: 'email=a@example.org');
        self::assertResponseStatusCodeSame(415);
    }
}
