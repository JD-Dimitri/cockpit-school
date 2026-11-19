"""Cours 0 · thème 5 : fluides et atmosphère (pression, masse volumique, gaz parfaits, atmosphère type ISA,
Bernoulli, portance). 30 exercices corrigés. Valeurs ISA : OACI Doc 7488."""
import math
from commun import ex, fr, close

R = 287.05287   # J/(kg·K), air sec (OACI Doc 7488)
G = 9.80665

def isa_t(h_m): return 288.15 - 0.0065 * min(h_m, 11000)
def isa_p(h_m):
    if h_m <= 11000: return 101325 * (isa_t(h_m) / 288.15) ** (G / (0.0065 * R))
    return isa_p(11000) * math.exp(-G * (h_m - 11000) / (R * 216.65))
def rho(p, t): return p / (R * t)

H = """
<p>L'avion vit dans l'air : sa portance, sa traînée, la poussée de ses moteurs et les indications de ses instruments
dépendent de la pression, de la température et de la masse volumique de l'air.</p>

<h3>1. Pression</h3>
<p>La pression est une force par unité de surface : p = F / S, en pascals (Pa = N/m²). Au niveau de la mer, l'atmosphère
type vaut <b>1 013,25 hPa</b>. La pression diminue avec l'altitude : environ <b>1 hPa par 27 ft (8,3 m)</b> près du sol,
et elle est divisée par deux vers 18 000 ft (5 500 m).</p>

<h3>2. La loi des gaz parfaits</h3>
<p>p = ρ R T, avec ρ la masse volumique (kg/m³), R = 287,05 J/(kg·K) pour l'air sec et T en <b>kelvins</b>.
Au niveau de la mer en atmosphère type : ρ = 101 325 / (287,05 × 288,15) = 1,225 kg/m³.
Air chaud ou altitude élevée → air moins dense → moins de portance, moins de poussée, décollage plus long.</p>

<h3>3. L'atmosphère type internationale (ISA)</h3>
<ul><li>Niveau de la mer : 15 °C, 1 013,25 hPa, 1,225 kg/m³.</li>
<li>Décroissance de la température : 6,5 °C par km (≈ 1,98 °C par 1 000 ft) jusqu'à 11 km.</li>
<li>Tropopause à 11 km (36 089 ft) : −56,5 °C, constante jusqu'à 20 km.</li></ul>
<p>On parle d'« ISA +10 » quand la température réelle dépasse de 10 °C la température type à cette altitude. [RÉFÉRENCÉ] OACI, Doc 7488.</p>

<h3>4. Altitude-densité</h3>
<p>C'est l'altitude de l'atmosphère type qui aurait la même masse volumique que l'air du jour. Règle pratique :
altitude-densité ≈ altitude-pression + 120 ft par °C d'écart à ISA. Un terrain à 5 000 ft par ISA +20 « se comporte » comme un terrain à 7 400 ft.</p>

<h3>5. Bernoulli et la vitesse de l'air</h3>
<p>Le long d'un filet d'air (fluide incompressible, sans frottement) : p + ½ ρ V² = constante. La <b>pression dynamique</b>
q = ½ ρ V² est ce que mesure l'anémomètre (prise de Pitot moins prise statique). Là où l'air accélère (extrados), la pression baisse.</p>

<h3>6. Portance et traînée</h3>
<p>Portance L = ½ ρ V² S C<sub>L</sub> ; traînée D = ½ ρ V² S C<sub>D</sub>. À incidence donnée, elles varient comme ρ et comme V².
L'explication complète de la portance fait intervenir la déviation de l'air vers le bas (Newton) et la répartition de pression (Bernoulli) : ce sont deux façons de décrire le même phénomène.</p>
<div class="box"><b>Toujours en kelvins</b> dans p = ρ R T. Une erreur fréquente : utiliser des degrés Celsius.</div>
"""

Q = []
Q.append(ex('Pression standard au niveau de la mer (ISA) :', '1 013,25 hPa', ['1 000 hPa', '760 hPa', '1 225 hPa'], 'Valeur de l\'atmosphère type OACI.'))
Q.append(ex('Température ISA au niveau de la mer :', '15 °C', ['0 °C', '20 °C', '−56,5 °C'], '15 °C (288,15 K).'))
Q.append(ex('Masse volumique de l\'air ISA au niveau de la mer :', '1,225 kg/m³', ['1 kg/m³', '1 225 kg/m³', '0,736 kg/m³'], 'ρ₀ = 1,225 kg/m³.'))
Q.append(ex('Une force de 500 N sur 0,25 m² exerce une pression de :', '2 000 Pa', ['125 Pa', '500 Pa', '20 Pa'], 'p = F / S = 500 / 0,25 = 2 000 Pa.'))
Q.append(ex('Quand l\'altitude augmente, la masse volumique de l\'air :', 'diminue', ['augmente', 'reste constante', 'double tous les 1 000 ft'], 'La pression baisse plus vite que la température : l\'air est moins dense en altitude.'))
Q.append(ex('Air plus chaud à pression égale : la masse volumique est', 'plus faible', ['plus forte', 'la même', 'nulle'], 'ρ = p / (R T) : T augmente → ρ diminue.'))
Q.append(ex('Température ISA à 2 000 m :', '2 °C', ['−2 °C', '15 °C', '−13 °C'], '15 − 6,5 × 2 = 2 °C.'))
Q.append(ex('Température ISA à la tropopause (11 km) :', '−56,5 °C', ['−50 °C', '−40 °C', '−71,5 °C'], '15 − 6,5 × 11 = −56,5 °C.'))
Q.append(ex('Un anémomètre mesure en fait :', 'la pression dynamique ½ ρ V²', ['la vitesse sol', 'la pression statique', 'la température totale'],
            'Différence entre pression totale (Pitot) et pression statique : q = ½ ρ V².'))
Q.append(ex('Si la vitesse double, la pression dynamique est multipliée par :', '4', ['2', '8', '1,41'], 'q ∝ V².'))
# moyen
Q.append(ex('Masse volumique de l\'air à 1 013,25 hPa et 30 °C :', f'{fr(rho(101325, 303.15),3)} kg/m³', ['1,225 kg/m³', '1,334 kg/m³', '0,103 kg/m³'],
            f'ρ = 101 325 / (287,05 × 303,15) = {fr(rho(101325, 303.15),3)} kg/m³ : 5 % de moins qu\'en ISA.'))
Q.append(ex('Température ISA à FL100 (règle 1,98 °C / 1 000 ft) :', f'{fr(15-1.98*10,1)} °C', ['−15,0 °C', '−20,0 °C', '5,0 °C'], f'15 − 1,98 × 10 = {fr(15-1.98*10,1)} °C.'))
Q.append(ex('À FL100 on mesure −10 °C. Écart à ISA :', 'ISA −5', ['ISA +5', 'ISA −10', 'ISA +25'], 'ISA à FL100 ≈ −5 °C ; −10 − (−5) = −5.'))
Q.append(ex('Altitude-densité d\'un terrain à 5 000 ft (altitude-pression) par ISA +20 (règle 120 ft/°C) :', '7 400 ft', ['5 000 ft', '2 600 ft', '25 000 ft'], '5 000 + 20 × 120 = 7 400 ft.'))
Q.append(ex('Pression ISA à 5 500 m (calcul ISA) :', f'{fr(isa_p(5500)/100)} hPa', ['1 013 hPa', '250 hPa', '756 hPa'], f'p = 1 013,25 × (T/288,15)^5,256 = {fr(isa_p(5500)/100)} hPa : environ la moitié de la pression au sol.'))
Q.append(ex('Pression dynamique à 1,225 kg/m³ et 50 m/s :', f'{fr(0.5*1.225*50**2,1)} Pa', ['61,3 Pa', '3 062,5 kPa', '2 500,0 Pa'], f'q = ½ × 1,225 × 2 500 = {fr(0.5*1.225*2500,1)} Pa.'))
Q.append(ex('Portance d\'une aile de 16 m² à 1,225 kg/m³, 50 m/s, C_L = 0,5 :', f'{fr(0.5*1.225*50**2*16*0.5)} N', ['24 500 N', '1 531 N', '49 000 N'],
            f'L = ½ ρ V² S C_L = 1 531,25 × 16 × 0,5 = {fr(0.5*1.225*2500*16*0.5)} N.'))
Q.append(ex('À incidence et vitesse égales, la portance à ρ = 0,98 kg/m³ comparée à 1,225 kg/m³ :', '−20 %', ['−2 %', '+20 %', '−40 %'],
            '0,98 / 1,225 = 0,80 : la portance baisse de 20 % (terrain d\'altitude, journée chaude).'))
Q.append(ex('Bernoulli : l\'air passe de 0 à 60 m/s (ρ = 1,2). Chute de pression statique :', f'{fr(0.5*1.2*60**2)} Pa', ['36 Pa', '72 Pa', '4 320 Pa'], f'Δp = ½ ρ V² = 0,6 × 3 600 = {fr(0.6*3600)} Pa.'))
Q.append(ex('Différence de pression entre deux altitudes séparées de 270 ft près du sol (≈ 27 ft/hPa) :', '≈ 10 hPa', ['≈ 27 hPa', '≈ 1 hPa', '≈ 100 hPa'], '270 / 27 ≈ 10 hPa.'))
# difficile
Q.append(ex('Masse volumique ISA à FL350 (calcul ISA, 10 668 m) :', f'{fr(rho(isa_p(10668), isa_t(10668)),3)} kg/m³', ['1,225 kg/m³', '0,736 kg/m³', '0,191 kg/m³'],
            f'T = {fr(isa_t(10668),2)} K, p = {fr(isa_p(10668)/100,1)} hPa → ρ = {fr(rho(isa_p(10668), isa_t(10668)),3)} kg/m³, environ 31 % de ρ₀.'))
Q.append(ex('Rapport de densité σ à FL350 :', f'{fr(rho(isa_p(10668), isa_t(10668))/1.225,3)}', ['0,500', '0,738', '0,100'], f'σ = ρ / 1,225 = {fr(rho(isa_p(10668), isa_t(10668))/1.225,3)}.'))
Q.append(ex('Même portance qu\'au niveau de la mer à FL350, à incidence égale : facteur sur la vitesse vraie ?', f'×{fr(1/math.sqrt(rho(isa_p(10668), isa_t(10668))/1.225),2)}', ['×3,24', '×1,00', '×1,24'],
            f'ρ V² constant → V ∝ 1/√σ = 1/√{fr(rho(isa_p(10668), isa_t(10668))/1.225,3)} = {fr(1/math.sqrt(rho(isa_p(10668), isa_t(10668))/1.225),2)}.'))
Q.append(ex('Température ISA à FL450 :', '−56,5 °C', ['−74,1 °C', '−34,5 °C', '−65,0 °C'], 'Au-dessus de 11 km (36 089 ft), la température ISA reste constante à −56,5 °C jusqu\'à 20 km.'))
Q.append(ex('Air à 1 013 hPa ; il passe de 15 °C à 35 °C. Variation de masse volumique :', f'{fr((288.15/308.15-1)*100,1)} %', ['−20,0 %', '−2,0 %', '+6,5 %'],
            f'ρ ∝ 1/T : 288,15 / 308,15 = {fr(288.15/308.15,4)}, soit {fr((288.15/308.15-1)*100,1)} %.'))
Q.append(ex('Un réservoir de 10 m³ d\'air à 1 000 hPa et 0 °C contient une masse de :', f'{fr(rho(100000, 273.15)*10,2)} kg', ['10,00 kg', '1,23 kg', '127,55 kg'],
            f'm = ρ V = 100 000 / (287,05 × 273,15) × 10 = {fr(rho(100000, 273.15)*10,2)} kg.'))
Q.append(ex('Vitesse lue par l\'anémomètre pour q = 1 531 Pa, étalonnée sur ρ₀ = 1,225 :', '50 m/s', ['35 m/s', '1 250 m/s', '70 m/s'], 'V = √(2q / ρ₀) = √(2 × 1 531 / 1,225) = 50 m/s.'))
Q.append(ex('Même pression dynamique (1 531 Pa) à ρ = 0,6 kg/m³ : vitesse vraie ?', f'{fr(math.sqrt(2*1531.25/0.6),1)} m/s', ['50,0 m/s', '102,1 m/s', '35,0 m/s'],
            f'V = √(2 × 1 531 / 0,6) = {fr(math.sqrt(2*1531.25/0.6),1)} m/s : en altitude, la vitesse vraie dépasse la vitesse indiquée.'))
Q.append(ex('Aile de 120 m², avion de 60 t, ρ = 1,225, V = 70 m/s : C_L nécessaire en palier ?', f'{fr(60000*G/(0.5*1.225*70**2*120),2)}', ['0,33', '2,00', '0,07'],
            f'C_L = m g / (½ ρ V² S) = 588 399 / (3 001,25 × 120) = {fr(60000*G/(0.5*1.225*70**2*120),2)}.'))
Q.append(ex('Pression mesurée 850 hPa, température 5 °C. Masse volumique ?', f'{fr(rho(85000, 278.15),3)} kg/m³', ['1,225 kg/m³', '0,850 kg/m³', '10,646 kg/m³'],
            f'ρ = 85 000 / (287,05 × 278,15) = {fr(rho(85000, 278.15),3)} kg/m³.'))
assert len(Q) == 30, len(Q)
close(rho(101325, 288.15), 1.225, 1e-3)

MOD = {'id': 'm0-fluides', 't': 'Fluides et atmosphère', 'h': H, 'quiz': Q}
