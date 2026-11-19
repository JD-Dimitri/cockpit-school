<?php

namespace App\Traffic;

use Psr\Cache\CacheItemPoolInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Récepteur ADS-B personnel (Raspberry Pi + clé radio + readsb). Il est derrière la box de l'auteur :
 * c'est lui qui envoie son aircraft.json au serveur (POST /api/trafic/recepteur, jeton secret),
 * le serveur garde le dernier envoi 30 s. Script d'envoi : tools/recepteur/envoi_trafic.py.
 */
final class ReceiverSource implements TrafficSourceInterface
{
    private const KEY = 'trafic.recepteur.dernier';
    public const TTL = 30;

    public function __construct(
        #[Autowire('@cache.app')] private readonly CacheItemPoolInterface $cache,
        #[Autowire('%env(default::TRAFIC_RECEPTEUR_JETON)%')] private readonly ?string $token = null,
    ) {
    }

    public function name(): string
    {
        return 'recepteur';
    }

    public function configured(): bool
    {
        return null !== $this->token && \strlen($this->token) >= 24;
    }

    /** Le jeton envoyé par le récepteur est-il le bon ? (comparaison à temps constant) */
    public function accepts(?string $token): bool
    {
        return $this->configured() && null !== $token && hash_equals((string) $this->token, $token);
    }

    /** @param array<string, mixed> $json contenu de aircraft.json */
    public function store(array $json, float $receivedAt): int
    {
        // l'horloge du Pi peut dériver : l'heure de réception sur le serveur fait foi
        $json['now'] = $receivedAt;
        $targets = Normalizer::fromReadsb($json);
        $item = $this->cache->getItem(self::KEY);
        $item->set(array_map(static fn (Target $t) => $t->toArray(), $targets));
        $item->expiresAfter(self::TTL);
        $this->cache->save($item);

        return \count($targets);
    }

    public function fetch(Bbox $bbox): array
    {
        $item = $this->cache->getItem(self::KEY);
        if (!$item->isHit()) {
            return [];
        }
        $out = [];
        foreach ((array) $item->get() as $a) {
            $out[] = new Target(
                id: $a['id'], lat: $a['lat'], lon: $a['lon'], t: $a['t'], source: 'recepteur', indicatif: $a['indicatif'], immat: $a['immat'],
                type: $a['type'], altFt: $a['altFt'], solKt: $a['solKt'], route: $a['route'], vsFtMin: $a['vsFtMin'], auSol: $a['auSol'], squawk: $a['squawk'],
            );
        }

        return array_values(array_filter($out, static fn (Target $t) => $bbox->contains($t->lat, $t->lon)));
    }
}
