"""F37 : boutons radio du panneau « RADIO · CONTRÔLE AÉRIEN », sur de vrais parcours lancés dans le moteur d'origine.

Pour chaque parcours × appareil : Radio ▾ (stations du parcours, réglage), Appeler, réponse du contrôle, Standby,
Répéter (« say again » → « I say again » identique), Collationner, Mayday / Pan-Pan (motifs selon l'appareil, message
transmis au « Appeler », réponse du contrôle). Serveur simulé (élève connecté) ou version autonome (FRONT_URL=file://…).
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

# parcours, appareil, motif attendu parmi les choix d'urgence
CASES = [('full-fw', 'a320', 'un moteur en panne'), ('full-350', 'a350', 'double panne moteur'), ('full-777-af', 'b777', 'un moteur en panne'),
         ('full-fw', 'lj60', 'un moteur en panne'), ('full-c172', 'c172', 'atterrissage forcé'), ('full-rw', 'h125', 'autorotation'),
         ('full-rw', 'r44', 'moteur qui tourne mal'), ('full-rw', 's76', 'un moteur en panne')]
if len(sys.argv) > 1: CASES = [c for c in CASES if c[1] in sys.argv[1:]]

def log(fr): return fr.evaluate("ATC.log.map(m => m.who + '|' + m.en)")

with sync_playwright() as p:
    for mi, ac, motif in CASES:
        b = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
        ctx = b.new_context(viewport={'width': 1280, 'height': 800})
        ctx.route(CDN, lambda r: r.fulfill(path=THREE, content_type='application/javascript'))
        ctx.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
        ctx.route('https://aviationweather.gov/**', lambda r: r.abort())
        serveur(ctx)
        pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL + f'#/simulateur/go:{ac}:{mi}:free')
        fr = None
        for _ in range(150):
            fr = next((f for f in pg.frames if f != pg.main_frame), None)
            try:
                if fr and fr.evaluate("!!window.__PS_RADIO__ && !!MI && $('menu').hidden && ATC.seq && ATC.seq.length > 0"): break
            except Exception: pass
            pg.wait_for_timeout(200)
        tag = f'{mi} × {ac}'
        if not fr:
            check(f'{tag} : moteur chargé', False); b.close(); continue
        # comme l'élève : « Passer le dossier et voler ▸ » ; puis radio alimentée (avion déjà sous tension) et panneau Radio ouvert
        pg.wait_for_timeout(1500)
        fr.evaluate("(() => { for (const id of ['br-skip', 'br-go']) { const b = document.getElementById(id); if (b && b.offsetParent && !b.hidden) { b.click(); return id; } } return null; })()")
        pg.wait_for_timeout(800)
        fr.evaluate("(() => { ATC.voice = false; ATC.snd = false; hasPower = () => true; radioPowered = () => true; paused = false; atcOpen(true); atcRender(true); })()")
        fr.wait_for_selector('#atc .abtn2', timeout=8000)
        labels = fr.locator('#atc .abtn2 button').all_text_contents()
        check(f'{tag} : boutons Répéter, Standby, Radio, Mayday / Pan-Pan', [l.strip() for l in labels] == ['Répéter', 'Standby', 'Radio ▾', 'Mayday / Pan-Pan'], str(labels))
        check(f'{tag} : au sol, Mayday / Pan-Pan désactivé', fr.locator('#atc [data-x=emer]').is_disabled())
        # Radio ▾ : stations du parcours, réglage
        fr.click('#atc [data-x=radio]')
        sts = fr.evaluate("[...document.querySelectorAll('#atc [data-st]')].map(b => b.dataset.st)")
        seq = fr.evaluate("[...new Set(ATC.seq.map(x => x.st).filter(k => k && !STN[k].dl))]")
        check(f'{tag} : Radio ▾ liste les {len(seq)} stations du parcours, dans l\'ordre', sts == seq and len(sts) >= 2, f'{sts} / {seq}')
        want = fr.evaluate("curX() ? curX().st : ATC.curSt")
        fr.click(f'#atc [data-st="{want}"]')
        check(f'{tag} : station attendue réglée ({want})', fr.evaluate(f"Math.abs(tunedF() - STN['{want}'].f) < 0.004"))
        # Répéter avant tout message du contrôle
        n0 = len(log(fr)); fr.click('#atc [data-x=again]') if not fr.locator('#atc [data-x=again]').is_disabled() else None
        # l'ATIS écoutée (passée), le premier échange « à vous d'appeler » arrive ; l'élève règle la station avec Radio ▾ puis appelle
        fr.evaluate("(() => { const x = curX(); if (x && x.type === 'atis') xDone(x, true); })()")
        # Appeler jusqu'au premier échange avec réponse du contrôle : les auto-annonces sur fréquence de trafic (hélistation,
        # terrain non contrôlé) et l'ATIS n'attendent pas de collationnement ; l'élève règle chaque fois la station avec Radio ▾
        ready = got_rb = False; k = None
        for _ in range(8):
            for i_ in range(60):
                fr.evaluate("(() => { const x = curX(); if (x && x.type === 'atis') xDone(x, true); })()")
                if fr.evaluate("ATC.state === 'rb'"): got_rb = True; break
                if fr.evaluate("ATC.state === 'ready' && !!curX()"): ready = True; break
                # échange déclenché par la position en vol (hélicoptère après l'auto-annonce) : on simule seulement l'arrivée
                # au point de déclenchement ; l'échange lui-même reste celui du moteur
                if i_ == 12: fr.evaluate("(() => { const x = curX(); if (x && ATC.state === 'idle') x.trig = () => true; })()")
                pg.wait_for_timeout(250)
            if got_rb: break
            if not ready: break
            k = fr.evaluate("curX() ? curX().st : null")
            fr.evaluate("atcRender(true)"); fr.click('#atc [data-x=radio]'); fr.click(f'#atc [data-st="{k}"]')
            fr.evaluate("atcRender(true)"); fr.click('#atc [data-a=call]')
            for _ in range(40):
                st_ = fr.evaluate("ATC.state")
                if st_ == 'rb': got_rb = True; break
                if st_ == 'ready': break
                pg.wait_for_timeout(250)
            if got_rb: break
            ready = False
        L = log(fr)
        check(f'{tag} : Appeler → réponse du contrôle, collationnement attendu', got_rb and any(x.startswith('ATC|') for x in L), f'ready={ready} state={fr.evaluate("ATC.state")} k={k} pw={fr.evaluate("radioPowered()")} ' + str(L[-3:]))
        cs = fr.evaluate("CSN()")
        check(f'{tag} : indicatif propre à l\'appareil ({cs}, pas « SIMU 01 »)', cs != 'SIMU 01' and cs.startswith('SIMU '))
        check(f'{tag} : indicatif de l\'appareil dans l\'échange ({cs})', any(cs in x for x in L if x.startswith('PIL|')))
        fr.evaluate("atcRender(true)")
        fr.click('#atc [data-x=stby]')
        check(f'{tag} : Standby annoncé', any(x == f'PIL|{cs}, standby' for x in log(fr)))
        last = [x for x in log(fr) if x.startswith('ATC|')][-1][4:]
        fr.click('#atc [data-x=again]')
        for _ in range(100):   # réponse du contrôle après 1,4 à 2,2 s (délai aléatoire du moteur) ; rendu logiciel (swiftshader) de l'aéroport : plusieurs secondes par image
            pg.wait_for_timeout(200); L = log(fr)
            if any(x.startswith(f'ATC|{cs}, I say again') for x in L): break
        body = last[len(cs) + 2:] if last.startswith(cs + ', ') else last
        check(f'{tag} : Répéter → « say again » puis message répété à l\'identique, indicatif dit une seule fois', any(x.endswith(', say again') for x in L) and any(x == f'ATC|{cs}, I say again, {body}' for x in L), str(L[-2:]))
        # comme l'élève : code transpondeur affiché (bouton du panneau) avant de collationner, si le contrôle en a donné un
        fr.evaluate("atcRender(true)")
        if fr.locator('#atc [data-a=sq]').count(): fr.click('#atc [data-a=sq]'); fr.evaluate("atcRender(true)")
        fr.click('#atc [data-a=rb]'); pg.wait_for_timeout(2500)
        check(f'{tag} : Collationner (copilote) → échange suivant', fr.evaluate("ATC.state") != 'rb', fr.evaluate("JSON.stringify({st: ATC.state, x: curX() && curX().type, rb: [...document.querySelectorAll('#atc [data-a=rb]')].map(b => b.outerHTML.slice(0, 120))})") + str(log(fr)[-3:]))
        # Mayday / Pan-Pan en vol
        fr.evaluate("(() => { S.onGround = false; ATC.ver++; atcRender(true); })()")
        fr.click('#atc [data-x=emer]')
        motifs = fr.locator('#atc [data-em]').all_text_contents()
        check(f'{tag} : motifs d\'urgence adaptés à l\'appareil (« {motif} »)', any(motif in m for m in motifs), str(motifs))
        fr.locator('#atc [data-em]').first.click()
        check(f'{tag} : Mayday préparé dans la file radio', fr.evaluate("ATC.q.some(x => x.emer)"))
        for _ in range(20):
            if fr.evaluate("(() => { atcRender(true); return ATC.state === 'ready' && curX() && curX().emer; })()"): break
            pg.wait_for_timeout(250)
        fr.click('#atc [data-a=call]'); pg.wait_for_timeout(3600)
        L = log(fr)
        check(f'{tag} : Mayday transmis puis « roger Mayday » du contrôle', any(x.startswith('PIL|Mayday, mayday, mayday') for x in L) and any('roger Mayday' in x for x in L), str(L[-2:]))
        if ac == 'a320': fr.locator('#atc').screenshot(path=str(OUT / 'pro_radio_a320.png'))
        check(f'{tag} : aucune erreur JavaScript', not errs, '; '.join(errs[:2]))
        b.close()
print(f'{sum(checks)}/{len(checks)} vérifications')
sys.exit(0 if all(checks) else 1)
