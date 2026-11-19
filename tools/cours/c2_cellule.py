"""Cours II · module 1 : la cellule — facteur de charge, domaine de vol (diagramme V-n), charges limites et extrêmes,
masse et centrage en % de corde moyenne. Niveau ATPL, très difficile. 20 exercices corrigés."""
import math
from commun import ex, fr, close

H = """
<p class="lead"><b>Niveau confirmé.</b> Ce module suppose acquis le Cours I (« L'avion et ses parties ») et le Cours 0 (mécanique, trigonométrie).
Il correspond aux matières « Principes du vol » et « Connaissance générale de l'aéronef : cellule » de la théorie ATPL.</p>

<h3>1. Le facteur de charge</h3>
<p>n = L / W (portance sur poids). En vol rectiligne stabilisé n = 1 ; en virage coordonné stabilisé n = 1 / cos φ ;
en ressource (bas d'une trajectoire circulaire verticale de rayon R) n = 1 + V² / (g R). La vitesse de décrochage croît comme √n :
V<sub>S,n</sub> = V<sub>S,1g</sub> × √n. À 60° d'inclinaison : +41 % ; à 75° (n ≈ 3,86) : +97 %.</p>

<h3>2. Charges limites et extrêmes</h3>
<ul>
<li><b>Charge limite</b> : la plus grande charge attendue en service ; la structure la supporte sans déformation permanente gênante.</li>
<li><b>Charge extrême</b> = charge limite × <b>facteur de sécurité 1,5</b> ; la structure la supporte au moins 3 secondes sans rupture. [RÉFÉRENCÉ] EASA CS 25.303 et 25.305.</li>
<li><b>Avions de transport (CS-25)</b> : facteur de charge de manœuvre limite positif n = 2,1 + 24 000 / (W + 10 000), W en livres,
sans être inférieur à 2,5 ni obligatoirement supérieur à 3,8 ; négatif −1,0 jusqu'à V<sub>C</sub>. Volets sortis : +2,0. [RÉFÉRENCÉ] CS 25.337 et 25.345.</li>
<li><b>Avions légers (anciennes catégories CS-23 / FAR 23)</b> : normale +3,8 / −1,52 ; utilitaire +4,4 / −1,76 ; acrobatique +6,0 / −3,0.</li>
</ul>

<h3>3. Le diagramme V-n (domaine de manœuvre)</h3>
<p>En abscisse la vitesse (EAS), en ordonnée le facteur de charge. La courbe de décrochage n = (V / V<sub>S1</sub>)² limite le facteur de charge
disponible à basse vitesse ; elle coupe la limite structurale n<sub>max</sub> à la <b>vitesse de manœuvre</b> V<sub>A</sub> = V<sub>S1</sub> √n<sub>max</sub>.
Sous V<sub>A</sub>, l'aile décroche avant que la structure n'atteigne sa limite (d'où la protection « naturelle ») ; au-dessus, une manœuvre brutale peut dépasser la charge limite.
Attention : V<sub>A</sub> <b>diminue quand la masse diminue</b> (V<sub>A</sub> ∝ √m) et elle ne protège pas contre des débattements alternés (accident de l'Airbus A300 du vol American 587, 2001, NTSB AAR-04/04).</p>

<h3>4. Rafales</h3>
<p>Une rafale verticale U modifie l'incidence de Δα ≈ U / V. Facteur de charge supplémentaire :
Δn = ρ V a U S / (2 W) (a : pente de la courbe de portance par radian). L'avion le plus <b>léger</b>, le plus <b>rapide</b>, à la plus grande <b>surface</b>
et à forte pente de portance (aile peu flèche, grand allongement) est le plus sensible. D'où la vitesse de pénétration en turbulence (V<sub>B</sub> ou V<sub>RA</sub>).</p>

<h3>5. Centrage en % de corde aérodynamique moyenne (MAC)</h3>
<p>CG (% MAC) = (X<sub>CG</sub> − X<sub>LEMAC</sub>) / MAC × 100. Un centrage <b>avant</b> augmente la stabilité, la vitesse de décrochage et la consommation
(plus de déportance de l'empennage) ; un centrage <b>arrière</b> réduit la marge de stabilité et les efforts au manche, jusqu'au point neutre
au-delà duquel l'avion devient instable. Déplacer une masse m d'une distance d déplace le centre de gravité de Δx = m d / M (M : masse totale).</p>
<div class="box"><b>Pièges d'examen</b> : V<sub>A</sub> varie avec la masse ; le facteur de charge en virage ne dépend pas de la masse ni de la vitesse,
seulement de l'inclinaison ; la vitesse de décrochage en virage dépend de √n, pas de n.</div>
"""

def nlim25(w_lb): return min(3.8, max(2.5, 2.1 + 24000 / (w_lb + 10000)))

Q = []
Q.append(ex('Facteur de charge en virage coordonné stabilisé à 75° d\'inclinaison :', f'{fr(1/math.cos(math.radians(75)),2)}', ['2,00', '1,04', '3,73'],
            f'n = 1 / cos 75° = 1 / {fr(math.cos(math.radians(75)),4)} = {fr(1/math.cos(math.radians(75)),2)}. Piège : 3,73 est tan 75°.'))
Q.append(ex('V_S1g = 110 kt. Vitesse de décrochage en virage stabilisé à 50° d\'inclinaison ?', f'{fr(110*math.sqrt(1/math.cos(math.radians(50))),1)} kt',
            ['171,1 kt', '143,0 kt', '110,0 kt'],
            f'n = 1 / cos 50° = {fr(1/math.cos(math.radians(50)),3)} ; V_S = 110 × √n = {fr(110*math.sqrt(1/math.cos(math.radians(50))),1)} kt. Piège : 171,1 kt = 110 × n (sans racine).'))
Q.append(ex('Inclinaison maximale en virage stabilisé si l\'on veut garder 30 % de marge au décrochage (V = 1,3 V_S1g) :', f'{fr(math.degrees(math.acos(1/1.69)),1)}°',
            ['39,7°', '30,0°', '60,0°'],
            f'n_max = (V / V_S)² = 1,3² = 1,69 ; cos φ = 1 / 1,69 → φ = {fr(math.degrees(math.acos(1/1.69)),1)}°.'))
Q.append(ex('Ressource en bas de piqué : V = 250 kt (128,6 m/s), rayon 2 000 m. Facteur de charge ?', f'{fr(1+128.61**2/(9.81*2000),2)}', ['0,84', '0,16', '2,00'],
            f'n = 1 + V² / (g R) = 1 + 16 541 / 19 620 = {fr(1+128.61**2/(9.81*2000),2)}.'))
Q.append(ex('Avion de transport de 300 000 lb (CS 25.337) : facteur de charge de manœuvre limite positif ?', f'{fr(nlim25(300000),2)}', ['2,18', '3,80', '2,10'],
            f'2,1 + 24 000 / 310 000 = {fr(2.1+24000/310000,3)} < 2,5 → on retient le minimum réglementaire : 2,5.'))
Q.append(ex('Avion de 20 000 lb (CS-25) : facteur de charge limite positif ?', f'{fr(nlim25(20000),2)}', ['2,50', '3,80', '2,10'],
            f'2,1 + 24 000 / 30 000 = {fr(nlim25(20000),2)}, compris entre 2,5 et 3,8.'))
Q.append(ex('Charge limite 2,5 g. Charge extrême que la structure doit supporter sans rupture :', '3,75 g', ['2,5 g', '5,0 g', '3,0 g'],
            'Facteur de sécurité 1,5 (CS 25.303) : 2,5 × 1,5 = 3,75 g.'))
Q.append(ex('V_S1 = 120 kt à masse maximale, n_max = 2,5. Vitesse de manœuvre V_A ?', f'{fr(120*math.sqrt(2.5),1)} kt', ['300,0 kt', '150,0 kt', '120,0 kt'],
            f'V_A = V_S1 √n_max = 120 × 1,581 = {fr(120*math.sqrt(2.5),1)} kt.'))
Q.append(ex('Même avion, masse réduite de 25 %. Nouvelle V_A ?', f'{fr(120*math.sqrt(0.75)*math.sqrt(2.5),1)} kt', ['142,3 kt', '189,7 kt', '219,1 kt'],
            f'V_A ∝ √m : 189,7 × √0,75 = {fr(120*math.sqrt(0.75)*math.sqrt(2.5),1)} kt. Piège : V_A ne reste pas constante, elle diminue avec la masse.'))
Q.append(ex('Pourquoi un avion léger est-il plus secoué qu\'un avion lourd dans la même rafale (même vitesse, même aile) ?', 'Δn est inversement proportionnel au poids',
            ['la portance augmente avec la masse', 'Δn est proportionnel au poids', 'la rafale agit sur la masse et non sur l\'aile'],
            'Δn = ρ V a U S / (2 W) : la même variation de portance ΔL produit un facteur de charge ΔL / W plus grand si W est petit.'))
Q.append(ex('Rafale verticale de 15 m/s, V = 150 m/s, ρ = 0,736 kg/m³ (FL200), a = 4,5 /rad, S = 122 m², m = 60 t. Δn ?',
            f'{fr(0.736*150*4.5*15*122/(2*60000*9.81),2)}', ['1,00', '0,23', '2,45'],
            f'Δn = ρ V a U S / (2 W) = 0,736 × 150 × 4,5 × 15 × 122 / (2 × 588 600) = {fr(0.736*150*4.5*15*122/(2*60000*9.81),2)}.'))
Q.append(ex('Avec Δn précédent, le facteur de charge maximal subi en rafale montante est :', f'{fr(1+0.736*150*4.5*15*122/(2*60000*9.81),2)}', ['0,23', '2,50', '1,00'],
            f'n = 1 + Δn = {fr(1+0.736*150*4.5*15*122/(2*60000*9.81),2)} ; en rafale descendante, n = 1 − Δn.'))
xcg = (18.5 - 16.2) / 4.2 * 100
Q.append(ex('LEMAC à 16,2 m, MAC = 4,2 m, centre de gravité à 18,5 m de la référence. Centrage ?', f'{fr(xcg,1)} % MAC', ['18,5 % MAC', '25,9 % MAC', '61,0 % MAC'],
            f'(18,5 − 16,2) / 4,2 × 100 = {fr(xcg,1)} % MAC.'))
Q.append(ex('Masse 62 000 kg, centrage 25 % MAC (MAC 4,2 m). On déplace 1 200 kg de fret de 9 m vers l\'arrière. Nouveau centrage ?',
            f'{fr(25+1200*9/62000/4.2*100,1)} % MAC', ['27,6 % MAC', '25,4 % MAC', '20,9 % MAC'],
            f'Δx = m d / M = 1 200 × 9 / 62 000 = {fr(1200*9/62000,3)} m = {fr(1200*9/62000/4.2*100,1)} % de MAC → {fr(25+1200*9/62000/4.2*100,1)} % MAC.'))
Q.append(ex('Masse 62 000 kg ; quelle masse faut-il déplacer de 12 m vers l\'avant pour avancer le centrage de 2 % MAC (MAC 4,2 m) ?',
           f'{fr(0.02*4.2*62000/12)} kg', ['1 033 kg', '868 kg', '217 kg'],
           f'Δx = 0,02 × 4,2 = 0,084 m ; m = M Δx / d = 62 000 × 0,084 / 12 = {fr(0.02*4.2*62000/12)} kg.'))
Q.append(ex('Effet d\'un centrage arrière (dans les limites) en croisière :', 'moins de traînée et de consommation, moins de stabilité',
            ['plus de traînée et plus de stabilité', 'vitesse de décrochage plus élevée', 'efforts au manche plus élevés'],
            'Moins de déportance de l\'empennage → portance de l\'aile plus faible → moins de traînée induite ; mais marge statique réduite.'))
Q.append(ex('Pourquoi la vitesse de décrochage est-elle plus élevée en centrage avant ?', 'l\'aile doit porter aussi la déportance de l\'empennage',
            ['le poids augmente', 'l\'incidence critique diminue', 'la surface alaire diminue'],
            'La déportance de l\'empennage s\'ajoute au poids : l\'aile doit fournir L = W + déportance, donc un C_L plus grand à vitesse égale.'))
Q.append(ex('Un pilote fait des débattements alternés pleins de la gouverne de direction sous V_A. La structure est-elle protégée ?', 'non : V_A ne couvre pas les débattements alternés',
            ['oui, toujours sous V_A', 'oui, si la masse est maximale', 'oui, si les volets sont rentrés'],
            'La protection de V_A ne vaut que pour un débattement unique dans un axe. Vol American 587 (2001) : rupture de la dérive après des débattements alternés (NTSB AAR-04/04).'))
Q.append(ex('Facteur de charge maximal disponible à 1,2 V_S1g (aile au C_Lmax) :', '1,44', ['1,20', '1,10', '2,40'],
            'n = (V / V_S)² = 1,2² = 1,44 : au-delà, l\'aile décroche avant la structure.'))
Q.append(ex('Virage stabilisé à 30° d\'inclinaison, TAS 250 kt (128,6 m/s). Rayon ?', f'{fr(128.61**2/(9.81*math.tan(math.radians(30)))/1852,2)} NM',
            ['2,74 NM', '5,41 NM', '0,91 NM'],
            f'R = V² / (g tan φ) = 16 541 / (9,81 × 0,577) = {fr(128.61**2/(9.81*math.tan(math.radians(30))))} m = {fr(128.61**2/(9.81*math.tan(math.radians(30)))/1852,2)} NM.'))
assert len(Q) == 20, len(Q)

MOD = {'id': 'q1-cellule', 't': 'Cellule : facteur de charge, domaine de vol, centrage', 'h': H, 'quiz': Q}
