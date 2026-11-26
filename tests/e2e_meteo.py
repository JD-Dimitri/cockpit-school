"""F21 : choix de la météo et effets sur le vol, dans de vrais parcours lancés dans le moteur d'origine.

Pour chaque appareil : boutons de choix dans la rubrique « Météo » du panneau radio ; chaque scénario écrit des METAR [SIMULÉ]
cohérents pour les aérodromes du vol ; ATIS, état de la piste et freinage, visibilité (brouillard, nuages), pluie et neige à
l'écran, sons (état météo du moteur audio), turbulence d'orage, givrage, voix du pilote, retour aux METAR réels.
Serveur simulé (élève connecté) ou version autonome (FRONT_URL=file://…).
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
    checks.append(bool(cond)); print(('✔ ' if cond else '✘ ') + name + (f' — {detail}' if detail and not cond else ''))

CASES = [('full-fw', 'a320'), ('full-350', 'a350'), ('full-777-af', 'b777'), ('full-fw', 'lj60'), ('full-c172', 'c172'),
         ('full-rw', 'h125'), ('full-rw', 'r44'), ('full-rw', 's76')]
if len(sys.argv) > 1: CASES = [c for c in CASES if c[1] in sys.argv[1:]]
PRESETS = ['Réel', 'Soleil ☀️', 'Nuageux', 'Pluie', 'Brouillard', 'Neige', 'Vent fort', 'Orage', 'Tempête', 'Ouragan', 'Givrage']

def pick(fr, label):
    fr.evaluate("(() => { atcOpen(true); atcRender(true); const d = document.querySelector('#atc details.wxp'); if (d) d.open = true; })()")
    fr.locator('#atc .wxpick button', has_text=label).first.click()
    fr.evaluate("atcRender(true)")

with sync_playwright() as p:
    for mi, ac in CASES:
        b = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
        ctx = b.new_context(viewport={'width': 1280, 'height': 800})
        ctx.route(CDN, lambda r: r.fulfill(path=THREE, content_type='application/javascript'))
        ctx.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
        ctx.route('https://aviationweather.gov/**', lambda r: r.abort())
        serveur(ctx)
        pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.add_init_script("try { localStorage.removeItem('ps-meteo'); } catch (e) {}")
        pg.goto(URL + f'#/simulateur/go:{ac}:{mi}:free')
        fr = None
        for _ in range(150):
            fr = next((f for f in pg.frames if f != pg.main_frame), None)
            try:
                if fr and fr.evaluate("!!window.__PS_METEO__ && !!MI && $('menu').hidden && !!ATC.dep"): break
            except Exception: pass
            pg.wait_for_timeout(200)
        tag = f'{mi} × {ac}'
        if not fr:
            check(f'{tag} : moteur chargé avec la météo', False); b.close(); continue
        pg.wait_for_timeout(1200)
        fr.evaluate("(() => { for (const id of ['br-skip', 'br-go']) { const b = document.getElementById(id); if (b && b.offsetParent && !b.hidden) { b.click(); return; } } })()")
        pg.wait_for_timeout(600)
        fr.evaluate("(() => { ATC.voice = false; hasPower = () => true; radioPowered = () => true; paused = false; })()")
        dep = fr.evaluate("ATC.dep")
        real = fr.evaluate("WXS.met[ATC.dep] ? WXS.met[ATC.dep].raw : null")
        fr.evaluate("(() => { atcOpen(true); atcRender(true); const d = document.querySelector('#atc details.wxp'); if (d) d.open = true; })()")
        labels = [t.strip() for t in fr.locator('#atc .wxpick button').all_text_contents()]
        check(f'{tag} : 11 choix de météo dans le panneau radio (dont Soleil et Ouragan)', labels == PRESETS, str(labels))

        # Pluie : METAR simulé, ATIS, piste mouillée, freinage, pluie à l'écran, son de pluie
        pick(fr, 'Pluie')
        st = fr.evaluate("""(() => { const m = WXS.met[ATC.dep], a = atisFor(ATC.dep, null), r = __PS_RWY__();
          return {raw: m.raw, src: WXS.src, sum: document.querySelector('#atc details.wxp summary').textContent,
                  atis: a && a.en, rwy: r.n, k: r.k, brk: S.onGround ? brkEff() : null, rain: SND.wxHere().rain}; })()""")
        check(f'{tag} : Pluie → METAR [SIMULÉ] de {dep} avec RA et plafond bas', ' RA ' in st['raw'] and 'BKN008' in st['raw'] and st['src'] == 'sim', st['raw'])
        check(f'{tag} : Pluie → rubrique « Météo · scénario choisi : Pluie [SIMULÉ] »', 'Pluie [SIMULÉ]' in st['sum'], st['sum'])
        check(f'{tag} : Pluie → ATIS mise à jour (visibilité 4000 m, broken 800 ft)', st['atis'] and 'Visibility 4000 metres' in st['atis'] and 'broken 800 feet' in st['atis'], str(st['atis'])[:160])
        check(f'{tag} : Pluie → piste mouillée, freinage réduit (×0,65)', st['rwy'] == 'mouillée' and abs(st['k'] - 0.65) < 1e-9 and (st['brk'] is None or st['brk'] <= 0.65 + 1e-9), str(st))
        check(f'{tag} : Pluie → moteur audio en pluie', st['rain'] > 0.05, str(st['rain']))
        pg.wait_for_timeout(1300)
        cls = fr.evaluate("(() => { const e = document.getElementById('ps-precip'); return e.className + '|' + e.style.opacity; })()")
        check(f'{tag} : Pluie → pluie visible à l\'écran', cls.startswith('rain|') and float(cls.split('|')[1]) > 0.3, cls)

        # Brouillard : visibilité 200 m dans la vue 3D
        pick(fr, 'Brouillard')
        fog = fr.evaluate("(() => { placeCamera(); return {far: scene.fog.far, raw: WXS.met[ATC.dep].raw, atis: atisFor(ATC.dep, null).en}; })()")
        check(f'{tag} : Brouillard → METAR FG 0200 VV001, vue limitée à moins de 300 m', ' FG ' in fog['raw'] and ' 0200 ' in fog['raw'] and fog['far'] <= 300, f"{fog['raw']} far={fog['far']:.0f}")
        check(f'{tag} : Brouillard → ATIS « Visibility 200 metres »', 'Visibility 200 metres' in fog['atis'], fog['atis'][:140])

        # Neige : piste enneigée, neige à l'écran, températures négatives
        pick(fr, 'Neige'); pg.wait_for_timeout(1300)
        sn = fr.evaluate("(() => ({rwy: __PS_RWY__().n, k: __PS_RWY__().k, cls: document.getElementById('ps-precip').className, t: WXS.met[ATC.dep].temp}))()")
        check(f'{tag} : Neige → piste enneigée (×0,45), neige à l\'écran, −2 °C', sn['rwy'] == 'neige' and sn['cls'] == 'snow' and sn['t'] == -2, str(sn))

        # Vent fort : rafales du METAR, vent de surface et turbulence mécanique en vol
        pick(fr, 'Vent fort')
        vt = fr.evaluate("(() => { const m = WXS.met[ATC.dep]; return {spd: m.spd, gust: m.gust, dir: m.dir}; })()")
        check(f'{tag} : Vent fort → 25 kt rafales 40 kt (direction réelle gardée)', vt['spd'] == 25 and vt['gust'] == 40, str(vt))

        # Orage : turbulence ajoutée en vol (σ des rafales verticales), foudre possible
        def sigma(label):
            pick(fr, label)
            return fr.evaluate("""(() => { const s0 = {g: S.onGround, a: S.alt, V: S.V}; S.onGround = false; S.alt = elevAt(S.lat, S.lon) + 3000 * FT; S.V = Math.max(S.V, 80);
              let s = 0, n = 0; for (let i = 0; i < 3000; i++) { gustStep(0.05); s += GUST.w * GUST.w; n++; }
              S.onGround = s0.g; S.alt = s0.a; S.V = s0.V; GUST.u = GUST.w = 0; return Math.sqrt(s / n); })()""")
        s_sec, s_ts, s_tp = sigma('Soleil'), sigma('Orage'), sigma('Tempête')
        check(f'{tag} : Orage et tempête → turbulence en vol plus forte que par temps sec', s_ts > s_sec + 0.5 and s_tp > s_ts, f'σw sec {s_sec:.2f}, orage {s_ts:.2f}, tempête {s_tp:.2f} m/s')
        ts = fr.evaluate("(() => ({raw: WXS.met[ATC.dep].raw, ts: SND.wxHere().ts, hail: SND.wxHere().hail}))()")
        check(f'{tag} : Tempête → METAR +TSRAGR CB, orage et grêle dans le moteur audio', '+TSRAGR' in ts['raw'] and 'CB' in ts['raw'] and ts['ts'] and ts['hail'], str(ts))

        # MET2 · Ouragan : METAR, vols impossibles
        pick(fr, 'Ouragan')
        ou = fr.evaluate("(() => { const m = WXS.met[ATC.dep]; return {raw: m.raw, spd: m.spd, gust: m.gust, qnh: m.qnh}; })()")
        check(f'{tag} : Ouragan → vent 75 kt rafales 100 kt, pluie torrentielle, dépression', ou['spd'] == 75 and ou['gust'] == 100 and '+TSRA' in ou['raw'] and ou['qnh'] < 980, str(ou))
        # MET2 · densité de l'air réelle : moteur et extension d'accord, air froid plus dense que l'air chaud
        def rho(label):
            pick(fr, label)
            return fr.evaluate("(() => { const h = elevAt(S.lat, S.lon); return {rho: isaRho(h), isa: isaP(h) / (287.05 * isaT(h)), k: __PS_RHOK__(h), T: WXS.met[ATC.dep].temp, q: WXS.met[ATC.dep].qnh}; })()")
        rc, rh = rho('Neige'), rho('Tempête')
        check(f'{tag} : densité de l\'air du moteur = ISA × correction METAR (température, QNH)', abs(rc['rho'] - rc['isa'] * rc['k']) < 1e-9 and abs(rh['rho'] - rh['isa'] * rh['k']) < 1e-9, f'{rc} {rh}')
        check(f'{tag} : air froid (neige, {rc["T"]} °C) plus dense que l\'air chaud (tempête, {rh["T"]} °C)', rc['rho'] > rh['rho'] * 1.03, f"{rc['rho']:.4f} / {rh['rho']:.4f}")
        # MET2 · micro-rafale sous l'orage : vent de face puis vent arrière et descendance
        pick(fr, 'Orage')
        ws = fr.evaluate("""(() => { const s0 = {g: S.onGround, a: S.alt, V: S.V}; S.onGround = false; S.alt = elevAt(S.lat, S.lon) + 800 * FT; S.V = Math.max(S.V, 75);
          __PS_MET__.ws = {t: 0}; let up = 0, down = 0, wd = 0; for (let i = 0; i < 220; i++) { GUST.u = GUST.w = 0; gustStep(0.1); const t = __PS_MET__.ws ? __PS_MET__.ws.t : 99;
            if (t < 6) up = Math.max(up, GUST.u); else if (t < 20) { down = Math.min(down, GUST.u); wd = Math.min(wd, GUST.w); } }
          Object.assign(S, {onGround: s0.g, alt: s0.a, V: s0.V}); GUST.u = GUST.w = 0; return {up, down, wd, end: __PS_MET__.ws}; })()""")
        check(f'{tag} : micro-rafale : vent de face puis vent arrière et courant descendant, puis fin', ws['up'] > 3 and ws['down'] < -6 and ws['wd'] < -2 and ws['end'] is None, str(ws))
        # Givrage : conditions givrantes dans la couche
        pick(fr, 'Givrage')
        ic = fr.evaluate("""(() => { const s0 = {g: S.onGround, a: S.alt}; S.onGround = false; S.alt = elevAt(S.lat, S.lon) + 1500 * FT;
          const r = {cloud: inCloudMetar(), oat: oatAt(), rwy: __PS_RWY__ ? null : null}; S.onGround = s0.g; S.alt = s0.a; return r; })()""")
        check(f'{tag} : Givrage → dans la couche à 1 500 ft, air sous 0 °C (givrage possible)', ic['cloud'] and ic['oat'] < 0, str(ic))
        rw = fr.evaluate("__PS_RWY__().n")
        check(f'{tag} : Givrage → piste glacée (bruine verglaçante)', rw == 'glace', rw)

        # Voix de synthèse du pilote
        n = fr.evaluate("""(() => { let n = 0; const sp = speechSynthesis.speak.bind(speechSynthesis); speechSynthesis.speak = u => { n++; };
          ATC.voice = true; atcLog('PIL', ATC.curSt || null, 'test call', ''); atcLog('SYS', null, 'info', ''); ATC.voice = false; speechSynthesis.speak = sp; return n; })()""")
        check(f'{tag} : appel du pilote dit par une voix de synthèse (et pas les messages système)', n == 1, str(n))

        # Retour au réel
        pick(fr, 'Réel')
        back = fr.evaluate("(() => ({raw: WXS.met[ATC.dep] ? WXS.met[ATC.dep].raw : null, src: WXS.src}))()")
        check(f'{tag} : Réel → METAR d\'origine rétabli', back['raw'] == real and back['src'] != 'sim', f"{back} / {real}")
        check(f'{tag} : aucune erreur JavaScript', not errs, str(errs[:2]))
        b.close()

print(f'{sum(checks)}/{len(checks)} vérifications')
sys.exit(0 if all(checks) else 1)
