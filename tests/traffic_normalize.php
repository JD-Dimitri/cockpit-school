<?php
/**
 * Trafic réel : conversion et fusion des sources, testées SANS composer (classes sans dépendance).
 * php tests/traffic_normalize.php
 * Les sources (HTTP OpenSky, Flightradar24, réception du récepteur) sont testées avec PHPUnit (backend/tests/Traffic).
 */
foreach (['Target', 'Bbox', 'Normalizer', 'Merger'] as $c) {
    require __DIR__.'/../backend/src/Traffic/'.$c.'.php';
}
use App\Traffic\{Bbox, Merger, Normalizer, Target};

$fx = fn (string $n) => json_decode(file_get_contents(__DIR__.'/../backend/tests/fixtures/trafic/'.$n.'.json'), true, 512, JSON_THROW_ON_ERROR);
$ok = $n = 0;
$check = function (string $name, bool $cond, string $detail = '') use (&$ok, &$n) {
    $n++; $ok += $cond ? 1 : 0;
    echo ($cond ? '✔ ' : '✘ ').$name.(!$cond && $detail ? ' — '.$detail : '')."\n";
};
$near = fn (?float $a, float $b, float $eps = 1e-6) => null !== $a && abs($a - $b) <= $eps;

// --- récepteur (readsb)
$r = Normalizer::fromReadsb($fx('readsb-exemple'));
$check('récepteur : positions récentes gardées, trop anciennes (75 s) et sans position écartées', count($r) === 3, (string) count($r));
$a = $r[0];
$check('récepteur : indicatif nettoyé, immatriculation et type (base tar1090)', $a->indicatif === 'TEST01' && $a->immat === 'F-TEST' && $a->type === 'A320');
$check('récepteur : altitude, vitesse sol, route, vitesse verticale en unités aéronautiques', $a->altFt === 34000.0 && $a->solKt === 452.3 && $a->route === 285.1 && $a->vsFtMin === -64.0);
$check('récepteur : heure de la position = now − seen_pos', $near($a->t, 1763540000.0 - 1.2));
$check('récepteur : « ground » → au sol, altitude 0', $r[1]->auSol === true && $r[1]->altFt === 0.0);
$check('récepteur : altitude géométrique en secours, identifiant non OACI gardé', $r[2]->id === '~aa0003' && $r[2]->altFt === 2500.0 && $r[2]->auSol === false);
$check('récepteur : statut [OBSERVÉ] et source', $a->toArray()['statut'] === 'OBSERVÉ' && $a->source === 'recepteur');

// --- OpenSky
$o = Normalizer::fromOpenSky($fx('opensky-exemple'));
$check('OpenSky : appareils sans position écartés', count($o) === 2, (string) count($o));
$check('OpenSky : longitude (champ 5) et latitude (champ 6) dans le bon ordre', $o[0]->lat === 48.951 && $o[0]->lon === 2.401);
$check('OpenSky : mètres → pieds (10 363,2 m = 34 000 ft)', $near($o[0]->altFt, 34000.0, 1e-6), (string) $o[0]->altFt);
$check('OpenSky : m/s → nœuds (232,5 m/s ≈ 451,95 kt)', $near($o[0]->solKt, 232.5 / 0.514444), (string) $o[0]->solKt);
$check('OpenSky : m/s → ft/min (−0,33 m/s ≈ −65 ft/min)', $near($o[0]->vsFtMin, -0.33 * 60 / 0.3048), (string) $o[0]->vsFtMin);
$check('OpenSky : au sol et altitude inconnue', $o[1]->auSol === true && $o[1]->altFt === null);

// --- Flightradar24
$f = Normalizer::fromFr24($fx('fr24-exemple'));
$check('Flightradar24 : 2 appareils, adresse OACI en minuscules', count($f) === 2 && $f[0]->id === 'aa0001');
$check('Flightradar24 : pieds, nœuds, ft/min, départ et arrivée', $f[0]->altFt === 33975.0 && $f[0]->solKt === 451.0 && $f[0]->vsFtMin === -64.0 && $f[0]->depart === 'LFPG' && $f[0]->arrivee === 'FMEE');
$check('Flightradar24 : heure ISO 8601 convertie', $f[0]->t === (float) strtotime('2025-11-19T08:13:15Z'));
$check('Flightradar24 : tableau direct (sans enveloppe « data ») accepté', count(Normalizer::fromFr24($fx('fr24-exemple')['data'])) === 2);

// --- fusion
$bbox = new Bbox(48.0, 1.5, 49.5, 3.5);
$m = Merger::merge(array_merge($r, $o, $f), $bbox, 1763540000.0, 1e9);
$ids = array_map(fn (Target $t) => $t->id, $m);
$check('fusion : un appareil vu par 3 sources n\'apparaît qu\'une fois', count(array_keys($ids, 'aa0001')) === 1, implode(',', $ids));
$one = $m[array_search('aa0001', $ids, true)];
$check('fusion : la position la plus récente l\'emporte (récepteur : 1,2 s, OpenSky : 2 s, Flightradar24 : 5 s)', $one->source === 'recepteur', $one->source);
$check('fusion : départ et arrivée complétés par Flightradar24', $one->depart === 'LFPG' && $one->arrivee === 'FMEE');
$check('fusion : 5 appareils distincts dans la zone', count($m) === 5, implode(',', $ids));
$check('fusion : positions trop anciennes écartées', count(Merger::merge(array_merge($r, $o), $bbox, 1763540000.0 + 3600)) === 0);
$tie = [new Target('bb0001', 49, 2, 100, 'fr24'), new Target('bb0001', 49.1, 2, 100, 'opensky')];
$check('fusion : à égalité d\'heure, OpenSky passe avant Flightradar24', Merger::merge($tie)[0]->source === 'opensky');

// --- zone
$err = function (callable $f) { try { $f(); return false; } catch (\InvalidArgumentException) { return true; } };
$check('zone : trop grande refusée (> 400 °²)', $err(fn () => new Bbox(0, 0, 30, 30)));
$check('zone : vide ou inversée refusée', $err(fn () => new Bbox(49, 2, 48, 3)));
$check('zone : hors limites refusée', $err(fn () => new Bbox(-95, 0, 0, 10)));
$check('source inconnue refusée', $err(fn () => new Target('x', 0, 0, 0, 'autre')));

echo "$ok/$n vérifications\n";
exit($ok === $n ? 0 : 1);
