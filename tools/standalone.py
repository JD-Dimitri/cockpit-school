"""Version autonome de l'interface Pro : un seul fichier HTML, utilisable hors ligne.

Intègre dans frontend/dist/index.html :
- la feuille de style et le code (app.css, app.js, three.js compris) ;
- les données data/*.json (window.__PT_DATA__) ;
- le moteur d'origine legacy/plane-trajectories.html, avec three.js r128 intégré à la place du CDN (window.__PT_LEGACY__) ;
- le mode « démonstration hors ligne » (window.__PT_DEMO__) : sans serveur, aucune connexion n'est possible ;
  ce fichier sert aux essais de l'auteur et ne doit pas être publié sur le site (en ligne, tout passe par la connexion).

Usage : python3 tools/standalone.py SORTIE.html [--three CHEMIN_three.min.js]
À lancer après « node frontend/build.mjs ».
"""
import json, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / 'frontend/dist'
CDN_TAG = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'

def arg(name, default=None):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default

def js_string(s: str) -> str:
    # Chaîne JS sûre dans une balise <script> : « </ » et « <!-- » ne doivent pas apparaître tels quels.
    return json.dumps(s, ensure_ascii=False).replace('</', '<\\/').replace('<!--', '<\\!--')

def main():
    out = pathlib.Path(sys.argv[1])
    three = pathlib.Path(arg('--three', str(ROOT.parent / 'plane-trajectories-simulator/tests/node_modules/three/build/three.min.js')))
    html = (DIST / 'index.html').read_text(encoding='utf-8')
    css = (DIST / 'app.css').read_text(encoding='utf-8')
    app = (DIST / 'app.js').read_text(encoding='utf-8')
    app = app.split('\n//# sourceMappingURL=')[0]
    data = {p.stem: json.loads(p.read_text(encoding='utf-8')) for p in sorted((ROOT / 'data').glob('*.json'))}
    legacy = (ROOT / 'legacy/plane-trajectories.html').read_text(encoding='utf-8')
    if CDN_TAG not in legacy:
        sys.exit('Balise three.js du CDN introuvable dans legacy/ : version autonome non construite.')
    legacy = legacy.replace(CDN_TAG, '<script>' + three.read_text(encoding='utf-8').replace('</script', '<\\/script') + '</script>')

    html = html.replace('<link rel="stylesheet" href="app.css">', '<style>\n' + css + '\n</style>')
    boot = ('<script>window.__PT_DATA__=' + js_string(json.dumps(data, ensure_ascii=False)) + ';'
            'window.__PT_DATA__=JSON.parse(window.__PT_DATA__);'
            'window.__PT_LEGACY__=' + js_string(legacy) + ';'
            # pas de serveur, donc pas de connexion possible : version de démonstration (bandeau), pour les essais de l'auteur
            'window.__PT_DEMO__=true;</script>\n')
    html = html.replace('<script type="module" src="app.js"></script>',
                        boot + '<script type="module">' + app.replace('</script', '<\\/script') + '</script>')
    out.write_text(html, encoding='utf-8')
    print(f'{out} : {out.stat().st_size / 1e6:.2f} Mo')

if __name__ == '__main__':
    main()
