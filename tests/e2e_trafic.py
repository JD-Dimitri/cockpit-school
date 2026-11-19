"""Trafic réel côté interface (#/trafic), sur ordinateur et téléphone.

Le serveur Symfony ne tourne pas ici (Packagist inaccessible) : ses réponses sont SIMULÉES par le test, au format exact
de TrafficController (exemples fictifs). Le serveur lui-même est testé par PHPUnit (backend/tests) et, sans composer,
par tests/traffic_normalize.php. Version autonome (FRONT_URL=file://…) : message clair, sans appel réseau.
"""
import json, os, pathlib, sys, time
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from serveur_simule import serveur

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = os.environ.get('FRONT_URL', 'http://localhost:8766/')
OUT = ROOT / 'tests/out'; OUT.mkdir(exist_ok=True)
checks = []
def check(name, cond, detail=''):
    checks.append(bool(cond)); print(('✔ ' if cond else '✘ ') + name + (f' — {detail}' if detail and not cond else ''))

now = time.time()
def reponse(q):
    return {'heure': now, 'zone': q, 'statut': 'OBSERVÉ',
            'sources': {'recepteur': {'etat': 'ok', 'appareils': 2}, 'opensky': {'etat': 'non configurée'}, 'fr24': {'etat': 'erreur', 'message': 'Flightradar24 : clé refusée.'}},
            'appareils': [
                {'id': 'aa0002', 'indicatif': 'TEST02', 'immat': None, 'type': None, 'lat': 49.0097, 'lon': 2.5479, 'altFt': 0, 'solKt': 12, 'route': 90, 'vsFtMin': None, 'auSol': True, 'squawk': None, 'depart': None, 'arrivee': None, 't': now - 3, 'source': 'recepteur', 'statut': 'OBSERVÉ'},
                {'id': 'aa0001', 'indicatif': 'TEST01', 'immat': 'F-TEST', 'type': 'A320', 'lat': 48.95, 'lon': 2.40, 'altFt': 34000, 'solKt': 452.3, 'route': 285.1, 'vsFtMin': -64, 'auSol': False, 'squawk': '1000', 'depart': 'LFPG', 'arrivee': 'FMEE', 't': now - 1, 'source': 'recepteur', 'statut': 'OBSERVÉ'}]}

served = not URL.startswith('file:')
with sync_playwright() as p:
    for W, H, tag in ((1280, 800, 'pc'), (390, 844, 'tel')):
        b = p.chromium.launch(); ctx = b.new_context(viewport={'width': W, 'height': H})
        ctx.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
        calls = []
        if served:
            serveur(ctx)   # élève connecté (F41)
            def trafic(r):
                from urllib.parse import urlparse, parse_qs
                q = {k: float(v[0]) for k, v in parse_qs(urlparse(r.request.url).query).items()}
                calls.append(q); r.fulfill(json=reponse(q))
            ctx.route('**/api/trafic?**', trafic)
        pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL + '#/trafic'); pg.wait_for_selector('h1')
        check(f'[{tag}] page « Trafic réel »', pg.inner_text('h1') == 'Trafic réel')
        check(f'[{tag}] onglets : 6 aéroports du projet (hélistations KJRB et JFKH exclues)', pg.locator('.tabs a').count() == 6, str(pg.locator('.tabs a').count()))
        if served:
            pg.wait_for_selector('table.tgrid tbody tr')
            z = calls[0]
            check(f'[{tag}] zone demandée autour de Paris-CDG (±1,5° / ±2°)', abs(z['latmin'] - (49.0097 - 1.5)) < 0.01 and abs(z['lonmax'] - (2.5479 + 2)) < 0.01, str(z))
            src = pg.inner_text('.srcs')
            check(f'[{tag}] état de chaque source affiché', '2 appareil(s)' in src and 'non configurée' in src and 'clé refusée' in src, src)
            rows = pg.locator('table.tgrid tbody tr')
            check(f'[{tag}] appareils triés du plus proche au plus loin', rows.nth(0).inner_text().startswith('TEST02'))
            r2 = rows.nth(1).inner_text()
            check(f'[{tag}] ligne complète (type, altitude, vitesse, route, départ → arrivée)', all(x in r2 for x in ('A320 · F-TEST', '34', '452', '285', 'LFPG → FMEE')), r2)
            check(f'[{tag}] au sol affiché', 'au sol' in rows.nth(0).inner_text())
            n0 = len(calls); pg.wait_for_timeout(5600)
            check(f'[{tag}] mise à jour toutes les 5 s', len(calls) > n0, f'{n0} → {len(calls)}')
            pg.click('.tabs a[href="#/trafic/FMEE"]'); pg.wait_for_timeout(600)
            check(f'[{tag}] changement d\'aéroport : zone de La Réunion', abs(calls[-1]['latmin'] - (-20.8871 - 1.5)) < 0.05, str(calls[-1]))
            sw = pg.evaluate('document.documentElement.scrollWidth')
            check(f'[{tag}] pas de défilement horizontal de la page (tableau défilant à part)', sw <= W, str(sw))
            pg.screenshot(path=str(OUT / f'pro_trafic_{tag}.png'), full_page=True)
        else:
            pg.wait_for_selector('.notice')
            check(f'[{tag}] version autonome : message « serveur pas joignable »', 'pas joignable' in pg.inner_text('.notice'))
        check(f'[{tag}] aucune erreur JavaScript', not errs, '; '.join(errs[:3]))
        b.close()
print(f'{sum(checks)}/{len(checks)} vérifications')
sys.exit(0 if all(checks) else 1)
