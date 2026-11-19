<?php

namespace App\Traffic;

/**
 * Fusion des sources : un appareil vu par plusieurs sources n'apparaît qu'une fois (même adresse OACI).
 * On garde la position la plus récente ; à égalité, l'ordre de priorité est : récepteur, OpenSky, Flightradar24.
 * Les champs absents de la position retenue (immatriculation, type, départ, arrivée) sont complétés par les autres sources.
 */
final class Merger
{
    private const PRIORITY = ['recepteur' => 0, 'opensky' => 1, 'fr24' => 2];

    /**
     * @param list<Target> $targets
     * @return list<Target>
     */
    public static function merge(array $targets, ?Bbox $bbox = null, ?float $now = null, float $maxAge = Normalizer::MAX_AGE): array
    {
        /** @var array<string, list<Target>> $byId */
        $byId = [];
        foreach ($targets as $t) {
            if (null !== $bbox && !$bbox->contains($t->lat, $t->lon)) {
                continue;
            }
            if (null !== $now && $now - $t->t > $maxAge) {
                continue;
            }
            $byId[$t->id][] = $t;
        }
        $out = [];
        foreach ($byId as $list) {
            usort($list, static fn (Target $a, Target $b) => [$b->t, self::PRIORITY[$a->source]] <=> [$a->t, self::PRIORITY[$b->source]]);
            $best = $list[0];
            $fill = static function (string $field) use ($list) {
                foreach ($list as $x) {
                    if (null !== $x->{$field}) {
                        return $x->{$field};
                    }
                }

                return null;
            };
            $out[] = new Target(
                id: $best->id, lat: $best->lat, lon: $best->lon, t: $best->t, source: $best->source,
                indicatif: $best->indicatif ?? $fill('indicatif'), immat: $best->immat ?? $fill('immat'), type: $best->type ?? $fill('type'),
                altFt: $best->altFt, solKt: $best->solKt, route: $best->route, vsFtMin: $best->vsFtMin, auSol: $best->auSol,
                squawk: $best->squawk ?? $fill('squawk'), depart: $best->depart ?? $fill('depart'), arrivee: $best->arrivee ?? $fill('arrivee'),
            );
        }
        usort($out, static fn (Target $a, Target $b) => strcmp($a->id, $b->id));

        return $out;
    }
}
