"""Cours II · module 2 : aérodynamique avancée — polaire, finesse, vitesses caractéristiques, effet de la masse,
haute vitesse (Mach critique, coin du cercueil). Niveau ATPL, très difficile. 20 exercices corrigés."""
import math
from commun import ex, fr, close

H = """
<p class="lead"><b>Niveau confirmé.</b> Matière « Principes du vol » (EASA ATPL, sujet 081). Suppose acquis le module « Comment l'avion vole » du Cours I.</p>

<h3>1. La polaire parabolique</h3>
<p>C<sub>D</sub> = C<sub>D0</sub> + k C<sub>L</sub>², avec k = 1 / (π A e) (A : allongement = b² / S ; e : facteur d'Oswald, 0,7 à 0,85).
La traînée de profil (C<sub>D0</sub>) croît comme V² ; la traînée induite décroît comme 1 / V². Leur somme est minimale quand elles sont <b>égales</b>.</p>
<ul>
<li><b>Finesse maximale</b> : (L/D)<sub>max</sub> = 1 / (2 √(k C<sub>D0</sub>)), obtenue à C<sub>L</sub>* = √(C<sub>D0</sub> / k).</li>
<li><b>V<sub>MD</sub></b> (traînée minimale) : vitesse de meilleure finesse, donc de plus grande distance en plané et d'autonomie maximale pour un réacteur.</li>
<li><b>V<sub>MP</sub></b> (puissance minimale) : V<sub>MP</sub> = V<sub>MD</sub> / 3<sup>1/4</sup> ≈ 0,76 V<sub>MD</sub>. Taux de chute minimal en plané ; autonomie maximale pour une hélice.</li>
<li>Distance franchissable maximale d'un réacteur : vers 3<sup>1/4</sup> V<sub>MD</sub> ≈ 1,32 V<sub>MD</sub> (maximum de V / D) ; en pratique on vole un peu moins vite (99 % de la distance maximale, « long range cruise »).</li>
</ul>

<h3>2. Effet de la masse et de l'altitude</h3>
<p>À C<sub>L</sub> constant (même incidence), V ∝ √(W / ρ). La finesse maximale <b>ne dépend pas de la masse</b> : un planeur lesté
descend plus vite mais va aussi loin. En EAS, V<sub>MD</sub> ne dépend que de la masse ; en TAS, elle augmente avec l'altitude.
Pente de plané : tan γ = 1 / (L/D) ; distance plané = hauteur × (L/D).</p>

<h3>3. Montée</h3>
<p>Pente de montée : sin γ = (T − D) / W. Vitesse verticale : V<sub>z</sub> = V (T − D) / W = (P<sub>dispo</sub> − P<sub>nécessaire</sub>) / W.
V<sub>X</sub> (meilleure pente) maximise T − D ; V<sub>Y</sub> (meilleur taux) maximise l'excès de puissance. Moteur en panne sur un bimoteur, la poussée disponible est divisée par deux
mais l'excès de poussée l'est bien davantage.</p>

<h3>4. Haute vitesse</h3>
<p>M = V / a, a = 38,94 √T (kt, T en K). <b>Mach critique</b> M<sub>crit</sub> : premier point de l'écoulement à Mach 1 ; au-delà apparaissent une onde de choc,
le décollement, la traînée d'onde et le buffeting. La <b>flèche</b> φ retarde ces effets : seule la composante normale M cos φ compte (théorie de la flèche simple).
En montant à masse donnée, la vitesse de décrochage en Mach augmente et la limite de buffeting haute vitesse diminue : les deux se rejoignent au <b>coin du cercueil</b> (coffin corner).
La marge de buffeting est exigée à 1,3 g (soit ±40° d'inclinaison environ) [RÉFÉRENCÉ] CS 25.251 et pratique des exploitants.</p>
<div class="box"><b>Pièges d'examen</b> : V<sub>MP</sub> &lt; V<sub>MD</sub> ; la finesse ne dépend pas de la masse ; le vent change la distance plané au sol mais pas la finesse air ;
en vent de face on plane plus vite que V<sub>MD</sub> pour aller plus loin, en vent arrière un peu moins vite.</div>
"""

k = lambda A, e: 1 / (math.pi * A * e)
Q = []
A, e = 9.5, 0.8
Q.append(ex('Allongement 9,5 ; facteur d\'Oswald 0,80. Coefficient de traînée induite k = 1/(πAe) ?', f'{fr(k(A,e),4)}', ['0,0335', '0,1316', '0,0524'],
            f'k = 1 / (π × 9,5 × 0,80) = 1 / {fr(math.pi*A*e,2)} = {fr(k(A,e),4)}.'))
cd0 = 0.018
Ld = 1 / (2 * math.sqrt(k(A, e) * cd0))
Q.append(ex('Même avion, C_D0 = 0,018. Finesse maximale ?', f'{fr(Ld,1)}', ['36,4', '10,4', '13,8'],
            f'(L/D)max = 1 / (2 √(k C_D0)) = 1 / (2 √({fr(k(A,e),4)} × 0,018)) = {fr(Ld,1)}. Piège : 36,4 oublie le facteur 2.'))
Q.append(ex('C_L de finesse maximale pour cet avion ?', f'{fr(math.sqrt(cd0/k(A,e)),3)}', ['0,018', '1,200', '0,269'],
            f'C_L* = √(C_D0 / k) = √(0,018 / {fr(k(A,e),4)}) = {fr(math.sqrt(cd0/k(A,e)),3)}.'))
Q.append(ex('À la vitesse de finesse maximale, la traînée induite représente quelle part de la traînée totale ?', '50 %', ['25 %', '75 %', '100 %'],
            'À V_MD les deux traînées sont égales : k C_L*² = C_D0.'))
Q.append(ex('Planeur de finesse 40, à 1 200 m sol, air calme. Distance de plané ?', '48 km', ['30 km', '40 km', '4,8 km'], '1 200 m × 40 = 48 000 m.'))
Q.append(ex('Biréacteur, finesse 17, panne totale de poussée à FL350 (10 668 m), terrain à 0 m, air calme. Distance de plané ?',
            f'{fr(10668*17/1852)} NM', ['178 NM', '35 NM', '57 NM'], f'10 668 × 17 = {fr(10668*17)} m = {fr(10668*17/1852)} NM. (Vol Air Transat 236, 2001 : plané d\'environ 65 NM depuis FL345.)'))
Q.append(ex('Même avion : 20 % de masse en moins. Distance de plané (même finesse max) ?', 'inchangée', ['20 % plus grande', '20 % plus courte', '10 % plus courte'],
            'La finesse maximale ne dépend pas de la masse ; seule la vitesse de plané change (√0,8 ≈ 0,89 fois).'))
Q.append(ex('V_MD = 220 kt EAS à 70 t. V_MD à 56 t ?', f'{fr(220*math.sqrt(56/70))} kt EAS', ['176 kt EAS', '220 kt EAS', '246 kt EAS'],
            f'V ∝ √W : 220 × √(56/70) = 220 × {fr(math.sqrt(56/70),3)} = {fr(220*math.sqrt(56/70))} kt. Piège : 176 kt suppose V ∝ W.'))
Q.append(ex('V_MD = 220 kt. Vitesse de puissance minimale V_MP (polaire parabolique) ?', f'{fr(220/3**0.25)} kt', ['220 kt', '290 kt', '110 kt'],
            f'V_MP = V_MD / 3^(1/4) = 220 / {fr(3**0.25,3)} = {fr(220/3**0.25)} kt.'))
Q.append(ex('Planeur : quelle vitesse donne le taux de chute minimal ?', 'V_MP', ['V_MD', 'V_NE', 'V_A'], 'Taux de chute = P_nécessaire / W : minimal à la puissance minimale V_MP.'))
Q.append(ex('Vitesse de plané pour franchir la plus grande distance par vent de face de 40 kt :', 'supérieure à V_MD', ['égale à V_MD', 'inférieure à V_MD', 'égale à V_MP'],
            'On réduit le temps passé dans le vent : la finesse sol est maximale à une vitesse air supérieure à V_MD.'))
W, T, D = 70000 * 9.81, 2 * 110000, 70000 * 9.81 / 16
Q.append(ex('Biréacteur 70 t ; poussée 2 × 110 kN ; finesse en montée 16. Pente de montée ?', f'{fr(math.degrees(math.asin((T-D)/W)),1)}°',
            ['18,7°', '3,6°', '11,6°'], f'D = W / 16 = {fr(D/1000,1)} kN ; sin γ = (220 − {fr(D/1000,1)}) / {fr(W/1000,1)} = {fr((T-D)/W,3)} → γ = {fr(math.degrees(math.asin((T-D)/W)),1)}°.'))
g1 = math.degrees(math.asin((T/2 - D) / W))
Q.append(ex('Même avion, un moteur en panne (110 kN, traînée de dissymétrie négligée). Pente ?', f'{fr(g1,1)}°', ['6,9°', '3,6°', '0,0°'],
            f'sin γ = (110 − {fr(D/1000,1)}) / {fr(W/1000,1)} = {fr((T/2-D)/W,4)} → {fr(g1,1)}°. La poussée est divisée par 2, l\'excès de poussée par ≈ 2,6.'))
Q.append(ex('Pente de montée de 3 % à 160 kt de vitesse sol. Vitesse verticale ?', f'{fr(0.03*160*101.27)} ft/min', ['300 ft/min', '4 860 ft/min', '960 ft/min'],
            f'V_z = 0,03 × 160 kt × 101,27 (ft/min par kt) = {fr(0.03*160*101.27)} ft/min.'))
a = 38.94 * math.sqrt(273.15 - 56.5)
Q.append(ex('Vitesse du son à −56,5 °C (tropopause ISA) ?', f'{fr(a)} kt', ['661 kt', '600 kt', '539 kt'],
            f'a = 38,94 √T = 38,94 × √216,65 = {fr(a)} kt.'))
Q.append(ex('Aile en flèche de 30°, M = 0,82. Mach « vu » par le profil (théorie de la flèche simple) ?', f'{fr(0.82*math.cos(math.radians(30)),2)}',
            ['0,82', '0,41', '0,95'], f'M_n = M cos φ = 0,82 × 0,866 = {fr(0.82*math.cos(math.radians(30)),2)}.'))
Q.append(ex('En montant à masse et Mach constants, la marge entre décrochage et buffeting haute vitesse :', 'diminue jusqu\'au coin du cercueil',
            ['augmente', 'reste constante', 'ne dépend que du centrage'], 'Le C_L requis augmente quand ρ diminue (L = ½ ρ V² S C_L) : le décrochage se rapproche du Mach de buffeting.'))
Q.append(ex('Marge de buffeting à 1,3 g : à quelle inclinaison en virage stabilisé correspond-elle ?', f'{fr(math.degrees(math.acos(1/1.3)),1)}°', ['30,0°', '45,0°', '60,0°'],
            f'cos φ = 1 / 1,3 → φ = {fr(math.degrees(math.acos(1/1.3)),1)}°.'))
cl = 2 * 65000 * 9.81 / (0.3796 * (0.78 * a * 1852 / 3600) ** 2 * 122.6)
Q.append(ex('65 t, S = 122,6 m², FL360 (ρ = 0,3796 kg/m³, ISA), M 0,78. C_L de croisière ?', f'{fr(cl,2)}', ['0,23', '1,20', '0,92'],
            f'TAS = 0,78 × {fr(a)} kt = {fr(0.78*a*1852/3600,1)} m/s ; C_L = 2W / (ρ V² S) = {fr(cl,2)}.'))
Q.append(ex('Effet de la sortie des volets sur la finesse maximale :', 'elle diminue', ['elle augmente', 'elle ne change pas', 'elle double'],
            'Les volets augmentent C_Lmax mais encore plus C_D0 : la finesse chute (de ≈ 17 lisse à ≈ 8 à 10 volets et train sortis sur un avion de ligne).'))
assert len(Q) == 20, len(Q)

MOD = {'id': 'q1-aero', 't': 'Aérodynamique : polaire, finesse, haute vitesse', 'h': H, 'quiz': Q}
