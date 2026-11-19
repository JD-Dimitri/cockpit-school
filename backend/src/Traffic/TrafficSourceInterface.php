<?php

namespace App\Traffic;

use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;

/** Une source de trafic réel. Elle n'est interrogée que si elle est configurée (clés dans .env.local). */
#[AutoconfigureTag('app.traffic_source')]
interface TrafficSourceInterface
{
    /** recepteur, opensky ou fr24 */
    public function name(): string;

    public function configured(): bool;

    /**
     * @return list<Target>
     *
     * @throws \RuntimeException si la source ne répond pas
     */
    public function fetch(Bbox $bbox): array;
}
