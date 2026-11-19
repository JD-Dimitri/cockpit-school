"""Cours II · partie 2 · module 6 : systèmes de l'avion de ligne — hydraulique, électricité, pressurisation, carburant,
protection contre le givre et le feu, train, avertisseurs. Niveau ATPL, très difficile. 20 exercices corrigés."""
import math
from commun import ex, fr, close

H = """
<p class="lead"><b>Niveau confirmé.</b> Matière « Connaissance générale de l'aéronef : cellule, systèmes, électricité » (EASA ATPL, sujet 021). Prolonge la partie 5 du Cours I (structures, moteurs, systèmes).
Les valeurs données sont des ordres de grandeur d'école ; celles d'un type d'avion se lisent dans son manuel (FCOM).</p>

<h3>1. Hydraulique</h3>
<p>Principe de Pascal : la pression se transmet intégralement ; force = pression × surface. Pression usuelle 3 000 psi (≈ 207 bar) ; 5 000 psi (≈ 345 bar) sur les avions récents de grande taille (A380, A350, B787),
ce qui allège tuyauteries et vérins. Fluide ininflammable à base d'esters phosphates. Plusieurs circuits indépendants (redondance), pompes entraînées par les moteurs,
pompes électriques, éolienne de secours (RAT) et accumulateurs.</p>

<h3>2. Électricité</h3>
<p>Courant alternatif triphasé 115/200 V à <b>400 Hz</b> (transformateurs et moteurs plus légers qu'à 50 Hz) ; courant continu 28 V par transformateurs-redresseurs (TR) et batteries.
Les générateurs sont entraînés à vitesse constante (IDG) ou produisent une fréquence variable (avions récents). P = U × I (continu) ; en triphasé équilibré P = √3 U I cos φ.</p>

<h3>3. Pressurisation et climatisation</h3>
<p>L'air est prélevé sur les compresseurs des moteurs (prélèvement d'air), refroidi par les groupes de conditionnement (packs), puis réglé en pression par la vanne de sortie (outflow valve).
Pression différentielle Δp = P<sub>cabine</sub> − P<sub>extérieure</sub>, limitée à environ 8 à 9 psi sur la plupart des avions de ligne ; altitude cabine maximale 8 000 ft en exploitation normale.
Des soupapes protègent contre la surpression et la dépression (pression extérieure supérieure à la cabine, par exemple en descente rapide).</p>

<h3>4. Carburant</h3>
<p>Jet A-1 : point de congélation maximal −47 °C (Jet A : −40 °C) [RÉFÉRENCÉ] spécification ASTM D1655 / DEF STAN 91-091. En croisière très froide, on surveille la température du carburant (marge de 3 °C au-dessus du point de congélation en règle constructeur).
Intercommunication (crossfeed) : alimenter un moteur depuis le réservoir opposé ; on détecte une fuite par la comparaison carburant à bord + consommé / carburant au départ.</p>

<h3>5. Givre, feu, train, avertisseurs</h3>
<ul>
<li>Antigivrage <b>thermique</b> (air chaud prélevé) des becs et entrées d'air ; <b>électrique</b> des sondes et pare-brise. Dégivrage pneumatique (boudins) sur les turbopropulseurs.</li>
<li>Feu moteur : détection par boucles doubles, deux extincteurs par moteur ; soutes : détecteurs de fumée et extincteurs au halon (ou substitut).</li>
<li>Pneus gonflés à l'<b>azote</b> : gaz inerte et sec (pas d'humidité qui gèle, pas de combustion au contact de freins très chauds). Antipatinage et freinage automatique.</li>
<li><b>TCAS II</b> : avis de trafic (TA) puis avis de résolution (RA) verticaux ; le pilote suit le RA même contre une instruction du contrôle (collision d'Überlingen, 2002).
<b>GPWS / TAWS</b> : modes 1 (taux de descente excessif), 2 (rapprochement du relief), 3 (perte d'altitude après décollage), 4 (proximité du relief hors configuration d'atterrissage), 5 (sous le plan de descente), plus alertes de cisaillement et fonction prédictive.</li>
</ul>
<div class="box"><b>Pièges d'examen</b> : un RA TCAS prime sur la clairance ; une dépression cabine (P<sub>ext</sub> &gt; P<sub>cab</sub>) est aussi dangereuse qu'une surpression ; 400 Hz n'est pas choisi pour la puissance mais pour la masse.</div>
"""

def p_isa_hpa(ft):
    h = ft * 0.3048
    if h <= 11000:
        return 1013.25 * ((288.15 - 0.0065 * h) / 288.15) ** 5.25588
    return 226.32 * math.exp(-9.80665 * (h - 11000) / (287.053 * 216.65))
HPA_PSI = 1 / 68.9476

Q = []
A = math.pi * 0.05 ** 2 / 4
Q.append(ex('Vérin de 50 mm de diamètre sous 3 000 psi (206,8 bar). Force ?', f'{fr(206.8e5*A/1000,1)} kN', ['4,1 kN', '162,4 kN', '10,3 kN'],
            f'S = π × 0,05² / 4 = {fr(A*1e4,2)} cm² ; F = 206,8·10⁵ Pa × {fr(A,6)} m² = {fr(206.8e5*A/1000,1)} kN. Piège : 162,4 kN prend le diamètre pour le rayon.'))
Q.append(ex('Même force avec un circuit à 5 000 psi : diamètre du vérin ?', f'{fr(50*math.sqrt(3000/5000),1)} mm', ['30,0 mm', '50,0 mm', '83,3 mm'],
            f'S ∝ 1/p : d = 50 × √(3 000/5 000) = {fr(50*math.sqrt(0.6),1)} mm. D\'où l\'intérêt des 5 000 psi : vérins et tuyauteries plus petits et plus légers.'))
Q.append(ex('Pourquoi le réseau alternatif des avions est-il à 400 Hz ?', 'transformateurs et moteurs plus légers', ['pour transporter plus de puissance', 'pour éviter les interférences radio', 'parce que les batteries l\'exigent'],
            'À puissance égale, le circuit magnétique d\'un transformateur est d\'autant plus petit que la fréquence est élevée.'))
Q.append(ex('Barre continue 28 V, consommation 4,2 kW. Intensité ?', f'{fr(4200/28)} A', ['15 A', '1 500 A', '118 800 A'], f'I = P / U = 4 200 / 28 = {fr(4200/28)} A.'))
Q.append(ex('Batterie 24 V, 37 A·h, utilisable à 80 %. Autonomie sous 45 A ?', f'{fr(37*0.8/45*60)} min', ['49 min', '20 min', '1 h 30'],
            f'37 × 0,8 / 45 = {fr(37*0.8/45,3)} h = {fr(37*0.8/45*60)} min.'))
pc, pe = p_isa_hpa(8000), p_isa_hpa(41000)
Q.append(ex('Altitude cabine 8 000 ft à FL410 (ISA). Pression différentielle ?', f'{fr((pc-pe)*HPA_PSI,1)} psi', ['10,9 psi', '14,7 psi', '2,6 psi'],
            f'P(8 000 ft) = {fr(pc)} hPa ; P(FL410) = {fr(pe)} hPa ; Δp = {fr(pc-pe)} hPa = {fr((pc-pe)*HPA_PSI,1)} psi.'))
Q.append(ex('Altitude cabine 6 000 ft à FL430 (ISA). Pression différentielle ?', f'{fr((p_isa_hpa(6000)-p_isa_hpa(43000))*HPA_PSI,1)} psi', ['8,3 psi', '11,6 psi', '6,0 psi'],
            f'{fr(p_isa_hpa(6000))} − {fr(p_isa_hpa(43000))} = {fr(p_isa_hpa(6000)-p_isa_hpa(43000))} hPa = {fr((p_isa_hpa(6000)-p_isa_hpa(43000))*HPA_PSI,1)} psi : une cabine plus basse exige un fuselage plus résistant.'))
Q.append(ex('Taux de variation de l\'altitude cabine confortable en montée (ordre de grandeur) :', '≈ 500 ft/min', ['≈ 5 000 ft/min', '≈ 50 ft/min', '≈ 2 000 ft/min'],
            'Environ 300 à 500 ft/min en montée et 300 ft/min en descente, pour le confort des oreilles.'))
Q.append(ex('Pendant une descente très rapide, la pression extérieure dépasse la pression cabine. Ce qui protège la structure :', 'la soupape de dépression (negative relief valve)', ['la vanne de sortie fermée', 'les packs', 'l\'APU'],
            'Le fuselage est conçu pour résister à la surpression intérieure, pas à une dépression importante.'))
Q.append(ex('Point de congélation maximal du Jet A-1 :', '−47 °C', ['−40 °C', '−60 °C', '0 °C'], 'Jet A-1 : −47 °C ; Jet A (Amérique du Nord) : −40 °C.'))
Q.append(ex('Température totale de l\'air −45 °C, température du carburant −43 °C, carburant Jet A-1 (−47 °C) avec marge constructeur de 3 °C. Action ?', 'augmenter la vitesse ou descendre vers un air plus chaud',
            ['aucune', 'réduire la vitesse', 'monter'],
            'Il ne reste que 4 °C au-dessus du point de congélation, proche de la marge de 3 °C : accélérer augmente l\'échauffement cinétique ; descendre trouve un air plus chaud.'))
Q.append(ex('Carburant au départ 18 000 kg ; consommé (débitmètres) 9 600 kg ; carburant à bord (jauges) 7 600 kg. Conclusion ?', 'écart de 800 kg : possibilité de fuite',
            ['tout est normal', 'les débitmètres surestiment', 'écart de 1 600 kg'], '18 000 − 9 600 = 8 400 kg attendus contre 7 600 kg : 800 kg manquent. On applique la procédure de fuite carburant (vol Air Transat 236, 2001).'))
Q.append(ex('Pourquoi gonfle-t-on les pneus à l\'azote ?', 'gaz inerte et sec : pas de combustion ni de glace', ['l\'azote est plus léger que l\'air', 'pour réduire la pression', 'parce que c\'est moins cher'],
            'Avec de l\'air, l\'oxygène peut entretenir un incendie au contact des freins chauds, et l\'humidité peut geler en altitude.'))
Q.append(ex('Antigivrage des becs de bord d\'attaque d\'un avion de ligne à réaction :', 'thermique, par air chaud prélevé', ['par boudins pneumatiques', 'par liquide', 'aucun'],
            'Les boudins (dégivrage) équipent surtout les turbopropulseurs ; les réacteurs fournissent de l\'air chaud en abondance.'))
Q.append(ex('Avis de résolution TCAS « CLIMB » alors que le contrôleur demande de descendre :', 'on suit le RA et l\'on informe le contrôle', ['on suit le contrôleur', 'on ne fait rien', 'on vire à droite'],
            'Collision d\'Überlingen (2002) : un équipage a suivi le contrôleur contre son RA. Le RA prime [RÉFÉRENCÉ] OACI Doc 8168 et rapport BFU AX001-1-2/02.'))
Q.append(ex('Alerte GPWS « SINK RATE » : mode concerné ?', 'mode 1 (taux de descente excessif)', ['mode 2', 'mode 3', 'mode 5'], 'Mode 1 : taux de descente excessif par rapport à la hauteur radio.'))
Q.append(ex('Alerte « DON\'T SINK » juste après le décollage : mode concerné ?', 'mode 3 (perte d\'altitude après décollage)', ['mode 1', 'mode 4', 'mode 5'], 'Mode 3 : perte d\'altitude en montée initiale ou après remise de gaz.'))
Q.append(ex('Alerte « GLIDESLOPE » : mode concerné ?', 'mode 5 (sous le plan de descente)', ['mode 2', 'mode 3', 'mode 4'], 'Mode 5 : écart sous l\'alignement de descente ILS.'))
Q.append(ex('Panne totale des générateurs moteurs en vol sur un avion de ligne. Source de secours qui se déploie automatiquement :', 'l\'éolienne de secours (RAT)', ['l\'APU seul', 'la batterie seule pour tout le vol', 'aucune'],
            'La RAT fournit puissance hydraulique et/ou électrique de secours (vol US Airways 1549, 2009 ; vol Air Transat 236, 2001).'))
Q.append(ex('Pourquoi le moteur d\'un avion de ligne a-t-il deux boucles de détection incendie ?', 'pour éviter les fausses alarmes et garder la détection si une boucle tombe en panne', ['pour éteindre deux feux', 'pour chauffer le moteur', 'pour le dégivrage'],
            'Logique « ET » (les deux boucles) pour l\'alarme, basculement sur une seule boucle en cas de panne de l\'autre.'))
assert len(Q) == 20, len(Q)

MOD = {'id': 'q2-systemes', 't': 'Systèmes : hydraulique, électricité, pressurisation, carburant, protections', 'h': H, 'quiz': Q}
