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

STEP = """((n) => { AUTO.on = true; AUTO.stage = 'act'; let i = 0; for (; i < n && GD.seen.size < (WALKPTS[ACK] || []).length; i++) { autoWalk(0.1); walkCheck(); if (__PS_TA__.cur >= 0 && performance.now() < __PS_TA__.until) break; } return {i, cur: __PS_TA__.cur, seen: GD.seen.size, n: (WALKPTS[ACK] || []).length}; })"""

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
        nb = fr.locator('#ps-ta [data-ta=next]:not([hidden])')
        check(f'{tag} : compte à rebours et bouton « Point suivant ▸ »', nb.count() == 1 and 'min' in fr.locator('#ps-ta').inner_text())
        prev = fr.evaluate("__PS_TA__.cur")
        if nb.count():
            nb.click()
        after = fr.evaluate("({until: __PS_TA__.until, cur: __PS_TA__.cur})")
        check(f'{tag} : « Point suivant ▸ » écourte l\'arrêt', after['until'] == 0 or after['cur'] != prev, str(after))
        # visite complète : chaque arrêt est écourté (comme « Point suivant »), la marche reprend jusqu'au point suivant
        gear_seen = False
        for _ in range(60):
            r = fr.evaluate(STEP + "(4000)")
            if fr.evaluate("__PS_TA__.cur >= 0 && /train/i.test(WALKPTS[ACK][__PS_TA__.cur][2]) && performance.now() < __PS_TA__.until"):
                y = fr.evaluate("(() => { placeWalkCam(); return camera.position.y; })()")
                gear_seen = gear_seen or y < 1.0
            if r['seen'] >= r['n']: break
            fr.evaluate("__PS_TA__.until = 0")
        has_gear = fr.evaluate("(WALKPTS[ACK] || []).some(p => /train/i.test(p[2]))")
        check(f'{tag} : tous les points contrôlés ({r["seen"]}/{r["n"]})', r['seen'] == r['n'], str(r))
        if has_gear: check(f'{tag} : devant un logement de train, vue accroupie vers le haut', gear_seen)
        fr.evaluate("walkDone()"); pg.wait_for_timeout(1300)
        bil = fr.locator('#ps-ta [data-ta=bilan]:not([hidden])')
        check(f'{tag} : fin de visite : bilan ouvert tout seul, bouton « Bilan contrôle visuel » dans le bandeau', bil.count() == 1 and fr.locator('#ps-bilan').count() == 1)
        check(f'{tag} : l\'étape n\'est pas terminée tant que le bilan n\'est pas validé', fr.evaluate("walkDone()") is False)
        if fr.locator('#ps-bilan').count():
            rows = fr.locator('#ps-bilan tr').count() - 1
            check(f'{tag} : bilan : un rang par point, tous « Contrôlé »', rows == r['n'] and fr.locator('#ps-bilan td.ok, #ps-bilan td.ano').count() == r['n'], f'{rows}/{r["n"]}')
            fr.locator('#ps-bilan [data-ta=ok]').click()
            pg.wait_for_timeout(800)
            doc = fr.evaluate("(() => ({has: !!DOCS.D.walkcheck, cur: DOCS.cur(), txt: (document.getElementById('docv') || {}).innerText || ''}))()")
            check(f'{tag} : « Valider » → bilan rangé dans les documents et affiché', doc['has'] and doc['cur'] == 'walkcheck' and 'BILAN CONTRÔLE VISUEL' in doc['txt'], str({k: v for k, v in doc.items() if k != 'txt'}))
            check(f'{tag} : bilan validé → étape de la visite terminée', fr.evaluate("walkDone()") is True)
            fr.evaluate("DOCS.close()")

        # TA2 · installation dans le poste : tablette + double contrôle
        fr.evaluate("(() => { AUTO.on = false; __PS_EQ__.played = {}; __PS_EQ__.last = ''; const e = document.getElementById('ps-efb'); if (e) e.remove(); })()")
        k = fr.evaluate("GD.steps.findIndex(s => /Monter à bord/.test(s.t))")
        # goStep peut être retenu par la checklist (sous-étapes manquantes) : on se place alors directement sur l'étape
        fr.evaluate(f"(() => {{ try {{ goStep({k}); }} catch (e) {{}} if (GD.i !== {k}) GD.i = {k}; const c = document.getElementById('ckl'); if (c) c.hidden = true; }})()"); pg.wait_for_timeout(2500)
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
        else: check(f'{tag} : appareil à un pilote : annonce du pilote seul, pas de copilote', 'Pilote (vous)' in eq and 'Copilote' not in eq, eq[:200])
        k = fr.evaluate("GD.steps.findIndex(s => /roulage/i.test(s.t))")
        if k < 0:   # hélicoptères : pas d'étape de roulage ; l'annonce de décollage est vérifiée à la place
            k = fr.evaluate("GD.steps.findIndex(s => /^Décollage/i.test(s.t))")
            fr.evaluate(f"(() => {{ __PS_EQ__.last = ''; try {{ goStep({k}); }} catch (e) {{}} if (GD.i !== {k}) GD.i = {k}; const c = document.getElementById('ckl'); if (c) c.hidden = true; }})()")
            for _ in range(30):
                pg.wait_for_timeout(1000); eq = fr.evaluate("__PS_EQ__.log.map(x => x[1]).join('\\n')")
                if 'clear above and around' in eq: break
            check(f'{tag} : au décollage, annonce « dégagé au-dessus et autour »' + (' (commandant puis copilote)' if two else ''), 'clear above and around' in eq, eq[-200:])
        else:
            fr.evaluate(f"(() => {{ __PS_EQ__.last = ''; try {{ goStep({k}); }} catch (e) {{}} if (GD.i !== {k}) GD.i = {k}; const c = document.getElementById('ckl'); if (c) c.hidden = true; }})()")
            want = 'Clear right.' if two else 'Clear left, clear right'
            for _ in range(90):
                pg.wait_for_timeout(1000)
                eq = fr.evaluate("__PS_EQ__.log.map(x => x[1]).join('\\n')")
                if want in eq: break
            if two: check(f'{tag} : au roulage, « Clear left » (commandant) puis « Clear right » (copilote)', 'Clear left.' in eq and 'Clear right.' in eq and eq.index('Clear left.') < eq.index('Clear right.'), eq[-300:])
            else: check(f'{tag} : au roulage, « Clear left, clear right » annoncé par le pilote', 'Clear left, clear right' in eq, eq[-200:])
        check(f'{tag} : bouton « 📱 Tablette » dans la barre du simulateur', fr.locator('#b-efb').count() == 1)
        # TA3 (20/11 08:22) : toutes les conversations et check-lists, lancées depuis le panneau Radio, audibles avec « Son »
        fr.evaluate("(() => { hasPower = () => true; radioPowered = () => true; atcOpen(true); atcRender(true); })()"); pg.wait_for_timeout(400)
        crew = [t.strip() for t in fr.locator('#atc .ps-crew [data-crew]').all_text_contents()]
        check(f'{tag} : panneau Radio : rubrique « Équipage » avec les phases du vol', len(crew) >= 8 and any('☑' in c for c in crew), str(crew))
        n = fr.evaluate("""(() => { let n = 0; const sp = speechSynthesis.speak.bind(speechSynthesis); speechSynthesis.speak = () => { n++; };
          window.__eq0 = __PS_EQ__.log.length; SND.on = false; __PS_EQ_PLAY__('bstart'); const a = n; SND.on = true; __PS_EQ_PLAY__('bstart'); window.__sp = sp; return {off: a}; })()""")
        pg.wait_for_timeout(6000)
        # la boîte n'affiche que les 2 dernières répliques (UX1) : on lit le journal complet de la conversation
        txt = fr.evaluate("(() => { const L = __PS_EQ__.log; return L.slice(window.__eq0 || 0).map(x => (x[0] === 'CDB' ? 'Commandant' : 'Copilote') + ' : ' + x[1]).join('\\n'); })()"); spk = fr.evaluate("(() => { const k = speechSynthesis.speak; speechSynthesis.speak = window.__sp; SND.on = false; return 1; })()")
        ck_first = 'Before start checklist.' if two else ('Before start checklist.' if ac in ('a320',) else 'Avant mise en route checklist.')
        check(f'{tag} : check-list « avant mise en route » lue en question / réponse depuis le panneau Radio', ('checklist.' in txt.lower()) and (('Copilote' in txt) == two), txt[:240])
        check(f'{tag} : son coupé → sous-titres seulement, aucune voix', n['off'] == 0, str(n))
        if two and ac in ('a320', 'a350'):
            v = fr.evaluate("""(() => { const s0 = {g: S.onGround, V: S.V, thr: S.thr, f: ATC.flown}; S.onGround = true; ATC.flown = false; S.thr = 1;
              for (const kt of [40, 105, (LS.v1 || 140) + 1, (LS.vr || 145) + 1]) { S.V = (kt + 8) * 0.514444; S.alt = elevAt(S.lat, S.lon) + 3; __ps_live_now && __ps_live_now(); }
              Object.assign(S, {onGround: s0.g, V: s0.V, thr: s0.thr}); ATC.flown = s0.f; return 1; })()""")
            pg.wait_for_timeout(500); v = fr.evaluate("__PS_EQ__.log.map(x => x[1]).join(' | ')")
            check(f'{tag} : annonces en direct au décollage : poussée, 100 kt, V1, rotation', all(k in v for k in ('Thrust set', 'One hundred knots', 'V1.', 'Rotate.')), v[-300:])
        # checklist (20/11 07:26-07:27) : étape avec documents → tablette sur ces documents ; étape sans document → l'étape s'ouvre
        fr.evaluate("(() => { const e = document.getElementById('ps-efb'); if (e) e.remove(); goStep(0); })()"); pg.wait_for_timeout(600)
        fr.evaluate("CKL.open()"); pg.wait_for_timeout(700)
        st = fr.locator('#ckl .st.ps-doc').first
        check(f'{tag} : checklist : l\'étape du dossier de vol est marquée « documents »', st.count() >= 1)
        if st.count(): fr.evaluate("document.querySelector('#ckl .st.ps-doc b').click()")
        pg.wait_for_timeout(500)
        tab = fr.evaluate("(() => { const e = document.getElementById('ps-efb'); return e ? {h: e.querySelector('h5').textContent, n: e.querySelectorAll('.tiles')[0].children.length} : null; })()")
        check(f'{tag} : checklist : toucher l\'étape ouvre la tablette sur les documents de l\'étape', tab and 'Documents de l\'étape 0' in tab['h'] and tab['n'] >= 1 and fr.evaluate("document.getElementById('ckl').hidden"), str(tab))
        fr.evaluate("(() => { const e = document.getElementById('ps-efb'); if (e) e.remove(); CKL.open(); })()"); pg.wait_for_timeout(700)
        go = fr.evaluate("(() => { const s = [...document.querySelectorAll('#ckl .st.ps-go')].find(x => /^\\d+\\./.test(x.querySelector('b').textContent.trim())); return s ? +s.querySelector('b').textContent.trim().split('.')[0] : -1; })()")
        if go >= 0:
            fr.evaluate(f"[...document.querySelectorAll('#ckl .st.ps-go b')].find(b => b.textContent.trim().startsWith('{go}.')).click()"); pg.wait_for_timeout(800)
            check(f'{tag} : checklist : étape sans document → l\'étape {go} s\'ouvre', fr.evaluate("GD.i") == go or not fr.evaluate("document.getElementById('ckl').hidden"), str(fr.evaluate("GD.i")))
        else: check(f'{tag} : checklist : au moins une étape sans document', False)
        # MET2 · moteurs ou rotors en marche : personne près d'une zone de danger → accident ; loin → rien
        dz = fr.evaluate("""(() => { const t0 = S.eng ? S.eng.slice() : null, nr0 = S.nr; setView('walk'); if (S.eng) S.eng = S.eng.map(() => 1); S.nr = 1; S.rpm = 2200;
          const far = (() => { const q = m2l(0, 120); GD.walk.x = q[0]; GD.walk.z = q[1]; return __PS_DANGER__(); })();
          const e = A.kind === 'fw' && ACK !== 'c172' ? (WALKPTS[ACK] || []).find(p => /[Mm]oteur|[Rr]éacteur/.test(p[2]) && !/[Cc]apot/.test(p[2])) : null;
          const tgt = e ? [e[0], e[1] - 0.5] : ACK === 'c172' ? [0, -3.6] : [0, 0];
          const q = m2l(tgt[0], tgt[1]); GD.walk.x = q[0]; GD.walk.z = q[1]; const near = __PS_DANGER__();
          if (t0) S.eng = t0; S.nr = nr0; return {far, near}; })()""")
        check(f'{tag} : moteur ou rotor en marche : personne dans la zone de danger → accident (« {(dz["near"] or "")[:40]}… »)', dz['near'] and not dz['far'], str(dz))
        pg.wait_for_timeout(300)
        fr.evaluate("(() => { if (S.eng) S.eng = S.eng.map(() => 1); S.nr = 1; const e = A.kind === 'fw' && ACK !== 'c172' ? (WALKPTS[ACK] || []).find(p => /[Mm]oteur|[Rr]éacteur/.test(p[2])) : null; const t = e ? [e[0], e[1] - 0.5] : ACK === 'c172' ? [0, -3.6] : [0, 0]; const q = m2l(t[0], t[1]); GD.walk.x = q[0]; GD.walk.z = q[1]; setView('walk'); })()")
        fr.evaluate("window.__keep = setInterval(() => { if (S.eng) S.eng = S.eng.map(() => 1); S.nr = 1; }, 30)")   # moteurs maintenus en marche (pas de carburant ni de systèmes réglés dans ce test)
        for _ in range(50):
            pg.wait_for_timeout(200)
            if fr.evaluate("!!document.getElementById('crash')"): break
        diag = fr.evaluate("(() => JSON.stringify({view, mi: !!MI, acc: __PS_TA__.acc, d: (__PS_DANGER__() || '').slice(0, 40), eng: S.eng, crash: !!document.getElementById('crash')}))()")
        crash = fr.evaluate("(() => { clearInterval(window.__keep); const c = document.getElementById('crash'); const t = c ? c.innerText : ''; if (S.eng) S.eng = S.eng.map(() => 0); S.nr = 0; if (c) c.remove(); return t; })()")
        check(f'{tag} : l\'accident est affiché (« ACCIDENT AU SOL »)', 'ACCIDENT AU SOL' in crash, crash[:120] + ' ' + diag)
        check(f'{tag} : aucune erreur JavaScript', not errs, str(errs[:2]))
        b.close()

print(f'{sum(checks)}/{len(checks)} vérifications')
sys.exit(0 if all(checks) else 1)
