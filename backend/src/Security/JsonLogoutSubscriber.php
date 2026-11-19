<?php

namespace App\Security;

use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Security\Http\Event\LogoutEvent;

/** Déconnexion pour l'interface React : réponse JSON au lieu d'une redirection. */
#[AsEventListener(event: LogoutEvent::class)]
final class JsonLogoutSubscriber
{
    public function __invoke(LogoutEvent $event): void
    {
        $event->setResponse(new JsonResponse(['message' => 'Déconnecté.']));
    }
}
