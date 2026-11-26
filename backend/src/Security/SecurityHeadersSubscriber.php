<?php

namespace App\Security;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Audit du 20/11/2026 : en-têtes de sécurité sur toutes les réponses de l'API.
 * - nosniff : le navigateur ne devine pas le type d'un fichier (un JSON n'est jamais exécuté comme script) ;
 * - SAMEORIGIN : l'API et le moteur ne peuvent être affichés que dans les pages du site (pas d'encadrement par un autre site) ;
 * - Referrer-Policy : l'adresse complète (avec un éventuel jeton de réinitialisation) ne part pas vers d'autres sites ;
 * - no-store sur les réponses liées au compte : rien de personnel dans les caches partagés.
 * Les fichiers statiques de l'interface (servis par Apache chez o2switch) reçoivent les mêmes en-têtes par
 * frontend/public.htaccess (voir README, mise en ligne).
 */
final class SecurityHeadersSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::RESPONSE => 'onResponse'];
    }

    public function onResponse(ResponseEvent $event): void
    {
        $h = $event->getResponse()->headers;
        $h->set('X-Content-Type-Options', 'nosniff');
        $h->set('X-Frame-Options', 'SAMEORIGIN');
        $h->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $path = $event->getRequest()->getPathInfo();
        if (preg_match('#^/api/(me|login|logout|register|password/|admin/)#', $path)) {
            $h->set('Cache-Control', 'no-store, private');
        }
    }
}
