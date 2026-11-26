"""Serveur Symfony SIMULÉ pour les tests d'interface (Packagist inaccessible ici : le vrai serveur est testé par PHPUnit).

Réponses au format exact des contrôleurs : /api/health, /api/me, /api/login, /api/logout, /api/moteur, /api/data/<nom>, /api/admin/doc.
admin=True : le compte connecté est administrateur (ROLE_ADMIN).
connecte=True : un élève est connecté (F41 : tout est ouvert) ; False : personne (seules les pages publiques s'ouvrent).
Sans effet en version autonome (file://) : elle n'appelle jamais le serveur.
"""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
ELEVE = {'email': 'eleve@example.org', 'name': 'Élève test', 'admin': False}
ADMIN = {'email': 'admin@example.org', 'name': 'Admin test', 'admin': True}

def serveur(ctx, connecte=True, admin=False):
    etat = {'connecte': connecte}
    QUI = ADMIN if admin else ELEVE
    ctx.route('**/api/health', lambda r: r.fulfill(json={'status': 'ok'}))
    ctx.route('**/api/me', lambda r: r.fulfill(json=QUI) if etat['connecte'] else r.fulfill(status=401, json={'message': 'Non connecté.'}))
    def login(r):
        etat['connecte'] = True; r.fulfill(json=QUI)
    def logout(r):
        etat['connecte'] = False; r.fulfill(json={'message': 'Déconnecté.'})
    ctx.route('**/api/login', login)
    ctx.route('**/api/logout', logout)
    def moteur(r):
        if not etat['connecte']: return r.fulfill(status=401, json={'message': 'Connexion requise.'})
        r.fulfill(path=str(ROOT / 'legacy/plane-trajectories.html'), content_type='text/html; charset=UTF-8')
    ctx.route('**/api/moteur', moteur)
    def data(r):
        if not etat['connecte']: return r.fulfill(status=401, json={'message': 'Connexion requise.'})
        nom = r.request.url.split('/api/data/')[1].split('?')[0]
        f = ROOT / 'data' / (nom + '.json')
        r.fulfill(path=str(f), content_type='application/json') if f.exists() else r.fulfill(status=404, json={'message': 'Introuvable.'})
    ctx.route('**/api/data/*', data)
    def admin_doc(r):   # AdminController : 401 sans compte, 403 pour un élève (access_control ^/api/admin → ROLE_ADMIN)
        if not etat['connecte']: return r.fulfill(status=401, json={'message': 'Connexion requise.'})
        if not QUI['admin']: return r.fulfill(status=403, json={'message': 'Accès refusé.'})
        r.fulfill(json={'title': 'Comment ce projet a été réalisé ?', 'html': (ROOT / 'backend/content/admin/realisation.html').read_text(encoding='utf-8')})
    ctx.route('**/api/admin/doc', admin_doc)
    return etat
