"""Cours 0 · thème 2 : géométrie et trigonométrie appliquées au vol (angles, Pythagore, sinus/cosinus/tangente,
règle du 1 sur 60, vent de travers, pente de descente, virage). 30 exercices corrigés."""
import math
from commun import ex, fr, close

D = math.radians

H = """
<p>Le pilote raisonne en angles : cap, route, dérive, pente, inclinaison. Ce module donne les outils de géométrie
qui servent tous les jours en vol, sans démonstration inutile.</p>

<h3>1. Angles et directions</h3>
<p>Les directions se comptent en degrés, de 000° à 359°, dans le sens des aiguilles d'une montre à partir du nord.
L'<b>inverse</b> d'une direction s'obtient en ajoutant ou en retirant 180° : l'inverse de 070° est 250°.
Une piste « 27 » est orientée vers 270° environ (on arrondit à la dizaine et on retire le zéro).</p>

<h3>2. Le triangle rectangle et Pythagore</h3>
<p>Dans un triangle rectangle, c² = a² + b² (c = hypoténuse). Une balise à 4 NM au nord et 3 NM à l'est est à 5 NM.</p>

<h3>3. Sinus, cosinus, tangente</h3>
<p>Pour un angle α d'un triangle rectangle : sin α = opposé / hypoténuse, cos α = adjacent / hypoténuse,
tan α = opposé / adjacent. Valeurs à connaître : sin 30° = 0,5 ; cos 60° = 0,5 ; sin 45° = cos 45° ≈ 0,707 ;
cos 30° = sin 60° ≈ 0,866 ; tan 45° = 1 ; tan 3° ≈ 0,052.</p>

<h3>4. Le vent : composantes de face et de travers</h3>
<p>Un vent de vitesse W faisant l'angle α avec l'axe de piste se décompose en :
<b>vent de face</b> = W × cos α et <b>vent de travers</b> = W × sin α.
Exemple : vent 20 kt à 30° de l'axe → face 17 kt, travers 10 kt.</p>

<h3>5. La règle du 1 sur 60</h3>
<p>Pour les petits angles, <b>1° d'écart à 60 NM correspond à 1 NM</b> de côté. D'où : écart (NM) = angle (°) × distance (NM) / 60.
Une erreur de cap de 5° sur 60 NM écarte de 5 NM. La règle vient de l'approximation tan α ≈ α en radians (1 rad ≈ 57,3°, arrondi à 60).</p>

<h3>6. La pente de descente</h3>
<p>Une pente de 3° signifie tan 3° ≈ 0,052, soit environ <b>318 ft par NM</b> (6 076 ft × 0,052). Règle pratique :
<b>hauteur ≈ 300 ft × distance (NM)</b> sur un plan de 3°. Vitesse verticale ≈ vitesse sol (kt) × 5 (en ft/min) pour 3°.</p>

<h3>7. Le virage</h3>
<p>En virage stabilisé à inclinaison φ, le facteur de charge vaut n = 1 / cos φ (à 60° : n = 2). Rayon de virage :
R = V² / (g × tan φ). Le virage au <b>taux standard</b> (3°/s) fait un tour en 2 minutes ; inclinaison approchée = vitesse vraie (kt) / 10 + 7.</p>
<div class="box"><b>Astuce</b> : vérifiez qu'un sinus ou un cosinus reste entre 0 et 1, et qu'un vent de travers n'est jamais supérieur au vent total.</div>
"""

def r(x, d=0): return round(x, d)

Q = []
Q.append(ex('Quel est l\'inverse de la direction 070° ?', '250°', ['290°', '110°', '340°'], '070 + 180 = 250°.'))
Q.append(ex('Quel est l\'inverse de 300° ?', '120°', ['060°', '180°', '210°'], '300 − 180 = 120°.'))
Q.append(ex('Une piste orientée à 238° magnétique porte le numéro :', '24', ['23', '238', '06'], 'On arrondit à la dizaine (240°) et on garde deux chiffres : 24.'))
Q.append(ex('Balise à 6 NM au nord et 8 NM à l\'est. Distance directe ?', '10 NM', ['14 NM', '12 NM', '9 NM'], '√(6² + 8²) = √100 = 10 NM.'))
Q.append(ex('sin 30° vaut :', '0,5', ['0,866', '0,707', '1'], 'Valeur à connaître : sin 30° = 0,5.'))
Q.append(ex('cos 60° vaut :', '0,5', ['0,866', '0', '0,707'], 'cos 60° = sin 30° = 0,5.'))
Q.append(ex('Vent 20 kt à 30° de l\'axe de piste. Vent de travers ?', '10 kt', ['17 kt', '20 kt', '14 kt'], 'Travers = 20 × sin 30° = 10 kt.'))
Q.append(ex('Même vent (20 kt à 30°). Vent de face ?', '17 kt', ['10 kt', '20 kt', '14 kt'], f'Face = 20 × cos 30° = {fr(20*math.cos(D(30)),1)} kt ≈ 17 kt.'))
Q.append(ex('Vent 25 kt perpendiculaire à la piste (90°). Vent de face ?', '0 kt', ['25 kt', '12,5 kt', '17,7 kt'], 'cos 90° = 0 : tout le vent est de travers.'))
Q.append(ex('Règle du 1 sur 60 : 4° d\'erreur de route sur 90 NM écartent de :', '6 NM', ['4 NM', '9 NM', '1,5 NM'], 'Écart = 4 × 90 / 60 = 6 NM.'))
# moyen
Q.append(ex('Vent 30 kt à 45° de l\'axe. Vent de travers ?', f'{fr(30*math.sin(D(45)),0)} kt', ['15 kt', '30 kt', '26 kt'], f'30 × sin 45° = 30 × 0,707 = {fr(30*math.sin(D(45)),1)} kt.'))
Q.append(ex('Piste 27 (270°), vent du 300° pour 24 kt. Vent de travers ?', '12 kt', ['21 kt', '24 kt', '18 kt'], 'Angle = 300 − 270 = 30° ; 24 × sin 30° = 12 kt.'))
Q.append(ex('Piste 09, vent du 130° pour 20 kt. Vent de face (arrondi) ?', f'{fr(20*math.cos(D(40)))} kt', ['13 kt', '20 kt', '10 kt'], f'Angle = 40° ; 20 × cos 40° = {fr(20*math.cos(D(40)),1)} kt.'))
Q.append(ex('Après 30 NM, on constate un écart de 2 NM à droite de la route. Erreur angulaire ?', '4°', ['2°', '6°', '15°'], '1 sur 60 : angle = 2 × 60 / 30 = 4°.'))
Q.append(ex('Hauteur sur un plan de descente de 3° à 5 NM du seuil (règle pratique) :', '1 500 ft', ['500 ft', '3 000 ft', '1 000 ft'], '300 ft par NM : 5 × 300 = 1 500 ft.'))
Q.append(ex('Hauteur exacte à 5 NM sur un plan de 3° (1 NM = 6 076 ft) :', f'{fr(5*6076*math.tan(D(3)))} ft', ['1 500 ft', '1 800 ft', '1 520 ft'], f'5 × 6 076 × tan 3° = 30 380 × 0,0524 = {fr(5*6076*math.tan(D(3)))} ft. La règle des 300 ft/NM arrondit légèrement.'))
Q.append(ex('Vitesse verticale sur un plan de 3° à 140 kt de vitesse sol (règle pratique) :', '700 ft/min', ['420 ft/min', '1 400 ft/min', '300 ft/min'], 'Vz ≈ Vs × 5 = 140 × 5 = 700 ft/min.'))
Q.append(ex('Facteur de charge en virage stabilisé à 60° d\'inclinaison :', '2', ['1,5', '1,15', '3'], 'n = 1 / cos 60° = 1 / 0,5 = 2.'))
Q.append(ex('Facteur de charge à 45° d\'inclinaison :', f'{fr(1/math.cos(D(45)),2)}', ['1,00', '2,00', '1,15'], f'n = 1 / cos 45° = {fr(1/math.cos(D(45)),3)}.'))
Q.append(ex('Inclinaison approchée pour un virage au taux standard à 120 kt (vitesse vraie) :', '19°', ['12°', '25°', '30°'], 'Règle : 120 / 10 + 7 = 19°.'))
# difficile
Q.append(ex('Vitesse vraie 120 kt, vent de travers pur 30 kt. Angle de correction de dérive ?', f'{fr(math.degrees(math.asin(30/120)),1)}°', ['15,0°', '25,0°', '30,0°'],
            f'sin(dérive) = 30 / 120 = 0,25 → dérive = {fr(math.degrees(math.asin(30/120)),1)}°. Approximation 1 sur 60 : 30 × 60 / 120 = 15° (moins précise).'))
Q.append(ex('Même cas (120 kt, travers pur 30 kt). Vitesse sol ?', f'{fr(120*math.cos(math.asin(0.25)),1)} kt', ['120,0 kt', '90,0 kt', '123,7 kt'],
            f'Vs = 120 × cos({fr(math.degrees(math.asin(0.25)),1)}°) = {fr(120*math.cos(math.asin(0.25)),1)} kt : un vent de travers réduit aussi la vitesse sol.'))
Q.append(ex('Rayon d\'un virage à 30° d\'inclinaison à 100 m/s (g = 9,81 m/s²) :', f'{fr(100**2/(9.81*math.tan(D(30))))} m', ['1 019 m', '588 m', '2 038 m'],
            f'R = V² / (g tan φ) = 10 000 / (9,81 × 0,577) = {fr(100**2/(9.81*math.tan(D(30))))} m.'))
close(100**2 / (9.81 * math.tan(D(30))), 1765.5, 1e-3)
Q.append(ex('Taux de virage à 30° d\'inclinaison et 100 m/s (ω = g tan φ / V) :', f'{fr(math.degrees(9.81*math.tan(D(30))/100),1)} °/s', ['3,0 °/s', '1,5 °/s', '5,7 °/s'],
            f'ω = 9,81 × 0,577 / 100 = 0,0566 rad/s = {fr(math.degrees(9.81*math.tan(D(30))/100),2)} °/s.'))
Q.append(ex('Pour revenir sur la route en arrivant à destination à 60 NM, après un écart de 3 NM constaté à mi-parcours (30 NM) : correction de cap totale ?', '12°', ['6°', '3°', '9°'],
            'Erreur angulaire : 3 × 60 / 30 = 6° ; angle pour rejoindre en 30 NM : 3 × 60 / 30 = 6° ; total 6 + 6 = 12°.'))
Q.append(ex('Plan de descente de 3°. À quelle distance du seuil doit-on être à 2 400 ft (règle pratique) ?', '8 NM', ['6 NM', '12 NM', '7,2 NM'], '2 400 / 300 = 8 NM.'))
Q.append(ex('Vitesse de décrochage 60 kt en ligne droite. En virage à 60° d\'inclinaison :', f'{fr(60*math.sqrt(2),1)} kt', ['120,0 kt', '60,0 kt', '69,3 kt'],
            f'V_S virage = V_S × √n = 60 × √2 = {fr(60*math.sqrt(2),1)} kt : le facteur de charge 2 augmente la vitesse de décrochage de 41 %.'))
Q.append(ex('Piste 33, vent du 030° pour 30 kt. Composantes (face ; travers) ?', f'{fr(30*math.cos(D(60)))} kt ; {fr(30*math.sin(D(60)))} kt', ['26 kt ; 15 kt', '30 kt ; 0 kt', '21 kt ; 21 kt'],
            f'Piste 33 ≈ 330° ; angle 030 − 330 = 60° ; face 30 × cos 60° = 15 kt ; travers 30 × sin 60° = {fr(30*math.sin(D(60)),1)} kt.'))
Q.append(ex('Pente de montée de 7 % à 100 kt de vitesse sol. Vitesse verticale (1 kt ≈ 101,3 ft/min) ?', f'{fr(0.07*100*101.27)} ft/min', ['700 ft/min', '1 000 ft/min', '500 ft/min'],
            f'Vz = 7 % × 100 × 101,3 = {fr(0.07*100*101.27)} ft/min.'))
Q.append(ex('Un avion monte à 1 200 ft/min à 150 kt de vitesse sol. Pente en degrés ?', f'{fr(math.degrees(math.atan(1200/(150*101.27))),1)}°', ['8,0°', '1,2°', '7,9°'],
            f'tan γ = 1 200 / (150 × 101,3) = {fr(1200/(150*101.27),4)} → γ = {fr(math.degrees(math.atan(1200/(150*101.27))),1)}°.'))
assert len(Q) == 30, len(Q)

MOD = {'id': 'm0-trigo', 't': 'Géométrie et trigonométrie du vol', 'h': H, 'quiz': Q}
