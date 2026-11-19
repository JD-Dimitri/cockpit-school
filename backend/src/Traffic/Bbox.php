<?php

namespace App\Traffic;

/**
 * Zone demandée (degrés décimaux WGS 84). Taille limitée pour ménager les crédits des services payants :
 * 400 degrés carrés au plus (OpenSky facture 3 crédits jusqu'à 400 °², 4 au-delà).
 */
final class Bbox
{
    public const MAX_AREA = 400.0;

    public function __construct(
        public readonly float $latMin,
        public readonly float $lonMin,
        public readonly float $latMax,
        public readonly float $lonMax,
    ) {
        if ($latMin < -90 || $latMax > 90 || $lonMin < -180 || $lonMax > 180) {
            throw new \InvalidArgumentException('Coordonnées hors limites.');
        }
        if ($latMin >= $latMax || $lonMin >= $lonMax) {
            throw new \InvalidArgumentException('Zone vide : le minimum doit être inférieur au maximum.');
        }
        if ($this->area() > self::MAX_AREA) {
            throw new \InvalidArgumentException(sprintf('Zone trop grande (%.0f °², maximum %.0f °²).', $this->area(), self::MAX_AREA));
        }
    }

    public function area(): float
    {
        return ($this->latMax - $this->latMin) * ($this->lonMax - $this->lonMin);
    }

    public function contains(float $lat, float $lon): bool
    {
        return $lat >= $this->latMin && $lat <= $this->latMax && $lon >= $this->lonMin && $lon <= $this->lonMax;
    }

    /** Clé de cache : zone arrondie au dixième de degré. */
    public function key(): string
    {
        return implode('_', array_map(static fn (float $v) => number_format($v, 1, '.', ''), [$this->latMin, $this->lonMin, $this->latMax, $this->lonMax]));
    }
}
