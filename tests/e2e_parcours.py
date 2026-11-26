"""F40 : parcours → choix de l'appareil (vignettes) → fiche de présentation → « Valider le parcours avec cet appareil »
→ « Parcours commencé » → simulateur d'origine lancé avec CE parcours et CET appareil (même suite qu'avant).
Ordinateur et téléphone ; version servie ou autonome (FRONT_URL=file://…).
"""
import os, pathlib, sys
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from serveur_simule import serveur

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = os.environ.get('FRONT_URL', 'http://localhost:8766/')
CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
THREE = os.environ.get('THREE_PATH', str(ROOT.parent / 'plane-trajectories-simulator/tests/node_modules/three/build/three.min.js'))
OUT = ROOT / 'tests/out'; OUT.mkdir(exist_ok=True)
checks = []
def check(name, cond, detail=''):
    checks.append(bool(cond)); print(('✔ ' if cond else '✘ ') + name + (f' — {detail}' if detail and not cond else ''))

# (parcours, appareil, mode) : parcours complets (3 modes), avion école, hélicoptère, vols propres à un appareil, scénario
LAUNCH = [('full-fw', 'a320', 'guide'), ('full-fw', 'lj60', 'auto'), ('full-350', 'a350', 'free'), ('full-c172', 'c172', 'guide'),
          ('full-rw', 'r44', 'guide'), ('full-777-af', 'b777', 'guide'), ('af-cdg-run', 'b777', None), ('c172-nav', 'c172', None),
          ('sc-1549', 'a350', None), ('heli-ny', 's76', None)]

def ctx_for(p, W, H):
    b = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
    c = b.new_context(viewport={'width': W, 'height': H})
    c.route(CDN, lambda r: r.fulfill(path=THREE, content_type='application/javascript'))
    c.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
    c.route('https://aviationweather.gov/**', lambda r: r.abort())
    serveur(c)   # élève connecté (F41)
    return b, c

with sync_playwright() as p:
    for W, H, tag in ((1280, 800, 'pc'), (390, 844, 'tel')):
        b, c = ctx_for(p, W, H); pg = c.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL + '#/parcours'); pg.wait_for_selector('.pcard')
        check(f'[{tag}] menu : plus d\'onglet « Parcours » (contenu dans le choix des aéronefs du simulateur, 20/11 20:01)', pg.locator('nav a[href="#/parcours"]').count() == 0)
        cards = pg.locator('.pcard'); n = cards.count()
        logos_ok = all(cards.nth(i).locator('.logos img').count() >= 1 for i in range(n))
        check(f'[{tag}] {n} parcours, chacun avec les vignettes de ses appareils', n >= 20 and logos_ok, str(n))
        imgs_ok = pg.evaluate("[...document.querySelectorAll('.pcard .logos img')].every(i => i.complete && i.naturalWidth > 100)")
        check(f'[{tag}] vignettes chargées (images intégrées)', imgs_ok)
        pg.screenshot(path=str(OUT / f'pro_parcours_liste_{tag}.png'))
        pg.click('.pcard[href="#/parcours/full-fw"]'); pg.wait_for_selector('.accard')
        names = pg.locator('.accard b').all_text_contents()
        check(f'[{tag}] parcours avion complet : fiches A320 et Learjet 60 (les autres ont leur propre parcours)', names == ['Airbus A320-200', 'Learjet 60'], str(names))
        check(f'[{tag}] chaque fiche de choix a sa vignette', pg.locator('.accard .aclogo img').count() == 2)
        pg.goto(URL + '#/parcours/sc-eng'); pg.wait_for_selector('.accard')
        check(f'[{tag}] scénario « panne moteur » : 8 appareils au choix', pg.locator('.accard').count() == 8)
        pg.goto(URL + '#/parcours/full-fw'); pg.wait_for_selector('.accard')
        pg.screenshot(path=str(OUT / f'pro_parcours_choix_{tag}.png'))
        pg.click('.accard[data-ac="a320"]'); pg.wait_for_selector('.sheet')
        check(f'[{tag}] fiche de présentation : nom, image, caractéristiques', pg.inner_text('.sheet h1') == 'Airbus A320-200' and pg.locator('.sheet .aclogo.lg img').count() == 1 and 'VR / V2' in pg.inner_text('.sheet table'))
        check(f'[{tag}] fiche : mention « illustration générée »', 'Illustration générée' in pg.inner_text('.sheet figcaption'))
        check(f'[{tag}] fiche : 3 modes, « guidé » par défaut', pg.locator('.modes input').count() == 3 and pg.locator('.modes input[value=guide]').is_checked())
        btn = pg.locator('button.validate')
        check(f'[{tag}] bouton « Valider le parcours avec cet appareil »', btn.inner_text().upper().endswith('VALIDER LE PARCOURS AVEC CET APPAREIL'), btn.inner_text())
        sw = pg.evaluate('document.documentElement.scrollWidth')
        check(f'[{tag}] fiche : pas de défilement horizontal', sw <= W, str(sw))
        pg.screenshot(path=str(OUT / f'pro_parcours_fiche_{tag}.png'), full_page=True)
        b.close()
        if tag == 'tel':
            break
    # lancement réel de chaque combinaison (ordinateur) : le moteur d'origine charge CE parcours avec CET appareil
    for mi, ac, mode in LAUNCH:
        b, c = ctx_for(p, 1280, 800); pg = c.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL + f'#/parcours/{mi}/{ac}'); pg.wait_for_selector('button.validate')
        if mode:
            pg.check(f'.modes input[value={mode}]')
        pg.click('button.validate')
        pg.wait_for_selector('.started')
        started = 'Parcours commencé' in pg.inner_text('.started h1')
        pg.wait_for_url('**#/simulateur/go:*', timeout=6000)
        want = f'#/simulateur/go:{ac}:{mi}:{mode or "guide"}'
        frame = None
        for _ in range(150):
            frame = next((f for f in pg.frames if f != pg.main_frame), None)
            ok = False
            if frame:
                try:
                    ok = frame.evaluate("typeof ACK!=='undefined' && typeof MI!=='undefined' && !!MI && $('menu').hidden")
                except Exception:
                    ok = False
            if ok: break
            pg.wait_for_timeout(200)
        st = frame.evaluate("({ack:ACK, mi:Object.keys(MISSIONS).find(k=>MISSIONS[k]===MI), sel:selMI, peda:!!($('m-peda')||{}).checked, auto:!!($('m-auto')||{}).checked, AUTO:typeof AUTO!=='undefined'&&AUTO.on})") if frame else {}
        # mode coché dans le menu d'origine (lu par le parcours guidé / automatique / libre)
        mode_ok = (mode != 'auto' or st.get('AUTO')) and (mode is None or {'guide': (True, False), 'auto': (False, True), 'free': (False, False)}[mode] == (st.get('peda'), st.get('auto')))
        # scénario : le moteur d'origine le rejoue dans sa mission de scénario (scn-…), comme depuis son menu
        mi_ok = st.get('mi') == mi or (mi.startswith('sc-') and str(st.get('mi', '')).startswith('scn'))
        check(f'{mi} × {ac}{" (" + mode + ")" if mode else ""} : « Parcours commencé » → simulateur lancé avec ce parcours et cet appareil',
              started and pg.url.endswith(want) and st.get('ack') == ac and mi_ok and mode_ok, f'{pg.url[-40:]} {st}')
        if errs: check(f'{mi} × {ac} : aucune erreur JavaScript', False, '; '.join(errs[:2]))
        if (mi, ac) == ('full-fw', 'a320'): pg.screenshot(path=str(OUT / 'pro_parcours_lance.png'))
        b.close()
    # fiche de l'appareil → « Simulateur ▸ » → directement l'écran de départ du simulateur, appareil déjà choisi, sans autre étape
    for ac, w, h in (('lj60', 1280, 800), ('h125', 390, 844)):
        b, c = ctx_for(p, w, h); pg = c.new_page()
        pg.goto(URL + f'#/appareils/{ac}'); pg.wait_for_selector('.ac .actions a.btn')
        pg.click('.ac .actions a.btn >> text=Simulateur')
        st = {}
        for _ in range(150):
            fr = next((f for f in pg.frames if f != pg.main_frame), None)
            try:
                st = fr.evaluate("({sel: selAC, menu: !$('menu').hidden, intro: !!(document.getElementById('intro') && !document.getElementById('intro').hidden), brief: !!(document.getElementById('br-skip') && document.getElementById('br-skip').offsetParent)})") if fr else {}
                if st.get('sel') == ac and st.get('menu'): break
            except Exception: pass
            pg.wait_for_timeout(200)
        pg.wait_for_timeout(1200)
        st = fr.evaluate("({sel: selAC, menu: !$('menu').hidden, intro: !!(document.getElementById('intro') && !document.getElementById('intro').hidden), brief: !!(document.getElementById('br-skip') && document.getElementById('br-skip').offsetParent)})")
        check(f'page Appareils {ac} : « Simulateur » → écran de départ, {ac} choisi, sans introduction ni dossier', st.get('sel') == ac and st.get('menu') and not st.get('intro') and not st.get('brief'), str(st))
        # choix direct (19/11 21:59) : la liste des appareils est à l'écran, carte de l'appareil choisi entourée et visible
        pk = fr.evaluate("""(ac) => { const c = document.querySelector('#c-ac [data-ac="' + ac + '"]'); if (!c) return {};
          const r = c.getBoundingClientRect(); return {pick: c.classList.contains('ps-pick'), vis: r.top >= 0 && r.bottom <= innerHeight,
          n: document.querySelectorAll('#c-ac .ps-pick').length}; }""", ac)
        check(f'page Appareils {ac} ({w} px) : liste des appareils affichée, carte {ac} entourée et visible', pk.get('pick') and pk.get('vis') and pk.get('n') == 1, str(pk))
        b.close()
print(f'{sum(checks)}/{len(checks)} vérifications')
sys.exit(0 if all(checks) else 1)
