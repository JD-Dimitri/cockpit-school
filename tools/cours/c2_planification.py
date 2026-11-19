"""Cours II · partie 2 · module 5 : préparation du vol — politique carburant de l'exploitant, dégagements, plan de vol OACI,
indice de coût, emport de carburant, vols long-courriers. Niveau ATPL, très difficile. 20 exercices corrigés."""
from commun import ex, fr, close

H = """
<p class="lead"><b>Niveau confirmé.</b> Matière « Préparation et suivi du vol » (EASA ATPL, sujet 033). Reprend la formule 6 (bilan carburant) et le cas complet Paris → La Réunion des calculs du pilote de ligne (Cours I, partie 9).
Les règles citées sont celles du schéma de base européen ; chaque exploitant les détaille dans son manuel d'exploitation, approuvé par l'autorité.</p>

<h3>1. Le carburant minimal au départ (schéma de base, CAT.OP.MPA.181 et AMC)</h3>
<table class="kv"><tbody>
<tr><th>Roulage (taxi)</th><td>mise en route, roulage, APU</td></tr>
<tr><th>Étape (trip)</th><td>décollage, montée, croisière, descente, approche et atterrissage à destination</td></tr>
<tr><th>Réserve de route (contingency)</th><td>la plus grande de : 5 % du carburant d'étape ; 5 min d'attente à 1 500 ft au-dessus de la destination</td></tr>
<tr><th>Dégagement (alternate)</th><td>remise de gaz à destination, montée, croisière, descente et atterrissage au dégagement</td></tr>
<tr><th>Réserve finale (final reserve)</th><td>avion à turbines : <b>30 min</b> d'attente à 1 500 ft au-dessus du dégagement (ISA) ; avion à pistons : 45 min</td></tr>
<tr><th>Complémentaire (additional)</th><td>si nécessaire (aérodrome isolé, panne de pressurisation ou de moteur au point le plus critique)</td></tr>
<tr><th>Supplémentaire (extra / discretionary)</th><td>à la décision du commandant</td></tr>
</tbody></table>
<p>Aérodrome isolé (pas de dégagement possible) : carburant pour <b>2 h</b> de croisière normale au-dessus de la destination, réserve finale comprise (avion à turbines).
La Réunion est l'exemple type : le dégagement le plus proche (Maurice) est à environ 125 NM, et les cyclones peuvent fermer les deux terrains à la fois.</p>

<h3>2. Le plan de vol OACI (Doc 4444, appendice 2)</h3>
<p>Case 7 : identification ; case 8 : règles de vol (I, V, Y = IFR puis VFR, Z = VFR puis IFR) et type de vol ; case 9 : type d'aéronef et catégorie de turbulence de sillage
(L, M, H, J pour l'A380) ; case 10 : équipements ; case 15 : vitesse, niveau, route ; case 16 : destination, durée estimée, dégagements ; case 18 : autres renseignements.
Dépôt d'un plan de vol IFR au moins 60 min avant l'heure de départ (en Europe, 3 h recommandées pour les vols soumis à la régulation des flux).</p>

<h3>3. Économie du vol</h3>
<ul>
<li><b>Indice de coût</b> (cost index) = coût du temps / coût du carburant. CI = 0 : consommation minimale (vitesse de distance maximale) ; CI maximal : vitesse maximale.</li>
<li><b>Emport</b> (tankering) : on emporte du carburant moins cher pour l'étape suivante ; mais transporter du carburant coûte du carburant (de l'ordre de 2,5 à 4 % de la masse emportée par heure de vol).</li>
<li><b>Montées par paliers</b> : l'altitude optimale croît quand la masse baisse ; en RVSM, paliers de 2 000 ft (ou 4 000 ft selon le sens du vol et la règle semi-circulaire).</li>
</ul>
<div class="box"><b>Pièges d'examen</b> : la réserve de route est un pourcentage du carburant d'<b>étape</b> (pas du total) ; la réserve finale se calcule à la masse prévue à l'arrivée au dégagement ;
le carburant de roulage ne fait pas partie du carburant au décollage.</div>
"""

Q = []
taxi, trip, alt, ff_hold = 300, 52000, 6200, 2400
cont = max(0.05 * trip, ff_hold * 5 / 60)
fr_ = ff_hold * 30 / 60
total = taxi + trip + cont + alt + fr_
Q.append(ex(f'Étape {fr(trip)} kg ; débit d\'attente à 1 500 ft : {fr(ff_hold)} kg/h. Réserve de route (schéma de base) ?', f'{fr(cont)} kg', [f'{fr(ff_hold*5/60)} kg', f'{fr(0.03*trip)} kg', f'{fr(0.10*trip)} kg'],
            f'max(5 % × {fr(trip)} = {fr(0.05*trip)} ; 5 min × {fr(ff_hold)}/60 = {fr(ff_hold*5/60)}) = {fr(cont)} kg.'))
Q.append(ex(f'Débit d\'attente au dégagement : {fr(ff_hold)} kg/h. Réserve finale (avion à turbines) ?', f'{fr(fr_)} kg', [f'{fr(ff_hold*45/60)} kg', f'{fr(ff_hold)} kg', f'{fr(ff_hold/6)} kg'],
            f'30 min : {fr(ff_hold)} × 0,5 = {fr(fr_)} kg. Piège : 45 min s\'applique aux avions à pistons.'))
Q.append(ex(f'Roulage {fr(taxi)} kg, étape {fr(trip)} kg, réserve de route {fr(cont)} kg, dégagement {fr(alt)} kg, réserve finale {fr(fr_)} kg. Carburant minimal au bloc ?',
            f'{fr(total)} kg', [f'{fr(total-taxi)} kg', f'{fr(total-cont)} kg', f'{fr(trip+alt)} kg'],
            f'Somme : {fr(total)} kg ; au décollage : {fr(total-taxi)} kg.'))
Q.append(ex('Étape courte : 2 400 kg ; débit d\'attente 2 100 kg/h. Réserve de route ?', f'{fr(max(0.05*2400, 2100*5/60))} kg', ['120 kg', '240 kg', '1 050 kg'],
            f'5 % × 2 400 = 120 kg mais 5 min d\'attente = {fr(2100*5/60)} kg : on retient {fr(max(0.05*2400, 2100*5/60))} kg.'))
Q.append(ex('Destination isolée, avion à turbines, consommation de croisière 6 500 kg/h. Carburant minimal au-dessus de la destination (complémentaire + réserve finale) ?', f'{fr(2*6500)} kg',
            ['3 250 kg', '9 750 kg', '6 500 kg'], '2 h de croisière normale au-dessus de la destination, réserve finale comprise : 2 × 6 500 = 13 000 kg.'))
Q.append(ex('Pourquoi Saint-Denis de La Réunion (FMEE) est-il souvent traité comme un aérodrome isolé ?', 'aucun dégagement proche ne garantit un atterrissage, les deux îles pouvant être touchées par le même phénomène',
            ['parce qu\'il n\'y a qu\'une piste', 'parce que le terrain n\'a pas d\'ILS', 'parce que la piste est trop courte'],
            'Le dégagement le plus proche, Maurice (FIMP), est à environ 125 NM ; un cyclone peut affecter les deux. L\'exploitant applique alors la règle de l\'aérodrome isolé ou des dégagements éloignés.'))
Q.append(ex('Case 9 du plan de vol pour un A380 : catégorie de turbulence de sillage :', 'J', ['H', 'M', 'S'], 'J (« Super ») est réservée à l\'A380 ; H pour les avions de 136 t et plus ; M de 7 à 136 t ; L sous 7 t.'))
Q.append(ex('Case 8 « Y » signifie :', 'IFR d\'abord, puis VFR', ['VFR d\'abord, puis IFR', 'IFR seulement', 'vol militaire'], 'Y : IFR puis VFR ; Z : VFR puis IFR.'))
Q.append(ex('Indice de coût 0 :', 'consommation minimale de carburant, vol plus long', ['vitesse maximale', 'altitude minimale', 'coût horaire nul donc vol gratuit'],
            'CI = coût du temps / coût du carburant : à 0, seul le carburant compte (vitesse de distance franchissable maximale).'))
Q.append(ex('Coût du temps 30 €/min, prix du carburant 0,90 €/kg. Indice de coût (en kg/min) ?', f'{fr(30/0.9,1)}', ['27,0', '0,03', '300,0'],
            f'CI = 30 / 0,90 = {fr(30/0.9,1)} kg/min (unité Airbus : kg/min ; Boeing : 100 lb/h).'))
burn = 0.035
Q.append(ex('Emport de 5 000 kg pour une étape de 3 h ; pénalité de 3,5 % de la masse emportée par heure. Carburant supplémentaire brûlé ?', f'{fr(5000*burn*3)} kg', ['175 kg', '1 050 kg', '35 kg'],
            f'5 000 × 0,035 × 3 = {fr(5000*burn*3)} kg (approximation linéaire).'))
p1, p2 = 0.80, 1.05
Q.append(ex(f'Même cas : carburant {fr(p1,2)} €/kg au départ, {fr(p2,2)} €/kg à l\'arrivée. Gain de l\'emport ?', f'{fr(5000*p2-(5000+5000*burn*3)*p1)} €', ['1 250 €', '−420 €', '4 000 €'],
            f'On achète {fr(5000+525)} kg à {fr(p1,2)} € = {fr((5000+525)*p1)} € au lieu de 5 000 kg à {fr(p2,2)} € = {fr(5000*p2)} € : gain {fr(5000*p2-(5000+525)*p1)} € (sans compter l\'usure et le CO₂ supplémentaire).'))
Q.append(ex('Délai minimal recommandé (Doc 4444) pour déposer un plan de vol IFR avant le départ :', '60 min', ['10 min', '30 min', '24 h'], 'Au moins 60 minutes avant l\'heure estimée de départ du poste de stationnement.'))
Q.append(ex('Masse à l\'atterrissage prévue au dégagement 58 t. Pour calculer la réserve finale, on prend le débit d\'attente :', 'à 58 t environ (masse prévue à l\'arrivée au dégagement)', ['à la masse maximale au décollage', 'à la masse à vide', 'au débit de croisière'],
            'Le débit d\'attente dépend de la masse : on le lit à la masse prévue à l\'arrivée au dégagement.'))
Q.append(ex('Carburant au bloc 19 000 kg ; roulage 300 kg ; étape 14 200 kg. Carburant restant prévu à l\'atterrissage ?', f'{fr(19000-300-14200)} kg', ['4 800 kg', '18 700 kg', '5 100 kg'],
            f'19 000 − 300 − 14 200 = {fr(19000-300-14200)} kg.'))
Q.append(ex('En croisière, l\'écart entre carburant prévu et réel au point de report atteint −900 kg (plus consommé que prévu). Bonne pratique :', 'recalculer le carburant à l\'arrivée et réévaluer le plan (niveau, vitesse, dégagement)',
            ['l\'ignorer', 'accélérer pour arriver plus tôt', 'remonter au niveau maximal sans calcul'],
            'Le suivi carburant (en route) permet de détecter une fuite ou une erreur de prévision avant qu\'elle ne touche la réserve finale.'))
Q.append(ex('Pourquoi monte-t-on par paliers au cours d\'un long vol ?', 'l\'altitude optimale augmente quand la masse diminue', ['pour éviter le givrage', 'parce que la tropopause monte', 'pour réduire la vitesse'],
            'À C_L optimal, W/σ est constant : moins de masse → densité plus faible → plus haut.'))
dist, gs = 5100, 470
Q.append(ex(f'Paris-CDG → La Réunion ≈ {fr(dist)} NM, vitesse sol moyenne {fr(gs)} kt. Temps de vol estimé ?', f'{int(dist/gs)} h {fr(dist/gs%1*60):0>2}', ['10 h 85', '11 h 30', '9 h 50'],
            f'{fr(dist)} / {fr(gs)} = {fr(dist/gs,2)} h = {int(dist/gs)} h {fr(dist/gs%1*60):0>2} min [CALCULÉ, distance approchée]. Piège : 10,85 h ne s\'écrit pas 10 h 85.'))
Q.append(ex('Départ 22 h 40 heure de Paris (UTC+1) ; durée de vol 10 h 51. Heure d\'arrivée à La Réunion (UTC+4) ?', '12 h 31 le lendemain', ['09 h 31 le lendemain', '10 h 31 le lendemain', '13 h 31 le lendemain'],
            '22 h 40 Paris = 21 h 40 UTC ; + 10 h 51 = 08 h 31 UTC le lendemain ; + 4 h = 12 h 31 à La Réunion.'))
Q.append(ex('Le commandant ajoute 1 200 kg de carburant parce que des orages sont prévus à l\'arrivée. Ce carburant est :', 'du carburant supplémentaire (discrétionnaire)', ['de la réserve de route', 'de la réserve finale', 'du carburant de roulage'],
            'Extra ou discretionary fuel : à la décision du commandant de bord, au-delà du minimum réglementaire.'))
assert len(Q) == 20, len(Q)

MOD = {'id': 'q2-planification', 't': 'Préparation du vol : carburant, dégagements, plan de vol, coûts', 'h': H, 'quiz': Q}
