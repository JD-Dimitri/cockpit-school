"""Parcours de bout en bout de l'interface React (dist/ servi sur http://localhost:8766).

Pour chaque largeur (ordinateur 1280, téléphone 390) : chaque page s'affiche sans erreur JavaScript,
la 3D se dessine, un cours et son QCM fonctionnent, et le simulateur d'origine démarre dans son cadre.
three.js r128 (même fichier que le CDN) est servi localement si le réseau n'atteint pas cdnjs.
"""
import os, pathlib, sys
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = os.environ.get('FRONT_URL', 'http://localhost:8766/')
CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
THREE = os.environ.get('THREE_PATH', str(ROOT.parent / 'plane-trajectories-simulator/tests/node_modules/three/build/three.min.js'))
OUT = ROOT / 'tests/out'; OUT.mkdir(exist_ok=True)

checks = []
def check(name, cond, detail=''):
    checks.append(bool(cond))
    print(('✔ ' if cond else '✘ ') + name + (f' — {detail}' if detail and not cond else ''))

with sync_playwright() as p:
    for W, H, tag in ((1280, 800, 'pc'), (390, 844, 'tel')):
        # Un navigateur neuf par largeur : le rendu logiciel (swiftshader) garde sinon l'état WebGL du passage précédent.
        b = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
        ctx = b.new_context(viewport={'width': W, 'height': H})
        ctx.route(CDN, lambda r: r.fulfill(path=THREE, content_type='application/javascript'))
        ctx.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
        pg = ctx.new_page()
        errs, failed = [], []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
        pg.on('requestfailed', lambda r: failed.append(r.url))

        pg.goto(URL); pg.wait_for_selector('.grid .card')
        check(f'[{tag}] accueil : 5 entrées', pg.locator('.grid .card').count() == 5)
        check(f'[{tag}] accueil : origine des données affichée', 'V10.42.1' in pg.inner_text('.meta'))
        pg.screenshot(path=str(OUT / f'pro_accueil_{tag}.png'))

        pg.goto(URL + '#/appareils/a350'); pg.wait_for_selector('.viewer canvas'); pg.wait_for_timeout(600)
        check(f'[{tag}] appareils : 8 onglets', pg.locator('.tabs a').count() == 8)
        check(f'[{tag}] appareils : A350 sélectionné', 'A350' in pg.inner_text('.ac h2'))
        shot = OUT / f'pro_viewer_{tag}.png'
        pg.locator('.viewer').screenshot(path=str(shot))
        img = Image.open(shot).convert('RGB')
        raw = img.tobytes(); lit = sum(1 for i in range(0, len(raw), 3) if raw[i] + raw[i + 1] + raw[i + 2] > 560)   # fuselage clair sur fond sombre
        check(f'[{tag}] appareils : silhouette 3D dessinée', lit > 50, f'{lit} pixels clairs')
        pg.click('.tabs a[href="#/appareils/s76"]'); pg.wait_for_timeout(400)
        check(f'[{tag}] appareils : changement vers le S-76', 'S-76' in pg.inner_text('.ac h2'))
        pg.screenshot(path=str(OUT / f'pro_appareils_{tag}.png'))

        pg.goto(URL + '#/aeroports'); pg.wait_for_selector('.tbl tbody tr')
        rows = pg.locator('.tbl tbody tr').count()
        check(f'[{tag}] aéroports : 8 lignes', rows == 8, str(rows))
        check(f'[{tag}] aéroports : piste 13R/31L de JFK calculée', '13R/31L' in pg.inner_text('.tbl'))

        pg.goto(URL + '#/missions'); pg.wait_for_selector('.grid .card')
        n = pg.locator('.grid .card').count()
        check(f'[{tag}] missions : 35 missions', n == 35, str(n))

        pg.goto(URL + '#/cours'); pg.wait_for_selector('.mods li')
        n = pg.locator('.mods li').count()
        check(f'[{tag}] cours : 76 modules listés', n == 76, str(n))
        pg.goto(URL + '#/cours/p1/avion'); pg.wait_for_selector('.quiz fieldset')
        check(f'[{tag}] cours : module « L\'avion et ses parties »', "L'avion et ses parties" in pg.inner_text('h1'))
        nq = pg.locator('.quiz fieldset').count()
        for i in range(nq):
            pg.locator('.quiz fieldset').nth(i).locator('label').first.click()
        check(f'[{tag}] cours : QCM noté après {nq} réponses', pg.locator('.score').count() == 1)
        check(f'[{tag}] cours : explication affichée', pg.locator('.why').count() >= 1)
        pg.screenshot(path=str(OUT / f'pro_cours_{tag}.png'), full_page=False)
        sw = pg.evaluate('document.documentElement.scrollWidth')
        check(f'[{tag}] cours : pas de défilement horizontal', sw <= W, f'{sw} px')

        pg.goto(URL + '#/simulateur')
        fr = pg.frame_locator('.sim iframe')
        fr.locator('body').wait_for()
        pg.wait_for_timeout(2500)
        frame = next(f for f in pg.frames if f.url.endswith('legacy/plane-trajectories.html') or f.url.startswith('blob:'))
        ver = frame.evaluate('typeof AC==="object" ? Object.keys(AC).length : 0')
        check(f'[{tag}] simulateur : moteur d\'origine chargé (8 appareils)', ver == 8, str(ver))
        box = pg.locator('.sim iframe').bounding_box()
        check(f'[{tag}] simulateur : cadre plein écran', box and box['width'] >= W - 1 and box['height'] > H * 0.8, str(box))
        pg.screenshot(path=str(OUT / f'pro_simulateur_{tag}.png'))

        # Le moteur d'origine tente la météo réelle (aviationweather.gov) : site injoignable depuis
        # l'environnement de test ; le moteur bascule alors sur ses relevés enregistrés. Seul ce cas est toléré.
        optional = ('aviationweather.gov',)
        other = [u for u in failed if not any(h in u for h in optional)]
        real = [e for e in errs if not (e.startswith('Failed to load resource') and not other)]
        check(f'[{tag}] aucune ressource interne manquante', not other, '; '.join(other[:3]))
        check(f'[{tag}] aucune erreur JavaScript', not real, '; '.join(real[:3]))
        ctx.close()
        b.close()

print(f'{sum(checks)}/{len(checks)} vérifications')
sys.exit(0 if all(checks) else 1)
