# MAJ2-BIS — modifications et demandes RESTANT À FAIRE

**Règle** : MAJ2-BIS ne contient que ce qui n'est pas encore fait. Elle suit la même logique que `MAJ-BIS.md` (dont elle reprend la structure et la suite) : dès qu'une modification ou une demande « -> » est terminée et publiée, elle passe dans `MAJ-2.md` (qui contient tout : fait et à faire) et elle est retirée d'ici.
- **« -> vs »** (règle du 18/11/2026 15:41) : « donne-moi une version Standalone basée sur la dernière version du projet, prête à être visualisée ». Réponse : fichier autonome (three.js intégré, testé hors ligne sur ordinateur et téléphone) construit depuis la dernière version, même en cours.
- **« -> jp »** (règle du 18/11/2026 15:42) : « donne-moi une jauge de progression pour que je voie le niveau d'avancement ». Réponse : tableau d'avancement en français.
- **« -> c »** (règle du 18/11/2026 15:47) : « continue ».
- **« -> pcic »** (règle du 19/11/2026 18:46) : « prends en compte ce que j'ai dit et implémente, continue ».
- **« jlf »** (règle du 19/11/2026 18:58) : « continue, je te laisse finir ». Quand le travail est fini, répondre : « J'ai terminé, j'attends ton go pour la suite ».

**Base de travail (règle F7 du 18/11 10:38)** : toujours la version jointe (V10.36), enrichie par les modifications en cours ; on continue ainsi, sans changer de base.

**Règle F12 (18/11 11:07)** : tout ce qui est implémenté respecte l'existant et l'UX/UI (mêmes composants, styles, panneaux et boutons ; enrichir sans remplacer ; vérifié sur ordinateur et sur mobile).

**État au 19/11/2026 23:10** : **PLANE SIMULATOR** (`plane-simulator`, `main` = 9d453ec). Faits et testés : fondations, comptes et PDF (interface), physique du vol identique à l'original, trafic réel (accueil des sources, aucune active), F40 parcours, F41 accès réservé aux comptes, corrections C1 à C6, **Cours 0 complet (F43)**, **Cours II · Confirmé complet (F42 : 14 modules, 280 exercices, niveau ATPL)**, C7 et C8 (choix direct de l'appareil, accueil allégé), **F37 boutons radio (8 appareils, 112/112)**. API Symfony écrite, **à installer et tester une première fois** chez o2switch. **À faire** : F21 (radio en audio, météo complète) ; portage des modules encore fournis par l'original ; hébergement o2switch ; chantiers reportés (point 13) ; étude N722BD et F38 en attente des fichiers de l'auteur. **Décision de l'auteur (20/11 06:45)** : domaine **cockpitschool.com** (achat à faire par l'auteur).  **Décision (20/11 18:46)** : projet **COCKPIT SCHOOL - PLANE SIMULATOR**, dépôt **cockpit-school** (renommage GitHub par l'auteur). **Décisions attendues** : sources de trafic et licences (F39) ; nouvelles illustrations des appareils (ChatGPT).

## Modification 13 — Reprendre les points restés ouverts dans la discussion parallèle (V4 → V6) — à implémenter
- **Source** : bilan de l'autre discussion (12-17/11/2026), document de projet `plane-trajectories/BILAN_DISCUSSION_PARALLELE.md`.
- **Points restés ouverts, à faire** (par priorité) :
  1. **≈ 25 commandes de l'A320 sans effet** (inventaire automatique de la V6 : 50 sur 189, dont 25 branchées). Les brancher ou les documenter comme sans effet ; règle de parité : même traitement pour le 777.
  2. **US Airways 1549** : ajouter **Teterboro (KTEB)** comme aérodrome proposé par le contrôle (pistes réelles, AirNav), comme dans la réalité. Absent du code actuel.
  3. **Points discutables signalés par la V6** : température des freins après un décollage interrompu (330 °C, sans doute trop basse) ; bascule en loi alternée à basse vitesse dans le scénario US1549 ; durée d'alignement des centrales (≈ 10 min à JFK, ordre de grandeur non officiel, à garder marqué [ESTIMÉ]).
  4. **Radio** : VHF 2, interphone et annonces cabine signalés comme non modélisés en V6. Le code actuel les mentionne déjà dans `audio.js`, `brief.js` et `guard.js` : vérifier ce qui fonctionne vraiment et compléter.
  5. **École théorique ATPL** : format officiel vérifié (13 épreuves, 75 % requis, 4 tentatives par épreuve, 6 sessions, 18 mois). À construire sur le modèle de la partie 6 « Théorie PPL » de l'Académie : un module et un thème de QCM par épreuve, puis un examen blanc. Voir aussi `AUDIT_ATPL.md`.
  6. **Audio réaliste** et **page de procédures étape par étape** : le bouton « 📋 Procédures » existe déjà ; à compléter.
  7. **Étude N722BD** (Learjet 60, Greenacres, 1ᵉʳ nov. 2026), en attente de sources fiables : déclaration du père et faits sur le copilote (§5), vérification du message viral (§2.4), bâtiments réels de Greenacres (fichier OSM). **Ne rien inventer** : n'ajouter que des éléments sourcés.
     - **F38 (19/11 07:00)** : « Snapshots ÉTUDE N722BD -> 1 au décollage, 2 en début et fin de vol, 1 fin de vol ». Le simulateur n'a pas de vol N722BD (seulement la carte « sc-n722 », « à venir ») et la page d'origine de l'étude est introuvable. Captures à produire avec le Learjet 60 du simulateur, marquées [SIMULÉ] ; trajectoire réelle seulement si elle est sourcée ; aucune image d'accident ni de victimes (même règle que Germanwings 9525). **Précision de l'auteur (19/11 07:07)** : « J'ai travaillé sur Learjet dans un autre projet. Erreur de ma part mais je te donnerai les fichiers après » → en attente des fichiers de l'auteur ; rien à faire avant.
  8. **Pour la version Pro (GOPRO)** : vents réels (GRIB), relief réel (TAWS, reconstitution S-76B), coordination TCAS entre appareils, aérodynamique par configuration avec des données certifiées.
- **Règles de l'autre discussion à conserver** : statuts des données [RÉFÉRENCÉ] / [OFFICIEL] / [OBSERVÉ] / [CALCULÉ] / [ESTIMÉ] / [SIMULÉ] / [HYPOTHÈSE] / [INCONNU] ; aucune donnée inventée présentée comme réelle ; aucune voix d'équipage fabriquée ; Germanwings 9525 non reproduit en crash ; enrichir l'existant plutôt que reconstruire.

## Demandes « -> » restant à faire

### MET2 — Météo complète et lois physiques ; dangers moteurs au sol (20/11/2026 08:41)
- Scénarios : soleil, pluie, orage, foudre, tempête, ouragan, neige, brouillard.
- Comportements physiques et météorologiques exacts (densité de l'air selon la température et la pression, vent, rafales, cisaillement, turbulence, givrage, pluie, état de piste, visibilité, foudre) ; limites des appareils (vent traversier…) avec sources.
- Moteurs en marche : personne près de l'entrée d'air (aspiration) ou derrière (souffle, projection) → accident ; véhicule de piste près d'un moteur au démarrage → interdit, sinon accident. Zones de danger sourcées (documents constructeurs) ou [ESTIMÉ].

### TA2 — Tablette de documents à l'installation en poste, double contrôle pilote / copilote (20/11/2026 07:20)
- À l'installation dans le poste : écran de tablette (EFB) avec tous les documents en tuiles.
- Échange pilote / copilote pour le double contrôle (« cross-check »), avec les annonces des vraies procédures (« clear left », « clear right »…) : uniquement des procédures publiques et génériques, sources citées, voix de synthèse.

### TA1 — Visite de contrôle visuel (tour avion) plus réaliste (20/11/2026 07:18)
- Supprimer le signal sonore pendant la visite.
- Arrêt devant chaque élément numéroté, environ 3 minutes par élément (bruits de pas arrêtés pendant l'arrêt).
- Contrôler aussi l'intérieur des logements de roues (trappes ouvertes), les ailes et l'empennage.
- Flèches rouges montrant ce qui doit être contrôlé.
- Bouton « Bilan contrôle visuel » → valider → le bilan est rangé dans les documents de vol. « On améliorera encore après ».

### ADM — Compte administrateur et documentation « Comment ce projet a été réalisé ? » (20/11/2026 06:45)
Rôle administrateur (Symfony ROLE_ADMIN, création par commande, aucun mot de passe dans le dépôt) ; page réservée aux administrateurs avec une documentation pour un développeur web junior qui ne connaît pas la 3D et débute dans une activité digitale entrepreneuriale. À faire juste après la validation de F21, avant la suite de JLF3.

### JLF3 — « -> jlf f21+portage+ chantiers ..(A350...) » (20/11/2026 06:32), puis « ->c »
Dans l'ordre : **F21** (radio en audio, choix de la météo et effets physiques sur le vol, METAR / ATIS cohérents) ; **portage** des modules encore fournis par l'original ; **chantiers reportés** (point 13 : F18 atelier A350, F30, F10, F27, F9, F32, modification 13). Caractéristiques de l'A350, fréquences et procédures d'approche : rien de décidé sans l'auteur.

### F10 (suite) — 30 questions par thème pour TOUS les QCM
- Fait en V10.38 : test de niveau (30 + 30). Reste : chaque thème de QCM à au moins 30 questions de difficulté croissante, avec explication et source. Thèmes concernés : 9 matières PPL (12 à 18 aujourd'hui), C172 (18), procédures (7), masse et centrage (5), carburant (3), navigation (5), roulage (5), appareils (2 à 12).
- Suite de F9 : anomalies simulées aux autres étapes (démarrage, roulage, décollage…) sur le modèle du tour avion ; photos de source libre et citée.

### F27 — Cockpits et intérieurs d'après les données réelles (reçue le 18/11/2026 13:48, traitée avec F25 et F26)
- Demande : « IMPLÉMENTER LES COCKPITS ET LES INTÉRIEURS SUIVANT LES DONNÉES RÉELLES EXISTANT SUR CES APPAREILS ».
- Pour chaque appareil (777, A320, A350, Learjet 60, C172, hélicoptères) :
  - **poste** : nombre et place des écrans, panneaux (plafonnier, casquette, pédestal, consoles latérales), commandes (manche ou mini-manche, manettes, palonniers), instruments de secours ;
  - **cabine** : largeur et hauteur intérieures, longueur de cabine, nombre de sièges et configuration par classe, pas des sièges, portes et issues, offices, toilettes, coffres.
- Sources : documents constructeurs publics (Airport Planning / ACAP, fiches techniques), certificats EASA / FAA, manuels de formation publics. Chaque valeur porte son statut ([RÉFÉRENCÉ], [ESTIMÉ]…). Aucune valeur inventée présentée comme réelle.
- Les valeurs [ESTIMÉ] actuelles du plan de cabine (ex. A350 : 32 J · 24 W · 270 Y) sont remplacées par une configuration sourcée quand elle existe.
- Aucune donnée aéronautique de l'A350 du projet COCKPIT n'est modifiée sans validation.

### F30 — Intérieurs réalistes : poste, plafond, cabine (reçue le 18/11/2026 18:17)
- Demande : « Le contrôle visuel semblerait bloqué. Les intérieurs des aéronefs AVIONS / HÉLICOPTÈRES etc. doivent être réalistes. Dans les images on voit le vide (vert en bas dans le cockpit). Les vues instruments plafonnier pas parfaites. LES INTÉRIEURS COCKPIT / CABINE / COMPARTIMENTS PASSAGERS DOIVENT ÊTRE RÉALISTES » (20 captures téléphone, aperçu V10.41).
- Constats sur les captures :
  - on voit le sol (vert) sous la planche et sur les côtés : il manque plancher, bas de planche, palonniers, parois basses ;
  - en levant la tête, le plafond montre des blocs et des montants mal raccordés au lieu d'un vrai panneau plafond ;
  - les flèches « allée » et l'étiquette « ⓘ 5,87 × 2,45 m » de la vue Cabine restent affichées dans le poste ;
  - le panneau FCU ouvert couvre le milieu de l'écran sur téléphone.
- Tour avion du Learjet : capture de l'aperçu de 16 h 25 ; corrigé dans la V10.41 publiée.
- À faire : poste entièrement fermé et texturé pour les 8 appareils ; panneau plafond en 3D ; cabines (sièges, coffres, cloisons, éclairage) plus réalistes ; tests visuels.

### F32 — Vues réelles à l'approche, au décollage et en croisière (reçue le 18/11/2026 18:24)
- Demande : « Les vues d'approche en atterrissage, d'éloignement en décollage ou de survol en croisière DOIVENT CORRESPONDRE À DES VUES RÉELLES ».
- Version actuelle (fichier unique, hors ligne) :
  - relief simplifié, pistes et quelques bâtiments ;
  - vrais contours (côtes, îles, relief, villes) pour les aéroports des parcours (Paris-CDG, Orly, Toussus, New York, La Réunion), à partir de données ouvertes et citées (OpenStreetMap, SRTM / Copernicus DEM, Natural Earth) ;
  - en croisière : traits de côte et relief simplifiés le long des routes ;
  - taille du fichier à surveiller.
- Version Pro : imagerie satellite et relief réel en tuiles (voir point 11).

### F15 — Photo à conserver (reçue le 18/11/2026 11:21)
- Portrait en uniforme de commandant de bord. L'auteur dit : « On garde la photo. On verra quoi en faire plus tard ».
- Photo conservée hors du dépôt. Aucun usage avant instruction.

### F18 (suite) — A350-900 : ce qui reste simplifié
- Atelier des systèmes : schéma de principe commun Airbus, en forme d'A320. À remplacer par un schéma propre à l'A350 : gros-porteur, 2 circuits hydrauliques (vert, jaune) à 5 000 psi et actionneurs électriques de secours (architecture 2H/2E).
- Poste de pilotage : disposition commune Airbus du simulateur. À remplacer par les 6 grands écrans de l'A350, le KCCU et les écrans OIS.
- Valeurs [ESTIMÉ] à sourcer : MLW 207 t, MZFW 195,7 t, surface alaire 443 m², VMO / MMO, VFE par configuration, plan de cabine.

### F6 — Bilan pour jauger le projet face à son but (reçue le 18/11/2026 10:38)
- Demande : « fait un bilan afin de jauger le projet, car le but est de permettre à toute personne voulant étudier l'aviation, l'aéronautique, de pouvoir le faire et atteindre un niveau permettant de se présenter à un réel examen de brevet de pilote et plus ».
- Bilan rendu le 18/11 (voir `BILAN_F1_F2.md`, section F6) : il reste à transformer les pistes en modifications numérotées, après accord de l'auteur sur les priorités.

### F20 — Vérification complète puis lancement de GOPRO dans `plane-simulator` (ordre reçu le 18/11/2026 13:12)
- Demande : « À la fin du travail, on fait une vérification de tout le projet et tu lanceras GoPro dans Plane Simulator ».
- Ordre : 1) vérification de tout le projet (tous les tests, revue, README, traces d'IA, données sourcées) ; 2) lancement de la version Pro selon la section GOPRO ci-dessous.
- **F22 (18/11 13:20)** : « donne-moi le top quand tu as fini, et je te donne le GO PRO ». À la fin de la liste et de la vérification, envoyer le **top** et **attendre le GO PRO** avant tout travail dans `plane-simulator`.
- **Décisions de l'auteur (18/11 13:14)** : « finir la liste d'abord » (F11, F10 suite, F18 suite, F9 suite, modification 13), puis vérification, puis GOPRO. Périmètre GOPRO de départ : « fondations d'abord » : structure du dépôt, données en JSON, moteur et rendu 3D migrés, simulateur jouable dans React. Comptes, paiement et o2switch viennent ensuite.

## Commande « GO SYMFONY REACT THREE JS » = **GOPRO** = **gp** — passage à la version Pro (à implémenter quand l'auteur le demandera)
**Règle** : quand l'auteur écrit **GOPRO** ou **gp**, on restructure le projet en version Pro dans le dépôt **`plane-simulator`** (déjà créé le 17/11, réservé à cet usage) : **Symfony** (API, comptes, données) + **React** (interface) + **Three.js** (3D), déployé chez **o2switch**, avec **la connexion (login)** et **les vrais assets**. L'actuel `plane-trajectories-simulator` (fichier HTML unique) reste la version gratuite ou démo, sans régression.

Le détail des éléments à adapter (architecture et dépôt, connexion et comptes, données sauvegardées côté serveur, vrais assets, fonctions qui changent de forme, contenu pédagogique, déploiement o2switch, règles maintenues) reste celui de **MAJ-BIS du 17/11 21:15**, section « Éléments à adapter pour la version Pro », points 1 à 8. Il est repris sans changement. Deux mises à jour :
- `src/base.html` comporte maintenant **46 modules** (et non 42), dont `direct.js` (saut d'étape) et `treal.js` (temps réel) ;
- la sauvegarde d'un vol en temps réel (`localStorage`, clé `pt-rt-save-v1`) fait partie des données à passer côté serveur, sur le compte de l'élève.


**9. Radio, contrôle et météo (F21, demande du 18/11 13:14)**
- **Échanges radio entièrement paramétrés** : chaque aéroport et chaque phase a ses propres stations, fréquences, indicatifs et phraséologie : ATIS, prévol / délivrance, sol, tour, départ, centres en route, CPDLC, approche. Le paramétrage dépend de la position de l'avion le long des trajets du projet (JFK → CDG, CDG ⇄ La Réunion, Manhattan → JFK, Toussus…) et reprend ce qui existe déjà dans le simulateur.
- **Tout en audio** : voix du contrôle et de l'équipage, collationnements, appels, transferts, messages d'information. Pas de voix d'équipage réelle fabriquée : voix de synthèse ou enregistrements sous licence, clairement identifiés.
- **Fréquences et données** : uniquement des valeurs sourcées (eAIP / SIA, FAA, AIP des pays survolés), avec leurs statuts [OFFICIEL] / [RÉFÉRENCÉ] / [SIMULÉ]. Les fréquences et procédures d'approche réelles ne sont jamais décidées à la place de l'auteur.
- **Météo** : METAR, TAF, ATIS cohérents entre eux et avec la météo affichée. Phénomènes : temps sec, nuages (couches, plafond), pluie, bruine, brouillard, neige, vent fort et rafales, cisaillement, turbulence, tempête, orage (cumulonimbus), foudre, grêle, givrage. Effets visuels, sonores et sur le vol, avec leurs conséquences sur les procédures (déroutement, attente, approche interrompue, retard).
- **Situations réelles** : scénarios bâtis sur des situations météo et radio réelles et documentées (archives METAR / TAF, rapports publics), avec leurs sources.
- **Choix de la météo par l'utilisateur** (précisé le 18/11 13:18) : sec, pluie, nuageux, tempête, orage, foudre, etc., avec un **comportement physique du vol en conséquence** :
  - portance et traînée (pluie, givre) ;
  - vent, rafales, turbulence, cisaillement ;
  - visibilité ;
  - freinage selon l'état de piste ;
  - performances selon la température et la pression ;
  - effets de la foudre.
- **Audio partout** (précisé le 18/11 13:18) : appels et échanges pilote / copilote, tours de contrôle, informations et données météo, adaptés à chaque aéroport et à la position de l'avion sur les trajets du projet.

- **Boutons radio fonctionnels (F37)** : **faits** le 19/11 23:10 (`main` = 9d453ec), voir MAJ-2. Reste du point 9 : audio complet et météo (F21).

**10. Rappel GOPRO de l'auteur (F23, 18/11 13:31)** : « RAPPEL DE GOPRO = IMPLÉMENTER LE PROJET EN SYMFONY REACT THREE.JS ET INTÉGRER LOGIN AVEC ŒIL TOGGLE, LIEN RÉINITIALISATION DE MOT DE PASSE. TOUS LES COURS, EXERCICES DOIVENT ÊTRE TÉLÉCHARGEABLES EN PDF »
- **Pile** : Symfony (API, comptes, données) + React (interface) + Three.js (3D), dans `plane-simulator`.
- **Connexion** :
  - page de connexion avec un **œil pour afficher / masquer le mot de passe** (bouton accessible, `aria-pressed`, libellé « Afficher le mot de passe ») ;
  - lien **« Mot de passe oublié ? »** : e-mail avec un lien de réinitialisation à usage unique et à durée limitée (SymfonyCasts ResetPasswordBundle ou équivalent), sans révéler si l'adresse existe ;
  - mots de passe hachés (algorithme « auto » de Symfony) ; limitation des tentatives (rate limiter).
- **PDF** : **tous les cours et tous les exercices téléchargeables en PDF** : modules de l'Académie, QCM avec corrigés, formules et exemples corrigés de la partie 9, fiches d'étape, documents de vol. Génération côté serveur, avec l'export navigateur en secours.

**11. Vraies cartes (F33, 18/11 18:24)** : « LORS DU PASSAGE EN PRO ON VA FAIRE APPEL À DE VRAIES CARTES ».
- Cartes et décor réels dans la version Pro :
  - fonds de carte (OpenStreetMap ou fournisseur sous licence) ;
  - imagerie satellite et relief réel en tuiles (Copernicus DEM / SRTM) pour la vue 3D et la carte de vol ;
  - cartes aéronautiques officielles (SIA / eAIP, FAA) seulement si leur licence le permet, sources citées.
- Les vues d'approche, de départ et de croisière (F32) s'appuient sur ces données.

**12. Poste de pilotage photoréaliste (F35, 18/11 20:01)** : « La vue cockpit n'est pas réaliste » ; « -> cela sera l'objet de GO PRO » (capture du poste 3D en approche de Gillot + 6 photos de référence d'un poste Airbus gros-porteur de nuit, vidéo JustPlanes).
- Le poste 3D du fichier unique (V10.41–V10.42) reste schématique.
- La version Pro vise un poste fidèle aux photos de référence :
  - modèles 3D détaillés (glTF) par appareil, avec planche, FCU / EFIS, panneau plafond complet et rétroéclairé, pédestal, sièges en mouton, tablettes ;
  - écrans réels interactifs (PFD, ND, OANS, ECAM, MCDU / KCCU), éclairage de nuit (intégré, projecteurs, ambiance) ;
  - vue extérieure réelle, cohérente avec le point 11.
- Références : `references-cockpit/` (747-400) et `references-cockpit/a380-justplanes/` (gros-porteur Airbus de nuit), hors du dépôt. Elles ne sont pas intégrées (droits d'auteur, personnes visibles) ; modèles 3D sous licence ou créés pour le projet.

**13. Chantiers reportés au GOPRO (décision du 18/11 20:08)** :
- F32 vues réelles : reprendre la branche `v10.43-paysage` avec les vraies données ;
- F30 : finir les intérieurs ;
- F10 : 30 questions par QCM (Learjet, R44, S-76, H125, 9 matières PPL) ;
- F27 : données réelles (S-76, H125, dispositions détaillées) ;
- F18 : atelier propre à l'A350 ;
- F9 suite : anomalies aux autres étapes ;
- modification 13.

## Restant connu
- Options en attente de l'auteur (légendes de cabine, réalisme du cockpit, message pour un instructeur), puis bilan, version Pro et imagerie satellite. Voir `A_FINIR.md`, points 3 à 5. Les points 1 et 2 de `A_FINIR.md` sont **faits** : V10.28 et V10.33.
- Coordination : ChatGPT dispose aussi des documents de bascule jusqu'au 22/11. Il faut éviter que deux assistants modifient le même dépôt en même temps.

### QV1 — Qualité visuelle (20/11/2026 17:42) — sur « go qualité », après la réinitialisation des limites
Essai A320 au départ de Paris : lumière et rendu, ciel et nuages en volume, pluie sur le pare-brise, matériaux et sol mouillé ; réglages « léger » et « haute qualité ». Modèles 3D professionnels et décor réel (Cesium, Google) : achats et licences, décision de l'auteur.

### PRO1 — Version Pro avec vrai backend (20/11/2026 18:25) — après FIN1
Faire tourner l'API Symfony déjà écrite (connexion élève et admin, comptes, accès réservé, PDF, trafic) : installation des bibliothèques, base de données, tests PHPUnit, site branché sur le vrai backend. Hébergement o2switch, domaine cockpitschool.com (achat par l'auteur). Les bibliothèques PHP ne s'installent pas dans cet environnement : l'installation se fera chez o2switch ou sur la machine de l'auteur.

### PHASE POST-RÉINITIALISATION (décision de l'auteur du 20/11/2026 20:19)
À lancer seulement après la réinitialisation des limites d'utilisation : **TAR** trafic aérien réel (sources et licences à décider par l'auteur) ; **HEB** hébergement o2switch et domaine cockpitschool.com (achat par l'auteur) ; **PMMO** portage des modules du moteur d'origine ; **A350** valeurs sourcées et atelier (validation de l'auteur) ; **MET3** météo composée ; **CV-TRP** contrôle visuel : regard qui balaie et trappes de train ouvertes (TA4) ; **QV1** qualité visuelle (« go qualité »), y compris paysages et relief réalistes (23:50 : relief réel, images aériennes ; services sous licence à décider).

### MET3 — Météo composée (20/11/2026 23:59)
Moment (jour avec soleil / nuit) + vent (calme, vent, tempête, ouragan) + ciel (clair, nuages, pluie, neige, brouillard) + orage / foudre ; combinables ; un METAR [SIMULÉ] cohérent ; effets physiques de MET2.

### TA4 — Visite de contrôle visuel : regard qui balaie, logements de train ouverts (20/11/2026 23:59)
Regard qui balaie chaque pièce pendant l'arrêt ; trains : trappes ouvertes, vue debout au centre sous le logement, intérieur modélisé (roues, jambe, vérins, câbles, flexibles), tous les trains, tous les appareils.
