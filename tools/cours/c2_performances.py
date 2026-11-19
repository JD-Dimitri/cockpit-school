"""Cours II · partie 2 · module 3 : performances de classe A — vitesses de décollage, distances, pentes de montée par segment,
trajectoire nette et obstacles, atterrissage, facteurs de vent. Niveau ATPL, très difficile. 20 exercices corrigés."""
import math
from commun import ex, fr, close

H = """
<p class="lead"><b>Niveau confirmé.</b> Matière « Performances » (EASA ATPL, sujet 032). Reprend au niveau du pilote de ligne les modules « Performances » du Cours I (parties 6, 7 et 9).
Les chiffres d'un avion donné viennent toujours de son manuel de vol (AFM) ou de son logiciel de performances : ici, on apprend les règles qui les fondent.</p>

<h3>1. Les vitesses de décollage (CS 25.107)</h3>
<ul>
<li><b>V<sub>MCG</sub></b> ≤ <b>V<sub>1</sub></b> ≤ <b>V<sub>R</sub></b> ; V<sub>1</sub> ≤ V<sub>MBE</sub> (énergie maximale de freinage).</li>
<li>V<sub>R</sub> ≥ 1,05 V<sub>MCA</sub> ; V<sub>2</sub> ≥ 1,10 V<sub>MCA</sub> et V<sub>2</sub> ≥ 1,13 V<sub>SR</sub> (vitesse de décrochage de référence à 1 g).</li>
<li>V<sub>1</sub> est la vitesse de décision : la panne reconnue avant V<sub>1</sub> impose l'arrêt ; après, on décolle.</li>
</ul>

<h3>2. Les distances (CS 25.109 et 25.113)</h3>
<p><b>Distance de décollage</b> = la plus grande de : distance jusqu'à 35 ft avec panne d'un moteur à V<sub>EF</sub> ; 115 % de la distance tous moteurs jusqu'à 35 ft.
<b>Distance accélération-arrêt</b> : accélération, panne, reconnaissance, freinage, plus une marge de 2 s à V<sub>1</sub>. Le terrain impose TODR ≤ TODA, TORR ≤ TORA, ASDR ≤ ASDA.
Quand TODR = ASDR, la V<sub>1</sub> est dite « équilibrée ».</p>

<h3>3. La montée avec un moteur en panne (CS 25.121)</h3>
<table class="kv"><tbody>
<tr><th>Segment</th><th>Pente brute minimale, biréacteur / triréacteur / quadriréacteur</th></tr>
<tr><th>1<sup>er</sup> (train sorti, V<sub>LOF</sub> → rentrée du train)</th><td>positive / 0,3 % / 0,5 %</td></tr>
<tr><th>2<sup>e</sup> (train rentré, V<sub>2</sub>, jusqu'à 400 ft minimum)</th><td><b>2,4 %</b> / 2,7 % / 3,0 %</td></tr>
<tr><th>Final (lisse, V<sub>FTO</sub>)</th><td>1,2 % / 1,5 % / 1,7 %</td></tr>
</tbody></table>
<p><b>Trajectoire nette</b> = trajectoire brute diminuée de 0,8 % (bi), 0,9 % (tri) ou 1,0 % (quadri) ; elle doit franchir tous les obstacles de la trouée d'envol avec <b>35 ft</b> de marge [RÉFÉRENCÉ] CS 25.115, CAT.POL.A.210.</p>

<h3>4. L'atterrissage (CAT.POL.A.230 et 235)</h3>
<p>Piste sèche : la distance d'atterrissage certifiée ne doit pas dépasser <b>60 %</b> de la distance disponible (LDA) pour un avion à réaction, 70 % pour un turbopropulseur.
Piste mouillée : 115 % de la distance requise sur piste sèche. Pente de montée en approche interrompue (un moteur en panne) ≥ 2,1 % pour un biréacteur ; en remise de gaz tous moteurs, configuration atterrissage, ≥ 3,2 % [RÉFÉRENCÉ] CS 25.119 et 25.121(d).</p>

<h3>5. Le vent et la piste</h3>
<p>Dans les données de performances, on ne compte que <b>50 %</b> du vent de face et au moins <b>150 %</b> du vent arrière [RÉFÉRENCÉ] CS 25.105(d). Une piste montante allonge le décollage et raccourcit l'atterrissage.
La poussée réduite (température fictive) ne peut pas réduire la poussée de plus de 25 % [RÉFÉRENCÉ] AMC 25-13.</p>
<div class="box"><b>Pièges d'examen</b> : V<sub>1</sub> ne peut pas être inférieure à V<sub>MCG</sub> ; la pente nette est plus faible que la pente brute ;
le facteur 60 % porte sur la distance disponible (LDA requise = distance certifiée / 0,6).</div>
"""

Q = []
Q.append(ex('Distance d\'atterrissage certifiée sur piste sèche : 1 500 m (biréacteur). Distance disponible minimale requise ?', f'{fr(1500/0.6)} m', ['1 800 m', '2 143 m', '900 m'],
            f'LDA ≥ 1 500 / 0,6 = {fr(1500/0.6)} m. Piège : 1 500 × 1,2 = 1 800 m ou 1 500 / 0,7 = 2 143 m (turbopropulseur).'))
Q.append(ex('Même avion, piste annoncée mouillée. Distance disponible minimale ?', f'{fr(1500/0.6*1.15)} m', ['2 500 m', '1 725 m', '3 000 m'],
            f'115 % de la distance requise sur sec : 2 500 × 1,15 = {fr(1500/0.6*1.15)} m.'))
Q.append(ex('LDA = 2 400 m, piste sèche, biréacteur. Distance d\'atterrissage certifiée maximale admissible ?', f'{fr(2400*0.6)} m', ['2 400 m', '1 680 m', '1 252 m'],
            f'2 400 × 0,6 = {fr(2400*0.6)} m.'))
Q.append(ex('Distance tous moteurs jusqu\'à 35 ft : 2 000 m. Distance avec panne à V_EF jusqu\'à 35 ft : 2 250 m. Distance de décollage retenue ?', '2 300 m', ['2 250 m', '2 000 m', '2 588 m'],
            '1,15 × 2 000 = 2 300 m > 2 250 m : on retient 2 300 m.'))
Q.append(ex('Quelle relation est toujours vraie (CS 25.107) ?', 'V_MCG ≤ V1 ≤ VR', ['V1 ≤ V_MCG', 'VR ≤ V1', 'V2 ≤ V_MCA'], 'V1 doit permettre de continuer avec contrôle au sol : V1 ≥ V_MCG ; V1 ≤ VR.'))
Q.append(ex('V_SR = 120 kt, V_MCA = 115 kt. V2 minimale ?', f'{fr(max(1.13*120,1.10*115),1)} kt', ['126,5 kt', '120,0 kt', '144,0 kt'],
            f'max(1,13 × 120 ; 1,10 × 115) = max({fr(1.13*120,1)} ; {fr(1.10*115,1)}) = {fr(max(1.13*120,1.10*115),1)} kt.'))
Q.append(ex('Pente brute minimale du 2e segment pour un biréacteur :', '2,4 %', ['1,2 %', '3,0 %', '0 %'], 'CS 25.121(b) : 2,4 % (bi), 2,7 % (tri), 3,0 % (quadri).'))
Q.append(ex('Pente brute du 2e segment d\'un biréacteur : 3,1 %. Pente nette ?', '2,3 %', ['3,1 %', '3,9 %', '2,1 %'], 'Biréacteur : nette = brute − 0,8 % = 2,3 %.'))
hn = 35 + 0.023 * 3000 / 0.3048
Q.append(ex('Pente nette 2,3 % (trajectoire partant de 35 ft en fin de distance de décollage). Obstacle de 250 ft à 3 000 m de ce point. Conclusion ?',
            f'trajectoire nette à ≈ {fr(hn)} ft : marge de {fr(hn-250)} ft, insuffisante', [f'trajectoire nette à ≈ {fr(hn)} ft : conforme', '≈ 104 ft : l\'obstacle est percuté', f'≈ {fr(hn+34)} ft : conforme avec 45 ft de marge'],
            f'0,023 × 3 000 m = 69 m = {fr(0.023*3000/0.3048)} ft ; + 35 ft = {fr(hn)} ft. La trajectoire nette doit passer au moins 35 ft au-dessus de l\'obstacle (CAT.POL.A.210) : {fr(hn-250)} ft &lt; 35 ft → masse à réduire ou procédure de dégagement à modifier. Piège : 104 ft = 69 + 35 sans convertir les mètres.'))
Q.append(ex('Vent annoncé : 20 kt de face. Vent à utiliser dans le calcul de décollage :', '10 kt de face', ['20 kt de face', '30 kt de face', '0 kt'], 'CS 25.105(d) : 50 % du vent de face.'))
Q.append(ex('Vent annoncé : 6 kt arrière. Vent à utiliser :', '9 kt arrière', ['6 kt arrière', '3 kt arrière', '12 kt arrière'], 'Au moins 150 % du vent arrière : 6 × 1,5 = 9 kt.'))
Q.append(ex('Panne moteur reconnue à V1 − 5 kt, piste sèche :', 'on interrompt le décollage', ['on décolle', 'on attend VR pour décider', 'on réduit l\'autre moteur et on continue'],
            'Avant V1 : arrêt. Après V1 : décollage (la distance d\'arrêt n\'est plus garantie).'))
Q.append(ex('Pourquoi la V1 ne doit-elle pas être inférieure à V_MCG ?', 'sinon on ne pourrait pas tenir l\'axe en continuant avec un moteur en panne', ['pour ne pas dépasser la vitesse des pneus', 'pour réduire la distance d\'arrêt', 'parce que la portance est insuffisante'],
            'V_MCG : vitesse minimale de contrôle au sol, avec la gouverne de direction seule.'))
Q.append(ex('Pente de 2,4 % à 150 kt de vitesse sol. Vitesse verticale ?', f'{fr(0.024*150*101.27)} ft/min', ['240 ft/min', '36 ft/min', '3 645 ft/min'],
            f'0,024 × 150 × 101,27 = {fr(0.024*150*101.27)} ft/min.'))
Q.append(ex('Atterrissage manqué un moteur en panne (biréacteur, configuration d\'approche). Pente minimale certifiée :', '2,1 %', ['2,4 %', '3,2 %', '1,2 %'],
            'CS 25.121(d) : 2,1 % pour un biréacteur ; 3,2 % tous moteurs en configuration d\'atterrissage (CS 25.119).'))
Q.append(ex('Réduction de poussée maximale admise par la méthode de la température fictive :', '25 %', ['10 %', '50 %', 'aucune limite'], 'AMC 25-13 : la poussée réduite reste au moins à 75 % de la poussée nominale.'))
Q.append(ex('Effet d\'une température plus élevée sur la masse maximale au décollage limitée par la piste :', 'elle diminue', ['elle augmente', 'elle ne change pas', 'elle double'],
            'Air moins dense → poussée plus faible et vitesses vraies plus élevées → distances plus longues.'))
Q.append(ex('Effet d\'une piste montante sur la distance de décollage :', 'elle augmente', ['elle diminue', 'aucun effet', 'elle diminue seulement en vent arrière'], 'Une composante du poids s\'oppose à l\'accélération.'))
Q.append(ex('V1 limitée par V_MBE (énergie de freinage). Conséquence :', 'la masse au décollage peut devoir être réduite', ['V1 peut dépasser VR', 'on peut ignorer la limite par vent de face', 'la distance d\'arrêt diminue'],
            'Au-delà de V_MBE, les freins ne pourraient pas absorber l\'énergie d\'un arrêt : on réduit la masse ou l\'on choisit d\'autres volets.'))
Q.append(ex('On augmente V1 (VR et masse inchangées). Effet sur les distances requises :', 'la distance accélération-arrêt augmente, la distance de décollage diminue',
            ['les deux augmentent', 'les deux diminuent', 'la distance accélération-arrêt diminue, la distance de décollage augmente'],
            'Plus V1 est haute, plus on freine tard (ASDR ↑) mais moins on accélère sur un moteur (TODR ↓). Le croisement des deux courbes donne la V1 équilibrée.'))
assert len(Q) == 20, len(Q)

MOD = {'id': 'q2-performances', 't': 'Performances de classe A : vitesses, distances, segments, atterrissage', 'h': H, 'quiz': Q}
