"""Cours II · partie 2 · module 7 : procédures opérationnelles et sécurité — approche stabilisée, turbulence de sillage,
pistes contaminées, dégivrage, situations anormales (décrochage, assiette inusuelle, vitesse douteuse, cisaillement), évacuation, liste minimale d'équipements.
Niveau ATPL, très difficile. 20 exercices corrigés."""
import math
from commun import ex, fr, close

H = """
<p class="lead"><b>Niveau confirmé.</b> Matière « Procédures opérationnelles » (EASA ATPL, sujet 070), reliée à la partie 8 du Cours I (« Sécurité des vols : ce que les accidents nous ont appris »).
Les procédures d'un type d'avion se lisent dans son manuel (FCOM, QRH) ; celles décrites ici sont les principes communs enseignés en école.</p>

<h3>1. L'approche stabilisée</h3>
<p>Critères usuels (Flight Safety Foundation, ALAR) : à <b>1 000 ft</b> au-dessus du terrain en IMC (<b>500 ft</b> en VMC), l'avion est sur la bonne trajectoire, en configuration d'atterrissage, à une vitesse entre V<sub>REF</sub> et V<sub>REF</sub> + 20 kt,
avec un taux de descente ≤ 1 000 ft/min et la poussée stabilisée. Sinon : <b>remise de gaz</b>. Les approches non stabilisées sont un facteur majeur des sorties de piste.</p>

<h3>2. Turbulence de sillage (OACI Doc 4444)</h3>
<p>Les tourbillons de bout d'aile descendent (≈ 300 à 500 ft/min) et dérivent avec le vent ; ils sont les plus forts derrière un avion <b>lourd, lent et lisse</b>.
Espacements radar en approche : J → H 6 NM, J → M 7 NM, J → L 8 NM ; H → H 4 NM, H → M 5 NM, H → L 6 NM ; M → L 5 NM. Au décollage, 2 min derrière un avion lourd pour un avion moyen ou léger.</p>

<h3>3. Pistes contaminées et dégivrage</h3>
<ul>
<li>État de piste rapporté par un code de 0 à 6 (6 : sèche ; 0 : freinage nul) dans le format mondial (GRF, OACI, en vigueur depuis novembre 2021) [RÉFÉRENCÉ] OACI Doc 9981 et circulaire 355.</li>
<li>Dégivrage (fluide de type I chaud) puis antigivrage (type II ou IV épaissi). Le <b>temps de protection</b> (holdover time) commence au début de la dernière application ; dépassé, on refait l'inspection ou le traitement.
Le principe « avion propre » : aucun décollage avec du givre, de la neige ou de la glace adhérant aux surfaces critiques.</li>
</ul>

<h3>4. Situations anormales</h3>
<ul>
<li><b>Décrochage</b> : réduire d'abord l'<b>incidence</b> (pousser), même si cela fait perdre de l'altitude ; puis gérer la poussée et les ailes à plat. Vol Air France 447 (2009) et Colgan 3407 (2009).</li>
<li><b>Assiette inusuelle, nez bas</b> : réduire la poussée si besoin, remettre les ailes à plat (roulis), puis ressource. Nez haut : pousser (et éventuellement incliner), poussée adaptée.</li>
<li><b>Vitesse douteuse</b> (unreliable airspeed) : afficher l'assiette et la poussée mémorisées, puis lire les tables du QRH.</li>
<li><b>Cisaillement / micro-rafale</b> : pleine poussée, ailes à plat, suivre la barre d'assiette jusqu'à l'avertisseur de décrochage ; ne rien changer à la configuration.</li>
<li><b>Évacuation</b> : démonstration de certification en 90 s avec la moitié des issues utilisables [RÉFÉRENCÉ] CS 25.803 et appendice J.</li>
</ul>

<h3>5. Liste minimale d'équipements (MEL)</h3>
<p>La MMEL du constructeur, approuvée par l'autorité, donne les équipements dont l'avion peut être temporairement privé ; la MEL de l'exploitant ne peut être que plus restrictive.
Chaque élément porte une catégorie de délai de réparation (A à D) et des procédures (O : opérationnelle, M : maintenance).</p>
<div class="box"><b>Pièges d'examen</b> : face au décrochage, la priorité est l'incidence, pas la poussée ; le temps de protection part de la dernière application de fluide ;
la MEL ne peut pas être moins restrictive que la MMEL.</div>
"""

Q = []
Q.append(ex('Approche IMC : à 1 000 ft, vitesse V_REF + 25 kt et taux de descente 1 400 ft/min. Décision :', 'remise de gaz', ['continuer et corriger avant 500 ft', 'continuer, la piste est longue', 'sortir les aérofreins'],
            'Deux critères de stabilisation ne sont pas tenus à la porte des 1 000 ft en IMC : remise de gaz obligatoire selon la politique de l\'exploitant.'))
Q.append(ex('Porte de stabilisation usuelle en VMC :', '500 ft', ['1 000 ft', '200 ft', '50 ft'], 'Critères Flight Safety Foundation (ALAR) : 1 000 ft en IMC, 500 ft en VMC.'))
Q.append(ex('Espacement radar minimal en approche : un avion de catégorie M derrière un H :', '5 NM', ['4 NM', '6 NM', '3 NM'], 'H → M : 5 NM (Doc 4444).'))
Q.append(ex('Un avion de catégorie L derrière un A380 (J) :', '8 NM', ['6 NM', '5 NM', '10 NM'], 'J → L : 8 NM ; J → M : 7 NM ; J → H : 6 NM.'))
Q.append(ex('Les tourbillons de sillage sont les plus forts derrière un avion :', 'lourd, lent, en configuration lisse', ['léger, rapide, volets sortis', 'lourd, rapide, train sorti', 'léger, lent'],
            'L\'intensité croît avec la masse et décroît avec la vitesse ; les volets et le train dispersent un peu les tourbillons.'))
Q.append(ex('Décollage après un gros porteur sur la même piste, vent traversier nul. Précaution :', 'quitter le sol avant son point de rotation et monter au-dessus de sa trajectoire', ['décoller après son point de rotation', 'rester sous sa trajectoire', 'aucune'],
            'Les tourbillons commencent à la rotation de l\'avion qui précède et descendent : on reste au-dessus et au vent de sa trajectoire.'))
Q.append(ex('Code d\'état de piste (RWYCC) 6 :', 'piste sèche', ['freinage nul', 'neige mouillée', 'glace'], 'Matrice GRF : 6 = sec ; 0 = freinage nul (glace mouillée, par exemple).'))
Q.append(ex('Antigivrage terminé à 08 h 10 (début de la dernière application), temps de protection 25 min. Le décollage doit avoir lieu avant :', '08 h 35', ['08 h 25', '08 h 45', '08 h 10'],
            'Le temps de protection court à partir du début de la dernière application : 08 h 10 + 25 min = 08 h 35. Au-delà, inspection ou nouveau traitement.'))
Q.append(ex('Fluide d\'antigivrage offrant la plus longue protection :', 'type IV', ['type I', 'eau chaude', 'type II dilué'], 'Le type IV est un fluide épaissi qui reste sur l\'aile jusqu\'à la rotation.'))
Q.append(ex('Alarme de décrochage en croisière, assiette 10° à cabrer, vitesse qui baisse. Première action :', 'réduire l\'incidence en poussant sur le manche', ['afficher la poussée maximale en gardant l\'assiette', 'tirer pour éviter de perdre de l\'altitude', 'sortir les volets'],
            'Seule la diminution de l\'incidence supprime le décrochage. Vol Air France 447 (2009) : action à cabrer maintenue [RÉFÉRENCÉ] BEA, rapport final 2012.'))
Q.append(ex('Assiette inusuelle nez bas, inclinaison 110°. Ordre des actions :', 'réduire la poussée si nécessaire, mettre les ailes à plat, puis ressource', ['tirer d\'abord sur le manche', 'pleine poussée et tirer', 'sortir le train'],
            'Tirer en grande inclinaison resserre le virage et accélère la descente ; on remet d\'abord les ailes à plat.'))
Q.append(ex('Indications de vitesse contradictoires après le décollage. Première action (principe général) :', 'afficher l\'assiette et la poussée de mémoire, puis consulter les tables', ['suivre le directeur de vol', 'réduire la poussée', 'monter au plafond'],
            'Le directeur de vol et l\'automatisme peuvent être faussés par les vitesses erronées ; l\'assiette et la poussée donnent une trajectoire sûre.'))
Q.append(ex('Cisaillement en finale : la manœuvre de sortie comprend :', 'pleine poussée, ailes à plat, assiette jusqu\'à l\'avertisseur de décrochage, pas de changement de configuration',
            ['réduire la poussée', 'rentrer les volets immédiatement', 'sortir les aérofreins'],
            'Rentrer volets ou train ferait perdre de la portance au plus mauvais moment.'))
Q.append(ex('Démonstration d\'évacuation pour certifier un avion de ligne :', 'en 90 s avec la moitié des issues', ['en 3 min avec toutes les issues', 'en 30 s', 'en 90 s avec toutes les issues'],
            'CS 25.803 et appendice J : 90 s, de nuit simulée, la moitié des issues utilisables.'))
Q.append(ex('La MEL d\'un exploitant peut-elle être moins restrictive que la MMEL du constructeur ?', 'non', ['oui, avec l\'accord du commandant', 'oui, pour un seul vol', 'oui, si la météo est bonne'],
            'La MEL est dérivée de la MMEL et ne peut être qu\'au moins aussi restrictive.'))
Q.append(ex('Lettre « O » dans une rubrique de MEL :', 'une procédure opérationnelle est à appliquer par l\'équipage', ['l\'équipement est optionnel', 'le vol est interdit', 'une opération de maintenance'],
            'O : procédure opérationnelle (équipage) ; M : procédure de maintenance.'))
Q.append(ex('Accident Colgan 3407 (2009) : action de l\'équipage à l\'alarme de décrochage :', 'tirer sur le manche contre le pousseur de manche', ['pousser', 'réduire la poussée', 'sortir les volets'],
            'Le commandant a tiré contre le « stick pusher » ; la formation au décrochage a été revue depuis [RÉFÉRENCÉ] NTSB AAR-10/01.'))
Q.append(ex('Fumée en cabine d\'origine inconnue. Priorité absolue de l\'équipage de conduite :', 'mettre les masques à oxygène et établir la communication', ['chercher la source', 'descendre sans masque', 'couper toute l\'électricité sans procédure'],
            'Protéger d\'abord l\'équipage (masques à 100 %), puis appliquer la check-list et préparer un déroutement rapide.'))
Q.append(ex('Composante de vent traversier : piste 09, vent 140°/30 kt. Valeur ?', f'{fr(30*math.sin(math.radians(50)),1)} kt',
            ['19,3 kt', '30,0 kt', '15,0 kt'], f'30 × sin 50° = {fr(30*math.sin(math.radians(50)),1)} kt, à comparer à la limite démontrée de l\'avion (dépendante de l\'état de la piste).'))
Q.append(ex('Vol long-courrier biréacteur avec une autorisation EDTO (ETOPS) 180 min : signification ?', 'l\'avion peut s\'éloigner jusqu\'à 180 min de vol (un moteur en panne) d\'un aérodrome adéquat',
            ['le vol dure au maximum 180 min', 'le carburant couvre 180 min de réserve', 'l\'équipage se relaie toutes les 180 min'],
            'Temps de déroutement maximal à la vitesse un moteur en panne, en air calme, approuvé pour l\'exploitant et le type.'))
assert len(Q) == 20, len(Q)

MOD = {'id': 'q2-procedures', 't': 'Procédures et sécurité : approche stabilisée, sillage, contaminants, situations anormales', 'h': H, 'quiz': Q}
