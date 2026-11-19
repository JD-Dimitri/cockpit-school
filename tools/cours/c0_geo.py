"""Cours 0 · thème 7 : la Terre, les coordonnées et le temps (latitude, longitude, mille nautique, orthodromie,
fuseaux horaires, UTC, jour et nuit). 30 exercices corrigés."""
import math
from commun import ex, fr, close

def gc_nm(la1, lo1, la2, lo2):
    p1, p2, dl = map(math.radians, (la1, la2, lo2 - lo1))
    c = math.sin(p1) * math.sin(p2) + math.cos(p1) * math.cos(p2) * math.cos(dl)
    return math.degrees(math.acos(max(-1, min(1, c)))) * 60

H = """
<p>Naviguer, c'est se situer sur une sphère qui tourne. Ce module donne les repères de géographie et de temps qui servent
à préparer un vol : coordonnées, distances, heures UTC et locales.</p>

<h3>1. Latitude et longitude</h3>
<p>La <b>latitude</b> se mesure de 0° (équateur) à 90° nord ou sud ; la <b>longitude</b> de 0° (méridien de Greenwich) à 180° est ou ouest.
Un degré se divise en 60 minutes d'arc. Exemple : Paris-Charles-de-Gaulle ≈ 49°00′ N, 002°33′ E ; La Réunion (Roland-Garros) ≈ 20°53′ S, 055°31′ E.</p>

<h3>2. Le mille nautique</h3>
<p>Sur un méridien, <b>1 minute de latitude = 1 NM</b> (1 852 m), donc 1° = 60 NM. Le long d'un parallèle, un degré de longitude
vaut 60 NM × cos(latitude) : 60 NM à l'équateur, 30 NM à 60° de latitude, 0 au pôle.</p>

<h3>3. Orthodromie et loxodromie</h3>
<p>Le plus court chemin entre deux points est l'arc de <b>grand cercle</b> (orthodromie) ; son cap change le long du trajet.
La <b>loxodromie</b> coupe tous les méridiens sous le même angle (cap constant) mais elle est plus longue, sauf le long de l'équateur ou d'un méridien.
Distance orthodromique : cos d = sin φ₁ sin φ₂ + cos φ₁ cos φ₂ cos Δλ, puis d (en degrés) × 60 = NM.</p>

<h3>4. Le temps : UTC et heure locale</h3>
<p>L'aviation utilise le <b>temps universel coordonné (UTC)</b>, noté « Z » : 1430Z = 14 h 30 UTC. La Terre tourne de 360° en 24 h,
soit <b>15° par heure</b> (1° en 4 minutes). L'heure légale dépend des pays : France UTC+1 en hiver, UTC+2 en été ; La Réunion UTC+4 toute l'année ;
New York UTC−5 en hiver, UTC−4 en été.</p>

<h3>5. Durée de vol et changement de date</h3>
<p>Heure d'arrivée locale = heure de départ UTC + durée de vol, puis conversion dans le fuseau d'arrivée. Franchir la ligne de changement
de date (≈ 180°) vers l'ouest fait gagner un jour, vers l'est perdre un jour.</p>

<h3>6. Jour et nuit aéronautiques</h3>
<p>Le vol de nuit commence à la fin du crépuscule civil (centre du Soleil à 6° sous l'horizon), selon les règles européennes,
et non au coucher du Soleil. Les éphémérides sont publiées par l'autorité de chaque pays.</p>
<div class="box"><b>Rappel</b> : toujours préciser « UTC » ou « locale » sur un document de vol ; une confusion d'une heure peut annuler une réserve de carburant.</div>
"""

Q = []
Q.append(ex('1 minute de latitude correspond à :', '1 NM', ['1 km', '1 SM', '60 NM'], 'Par définition historique du mille nautique : 1′ de latitude ≈ 1 NM.'))
Q.append(ex('1 degré de latitude correspond à :', '60 NM', ['1 NM', '111 NM', '100 NM'], '60 minutes × 1 NM = 60 NM (≈ 111 km).'))
Q.append(ex('La longitude de Greenwich est :', '0°', ['180°', '90° W', '15° E'], 'Le méridien de Greenwich est l\'origine des longitudes.'))
Q.append(ex('L\'équateur est à la latitude :', '0°', ['90°', '180°', '23,5°'], 'Les latitudes vont de 0° à l\'équateur à 90° aux pôles.'))
Q.append(ex('La Terre tourne de combien de degrés par heure ?', '15°', ['1°', '24°', '360°'], '360° / 24 h = 15° par heure.'))
Q.append(ex('Que signifie « 1430Z » ?', '14 h 30 UTC', ['14 h 30 heure locale', '14 h 30 à Zurich', '2 h 30 du matin'], 'Z (« zulu ») désigne le temps universel coordonné.'))
Q.append(ex('Heure légale française en hiver :', 'UTC+1', ['UTC', 'UTC+2', 'UTC−1'], 'UTC+1 en hiver, UTC+2 en été.'))
Q.append(ex('Il est 1200Z. Heure légale à Paris en été ?', '14 h 00', ['12 h 00', '13 h 00', '10 h 00'], 'Été : UTC+2 → 14 h 00.'))
Q.append(ex('Il est 08 h 00 à La Réunion (UTC+4). Heure UTC ?', '0400Z', ['1200Z', '0800Z', '0300Z'], '08 h 00 − 4 h = 04 h 00 UTC.'))
Q.append(ex('Le plus court chemin entre deux points de la Terre suit :', 'un arc de grand cercle', ['une loxodromie', 'un parallèle', 'une ligne droite sur la carte de Mercator'],
            'L\'orthodromie (grand cercle) est le chemin le plus court sur la sphère.'))
# moyen
Q.append(ex('Distance entre 45° N et 47° 30′ N sur le même méridien :', '150 NM', ['250 NM', '2,5 NM', '90 NM'], '2° 30′ = 150′ = 150 NM.'))
Q.append(ex('Longueur d\'un degré de longitude à 60° de latitude :', '30 NM', ['60 NM', '52 NM', '0 NM'], '60 × cos 60° = 30 NM.'))
Q.append(ex('Longueur d\'un degré de longitude à 49° N (Paris) :', f'{fr(60*math.cos(math.radians(49)),1)} NM', ['60,0 NM', '45,3 NM', '30,0 NM'], f'60 × cos 49° = {fr(60*math.cos(math.radians(49)),1)} NM.'))
Q.append(ex('Différence d\'heure solaire entre deux lieux séparés de 30° de longitude :', '2 h', ['30 min', '30 h', '1 h'], '15° par heure : 30 / 15 = 2 h.'))
Q.append(ex('1° de longitude correspond à combien de minutes de temps ?', '4 min', ['15 min', '1 min', '60 min'], '60 min / 15° = 4 min par degré.'))
Q.append(ex('Départ de Paris 10 h 00 heure légale d\'hiver (UTC+1), vol de 7 h 30. Heure UTC d\'arrivée ?', '1630Z', ['1730Z', '1530Z', '1700Z'], '10 h 00 locale = 0900Z ; + 7 h 30 = 1630Z.'))
Q.append(ex('Même vol (arrivée 1630Z) à New York en hiver (UTC−5). Heure locale d\'arrivée ?', '11 h 30', ['21 h 30', '12 h 30', '10 h 30'], '16 h 30 − 5 h = 11 h 30 locale.'))
Q.append(ex('Vol Paris-CDG → La Réunion : départ 2300Z, durée 11 h 00. Heure locale à La Réunion à l\'arrivée ?', '14 h 00 le lendemain', ['10 h 00 le lendemain', '22 h 00 le même jour', '13 h 00 le lendemain'],
            'Arrivée 2300Z + 11 h = 1000Z le lendemain ; UTC+4 → 14 h 00 locale.'))
Q.append(ex('Pour aller sur un cap constant de Paris à New York, on suit :', 'une loxodromie, plus longue que l\'orthodromie', ['l\'orthodromie, plus courte', 'l\'équateur', 'le méridien de Greenwich'],
            'Cap constant = loxodromie ; elle est plus longue que le grand cercle (sauf le long d\'un méridien ou de l\'équateur).'))
Q.append(ex('Un avion vole plein est le long de l\'équateur sur 10° de longitude. Distance ?', '600 NM', ['300 NM', '60 NM', '1 000 NM'], 'À l\'équateur, 1° de longitude = 60 NM : 10 × 60 = 600 NM.'))
# difficile
pg, run = (49.0097, 2.5479), (-20.8871, 55.5103)
d = gc_nm(*pg, *run)
Q.append(ex('Distance orthodromique Paris-CDG (49,010° N ; 2,548° E) → La Réunion (20,887° S ; 55,510° E) :', f'{fr(d)} NM', ['5 000 NM', '4 900 NM', '6 200 NM'],
            f'cos d = sin φ₁ sin φ₂ + cos φ₁ cos φ₂ cos Δλ → d = {fr(d/60,2)}° × 60 = {fr(d)} NM ([CALCULÉ] avec les coordonnées des aérodromes du simulateur).'))
jfk = (40.6413, -73.7781)
d2 = gc_nm(*jfk, *pg)
Q.append(ex('Distance orthodromique New York-JFK (40,641° N ; 73,778° W) → Paris-CDG :', f'{fr(d2)} NM', ['3 125 NM', '4 500 NM', '2 900 NM'], f'Même formule : {fr(d2)} NM [CALCULÉ].'))
Q.append(ex('Deux points à 60° N séparés de 20° de longitude : distance le long du parallèle (loxodromie) ?', '600 NM', ['1 200 NM', '300 NM', '1 039 NM'], '20 × 60 × cos 60° = 600 NM.'))
dgc = gc_nm(60, 0, 60, 20)
Q.append(ex('Les mêmes deux points (60° N, 0° et 20° E) : distance orthodromique ?', f'{fr(dgc,1)} NM', ['600,0 NM', '1 200,0 NM', '300,0 NM'],
            f'Grand cercle : {fr(dgc,1)} NM, un peu moins que les 600 NM du parallèle : le grand cercle « monte » vers le pôle.'))
Q.append(ex('Convergence des méridiens entre 0° et 20° E à 60° N (Δλ × sin φ) :', f'{fr(20*math.sin(math.radians(60)),1)}°', ['20,0°', '10,0°', '0,0°'],
            f'20 × sin 60° = {fr(20*math.sin(math.radians(60)),1)}° : c\'est la différence entre la route vraie initiale et finale du grand cercle.'))
Q.append(ex('Midi solaire à Greenwich à 12 h 00 UTC. Heure UTC du midi solaire à 55° 30′ E (La Réunion) ?', '08 h 18 UTC', ['15 h 42 UTC', '12 h 00 UTC', '08 h 00 UTC'],
            '55,5° × 4 min = 222 min = 3 h 42 plus tôt : 12 h 00 − 3 h 42 = 08 h 18 UTC (on néglige l\'équation du temps).'))
Q.append(ex('Vol de Tokyo vers Honolulu (vers l\'est) qui franchit la ligne de changement de date : la date locale', 'recule d\'un jour', ['avance d\'un jour', 'ne change pas', 'avance de 12 h'],
            'Vers l\'est on recule d\'un jour au franchissement de la ligne (on « regagne » la journée).'))
Q.append(ex('Vitesse sol 480 kt vers l\'ouest à 60° N : à quelle vitesse angulaire (en longitude) l\'avion se déplace-t-il ?', '16° par heure', ['8° par heure', '15° par heure', '32° par heure'],
            '1° de longitude = 30 NM à 60° N ; 480 / 30 = 16° par heure : plus vite que la rotation de la Terre (15°/h), le Soleil « recule » dans le ciel.'))
Q.append(ex('Un avion décolle au coucher du Soleil et vole vers l\'ouest à 60° N à 480 kt. Que voit l\'équipage ?', 'le Soleil remonte lentement sur l\'horizon', ['la nuit tombe deux fois plus vite', 'le Soleil reste fixe', 'le Soleil se couche aussitôt'],
            'À 16° par heure vers l\'ouest, l\'avion va plus vite que la rotation terrestre (15°/h) : il « rattrape » le Soleil.'))
Q.append(ex('Coordonnée 48° 43,5′ N en degrés décimaux :', '48,725° N', ['48,435° N', '48,435 5° N', '48,705° N'], '43,5′ / 60 = 0,725° → 48,725° N.'))
assert len(Q) == 30, len(Q)

MOD = {'id': 'm0-geo', 't': 'La Terre, les coordonnées et le temps', 'h': H, 'quiz': Q}
