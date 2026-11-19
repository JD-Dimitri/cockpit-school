"""Cours II · module 3 : propulsion — rendement propulsif, turboréacteurs à double flux, flat rating, consommation spécifique,
moteurs à pistons en altitude, hélices. Niveau ATPL, très difficile. 20 exercices corrigés."""
import math
from commun import ex, fr, close

H = """
<p class="lead"><b>Niveau confirmé.</b> Matière « Connaissance générale de l'aéronef : moteurs » (EASA ATPL, sujet 021). Suppose acquis le module « Le moteur » du Cours I.</p>

<h3>1. Poussée et rendement propulsif</h3>
<p>Poussée nette : F = ṁ (V<sub>j</sub> − V<sub>0</sub>) (+ poussée de pression si la tuyère n'est pas adaptée).
Rendement propulsif (Froude) : η<sub>p</sub> = 2 / (1 + V<sub>j</sub> / V<sub>0</sub>). Pour une même poussée, accélérer <b>beaucoup d'air un peu</b>
est plus efficace qu'accélérer peu d'air beaucoup : c'est la raison du double flux à grand taux de dilution (BPR = débit secondaire / débit primaire, 8 à 12 sur les moteurs récents).</p>

<h3>2. Cycle et limites</h3>
<ul>
<li>Le paramètre de poussée affiché est l'<b>EPR</b> (rapport de pression de tuyère) ou le <b>N1</b> (régime de la soufflante).</li>
<li>La limite principale est la <b>température des gaz</b> (EGT / TIT). Par temps chaud, l'air est moins dense : pour une même poussée il faut plus de carburant et plus de température.</li>
<li><b>Flat rating</b> : la poussée de décollage est garantie constante jusqu'à une température de référence (souvent ISA + 15 °C) ; au-delà, elle diminue car la limite d'EGT est atteinte.</li>
<li><b>Poussée réduite</b> (température fictive, « FLEX » ou « assumed temperature ») : on annonce au calculateur une température plus élevée que la réelle pour décoller avec moins de poussée et préserver le moteur ; interdite sur piste contaminée [RÉFÉRENCÉ] pratiques Airbus/Boeing.</li>
</ul>

<h3>3. Consommation spécifique</h3>
<p>TSFC (réacteur) = débit carburant / poussée (kg/(daN·h) ou lb/(lbf·h)) ; SFC (piston, turbopropulseur) = débit / puissance (g/(kW·h)).
La consommation par heure baisse avec l'altitude jusqu'à l'optimum ; la distance franchissable par kilogramme (« specific range » = TAS / débit) croît avec l'altitude
jusqu'à l'altitude optimale, qui elle-même croît quand la masse diminue (montées par paliers).</p>

<h3>4. Moteurs à pistons</h3>
<p>Sans suralimentation, la puissance décroît avec la densité. Formule de Gagg-Farrar : P / P<sub>0</sub> = 1,132 σ − 0,132 (σ = ρ / ρ<sub>0</sub>).
Le mélange doit être appauvri en altitude ; le <b>givrage carburateur</b> est le plus probable entre −10 °C et +25 °C par humidité élevée, même par beau temps.
Un turbocompresseur maintient la pression d'admission jusqu'à l'altitude de rétablissement.</p>

<h3>5. Hélices</h3>
<p>Rendement maximal ≈ 0,8 à 0,85. Avance par tour J = V / (n D). Le calage variable (vitesse constante) garde l'hélice près de son incidence optimale ;
en panne, la mise en drapeau réduit considérablement la traînée. Bout de pale : vitesse résultante √(V² + (π n D)²) qui doit rester sous Mach ≈ 0,9.</p>
<div class="box"><b>Pièges d'examen</b> : le rendement propulsif augmente quand V<sub>j</sub> se rapproche de V<sub>0</sub>, mais la poussée diminue alors (il faut plus de débit) ;
le flat rating protège la poussée, pas la température ; la consommation horaire n'est pas la distance franchissable.</div>
"""

Q = []
Q.append(ex('Réacteur : débit d\'air 200 kg/s, V0 = 0 (point fixe), Vj = 400 m/s. Poussée ?', '80 kN', ['40 kN', '800 kN', '8 kN'], 'F = ṁ (Vj − V0) = 200 × 400 = 80 000 N.'))
Q.append(ex('Même moteur à V0 = 250 m/s (Vj inchangée). Poussée ?', '30 kN', ['80 kN', '50 kN', '130 kN'], 'F = 200 × (400 − 250) = 30 000 N : la poussée nette chute avec la vitesse si Vj est fixe.'))
Q.append(ex('Rendement propulsif pour V0 = 250 m/s, Vj = 400 m/s ?', f'{fr(2/(1+400/250)*100,1)} %', ['62,5 %', '100,0 %', '38,5 %'],
            f'ηp = 2 / (1 + 400/250) = 2 / 2,6 = {fr(2/(1+400/250)*100,1)} %. Piège : 62,5 % = V0 / Vj.'))
Q.append(ex('Double flux : V0 = 250 m/s, Vj = 300 m/s. Rendement propulsif ?', f'{fr(2/(1+300/250)*100,1)} %', ['83,3 %', '76,9 %', '50,0 %'],
            f'ηp = 2 / (1 + 1,2) = {fr(2/2.2*100,1)} %.'))
Q.append(ex('Pour produire la même poussée avec Vj − V0 = 50 m/s au lieu de 150 m/s, le débit d\'air doit être multiplié par :', '3', ['1/3', '9', '√3'],
            'F = ṁ ΔV : pour F constant, ṁ est inversement proportionnel à ΔV, soit 150 / 50 = 3.'))
Q.append(ex('Débit total 1 100 kg/s, taux de dilution 10. Débit du flux primaire (chaud) ?', '100 kg/s', ['110 kg/s', '1 000 kg/s', '91 kg/s'],
            'BPR = ṁs / ṁp = 10 ; ṁp + 10 ṁp = 1 100 → ṁp = 100 kg/s.'))
Q.append(ex('Poussée de décollage « flat rated » à ISA + 15 °C. Terrain au niveau de la mer à 35 °C. La poussée maximale disponible est :', 'inférieure à la poussée nominale',
            ['égale à la poussée nominale', 'supérieure à la poussée nominale', 'nulle'],
            'ISA + 15 = 30 °C au niveau de la mer ; à 35 °C on est au-delà du point de flat rating : la limite d\'EGT réduit la poussée.'))
Q.append(ex('Pourquoi la poussée réduite par température fictive est-elle interdite sur piste contaminée (règle générale des constructeurs) ?', 'les performances d\'accélération-arrêt ne sont plus garanties',
            ['le moteur risque de givrer', 'l\'EGT dépasse sa limite', 'la vitesse V1 devient nulle'],
            'La méthode suppose une piste sèche ou mouillée ; sur contaminant, la traînée et le freinage changent et les calculs de poussée réduite ne sont plus valables.'))
Q.append(ex('Débit carburant 2 × 1 250 kg/h ; poussée totale 2 × 28 kN. TSFC en kg/(daN·h) ?', f'{fr(2500/5600,3)}', ['0,045', '4,464', '0,893'],
            f'TSFC = 2 500 / 5 600 daN = {fr(2500/5600,3)} kg/(daN·h).'))
sr = 470 / 2500
Q.append(ex('TAS 470 kt, débit total 2 500 kg/h. Distance franchissable spécifique ?', f'{fr(sr*1000)} NM pour 1 000 kg', ['5 319 NM pour 1 000 kg', '470 NM pour 1 000 kg', '2 500 NM pour 1 000 kg'],
            f'SR = TAS / débit = 470 / 2 500 = {fr(sr,3)} NM/kg = {fr(sr*1000)} NM pour 1 000 kg.'))
Q.append(ex('Vent de face de 60 kt dans la question précédente. Distance sol pour 1 000 kg ?', f'{fr((470-60)/2500*1000)} NM', ['188 NM', '212 NM', '24 NM'],
            f'(470 − 60) / 2 500 × 1 000 = {fr((470-60)/2500*1000)} NM sol.'))
Q.append(ex('Pourquoi l\'altitude optimale augmente-t-elle au cours du vol ?', 'la masse diminue', ['la température augmente', 'la poussée augmente', 'la tropopause s\'abaisse'],
            'À C_L optimal, W / σ doit rester constant : quand W diminue, σ (densité) peut diminuer → on monte (montées par paliers).'))
s8 = 0.7860  # σ à 8 000 ft ISA
Q.append(ex('Moteur à pistons atmosphérique, σ = 0,786 (≈ 8 000 ft ISA). Puissance disponible (Gagg-Farrar) en % de la puissance au niveau de la mer ?',
            f'{fr((1.132*s8-0.132)*100,1)} %', ['78,6 %', '100,0 %', '65,4 %'],
            f'P / P0 = 1,132 × 0,786 − 0,132 = {fr(1.132*s8-0.132,3)}. Piège : 78,6 % suppose P ∝ σ.'))
s = (0.5 + 0.132) / 1.132
Q.append(ex('À quelle densité relative σ un moteur atmosphérique ne fournit-il plus que 50 % de sa puissance ?', f'{fr(s,3)}', ['0,500', '0,442', '0,707'],
            f'σ = (0,5 + 0,132) / 1,132 = {fr(s,3)} (vers 18 000 ft en ISA).'))
Q.append(ex('Givrage carburateur : situation la plus favorable ?', '+15 °C, humidité relative 80 %, réduction de puissance', ['−20 °C, air sec, plein gaz', '+35 °C, air sec, plein gaz', '−30 °C, nuage, plein gaz'],
            'La détente et l\'évaporation refroidissent l\'air de 20 à 30 °C dans le venturi : le givrage est le plus probable entre −10 et +25 °C avec humidité élevée, surtout à puissance réduite (papillon presque fermé).'))
Q.append(ex('SFC 230 g/(kW·h), puissance 120 kW. Débit carburant ?', f'{fr(0.230*120,1)} kg/h', ['230,0 kg/h', '1,9 kg/h', '52,2 kg/h'], f'0,230 × 120 = {fr(0.230*120,1)} kg/h.'))
D_, n = 1.9, 2700 / 60
tip = math.hypot(60, math.pi * n * D_)
Q.append(ex('Hélice Ø 1,90 m à 2 700 tr/min, V = 60 m/s. Vitesse résultante en bout de pale ?', f'{fr(tip)} m/s', ['269 m/s', '60 m/s', '329 m/s'],
            f'Vitesse de rotation π n D = π × 45 × 1,90 = {fr(math.pi*n*D_)} m/s ; résultante √(60² + {fr(math.pi*n*D_)}²) = {fr(tip)} m/s, soit Mach ≈ {fr(tip/340,2)} au sol.'))
Q.append(ex('Avance par tour J = V / (nD) dans la question précédente (n en tr/s) ?', f'{fr(60/(n*D_),2)}', ['0,23', '1,42', '0,03'],
            f'J = 60 / (45 × 1,90) = {fr(60/(n*D_),2)}.'))
Q.append(ex('Hélice à vitesse constante en descente, manette des gaz réduite : que fait le régulateur ?', 'il diminue le pas pour garder le régime',
            ['il augmente le pas', 'il met l\'hélice en drapeau', 'il ne fait rien'], 'Moins de couple moteur → le régime tend à baisser → le régulateur réduit le calage (petit pas) pour maintenir le régime affiché.'))
Q.append(ex('Bimoteur à hélices, panne d\'un moteur : pourquoi mettre l\'hélice en drapeau ?', 'pour réduire fortement la traînée du moteur arrêté',
            ['pour redémarrer le moteur', 'pour augmenter la portance', 'pour refroidir le moteur'], 'Une hélice en moulinet au petit pas crée une traînée très importante ; en drapeau, les pales sont alignées avec l\'écoulement.'))
assert len(Q) == 20, len(Q)

MOD = {'id': 'q1-propulsion', 't': 'Propulsion : réacteurs, pistons, hélices', 'h': H, 'quiz': Q}
