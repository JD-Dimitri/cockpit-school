"""Cours II · module 5 : météorologie — atmosphère standard, stabilité, nuages, vent (géostrophique, Buys-Ballot),
givrage, cisaillement, orages, messages. Niveau ATPL, très difficile. 20 exercices corrigés."""
import math
from commun import ex, fr, close

H = """
<p class="lead"><b>Niveau confirmé.</b> Matière « Météorologie » (EASA ATPL, sujet 050). Suppose acquis le module « La météo » du Cours I.</p>

<h3>1. Atmosphère standard (ISA, OACI Doc 7488)</h3>
<p>Niveau de la mer : 15 °C, 1 013,25 hPa, 1,225 kg/m³. Gradient −6,5 °C/km (≈ −1,98 °C/1 000 ft) jusqu'à la tropopause (11 km, 36 089 ft, −56,5 °C), puis isotherme.
Écart à l'ISA : ISA ± Δ ; à FL300, T<sub>ISA</sub> = 15 − 1,98 × 30 = −44,4 °C.</p>

<h3>2. Stabilité</h3>
<ul>
<li>Gradient adiabatique sec : 9,8 °C/km (≈ 3 °C/1 000 ft) ; saturé : ≈ 6 °C/km en basses couches (4 à 7 selon la température).</li>
<li>Air <b>absolument stable</b> si le gradient réel &lt; saturé ; <b>absolument instable</b> si &gt; sec ; <b>conditionnellement instable</b> entre les deux.</li>
<li>Base des cumulus (point de condensation) ≈ 125 m × (T − T<sub>d</sub>) ≈ 400 ft par °C d'écart (formule d'Espy, approximative).</li>
<li>Inversion : la température augmente avec l'altitude ; très stable, piège brume et polluants, cisaillement possible à son sommet.</li>
</ul>

<h3>3. Le vent</h3>
<p>Au-dessus de la couche de frottement (≈ 2 000 ft), le vent est sensiblement <b>géostrophique</b> : parallèle aux isobares, d'autant plus fort que les isobares sont serrées
et que la latitude est basse (V<sub>g</sub> = ΔP / (ρ f Δn), f = 2 Ω sin φ). <b>Buys-Ballot</b>, hémisphère Nord : dos au vent, la dépression est à gauche.
Près du sol, le frottement réduit le vent et le fait tourner vers les basses pressions (≈ 30° sur terre, 10 à 15° sur mer) : en descendant, le vent <b>recule</b> (tourne à gauche) et faiblit.</p>

<h3>4. Givrage et phénomènes dangereux</h3>
<ul>
<li>Givrage le plus sévère entre 0 et −15 °C en nuage cumuliforme (grosses gouttelettes surfondues : <b>givre transparent</b> / verglas) ; givre blanc par petites gouttelettes plus froides.</li>
<li>Pluie verglaçante : pluie tombant d'une couche chaude au-dessus d'une couche froide (inversion) ; danger extrême.</li>
<li>Orage : trois stades (cumulus, maturité, dissipation) ; la micro-rafale (downburst) produit d'abord un gain de vent de face (augmentation de vitesse) puis un fort vent arrière et un courant descendant.</li>
<li>Contournement des cumulonimbus : à au moins 20 NM en croisière (règle des exploitants), du côté au vent.</li>
</ul>

<h3>5. Messages</h3>
<p>METAR (observation), TAF (prévision d'aérodrome : BECMG, TEMPO, PROB30/40), SIGMET (phénomènes dangereux en route). CAVOK : visibilité ≥ 10 km, pas de nuage sous 5 000 ft
ou sous l'altitude minimale de secteur la plus élevée, pas de CB ni TCU, pas de temps significatif [RÉFÉRENCÉ] OACI Annexe 3.</p>
<div class="box"><b>Pièges d'examen</b> : la tropopause est plus haute à l'équateur (≈ 16 km) qu'aux pôles (≈ 8 km) ; dans la micro-rafale, le premier signe est un gain de vitesse ;
le vent géostrophique augmente quand la latitude diminue, à gradient égal.</div>
"""

Q = []
Q.append(ex('Température ISA à FL250 ?', f'{fr(15-1.98*25,1)} °C', ['−50,0 °C', '−47,5 °C', '−25,0 °C'], f'15 − 1,98 × 25 = {fr(15-1.98*25,1)} °C.'))
Q.append(ex('À FL330, on mesure −41 °C. Écart à l\'ISA ?', f'ISA {"+" if -41-(15-1.98*33)>0 else "−"} {fr(abs(-41-(15-1.98*33)),0)}', ['ISA − 10', 'ISA + 0', 'ISA − 4'],
            f'T_ISA = 15 − 1,98 × 33 = {fr(15-1.98*33,1)} °C ; écart = −41 − ({fr(15-1.98*33,1)}) = {fr(-41-(15-1.98*33),1)} °C.'))
Q.append(ex('Température au sol 26 °C, point de rosée 18 °C. Base approximative des cumulus ?', f'≈ {fr(8*400)} ft', ['≈ 800 ft', '≈ 2 400 ft', '≈ 8 000 ft'],
            '400 ft par °C d\'écart : 8 × 400 = 3 200 ft (≈ 1 000 m).'))
Q.append(ex('Une particule d\'air non saturée monte de 1 500 m à partir de 22 °C. Température d\'arrivée (adiabatique sèche) ?', f'{fr(22-9.8*1.5,1)} °C', ['12,3 °C', '13,0 °C', '17,5 °C'],
            f'22 − 9,8 × 1,5 = {fr(22-9.8*1.5,1)} °C.'))
Q.append(ex('Gradient réel 8 °C/km. L\'air est :', 'conditionnellement instable', ['absolument stable', 'absolument instable', 'neutre'],
            'Entre le gradient saturé (≈ 6) et le sec (9,8) : stable pour l\'air sec, instable une fois saturé.'))
Q.append(ex('Föhn : air à 10 °C au pied au vent (800 m), condensation dès 800 m, sommet 2 800 m (saturé, 6 °C/km), descente sèche jusqu\'à 800 m de l\'autre côté. Température finale ?',
            f'{fr(10-6*2+9.8*2,1)} °C', ['10,0 °C', '−2,0 °C', '22,0 °C'],
            f'Montée saturée : 10 − 6 × 2 = −2 °C ; descente sèche : −2 + 9,8 × 2 = {fr(10-6*2+9.8*2,1)} °C : l\'air est plus chaud et plus sec sous le vent.'))
Q.append(ex('Hémisphère Nord, dos au vent : la dépression est :', 'à gauche', ['à droite', 'devant', 'derrière'], 'Loi de Buys-Ballot.'))
Q.append(ex('Vent à 2 000 ft : 270°/30 kt. Vent probable au sol (sur terre, hémisphère Nord) ?', '240°/15 kt', ['300°/15 kt', '270°/30 kt', '240°/45 kt'],
            'Le frottement réduit le vent de moitié environ et le fait reculer d\'environ 30° (vers la gauche) : 240°/15 kt.'))
f = lambda lat: 2 * 7.2921e-5 * math.sin(math.radians(lat))
vg = 4e2 / (1.2 * f(50) * 300e3)
Q.append(ex('Gradient de 4 hPa sur 300 km, ρ = 1,2 kg/m³, latitude 50°. Vent géostrophique ?', f'{fr(vg,1)} m/s', ['3,3 m/s', '1,1 m/s', '30,0 m/s'],
            f'f = 2Ω sin 50° = {fr(f(50)*1e4,3)}·10⁻⁴ s⁻¹ ; Vg = ΔP / (ρ f Δn) = 400 / (1,2 × {fr(f(50),7)} × 300 000) = {fr(vg,1)} m/s ≈ {fr(vg/0.5144)} kt.'))
Q.append(ex('Même gradient de pression à 25° de latitude : vent géostrophique ?', f'{fr(vg*f(50)/f(25),1)} m/s', [f'{fr(vg,1)} m/s', f'{fr(vg*f(25)/f(50),1)} m/s', '0,0 m/s'],
            f'Vg ∝ 1 / sin φ : {fr(vg,1)} × sin 50° / sin 25° = {fr(vg*f(50)/f(25),1)} m/s.'))
Q.append(ex('Givrage le plus dangereux (accrétion rapide de givre transparent) :', 'nuage cumuliforme entre 0 et −15 °C', ['stratus à −30 °C', 'cirrus à −45 °C', 'ciel clair à +5 °C'],
            'Grosses gouttelettes surfondues abondantes : elles s\'étalent avant de geler (glace claire, dense, adhérente).'))
Q.append(ex('Pluie verglaçante (FZRA) à l\'arrivée : quelle structure verticale l\'explique ?', 'couche chaude (> 0 °C) au-dessus d\'une couche froide au sol', ['couche froide au-dessus d\'une couche chaude', 'atmosphère isotherme à 0 °C', 'forte instabilité convective'],
            'La neige fond dans la couche chaude, la pluie se surfond en traversant la couche froide et gèle à l\'impact.'))
Q.append(ex('En approche, entrée dans une micro-rafale. Premier effet ressenti :', 'augmentation de la vitesse indiquée et tendance à passer au-dessus du plan', ['diminution de la vitesse', 'aucun effet', 'virage incontrôlé'],
            'Vent de face croissant à l\'entrée, puis courant descendant et vent arrière : la vitesse chute. Ne pas réduire la poussée sur le premier gain (vol Delta 191, 1985, NTSB AAR-86/05).'))
Q.append(ex('Micro-rafale : on passe d\'un vent de face de 25 kt à un vent arrière de 25 kt en 40 s. Perte de vitesse air instantanée ?', '50 kt', ['25 kt', '0 kt', '12,5 kt'],
            'L\'inertie conserve la vitesse sol : la vitesse air chute de l\'écart total (25 + 25 = 50 kt) si l\'avion ne réagit pas.'))
Q.append(ex('Hauteur de la tropopause la plus élevée :', 'à l\'équateur', ['aux pôles', 'aux moyennes latitudes', 'identique partout'], '≈ 16-18 km à l\'équateur contre ≈ 8 km aux pôles.'))
Q.append(ex('Pourquoi le courant-jet de la tropopause polaire est-il plus fort en hiver ?', 'le contraste de température pôle-équateur est plus grand', ['la tropopause est plus haute', 'la Terre tourne plus vite', 'il y a moins de nuages'],
            'Vent thermique : le cisaillement vertical de vent est proportionnel au gradient horizontal de température.'))
Q.append(ex('TAF : « TEMPO 1418 4000 TSRA BKN015CB ». Signification :', 'fluctuations temporaires de 14 h à 18 h UTC, chacune de moins d\'une heure',
            ['changement définitif à 14 h', 'probabilité de 40 %', 'orages observés'],
            'TEMPO : fluctuations temporaires, chacune < 1 h et au total < la moitié de la période [RÉFÉRENCÉ] OACI Annexe 3.'))
Q.append(ex('METAR « 24015G28KT ». Écart de rafale ?', '13 kt', ['28 kt', '15 kt', '43 kt'], 'Vent moyen 15 kt, rafales 28 kt : 13 kt d\'écart ; on ajoute souvent la moitié de l\'écart à la vitesse d\'approche (règle constructeur).'))
Q.append(ex('Composante de vent traversier : piste 27, vent 310°/24 kt ?', f'{fr(24*math.sin(math.radians(40)),1)} kt', ['18,4 kt', '24,0 kt', '12,0 kt'],
            f'24 × sin 40° = {fr(24*math.sin(math.radians(40)),1)} kt ; composante de face 24 × cos 40° = {fr(24*math.cos(math.radians(40)),1)} kt (piège : inverser sin et cos).'))
Q.append(ex('Distance minimale recommandée pour contourner un cumulonimbus en croisière (pratique des exploitants) :', '20 NM', ['2 NM', '5 NM', '100 NM'],
            'Grêle, turbulence et foudre peuvent s\'étendre loin de l\'enclume ; on contourne du côté au vent.'))
assert len(Q) == 20, len(Q)

MOD = {'id': 'q1-meteo', 't': 'Météorologie : stabilité, vent, givrage, phénomènes dangereux', 'h': H, 'quiz': Q}
