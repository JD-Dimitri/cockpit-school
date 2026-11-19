"""Parité de la physique du vol (frontend/src/engine/flight.ts) avec le moteur d'origine (fwStep, rwStep).

Le module TypeScript est compilé avec esbuild puis chargé DANS la page du moteur d'origine.
Pour chaque scénario :
1. on prépare l'appareil, la mission et l'état de départ dans le moteur d'origine ;
2. on enregistre l'état complet (appareil, pilote automatique, freins, plan de vol) ;
3. on déroule N pas de 0,02 s avec le moteur d'origine, en notant l'état après chaque pas ;
4. on remet l'état enregistré et on déroule les mêmes pas avec le moteur Pro ;
5. les deux trajectoires doivent être identiques à chaque pas (écart relatif ≤ 1e-12, mêmes booléens, mêmes messages).

Les fonctions pas encore portées (relief, vent, ILS, freins, crash…) sont celles du moteur d'origine dans les deux cas :
le test vérifie les équations du vol, pas ces modules, qui auront leur propre test de parité une fois portés.
Le tout se déroule dans un seul appel JavaScript synchrone : la boucle d'animation de l'original ne peut pas s'intercaler.
"""
import json, os, pathlib, subprocess, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
LEGACY = (ROOT / 'legacy/plane-trajectories.html').read_text(encoding='utf-8')
CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
THREE = os.environ.get('THREE_PATH', str(ROOT.parent / 'plane-trajectories-simulator/tests/node_modules/three/build/three.min.js'))
ESBUILD = os.environ.get('ESBUILD_BIN', '/opt/npm-tools/node_modules/.bin/esbuild')
OUT = ROOT / 'tests/out'; OUT.mkdir(exist_ok=True)
bundle = OUT / 'engine.iife.js'
subprocess.run([ESBUILD, str(ROOT / 'frontend/src/engine/index.ts'), '--bundle', '--format=iife',
                '--global-name=PRO', '--outfile=' + str(bundle), '--log-level=warning'], check=True)

# setup : JavaScript exécuté dans le moteur d'origine ; ctl(i) : commandes au pas i (mêmes pour les deux moteurs).
SCEN = [
  dict(name='A320 · décollage JFK (pleine poussée, rotation, montée, AP + ATHR)', steps=6000,
       setup="selAC1('a320','full-fw'); S.thr=1;",
       ctl="if(i===100) S.brake=false; IN.pitch = (S.onGround && S.V>75) ? 0.6 : (i<2500?0.15:0); if(i===3000){ AP.on=true; AP.ath=true; AP.alt=5000; AP.spd=250; AP.lat='HDG'; AP.hdg=330; }"),
  dict(name='A320 · virage manuel, loi normale, manche arrière tenu (protections)', steps=4000,
       setup="selAC1('a320','full-fw'); air(1500, 140, 0);",
       ctl="IN.roll = i<800 ? 0.8 : (i<1600 ? -0.5 : 0); IN.pitch = i>1800&&i<3400 ? 1 : 0; IN.thrD = i<200 ? 0.5 : 0;"),
  dict(name='A320 · approche ILS automatique, arrondi, RETARD, toucher, freinage', steps=12000,
       setup="selAC1('a320','full-fw'); onFinal(14000, 140); AP.on=true; AP.ath=true; AP.appr=true; AP.spd=140; S.flap=4; S.gear=true; SYS.spdbrk='ARMED';",
       ctl="if(S.onGround){ S.brake = S.V>3; }"),
  dict(name='A350 · croisière NAV vers la destination, ATHR, palier', steps=5000,
       setup="selAC1('a350','a350-cdg-run'); air(9000, 230, 0); S.flap=0; S.gear=false; S.thr=0.7; AP.on=true; AP.ath=true; AP.alt=31000; AP.vs=2000; AP.spd=290; AP.lat='NAV';",
       ctl=""),
  dict(name='B777 · descente AP avec protection VMO', steps=4000,
       setup="selAC1('b777','af-run-cdg'); air(10000, 250, -2); S.flap=0; S.gear=false; S.thr=0.4; AP.on=true; AP.alt=4000; AP.vs=4000; AP.lat='HDG'; AP.hdg=40;",
       ctl=""),
  dict(name='Learjet 60 · décrochage manche arrière (loi directe)', steps=3000,
       setup="selAC1('lj60','full-fw'); air(2500, 110, 0); S.flap=0; S.gear=false; S.thr=0.2;",
       ctl="IN.pitch = i<2000 ? 1 : -0.3; IN.roll = i>2200 ? 0.3 : 0;"),
  dict(name='Cessna 172 · décollage Toussus (hélice, train fixe, parcours)', steps=5000,
       setup="selAC1('c172','c172-local'); S.thr=1;",
       ctl="IN.pitch = (S.onGround && S.V>27) ? 0.5 : (S.onGround?0:0.05);"),
  dict(name='A320 · toucher trop dur (crash « vitesse verticale excessive »)', steps=2500,
       setup="selAC1('a320','full-fw'); air(120, 75, -9); S.gear=true; S.flap=4; S.thr=0;",
       ctl=""),
  dict(name='A320 · posé train rentré (crash « train rentré »)', steps=2500,
       setup="selAC1('a320','full-fw'); onFinal(3000, 70); S.gear=false; S.flap=4; S.thr=0.25;",
       ctl="IN.pitch = 0;"),
  dict(name='H125 · décollage vertical, translation, virage', steps=5000,
       setup="selAC1('h125','full-rw');",
       ctl="IN.collD = i<300 ? 1 : (i<1200 ? 0.2 : 0); IN.pitch = i>1500&&i<3000 ? -0.4 : (i>=3000? -0.1:0); IN.roll = i>3500&&i<4200 ? 0.5 : 0; IN.yaw = i>4300&&i<4500 ? 0.4 : 0;"),
  dict(name='S-76 · bimoteur, AFCS et maintien d\'altitude, panne moteur', steps=5000,
       setup="selAC1('s76','full-rw'); airRw(600, 30); AP.on=true; AP.althold=true; AP.alt=1500;",
       ctl="IN.pitch = i<1500 ? -0.2 : 0; if(i===2500) S.eng[1]=false;"),
  dict(name='R44 · autorotation moteur coupé jusqu\'au sol', steps=6000,
       setup="selAC1('r44','full-rw'); airRw(300, 25); S.eng=[false,false]; S.coll=0.2;",
       ctl="IN.collD = i>4000 ? 0.8 : 0; IN.pitch = i>4200 ? 0.3 : -0.05;"),
]

HELPERS = r'''
window.selAC1 = (ac, mi) => { ACK = ac; A = AC[ac]; MI = MISSIONS[mi] || MISSIONS[A.kind==='fw'?'full-fw':'full-rw']; resetState(); crashed=null; paused=true; window.FPLN=null; };
window.air = (aglM, kt, gamDeg) => { S.onGround=false; S.alt=elevAt(S.lat,S.lon)+aglM; S.V=kt*KT; S.gam=gamDeg*D2R; S.th=S.gam+4*D2R; S.ph=0; S.thr=0.5; AP.gamHold=S.gam; };
window.airRw = (aglM, kt) => { S.onGround=false; S.alt=elevAt(S.lat,S.lon)+aglM; S.vn=kt*KT*Math.cos(S.psi); S.ve=kt*KT*Math.sin(S.psi); S.vu=0; S.V=kt*KT; S.coll=0.5; };
window.onFinal = (distM, kt) => { const r=rwStart(MI.dest,MI.destRw), crs=(r.hdg!=null?r.hdg:brg(r.lat,r.lon,r.lat2??r.lat,r.lon2??r.lon));
  const p=offsetLL(r.lat,r.lon,-distM*Math.cos(crs*D2R),-distM*Math.sin(crs*D2R)); S.lat=p[0]; S.lon=p[1]; S.psi=crs*D2R;
  S.onGround=false; S.alt=elevAt(r.lat,r.lon)+distM*Math.tan(3*D2R)+15; S.V=kt*KT; S.gam=-3*D2R; S.th=S.gam+3*D2R; S.ph=0; S.thr=0.45; AP.gamHold=S.gam; AP.hdg=crs; };
'''

JS = r'''([scen]) => {
  const env = {
    get mission(){ return !!MI; }, get airliner(){ return AL(); },
    elevAt: (la,lo) => elevAt(la,lo), ice: () => ICE.a, gust: () => GUST, windHead: () => windHead(), windNow: () => windNow(),
    windDrift: (t) => windDrift(t), brkEff: () => brkEff(), abrkTarget: (st) => abrkTarget(st), brakeHeat: (E) => brakeHeat(E),
    ilsDev: () => ilsDev(), law: (a) => lawNow(a), altInd: () => altInd('L'),
    navBearing: (la,lo) => (window.FPLN||MI.dest) ? (window.FPLN ? fplnHdg(la,lo) : brg(la,lo,APTS[MI.dest].lat,APTS[MI.dest].lon)) : null,
    nearRunway: (la,lo) => nearRunway(la,lo), water: (la,lo) => typeof waterAt==='function' && waterAt(la,lo),
    gearUnlocked: () => gearUnlocked(), speedbrakeArmed: () => SYS.spdbrk==='ARMED',
    flash: (m,c) => flash(m,c), crash: (vs,onRw,why) => { if(why) CRASH_WHY=why; crash(vs,onRw); }, ditch: (vs) => ditch(vs),
    afterStep: () => { if(ACK==='c172' && !(AUTO&&AUTO.on)) legStep1(); },
  };
  // messages du moteur d'origine, notés pour être comparés
  let LOG = [];
  const _flash = flash; window.flashLog = (m,c) => { LOG.push(m); return _flash(m,c); };
  const clone = (o) => o == null ? o : JSON.parse(JSON.stringify(o));
  const put = (dst, src) => { for (const k of Object.keys(dst)) delete dst[k]; Object.assign(dst, clone(src)); };
  const snapS = () => { const o = clone(S); o.__AP = clone(AP); o.__crashed = crashed ? crashed.why || 'crash' : null; return o; };
  const out = [];
  for (const sc of scen) {
    const r = { name: sc.name, steps: sc.steps };
    try {
      eval(sc.setup);
      const ctl = new Function('i', 'S', 'AP', 'IN', 'SYS', sc.ctl);
      const save = { S: clone(S), AP: clone(AP), BRX: clone(window.BRX||null), FPLN: clone(window.FPLN||null), SYS: clone(SYS), IN: clone(IN) };
      const restore = () => { put(S, save.S); put(AP, save.AP); if (window.BRX && save.BRX) put(BRX, save.BRX); window.FPLN = clone(save.FPLN); put(SYS, save.SYS);
        IN.pitch=IN.roll=IN.yaw=IN.thrD=IN.collD=0; IN.pad.thr=null; crashed=null; CRASH_WHY=''; LOG = []; };
      const run = (stepFn) => { restore(); const traj = [];
        for (let i = 0; i < sc.steps; i++) { ctl(i, S, AP, IN, SYS); if (crashed) break; stepFn(); traj.push(snapS()); }
        return { traj, log: LOG.slice() }; };
      // messages (flash) notés pendant chaque déroulé, pour les deux moteurs
      const legacy = run(() => { const f = window.flash; window.flash = flashLog; try { fwOrRw(); } finally { window.flash = f; } });
      const ac = Object.assign({}, A, { fixedGear: ACK === 'c172' });
      const ctx = { ac, st: S, ap: AP, input: IN, env };
      const pro = run(() => { const f = window.flash; window.flash = flashLog; try { (A.kind==='fw' ? PRO.fwStep : PRO.rwStep)(ctx, 0.02); } finally { window.flash = f; } });
      let worst = 0, n = 0, first = null;
      const L = Math.max(legacy.traj.length, pro.traj.length);
      if (legacy.traj.length !== pro.traj.length) first = `nombre de pas : ${legacy.traj.length} / ${pro.traj.length}`;
      for (let i = 0; i < Math.min(legacy.traj.length, pro.traj.length); i++) {
        const a = legacy.traj[i], b = pro.traj[i];
        const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
        for (const k of keys) {
          const x = a[k], y = b[k];
          if (typeof x === 'number' && typeof y === 'number') { const d = Math.abs(x - y) / Math.max(1, Math.abs(x)); n++; if (!(d <= worst)) worst = d; if (d > 1e-12 && !first) first = `pas ${i}, ${k} : ${x} / ${y}`; }
          else if (JSON.stringify(x) !== JSON.stringify(y)) { if (!first) first = `pas ${i}, ${k} : ${JSON.stringify(x)} / ${JSON.stringify(y)}`; worst = Infinity; }
        }
      }
      const last = legacy.traj[legacy.traj.length - 1] || {};
      Object.assign(r, { n, worst, first, len: legacy.traj.length, logL: legacy.log, logP: pro.log,
        end: { altFt: Math.round((last.alt - elevAt(last.lat, last.lon)) / FT), kt: Math.round((last.V || 0) / KT), onGround: last.onGround, stall: last.stall, crashed: last.__crashed } });
    } catch (e) { r.error = String(e && e.stack || e); }
    out.push(r);
  }
  return out;
}'''

# données : les champs utilisés par la physique dans data/aircraft.json doivent être ceux du moteur d'origine
FIELDS = ['kind','m','S','Tmax','CD0','k','CL0','CLa','CLmax','gearCD','Vr','Vmo','Mmo','law','flaps','prop','single','tw','CdA','twin','afcs']
DATA = json.loads((ROOT / 'data/aircraft.json').read_text(encoding='utf-8'))

with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page()
    pg.route(CDN, lambda r: r.fulfill(path=THREE, content_type='application/javascript'))
    pg.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
    pg.route('https://aviationweather.gov/**', lambda r: r.abort())
    pg.route('https://legacy.local/', lambda r: r.fulfill(body=LEGACY, content_type='text/html'))
    pg.goto('https://legacy.local/')
    pg.wait_for_timeout(2000)
    pg.add_script_tag(path=str(bundle))
    pg.add_script_tag(content=HELPERS)
    # fwOrRw : le pas de vol du moteur d'origine (fwStep, avec l'extension du Cessna 172) ; legStep1 : guidage du 172
    pg.add_script_tag(content="window.fwOrRw=()=>{ if(A.kind==='fw') fwStep(0.02); else rwStep(0.02); };")
    has_leg = pg.evaluate("typeof legStep==='function'")
    pg.add_script_tag(content="window.legStep1=()=>{ if(typeof legStep==='function') legStep(); };")
    legacy_ac = pg.evaluate(f"() => {{ const o={{}}; for (const k in AC) {{ o[k]={{}}; for (const f of {json.dumps(FIELDS)}) if (AC[k][f]!==undefined) o[k][f]=AC[k][f]; }} return o; }}")
    res = pg.evaluate(JS, [SCEN])
    b.close()

ok = total = 0
for k, fields in legacy_ac.items():
    mine = {f: DATA[k][f] for f in FIELDS if f in DATA.get(k, {})}
    good = mine == fields
    total += 1; ok += good
    print(f"{'✔' if good else '✘'} données {k:5s} : paramètres de vol identiques à l'original" + ('' if good else f" — {set(fields) ^ set(mine) or [f for f in fields if fields[f]!=mine.get(f)]}"))
for r in res:
    total += 1
    if r.get('error'):
        print(f"✘ {r['name']} — erreur : {r['error'][:400]}"); continue
    good = r['worst'] <= 1e-12 and not r['first'] and r['logL'] == r['logP'] and r['len'] > 0
    ok += good
    e = r['end']
    print(f"{'✔' if good else '✘'} {r['name']}\n    {r['len']} pas, {r['n']} valeurs comparées, écart max {r['worst']:.1e} · fin : {e['altFt']} ft sol, {e['kt']} kt"
          f"{', au sol' if e['onGround'] else ''}{', décroché' if e['stall'] else ''}{', crash : ' + e['crashed'] if e['crashed'] else ''}"
          f" · messages : {', '.join(r['logL'][:4]) or 'aucun'}" + (f"\n    PREMIER ÉCART : {r['first']}" if r['first'] else '') + ('' if r['logL']==r['logP'] else f"\n    messages Pro : {r['logP']}"))
print(f'{ok}/{total} vérifications')
sys.exit(0 if ok == total else 1)
