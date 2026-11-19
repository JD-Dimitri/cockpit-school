"""Cours 0 · thème 1 : mathématiques utiles au pilote (calcul, proportionnalité, pourcentages, puissances,
équations, carrés et racines, interpolation, moyennes pondérées). 30 exercices corrigés, du facile au difficile."""
import math
from commun import ex, fr, close

H = """
<p>Un pilote calcule sans cesse : carburant, temps de vol, pente de descente, centrage, vitesse. Les calculs sont simples,
mais ils doivent être <b>justes</b> et <b>rapides</b>, souvent de tête. Ce module reprend les outils de base, chacun avec un exemple de vol.</p>

<h3>1. Ordres de grandeur et calcul mental</h3>
<p>Avant tout calcul précis, on estime l'ordre de grandeur : il permet de repérer une erreur grossière (une virgule décalée,
une unité oubliée). Exemple : 2 h 40 de vol à 2 600 kg/h, c'est « un peu moins de 3 × 2 600 ≈ 7 800 kg » : on attend environ 7 000 kg.
Calcul exact : 2,667 × 2 600 = 6 933 kg.</p>
<ul><li>Multiplier par 5 = multiplier par 10 puis diviser par 2.</li>
<li>Multiplier par 0,9 = retirer 10 %.</li>
<li>Diviser par 60 : 1 NM par minute = 60 kt ; 2 NM/min = 120 kt.</li></ul>

<h3>2. Proportionnalité et règle de trois</h3>
<p>Deux grandeurs sont <b>proportionnelles</b> quand leur rapport est constant : distance et temps à vitesse constante,
carburant et temps à débit constant. Règle de trois : si 45 min consomment 30 L, alors 1 h consomme 30 × 60 / 45 = 40 L.</p>
<p>Attention : tout n'est pas proportionnel. La portance n'est pas proportionnelle à la vitesse mais à son <b>carré</b> ;
la consommation d'un avion n'est pas proportionnelle à sa masse.</p>

<h3>3. Pourcentages</h3>
<p>Un pourcentage est un rapport sur 100. Une <b>pente de 5 %</b> monte de 5 m tous les 100 m parcourus.
Augmenter de 10 % = multiplier par 1,10 ; diminuer de 10 % = multiplier par 0,90.
Deux hausses successives de 10 % font +21 % (1,1 × 1,1 = 1,21), pas +20 %.</p>

<h3>4. Puissances de 10 et notation scientifique</h3>
<p>101 325 Pa = 1,013 25 × 10<sup>5</sup> Pa. Les préfixes : kilo (10<sup>3</sup>), méga (10<sup>6</sup>), giga (10<sup>9</sup>),
milli (10<sup>−3</sup>), micro (10<sup>−6</sup>). Une fréquence radio de 118,0 MHz vaut 1,18 × 10<sup>8</sup> Hz.</p>

<h3>5. Équations du premier degré</h3>
<p>Relation de base : <b>distance = vitesse × temps</b>. On en tire le temps (t = d / v) ou la vitesse (v = d / t).
Exemple : 350 NM à 140 kt → t = 350 / 140 = 2,5 h = 2 h 30.</p>

<h3>6. Carrés et racines carrées</h3>
<p>La portance et la traînée varient comme le carré de la vitesse : à vitesse doublée, ×4. Inversement, la vitesse de décrochage
varie comme la <b>racine carrée</b> de la masse : V<sub>S2</sub> = V<sub>S1</sub> × √(m<sub>2</sub> / m<sub>1</sub>).
Un avion 21 % plus lourd décroche 10 % plus vite (√1,21 = 1,1).</p>

<h3>7. Interpolation linéaire</h3>
<p>Les manuels de vol donnent les performances dans des tableaux. Entre deux lignes, on <b>interpole</b> :
y = y<sub>1</sub> + (x − x<sub>1</sub>) × (y<sub>2</sub> − y<sub>1</sub>) / (x<sub>2</sub> − x<sub>1</sub>).
Exemple : distance de décollage 300 m à 0 ft et 360 m à 2 000 ft ; à 1 500 ft : 300 + 1 500 × 60 / 2 000 = 345 m.</p>

<h3>8. Moyenne pondérée : la base du centrage</h3>
<p>Le centre de gravité d'un avion est la moyenne des positions (bras de levier) de chaque masse, pondérée par ces masses :
X<sub>G</sub> = Σ(m<sub>i</sub> × x<sub>i</sub>) / Σm<sub>i</sub>. Le produit m × x s'appelle le <b>moment</b>.</p>
<div class="box"><b>Méthode</b> : toujours écrire l'unité de chaque nombre, estimer l'ordre de grandeur, puis vérifier que le résultat est plausible.</div>
"""

Q = []
# ---- facile
Q.append(ex('Un avion vole 2 h 15 min. Combien de minutes au total ?', '135 min', ['215 min', '125 min', '145 min'],
            '2 h = 120 min ; 120 + 15 = 135 min. Les heures ne se comptent pas en base 10.'))
Q.append(ex('Combien d\'heures font 1,75 h, écrites en heures et minutes ?', '1 h 45', ['1 h 75', '1 h 07', '1 h 30'],
            '0,75 h × 60 = 45 min. Une décimale d\'heure n\'est pas un nombre de minutes.'))
Q.append(ex('À 120 kt (120 NM par heure), quelle distance en 1 minute ?', '2 NM', ['1,2 NM', '0,5 NM', '20 NM'],
            '120 NM / 60 min = 2 NM par minute : c\'est la règle de calcul mental la plus utilisée en navigation.'))
Q.append(ex('Un réservoir de 180 L est rempli aux trois quarts. Combien de litres ?', '135 L', ['120 L', '145 L', '60 L'],
            '180 × 3/4 = 135 L.'))
Q.append(ex('Une consommation de 30 L en 45 min correspond à combien de litres par heure ?', '40 L/h', ['22,5 L/h', '45 L/h', '35 L/h'],
            'Règle de trois : 30 × 60 / 45 = 40 L/h.'))
Q.append(ex('Combien de temps faut-il pour parcourir 350 NM à 140 kt ?', '2 h 30', ['2 h 50', '2 h 05', '3 h 00'],
            't = d / v = 350 / 140 = 2,5 h = 2 h 30.'))
Q.append(ex('Une piste de 2 400 m monte de 36 m d\'un bout à l\'autre. Quelle est sa pente ?', '1,5 %', ['15 %', '0,15 %', '3,6 %'],
            'Pente = 36 / 2 400 = 0,015 = 1,5 %.'))
Q.append(ex('101 325 Pa en notation scientifique :', '1,013 25 × 10⁵ Pa', ['1,013 25 × 10³ Pa', '10,132 5 × 10⁵ Pa', '1,013 25 × 10⁶ Pa'],
            'On décale la virgule de 5 rangs : 101 325 = 1,013 25 × 100 000.'))
Q.append(ex('118,000 MHz en hertz :', '1,18 × 10⁸ Hz', ['1,18 × 10⁶ Hz', '1,18 × 10⁵ Hz', '1,18 × 10⁹ Hz'],
            'méga = 10⁶ : 118 × 10⁶ = 1,18 × 10⁸ Hz.'))
Q.append(ex('Une masse augmente de 10 % puis encore de 10 %. Augmentation totale :', '21 %', ['20 %', '11 %', '19 %'],
            '1,10 × 1,10 = 1,21 : les pourcentages successifs se multiplient, ils ne s\'additionnent pas.'))
# ---- moyen
Q.append(ex('Débit carburant 2 600 kg/h pendant 2 h 40 min. Carburant consommé ?', f'{fr(2600*(2+40/60))} kg', ['6 240 kg', '7 040 kg', '6 760 kg'],
            f'2 h 40 = 2,667 h ; 2 600 × 2,667 = {fr(2600*(2+40/60))} kg. Piège : 2,40 h n\'est pas 2 h 40 (2 600 × 2,4 = 6 240).'))
close(2600 * (2 + 40/60), 6933.333)
Q.append(ex('À vitesse doublée, la portance (à incidence égale) est multipliée par :', '4', ['2', '8', '√2'],
            'La portance varie comme V² : 2² = 4.'))
Q.append(ex('Si la vitesse augmente de 10 %, la traînée (à incidence égale) augmente d\'environ :', '21 %', ['10 %', '20 %', '33 %'],
            'Traînée ∝ V² : 1,1² = 1,21, soit +21 %.'))
Q.append(ex('Un avion décroche à 100 kt à 50 t. À quelle vitesse décroche-t-il à 60,5 t ?', '110 kt', ['121 kt', '105 kt', '100 kt'],
            'V_S ∝ √m : 100 × √(60,5/50) = 100 × √1,21 = 110 kt.'))
close(100 * math.sqrt(60.5 / 50), 110)
Q.append(ex('Distance de décollage : 300 m à 0 ft, 360 m à 2 000 ft. Valeur interpolée à 1 500 ft ?', '345 m', ['330 m', '360 m', '315 m'],
            '300 + 1 500 × (360 − 300) / 2 000 = 300 + 45 = 345 m.'))
Q.append(ex('Pilote 80 kg à 1,0 m de la référence, passager 70 kg à 1,0 m, bagages 30 kg à 2,4 m. Bras de levier moyen ?',
            f'{fr((80+70+30*2.4)/180, 2)} m', ['1,47 m', '1,00 m', '1,80 m'],
            f'Moments : 80 + 70 + 72 = 222 kg·m ; masse 180 kg ; 222 / 180 = {fr(222/180, 2)} m. On pondère par les masses.'))
close((80 + 70 + 30 * 2.4) / 180, 1.2333, 1e-3)
Q.append(ex('Une descente de 6 000 ft à 1 500 ft/min dure :', '4 min', ['9 min', '2,5 min', '6 min'],
            '6 000 / 1 500 = 4 min.'))
Q.append(ex('À 180 kt, combien de NM pour descendre de 9 000 ft à 1 000 ft/min ?', '27 NM', ['18 NM', '30 NM', '9 NM'],
            '9 000 ft / 1 000 ft/min = 9 min ; 180 kt = 3 NM/min ; 9 × 3 = 27 NM.'))
Q.append(ex('Pente de descente en % pour 1 000 ft/min à 120 kt (1 kt ≈ 101,3 ft/min) :', '≈ 8,2 %', ['≈ 12 %', '≈ 0,8 %', '≈ 5 %'],
            f'120 kt ≈ 120 × 101,3 = 12 156 ft/min ; 1 000 / 12 156 = {fr(1000/(120*101.27)*100, 1)} %.'))
close(1000 / (120 * 101.27) * 100, 8.23, 1e-2)
Q.append(ex('Résoudre : 3x − 7 = 2x + 5', 'x = 12', ['x = −2', 'x = 2', 'x = 12/5'],
            '3x − 2x = 5 + 7 → x = 12.'))
# ---- difficile
Q.append(ex('Masse 1 000 kg, centre de gravité à 0,95 m. On ajoute 40 kg à 2,20 m. Nouveau centrage ?', f'{fr((1000*0.95+40*2.2)/1040, 3)} m',
            ['1,000 m', '0,950 m', '1,048 m'],
            f'Moment total : 950 + 88 = 1 038 kg·m ; masse 1 040 kg ; X = {fr(1038/1040, 3)} m.'))
close((1000 * 0.95 + 40 * 2.2) / 1040, 0.998, 1e-3)
Q.append(ex('Masse 1 000 kg, centrage 0,95 m. Quelle masse placer à 2,20 m pour amener le centrage à 1,00 m ?', '40 kg', ['50 kg', '38 kg', '42 kg'],
            '(950 + 2,2 m) / (1 000 + m) = 1 → 950 + 2,2 m = 1 000 + m → 1,2 m = 50 → m = 41,7 kg. Réponse la plus proche : 40 kg… vérifiez : 41,7 kg exactement.'
            ))
Q[-1] = ex('Masse 1 000 kg, centrage 0,95 m. Quelle masse placer à 2,20 m pour amener le centrage à 1,00 m ?', f'{fr(50/1.2, 1)} kg', ['50,0 kg', '40,0 kg', '45,5 kg'],
           f'(950 + 2,2 m) / (1 000 + m) = 1 → 1,2 m = 50 → m = {fr(50/1.2, 1)} kg. Piège : oublier que la masse ajoutée change aussi le dénominateur.')
close(50 / 1.2, 41.67, 1e-3)
Q.append(ex('Un avion de 60 t décroche à 120 kt. Après avoir brûlé 9 t de carburant, il décroche à :', f'{fr(120*math.sqrt(51/60), 1)} kt',
            ['102,0 kt', '138,0 kt', '117,0 kt'],
            f'120 × √(51/60) = 120 × {fr(math.sqrt(51/60), 4)} = {fr(120*math.sqrt(51/60), 1)} kt. Pas proportionnel : 120 × 51/60 = 102 kt serait faux.'))
Q.append(ex('Interpolation double : distance 400 m (0 ft, 15 °C), 460 m (2 000 ft, 15 °C), 430 m (0 ft, 25 °C). Estimation à 1 000 ft, 25 °C (effets additifs) :',
            '460 m', ['445 m', '430 m', '490 m'],
            'Effet altitude à 1 000 ft : +30 m ; effet température +10 °C : +30 m ; 400 + 30 + 30 = 460 m.'))
Q.append(ex('Vitesse sol 150 kt, 40 NM à parcourir, heure 10:52. Heure d\'arrivée ?', '11:08', ['11:18', '11:12', '11:04'],
            '40 / 150 = 0,2667 h = 16 min ; 10:52 + 16 min = 11:08.'))
Q.append(ex('Pour descendre de FL120 à 2 000 ft (10 000 ft) sur 30 NM à 240 kt, quelle vitesse verticale ?', f'{fr(10000/(30/240*60))} ft/min',
            ['1 333 ft/min', '2 400 ft/min', '1 000 ft/min'],
            f'Temps : 30 / 240 h = 7,5 min ; 10 000 / 7,5 = {fr(10000/7.5)} ft/min.'))
close(10000 / 7.5, 1333.33, 1e-3)
Q[-1] = ex('Pour descendre de 10 000 ft sur 30 NM à 240 kt, quelle vitesse verticale ?', '1 333 ft/min', ['2 400 ft/min', '1 000 ft/min', '800 ft/min'],
           'Temps : 30 / 240 h = 0,125 h = 7,5 min ; 10 000 / 7,5 = 1 333 ft/min.')
Q.append(ex('La traînée doit diminuer de 19 % à incidence constante. De combien réduire la vitesse ?', '10 %', ['19 %', '9,5 %', '4,4 %'],
            'Traînée ∝ V² : V² × 0,81 → V × 0,9, soit −10 %.'))
Q.append(ex('Débit horaire 2 400 kg/h. Carburant pour 3 h 20 de vol + 30 min de réserve finale + 5 % du délestage pour aléas :',
            f'{fr(2400*(10/3)*1.05 + 2400*0.5)} kg', ['9 200 kg', '9 600 kg', '8 400 kg'],
            f'Délestage 2 400 × 3,333 = 8 000 kg ; aléas 5 % = 400 kg ; réserve 0,5 h = 1 200 kg ; total {fr(2400*(10/3)*1.05 + 2400*0.5)} kg.'))
close(2400 * (10/3) * 1.05 + 2400 * 0.5, 9600, 1e-6)
Q[-1] = ex('Débit horaire 2 400 kg/h. Carburant pour 3 h 20 de vol + 5 % du délestage pour aléas + 30 min de réserve finale :',
           '9 600 kg', ['9 200 kg', '8 400 kg', '9 800 kg'],
           'Délestage 2 400 × 3,333 = 8 000 kg ; aléas 5 % = 400 kg ; réserve 0,5 h = 1 200 kg ; total 9 600 kg.')
Q.append(ex('Si y = k·x² et que y vaut 50 pour x = 10, que vaut x pour y = 72 ?', '12', ['14,4', '11', '13'],
            'k = 50/100 = 0,5 ; 72 = 0,5 x² → x² = 144 → x = 12.'))
Q.append(ex('Un avion parcourt 0,8 NM en 20 s. Sa vitesse sol est :', '144 kt', ['96 kt', '160 kt', '240 kt'],
            '0,8 NM / 20 s = 0,04 NM/s ; × 3 600 = 144 NM/h = 144 kt.'))
assert len(Q) == 30, len(Q)

MOD = {'id': 'm0-maths', 't': 'Mathématiques utiles au pilote', 'h': H, 'quiz': Q}
