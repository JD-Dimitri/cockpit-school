<?php

namespace App\Tests\Controller;

use App\Tests\LoggedInTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/** Trafic réel : zone, sources non configurées, envoi du récepteur (jeton, format, compression). */
final class TrafficControllerTest extends WebTestCase
{
    use LoggedInTrait;

    private const TOKEN = 'jeton-de-test-0123456789abcdef';   // phpunit.xml.dist

    public function testZoneIsRequiredAndLimited(): void
    {
        $client = static::createClient();
        self::loggedIn($client);
        $client->request('GET', '/api/trafic');
        self::assertResponseStatusCodeSame(400);
        $client->request('GET', '/api/trafic?latmin=0&lonmin=0&latmax=30&lonmax=30');
        self::assertResponseStatusCodeSame(400);
        self::assertStringContainsString('trop grande', (string) $client->getResponse()->getContent());
    }

    public function testUnconfiguredSourcesAreReportedNotCalled(): void
    {
        $client = static::createClient();
        self::loggedIn($client);
        $client->request('GET', '/api/trafic?latmin=48&lonmin=1.5&latmax=49.5&lonmax=3.5&sources=opensky,fr24');
        self::assertResponseIsSuccessful();
        $j = json_decode((string) $client->getResponse()->getContent(), true);
        self::assertSame('non configurée', $j['sources']['opensky']['etat']);
        self::assertSame('non configurée', $j['sources']['fr24']['etat']);
        self::assertSame([], $j['appareils']);
    }

    public function testReceiverPushThenList(): void
    {
        $client = static::createClient();
        self::loggedIn($client);
        $body = (string) file_get_contents(__DIR__.'/../fixtures/trafic/readsb-exemple.json');
        $client->request('POST', '/api/trafic/recepteur', [], [], ['CONTENT_TYPE' => 'application/json', 'HTTP_X_RECEPTEUR_JETON' => 'mauvais'], $body);
        self::assertResponseStatusCodeSame(401);
        $client->request('POST', '/api/trafic/recepteur', [], [], ['CONTENT_TYPE' => 'application/json', 'HTTP_X_RECEPTEUR_JETON' => self::TOKEN], '{"pas":"bon"}');
        self::assertResponseStatusCodeSame(400);
        $client->request('POST', '/api/trafic/recepteur', [], [], ['CONTENT_TYPE' => 'application/json', 'HTTP_CONTENT_ENCODING' => 'gzip', 'HTTP_X_RECEPTEUR_JETON' => self::TOKEN], (string) gzencode($body));
        self::assertResponseIsSuccessful();
        self::assertSame(['recu' => 3], json_decode((string) $client->getResponse()->getContent(), true));

        $client->request('GET', '/api/trafic?latmin=48&lonmin=1.5&latmax=49.5&lonmax=3.5&sources=recepteur');
        $j = json_decode((string) $client->getResponse()->getContent(), true);
        self::assertSame('ok', $j['sources']['recepteur']['etat']);
        self::assertCount(3, $j['appareils']);
        self::assertSame('OBSERVÉ', $j['appareils'][0]['statut']);
    }
}
