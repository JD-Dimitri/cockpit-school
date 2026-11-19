<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class DataControllerTest extends WebTestCase
{
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
        $client->request('GET', '/api/data/aircraft');
        self::assertResponseIsSuccessful();
        $data = json_decode((string) $client->getResponse()->getContent(), true);
        self::assertCount(8, $data);
        self::assertSame('Airbus A350-900', $data['a350']['name']);
    }

    public function testUnknownFileIs404(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/data/inexistant');
        self::assertResponseStatusCodeSame(404);
    }

    public function testPathTraversalIsRejected(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/data/..%2Fcomposer');
        self::assertResponseStatusCodeSame(404);
    }
}
