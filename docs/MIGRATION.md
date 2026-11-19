# Migration du moteur d'origine vers le moteur Pro

Source : `legacy/plane-trajectories.html` (V10.42.1). Un module est « porté » quand sa version TypeScript donne
les mêmes résultats que l'original sur un jeu d'entrées (test de parité) et qu'il est utilisé par l'interface React.

## Données (JSON)

| Fichier | Contenu | Entrées |
|---|---|---|
| `aircraft.json` | appareils (masse, aérodynamique, vitesses, volets, dimensions) | 8 |
| `airports.json` | aéroports et extrémités de pistes | 8 |
| `missions.json` | missions, positions de départ calculées, routes | 35 |
| `relief.json` | reliefs simplifiés | 22 |
| `stations.json` | stations radio (fréquences et sources) | 42 |
| `atc-sectors.json` | enchaînement des stations par aéroport | 4 |
| `metar-samples.json` | relevés METAR réels enregistrés | 5 |
| `failures.json` | pannes | 45 |
| `scenarios.json` | scénarios | 45 |
| `scenarios-not-reproduced.json` | cas volontairement non reproduits | 2 |
| `references.json` | références documentaires | 8 |
| `qcm-themes.json` | thèmes de QCM | 22 |
| `academy.json` | cours de l'Académie (9 parties, 76 modules, QCM) | 9 |
| `glossary.json` | sigles | 158 |

Pas encore extraits : étapes des parcours (générées par des fonctions selon l'appareil), panneaux du poste (OVH, PED),
réseaux de roulage, textures du globe.

## Moteur

| Module d'origine | Module Pro | État |
|---|---|---|
| géographie (`gcKm`, `brg`, `gcFrac`, `offsetLL`, `ecef`, `enuBasis`, `wrap360`, `wrapPi`) | `engine/geo.ts` | ✔ identique (test de parité) |
| atmosphère et vitesses (`isaT`, `isaP`, `isaRho`, `sos`, `casFromTas`, `tasFromCas`) | `engine/atmosphere.ts` | ✔ identique (test de parité) |
| physique du vol (`fwStep`, `rwStep`, `move` de `base.html`, train fixe du 172 de `c172.js`) | `engine/flight.ts` | ✔ identique (test de parité : 12 vols, 20/20) ; utilisée par le banc de décollage de la page Appareils (`engine/bench.ts`) |
| collisions avec les objets (`physics.js`) | `engine/collisions.ts` | à faire |
| systèmes (électricité, hydraulique, carburant, APU) | `engine/systems/` | à faire |
| pilote automatique et FMS | `engine/autopilot.ts` | à faire |
| contrôle aérien et radio | `engine/atc.ts` | à faire (fréquences : validation de l'auteur) |
| météo | `engine/weather.ts` | à faire |
| rendu 3D (terrain, aéroports, appareils, poste) | `three/` | à faire (visionneuse d'appareils seulement) |
| instruments (PFD, ND, ECAM) | `instruments/` | à faire |
| parcours guidés, check-lists, examens | `pages/` + `engine/` | à faire |
| actions des cours (`act()` de `acad.js`) | `pages/Simulator.tsx` (`runAction`) | ✔ reprises : atelier, modes, dossier de vol, documents |

### Physique du vol : ce qui reste fourni par le moteur d'origine

`flight.ts` reçoit par `FlightEnv` les fonctions pas encore portées : relief (`elevAt`), vent et rafales, givrage,
freins, hydraulique et auto-frein, ILS, plan de vol, loi de pilotage selon l'hydraulique, crash et amerrissage, messages.
Le test `tests/parity_flight.py` les prend dans le moteur d'origine pour les deux versions : il vérifie les équations du vol,
pas ces modules, qui auront leur propre test de parité une fois portés. Douze vols sont rejoués pas à pas (0,02 s) :
décollage, virage et protections de la loi normale, approche ILS automatique jusqu'à l'arrêt, croisière NAV, descente
avec protection VMO, décrochage, décollage du Cessna 172, deux crashs, hélicoptère (décollage, AFCS et panne moteur,
autorotation). Écart : 0 sur environ 740 000 valeurs comparées, mêmes messages.

## Chantiers reportés au GO PRO (décision du 18/11/2026)

F32 vues réelles (branche `v10.43-paysage`), F30 intérieurs, F10 QCM à 30 questions, F27 données réelles, F18 atelier A350,
F9 suite (anomalies), modification 13, F33 vraies cartes, F35 poste photoréaliste, F21 radio / audio / météo,
F23 connexion et PDF.
