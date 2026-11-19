<?php

namespace App\Traffic;

use Psr\Cache\CacheItemPoolInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * OpenSky Network (https://openskynetwork.github.io/opensky-api/rest.html).
 * - GET /api/states/all?lamin=&lomin=&lamax=&lomax= ;
 * - connexion OAuth2 « client credentials » (jeton valable 30 min, redemandé après un refus 401) ;
 * - sans identifiants : 400 crédits par jour ; avec un compte : 4 000 (8 000 pour qui alimente OpenSky avec un récepteur).
 * Conditions : recherche et usage non commercial ; un usage commercial demande un accord avec OpenSky.
 */
final class OpenSkySource implements TrafficSourceInterface
{
    public const API = 'https://opensky-network.org/api/states/all';
    public const TOKEN_URL = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';
    private const TOKEN_KEY = 'trafic.opensky.jeton';

    public function __construct(
        private readonly HttpClientInterface $http,
        #[Autowire('@cache.app')] private readonly CacheItemPoolInterface $cache,
        #[Autowire('%env(default::TRAFIC_OPENSKY_CLIENT_ID)%')] private readonly ?string $clientId = null,
        #[Autowire('%env(default::TRAFIC_OPENSKY_CLIENT_SECRET)%')] private readonly ?string $clientSecret = null,
        #[Autowire('%env(bool:default::TRAFIC_OPENSKY_ACTIVE)%')] private readonly ?bool $enabled = false,
    ) {
    }

    public function name(): string
    {
        return 'opensky';
    }

    /** Activée explicitement ; les identifiants sont facultatifs (sans eux : accès anonyme, 400 crédits par jour). */
    public function configured(): bool
    {
        return (bool) $this->enabled;
    }

    public function fetch(Bbox $bbox): array
    {
        $query = ['lamin' => $bbox->latMin, 'lomin' => $bbox->lonMin, 'lamax' => $bbox->latMax, 'lomax' => $bbox->lonMax];
        $res = $this->http->request('GET', self::API, ['query' => $query, 'headers' => $this->authHeaders(), 'timeout' => 8]);
        if (401 === $res->getStatusCode() && $this->hasCredentials()) {
            $this->cache->deleteItem(self::TOKEN_KEY);
            $res = $this->http->request('GET', self::API, ['query' => $query, 'headers' => $this->authHeaders(), 'timeout' => 8]);
        }
        if (429 === $res->getStatusCode()) {
            throw new \RuntimeException('OpenSky : crédits du jour épuisés.');
        }
        if (200 !== $res->getStatusCode()) {
            throw new \RuntimeException('OpenSky : réponse '.$res->getStatusCode().'.');
        }

        return Normalizer::fromOpenSky($res->toArray(false));
    }

    private function hasCredentials(): bool
    {
        return '' !== (string) $this->clientId && '' !== (string) $this->clientSecret;
    }

    /** @return array<string, string> */
    private function authHeaders(): array
    {
        if (!$this->hasCredentials()) {
            return [];
        }
        $item = $this->cache->getItem(self::TOKEN_KEY);
        if (!$item->isHit()) {
            $res = $this->http->request('POST', self::TOKEN_URL, ['body' => [
                'grant_type' => 'client_credentials', 'client_id' => $this->clientId, 'client_secret' => $this->clientSecret,
            ], 'timeout' => 8]);
            if (200 !== $res->getStatusCode()) {
                throw new \RuntimeException('OpenSky : identifiants refusés ('.$res->getStatusCode().').');
            }
            $tok = $res->toArray(false);
            $item->set((string) ($tok['access_token'] ?? ''));
            $item->expiresAfter(max(60, (int) ($tok['expires_in'] ?? 1800) - 120));   // marge de 2 min avant l'expiration
            $this->cache->save($item);
        }

        return ['Authorization' => 'Bearer '.$item->get()];
    }
}
