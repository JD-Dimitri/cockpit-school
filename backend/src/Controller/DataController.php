<?php

namespace App\Controller;

use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Données du simulateur (appareils, aéroports, missions, cours…) servies depuis ../data/*.json.
 * Même forme que les fichiers statiques lus aujourd'hui par l'interface React (frontend/src/data.ts).
 */
final class DataController
{
    public function __construct(
        #[Autowire('%kernel.project_dir%/../data')] private readonly string $dataDir,
    ) {
    }

    #[Route('/api/health', name: 'api_health', methods: ['GET'])]
    public function health(): JsonResponse
    {
        return new JsonResponse(['status' => 'ok']);
    }

    #[Route('/api/data', name: 'api_data_index', methods: ['GET'])]
    public function index(): BinaryFileResponse
    {
        return $this->file('index');
    }

    #[Route('/api/data/{name}', name: 'api_data', methods: ['GET'], requirements: ['name' => '[a-z0-9-]+'])]
    public function show(string $name): BinaryFileResponse
    {
        return $this->file($name);
    }

    private function file(string $name): BinaryFileResponse
    {
        // Le nom est limité à [a-z0-9-] par la route : aucun accès en dehors de data/.
        $path = $this->dataDir.'/'.$name.'.json';
        if (!is_file($path)) {
            throw new NotFoundHttpException(sprintf('Données « %s » introuvables.', $name));
        }
        $response = new BinaryFileResponse($path);
        $response->headers->set('Content-Type', 'application/json; charset=utf-8');
        $response->setPublic();
        $response->setMaxAge(3600);

        return $response;
    }
}
