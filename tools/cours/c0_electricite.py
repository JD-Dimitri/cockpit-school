"""Cours 0 · thème 6 : électricité et ondes (loi d'Ohm, puissance, batteries, courant continu et alternatif,
ondes radio, portée VHF, radar). 30 exercices corrigés."""
import math
from commun import ex, fr, close

C = 299_792_458

H = """
<p>Un avion moderne est une centrale électrique volante : écrans, calculateurs, radios, pompes, dégivrage. Et toute la
navigation et les communications passent par des ondes radio. Ce module donne les bases nécessaires.</p>

<h3>1. Tension, courant, résistance</h3>
<p>Loi d'Ohm : <b>U = R × I</b> (volts = ohms × ampères). Puissance électrique : <b>P = U × I</b> (watts).
Un équipement de 28 V qui consomme 10 A absorbe 280 W. Les avions légers utilisent du courant continu 14 V ou 28 V ;
les avions de ligne du continu 28 V et de l'alternatif 115 V à 400 Hz (fréquence plus élevée qu'au sol : transformateurs et moteurs plus légers).</p>

<h3>2. Batteries</h3>
<p>La capacité s'exprime en ampères-heures (Ah) : une batterie de 24 Ah peut fournir 24 A pendant 1 h, ou 12 A pendant 2 h
(en théorie ; en pratique moins, surtout par grand froid). Énergie stockée = U × capacité : 24 V × 24 Ah ≈ 576 Wh.</p>

<h3>3. Circuits série et parallèle</h3>
<p>En série, les résistances s'additionnent ; en parallèle, les inverses s'additionnent (1/R = 1/R₁ + 1/R₂).
Les équipements de bord sont en parallèle sur une <b>barre</b> : chacun reçoit la même tension.
Les disjoncteurs protègent chaque circuit contre les surintensités.</p>

<h3>4. Les ondes radio</h3>
<p>Une onde électromagnétique se propage à la vitesse de la lumière c ≈ 300 000 km/s. Longueur d'onde λ = c / f.
Bandes utilisées : LF/MF (balises NDB, 190 à 1 750 kHz), HF (3 à 30 MHz, communications à grande distance par réflexion
sur l'ionosphère), VHF (118 à 137 MHz pour la radiotéléphonie, 108 à 118 MHz pour VOR et ILS), UHF (DME, transpondeur, GPS).</p>

<h3>5. La portée VHF : la ligne de vue</h3>
<p>La VHF ne suit pas la courbure de la Terre : la portée est limitée à l'horizon radio. Formule usuelle :
<b>portée (NM) ≈ 1,23 × (√h₁ + √h₂)</b>, hauteurs en pieds. Un avion à 10 000 ft parle à une station au sol à environ 123 NM.</p>

<h3>6. Le radar et le DME</h3>
<p>Un radar mesure le temps aller-retour d'une impulsion : distance = c × t / 2. Un écho reçu 1 ms après l'émission vient
d'environ 150 km. Le DME mesure de la même façon la distance oblique jusqu'à la balise.</p>
<div class="box"><b>Sécurité</b> : un disjoncteur qui saute signale un défaut ; on ne le réarme qu'une fois, et seulement si la procédure le permet.</div>
"""

def vhf(h1, h2=0): return 1.23 * (math.sqrt(h1) + math.sqrt(h2))

Q = []
Q.append(ex('Loi d\'Ohm : U = 28 V, R = 7 Ω. Courant ?', '4 A', ['196 A', '0,25 A', '35 A'], 'I = U / R = 28 / 7 = 4 A.'))
Q.append(ex('Puissance d\'un équipement 28 V × 10 A :', '280 W', ['2,8 W', '38 W', '2 800 W'], 'P = U I = 280 W.'))
Q.append(ex('Batterie 24 Ah. Combien de temps peut-elle fournir 6 A (en théorie) ?', '4 h', ['144 h', '0,25 h', '18 h'], '24 / 6 = 4 h.'))
Q.append(ex('Fréquence du courant alternatif des avions de ligne :', '400 Hz', ['50 Hz', '60 Hz', '28 Hz'], '115 V 400 Hz : à puissance égale, transformateurs et moteurs plus légers.'))
Q.append(ex('Deux résistances de 10 Ω en série :', '20 Ω', ['5 Ω', '10 Ω', '100 Ω'], 'En série, elles s\'additionnent.'))
Q.append(ex('Deux résistances de 10 Ω en parallèle :', '5 Ω', ['20 Ω', '10 Ω', '0,2 Ω'], '1/R = 1/10 + 1/10 = 1/5 → R = 5 Ω.'))
Q.append(ex('Vitesse de propagation d\'une onde radio :', '≈ 300 000 km/s', ['≈ 340 m/s', '≈ 300 km/s', '≈ 30 000 km/s'], 'Les ondes radio sont des ondes électromagnétiques : vitesse de la lumière.'))
Q.append(ex('La bande des communications VHF aéronautiques :', '118 à 137 MHz', ['88 à 108 MHz', '108 à 118 MHz', '3 à 30 MHz'], '108-118 MHz : VOR et ILS ; 118-137 MHz : radiotéléphonie.'))
Q.append(ex('Pour parler à très grande distance au-dessus d\'un océan, on utilise :', 'la HF (ou le satellite)', ['la VHF', 'le NDB', 'le transpondeur'], 'La HF se réfléchit sur l\'ionosphère ; la VHF est limitée à la ligne de vue.'))
Q.append(ex('Pourquoi la portée VHF augmente-t-elle avec l\'altitude ?', 'l\'horizon radio s\'éloigne', ['l\'air est moins dense', 'la fréquence augmente', 'la batterie est plus chargée'], 'La VHF se propage en ligne de vue : plus on est haut, plus l\'horizon est loin.'))
# moyen
Q.append(ex('Longueur d\'onde d\'une émission à 120 MHz :', f'{fr(C/120e6,2)} m', ['25 m', '0,25 m', '120 m'], f'λ = c / f = 3 × 10⁸ / 1,2 × 10⁸ = {fr(C/120e6,2)} m.'))
Q.append(ex('Longueur d\'onde d\'une balise NDB à 300 kHz :', '1 000 m', ['100 m', '1 m', '10 000 m'], 'λ = 3 × 10⁸ / 3 × 10⁵ = 1 000 m : d\'où les grandes antennes des NDB.'))
Q.append(ex('Portée VHF d\'un avion à 10 000 ft avec une station au niveau du sol :', f'{fr(vhf(10000))} NM', ['10 NM', '1 230 NM', '57 NM'], f'1,23 × √10 000 = 1,23 × 100 = {fr(vhf(10000))} NM.'))
Q.append(ex('Portée VHF à 2 500 ft (station au sol) :', f'{fr(vhf(2500),1)} NM', ['123,0 NM', '30,0 NM', '3,1 NM'], f'1,23 × 50 = {fr(vhf(2500),1)} NM.'))
Q.append(ex('Énergie d\'une batterie 24 V, 40 Ah :', '960 Wh', ['64 Wh', '1,67 Wh', '9 600 Wh'], '24 × 40 = 960 Wh.'))
Q.append(ex('Barre 28 V : radio 5 A, transpondeur 3 A, phares 12 A. Courant total ?', '20 A', ['28 A', '5,6 A', '12 A'], 'Équipements en parallèle : les courants s\'additionnent.'))
Q.append(ex('Panne d\'alternateur ; batterie 24 Ah ; on réduit la consommation à 8 A. Autonomie théorique ?', '3 h', ['8 h', '1 h', '24 min'], '24 / 8 = 3 h (en réalité moins : la batterie n\'est jamais pleine à 100 % et sa capacité baisse au froid).'))
Q.append(ex('Disjoncteur de 5 A sur un circuit 28 V : puissance maximale de l\'équipement protégé :', '140 W', ['5,6 W', '33 W', '28 W'], 'P = 28 × 5 = 140 W.'))
Q.append(ex('Un écho radar revient 0,5 ms après l\'émission. Distance de la cible :', f'{fr(C*0.5e-3/2/1000)} km', ['150 km', '300 km', '37 km'], f'd = c t / 2 = 3 × 10⁸ × 0,000 5 / 2 = {fr(C*0.5e-3/2/1000)} km.'))
Q.append(ex('Résistance d\'un dégivreur de 28 V qui consomme 14 A :', '2 Ω', ['392 Ω', '0,5 Ω', '42 Ω'], 'R = U / I = 28 / 14 = 2 Ω.'))
# difficile
Q.append(ex('Portée VHF entre deux avions à FL300 et FL100 :', f'{fr(vhf(30000,10000))} NM', ['123 NM', '400 NM', '213 NM'],
            f'1,23 × (√30 000 + √10 000) = 1,23 × (173,2 + 100) = {fr(vhf(30000,10000))} NM.'))
Q.append(ex('Une station VHF au sommet d\'une colline à 900 ft et un avion à 3 600 ft : portée ?', f'{fr(vhf(3600,900))} NM', ['74 NM', '90 NM', '58 NM'],
            f'1,23 × (60 + 30) = {fr(vhf(3600,900))} NM.'))
Q.append(ex('Altitude minimale pour contacter une station au sol à 100 NM (formule 1,23 √h) :', f'≈ {fr(round((100/1.23)**2,-2))} ft', ['≈ 8 100 ft', '≈ 10 000 ft', '≈ 1 230 ft'],
           f'√h = 100 / 1,23 = 81,3 → h = {fr((100/1.23)**2)} ft.'))
Q.append(ex('Énergie (Wh) consommée par un équipement 115 V 400 Hz de 2 A pendant 3 h (facteur de puissance 1) :', '690 Wh', ['230 Wh', '6,9 Wh', '1 380 Wh'], 'P = 115 × 2 = 230 W ; × 3 h = 690 Wh.'))
Q.append(ex('Trois résistances de 6 Ω, 3 Ω et 2 Ω en parallèle :', '1 Ω', ['11 Ω', '3,67 Ω', '0,5 Ω'], '1/R = 1/6 + 1/3 + 1/2 = 1 → R = 1 Ω.'))
Q.append(ex('Le DME affiche 10 NM ; l\'avion est à 36 000 ft au-dessus de la balise (en altitude). Distance horizontale réelle ?', f'≈ {fr(math.sqrt(100-(36000/6076)**2),1)} NM',
           ['10,0 NM', '0,0 NM', '≈ 4,1 NM'], f'Distance oblique 10 NM ; hauteur 36 000 ft = {fr(36000/6076,1)} NM ; √(10² − {fr(36000/6076,1)}²) = {fr(math.sqrt(100-(36000/6076)**2),1)} NM.'))
Q.append(ex('Juste à la verticale d\'une balise DME à 30 000 ft, le DME affiche environ :', f'{fr(30000/6076,1)} NM', ['0,0 NM', '30,0 NM', '3,0 NM'], f'Distance oblique = hauteur : 30 000 / 6 076 = {fr(30000/6076,1)} NM. Le DME n\'affiche jamais 0 en vol.'))
Q.append(ex('Batterie 24 Ah à 80 % de charge, capacité réduite de 20 % par le froid, consommation 10 A. Autonomie ?', f'{fr(24*0.8*0.8/10*60)} min', ['144 min', '115 min', '77 min'],
            f'24 × 0,8 × 0,8 = {fr(24*0.8*0.8,2)} Ah ; / 10 A = {fr(24*0.8*0.8/10,3)} h = {fr(24*0.8*0.8/10*60)} min.'))
Q.append(ex('Courant pour une puissance de 3,45 kW sous 115 V :', '30 A', ['3 A', '397 A', '0,03 A'], 'I = P / U = 3 450 / 115 = 30 A.'))
Q.append(ex('Une onde GPS (L1) a une fréquence de 1 575,42 MHz. Longueur d\'onde ?', f'{fr(C/1575.42e6*100,1)} cm', ['1,9 cm', '190,3 cm', '0,6 cm'], f'λ = 3 × 10⁸ / 1,575 × 10⁹ = {fr(C/1575.42e6,4)} m = {fr(C/1575.42e6*100,1)} cm.'))
assert len(Q) == 30, len(Q)
close(vhf(10000), 123)

MOD = {'id': 'm0-elec', 't': 'Électricité et ondes radio', 'h': H, 'quiz': Q}
