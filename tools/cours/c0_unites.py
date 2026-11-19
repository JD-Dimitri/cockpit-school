"""Cours 0 · thème 3 : unités et conversions de l'aéronautique (ft/m, NM/km, kt, hPa/inHg, °C/°F/K, kg/lb,
litres/gallons US, densité du carburant). 30 exercices corrigés."""
from commun import ex, fr, close

FT, NM, KT_KMH, INHG, LB, USG = 0.3048, 1852, 1.852, 33.8639, 0.45359237, 3.785411784

H = """
<p>L'aéronautique mélange les unités : altitudes en pieds, distances en milles nautiques, vitesses en nœuds, pressions en
hectopascals ou en pouces de mercure, masses en kilogrammes ou en livres. Une erreur de conversion peut être grave :
le Boeing 767 d'Air Canada (vol 143, 1983) a manqué de carburant à la suite d'une confusion entre livres et kilogrammes.</p>

<h3>Les conversions à connaître</h3>
<table class="kv"><tbody>
<tr><th>1 pied (ft)</th><td>0,3048 m (exact) · 1 m ≈ 3,28 ft</td></tr>
<tr><th>1 mille nautique (NM)</th><td>1 852 m (exact) · ≈ 6 076 ft · 1 minute d'arc de latitude</td></tr>
<tr><th>1 nœud (kt)</th><td>1 NM/h = 1,852 km/h ≈ 0,514 m/s ≈ 101,3 ft/min</td></tr>
<tr><th>1 mile terrestre (SM)</th><td>1 609,344 m (utilisé pour la visibilité aux États-Unis)</td></tr>
<tr><th>Pression</th><td>1 013,25 hPa = 29,92 inHg · 1 inHg ≈ 33,86 hPa · 1 hPa = 100 Pa</td></tr>
<tr><th>Température</th><td>°F = °C × 9/5 + 32 · K = °C + 273,15</td></tr>
<tr><th>Masse</th><td>1 lb = 0,453 6 kg · 1 kg ≈ 2,205 lb</td></tr>
<tr><th>Volume</th><td>1 gallon US = 3,785 L</td></tr>
<tr><th>Carburant</th><td>masse = volume × masse volumique ; Jet A-1 ≈ 0,80 kg/L (de 0,775 à 0,840 selon la température) ; AVGAS 100LL ≈ 0,72 kg/L</td></tr>
</tbody></table>

<h3>Méthode</h3>
<ol><li>Écrire la valeur avec son unité.</li>
<li>Multiplier par un facteur égal à 1 (par exemple 1 852 m / 1 NM) pour faire disparaître l'unité de départ.</li>
<li>Vérifier l'ordre de grandeur : des pieds donnent un nombre ~3 fois plus grand que des mètres ; des livres ~2 fois plus grand que des kilos.</li></ol>
<p>Ordres de grandeur utiles : FL350 ≈ 10 700 m ; 250 kt ≈ 463 km/h ; une différence de 1 hPa ≈ 27 ft d'altitude près du sol (≈ 30 ft en règle pratique).</p>
<div class="box"><b>Les valeurs exactes</b> (1 ft = 0,3048 m ; 1 NM = 1 852 m ; 1 lb = 0,453 592 37 kg) sont des définitions internationales.
La masse volumique du carburant, elle, varie : on utilise la valeur mesurée le jour du vol.</div>
"""

Q = []
Q.append(ex('1 000 ft en mètres :', '305 m', ['3 280 m', '328 m', '1 000 m'], '1 000 × 0,3048 = 304,8 m.'))
Q.append(ex('3 000 m en pieds (arrondi) :', '9 843 ft', ['914 ft', '9 000 ft', '10 000 ft'], f'3 000 / 0,3048 = {fr(3000/FT)} ft.'))
Q.append(ex('1 NM en mètres :', '1 852 m', ['1 609 m', '1 000 m', '6 076 m'], 'Le mille nautique vaut exactement 1 852 m.'))
Q.append(ex('120 kt en km/h :', f'{fr(120*KT_KMH)} km/h', ['120 km/h', '193 km/h', '62 km/h'], f'120 × 1,852 = {fr(120*KT_KMH,1)} km/h.'))
Q.append(ex('20 °C en kelvins :', '293,15 K', ['253,15 K', '68 K', '20 K'], 'K = °C + 273,15.'))
Q.append(ex('0 °C en degrés Fahrenheit :', '32 °F', ['0 °F', '−32 °F', '273 °F'], '0 × 9/5 + 32 = 32 °F.'))
Q.append(ex('1 013,25 hPa en pouces de mercure :', '29,92 inHg', ['30,12 inHg', '760 inHg', '1,013 inHg'], 'C\'est la pression standard au niveau de la mer : 29,92 inHg.'))
Q.append(ex('100 lb en kilogrammes :', '45,4 kg', ['220,5 kg', '100 kg', '50 kg'], '100 × 0,4536 = 45,4 kg.'))
Q.append(ex('10 gallons US en litres :', '37,9 L', ['45,5 L', '10 L', '26,4 L'], '10 × 3,785 = 37,9 L (le gallon impérial, 4,546 L, ne sert pas en aviation).'))
Q.append(ex('FL350 correspond à une altitude-pression de :', '35 000 ft', ['3 500 ft', '350 ft', '35 000 m'], 'Le niveau de vol est exprimé en centaines de pieds.'))
Q.append(ex('25 °C en °F :', '77 °F', ['45 °F', '57 °F', '98 °F'], '25 × 9/5 + 32 = 45 + 32 = 77 °F.'))
Q.append(ex('−40 °C en °F :', '−40 °F', ['−8 °F', '−72 °F', '40 °F'], '−40 × 9/5 + 32 = −72 + 32 = −40 : c\'est la seule température identique dans les deux échelles.'))
Q.append(ex('98,6 °F en °C :', '37 °C', ['66,6 °C', '33 °C', '42 °C'], '(98,6 − 32) × 5/9 = 37 °C.'))
Q.append(ex('29,72 inHg en hPa (1 inHg = 33,864 hPa) :', f'{fr(29.72*INHG)} hPa', ['1 013 hPa', '1 000 hPa', '1 017 hPa'], f'29,72 × 33,864 = {fr(29.72*INHG,1)} hPa.'))
Q.append(ex('250 kt en m/s :', f'{fr(250*NM/3600,1)} m/s', ['463,0 m/s', '69,4 m/s', '250,0 m/s'], f'250 × 1 852 / 3 600 = {fr(250*NM/3600,1)} m/s.'))
Q.append(ex('Un vent de 10 m/s vaut environ :', '19 kt', ['36 kt', '5 kt', '10 kt'], f'10 / 0,5144 = {fr(10/(NM/3600),1)} kt.'))
Q.append(ex('Vitesse verticale 5 m/s en ft/min :', f'{fr(5/FT*60)} ft/min', ['500 ft/min', '300 ft/min', '1 640 ft/min'], f'5 m/s × 60 = 300 m/min ; 300 / 0,3048 = {fr(5/FT*60)} ft/min.'))
Q.append(ex('Visibilité 5 SM (milles terrestres) en mètres :', f'{fr(5*1609.344)} m', ['9 260 m', '5 000 m', '6 000 m'], f'5 × 1 609 = {fr(5*1609.344)} m. Piège : le mille terrestre n\'est pas le mille nautique.'))
Q.append(ex('2 000 L de Jet A-1 à 0,80 kg/L pèsent :', '1 600 kg', ['2 500 kg', '2 000 kg', '1 440 kg'], '2 000 × 0,80 = 1 600 kg.'))
Q.append(ex('120 L d\'AVGAS à 0,72 kg/L pèsent :', f'{fr(120*0.72,1)} kg', ['166,7 kg', '120,0 kg', '96,0 kg'], f'120 × 0,72 = {fr(120*0.72,1)} kg.'))
# difficile
Q.append(ex('On demande 9 000 kg de Jet A-1 ; masse volumique 0,79 kg/L. Volume à avitailler ?', f'{fr(9000/0.79)} L', ['7 110 L', '9 000 L', '11 250 L'],
            f'V = m / ρ = 9 000 / 0,79 = {fr(9000/0.79)} L. Piège : multiplier au lieu de diviser (7 110 L).'))
Q.append(ex('Il reste 3 200 kg à bord ; on veut 12 000 kg au départ. Densité 0,80. Litres à ajouter ?', '11 000 L', ['8 800 L', '7 040 L', '15 000 L'],
            '(12 000 − 3 200) / 0,80 = 8 800 / 0,80 = 11 000 L.'))
Q.append(ex('Le jaugeur indique 22 300 lb. Masse en kg ?', f'{fr(22300*LB)} kg', ['49 163 kg', '22 300 kg', '11 150 kg'], f'22 300 × 0,4536 = {fr(22300*LB)} kg.'))
Q.append(ex('Air Canada 143 (1983) : le plein a été calculé avec 1,77 « kg » par litre au lieu de 0,803 kg/L (1,77 était un facteur en lb/L). Quelle fraction du carburant voulu y avait-il réellement à bord ?',
            f'≈ {fr(0.803/1.77*100)} %', ['≈ 100 %', '≈ 80 %', '≈ 221 %'],
            f'Les volumes ont été calculés avec 1,77 au lieu de 0,803 : la masse réelle valait 0,803 / 1,77 ≈ {fr(0.803/1.77,2)} fois la masse visée, soit moins de la moitié. [RÉFÉRENCÉ] Rapport de la commission d\'enquête du Canada sur l\'incident de Gimli (1985).'))
Q.append(ex('Vitesse 0,82 Mach à FL350 (vitesse du son 576 kt). Vitesse vraie ?', f'{fr(0.82*576)} kt', ['576 kt', '702 kt', '410 kt'], f'0,82 × 576 = {fr(0.82*576)} kt.'))
Q.append(ex('Calage 1 003 hPa au lieu de 1 013 hPa : erreur d\'altitude affichée (≈ 27 ft/hPa) ?', '≈ 270 ft', ['≈ 10 ft', '≈ 1 000 ft', '≈ 27 ft'],
            '10 hPa × 27 ft/hPa ≈ 270 ft. Calage trop bas → altitude affichée trop basse ; en réalité l\'avion est plus bas si l\'on garde l\'altitude affichée avec le calage trop élevé.'))
Q[-1] = ex('Différence entre deux calages de 1 003 et 1 013 hPa : écart d\'altitude affichée (≈ 27 ft/hPa) ?', '≈ 270 ft', ['≈ 10 ft', '≈ 1 000 ft', '≈ 27 ft'],
           '10 hPa × 27 ft/hPa ≈ 270 ft près du sol (l\'écart par hPa augmente avec l\'altitude).')
Q.append(ex('Température ISA à FL350 : −54,3 °C. En kelvins ?', '218,85 K', ['−54,3 K', '327,45 K', '273,15 K'], '−54,3 + 273,15 = 218,85 K.'))
Q.append(ex('Masse de carburant 6 000 kg ; débit 2 400 kg/h. Autonomie en heures et minutes ?', '2 h 30', ['2 h 50', '2 h 05', '2 h 24'], '6 000 / 2 400 = 2,5 h = 2 h 30.'))
Q.append(ex('Débit 25 gal US/h d\'AVGAS (0,72 kg/L). Débit en kg/h ?', f'{fr(25*USG*0.72,1)} kg/h', ['18,0 kg/h', '94,6 kg/h', '131,4 kg/h'],
            f'25 × 3,785 = 94,6 L/h ; × 0,72 = {fr(25*USG*0.72,1)} kg/h.'))
Q.append(ex('Une piste de 8 000 ft fait combien de mètres ?', f'{fr(8000*FT)} m', ['2 640 m', '24 384 m', '8 000 m'], f'8 000 × 0,3048 = {fr(8000*FT)} m.'))
assert len(Q) == 30, len(Q)

MOD = {'id': 'm0-unites', 't': 'Unités et conversions de l\'aéronautique', 'h': H, 'quiz': Q}
