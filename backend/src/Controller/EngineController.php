<?php

namespace App\Controller;

use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Moteur du simulateur (fichier d'origine V10.42.1), chargé dans l'onglet « Simulateur ».
 * Réservé aux comptes connectés (access_control : ^/api → ROLE_USER) ; il ne doit pas être copié dans public/.
 */
final class EngineController
{
    public function __construct(
        #[Autowire('%kernel.project_dir%/../legacy/plane-trajectories.html')] private readonly string $file,
    ) {
    }

    #[Route('/api/moteur', name: 'api_engine', methods: ['GET'])]
    public function engine(): Response
    {
        $r = new BinaryFileResponse($this->file, Response::HTTP_OK, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Cache-Control' => 'private, no-store',
            'X-Frame-Options' => 'SAMEORIGIN',
        ]);

        return $r;
    }
}
