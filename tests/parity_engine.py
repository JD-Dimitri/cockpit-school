"""Parité du moteur porté (frontend/src/engine, TypeScript) avec le moteur d'origine.

Le module TypeScript est compilé avec esbuild puis chargé DANS la page du moteur d'origine :
les deux versions de chaque fonction sont appelées sur les mêmes entrées et doivent donner
exactement le même résultat (écart relatif ≤ 1e-12).
"""
import json, os, pathlib, subprocess, sys, itertools
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

pts = [(40.6398, -73.7789), (49.0097, 2.5479), (-20.8871, 55.5103), (48.7233, 2.3794), (0, 0), (-33.9, 151.2), (64.1, -21.9)]
alts = [-300, 0, 500, 3048, 8000, 10999, 11000, 11001, 12500, 15000]
speeds = [30, 80, 150, 230, 260]
cases = {
    'gcKm': [list(a + b) for a, b in itertools.permutations(pts, 2)],
    'brg': [list(a + b) for a, b in itertools.permutations(pts, 2)],
    'gcFrac': [list(a + b) + [f] for a, b in itertools.combinations(pts, 2) for f in (0, .25, .5, .9, 1)],
    'offsetLL': [list(a) + [dn, de] for a in pts for dn, de in ((1000, 0), (0, 1000), (-5000, 2500))],
    'ecef': [list(a) + [h] for a in pts for h in (0, 11000)],
    'enuBasis': [list(a) for a in pts],
    'isaT': [[h] for h in alts], 'isaP': [[h] for h in alts], 'isaRho': [[h] for h in alts], 'sos': [[h] for h in alts],
    'casFromTas': [[v, h] for v in speeds for h in alts],
    'tasFromCas': [[v, h] for v in speeds for h in alts],
    'wrap360': [[a] for a in (-725, -1, 0, 359.9, 360, 1081)],
    'wrapPi': [[a] for a in (-7, -3.2, 0, 3.2, 9)],
}

JS = r'''([cases]) => {
  const flat = v => Array.isArray(v) ? v.flat(Infinity) : (v && typeof v === 'object') ? Object.values(v).flat(Infinity) : [v];
  const legacy = { gcKm, brg, gcFrac, offsetLL, ecef, enuBasis, isaT, isaP, isaRho, sos, casFromTas, tasFromCas, wrap360, wrapPi };
  const res = {};
  for (const [fn, list] of Object.entries(cases)) {
    let worst = 0, n = 0;
    for (const args of list) {
      const a = flat(legacy[fn](...args)), b = flat(PRO[fn](...args));
      if (a.length !== b.length) { worst = Infinity; continue; }
      a.forEach((x, i) => { const d = Math.abs(x - b[i]) / Math.max(1, Math.abs(x)); if (!(d <= worst)) worst = d; n++; });
    }
    res[fn] = [n, worst];
  }
  return res;
}'''

with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page()
    pg.route(CDN, lambda r: r.fulfill(path=THREE, content_type='application/javascript'))
    pg.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
    pg.route('https://legacy.local/', lambda r: r.fulfill(body=LEGACY, content_type='text/html'))
    pg.goto('https://legacy.local/')
    pg.wait_for_timeout(1500)
    pg.add_script_tag(path=str(bundle))
    res = pg.evaluate(JS, [cases])
    b.close()

ok = 0
for fn, (n, worst) in res.items():
    good = worst <= 1e-12
    ok += good
    print(f"{'✔' if good else '✘'} {fn:11s} {n:4d} valeurs comparées, écart relatif max {worst:.1e}")
print(f'{ok}/{len(res)} fonctions identiques au moteur d\'origine')
sys.exit(0 if ok == len(res) else 1)
