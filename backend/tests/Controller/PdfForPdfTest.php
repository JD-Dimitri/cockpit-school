<?php

namespace App\Tests\Controller;

use App\Controller\PdfController;
use PHPUnit\Framework\TestCase;

/** Préparation des cours pour dompdf : schémas en images, boutons d'action retirés. */
final class PdfForPdfTest extends TestCase
{
    public function testAllCourseDiagramsBecomeValidImages(): void
    {
        $academy = json_decode((string) file_get_contents(__DIR__.'/../../../data/academy.json'), true);
        $svg = $img = 0;
        foreach ($academy as $p) {
            foreach ($p['mods'] as $m) {
                $svg += substr_count($m['h'], '<svg');
                $out = PdfController::forPdf($m['h']);
                self::assertStringNotContainsString('<button', $out);
                preg_match_all('~base64,([A-Za-z0-9+/=]+)~', $out, $mm);
                foreach ($mm[1] as $b64) {
                    self::assertNotFalse(simplexml_load_string(base64_decode($b64)));
                    ++$img;
                }
            }
        }
        self::assertGreaterThan(0, $svg);
        self::assertSame($svg, $img);
    }
}
