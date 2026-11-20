# Revue de code et audit de sécurité — 20/11/2026

Demande de l'auteur (20/11 08:17) : « tester tout ; faire une revue de code ; audit sécurité sauf si prématuré ; vs ».
Périmètre : branche `f21-meteo` comparée à `main` (`9d453ec`) — météo F21, radio en audio, portage météo, espace Admin,
visite de contrôle visuel (TA1), tablette et double contrôle (TA2), checklist (C11), bande du site en vol (C12) — puis
l'ensemble de l'API Symfony pour la sécurité.

## 1. Revue de code

| # | Fichier | Constat | Gravité | Suite |
|---|---|---|---|---|
| R1 | `legacy-ext/meteo.ts` | Le brouillard givrant (FZFG) classait la piste en « glace » (freinage ×0,25). Seules la pluie et la bruine verglaçantes (FZRA, FZDZ) et le granule de glace (PL) sous 0 °C le justifient. | moyenne | **corrigé** |
| R2 | `legacy-ext/tourAvion.ts` | Le compte à rebours reconstruisait ses boutons chaque seconde : « Point suivant » impossible à toucher. Les boutons étaient aussi dans le panneau du guide, invisible quand il est replié. | haute | **corrigé** : bandeau fixe toujours visible, structure stable |
| R3 | `legacy-ext/tourAvion.ts` | En mode AUTO, le guide passait à l'étape suivante dès le dernier point : le bilan ne pouvait pas être validé. | haute | **corrigé** : bilan ouvert automatiquement, étape terminée seulement après « Valider » (sauf saut d'étape) |
| R4 | `legacy-ext/meteo.ts` | Un affichage brouillard rendait aussi les shaders du moteur dans le brouillard : erreur de rendu. | haute | **corrigé** : seulement les sprites et points (feux, étoiles) |
| R5 | `legacy-ext/equipage.ts` | Le moteur redessine la checklist en continu : les marques « documents / ouvrir l'étape » disparaissaient. | moyenne | **corrigé** : observateur de modifications (MutationObserver) |
| R6 | `legacy-ext/*.ts` | Les extensions enveloppent des fonctions globales du moteur (`brkEff`, `walkDone`, `autoWalk`, `wxSet`…). Si une version future du moteur renomme l'une d'elles, l'extension ne s'installe pas (contrôle à l'entrée), sans casser le moteur. | info | à garder : chaque extension vérifie ses dépendances avant de s'installer |
| R7 | `pages/Simulator.tsx` | Cinq retouches du moteur au chargement (indicatifs, fonctions audio exposées, bip retiré, documents exposés) par remplacement de texte exact. Si le texte n'est plus trouvé, la retouche ne se fait pas en silence. | basse | à surveiller ; un test de chaque retouche existe (radio, météo, tour) |
| R8 | `legacy-ext/meteo.ts` | Le scénario météo choisi est mémorisé (`localStorage`) et réappliqué à la séance suivante, avec un message. | info | voulu ; « Réel » le retire |
| R9 | `engine/weather.ts` | Portage fidèle, y compris deux bizarreries de l'original, gardées pour la parité : le vent VRB compte pour 0 kt dans la moyenne, et le 1er champ à 4 chiffres est toujours pris pour la visibilité. | info | à revoir quand le module remplacera l'original |
| R10 | `backend/src/Command/AdminCreateCommand.php` | Mot de passe demandé masqué, règle identique à l'inscription, adresse normalisée en minuscules comme `User::setEmail`. | — | conforme |

## 2. Audit de sécurité

L'audit n'est **pas prématuré pour la conception** : comptes, accès et en-têtes se décident maintenant. Il **l'est pour la mise
en production** : l'API n'a jamais tourné (bibliothèques PHP inaccessibles ici), et rien n'est encore hébergé. Ces points-là sont
à refaire chez o2switch.

| # | Point | Constat | Suite |
|---|---|---|---|
| S1 | Mots de passe | hachage « auto » de Symfony ; 10 caractères, lettres et chiffres ; mots de passe connus refusés (NotCompromisedPassword) | conforme |
| S2 | Connexion | 5 tentatives par adresse et par IP en 15 min ; réponse identique si l'adresse n'existe pas | conforme |
| S3 | Inscription | **aucune limite** : création de comptes en masse possible | **corrigé** : 5 inscriptions par heure et par IP (test PHPUnit `SecurityHeadersTest`) |
| S4 | Mot de passe oublié | lien unique valable 1 h ; 5 demandes par 15 min et par IP ; pas de révélation des adresses inscrites | conforme |
| S5 | Session | cookie `HttpOnly`, `SameSite=Lax`, `Secure` en HTTPS | conforme |
| S6 | Falsification de requête (CSRF) | connexion : JSON seulement (json_login) ; `SameSite=Lax` ; aucune autorisation CORS donnée | conforme ; ne jamais ouvrir CORS à `*` |
| S6b | Format des requêtes du compte | l'inscription et les routes « mot de passe » lisaient le corps sans vérifier le type : un formulaire « texte » d'un autre site pouvait créer un compte et y connecter le visiteur | **corrigé** : `application/json` obligatoire, sinon 415 (test `testJsonObligatoire`) |
| S7 | Contrôle d'accès | décidé par le serveur (`access_control`) : données, moteur, PDF, trafic → compte connecté ; `/api/admin` → `ROLE_ADMIN` (401 / 403) | conforme (tests PHPUnit écrits) |
| S8 | En-têtes HTTP | **absents** | **corrigé** : API (`SecurityHeadersSubscriber`) et fichiers statiques (`frontend/public.htaccess`) : `nosniff`, `SAMEORIGIN`, `Referrer-Policy`, HTTPS obligatoire, `no-store` sur les réponses du compte |
| S9 | Fichiers publics | `node build.mjs` copiait `data/` et `legacy/` dans le dossier public : publiés tels quels, ils auraient contourné F41 | **corrigé** : `node build.mjs --prod` ne les copie pas (servis par l'API seulement) |
| S10 | Secrets | `.env` versionné ne contient que des valeurs d'exemple ; `.env.local` est ignoré par Git ; aucune clé dans le dépôt | conforme ; **à faire chez o2switch** : `APP_SECRET` aléatoire, jeton du récepteur ≥ 24 caractères |
| S11 | Récepteur ADS-B | jeton comparé à temps constant ; taille et zone limitées ; désactivé si non configuré (503) | conforme |
| S12 | Injection HTML | contenus des cours filtrés (`safe()`) ; documentation Admin et textes du moteur : contenus du projet, pas des saisies d'utilisateurs ; METAR saisi : échappé par le moteur | conforme |
| S13 | Version autonome | tout est ouvert, documentation Admin comprise : fichier d'essai de l'auteur, **à ne jamais publier** | règle rappelée dans le README et dans `tools/standalone.py` |
| S14 | Dépendances | versions fixées (Symfony 7.4, React 19) ; `composer audit` et `npm audit` impossibles ici (registres bloqués) | **à faire** à l'installation : `composer audit`, `npm audit` |
| S15 | RGPD | données stockées : adresse, prénom ou pseudonyme, mot de passe haché ; pas encore de suppression de compte ni de mentions légales | **à faire avant l'ouverture** : suppression de compte, mentions légales, politique de confidentialité |

## 3. Tests

Voir la section « Résultats » du compte rendu de la session (`MAJ-2.md`, ligne QA1) : suites e2e servies et autonomes,
parité, et la liste des tests PHPUnit écrits mais pas exécutés ici.
