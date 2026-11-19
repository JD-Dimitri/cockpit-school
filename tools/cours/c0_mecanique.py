"""Cours 0 · thème 4 : mécanique (masse et poids, vitesse et accélération, lois de Newton, énergie, puissance,
moments). 30 exercices corrigés."""
import math
from commun import ex, fr, close

G = 9.81

H = """
<p>Un avion obéit aux lois de la mécanique de Newton, comme une voiture ou une balle. Ce module en donne l'essentiel :
ce qui fait accélérer, ralentir, monter ou tourner un avion.</p>

<h3>1. Masse et poids</h3>
<p>La <b>masse</b> m (kg) est la quantité de matière ; le <b>poids</b> P = m × g est une force (N), avec g ≈ 9,81 m/s².
Un avion de 70 t pèse 70 000 × 9,81 ≈ 687 kN. En aviation on parle souvent de « masse » (devis de masse) : c'est bien la masse en kg.</p>

<h3>2. Vitesse et accélération</h3>
<p>Accélération a = Δv / Δt. Mouvement uniformément accéléré depuis l'arrêt : v = a t et d = ½ a t² = v² / (2a).
C'est la base des distances de décollage et de freinage : <b>la distance varie comme le carré de la vitesse</b>.</p>

<h3>3. Les trois lois de Newton</h3>
<ul><li><b>Inertie</b> : sans force résultante, un corps garde sa vitesse (vol rectiligne uniforme : forces équilibrées).</li>
<li><b>Principe fondamental</b> : ΣF = m × a. Au décollage : a = (poussée − traînée − frottement) / m.</li>
<li><b>Actions réciproques</b> : le réacteur projette l'air vers l'arrière, l'air pousse le réacteur vers l'avant ; l'aile dévie l'air vers le bas, l'air pousse l'aile vers le haut.</li></ul>

<h3>4. Travail, énergie, puissance</h3>
<p>Énergie cinétique E<sub>c</sub> = ½ m v² ; énergie potentielle E<sub>p</sub> = m g h. Un avion qui descend sans moteur échange
de l'altitude contre de la vitesse (ou l'inverse) : c'est la <b>gestion de l'énergie</b>. Puissance P = F × v (W).
Les freins doivent absorber l'énergie cinétique : à vitesse doublée, quatre fois plus d'énergie.</p>

<h3>5. Moments et équilibre</h3>
<p>Moment d'une force = force × bras de levier (N·m). L'avion est en équilibre quand la somme des moments autour du centre de gravité est nulle :
c'est le rôle de la gouverne de profondeur (plan horizontal).</p>

<h3>6. Le mouvement circulaire</h3>
<p>Pour tourner, il faut une force dirigée vers le centre : F = m v² / R. En virage, c'est la portance inclinée qui la fournit ;
d'où le facteur de charge n = 1 / cos φ.</p>
<div class="box"><b>Unités SI</b> : travaillez en kg, m, s, N, J, W, puis convertissez à la fin (kt, ft…).</div>
"""

Q = []
Q.append(ex('Le poids d\'un avion de 1 000 kg (g = 9,81 m/s²) :', '9 810 N', ['1 000 N', '981 N', '98 100 N'], 'P = m g = 1 000 × 9,81 = 9 810 N.'))
Q.append(ex('La masse d\'un avion sur la Lune serait :', 'la même que sur la Terre', ['six fois plus petite', 'nulle', 'six fois plus grande'],
            'La masse ne dépend pas du lieu ; seul le poids change (g lunaire ≈ 1,62 m/s²).'))
Q.append(ex('Un avion passe de 0 à 60 m/s en 30 s. Accélération moyenne :', '2 m/s²', ['0,5 m/s²', '30 m/s²', '1 800 m/s²'], 'a = 60 / 30 = 2 m/s².'))
Q.append(ex('En vol rectiligne à vitesse constante, la somme des forces est :', 'nulle', ['égale au poids', 'égale à la poussée', 'dirigée vers l\'avant'],
            'Première loi de Newton : vitesse constante ⇔ forces équilibrées (portance = poids, poussée = traînée).'))
Q.append(ex('Un réacteur pousse l\'avion vers l\'avant parce que :', 'il projette une masse d\'air vers l\'arrière', ['il aspire l\'air devant l\'avion', 'les gaz poussent sur l\'air extérieur', 'il est plus léger que l\'air'],
            'Troisième loi de Newton : l\'action sur l\'air (vers l\'arrière) entraîne une réaction égale et opposée sur le moteur.'))
Q.append(ex('Énergie cinétique d\'un avion de 2 000 kg à 50 m/s :', '2,5 MJ', ['100 kJ', '5 MJ', '50 kJ'], '½ × 2 000 × 50² = 2 500 000 J = 2,5 MJ.'))
Q.append(ex('Énergie potentielle de 1 000 kg élevés de 100 m :', f'{fr(1000*G*100/1e3)} kJ', ['100 kJ', '9,81 kJ', '1 000 kJ'], 'm g h = 1 000 × 9,81 × 100 = 981 000 J = 981 kJ.'))
Q.append(ex('Si la vitesse double, l\'énergie que les freins doivent absorber est multipliée par :', '4', ['2', '8', '√2'], 'E_c = ½ m v² : (2v)² = 4 v².'))
Q.append(ex('Moment d\'une force de 200 N à 1,5 m de l\'axe :', '300 N·m', ['133 N·m', '201,5 N·m', '30 N·m'], '200 × 1,5 = 300 N·m.'))
Q.append(ex('La puissance nécessaire pour vaincre une traînée de 1 000 N à 50 m/s :', '50 kW', ['20 kW', '1 050 W', '500 kW'], 'P = F v = 1 000 × 50 = 50 000 W.'))
# moyen
Q.append(ex('Accélération 2 m/s² depuis l\'arrêt. Distance pour atteindre 60 m/s ?', '900 m', ['1 800 m', '30 m', '450 m'], 'd = v² / (2a) = 3 600 / 4 = 900 m.'))
Q.append(ex('Même accélération : distance pour atteindre 70 m/s ?', f'{fr(70**2/4)} m', ['1 050 m', '900 m', '1 400 m'], f'd = 4 900 / 4 = {fr(70**2/4)} m : +17 % de vitesse demande +36 % de distance.'))
Q.append(ex('Avion de 2 000 kg, poussée nette (poussée − traînée − frottement) 3 000 N. Accélération ?', '1,5 m/s²', ['0,67 m/s²', '6 m/s²', '15 m/s²'], 'a = F / m = 3 000 / 2 000 = 1,5 m/s².'))
Q.append(ex('Décélération au freinage 3 m/s² depuis 60 m/s. Distance d\'arrêt ?', '600 m', ['1 200 m', '20 m', '180 m'], 'd = v² / (2a) = 3 600 / 6 = 600 m.'))
Q.append(ex('Planeur de 400 kg descendant de 1 000 m sans gain de vitesse : énergie dissipée par la traînée ?', f'{fr(400*G*1000/1e6,2)} MJ', ['0,40 MJ', '39,24 MJ', '4,00 MJ'],
            f'm g h = 400 × 9,81 × 1 000 = {fr(400*G*1000/1e6,2)} MJ.'))
Q.append(ex('Si un avion de 70 t vole à 70 m/s et tire sur le manche pour convertir 20 m/s de vitesse en altitude (sans moteur ni traînée), il gagne :',
            f'{fr((70**2-50**2)/(2*G))} m', ['20 m', '250 m', '61 m'],
            f'½(v₁² − v₂²) = g Δh → Δh = (4 900 − 2 500) / (2 × 9,81) = {fr((70**2-50**2)/(2*G))} m. La masse s\'élimine.'))
Q.append(ex('Force centripète sur 1 000 kg à 50 m/s sur un rayon de 500 m :', '5 000 N', ['100 N', '25 000 N', '50 000 N'], 'F = m v² / R = 1 000 × 2 500 / 500 = 5 000 N.'))
Q.append(ex('Puissance pour monter 1 000 kg à 5 m/s verticalement (sans traînée) :', f'{fr(1000*G*5/1e3,2)} kW', ['5,00 kW', '49,05 W', '0,49 kW'], f'P = m g Vz = 1 000 × 9,81 × 5 = {fr(1000*G*5)} W.'))
Q.append(ex('Deux masses : 60 kg à 2 m et 40 kg à 4,5 m d\'une référence. Position du centre de gravité ?', '3 m', ['3,25 m', '2,5 m', '3,5 m'], '(120 + 180) / 100 = 3 m.'))
Q.append(ex('Un avion de 50 t en montée à vitesse constante sur une pente de 5° : composante du poids qui s\'oppose à l\'avancement ?',
            f'{fr(50000*G*math.sin(math.radians(5))/1e3)} kN', ['490 kN', '25 kN', '0 kN'],
            f'P sin γ = 50 000 × 9,81 × sin 5° = {fr(50000*G*math.sin(math.radians(5))/1e3,1)} kN : la poussée doit compenser traînée + P sin γ.'))
# difficile
Q.append(ex('Pente de montée maximale : (T − D) / P = sin γ. T = 240 kN, D = 120 kN, m = 70 t. Pente ?', f'{fr(math.degrees(math.asin(120000/(70000*G))),1)}°', ['10,0°', '17,5°', '5,0°'],
            f'sin γ = 120 000 / 686 700 = {fr(120000/(70000*G),3)} → γ = {fr(math.degrees(math.asin(120000/(70000*G))),1)}°.'))
Q.append(ex('Même avion après panne d\'un moteur (T = 120 kN, D = 132 kN avec la dérive de compensation) :', 'il ne peut pas monter', ['il monte à 5°', 'il monte à 10°', 'il monte à 1°'],
            'T − D = −12 kN < 0 : l\'avion ne peut que descendre à cette vitesse. D\'où les exigences de pente minimale en cas de panne moteur.'))
Q.append(ex('Énergie cinétique d\'un avion de 60 t à 140 kt (72 m/s) au toucher :', f'{fr(0.5*60000*72**2/1e6,1)} MJ', ['4,3 MJ', '311,0 MJ', '2,2 MJ'],
            f'½ × 60 000 × 72² = {fr(0.5*60000*72**2/1e6,1)} MJ, à dissiper par les freins, les inverseurs et la traînée.'))
Q.append(ex('Un avion de 60 t touche à 72 m/s au lieu de 67 m/s. Énergie de freinage supplémentaire :', f'{fr((72**2/67**2-1)*100)} %', ['7 %', '4 %', '22 %'],
            f'(72 / 67)² = {fr((72/67)**2,3)} : environ +{fr((72**2/67**2-1)*100)} % pour +7 % de vitesse.'))
Q.append(ex('Accélération longitudinale lors d\'un freinage à 0,4 g :', f'{fr(0.4*G,2)} m/s²', ['0,40 m/s²', '9,81 m/s²', '24,53 m/s²'], f'0,4 × 9,81 = {fr(0.4*G,2)} m/s².'))
Q.append(ex('Rayon d\'un virage à 2 g de facteur de charge (φ = 60°) à 60 m/s :', f'{fr(60**2/(G*math.tan(math.radians(60))))} m', ['367 m', '183 m', '600 m'],
            f'R = v² / (g tan φ) = 3 600 / (9,81 × 1,732) = {fr(60**2/(G*math.tan(math.radians(60))))} m.'))
Q.append(ex('Facteur de charge en ressource : rayon 400 m à 80 m/s en bas de la courbe :', f'{fr(1+80**2/(400*G),2)}', ['1,63', '2,00', '3,00'],
            f'n = 1 + v² / (R g) = 1 + 6 400 / 3 924 = {fr(1+80**2/(400*G),2)}.'))
Q.append(ex('Puissance de propulsion d\'un avion à 230 m/s avec 2 × 60 kN de poussée en croisière :', f'{fr(120000*230/1e6,1)} MW', ['13,8 MW', '0,1 MW', '2,8 MW'],
            f'P = T × v = 120 000 × 230 = {fr(120000*230/1e6,1)} MW.'))
Q.append(ex('Vitesse de fin de chute libre d\'un objet tombé de 20 m sans frottement :', f'{fr(math.sqrt(2*G*20),1)} m/s', ['20,0 m/s', '14,0 m/s', '392,4 m/s'],
            f'v = √(2 g h) = √(392,4) = {fr(math.sqrt(2*G*20),1)} m/s.'))
Q.append(ex('Couple autour du centre de gravité : 5 000 N à 10 m en arrière, à équilibrer par une force à 2 m en avant. Force nécessaire ?', '25 000 N', ['1 000 N', '10 000 N', '50 000 N'],
            'Équilibre des moments : 5 000 × 10 = F × 2 → F = 25 000 N.'))
assert len(Q) == 30, len(Q)

MOD = {'id': 'm0-meca', 't': 'Mécanique : forces, mouvement, énergie', 'h': H, 'quiz': Q}
