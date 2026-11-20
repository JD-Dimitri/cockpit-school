"""TA1 et TA2 (20/11/2026) : visite de contrôle visuel et installation dans le poste, sur de vrais parcours du moteur d'origine.

TA1 : plus de bip de recul pendant la visite ; arrêt devant chaque point (3 min par défaut, sans bouger ni bruit de pas),
« Point suivant ▸ » ; logements de train contrôlés (texte, vue accroupie) ; flèche rouge vers la pièce ; à la fin,
« Bilan contrôle visuel » → tableau → « Valider » → document « Bilan contrôle visuel » dans 📁 Documents.
TA2 : à l'étape « Monter à bord », tablette avec tous les documents en tuiles ; double contrôle pilote / copilote
(appareils à deux pilotes) ou annonces du pilote seul ; au roulage, « Clear left » / « Clear right ».
La marche est simulée en accéléré (pas de 0,1 s) comme dans tests/tour_auto.py de la version gratuite.
"""
import os, pathlib, sys
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from serveur_simule import serveur

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = os.environ.get('FRONT_URL', 'http://localhost:8766/')
CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
THREE = os.environ.get('THREE_PATH', str(ROOT.parent / 'plane-trajectories-simulator/tests/node_modules/three/build/three.min.js'))
checks = []
def check(name, cond, detail=''):
    checks.append(bool(cond)); print(('✔ ' if cond else '✘ ') + name + (f' — {detail}' if detail and not cond else ''), flush=True)

CASES = [('full-fw', 'a320', True, 1280), ('full-c172', 'c172', False, 390), ('full-rw', 's76', True, 1280), ('full-350', 'a350', True, 390)]
if len(sys.argv) > 1: CASES = [c for c in CASES if c[1] in sys.argv[1:]]

STEP = """((n) => { AUTO.on = true; AUTO.stage = 'act'; let i = 0; for (; i < n && !walkDone(); i++) { autoWalk(0.1); walkCheck(); if (__PS_TA__.cur >= 0 && performance.now() < __PS_TA__.until) break; } return {i, cur: __PS_TA__.cur, seen: GD.seen.size, n: (WALKPTS[ACK] || []).length}; })"""

with sync_playwright() as p:
    for mi, ac, two, w in CASES:
        b = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
        ctx = b.new_context(viewport={'width': w, 'height': 844 if w < 500 else 800}, is_mobile=w < 500, has_touch=w < 500)
        ctx.route(CDN, lambda r: r.fulfill(path=THREE, content_type='application/javascript'))
        ctx.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
        ctx.route('https://aviationweather.gov/**', lambda r: r.abort())
        serveur(ctx)
        pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL + f'#/simulateur/go:{ac}:{mi}:auto')
        fr = None
        for _ in range(150):
            fr = next((f for f in pg.frames if f != pg.main_frame), None)
            try:
                if fr and fr.evaluate("!!window.__PS_TA__ && !!window.__PS_EQ__ && !!MI && GD.steps && GD.steps.length > 0"): break
            except Exception: pass
            pg.wait_for_timeout(200)
        tag = f'{mi} × {ac} ({w} px)'
        if not fr:
            check(f'{tag} : moteur chargé avec les extensions TA1 et TA2', False); b.close(); continue
        pg.wait_for_timeout(1200)
        fr.evaluate("(() => { for (const id of ['br-skip', 'br-go']) { const b = document.getElementById(id); if (b && b.offsetParent && !b.hidden) { b.click(); return; } } })()")
        pg.wait_for_timeout(800)
        fr.evaluate("(() => { const r = document.getElementById('rtprop'); if (r) r.remove(); ATC.voice = false; })()")

        # TA1 · bip de recul retiré du moteur chargé
        beep = fr.evaluate("[...document.scripts].some(s => s.text.includes('ST.beepT=t+25'))")
        check(f'{tag} : plus de bip de recul pendant la visite', not beep)
        gearTxt = fr.evaluate("(WALKPTS[ACK] || []).filter(p => /train/i.test(p[2])).every(p => p[3].includes('Intérieur du logement de train'))")
        check(f'{tag} : points « train » : contrôle de l\'intérieur des logements ajouté', gearTxt)

        k = fr.evaluate("GD.steps.findIndex(s => /Arrivée au parking/.test(s.t))")
        fr.evaluate(f"goStep({k}); AUTO.on = true;"); pg.wait_for_timeout(1200)
        r = fr.evaluate(STEP + "(4000)")
        held = fr.evaluate("(() => ({left: (__PS_TA__.until - performance.now()) / 1000, hold: __PS_TA__.hold}))()")
        check(f'{tag} : arrivé au point {r["cur"] + 1}, arrêt de 3 min devant la pièce', r['cur'] >= 0 and held['hold'] == 180 and held['left'] > 170, f'{r} {held}')
        pos = fr.evaluate("(() => { const a = [GD.walk.x, GD.walk.z]; for (let i = 0; i < 60; i++) { autoWalk(0.1); walkCheck(); } return Math.hypot(GD.walk.x - a[0], GD.walk.z - a[1]); })()")
        check(f'{tag} : pendant l\'arrêt, le marcheur ne bouge pas (donc pas de bruit de pas)', pos < 1e-6, f'{pos:.3f} m')
        pg.wait_for_timeout(400)
        arrow = fr.evaluate("(() => { const a = document.getElementById('ps-arrow'); return {d: getComputedStyle(a).display, t: a.textContent}; })()")
        name = fr.evaluate("WALKPTS[ACK][__PS_TA__.cur][2]")
        check(f'{tag} : flèche rouge vers la pièce contrôlée', arrow['d'] == 'block' and name in arrow['t'], f'{arrow} / {name}')
        pg.wait_for_timeout(1200)
        nb = fr.locator('#g-wp [data-ta=next]:not([hidden])')
        check(f'{tag} : compte à rebours et bouton « Point suivant ▸ »', nb.count() == 1 and 'min' in fr.locator('#g-wp .ps-hold').inner_text())
        if nb.count(): nb.click()
        check(f'{tag} : « Point suivant ▸ » écourte l\'arrêt', fr.evaluate("__PS_TA__.until") == 0)
        # visite complète : chaque arrêt est écourté (comme « Point suivant »), la marche reprend jusqu'au point suivant
        gear_seen = False
        for _ in range(60):
            r = fr.evaluate(STEP + "(4000)")
            if fr.evaluate("__PS_TA__.cur >= 0 && /train/i.test(WALKPTS[ACK][__PS_TA__.cur][2]) && performance.now() < __PS_TA__.until"):
                y = fr.evaluate("(() => { placeWalkCam(); return camera.position.y; })()")
                gear_seen = gear_seen or y < 1.0
            if fr.evaluate("walkDone()"): break
            fr.evaluate("__PS_TA__.until = 0")
        has_gear = fr.evaluate("(WALKPTS[ACK] || []).some(p => /train/i.test(p[2]))")
        check(f'{tag} : tous les points contrôlés ({r["seen"]}/{r["n"]})', fr.evaluate("walkDone()"), str(r))
        if has_gear: check(f'{tag} : devant un logement de train, vue accroupie vers le haut', gear_seen)
        pg.wait_for_timeout(1300)
        bil = fr.locator('#g-wp [data-ta=bilan]:not([hidden])')
        check(f'{tag} : bouton « Bilan contrôle visuel » à la fin de la visite', bil.count() == 1)
        if bil.count():
            bil.click()
            rows = fr.locator('#ps-bilan tr').count() - 1
            check(f'{tag} : bilan : un rang par point, tous « Contrôlé »', rows == r['n'] and fr.locator('#ps-bilan td.ok, #ps-bilan td.ano').count() == r['n'], f'{rows}/{r["n"]}')
            fr.locator('#ps-bilan [data-ta=ok]').click()
            pg.wait_for_timeout(800)
            doc = fr.evaluate("(() => ({has: !!DOCS.D.walkcheck, cur: DOCS.cur(), txt: (document.getElementById('docv') || {}).innerText || ''}))()")
            check(f'{tag} : « Valider » → bilan rangé dans les documents et affiché', doc['has'] and doc['cur'] == 'walkcheck' and 'BILAN CONTRÔLE VISUEL' in doc['txt'], str({k: v for k, v in doc.items() if k != 'txt'}))
            fr.evaluate("DOCS.close()")

        # TA2 · installation dans le poste : tablette + double contrôle
        k = fr.evaluate("GD.steps.findIndex(s => /Monter à bord/.test(s.t))")
        fr.evaluate(f"goStep({k})"); pg.wait_for_timeout(2500)
        efb = fr.evaluate("(() => ({open: !!document.getElementById('ps-efb'), n: document.querySelectorAll('#ps-efb [data-efb]').length, all: DOCS.list().length}))()")
        check(f'{tag} : installation en poste → tablette avec tous les documents en tuiles', efb['open'] and efb['n'] == efb['all'] and efb['n'] >= 10, str(efb))
        if efb['open']:
            fr.locator('#ps-efb [data-efb=techlog]').click()
            pg.wait_for_timeout(500)
            check(f'{tag} : une tuile ouvre le document (compte rendu matériel)', fr.evaluate("DOCS.cur()") == 'techlog' and not fr.evaluate("document.getElementById('docv').hidden"))
            fr.evaluate("DOCS.close()"); fr.locator('#ps-efb [data-efbx]').click()
        pg.wait_for_timeout(6000)
        eq = fr.locator('#ps-eq').inner_text()
        if two: check(f'{tag} : double contrôle commandant / copilote à l\'installation', 'Commandant (vous)' in eq and 'Copilote' in eq and 'Documents on board' in eq, eq[:200])
        else: check(f'{tag} : appareil à un pilote : annonce du commandant seul, pas de copilote', 'Commandant (vous)' in eq and 'Copilote' not in eq, eq[:200])
        k = fr.evaluate("GD.steps.findIndex(s => /roulage/i.test(s.t))")
        fr.evaluate(f"goStep({k})"); pg.wait_for_timeout(16000)
        eq = fr.locator('#ps-eq').inner_text()
        if two: check(f'{tag} : au roulage, « Clear left » (commandant) puis « Clear right » (copilote)', 'Clear left.' in eq and 'Clear right.' in eq and eq.index('Clear left.') < eq.index('Clear right.'), eq[-300:])
        else: check(f'{tag} : au roulage, « Clear left, clear right » annoncé par le pilote', 'Clear left, clear right' in eq, eq[-200:])
        check(f'{tag} : bouton « 📱 Tablette » dans la barre du simulateur', fr.locator('#b-efb').count() == 1)
        check(f'{tag} : aucune erreur JavaScript', not errs, str(errs[:2]))
        b.close()

print(f'{sum(checks)}/{len(checks)} vérifications')
sys.exit(0 if all(checks) else 1)
