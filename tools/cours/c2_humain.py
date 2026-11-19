"""Cours II · module 7 : performances humaines — hypoxie et pressurisation, décompression, illusions sensorielles,
vision et anticollision, alcool et fatigue, modèles d'erreur (Reason, SHELL, TEM) et CRM. Niveau ATPL, très difficile. 20 exercices corrigés."""
import math
from commun import ex, fr, close

H = """
<p class="lead"><b>Niveau confirmé.</b> Matière « Performances et limites humaines » (EASA ATPL, sujet 040). Suppose acquis le module « Le pilote et son corps » du Cours I.</p>

<h3>1. Pression et oxygène</h3>
<p>La fraction d'oxygène reste 20,95 % à toute altitude, mais sa <b>pression partielle</b> baisse avec la pression totale (loi de Dalton) : c'est elle qui fait passer l'oxygène dans le sang.
Loi de Boyle-Mariotte : à température constante, un volume de gaz piégé (intestins, sinus, oreille moyenne, dent) augmente comme 1 / P ; il double vers 18 000 ft.
Altitude cabine maximale en exploitation normale : 8 000 ft [RÉFÉRENCÉ] CS 25.841.</p>
<table class="kv"><tbody>
<tr><th>Temps de conscience utile (TUC)</th><td>FL250 : 3 à 5 min · FL300 : 1 à 2 min · FL350 : 30 à 60 s · FL400 : 15 à 20 s · FL430 et au-dessus : 9 à 12 s.
Divisé par deux environ en décompression rapide [RÉFÉRENCÉ] FAA AC 61-107B.</td></tr>
<tr><th>Types d'hypoxie</th><td>hypoxique (altitude) · anémique ou hypémique (monoxyde de carbone, anémie) · stagnante (circulation : facteur de charge, froid) · histotoxique (alcool, toxiques)</td></tr>
<tr><th>Oxygène (règle FAA 91.211)</th><td>équipage : au-delà de 30 min entre 12 500 et 14 000 ft, en permanence au-dessus de 14 000 ft ; passagers : fourni au-dessus de 15 000 ft</td></tr>
</tbody></table>
<p>Plongée sous-marine : attendre au moins <b>12 h</b> après une plongée sans palier et <b>24 h</b> après une plongée avec paliers avant de voler jusqu'à 8 000 ft d'altitude cabine [RÉFÉRENCÉ] FAA AIM 8-1-2.</p>

<h3>2. Illusions sensorielles</h3>
<ul>
<li><b>Somatogravique</b> : une accélération longitudinale donne la sensation de cabrer ; sans référence visuelle, le pilote pousse sur le manche. Une décélération donne l'illusion inverse.</li>
<li><b>Inclinaison résiduelle (« leans »)</b> : après un virage lent non perçu (sous le seuil des canaux semi-circulaires, ≈ 2°/s), le retour à plat est ressenti comme une inclinaison.</li>
<li><b>Approche « trou noir »</b> (nuit, terrain sans éclairage autour) : impression d'être trop haut → approche trop basse.</li>
<li>Piste <b>montante</b> ou <b>étroite</b> : impression d'être trop haut → approche trop basse. Piste descendante ou large : l'inverse.</li>
</ul>

<h3>3. Vision et anticollision</h3>
<p>Il faut environ <b>12,5 s</b> entre la détection d'un autre avion et la fin de la manœuvre d'évitement [RÉFÉRENCÉ] FAA AC 90-48D (tableau du temps de reconnaissance et de réaction).
Un avion en route de collision reste <b>immobile</b> dans le champ visuel et grossit brusquement à la fin. Myopie d'espace vide : sans objet à fixer, l'œil accommode à 1 ou 2 m.</p>

<h3>4. Alcool, fatigue</h3>
<p>FAA 14 CFR 91.17 : rien dans les 8 h avant le vol et une alcoolémie inférieure à 0,04 %. L'élimination est d'environ 0,10 à 0,15 g/L par heure et ne s'accélère pas (café, douche).
Creux circadien (WOCL) entre 2 h et 6 h du matin, heure du corps.</p>

<h3>5. Modèles de sécurité</h3>
<ul>
<li><b>Reason</b> (« fromage suisse ») : un accident survient quand des défaillances latentes (organisation, conception) et des erreurs actives s'alignent à travers les barrières.</li>
<li><b>SHELL</b> : Software, Hardware, Environment, Liveware (l'humain au centre et ses interfaces avec les autres humains).</li>
<li><b>TEM</b> (Threat and Error Management) : menaces → erreurs → états indésirables de l'avion ; on cherche à les détecter et à les corriger avant qu'ils ne deviennent un incident.</li>
<li><b>CRM</b> : communication, conscience de la situation, prise de décision, leadership, gestion de la charge de travail. Né après Tenerife (1977) et le United 173 (1978).</li>
</ul>
<div class="box"><b>Pièges d'examen</b> : l'hypoxie est insidieuse (euphorie, jugement altéré) ; le taux d'oxygène dans l'air ne change pas avec l'altitude ; l'illusion somatogravique au décollage de nuit pousse à piquer.</div>
"""

def p_isa(ft):
    T = 288.15 - 0.0065 * ft * 0.3048
    return 1013.25 * (T / 288.15) ** 5.25588

Q = []
Q.append(ex('Proportion d\'oxygène dans l\'air à FL350 :', '20,95 %', ['5,0 %', '10,0 %', '0,0 %'], 'La composition ne change pas ; seule la pression partielle diminue (≈ 50 hPa contre 212 au niveau de la mer).'))
pp = 0.2095 * p_isa(10000)
Q.append(ex('Pression partielle de l\'oxygène à 10 000 ft (ISA) ?', f'{fr(pp)} hPa', ['212 hPa', '697 hPa', '100 hPa'],
            f'P(10 000 ft) = {fr(p_isa(10000))} hPa ; 0,2095 × {fr(p_isa(10000))} = {fr(pp)} hPa.'))
Q.append(ex('Volume d\'un gaz piégé dans l\'intestin, 1 L au sol, à une altitude cabine de 18 000 ft (ISA) ?', f'{fr(1013.25/p_isa(18000),1)} L', ['1,0 L', '0,5 L', '3,0 L'],
            f'Boyle : V = 1 × 1 013 / {fr(p_isa(18000))} = {fr(1013.25/p_isa(18000),1)} L.'))
Q.append(ex('Temps de conscience utile à FL350 (ordre de grandeur, FAA AC 61-107B) ?', '30 à 60 s', ['3 à 5 min', '9 à 12 s', '10 à 20 min'], 'FL350 : 30 à 60 s ; divisé par deux environ en décompression rapide.'))
Q.append(ex('Décompression rapide à FL400. Temps de conscience utile probable ?', '≈ 8 à 10 s', ['≈ 15 à 20 s', '≈ 1 à 2 min', '≈ 3 à 5 min'],
            'TUC FL400 ≈ 15 à 20 s, réduit de moitié environ en décompression rapide : masque à oxygène immédiatement, avant toute autre action.'))
Q.append(ex('Intoxication au monoxyde de carbone (chauffage cabine défectueux) : type d\'hypoxie ?', 'anémique (hypémique)', ['hypoxique', 'stagnante', 'histotoxique'],
            'Le CO se fixe sur l\'hémoglobine environ 200 à 250 fois plus que l\'oxygène : le sang ne peut plus transporter l\'oxygène.'))
Q.append(ex('Plongée avec paliers de décompression le matin. Délai minimal avant de voler (AIM 8-1-2) ?', '24 h', ['12 h', '6 h', '48 h'], 'Plongée avec ascension contrôlée : 24 h ; sans palier : 12 h.'))
Q.append(ex('Règle FAA (14 CFR 91.17) : délai entre la dernière boisson alcoolisée et le vol ?', '8 h', ['12 h', '4 h', '24 h'], 'Et alcoolémie inférieure à 0,04 %. Beaucoup d\'exploitants imposent davantage (souvent 12 h).'))
Q.append(ex('Alcoolémie 0,8 g/L à minuit ; élimination 0,12 g/L/h. Heure où elle retombe sous 0,2 g/L ?', f'≈ {fr(0.6/0.12)} h du matin', ['≈ 2 h du matin', '≈ 7 h du matin', '≈ 8 h du matin'],
            f'(0,8 − 0,2) / 0,12 = {fr(0.6/0.12)} h : vers {fr(0.6/0.12)} h. Le café ou le sommeil n\'accélèrent pas l\'élimination.'))
Q.append(ex('Décollage de nuit au-dessus de la mer, forte accélération, aucune référence visuelle. Illusion probable :', 'sensation de cabrer excessivement', ['sensation de piquer', 'sensation d\'inclinaison à droite', 'aucune illusion'],
            'Illusion somatogravique : le pilote risque de pousser sur le manche et de percuter la mer. Seul remède : les instruments.'))
Q.append(ex('Approche de nuit vers une piste isolée sans éclairage autour (trou noir). Tendance :', 'approche trop basse', ['approche trop haute', 'approche trop rapide', 'aucune'],
            'Le pilote se croit trop haut et réduit la pente : risque d\'impact avant la piste.'))
Q.append(ex('Piste plus large que d\'habitude. Impression et tendance :', 'impression d\'être trop bas → approche trop haute', ['impression d\'être trop haut → approche trop basse', 'aucune illusion', 'impression d\'être trop rapide'],
            'Une piste large paraît plus proche : on se croit bas et l\'on remonte la pente (arrondi haut, atterrissage long).'))
Q.append(ex('Virage lent à 1°/s pendant 30 s en IMC, puis remise à plat rapide. Le pilote ressent :', 'une inclinaison dans le sens opposé au virage', ['une inclinaison dans le sens du virage', 'une montée', 'rien'],
            'Le virage lent est sous le seuil des canaux semi-circulaires (≈ 2°/s) ; la remise à plat est perçue comme un virage inverse : illusion de l\'inclinaison résiduelle (« leans »).'))
cl = 2 * 250 * 12.5 / 3600
Q.append(ex('Deux avions face à face à 250 kt chacun. Distance parcourue pendant les 12,5 s nécessaires pour voir et éviter ?', f'{fr(cl,2)} NM', ['0,87 NM', '3,47 NM', '0,35 NM'],
            f'Vitesse de rapprochement 500 kt ; 500 × 12,5 / 3 600 = {fr(cl,2)} NM : si l\'autre avion est vu à moins de cette distance, l\'évitement est déjà trop tard.'))
Q.append(ex('Avion en route de collision : comment apparaît-il dans le champ visuel ?', 'immobile, puis grossissant brusquement', ['défilant rapidement', 'clignotant', 'descendant vers l\'horizon'],
            'Relèvement constant : aucun mouvement relatif pour attirer l\'œil ; d\'où le balayage par secteurs de 10° environ.'))
Q.append(ex('Modèle de Reason : une « défaillance latente » est par exemple :', 'une procédure mal conçue par l\'organisation', ['une erreur de saisie du pilote', 'une panne moteur imprévisible', 'une rafale'],
            'Les conditions latentes sont introduites loin du poste de pilotage (conception, formation, organisation) et attendent une erreur active.'))
Q.append(ex('Dans le modèle TEM, un orage sur l\'aéroport de destination est :', 'une menace', ['une erreur', 'un état indésirable de l\'avion', 'une violation'],
            'Menace : événement extérieur à l\'équipage qui augmente la complexité ; l\'erreur est une action ou inaction de l\'équipage.'))
Q.append(ex('Dans le modèle TEM, un avion 15 kt au-dessus de la vitesse d\'approche à 500 ft est :', 'un état indésirable de l\'avion', ['une menace', 'une erreur latente', 'un incident'],
            'C\'est la conséquence d\'une menace ou d\'une erreur non gérée ; la bonne réponse est souvent la remise de gaz (approche non stabilisée).'))
Q.append(ex('L\'accident du United 173 (Portland, 1978 : panne sèche en attente pour un problème de train) a surtout mis en évidence :', 'le manque de communication et de gestion des ressources de l\'équipage',
            ['une panne de moteur', 'une erreur de contrôle aérien', 'un givrage sévère'], 'Le commandant, absorbé par le train, n\'a pas tenu compte des alertes carburant des autres membres : point de départ des programmes CRM [RÉFÉRENCÉ] NTSB AAR-79-07.'))
Q.append(ex('Période où la vigilance est la plus faible (creux circadien) :', 'entre 2 h et 6 h du matin (heure du corps)', ['entre 14 h et 16 h seulement', 'au réveil', 'entre 18 h et 20 h'],
            'Fenêtre du creux circadien (WOCL) ; un second creux, moins marqué, existe en début d\'après-midi.'))
assert len(Q) == 20, len(Q)

MOD = {'id': 'q1-humain', 't': 'Performances humaines : hypoxie, illusions, vision, alcool, modèles d\'erreur', 'h': H, 'quiz': Q}
