# plane-simulator — PLANE TRAJECTORIES Pro

FATS Pro — Flight and Trajectories Simulator | Symfony, React, TypeScript & Three.js

Version Pro du simulateur [PLANE TRAJECTORIES](https://github.com/JD-Dimitri/plane-trajectories-simulator) : former un élève
de zéro jusqu'à la licence de pilote, et au-delà. La version gratuite (fichier HTML unique) continue d'exister sans régression.

## État : fondations (étape 1)

| Partie | État |
|---|---|
| Structure du dépôt | ✔ `frontend/`, `backend/`, `data/`, `legacy/`, `tools/`, `tests/`, `docs/` |
| Données en JSON | ✔ 14 fichiers extraits du moteur V10.42.1 par `tools/extract_data.py` (aucune saisie à la main) |
| Interface React + Three.js | ✔ accueil, simulateur, cours (76 modules + QCM), appareils en 3D, missions, aéroports |
| Simulateur jouable | ✔ le moteur d'origine tourne tel quel dans l'onglet « Simulateur » ; ses modules sont portés un par un (`docs/MIGRATION.md`) |
| Moteur TypeScript | ✔ géographie et atmosphère portées : résultats identiques à l'original (`tests/parity_engine.py`) |
| API Symfony | ◐ données servies sur `/api/data/{nom}` ; code écrit, **pas encore installé ni exécuté** (voir plus bas) |
| Comptes, connexion, mot de passe oublié, PDF | à venir (étape 2) |
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
php -S localhost:8000 -t public   # ou symfony serve
php bin/phpunit                  # tests de l'API
```

> L'API a été écrite dans un environnement sans accès à Packagist : `composer install` et ses tests n'y ont pas été
> exécutés. Ils doivent l'être une première fois sur un poste ou un hébergement connecté.

## Tests

```bash
python3 tools/extract_data.py      # régénère data/*.json depuis legacy/
python3 tests/parity_engine.py     # moteur TypeScript = moteur d'origine (14 fonctions)
python3 tests/e2e_front.py         # interface React, ordinateur et téléphone (36 vérifications)
```

Les tests utilisent Playwright (Python) et Chromium.

## Règles du projet

- Aucune donnée inventée présentée comme réelle ; statuts [RÉFÉRENCÉ] / [OFFICIEL] / [CALCULÉ] / [ESTIMÉ] / [SIMULÉ] / [INCONNU].
- Aucune voix d'équipage réelle fabriquée ; Germanwings 9525 n'est pas reproduit en crash.
- Les données aéronautiques de l'A350, les fréquences radio et les procédures d'approche ne changent pas sans validation de l'auteur.
- Simulateur pédagogique : ne pas utiliser pour la navigation réelle.
