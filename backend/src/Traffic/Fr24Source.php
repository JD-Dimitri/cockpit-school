<?php

namespace App\Traffic;

use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * Flightradar24, API officielle (abonnement payant, clé ouverte sur fr24api.flightradar24.com).
 * GET https://fr24api.flightradar24.com/api/live/flight-positions/full?bounds=nord,sud,ouest,est
 * En-têtes : Authorization: Bearer <clé>, Accept-Version: v1.
 * Licence : vérifier ce que l'abonnement choisi autorise (affichage public, usage commercial) avant de l'activer.
 * Ne jamais récupérer les données du site par d'autres moyens que cette API.
 */
final class Fr24Source implements TrafficSourceInterface
{
    public const API = 'https://fr24api.flightradar24.com/api/live/flight-positions/full';

    public function __construct(
        private readonly HttpClientInterface $http,
        #[Autowire('%env(default::TRAFIC_FR24_CLE)%')] private readonly ?string $key = null,
    ) {
    }

    public function name(): string
    {
        return 'fr24';
    }

    public function configured(): bool
    {
        return '' !== (string) $this->key;
    }

    public function fetch(Bbox $bbox): array
    {
        // ordre imposé : nord, sud, ouest, est ; 3 décimales au plus
        $bounds = implode(',', array_map(static fn (float $v) => number_format($v, 3, '.', ''), [$bbox->latMax, $bbox->latMin, $bbox->lonMin, $bbox->lonMax]));
        $res = $this->http->request('GET', self::API, [
            'query' => ['bounds' => $bounds],
            'headers' => ['Authorization' => 'Bearer '.$this->key, 'Accept-Version' => 'v1', 'Accept' => 'application/json'],
            'timeout' => 8,
        ]);
        $code = $res->getStatusCode();
        if (401 === $code || 403 === $code) {
            throw new \RuntimeException('Flightradar24 : clé refusée.');
        }
        if (402 === $code || 429 === $code) {
            throw new \RuntimeException('Flightradar24 : crédits épuisés ou trop de requêtes.');
        }
        if (200 !== $code) {
            throw new \RuntimeException('Flightradar24 : réponse '.$code.'.');
        }

        return Normalizer::fromFr24($res->toArray(false));
    }
}
