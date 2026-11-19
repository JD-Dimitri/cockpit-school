"""Cours II · module 4 : instruments — vitesses IAS/CAS/EAS/TAS/Mach en écoulement compressible, altitude de transition Mach/CAS,
erreurs de l'altimètre, pannes anémobarométriques, gyroscopes et compas. Niveau ATPL, très difficile. 20 exercices corrigés."""
import math
from commun import ex, fr, close

H = """
<p class="lead"><b>Niveau confirmé.</b> Matière « Instrumentation » (EASA ATPL, sujet 022). Suppose acquis le module « Les instruments de bord » du Cours I.</p>

<h3>1. Les vitesses</h3>
<table class="kv"><tbody>
<tr><th>IAS</th><td>lecture brute de l'anémomètre</td></tr>
<tr><th>CAS</th><td>IAS corrigée des erreurs d'installation et d'instrument (position de la prise statique)</td></tr>
<tr><th>EAS</th><td>CAS corrigée de la compressibilité ; EAS ≤ CAS (écart notable au-dessus de 200 kt et en altitude)</td></tr>
<tr><th>TAS</th><td>EAS / √σ : vitesse par rapport à la masse d'air</td></tr>
<tr><th>Mach</th><td>TAS / a ; a = 38,94 √T (kt, T en K) ; a<sub>0</sub> = 661,5 kt</td></tr>
</tbody></table>
<p>En écoulement compressible (formule de Saint-Venant, normalisée OACI) : la pression dynamique « mesurée »
q<sub>c</sub> = P [(1 + 0,2 M²)<sup>3,5</sup> − 1], et la CAS est la vitesse qui donnerait ce même q<sub>c</sub> au niveau de la mer en atmosphère standard.</p>
<p><b>Montée à CAS constante</b> : la TAS et le Mach augmentent. <b>Montée à Mach constant</b> : la CAS diminue (la TAS aussi jusqu'à la tropopause, puis elle reste constante).
L'<b>altitude de transition</b> (crossover) est celle où la CAS de montée et le Mach de montée donnent la même vitesse : au-dessous on tient la CAS, au-dessus le Mach.</p>

<h3>2. L'altimètre</h3>
<ul>
<li>Il mesure la pression statique et l'affiche selon l'atmosphère standard. <b>Du chaud vers le froid, du haut vers le bas</b> (et de la haute vers la basse pression) : on est plus bas que l'indication.</li>
<li>Erreur de température : environ <b>4 % de la hauteur au-dessus de la source du calage par tranche de 10 °C d'écart à l'ISA</b>. Les corrections par temps froid sont publiées [RÉFÉRENCÉ] OACI PANS-OPS Doc 8168, vol. I.</li>
<li>Un hectopascal vaut ≈ 27 ft près du sol (≈ 30 ft en règle pratique), davantage en altitude.</li>
</ul>

<h3>3. Pannes du circuit anémobarométrique</h3>
<table class="kv"><tbody>
<tr><th>Pitot bouché (prise statique libre, purge bouchée)</th><td>l'anémomètre se comporte comme un altimètre : la vitesse augmente en montée et diminue en descente.
C'est le scénario du vol Birgenair 301 (1996).</td></tr>
<tr><th>Prise statique bouchée</th><td>altimètre figé, variomètre à zéro ; l'anémomètre sous-estime en montée et surestime en descente (vol Aeroperú 603, 1996).</td></tr>
<tr><th>Prise statique de secours en cabine (pression plus faible)</th><td>altitude et vitesse indiquées légèrement trop fortes ; variomètre bref saut en montée.</td></tr>
</tbody></table>

<h3>4. Gyroscopes et compas</h3>
<p>Dérive apparente d'un gyroscope « libre » due à la rotation de la Terre : 15° × sin(latitude) par heure (maximale aux pôles, nulle à l'équateur).
Compas magnétique, hémisphère Nord : <b>accélération vers le Nord</b> sur un cap Est ou Ouest (ANDS : Accelerate North, Decelerate South) ;
en virage, le compas <b>retarde</b> en sortie vers le Nord et <b>avance</b> vers le Sud (UNOS : Undershoot North, Overshoot South).
Virage au taux standard (3°/s) : inclinaison ≈ TAS/10 + 7 (en degrés, TAS en kt).</p>
<div class="box"><b>Pièges d'examen</b> : EAS ≤ CAS ; la CAS diminue en montée à Mach constant ; une prise statique bouchée ne fige pas l'anémomètre ;
l'erreur de température de l'altimètre est proportionnelle à la hauteur au-dessus de la station, pas à l'altitude.</div>
"""

P0, A0 = 101325.0, 661.47  # Pa, kt
def isa(h_ft):
    h = h_ft * 0.3048
    if h <= 11000:
        T = 288.15 - 0.0065 * h; P = P0 * (T / 288.15) ** 5.25588
    else:
        T = 216.65; P = 22632.06 * math.exp(-9.80665 * (h - 11000) / (287.053 * T))
    return T, P
def qc_of_cas(cas): return P0 * ((1 + 0.2 * (cas / A0) ** 2) ** 3.5 - 1)
def mach_of_cas(cas, h): T, P = isa(h); return math.sqrt(5 * ((qc_of_cas(cas) / P + 1) ** (2 / 7) - 1))
def tas_of_cas(cas, h): T, P = isa(h); return mach_of_cas(cas, h) * 38.967854 * math.sqrt(T)
def cas_of_mach(M, h):
    T, P = isa(h); qc = P * ((1 + 0.2 * M * M) ** 3.5 - 1)
    return A0 * math.sqrt(5 * ((qc / P0 + 1) ** (2 / 7) - 1))
def crossover(cas, M):
    lo, hi = 0.0, 45000.0
    for _ in range(60):
        mid = (lo + hi) / 2
        if mach_of_cas(cas, mid) < M: lo = mid
        else: hi = mid
    return (lo + hi) / 2

Q = []
m1 = mach_of_cas(300, 35000)
Q.append(ex('CAS 300 kt à FL350 (ISA). Mach ?', f'{fr(m1,3)}', ['0,454', '0,980', '0,733'],
            f'q_c(300 kt) = {fr(qc_of_cas(300))} Pa ; P(FL350) = {fr(isa(35000)[1])} Pa ; M = √(5 [(q_c/P + 1)^(2/7) − 1]) = {fr(m1,3)}. (Calcul exact compressible.)'))
t1 = tas_of_cas(300, 35000)
Q.append(ex('Même cas : TAS ?', f'{fr(t1)} kt', ['300 kt', '573 kt', '447 kt'], f'TAS = M × a = {fr(m1,3)} × {fr(38.967854*math.sqrt(isa(35000)[0]))} kt = {fr(t1)} kt.'))
inc = 300 / math.sqrt(isa(35000)[1] / isa(35000)[0] / (P0 / 288.15))
Q.append(ex('Si l\'on calcule la TAS « incompressible » (TAS = CAS / √σ) pour 300 kt à FL350, on obtient :', f'{fr(inc)} kt',
            [f'{fr(t1)} kt', '300 kt', '357 kt'],
            f'σ = {fr(isa(35000)[1]/isa(35000)[0]/(P0/288.15),3)} ; 300 / √σ = {fr(inc)} kt, trop élevé de {fr(inc-t1)} kt : la formule simple ignore la compressibilité (EAS < CAS). On doit passer par l\'EAS.'))
cx = crossover(300, 0.78)
Q.append(ex('Profil de montée 300 kt / Mach 0,78 (ISA). Altitude de transition (crossover) ?', f'≈ {fr(round(cx/100)*100)} ft', ['≈ 36 089 ft', '≈ 22 000 ft', '≈ 35 000 ft'],
            f'Recherche numérique : M(300 kt CAS) = 0,78 à ≈ {fr(round(cx/100)*100)} ft. Au-dessous on tient 300 kt, au-dessus Mach 0,78.'))
c2 = cas_of_mach(0.78, 37000)
Q.append(ex('Croisière Mach 0,78 à FL370 (ISA). CAS ?', f'{fr(c2)} kt', ['300 kt', '447 kt', '196 kt'], f'Calcul inverse : q_c = P(FL370) [(1 + 0,2 × 0,78²)^3,5 − 1] → CAS = {fr(c2)} kt.'))
Q.append(ex('En montée à Mach constant sous la tropopause, la CAS :', 'diminue', ['augmente', 'reste constante', 'diminue puis augmente'], 'P diminue plus vite que a² : la pression dynamique et donc la CAS diminuent.'))
Q.append(ex('Au-dessus de la tropopause (ISA), en montée à Mach constant, la TAS :', 'reste constante', ['diminue', 'augmente', 'devient nulle'],
            'La température est constante (−56,5 °C) donc a est constante et TAS = M a ne change pas.'))
dh = 0.04 * 2 * 3000
Q.append(ex('Hauteur indiquée 3 000 ft au-dessus d\'un terrain (calage QNH), température ISA − 20 °C. Hauteur vraie approximative ?', f'{fr(3000-dh)} ft',
            ['3 240 ft', '3 000 ft', '2 880 ft'], f'4 % par 10 °C : 3 000 × 8 % = {fr(dh)} ft ; par temps froid on est plus bas : {fr(3000-dh)} ft.'))
Q.append(ex('Altitude minimale de franchissement d\'obstacles d\'approche 2 000 ft au-dessus du terrain. Température au sol −30 °C (terrain à 0 ft). Hauteur à ajouter (règle des 4 %) ?',
            f'≈ {fr(0.04*4.5*2000)} ft', ['≈ 80 ft', '≈ 1 800 ft', '≈ 240 ft'],
            f'ISA au sol 15 °C : écart 45 °C = 4,5 tranches ; 2 000 × 4 % × 4,5 = {fr(0.04*4.5*2000)} ft. (Les tables PANS-OPS donnent un ordre de grandeur voisin.)'))
Q.append(ex('Vol de A (QNH 1 020) vers B (QNH 1 002) sans changer le calage (1 020). Au-dessus de B, l\'avion est :', f'≈ {fr(18*27)} ft plus bas qu\'indiqué',
            ['≈ 486 ft plus haut qu\'indiqué', 'à l\'altitude indiquée', '≈ 18 ft plus bas qu\'indiqué'],
            f'Calage trop fort de 18 hPa → l\'altimètre surestime d\'environ 18 × 27 = {fr(18*27)} ft (« de la haute vers la basse, regarde en bas »).'))
Q.append(ex('Pitot bouché par du givre, purge bouchée, prise statique libre. En montée, l\'anémomètre :', 'indique une vitesse croissante',
            ['indique une vitesse décroissante', 'reste figé', 'indique zéro'], 'La pression totale est piégée ; la statique baisse : la différence augmente. Risque : cabrer pour « réduire » une survitesse fictive (Birgenair 301).'))
Q.append(ex('Prise statique bouchée en croisière, puis descente. Variomètre et altimètre :', 'variomètre à zéro, altimètre figé',
            ['variomètre correct, altimètre figé', 'les deux corrects', 'altimètre qui augmente'], 'Les deux n\'utilisent que la pression statique piégée.'))
Q.append(ex('Même panne (statique bouchée), en descente : l\'anémomètre :', 'surestime la vitesse', ['sous-estime la vitesse', 'est exact', 'indique zéro'],
            'La statique piégée est plus faible que la vraie (l\'air est plus dense en bas) : Pt − Ps piégée est trop grand → vitesse surestimée.'))
Q.append(ex('Dérive apparente d\'un gyroscope directionnel non corrigé à 48° N ?', f'{fr(15*math.sin(math.radians(48)),1)}°/h', ['15,0°/h', '10,0°/h', '7,5°/h'],
            f'15 × sin 48° = 15 × {fr(math.sin(math.radians(48)),3)} = {fr(15*math.sin(math.radians(48)),1)}°/h.'))
Q.append(ex('Hémisphère Nord, cap 270°, accélération. Le compas magnétique indique un virage vers :', 'le Nord', ['le Sud', 'aucun virage', 'l\'Est'], 'ANDS : Accelerate North.'))
Q.append(ex('Hémisphère Nord, virage pour prendre le cap 360°. On arrête le virage :', 'avant que le compas indique 360°', ['quand il indique 360°', 'après qu\'il a dépassé 360°', 'au cap 180°'],
            'UNOS : Undershoot North — le compas retarde vers le Nord, on sort du virage avant (de l\'ordre de la latitude, moins la moitié de l\'inclinaison en règle pratique).'))
Q.append(ex('Virage au taux standard à TAS 140 kt. Inclinaison approximative ?', '21°', ['14°', '30°', '45°'], 'TAS / 10 + 7 = 14 + 7 = 21°.'))
r = 250 * 1852 / 3600
Q.append(ex('Inclinaison exacte pour un taux de 3°/s à TAS 250 kt ?', f'{fr(math.degrees(math.atan(r*math.radians(3)/9.80665)),1)}°', ['32,0°', '25,0°', '45,0°'],
            f'tan φ = V ω / g = {fr(r,1)} × {fr(math.radians(3),5)} / 9,81 → φ = {fr(math.degrees(math.atan(r*math.radians(3)/9.80665)),1)}° (la règle TAS/10 + 7 donne 32°, valable surtout aux basses vitesses ; en pratique on limite à 25°).'))
Q.append(ex('Utilisation de la prise statique de secours dans une cabine non pressurisée (pression cabine plus faible que l\'extérieur) :', 'altitude et vitesse indiquées un peu trop fortes',
            ['altitude et vitesse trop faibles', 'aucune erreur', 'altitude trop faible, vitesse trop forte'], 'Pression statique trop faible → altitude plus haute et différence Pt − Ps plus grande.'))
Q.append(ex('EAS par rapport à CAS à 300 kt, FL350 :', 'EAS légèrement inférieure à la CAS', ['EAS supérieure à la CAS', 'EAS égale à la CAS', 'EAS égale à la TAS'],
            f'Correction de compressibilité : EAS = TAS √σ = {fr(t1*math.sqrt(isa(35000)[1]/isa(35000)[0]/(P0/288.15)))} kt pour 300 kt CAS.'))
assert len(Q) == 20, len(Q)

MOD = {'id': 'q1-instruments', 't': 'Instruments : vitesses compressibles, altimétrie, pannes, gyroscopes', 'h': H, 'quiz': Q}
