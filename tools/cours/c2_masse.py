"""Cours II · partie 2 · module 4 : masse et centrage du transport aérien — masses de structure, masse maximale au décollage
réellement utilisable, charge offerte, moments, indices, effet du carburant. Niveau ATPL, très difficile. 20 exercices corrigés."""
from commun import ex, fr, close

H = """
<p class="lead"><b>Niveau confirmé.</b> Matière « Masse et centrage » (EASA ATPL, sujet 031). Reprend les formules 7 et 8 des calculs du pilote de ligne (Cours I, partie 9) avec des cas complets.
Les masses d'un avion réel viennent de sa fiche de pesée et de son manuel ; celles des exercices sont des valeurs d'école.</p>

<h3>1. Les masses</h3>
<table class="kv"><tbody>
<tr><th>DOM (masse de base opérationnelle)</th><td>avion vide + équipage, équipement d'exploitation, restauration, eau</td></tr>
<tr><th>ZFW (masse sans carburant)</th><td>DOM + charge marchande (passagers, bagages, fret)</td></tr>
<tr><th>TOW (masse au décollage)</th><td>ZFW + carburant au décollage (sans le carburant de roulage)</td></tr>
<tr><th>LW (masse à l'atterrissage)</th><td>TOW − carburant d'étape (trip fuel)</td></tr>
</tbody></table>
<p>Limites de structure : <b>MZFW</b> (le carburant des ailes soulage la flexion de l'emplanture : au-delà de MZFW, la charge dans le fuselage serait trop grande),
<b>MTOW</b> et <b>MLW</b> (train et structure à l'impact). La masse au décollage utilisable est la plus petite de :
MTOW (structure ou performances) ; MLW + carburant d'étape ; MZFW + carburant au décollage.
<b>Charge offerte</b> = masse au décollage utilisable − DOM − carburant au décollage.</p>

<h3>2. Masses forfaitaires des passagers</h3>
<p>Pour un avion de 20 sièges et plus, la masse forfaitaire d'un adulte est 84 kg (bagage à main compris), d'un enfant 35 kg [RÉFÉRENCÉ] CAT.POL.MAB.100, tableau 1.
L'exploitant peut aussi utiliser les masses réelles ou des masses issues de ses propres pesées.</p>

<h3>3. Le centrage</h3>
<p>Moment = masse × bras de levier. X<sub>CG</sub> = Σ moments / Σ masses. Pour éviter les grands nombres, on utilise un <b>indice</b> : I = m (x − x<sub>réf</sub>) / C + K.
Déplacer une masse m de d mètres : Δx<sub>CG</sub> = m d / M. Ajouter une masse m au bras x : nouveau CG = (M X + m x) / (M + m).
Le carburant consommé déplace le centre de gravité ; le devis de masse et centrage vérifie le CG à ZFW, TOW et LW (et souvent pendant tout le vol).</p>
<div class="box"><b>Pièges d'examen</b> : la masse maximale utilisable est le <b>minimum</b> des trois limites ; le carburant de roulage n'entre pas dans la TOW ;
un CG hors limites à la ZFW reste un problème même si celui de la TOW est correct (cas d'un vol où l'on brûlerait tout le carburant).</div>
"""

DOM, MTOW, MLW, MZFW = 43000, 78000, 66000, 61000
Q = []
Q.append(ex('DOM 43 000 kg ; 150 passagers à 84 kg ; 2 600 kg de bagages et fret. ZFW ?', f'{fr(DOM+150*84+2600)} kg', ['55 600 kg', '57 000 kg', '45 600 kg'],
            f'43 000 + 12 600 + 2 600 = {fr(DOM+150*84+2600)} kg.'))
Q.append(ex('Même ZFW, carburant au décollage 14 500 kg (roulage 300 kg en plus). TOW ?', f'{fr(DOM+150*84+2600+14500)} kg', ['72 900 kg', '72 400 kg', '58 500 kg'],
            f'{fr(DOM+150*84+2600)} + 14 500 = {fr(DOM+150*84+2600+14500)} kg : le roulage est consommé avant le lâcher des freins.'))
tof, trip = 14500, 11000
lim = min(MTOW, MLW + trip, MZFW + tof)
Q.append(ex(f'MTOW {fr(MTOW)} kg, MLW {fr(MLW)} kg, MZFW {fr(MZFW)} kg ; carburant au décollage {fr(tof)} kg dont étape {fr(trip)} kg. Masse au décollage utilisable ?',
            f'{fr(lim)} kg', [f'{fr(MTOW)} kg', f'{fr(MLW+trip)} kg', f'{fr(MTOW-tof)} kg'],
            f'min({fr(MTOW)} ; {fr(MLW)} + {fr(trip)} = {fr(MLW+trip)} ; {fr(MZFW)} + {fr(tof)} = {fr(MZFW+tof)}) = {fr(lim)} kg.'))
Q.append(ex('Dans ce cas, quelle limite est contraignante ?', 'la MZFW', ['la MTOW', 'la MLW', 'aucune'], f'MZFW + carburant = {fr(MZFW+tof)} kg est la plus petite des trois.'))
Q.append(ex('Même cas : charge offerte maximale (DOM 43 000 kg) ?', f'{fr(lim-DOM-tof)} kg', [f'{fr(MTOW-DOM-tof)} kg', f'{fr(MZFW)} kg', f'{fr(lim-DOM)} kg'],
            f'{fr(lim)} − 43 000 − 14 500 = {fr(lim-DOM-tof)} kg (soit exactement MZFW − DOM).'))
trip2, tof2 = 2500, 8000
lim2 = min(MTOW, MLW + trip2, MZFW + tof2)
Q.append(ex(f'Vol court : carburant au décollage {fr(tof2)} kg dont étape {fr(trip2)} kg. Masse au décollage utilisable ?', f'{fr(lim2)} kg', [f'{fr(MTOW)} kg', f'{fr(MZFW+tof2)} kg', f'{fr(MLW)} kg'],
            f'min({fr(MTOW)} ; {fr(MLW+trip2)} ; {fr(MZFW+tof2)}) = {fr(lim2)} kg : sur une étape courte, c\'est souvent la MLW qui limite.'))
Q.append(ex('Pourquoi existe-t-il une masse maximale sans carburant (MZFW) ?', 'le carburant dans les ailes réduit la flexion à l\'emplanture', ['pour limiter la vitesse de décrochage', 'pour protéger le train', 'pour limiter la consommation'],
            'La charge dans le fuselage fait fléchir les ailes vers le haut en vol ; le poids du carburant dans les ailes s\'y oppose. Sans carburant, la charge de fuselage admissible est plus faible.'))
Q.append(ex('Masse forfaitaire d\'un passager adulte (avion de 20 sièges et plus, EASA) :', '84 kg', ['75 kg', '90 kg', '100 kg'], 'CAT.POL.MAB.100, tableau 1 : 84 kg, bagage à main compris.'))
M, X = 60000, 17.80
Q.append(ex('Avion 60 000 kg, CG à 17,80 m. On charge 1 500 kg de fret à 25,00 m. Nouveau CG ?', f'{fr((M*X+1500*25)/(M+1500),3)} m', ['18,100 m', '18,000 m', '17,620 m'],
            f'(60 000 × 17,80 + 1 500 × 25,00) / 61 500 = {fr(M*X+1500*25)} / 61 500 = {fr((M*X+1500*25)/(M+1500),3)} m.'))
Q.append(ex('Avion 60 000 kg : 20 passagers (84 kg) passent de la rangée à 14 m à la rangée à 26 m. Déplacement du CG ?', f'{fr(20*84*12/M,3)} m vers l\'arrière',
           ['0,028 m vers l\'arrière', '3,360 m vers l\'arrière', f'{fr(20*84*12/M,3)} m vers l\'avant'],
           f'Δx = m d / M = 1 680 × 12 / 60 000 = {fr(20*84*12/M,3)} m vers l\'arrière.'))
lemac, mac = 16.20, 4.20
Q.append(ex('LEMAC 16,20 m, MAC 4,20 m. Limites 18 % à 34 % MAC. CG à 16,85 m :', 'hors limites (trop avant)', ['dans les limites', 'hors limites (trop arrière)', 'exactement en limite avant'],
            f'(16,85 − 16,20) / 4,20 = {fr((16.85-lemac)/mac*100,1)} % MAC &lt; 18 % : centrage trop avant.'))
q = (0.18 * mac + lemac - 16.85)
need = 60000 * q / (25.0 - 16.85)
Q.append(ex('Avion 60 000 kg, CG 16,85 m (LEMAC 16,20 m, MAC 4,20 m). Quelle masse de fret déplacer de la soute avant (8 m) vers la soute arrière (25 m) pour atteindre 18 % MAC ?',
            f'{fr(60000*q/17)} kg', [f'{fr(need)} kg', f'{fr(60000*q/8)} kg', f'{fr(60000*0.18*mac/17)} kg'],
            f'CG visé : 16,20 + 0,18 × 4,20 = {fr(lemac+0.18*mac,3)} m ; Δx = {fr(q,3)} m ; m = M Δx / d = 60 000 × {fr(q,3)} / 17 = {fr(60000*q/17)} kg.'))
Q.append(ex('Indice : I = m (x − 18) / 1 000 + 50. Masse de 1 200 kg à x = 28 m. Indice partiel (sans la constante K) ?', f'{fr(1200*(28-18)/1000,1)}', ['62,0', '33,6', '1,2'],
            f'1 200 × (28 − 18) / 1 000 = {fr(1200*10/1000,1)} ; la constante K = 50 ne s\'ajoute qu\'une fois, pour l\'avion de base.'))
Q.append(ex('Avion de base : masse 40 000 kg, indice 45. Charge : indices partiels +12,0 (fret) et −4,5 (passagers avant), masse ajoutée 8 000 kg. Indice total ?', '52,5', ['61,5', '45,0', '57,0'],
            '45 + 12,0 − 4,5 = 52,5. On additionne les indices, puis on lit le CG sur le graphique de l\'exploitant.'))
Q.append(ex('Le carburant des réservoirs d\'aile, situé en avant du CG, est consommé pendant le vol. Le CG :', 'recule', ['avance', 'ne bouge pas', 'monte seulement'],
            'On retire une masse placée en avant : le CG se déplace vers l\'arrière. Il faut donc vérifier la limite arrière à l\'atterrissage et à la ZFW.'))
Q.append(ex('Masse 70 000 kg, CG 18,40 m. On consomme 9 000 kg de carburant situé à 17,20 m. Nouveau CG ?', f'{fr((70000*18.40-9000*17.20)/61000,3)} m', ['18,400 m', '18,246 m', '17,200 m'],
            f'(70 000 × 18,40 − 9 000 × 17,20) / 61 000 = {fr((70000*18.40-9000*17.20)/61000,3)} m.'))
Q.append(ex('Le carburant de roulage (300 kg) est-il compté dans la masse au décollage ?', 'non, il est consommé avant le lâcher des freins', ['oui, toujours', 'oui, s\'il reste dans les réservoirs', 'seulement en été'],
            'La masse maximale de roulage (MRW, ou MTW) est un peu supérieure à la MTOW pour cette raison.'))
Q.append(ex('Masse au décollage limitée par les performances de piste à 74 000 kg ; MTOW structurale 78 000 kg ; autres limites plus élevées. Masse maximale au décollage à retenir :', '74 000 kg', ['78 000 kg', '76 000 kg', '152 000 kg'],
            'On prend toujours la plus restrictive des limites : structure, piste, montée, obstacles, freins, pneus, atterrissage.'))
Q.append(ex('Un CG trop avant entraîne :', 'une vitesse de rotation plus élevée et des efforts au manche plus grands', ['une instabilité en tangage', 'une consommation plus faible', 'une vitesse de décrochage plus faible'],
            'La gouverne de profondeur doit fournir plus de déportance : décrochage plus haut, rotation plus difficile, traînée plus forte.'))
Q.append(ex('Charge offerte 15 000 kg ; charge prévue 13 200 kg. Le chef d\'escale peut-il accepter 1 500 kg de fret de dernière minute ?', 'oui, il reste 1 800 kg de sous-charge',
            ['non, il manque 300 kg', 'oui, il reste 1 500 kg', 'non, la charge offerte est dépassée de 1 500 kg'],
            'Sous-charge (underload) = 15 000 − 13 200 = 1 800 kg ≥ 1 500 kg ; le centrage doit ensuite être revérifié (modification de dernière minute, LMC).'))
assert len(Q) == 20, len(Q)

MOD = {'id': 'q2-masse', 't': 'Masse et centrage : limites de structure, charge offerte, moments, indices', 'h': H, 'quiz': Q}
