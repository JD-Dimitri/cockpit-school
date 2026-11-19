<?php

namespace App\Tests\Controller;

use App\Tests\LoggedInTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class DataControllerTest extends WebTestCase
{
    use LoggedInTrait;

    public function testHealth(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/health');
        self::assertResponseIsSuccessful();
        self::assertJsonStringEqualsJsonString('{"status":"ok"}', (string) $client->getResponse()->getContent());
    }

    public function testAircraftAreServed(): void
    {
        $client = static::createClient();
        self::loggedIn($client);
        $client->request('GET', '/api/data/aircraft');
        self::assertResponseIsSuccessful();
        $data = json_decode((string) $client->getResponse()->getContent(), true);
        self::assertCount(8, $data);
        self::assertSame('Airbus A350-900', $data['a350']['name']);
    }

    public function testUnknownFileIs404(): void
    {
        $client = static::createClient();
        self::loggedIn($client);
        $client->request('GET', '/api/data/inexistant');
        self::assertResponseStatusCodeSame(404);
    }

    public function testPathTraversalIsRejected(): void
    {
        $client = static::createClient();
        self::loggedIn($client);
        $client->request('GET', '/api/data/..%2Fcomposer');
        self::assertResponseStatusCodeSame(404);
    }

    /** F41 : sans compte, ni données, ni moteur, ni PDF, ni trafic ; l'accueil et les pages du compte restent ouverts. */
    public function testEverythingButAccountPagesNeedsLogin(): void
    {
        $client = static::createClient();
        foreach (['/api/data/aircraft', '/api/data', '/api/moteur', '/api/pdf/cours/p1/avion', '/api/trafic?latmin=48&lonmin=1.5&latmax=49.5&lonmax=3.5'] as $url) {
            $client->request('GET', $url);
            self::assertResponseStatusCodeSame(401, $url);
        }
        $client->request('GET', '/api/health');
        self::assertResponseIsSuccessful();
        $client->request('GET', '/api/me');
        self::assertResponseStatusCodeSame(401);
    }

    public function testEngineIsServedOnceLoggedIn(): void
    {
        $client = static::createClient();
        self::loggedIn($client);
        $client->request('GET', '/api/moteur');
        self::assertResponseIsSuccessful();
        self::assertResponseHeaderSame('X-Frame-Options', 'SAMEORIGIN');
        self::assertStringContainsString('<html', (string) $client->getResponse()->getContent());
    }
}
