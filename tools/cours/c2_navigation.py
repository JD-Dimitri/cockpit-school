"""Cours II · module 6 : navigation — triangle des vitesses, orthodromie et loxodromie, convergence des méridiens,
point équitemps (ETP) et point de non-retour (PNR), radionavigation, descente. Niveau ATPL, très difficile. 20 exercices corrigés."""
import math
from commun import ex, fr, close

H = """
<p class="lead"><b>Niveau confirmé.</b> Matières « Navigation générale » et « Radionavigation » (EASA ATPL, sujets 061 et 062). Suppose acquis le module « Naviguer » du Cours I et la géographie du Cours 0.</p>

<h3>1. Le triangle des vitesses</h3>
<p>Vecteur vitesse air (cap vrai, TAS) + vecteur vent = vecteur vitesse sol (route, GS). Dérive : sin X = W sin(angle vent/route) / TAS ;
GS ≈ TAS × cos X − W cos(angle vent/route) (vent d'où il vient). On résout par composantes ou au calculateur de navigation.</p>

<h3>2. Orthodromie, loxodromie, convergence</h3>
<ul>
<li>L'<b>orthodromie</b> (grand cercle) est le chemin le plus court ; son angle de route change le long du trajet (sauf sur l'équateur ou un méridien).</li>
<li>La <b>loxodromie</b> coupe tous les méridiens sous le même angle ; plus longue, sauf le long de l'équateur ou d'un méridien.</li>
<li><b>Convergence</b> des méridiens entre deux points : Δλ × sin(latitude moyenne). Correction de conversion (orthodromie → loxodromie) = ½ convergence.</li>
<li>Distance sur un parallèle : départ (NM) = Δλ (minutes d'arc) × cos(latitude).</li>
</ul>

<h3>3. Point équitemps et point de non-retour</h3>
<p>Avec D la distance totale, O la vitesse sol aller (out), H la vitesse sol retour (home) :
<b>ETP</b> (temps égal pour continuer ou revenir) à la distance D × H / (O + H) du départ ;
<b>PNR</b> (point le plus éloigné d'où l'on peut revenir avec le carburant disponible, endurance E) à E × O × H / (O + H) en distance, ou E × H / (O + H) en temps.
En panne moteur, l'ETP se recalcule avec les vitesses en configuration dégradée (règles ETOPS / EDTO).</p>

<h3>4. Radionavigation</h3>
<ul>
<li>VOR : radial = relèvement magnétique <b>depuis</b> la station. Erreur de 1° ≈ 1 NM à 60 NM (règle du 1 sur 60).</li>
<li>DME : distance oblique ; au-dessus de la station à FL360, il indique ≈ 6 NM.</li>
<li>ILS : plan de descente standard 3° ; taux de descente ≈ GS × 5 (ft/min, GS en kt) ; hauteur ≈ 318 ft par NM (≈ 300 ft/NM en règle pratique).</li>
<li>RNP : performance de navigation requise ; RNP 1 = erreur totale ≤ 1 NM pendant au moins 95 % du temps de vol [RÉFÉRENCÉ] OACI Doc 9613 (manuel PBN).</li>
</ul>

<h3>5. Planification de la descente</h3>
<p>Règle des 3 : distance de descente (NM) ≈ 3 × hauteur à perdre (milliers de ft), plus 1 NM par 10 kt de vitesse à réduire. Ajuster selon le vent (≈ 2 NM par 10 kt de vent arrière).</p>
<div class="box"><b>Pièges d'examen</b> : l'ETP ne dépend pas du carburant ; le PNR ne dépend pas de la distance à la destination ; le vent déplace l'ETP <b>vers le vent</b> (du côté d'où il vient).</div>
"""

def wind(tas, track, wd, ws):
    a = math.radians(wd - track)
    x = math.asin(ws * math.sin(a) / tas)
    gs = tas * math.cos(x) - ws * math.cos(a)
    return math.degrees(x), gs

Q = []
x, gs = wind(450, 90, 30, 60)
Q.append(ex('TAS 450 kt, route vraie 090°, vent 030°/60 kt. Cap vrai à prendre ?', f'{fr((90+x)%360):0>3}°', ['097°', '090°', '077°'],
            f'sin X = 60 × sin(030° − 090°) / 450 = {fr(60*math.sin(math.radians(-60))/450,4)} → correction {fr(abs(x),1)}° : le vent de nord-est pousse l\'avion vers la droite (dérive droite), on corrige à gauche, face au vent : cap {fr((90+x)%360):0>3}°.'))
Q.append(ex('Même cas : vitesse sol ?', f'{fr(gs)} kt', ['450 kt', '480 kt', '390 kt'], f'GS = 450 × cos X − 60 × cos(−60°) = {fr(450*math.cos(math.radians(x)),1)} − 30 = {fr(gs)} kt.'))
x2, gs2 = wind(150, 360, 270, 30)
Q.append(ex('TAS 150 kt, route 360°, vent 270°/30 kt (plein travers). Vitesse sol ?', f'{fr(gs2,1)} kt', ['150,0 kt', '120,0 kt', '153,0 kt'],
            f'X = asin(30/150) = {fr(abs(x2),1)}° ; GS = 150 cos X = {fr(gs2,1)} kt : même un vent de travers pur réduit la vitesse sol.'))
D, O, Hm = 1800, 480, 400
Q.append(ex('Traversée 1 800 NM ; GS aller 480 kt, GS retour 400 kt. Distance du point équitemps depuis le départ ?', f'{fr(D*Hm/(O+Hm))} NM', ['900 NM', '982 NM', '1 636 NM'],
            f'ETP = D × H / (O + H) = 1 800 × 400 / 880 = {fr(D*Hm/(O+Hm))} NM : l\'ETP est décalé vers le vent (côté départ ici, car le vent est arrière à l\'aller).'))
E = 5.5
Q.append(ex('Même avion : endurance utilisable 5 h 30 (hors réserves). Temps jusqu\'au PNR ?', f'{fr(E*Hm/(O+Hm)*60)} min', ['165 min', '180 min', '135 min'],
            f'T = E × H / (O + H) = 5,5 × 400 / 880 = {fr(E*Hm/(O+Hm),3)} h = {fr(E*Hm/(O+Hm)*60)} min (2 h 30).'))
Q.append(ex('Distance du PNR depuis le départ ?', f'{fr(E*O*Hm/(O+Hm))} NM', ['1 320 NM', '1 100 NM', '1 800 NM'], f'2,5 h × 480 kt = {fr(E*O*Hm/(O+Hm))} NM.'))
Q.append(ex('Si le vent change, le PNR (vent nul → vent régulier quelconque, même endurance) :', 'se rapproche du départ', ['s\'éloigne du départ', 'ne change pas', 'se rapproche de la destination'],
            'O H / (O + H) est maximal sans vent (moyenne harmonique ≤ moyenne arithmétique) : tout vent régulier réduit le rayon d\'action.'))
conv = 40 * math.sin(math.radians(50))
Q.append(ex('Convergence des méridiens entre 10° W et 30° E à la latitude moyenne de 50° N ?', f'{fr(conv,1)}°', ['40,0°', '25,7°', '15,3°'],
            f'Δλ × sin(lat) = 40 × sin 50° = {fr(conv,1)}°. Piège : 25,7° = 40 × cos 50°.'))
Q.append(ex('Correction de conversion (orthodromie / loxodromie) dans le même cas :', f'{fr(conv/2,1)}°', ['30,6°', '7,7°', '40,0°'],
            f'½ convergence = {fr(conv/2,1)}°.'))
dep = 600 * math.cos(math.radians(60))
Q.append(ex('Vol le long du parallèle 60° N sur 10° de longitude. Distance ?', f'{fr(dep)} NM', ['600 NM', '520 NM', '1 200 NM'], f'10° = 600′ ; départ = 600 × cos 60° = {fr(dep)} NM.'))
la1, lo1, la2, lo2 = map(math.radians, (49.0, 2.55, 40.64, -73.78))
d = math.acos(math.sin(la1)*math.sin(la2) + math.cos(la1)*math.cos(la2)*math.cos(lo2-lo1))
Q.append(ex('Distance orthodromique Paris-CDG (49,00° N, 2,55° E) → New York-JFK (40,64° N, 73,78° W) ?', f'≈ {fr(math.degrees(d)*60)} NM', ['≈ 3 980 NM', '≈ 2 750 NM', '≈ 4 580 NM'],
            f'cos d = sin φ1 sin φ2 + cos φ1 cos φ2 cos Δλ → d = {fr(math.degrees(d),2)}° = {fr(math.degrees(d)*60)} NM [CALCULÉ].'))
y = math.sin(lo2-lo1)*math.cos(la2); xx = math.cos(la1)*math.sin(la2) - math.sin(la1)*math.cos(la2)*math.cos(lo2-lo1)
rv = (math.degrees(math.atan2(y, xx)) + 360) % 360
Q.append(ex('Route vraie initiale de l\'orthodromie CDG → JFK ?', f'≈ {fr(rv)}°', ['≈ 260°', '≈ 270°', '≈ 240°'],
            f'tan R = sin Δλ cos φ2 / (cos φ1 sin φ2 − sin φ1 cos φ2 cos Δλ) → {fr(rv)}° : on part vers le Nord-Ouest, la route s\'incurve vers le Sud-Ouest à l\'arrivée.'))
Q.append(ex('Écart latéral : à 45 NM d\'un VOR, l\'indicateur montre 4° d\'écart. Distance latérale ?', '3 NM', ['4 NM', '45 NM', '0,3 NM'], 'Règle du 1 sur 60 : 45 × 4 / 60 = 3 NM.'))
Q.append(ex('DME lu à la verticale d\'une station à FL360 ?', f'≈ {fr(36000/6076.1,1)} NM', ['0,0 NM', '3,6 NM', '36,0 NM'], f'Distance oblique = hauteur : 36 000 ft / 6 076 ft = {fr(36000/6076.1,1)} NM.'))
Q.append(ex('ILS 3°, GS 140 kt. Taux de descente ?', f'≈ {fr(140*101.27*math.tan(math.radians(3)))} ft/min', ['≈ 420 ft/min', '≈ 1 400 ft/min', '≈ 300 ft/min'],
            f'V_z = GS × tan 3° = 140 × 101,27 × 0,0524 = {fr(140*101.27*math.tan(math.radians(3)))} ft/min (règle pratique : GS × 5 = 700).'))
Q.append(ex('ILS 3° : hauteur théorique à 4 NM du seuil (point de référence à 50 ft) ?', f'≈ {fr(4*6076.1*math.tan(math.radians(3))+50)} ft', ['≈ 1 200 ft', '≈ 1 000 ft', '≈ 1 600 ft'],
            f'4 × 6 076 × tan 3° = {fr(4*6076.1*math.tan(math.radians(3)))} ft + 50 ft = {fr(4*6076.1*math.tan(math.radians(3))+50)} ft.'))
Q.append(ex('Descente de FL370 vers 3 000 ft, en réduisant de 280 à 250 kt. Distance de début de descente (règle des 3) ?', '≈ 105 NM', ['≈ 111 NM', '≈ 34 NM', '≈ 90 NM'],
            '34 000 ft × 3 = 102 NM + 3 NM pour réduire de 30 kt = 105 NM (sans vent).'))
Q.append(ex('Même descente avec 40 kt de vent arrière moyen :', '≈ 113 NM', ['≈ 97 NM', '≈ 105 NM', '≈ 145 NM'], 'On ajoute ≈ 2 NM par 10 kt de vent arrière : 105 + 8 = 113 NM.'))
Q.append(ex('Avion sur le radial 090 d\'un VOR, en rapprochement vers la station. Route magnétique ?', '270°', ['090°', '180°', '360°'],
            'Le radial est le relèvement magnétique depuis la station : sur le radial 090 on est à l\'est ; pour rejoindre la station on vole au 270°.'))
Q.append(ex('RNP 1 signifie :', 'erreur totale ≤ 1 NM pendant au moins 95 % du temps', ['erreur ≤ 1 NM en permanence', 'erreur ≤ 0,1 NM', 'un seul récepteur GNSS'],
            'Définition de la navigation fondée sur les performances [RÉFÉRENCÉ] OACI Doc 9613.'))
assert len(Q) == 20, len(Q)

MOD = {'id': 'q1-navigation', 't': 'Navigation : triangle des vitesses, ETP, PNR, orthodromie, radionavigation', 'h': H, 'quiz': Q}
