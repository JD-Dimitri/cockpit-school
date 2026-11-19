"""Extraction des données du simulateur existant vers data/*.json.

Le moteur d'origine (legacy/plane-trajectories.html, V10.42.1) est chargé dans
Chromium ; ses objets de données sont lus tels qu'ils existent à l'exécution,
puis écrits en JSON. Aucune valeur n'est saisie à la main : le JSON est une
copie fidèle de ce que le simulateur utilise réellement.

Usage : python3 tools/extract_data.py [--three CHEMIN_three.min.js]
three.js r128 (le même fichier que la version CDN) est servi localement quand
le réseau n'atteint pas cdnjs.
"""
import json, pathlib, sys, datetime
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
LEGACY = ROOT / 'legacy' / 'plane-trajectories.html'
OUT = ROOT / 'data'
CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'

def arg(name, default=None):
    if name in sys.argv:
        return sys.argv[sys.argv.index(name) + 1]
    return default

THREE = arg('--three', str(ROOT.parent / 'plane-trajectories-simulator/tests/node_modules/three/build/three.min.js'))

# Sérialiseur exécuté dans la page : fonctions retirées, cycles et objets DOM / Three ignorés.
SER = r'''
(names) => {
  const seen = new WeakSet();
  const clean = (v, d) => {
    if (d > 12) return undefined;
    if (v === null) return null;
    const t = typeof v;
    if (t === 'function' || t === 'symbol' || t === 'undefined') return undefined;
    if (t === 'number') return Number.isFinite(v) ? v : null;
    if (t !== 'object') return v;
    if (typeof Node !== 'undefined' && v instanceof Node) return undefined;
    if (v.isObject3D || v.isMaterial || v.isTexture || v.isBufferGeometry) return undefined;
    if (seen.has(v)) return undefined;
    seen.add(v);
    if (Array.isArray(v)) return v.map(x => { const c = clean(x, d + 1); return c === undefined ? null : c; });
    if (v instanceof Set) return [...v].map(x => clean(x, d + 1));
    const o = {};
    for (const k of Object.keys(v)) { const c = clean(v[k], d + 1); if (c !== undefined) o[k] = c; }
    return o;
  };
  const out = {};
  for (const [file, expr] of names) {
    try { out[file] = clean((0, eval)(expr), 0); } catch (e) { out[file] = { __error: String(e) }; }
  }
  return out;
}
'''

# Missions : la position de départ est une fonction ; on l'évalue pour obtenir des coordonnées.
MISSIONS = r'''
(() => {
  const o = {};
  for (const [k, m] of Object.entries(MISSIONS)) {
    const c = {};
    for (const [f, v] of Object.entries(m)) if (typeof v !== 'function') c[f] = v;
    if (typeof m.start === 'function') { try { c.start = m.start(); } catch (e) { c.start = null; } }
    if (MI_AC[k]) c.aircraft = MI_AC[k];
    o[k] = c;
  }
  return o;
})()
'''

SETS = [
    ('aircraft', 'AC'),
    ('airports', 'APTS'),
    ('missions', MISSIONS),
    ('relief', 'RELIEF'),
    ('stations', 'STN'),
    ('atc-sectors', 'ATCK'),
    ('metar-samples', 'METAR_SAMPLES'),
    ('failures', 'FAILS'),
    ('scenarios', 'SCNS'),
    ('scenarios-not-reproduced', 'SCN_NOT'),
    ('references', 'REFS'),
    ('qcm-themes', 'QTH'),
    ('academy', 'ACAD.PARTS'),
    ('glossary', 'window.SIGLES'),
]

def main():
    html = LEGACY.read_text(encoding='utf-8')
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
        pg = b.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.route(CDN, lambda r: r.fulfill(path=THREE, content_type='application/javascript'))
        pg.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
        pg.route('https://legacy.local/', lambda r: r.fulfill(body=html, content_type='text/html'))
        pg.goto('https://legacy.local/')
        pg.wait_for_timeout(2500)
        data = pg.evaluate(SER, [[f, e] for f, e in SETS])
        ver = pg.evaluate('window.SIMVER')
        b.close()
    if errs:
        print('Erreurs JavaScript du moteur :', errs[:5])
    OUT.mkdir(exist_ok=True)
    index = {'source': 'legacy/plane-trajectories.html', 'engine': 'plane-trajectories-simulator V10.42.1 (main e45f229)',
             'simver': ver, 'extracted': datetime.date.today().isoformat(), 'files': {}}
    for name, val in data.items():
        if isinstance(val, dict) and '__error' in val:
            print(f'  {name}: ABSENT ({val["__error"][:80]})')
            continue
        path = OUT / f'{name}.json'
        path.write_text(json.dumps(val, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
        n = len(val) if hasattr(val, '__len__') else 1
        index['files'][name] = n
        print(f'  {name}: {n} entrées, {path.stat().st_size // 1024} Ko')
    (OUT / 'index.json').write_text(json.dumps(index, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')

if __name__ == '__main__':
    main()
