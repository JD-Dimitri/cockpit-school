# plane-simulator — PLANE SIMULATOR

FATS Pro — Flight and Trajectories Simulator | Symfony, React, TypeScript & Three.js

Version Pro du simulateur [PLANE TRAJECTORIES](https://github.com/JD-Dimitri/plane-trajectories-simulator) : former un élève
de zéro jusqu'à la licence de pilote, et au-delà. La version gratuite (fichier HTML unique) continue d'exister sans régression.

## État : étape 2 (comptes, connexion, PDF)

| Partie | État |
|---|---|
| Structure du dépôt | ✔ `frontend/`, `backend/`, `data/`, `legacy/`, `tools/`, `tests/`, `docs/` |
| Données en JSON | ✔ 14 fichiers extraits du moteur V10.42.1 par `tools/extract_data.py` (aucune saisie à la main) |
| Interface React + Three.js | ✔ accueil, simulateur, cours (76 modules + QCM), appareils en 3D, missions, aéroports |
| Parcours (F40) | ✔ parcours → fiches de choix de l'appareil avec vignette → fiche de présentation → « Valider le parcours avec cet appareil » → « Parcours commencé » → simulateur (même suite qu'avant) ; vignettes : illustrations générées fournies par l'auteur |
| Trafic réel | ✔ accueil des sources : récepteur ADS-B Raspberry Pi (`tools/recepteur/`), OpenSky Network, Flightradar24 ; page `#/trafic` ; aucune source active par défaut |
| Boutons d'action des cours | ✔ « Ouvrir l'atelier », « Lancer le mode… », documents : ouvrent le simulateur directement sur l'action |
| Simulateur jouable | ✔ le moteur d'origine tourne tel quel dans l'onglet « Simulateur » ; ses modules sont portés un par un (`docs/MIGRATION.md`) |
| Moteur TypeScript | ✔ géographie, atmosphère et physique du vol (avions et hélicoptères) portées : résultats identiques à l'original (`tests/parity_engine.py`, `tests/parity_flight.py`) |
| Comptes (interface) | ✔ connexion avec œil afficher / masquer, inscription, « Mot de passe oublié ? », nouveau mot de passe ; message clair si le serveur n'est pas joignable |
| PDF des cours et exercices | ✔ chaque module et chaque partie, QCM et corrigés : par le serveur (dompdf) ou, en secours, par l'impression du navigateur |
| API Symfony | ◐ données, comptes (hachage « auto », 5 tentatives / 15 min), réinitialisation (lien unique, 1 h), PDF ; code et tests écrits, **pas encore installés ni exécutés** (voir plus bas) |
| Hébergement o2switch | à venir |

## Lancer l'interface

```bash
cd frontend
npm install
npm run build          # → frontend/dist/
npx serve dist         # ou tout serveur statique
```

## Lancer l'API

```bash
cd backend
composer install
cp .env .env.local                       # puis renseigner APP_SECRET, DATABASE_URL, MAILER_DSN, MAILER_FROM, FRONT_URL
php bin/console doctrine:migrations:migrate   # MySQL / MariaDB (o2switch)
php -S localhost:8000 -t public          # ou symfony serve
vendor/bin/phpunit                       # tests de l'API (comptes, mot de passe, PDF, données)
```

Mise en ligne (o2switch) : le dossier `backend/public/` est la racine du site ; on y copie **seulement** `index.html`,
`app.js` et `app.css` de `frontend/dist/`. **Ne pas copier `legacy/` ni `data/`** : en ligne, le moteur du simulateur et
les données sont servis par l'API (`/api/moteur`, `/api/data/…`) aux seuls comptes connectés (F41). L'interface appelle
l'API sur le même domaine (`/api/...`). La version autonome (`tools/standalone.py`) est une démonstration hors ligne
pour les essais : elle contient tout, sans connexion, et ne doit pas être publiée sur le site.

Accès (F41) : sans compte, seuls l'accueil public, la connexion, l'inscription et « Mot de passe oublié ? » sont ouverts ;
le contrôle est fait par Symfony (`config/packages/security.yaml`, `access_control`), pas seulement par l'interface.

> L'API a été écrite dans un environnement sans accès à Packagist : `composer install` et ses tests n'y ont pas été
> exécutés. Ils doivent l'être une première fois sur un poste ou un hébergement connecté.

## Tests

```bash
python3 tools/extract_data.py      # régénère data/*.json depuis legacy/
python3 tests/parity_engine.py     # moteur TypeScript = moteur d'origine (14 fonctions)
python3 tests/parity_flight.py     # physique du vol = moteur d'origine (12 vols rejoués pas à pas, données des 8 appareils)
python3 tests/e2e_front.py         # interface React, ordinateur et téléphone (40 vérifications)
python3 tests/e2e_auth_pdf.py      # comptes, œil, PDF, boutons d'action des cours (69 vérifications)
python3 tests/e2e_acces.py         # accès : public hors connexion, tout après connexion (24 vérifications)
python3 tests/e2e_parcours.py      # parcours, choix de l'appareil, fiche, validation, lancement (32 vérifications)
python3 tests/e2e_trafic.py        # page Trafic réel (22 vérifications ; 8 en version autonome)
php tests/traffic_normalize.php    # trafic réel : conversion et fusion des sources, sans composer (27 vérifications)
python3 tools/standalone.py SORTIE.html   # version autonome (un seul fichier, hors ligne)
```

Les tests utilisent Playwright (Python) et Chromium.

## Règles du projet

- Aucune donnée inventée présentée comme réelle ; statuts [RÉFÉRENCÉ] / [OFFICIEL] / [CALCULÉ] / [ESTIMÉ] / [SIMULÉ] / [INCONNU].
- Aucune voix d'équipage réelle fabriquée ; Germanwings 9525 n'est pas reproduit en crash.
- Les données aéronautiques de l'A350, les fréquences radio et les procédures d'approche ne changent pas sans validation de l'auteur.
- Simulateur pédagogique : ne pas utiliser pour la navigation réelle.
