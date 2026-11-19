<?php

namespace App\Controller;

use Dompdf\Dompdf;
use Dompdf\Options;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\HeaderUtils;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Cours et exercices en PDF (F23) : un module ou une partie entière de l'Académie, QCM et corrigés compris.
 * Même contenu que la version imprimable de l'interface (frontend/src/pages/PrintCourse.tsx).
 */
final class PdfController extends AbstractController
{
    public function __construct(
        #[Autowire('%kernel.project_dir%/../data')] private readonly string $dataDir,
    ) {
    }

    #[Route('/api/pdf/cours/{part}/{mod}', name: 'api_pdf_course', methods: ['GET'], requirements: ['part' => '[a-z0-9-]+', 'mod' => '[a-z0-9-]+'], defaults: ['mod' => null])]
    public function course(string $part, ?string $mod): Response
    {
        // Cours 0 (préparation), Cours I (initiation), Cours II (confirmé) : un fichier par cycle
        $academy = [];
        foreach (['academy-0', 'academy', 'academy-2'] as $f) {
            if (is_file($this->dataDir.'/'.$f.'.json')) {
                $academy = array_merge($academy, json_decode((string) file_get_contents($this->dataDir.'/'.$f.'.json'), true, 512, \JSON_THROW_ON_ERROR));
            }
        }
        $p = null;
        foreach ($academy as $candidate) {
            if (($candidate['id'] ?? null) === $part) {
                $p = $candidate;
                break;
            }
        }
        if (null === $p) {
            throw new NotFoundHttpException('Partie introuvable.');
        }
        $mods = null === $mod ? $p['mods'] : array_values(array_filter($p['mods'], static fn (array $m) => $m['id'] === $mod));
        if ([] === $mods) {
            throw new NotFoundHttpException('Module introuvable.');
        }
        $title = null === $mod ? $p['n'] : $mods[0]['t'];
        foreach ($mods as &$m) {
            $m['h'] = self::forPdf((string) $m['h']);
        }
        unset($m);

        $html = $this->renderView('pdf/cours.html.twig', ['part' => $p, 'mods' => $mods, 'title' => $title, 'single' => null !== $mod]);

        $options = new Options();
        $options->setIsRemoteEnabled(false);       // aucune ressource extérieure chargée
        $options->setDefaultFont('DejaVu Sans');   // accents et symboles
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4');
        $dompdf->render();

        $file = 'PLANE-SIMULATOR-'.preg_replace('/[^A-Za-z0-9]+/', '-', iconv('UTF-8', 'ASCII//TRANSLIT', $title) ?: $part).'.pdf';

        return new Response($dompdf->output(), Response::HTTP_OK, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => HeaderUtils::makeDisposition(HeaderUtils::DISPOSITION_ATTACHMENT, $file),
        ]);
    }

    /** Styles des schémas pour le papier (mêmes classes que l'Académie : .lb, .am, .mg). */
    private const SVG_STYLE = '<style>text{fill:#111;font:12px "DejaVu Sans",sans-serif}.lb{fill:#0a5c8a;font-weight:bold}.am{fill:#a35f00}.mg{fill:#9a1693}</style>';

    /**
     * Prépare le HTML d'un module pour dompdf :
     * - retire les boutons d'action (ouvrir l'atelier, lancer un mode…), sans objet sur papier ;
     * - convertit chaque schéma SVG en image (dompdf ne dessine pas les SVG intégrés au HTML).
     */
    public static function forPdf(string $html): string
    {
        $html = (string) preg_replace('~<button\b[^>]*>.*?</button>~s', '', $html);

        return (string) preg_replace_callback('~<svg\b[^>]*>.*?</svg>~s', static function (array $m): string {
            $svg = $m[0];
            if (!str_contains($svg, 'xmlns=')) {
                $svg = (string) preg_replace('~^<svg\b~', '<svg xmlns="http://www.w3.org/2000/svg"', $svg);
            }
            $svg = (string) preg_replace('~^(<svg\b[^>]*>)~', '$1'.self::SVG_STYLE, $svg);
            $label = preg_match('~aria-label="([^"]*)"~', $svg, $a) ? $a[1] : 'Schéma';

            return '<img style="width:100%" alt="'.$label.'" src="data:image/svg+xml;base64,'.base64_encode($svg).'">';
        }, $html);
    }
}
