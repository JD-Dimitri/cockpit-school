<?php

namespace App\Traffic;

/**
 * Un appareil réel observé, dans un format commun à toutes les sources (récepteur ADS-B, OpenSky, Flightradar24).
 * Unités aéronautiques : altitude en pieds, vitesse sol en nœuds, route en degrés vrais, vitesse verticale en ft/min.
 * Statut des données : [OBSERVÉ] (mesures réelles transmises par l'appareil), avec leur source.
 */
final class Target
{
    public const SOURCES = ['recepteur', 'opensky', 'fr24'];

    public function __construct(
        /** Adresse OACI 24 bits en hexadécimal minuscule (« ~ » en tête : identifiant non OACI, TIS-B). */
        public readonly string $id,
        public readonly float $lat,
        public readonly float $lon,
        /** Heure de la position, en secondes Unix. */
        public readonly float $t,
        public readonly string $source,
        public readonly ?string $indicatif = null,
        public readonly ?string $immat = null,
        public readonly ?string $type = null,
        public readonly ?float $altFt = null,
        public readonly ?float $solKt = null,
        public readonly ?float $route = null,
        public readonly ?float $vsFtMin = null,
        /** null : la source ne le dit pas. */
        public readonly ?bool $auSol = null,
        public readonly ?string $squawk = null,
        public readonly ?string $depart = null,
        public readonly ?string $arrivee = null,
    ) {
        if (!\in_array($source, self::SOURCES, true)) {
            throw new \InvalidArgumentException('Source inconnue : '.$source);
        }
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'id' => $this->id, 'indicatif' => $this->indicatif, 'immat' => $this->immat, 'type' => $this->type,
            'lat' => $this->lat, 'lon' => $this->lon, 'altFt' => $this->altFt, 'solKt' => $this->solKt,
            'route' => $this->route, 'vsFtMin' => $this->vsFtMin, 'auSol' => $this->auSol, 'squawk' => $this->squawk,
            'depart' => $this->depart, 'arrivee' => $this->arrivee, 't' => $this->t, 'source' => $this->source, 'statut' => 'OBSERVÉ',
        ];
    }
}
