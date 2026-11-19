# Architecture — PLANE SIMULATOR

## Vue d'ensemble

```
navigateur ──► frontend (React 19 + TypeScript + Three.js r128)
                 │  pages : accueil, simulateur, cours, appareils, missions, aéroports
                 │  moteur TypeScript (frontend/src/engine) — modules portés un par un
                 │  moteur d'origine (legacy/) dans l'onglet « Simulateur » pendant la migration
                 ▼
               données : data/*.json (aujourd'hui fichiers statiques)
                 ▲
backend (Symfony 7.4 LTS) : /api/data/{nom}, puis comptes, progression, PDF
```

## Dossiers

| Dossier | Rôle |
|---|---|
| `legacy/` | Copie du simulateur V10.42.1 (`plane-trajectories-simulator`, `main` = `36a18e3`, anciennement `e45f229` avant la réécriture de l'historique du 19/11/2026). Référence de comportement : le moteur Pro doit donner les mêmes résultats. |
| `data/` | Données extraites du moteur d'origine à l'exécution (`tools/extract_data.py`). `index.json` indique la source et la date. |
| `frontend/` | Interface React. Construction par esbuild (`build.mjs`). `src/data.ts` est le seul point d'accès aux données : passer à l'API Symfony ne change que la base d'URL. |
| `frontend/src/engine/` | Moteur TypeScript. Chaque fonction portée est vérifiée contre l'original. |
| `frontend/src/three/` | Rendu 3D (Three.js). |
| `backend/` | API Symfony. |
| `tests/` | Parité du moteur, parcours de bout en bout (Playwright). |

## Choix

- **Migration progressive plutôt que réécriture d'un bloc** : le moteur d'origine compte 1,46 Mo de code et 54 modules couplés
  par variables globales. Le réécrire d'un coup ferait perdre des fonctions. On le garde jouable et on porte module par module,
  chaque portage étant prouvé identique par un test.
- **Three.js r128** : la version utilisée par le moteur d'origine, pour un rendu identique pendant la migration. Montée de version
  prévue une fois le rendu porté.
- **Routage par ancre** (`#/cours/p1/avion`) : fonctionne chez o2switch sans réécriture d'URL côté serveur.
- **Contenu HTML des cours** nettoyé par DOMPurify avant affichage.
- **Symfony 7.4 LTS** : PHP ≥ 8.2, maintenu jusqu'en 2029.

## Licences des données

- Réseaux de roulage KJFK / LFPG : FlightGear groundnet (GPL), contenus dans `legacy/`.
- Textures du globe : Natural Earth (domaine public).
- Relevés METAR d'exemple : metarcentral.com (consultés le 13/11/2026), voir `data/metar-samples.json`.
