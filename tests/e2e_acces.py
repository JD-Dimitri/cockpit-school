"""F41 : sans compte, seuls l'accueil public et les pages du compte s'ouvrent ; après connexion, tout est accessible.

Serveur Symfony SIMULÉ (tests/serveur_simule.py) : le vrai contrôle d'accès est fait par Symfony
(access_control, testé par PHPUnit : DataControllerTest::testEverythingButAccountPagesNeedsLogin).
Version autonome (FRONT_URL=file://…) : « démonstration hors ligne », tout ouvert avec un bandeau.
"""
import os, pathlib, sys
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from serveur_simule import serveur

URL = os.environ.get('FRONT_URL', 'http://localhost:8766/')
OUT = pathlib.Path(__file__).resolve().parent / 'out'; OUT.mkdir(exist_ok=True)
checks = []
def check(name, cond, detail=''):
    checks.append(bool(cond)); print(('✔ ' if cond else '✘ ') + name + (f' — {detail}' if detail and not cond else ''))

RESERVE = ['parcours', 'simulateur', 'cours/p1/avion', 'appareils', 'missions', 'aeroports', 'trafic', 'imprimer/p1']
protected_req = lambda u: '/api/data/' in u or '/api/moteur' in u or '/data/' in u or '/legacy/' in u

with sync_playwright() as p:
    if URL.startswith('file:'):
        b = p.chromium.launch(); pg = b.new_page()
        pg.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
        pg.goto(URL + '#/parcours'); pg.wait_for_selector('.pcard')
        check('autonome : bandeau « démonstration hors ligne »', 'démonstration hors ligne' in pg.inner_text('.demo'))
        check('autonome : menu complet', pg.locator('header nav a').count() == 7)
        b.close()
    else:
        for W, H, tag in ((1280, 800, 'pc'), (390, 844, 'tel')):
            b = p.chromium.launch(); ctx = b.new_context(viewport={'width': W, 'height': H})
            ctx.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
            etat = serveur(ctx, connecte=False)
            pg = ctx.new_page(); reqs = []; errs = []
            pg.on('request', lambda r: reqs.append(r.url)); pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.goto(URL + '#/'); pg.wait_for_selector('.welcome')
            check(f'[{tag}] hors connexion : accueil public (présentation, sans simulateur)', 'Créer un compte' in pg.locator('.welcome .cta').text_content() and pg.locator('iframe').count() == 0)
            nav = [a.strip() for a in pg.locator('header nav a').all_text_contents()]
            check(f'[{tag}] hors connexion : menu réduit à « Créer un compte » et « Connexion »', nav == ['Créer un compte', 'Connexion'], str(nav))
            pg.screenshot(path=str(OUT / f'pro_accueil_public_{tag}.png'), full_page=True)
            for r in RESERVE:
                pg.goto(URL + '#/' + r); pg.wait_for_url('**#/connexion', timeout=5000)
                pg.wait_for_selector('#login-email')
            check(f'[{tag}] hors connexion : {len(RESERVE)} pages réservées → page de connexion', True)
            check(f'[{tag}] hors connexion : aucune donnée ni moteur demandés', not [u for u in reqs if protected_req(u)], str([u for u in reqs if protected_req(u)][:3]))
            pg.goto(URL + '#/mot-de-passe-oublie'); ok1 = pg.wait_for_selector('#fg-email') is not None
            pg.goto(URL + '#/inscription'); ok2 = pg.wait_for_selector('#reg-name') is not None
            check(f'[{tag}] mot de passe oublié et inscription restent ouverts', ok1 and ok2 and '#/inscription' in pg.url)
            # connexion → retour à la page demandée
            pg.goto(URL + '#/cours/p1/avion'); pg.wait_for_url('**#/connexion')
            pg.fill('#login-email', 'eleve@example.org'); pg.fill('input[name=password]', 'Vol2026secret'); pg.click('button[type=submit]')
            pg.wait_for_url('**#/cours/p1/avion'); pg.wait_for_selector('.titlebar')
            check(f'[{tag}] connexion → retour à la page demandée (cours p1)', "L'avion et ses parties" in pg.inner_text('main'))
            nav = [a.strip() for a in pg.locator('header nav a').all_text_contents()]
            check(f'[{tag}] connecté : menu complet et nom de l\'élève', len(nav) == 7 and nav[-1].endswith('Élève test'), str(nav))
            pg.goto(URL + '#/simulateur'); pg.wait_for_selector('.sim iframe')
            check(f'[{tag}] connecté : simulateur chargé depuis le serveur (/api/moteur)', pg.locator('.sim iframe').get_attribute('src') == 'api/moteur')
            pg.goto(URL + '#/'); pg.wait_for_selector('.page h1')
            check(f'[{tag}] connecté : accueil complet', pg.locator('.welcome').count() == 0)
            # déconnexion
            pg.goto(URL + '#/connexion'); pg.click('text=Se déconnecter'); pg.wait_for_selector('.welcome')
            pg.goto(URL + '#/missions'); pg.wait_for_url('**#/connexion')
            check(f'[{tag}] déconnexion : retour à l\'accueil public, pages de nouveau fermées', not etat['connecte'])
            check(f'[{tag}] aucune erreur JavaScript', not errs, '; '.join(errs[:2]))
            b.close()
        # sans serveur du tout : rien ne s'ouvre, message clair à la connexion
        b = p.chromium.launch(); pg = b.new_page(); reqs = []
        pg.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
        pg.on('request', lambda r: reqs.append(r.url))
        pg.goto(URL + '#/simulateur'); pg.wait_for_url('**#/connexion'); pg.wait_for_selector('.notice')
        check('sans serveur : simulateur fermé, « serveur pas joignable » à la connexion', 'pas joignable' in pg.inner_text('.notice'))
        check('sans serveur : aucune donnée ni moteur chargés', not [u for u in reqs if protected_req(u)])
        b.close()
print(f'{sum(checks)}/{len(checks)} vérifications')
sys.exit(0 if all(checks) else 1)
