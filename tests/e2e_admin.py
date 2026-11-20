"""Espace administrateur (20/11) : lien « Admin » et documentation « Comment ce projet a été réalisé ? ».

Élève connecté : pas de lien, #/admin → « réservé aux administrateurs » (le serveur répond 403).
Administrateur : lien dans le menu, documentation complète (17 parties, sommaire qui défile), ordinateur et téléphone.
Version autonome (démonstration de l'auteur) : documentation intégrée au fichier. Le texte n'est jamais dans app.js.
"""
import os, pathlib, sys
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from serveur_simule import serveur

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = os.environ.get('FRONT_URL', 'http://localhost:8766/')
AUTONOME = URL.startswith('file:')
checks = []
def check(name, cond, detail=''):
    checks.append(bool(cond)); print(('✔ ' if cond else '✘ ') + name + (f' — {detail}' if detail and not cond else ''))

with sync_playwright() as p:
    b = p.chromium.launch()
    if not AUTONOME:
        app = (ROOT / 'frontend/dist/app.js').read_text(encoding='utf-8')
        check('le texte de la documentation n\'est pas dans le code de l\'interface (servi par l\'API seulement)', 'Le volet entrepreneurial' not in app)
        c = b.new_context(viewport={'width': 1280, 'height': 800}); serveur(c, admin=False); pg = c.new_page()
        pg.goto(URL + '#/parcours'); pg.wait_for_selector('.top nav a')
        check('élève : pas de lien « Admin » dans le menu', pg.locator('.top nav a[href="#/admin"]').count() == 0)
        pg.goto(URL + '#/admin'); pg.wait_for_timeout(800)
        check('élève : #/admin → « Espace réservé aux administrateurs »', 'réservé aux administrateurs' in pg.locator('main').inner_text())
        c.close()
    for w, h in ((1280, 800), (390, 844)):
        c = b.new_context(viewport={'width': w, 'height': h})
        if not AUTONOME: serveur(c, admin=True)
        pg = c.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL + '#/parcours'); pg.wait_for_selector('.top nav a')
        tag = 'autonome' if AUTONOME else 'administrateur'
        link = pg.locator('.top nav a[href="#/admin"]')
        check(f'{tag} ({w} px) : lien « Admin » dans le menu', link.count() == 1)
        link.click(); pg.wait_for_selector('.admin-doc h1')
        t = pg.locator('.admin-doc h1').inner_text(); n = pg.locator('.admin-doc h2').count()
        check(f'{tag} ({w} px) : documentation « Comment ce projet a été réalisé ? », 17 parties', t == 'Comment ce projet a été réalisé ?' and n == 17, f'{t} / {n}')
        txt = pg.locator('.admin-doc').inner_text()
        check(f'{tag} ({w} px) : 3D expliquée (scène, caméra, boucle de rendu), volet entrepreneurial, commande admin',
              all(k in txt for k in ('Scène', 'Caméra', 'requestAnimationFrame', 'Le volet entrepreneurial', 'app:admin:create')))
        y0 = pg.evaluate('scrollY'); pg.locator('.admin-doc .toc a', has_text='Glossaire').click(); pg.wait_for_timeout(900)
        check(f'{tag} ({w} px) : le sommaire fait défiler jusqu\'à la partie, l\'adresse reste #/admin', pg.evaluate('scrollY') > y0 + 500 and pg.evaluate('location.hash') == '#/admin')
        over = pg.evaluate('document.documentElement.scrollWidth - innerWidth')
        check(f'{tag} ({w} px) : pas de défilement horizontal de la page', over <= 1, str(over))
        check(f'{tag} ({w} px) : aucune erreur JavaScript', not errs, str(errs[:2]))
        c.close()
    b.close()

print(f'{sum(checks)}/{len(checks)} vérifications')
sys.exit(0 if all(checks) else 1)
