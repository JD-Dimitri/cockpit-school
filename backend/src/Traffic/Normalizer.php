<?php

namespace App\Traffic;

/**
 * Conversion des réponses de chaque source vers le format commun (Target).
 * Classe sans dépendance : testée hors framework (../tests/traffic_normalize.php) et avec PHPUnit.
 */
final class Normalizer
{
    private const M_TO_FT = 1 / 0.3048;
    private const MS_TO_KT = 1 / 0.514444;
    private const MS_TO_FTMIN = 60 / 0.3048;
    /** Au-delà, une position est trop ancienne pour être affichée (s). */
    public const MAX_AGE = 60.0;

    /**
     * Récepteur personnel (Raspberry Pi) : fichier aircraft.json de readsb / dump1090-fa / tar1090.
     * Champs : hex, flight, alt_baro (pieds ou « ground »), alt_geom, gs (kt), track, baro_rate / geom_rate (ft/min),
     * lat, lon, seen, seen_pos (s), squawk ; r et t (immatriculation, type) quand la base de tar1090 est installée.
     *
     * @param array<string, mixed> $json
     * @return list<Target>
     */
    public static function fromReadsb(array $json): array
    {
        $now = (float) ($json['now'] ?? 0);
        $out = [];
        foreach ((array) ($json['aircraft'] ?? []) as $a) {
            if (!\is_array($a) || !isset($a['hex'], $a['lat'], $a['lon']) || !is_numeric($a['lat']) || !is_numeric($a['lon'])) {
                continue;
            }
            $age = (float) ($a['seen_pos'] ?? $a['seen'] ?? 0);
            if ($age > self::MAX_AGE) {
                continue;
            }
            $ground = ($a['alt_baro'] ?? null) === 'ground';
            $alt = is_numeric($a['alt_baro'] ?? null) ? (float) $a['alt_baro'] : (is_numeric($a['alt_geom'] ?? null) ? (float) $a['alt_geom'] : null);
            $vs = $a['baro_rate'] ?? $a['geom_rate'] ?? null;
            $out[] = new Target(
                id: strtolower((string) $a['hex']), lat: (float) $a['lat'], lon: (float) $a['lon'], t: $now - $age, source: 'recepteur',
                indicatif: self::str($a['flight'] ?? null), immat: self::str($a['r'] ?? null), type: self::str($a['t'] ?? null),
                altFt: $ground ? 0.0 : $alt, solKt: self::num($a['gs'] ?? null), route: self::num($a['track'] ?? null),
                vsFtMin: self::num($vs), auSol: $ground ? true : (null !== $alt ? false : null), squawk: self::str($a['squawk'] ?? null),
            );
        }

        return $out;
    }

    /**
     * OpenSky Network : réponse de GET /api/states/all (tableau « states », 18 champs par appareil, unités SI).
     * Ordre : icao24, callsign, origin_country, time_position, last_contact, longitude, latitude, baro_altitude (m),
     * on_ground, velocity (m/s), true_track (°), vertical_rate (m/s), sensors, geo_altitude (m), squawk, spi,
     * position_source, category. Source : https://openskynetwork.github.io/opensky-api/rest.html
     *
     * @param array<string, mixed> $json
     * @return list<Target>
     */
    public static function fromOpenSky(array $json): array
    {
        $out = [];
        foreach ((array) ($json['states'] ?? []) as $s) {
            if (!\is_array($s) || !isset($s[0], $s[5], $s[6])) {
                continue;
            }
            $altM = $s[7] ?? $s[13] ?? null;
            $out[] = new Target(
                id: strtolower((string) $s[0]), lat: (float) $s[6], lon: (float) $s[5],
                t: (float) ($s[3] ?? $s[4] ?? $json['time'] ?? 0), source: 'opensky',
                indicatif: self::str($s[1] ?? null),
                altFt: null === $altM ? null : (float) $altM * self::M_TO_FT,
                solKt: null === ($s[9] ?? null) ? null : (float) $s[9] * self::MS_TO_KT,
                route: self::num($s[10] ?? null),
                vsFtMin: null === ($s[11] ?? null) ? null : (float) $s[11] * self::MS_TO_FTMIN,
                auSol: isset($s[8]) ? (bool) $s[8] : null, squawk: self::str($s[14] ?? null),
            );
        }

        return $out;
    }

    /**
     * Flightradar24 (API officielle) : réponse de GET /api/live/flight-positions/full.
     * Champs : fr24_id, hex, callsign, lat, lon, track, alt (ft), gspeed (kt), vspeed (ft/min), squawk, timestamp,
     * source, reg, type, orig_icao, dest_icao… Enveloppe « data » attendue ; un tableau direct est aussi accepté.
     * [À VÉRIFIER sur une vraie réponse quand une clé sera ouverte : unités et enveloppe d'après la documentation des SDK.]
     *
     * @param array<mixed> $json
     * @return list<Target>
     */
    public static function fromFr24(array $json): array
    {
        $list = isset($json['data']) && \is_array($json['data']) ? $json['data'] : (array_is_list($json) ? $json : []);
        $out = [];
        foreach ($list as $f) {
            if (!\is_array($f) || !isset($f['lat'], $f['lon']) || !(isset($f['hex']) || isset($f['fr24_id']))) {
                continue;
            }
            $ts = $f['timestamp'] ?? null;
            $t = is_numeric($ts) ? (float) $ts : (\is_string($ts) && false !== strtotime($ts) ? (float) strtotime($ts) : 0.0);
            $out[] = new Target(
                id: strtolower((string) ($f['hex'] ?? 'fr24:'.$f['fr24_id'])), lat: (float) $f['lat'], lon: (float) $f['lon'], t: $t, source: 'fr24',
                indicatif: self::str($f['callsign'] ?? null), immat: self::str($f['reg'] ?? null), type: self::str($f['type'] ?? null),
                altFt: self::num($f['alt'] ?? null), solKt: self::num($f['gspeed'] ?? null), route: self::num($f['track'] ?? null),
                vsFtMin: self::num($f['vspeed'] ?? null), squawk: self::str($f['squawk'] ?? null),
                depart: self::str($f['orig_icao'] ?? null), arrivee: self::str($f['dest_icao'] ?? null),
            );
        }

        return $out;
    }

    private static function str(mixed $v): ?string
    {
        if (null === $v || \is_array($v)) {
            return null;
        }
        $s = trim((string) $v);

        return '' === $s ? null : $s;
    }

    private static function num(mixed $v): ?float
    {
        return is_numeric($v) ? (float) $v : null;
    }
}
