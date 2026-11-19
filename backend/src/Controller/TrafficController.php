<?php

namespace App\Controller;

use App\Traffic\Bbox;
use App\Traffic\Merger;
use App\Traffic\ReceiverSource;
use App\Traffic\Target;
use App\Traffic\TrafficSourceInterface;
use Psr\Cache\CacheItemPoolInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\DependencyInjection\Attribute\AutowireIterator;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Trafic réel (accueil des sources) : récepteur ADS-B personnel, OpenSky Network, Flightradar24.
 * Le serveur interroge les sources, jamais le navigateur des élèves : les clés restent secrètes,
 * et une même réponse (gardée 5 s par zone) sert tous les élèves.
 * Aucune source n'est active par défaut : chacune s'active dans .env.local (voir .env).
 */
final class TrafficController
{
    private const CACHE_TTL = 5;
    private const MAX_BODY = 4_000_000;

    /** @param iterable<TrafficSourceInterface> $sources */
    public function __construct(
        #[AutowireIterator('app.traffic_source')] private readonly iterable $sources,
        private readonly ReceiverSource $receiver,
        #[Autowire('@cache.app')] private readonly CacheItemPoolInterface $cache,
    ) {
    }

    #[Route('/api/trafic', name: 'api_traffic', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        try {
            $bbox = new Bbox(
                (float) $request->query->get('latmin', ''), (float) $request->query->get('lonmin', ''),
                (float) $request->query->get('latmax', ''), (float) $request->query->get('lonmax', ''),
            );
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['erreur' => $e->getMessage()], 400);
        }
        $wanted = array_filter(explode(',', (string) $request->query->get('sources', implode(',', Target::SOURCES))));

        $item = $this->cache->getItem('trafic.zone.'.$bbox->key().'.'.implode('-', $wanted));
        if ($item->isHit()) {
            return new JsonResponse($item->get());
        }

        $all = [];
        $state = [];
        foreach ($this->sources as $src) {
            $n = $src->name();
            if (!\in_array($n, $wanted, true)) {
                continue;
            }
            if (!$src->configured()) {
                $state[$n] = ['etat' => 'non configurée'];
                continue;
            }
            try {
                $got = $src->fetch($bbox);
                $all = array_merge($all, $got);
                $state[$n] = ['etat' => 'ok', 'appareils' => \count($got)];
            } catch (\Throwable $e) {
                $state[$n] = ['etat' => 'erreur', 'message' => $e->getMessage()];
            }
        }
        $now = microtime(true);
        $merged = Merger::merge($all, $bbox, $now);
        $body = [
            'heure' => $now,
            'zone' => ['latmin' => $bbox->latMin, 'lonmin' => $bbox->lonMin, 'latmax' => $bbox->latMax, 'lonmax' => $bbox->lonMax],
            'sources' => $state,
            'appareils' => array_map(static fn (Target $t) => $t->toArray(), $merged),
            'statut' => 'OBSERVÉ',
        ];
        $item->set($body);
        $item->expiresAfter(self::CACHE_TTL);
        $this->cache->save($item);

        return new JsonResponse($body);
    }

    /** Réception de aircraft.json envoyé par le Raspberry Pi (en-tête X-Recepteur-Jeton). */
    #[Route('/api/trafic/recepteur', name: 'api_traffic_receiver', methods: ['POST'])]
    public function receive(Request $request): JsonResponse
    {
        if (!$this->receiver->configured()) {
            return new JsonResponse(['erreur' => 'Récepteur non configuré sur le serveur (TRAFIC_RECEPTEUR_JETON).'], 503);
        }
        if (!$this->receiver->accepts($request->headers->get('X-Recepteur-Jeton'))) {
            return new JsonResponse(['erreur' => 'Jeton refusé.'], 401);
        }
        $raw = (string) $request->getContent();
        if (\strlen($raw) > self::MAX_BODY) {
            return new JsonResponse(['erreur' => 'Envoi trop volumineux.'], 413);
        }
        if ('gzip' === $request->headers->get('Content-Encoding')) {
            $raw = (string) @gzdecode($raw);
        }
        $json = json_decode($raw, true);
        if (!\is_array($json) || !isset($json['aircraft']) || !\is_array($json['aircraft'])) {
            return new JsonResponse(['erreur' => 'Contenu attendu : aircraft.json de readsb.'], 400);
        }

        return new JsonResponse(['recu' => $this->receiver->store($json, microtime(true))]);
    }
}
