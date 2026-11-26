<?php

namespace App\Controller;

use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Espace administrateur. Réservé à ROLE_ADMIN par security.yaml (access_control ^/api/admin) :
 * un élève connecté reçoit 403, un visiteur 401. Le contenu n'est jamais dans le code de l'interface.
 */
final class AdminController
{
    public function __construct(
        #[Autowire('%kernel.project_dir%/content/admin')] private readonly string $dir,
    ) {
    }

    /** Documentation « Comment ce projet a été réalisé ? » (HTML écrit par l'équipe, servi tel quel). */
    #[Route('/api/admin/doc', name: 'api_admin_doc', methods: ['GET'])]
    public function doc(): JsonResponse
    {
        $html = file_get_contents($this->dir.'/realisation.html');

        return new JsonResponse(['title' => 'Comment ce projet a été réalisé ?', 'html' => $html]);
    }
}
