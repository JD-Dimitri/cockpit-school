"""Comptes et PDF côté interface (dist/ servi sur http://localhost:8766, sans serveur Symfony).

Vérifie, sur ordinateur et téléphone :
- l'œil du mot de passe (clic, clavier, aria-pressed, libellé, curseur gardé dans le champ) ;
- les contrôles des formulaires (connexion, inscription, mot de passe oublié, réinitialisation) ;
- le message honnête quand le serveur des comptes n'est pas joignable ;
- le PDF d'un module et d'une partie entière (QCM et corrigés, sans menu), produit par le moteur d'impression de Chromium.
Les échanges réels avec Symfony sont testés côté serveur (backend/tests, PHPUnit).
"""
import io, os, pathlib, sys
from playwright.sync_api import sync_playwright
from pypdf import PdfReader

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = os.environ.get('FRONT_URL', 'http://localhost:8766/')
CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
THREE = os.environ.get('THREE_PATH', str(ROOT.parent / 'plane-trajectories-simulator/tests/node_modules/three/build/three.min.js'))
OUT = ROOT / 'tests/out'; OUT.mkdir(exist_ok=True)
checks = []
def check(name, cond, detail=''):
    checks.append(bool(cond))
    print(('✔ ' if cond else '✘ ') + name + (f' — {detail}' if detail and not cond else ''))

with sync_playwright() as p:
    for W, H, tag in ((1280, 800, 'pc'), (390, 844, 'tel')):
        b = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
        ctx = b.new_context(viewport={'width': W, 'height': H})
        # three.js r128 (même fichier que le CDN) servi localement si le réseau n'atteint pas cdnjs
        ctx.route(CDN, lambda r: r.fulfill(path=THREE, content_type='application/javascript'))
        ctx.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
        pg = ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))

        # --- Connexion et œil
        pg.goto(URL + '#/connexion'); pg.wait_for_selector('form')
        check(f'[{tag}] lien « Connexion » dans le menu', pg.locator('nav a.acct').text_content().strip() == 'Connexion')
        pg.wait_for_selector('.notice')
        check(f'[{tag}] serveur absent : message clair et bouton désactivé',
              'pas joignable' in pg.inner_text('.notice') and pg.locator('button[type=submit]').is_disabled())
        pw = pg.locator('input[name=password]')
        eye = pg.locator('button.eye')
        check(f'[{tag}] mot de passe masqué au départ', pw.get_attribute('type') == 'password' and eye.get_attribute('aria-pressed') == 'false')
        check(f'[{tag}] œil : libellé « Afficher le mot de passe »', eye.get_attribute('aria-label') == 'Afficher le mot de passe')
        pw.fill('Vol2026secret')
        eye.click()
        check(f'[{tag}] œil cliqué : mot de passe visible', pw.get_attribute('type') == 'text' and eye.get_attribute('aria-pressed') == 'true')
        check(f'[{tag}] œil : libellé « Masquer le mot de passe »', eye.get_attribute('aria-label') == 'Masquer le mot de passe')
        check(f'[{tag}] œil : le curseur reste dans le champ', pg.evaluate('document.activeElement.name') == 'password')
        check(f'[{tag}] œil : la saisie est conservée', pw.input_value() == 'Vol2026secret')
        eye.focus(); pg.keyboard.press('Enter')
        check(f'[{tag}] œil au clavier (Entrée) : masqué de nouveau', pw.get_attribute('type') == 'password')
        eye.focus(); pg.keyboard.press('Space')
        check(f'[{tag}] œil au clavier (Espace) : visible', pw.get_attribute('type') == 'text')
        box = eye.bounding_box()
        check(f'[{tag}] œil : zone tactile ≥ 40 px', box and box['width'] >= 40 and box['height'] >= 40, str(box))
        check(f'[{tag}] champ e-mail : saisie automatique « username »', pg.locator('#login-email').get_attribute('autocomplete') == 'username')
        check(f'[{tag}] mot de passe : saisie automatique « current-password »', pw.get_attribute('autocomplete') == 'current-password')
        pg.screenshot(path=str(OUT / f'pro_connexion_{tag}.png'))
        pg.click('text=Mot de passe oublié ?')
        pg.wait_for_selector('#fg-email')
        check(f'[{tag}] lien « Mot de passe oublié ? » → page dédiée', 'Mot de passe oublié' in pg.inner_text('h1'))

        # --- Inscription : contrôles avant envoi
        pg.goto(URL + '#/inscription'); pg.wait_for_selector('#reg-name')
        pws = pg.locator('input[name=password]'); pw2 = pg.locator('input[name=password2]')
        check(f'[{tag}] inscription : deux yeux indépendants', pg.locator('button.eye').count() == 2)
        pws.fill('court')
        check(f'[{tag}] inscription : mot de passe trop court signalé', 'Au moins 10' in pg.inner_text('.form'))
        pws.fill('decollage2026'); pw2.fill('decollage2027')
        check(f'[{tag}] inscription : confirmation différente signalée', 'Différent du premier' in pg.inner_text('.form'))
        check(f'[{tag}] inscription : « new-password »', pws.get_attribute('autocomplete') == 'new-password')
        pg.locator('button.eye').first.click()
        check(f'[{tag}] inscription : le 1er œil n\'affiche que le 1er champ',
              pws.get_attribute('type') == 'text' and pw2.get_attribute('type') == 'password')

        # --- Réinitialisation
        pg.goto(URL + '#/reinitialiser'); pg.wait_for_selector('h1')
        check(f'[{tag}] réinitialisation sans jeton : « Lien incomplet »', 'Lien incomplet' in pg.inner_text('main'))
        pg.goto(URL + '#/reinitialiser/abc123'); pg.wait_for_selector('input[name=password]')
        check(f'[{tag}] réinitialisation avec jeton : formulaire', pg.locator('input[name=password]').count() == 1)

        # --- PDF
        pg.goto(URL + '#/cours/p1/avion'); pg.wait_for_selector('.titlebar .btn')
        check(f'[{tag}] cours : bouton « PDF du module »', 'PDF du module' in pg.locator('.titlebar').text_content())
        pg.evaluate('() => { window.print = () => { window.__printed = (window.__printed || 0) + 1 } }')  # remplace la fenêtre d'impression
        pg.click('.titlebar .btn')
        pg.wait_for_selector('.print .pmod'); pg.wait_for_timeout(700)
        check(f'[{tag}] PDF du module : version imprimable ouverte', '#/imprimer/p1/avion/auto' in pg.url)
        check(f'[{tag}] PDF du module : impression lancée', pg.evaluate('window.__printed') == 1)
        check(f'[{tag}] PDF du module : nom de fichier proposé', pg.title() == "PLANE SIMULATOR - L'avion et ses parties")
        if tag == 'pc':
            pdf = PdfReader(io.BytesIO(pg.pdf(format='A4', print_background=True)))
            text = '\n'.join(pg_.extract_text() for pg_ in pdf.pages)
            (OUT / 'pro_module.pdf').write_bytes(pg.pdf(format='A4', print_background=True))
            check('PDF module : titre et contenu', "L'avion et ses parties" in text and 'Corrigé' in text)
            check('PDF module : questions et corrigé', 'Exercices' in text and text.count('A.') >= 2)
            check('PDF module : pas de menu ni de bouton', 'APPAREILS' not in text and 'Enregistrer en PDF' not in text)
            pg.emulate_media(media='print'); pg.screenshot(path=str(OUT / 'pro_module_print.png'), full_page=False); pg.emulate_media(media='screen')
            pg.goto(URL + '#/imprimer/p1'); pg.wait_for_selector('.print .pmod'); pg.wait_for_timeout(500)
            n_mods = pg.locator('.pmod').count()
            pdf = PdfReader(io.BytesIO(pg.pdf(format='A4', print_background=True)))
            text = '\n'.join(pg_.extract_text() for pg_ in pdf.pages)
            check(f'PDF partie 1 : {n_mods} modules, une page par module au moins', len(pdf.pages) >= n_mods, f'{len(pdf.pages)} pages')
            check('PDF partie 1 : un corrigé par module avec QCM', text.count('Corrigé') == pg.locator('.corr').count(), f"{text.count('Corrigé')} / {pg.locator('.corr').count()}")
        # --- Boutons d'action des cours → simulateur directement sur l'action (comme l'Académie d'origine)
        for href, act, sel, label in (('#/cours/p5/ca0', 'sys:a320:start', '#sysat', "atelier des systèmes ouvert"),
                                      ('#/cours/p2/sim3', 'auto', '#acpick', "choix de l'appareil affiché"),
                                      ('#/cours/p9/L1', 'doc:fuel', '#docv', 'document « Bilan carburant » ouvert')):
            pg.goto(URL + href); pg.wait_for_selector(f'.body [data-act="{act}"], .body [data-docopen="{act[4:]}"]')
            pg.locator(f'.body [data-act="{act}"], .body [data-docopen="{act[4:]}"]').first.click()
            pg.wait_for_url('**#/simulateur/**')
            fr = pg.frame_locator('.sim iframe')
            try:
                fr.locator(sel).first.wait_for(state='visible', timeout=30000); ok = True
            except Exception:
                ok = False
            check(f'[{tag}] cours → {act} : {label}', ok)
        pg.goto(URL + '#/cours/p5/ca0'); pg.wait_for_selector('.body button')
        pg.goto(URL + '#/imprimer/p5/ca0'); pg.wait_for_selector('.pmod')
        pg.emulate_media(media='print')
        check(f'[{tag}] PDF : boutons d\'action masqués', pg.locator('.pmod .body button').first.is_hidden())
        pg.emulate_media(media='screen')

        pg.goto(URL + '#/cours'); pg.wait_for_selector('.titlebar .btn')
        check(f'[{tag}] liste des cours : un bouton PDF par partie', pg.locator('.titlebar .btn').count() == 9)
        sw = pg.evaluate('document.documentElement.scrollWidth')
        check(f'[{tag}] pas de défilement horizontal', sw <= W, f'{sw}')
        check(f'[{tag}] aucune erreur JavaScript', not errs, '; '.join(errs[:3]))
        b.close()

print(f'{sum(checks)}/{len(checks)} vérifications')
sys.exit(0 if all(checks) else 1)
