<?php

namespace App\Tests\Traffic;

use App\Traffic\Bbox;
use App\Traffic\Fr24Source;
use App\Traffic\OpenSkySource;
use App\Traffic\ReceiverSource;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Cache\Adapter\ArrayAdapter;
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Component\HttpClient\Response\MockResponse;

/** Sources de trafic réel, sans réseau : réponses simulées au format documenté de chaque service (exemples fictifs). */
final class SourcesTest extends TestCase
{
    private static function fixture(string $name): string
    {
        return (string) file_get_contents(__DIR__.'/../fixtures/trafic/'.$name.'.json');
    }

    public function testOpenSkyAnonymousQueriesTheZone(): void
    {
        $calls = [];
        $http = new MockHttpClient(function (string $method, string $url, array $o) use (&$calls) {
            $calls[] = [$method, $url, $o['normalized_headers']['authorization'] ?? null];

            return new MockResponse(self::fixture('opensky-exemple'));
        });
        $src = new OpenSkySource($http, new ArrayAdapter(), null, null, true);
        $got = $src->fetch(new Bbox(48.0, 1.5, 49.5, 3.5));
        self::assertCount(2, $got);
        self::assertStringStartsWith(OpenSkySource::API.'?lamin=48', $calls[0][1]);
        self::assertStringContainsString('lomax=3.5', $calls[0][1]);
        self::assertNull($calls[0][2], 'sans identifiants : pas d\'en-tête Authorization');
    }

    public function testOpenSkyOAuthTokenIsRequestedOnceThenReused(): void
    {
        $calls = [];
        $http = new MockHttpClient(function (string $method, string $url) use (&$calls) {
            $calls[] = $method.' '.$url;

            return str_starts_with($url, OpenSkySource::TOKEN_URL)
                ? new MockResponse('{"access_token":"jeton-a","expires_in":1800}')
                : new MockResponse(self::fixture('opensky-exemple'));
        });
        $src = new OpenSkySource($http, new ArrayAdapter(), 'client', 'secret', true);
        $src->fetch(new Bbox(48.0, 1.5, 49.5, 3.5));
        $src->fetch(new Bbox(48.0, 1.5, 49.5, 3.5));
        self::assertSame(1, \count(array_filter($calls, static fn ($c) => str_starts_with($c, 'POST'))), implode("\n", $calls));
        self::assertCount(3, $calls);
    }

    public function testOpenSkyQuotaExhaustedIsReported(): void
    {
        $src = new OpenSkySource(new MockHttpClient(new MockResponse('', ['http_code' => 429])), new ArrayAdapter(), null, null, true);
        $this->expectExceptionMessage('crédits du jour épuisés');
        $src->fetch(new Bbox(48.0, 1.5, 49.5, 3.5));
    }

    public function testOpenSkyIsOffUntilEnabled(): void
    {
        self::assertFalse((new OpenSkySource(new MockHttpClient(), new ArrayAdapter()))->configured());
    }

    public function testFr24SendsKeyVersionAndBoundsNorthSouthWestEast(): void
    {
        $seen = null;
        $http = new MockHttpClient(function (string $method, string $url, array $o) use (&$seen) {
            $seen = [$url, $o['normalized_headers']['authorization'][0] ?? '', $o['normalized_headers']['accept-version'][0] ?? ''];

            return new MockResponse(self::fixture('fr24-exemple'));
        });
        $src = new Fr24Source($http, 'cle-test');
        self::assertTrue($src->configured());
        $got = $src->fetch(new Bbox(48.0, 1.5, 49.5, 3.5));
        self::assertCount(2, $got);
        self::assertSame(Fr24Source::API.'?bounds='.rawurlencode('49.500,48.000,1.500,3.500'), $seen[0]);
        self::assertSame('Authorization: Bearer cle-test', $seen[1]);
        self::assertSame('Accept-Version: v1', $seen[2]);
    }

    public function testFr24WithoutKeyIsOff(): void
    {
        self::assertFalse((new Fr24Source(new MockHttpClient(), ''))->configured());
    }

    public function testReceiverStoresAndFiltersByZone(): void
    {
        $src = new ReceiverSource(new ArrayAdapter(), 'jeton-de-test-0123456789abcdef');
        self::assertTrue($src->accepts('jeton-de-test-0123456789abcdef'));
        self::assertFalse($src->accepts('mauvais'));
        self::assertSame(3, $src->store(json_decode(self::fixture('readsb-exemple'), true), 1763540000.0));
        self::assertCount(3, $src->fetch(new Bbox(48.0, 1.5, 49.5, 3.5)));
        self::assertCount(0, $src->fetch(new Bbox(40.0, -75.0, 41.0, -73.0)));
    }

    public function testReceiverNeedsALongToken(): void
    {
        self::assertFalse((new ReceiverSource(new ArrayAdapter(), 'court'))->configured());
    }
}
