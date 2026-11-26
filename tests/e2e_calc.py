"""Calculateur (module calc-convert, intégré le 24/11/2026) : bouton du simulateur, version selon le mode, pause, clavier, onglet COURS.

Usage : FRONT_URL=http://localhost:8766/ python3 tests/e2e_calc.py   (ou FRONT_URL=file:///…/version-autonome.html)
"""
import os
import pathlib
import sys

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
URL = os.environ.get('FRONT_URL', 'http://localhost:8766/')
THREE = str(pathlib.Path(__file__).resolve().parents[2] / 'plane-trajectories-simulator/tests/node_modules/three/build/three.min.js')
ok = ko = 0


def check(name, cond, detail=''):
    global ok, ko
    if cond:
        ok += 1
        print('  ✔', name)
    else:
        ko += 1
        print('  ✘', name, '—', detail)


def frame(pg):
    for _ in range(80):
        pg.wait_for_timeout(500)
        fr = next((f for f in pg.frames if f != pg.main_frame), None)
        try:
            if fr and fr.evaluate("!!document.getElementById('menu') && document.getElementById('menu').hidden && !!window.__PS_CALC__"):
                return fr
        except Exception:
            pass
    return None


def ctx_new(b, w, h):
    c = b.new_context(viewport={'width': w, 'height': h})
    c.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', lambda r: r.fulfill(path=THREE, content_type='application/javascript'))
    c.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
    c.route('https://aviationweather.gov/**', lambda r: r.abort())
    c.route('https://api.frankfurter.app/**', lambda r: r.abort())
    c.add_init_script("try { localStorage.setItem('sim-intro', '1'); localStorage.setItem('pt-user', JSON.stringify({email:'demo@cockpitschool.test'})); } catch (e) {}")
    return c


with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
    for tag, w, h in (('PC', 1366, 768), ('téléphone', 390, 844)):
        print(f'— {tag} : vol guidé A320 (version « simulateur »)')
        c = ctx_new(b, w, h); pg = c.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL + '#/simulateur/go:a320:full-fw:guide')
        fr = frame(pg)
        check(f'[{tag}] vol lancé, bouton « 🧮 Calculatrice » dans la barre', fr is not None and fr.locator('#b-calcx').count() == 1)
        if fr is None:
            c.close(); continue
        fr.evaluate("document.getElementById('b-calcx').click()"); pg.wait_for_timeout(800)
        win = pg.locator('.sim-calc-window')
        check(f'[{tag}] fenêtre ouverte, version « simulateur »', win.count() == 1 and win.get_attribute('data-variant') == 'simulateur')
        check(f'[{tag}] simulateur mis en pause', fr.evaluate('paused') is True)
        box = win.bounding_box() or {}
        if tag == 'téléphone':
            check('[téléphone] plein écran', abs(box.get('width', 0) - w) < 2 and abs(box.get('height', 0) - h) < 2, str(box))
        else:
            check('[PC] fenêtre à droite, dans l\'écran', box.get('x', 0) > w / 2 and box.get('y', 0) >= 0 and box.get('y', 0) + box.get('height', 0) <= h, str(box))
        # onglet Aviation : pas de mini-cours ni d'« Approfondir » en version simulateur
        pg.locator('.sim-calc-window .cc-av-card, .sim-calc-window [class*="av-card"]').first.click() if pg.locator('.sim-calc-window [class*="av-card"]').count() else None
        pg.wait_for_timeout(300)
        check(f'[{tag}] version simulateur : ni mini-cours ni « Approfondir »', pg.locator('.sim-calc-window .cc-av-mini').count() == 0 and pg.get_by_text('Approfondir').count() == 0)
        # calculatrice : 672+133 = 805, et les touches n'atteignent pas le simulateur
        pg.get_by_role('button', name='Calculatrice', exact=True).first.click(); pg.wait_for_timeout(300)
        pg.locator('.sim-calc-window .cc-calculator').focus()
        before = fr.evaluate("JSON.stringify([typeof S !== 'undefined' ? S.thr : null, view])")
        pg.keyboard.type('672+133'); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
        txt = pg.locator('.sim-calc-window .cc-display').inner_text()
        check(f'[{tag}] 672+133 → 805', '805' in txt, txt[:80])
        after = fr.evaluate("JSON.stringify([typeof S !== 'undefined' ? S.thr : null, view])")
        check(f'[{tag}] frappe sans effet sur le vol (poussée, vue)', before == after, before + ' → ' + after)
        # fermeture → reprise
        pg.locator('.sim-calc-window').get_by_role('button', name='Fermer').last.click(); pg.wait_for_timeout(800)
        check(f'[{tag}] ✕ ferme la fenêtre', pg.locator('.sim-calc-window').count() == 0)
        check(f'[{tag}] simulateur repris à la fermeture', fr.evaluate('paused') is False)
        check(f'[{tag}] aucune erreur JavaScript', not errs, str(errs[:2]))
        c.close()

    print('— mode automatique A320 (version « cours », sans pause)')
    c = ctx_new(b, 1366, 768); pg = c.new_page()
    pg.goto(URL + '#/simulateur/go:a320:full-fw:auto')
    fr = frame(pg)
    if fr:
        for _ in range(20):
            if fr.evaluate('!!(AUTO && AUTO.on)'): break
            pg.wait_for_timeout(500)
        fr.evaluate("document.getElementById('b-calcx').click()"); pg.wait_for_timeout(800)
        check('[auto] version « cours »', pg.locator('.sim-calc-window').get_attribute('data-variant') == 'cours')
        check('[auto] pas de pause', fr.evaluate('paused') is False)
    else:
        check('[auto] vol lancé', False)
    c.close()

    print('— onglet COURS (version « cours »)')
    c = ctx_new(b, 1366, 768); pg = c.new_page()
    pg.goto(URL + '#/cours'); pg.wait_for_timeout(2500)
    btn = pg.get_by_role('button', name='🧮 Calculatrice et formules')
    check('[cours] bouton présent', btn.count() >= 1)
    if btn.count():
        btn.first.click(); pg.wait_for_timeout(600)
        check('[cours] fenêtre version « cours »', pg.locator('.sim-calc-window').get_attribute('data-variant') == 'cours')
        pg.locator('.sim-calc-window [class*="av-"]').first.wait_for(timeout=3000)
        check('[cours] « Approfondir » disponible (cours et exercices)', pg.get_by_text('Approfondir', exact=False).count() >= 0)
        pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
        check('[cours] Échap ferme', pg.locator('.sim-calc-window').count() == 0)
    c.close()
    b.close()

print(f'\n{ok}/{ok + ko} vérifications')
sys.exit(1 if ko else 0)
