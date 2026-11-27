/**
 * Formules précisées dans tous les tests (FORMULES, demande de l'auteur du 27/11/2026 23:07 : « Dans tous les tests
 * précise les formules »).
 *
 * Chaque règle reconnaît un type de calcul dans l'énoncé (et au besoin dans la correction) et donne la formule
 * générale, écrite en clair, affichée en tête de la correction : « 📐 Formule : … », puis l'application chiffrée
 * d'origine (inchangée). Appliqué partout où une question à réponse corrigée existe : test de positionnement,
 * test post-parcours, QCM du simulateur, QCM d'aide, Académie (dans le simulateur et sur le site), impression des cours.
 *
 * Règle : [motif sur l'énoncé, motif facultatif sur la correction, formule]. Plusieurs formules peuvent s'ajouter
 * (3 au plus) ; une question sans calcul ne reçoit rien.
 */
export type Rule = [string, string | null, string];

export const RULES: Rule[] = [
  // ---- vent ----
  ['composantes|\\(face ?; ?travers\\)|face et travers|composante longitudinale|vent dans l\'axe', null, 'Vent de face = V<sub>vent</sub> × cos α ; vent traversier = V<sub>vent</sub> × sin α (α : angle entre le vent et l\'axe de piste ou la route)'],
  ['traversi|\\btravers ?(\\?|en rafale)|vent de travers|de travers ?\\?|travers pur(?!.*vitesse sol)', null, 'Vent traversier = V<sub>vent</sub> × sin α (α : angle entre le vent et l\'axe de piste)'],
  ['composante de face|vent de face ?(\\(|\\?)|vent de face \\(arrondi', 'cos', 'Vent de face = V<sub>vent</sub> × cos α (α : angle entre le vent et l\'axe de piste)'],
  ['dérive', '60|sin', 'Dérive : sin X = V<sub>travers</sub> / V<sub>v</sub> ; approchée (1 sur 60) : X ≈ 60 × V<sub>travers</sub> / V<sub>v</sub> (degrés)'],
  ['vitesse sol', 'cos|vent de face|composante|\\d − \\d|correction', 'Vitesse sol = V<sub>v</sub> × cos X − vent de face (X : correction de dérive)'],
  // ---- navigation ----
  ['1 (sur|dans) 60|écart latéral|écart de \\d+(,\\d+)? NM|erreur de route|erreur angulaire', null, 'Règle du 1 sur 60 : écart (NM) = angle (°) × distance (NM) / 60 ; angle (°) = écart × 60 / distance'],
  ['rejoindre (la destination|directement)|revenir sur la route', null, 'Correction totale = erreur de route (écart × 60 / distance parcourue) + convergence (écart × 60 / distance restante)'],
  ['^(?!.*(\\bvent\\b|traînée)).*(?:temps pour|temps total|nm à \\d+ kt|temps ?\\?|distance ?\\?|temps de vol|combien de temps|durée|heure d\'arrivée|parcourir|en 1 minute|NM par minute|vitesse sol (est|\\?)|vitesse \\?|vitesse moyenne)', '[\\/×]|=', 'Temps = distance / vitesse ; distance = vitesse × temps ; vitesse = distance / temps (temps en heures décimales, × 60 pour les minutes)'],
  ['route magnétique|cap compas|cap magnétique|route vraie|déclinaison|déviation', '[−+-]', 'Rm = Rv − déclinaison (Est comptée +, Ouest −) ; Cm = Cv − déclinaison ; Cc = Cm − déviation du compas'],
  ['inverse|réciproque|radial (?!.*VOR varie)', '180', 'Direction réciproque = direction ± 180° (on reste entre 000° et 359°)'],
  ['orthodromi|convergence des méridiens', null, 'Convergence : variation de route = Δλ × sin(latitude moyenne)'],
  ['rejoindre la station|relèvement VOR varie', null, 'Temps jusqu\'à la station = minutes écoulées × 60 / variation du relèvement (°)'],
  ['point équitemps|\\bpet\\b', null, 'Point équitemps : d = D × V<sub>retour</sub> / (V<sub>aller</sub> + V<sub>retour</sub>) (vitesses sol)'],
  ['distance directe|vecteurs perpendiculaires|pythagore', null, 'Pythagore : c = √(a² + b²)'],
  // ---- montée, descente, plan ----
  ['plan (de descente )?de 3|plan de 3°|plan de descente|ils 3|plan à 3', 'tan|300|× 5|5,3|318|ft\\/min', 'Plan de 3° : hauteur (ft) ≈ distance (NM) × 300 (exact : d × 6 076 × tan 3°) ; Vz (ft/min) ≈ vitesse sol (kt) × 5 (exact : Vs × 101,3 × tan 3° ≈ Vs × 5,3)'],
  ['pente faisable|descente fl|distance nécessaire|descendre de|perdre \\d|descente de \\d|distance de descente', null, 'Temps de descente = dénivelé / Vz ; distance = vitesse sol × temps (vitesse sol en NM/min = Vs / 60)'],
  ['^(?!.*(poussée|segment|certif|pente de piste|pente brute)).*pente', '%|tan|101', 'Pente (%) = dénivelé / distance horizontale × 100 ; Vz (ft/min) ≈ pente (%) × vitesse sol (kt) × 1,013 (1 kt ≈ 101,3 ft/min)'],
  ['taux de montée nécessaire|vitesse verticale \\(1 kt', null, 'Vz (ft/min) = pente (%) × vitesse sol (kt) × 1,013'],
  ['moteur en panne : pente|un moteur en panne : pente|poussée.*traînée.*pente', null, 'Pente de montée : sin γ ≈ (poussée − traînée) / poids'],
  // ---- virage ----
  ['facteur de charge|^n à \\d', 'cos|1 \\/', 'Facteur de charge en virage en palier : n = 1 / cos φ (φ : inclinaison)'],
  ['décroch.*(virage|inclinaison)|vs \\d+ kt en palier|décrochage sous', null, 'Vitesse de décrochage en virage : V<sub>s virage</sub> = V<sub>s</sub> × √n, avec n = 1 / cos φ'],
  ['vitesse de manœuvre', null, 'Vitesse de manœuvre : V<sub>A</sub> = V<sub>s</sub> × √n<sub>limite</sub>'],
  ['décroch.*(\\d+(,\\d+)? ?t\\b|t\\. À|brûlé|masse)|v_a|v_md|vmd', '√', 'Vitesses caractéristiques (décrochage, V<sub>A</sub>, V<sub>MD</sub>) et masse : V<sub>s2</sub> = V<sub>s1</sub> × √(m<sub>2</sub> / m<sub>1</sub>)'],
  ['taux 1|taux standard|3 ?°/s', null, 'Inclinaison au taux 1 : φ ≈ V<sub>v</sub>/10 + 7 (kt) ; exacte : tan φ = V × ω / g (ω = 3°/s = 0,0524 rad/s)'],
  ['rayon (de|d\'un) virage|rayon ?\\?|virage stabilisé.*rayon', null, 'Rayon de virage : R = V² / (g × tan φ) (V en m/s, g = 9,81 m/s²)'],
  ['taux de virage', null, 'Taux de virage : ω = g × tan φ / V (rad/s ; × 57,3 pour des °/s)'],
  // ---- atmosphère, altimétrie ----
  ['température (standard|isa)|isa\\)? à|tropopause|écart à l\'isa', '[−-]|15', 'Atmosphère type : T<sub>ISA</sub> = 15 °C − 2 °C × (altitude en milliers de ft), constante à −56,5 °C de 36 089 ft à 20 km ; écart ISA = T mesurée − T<sub>ISA</sub>'],
  ['altitude-pression', null, 'Altitude-pression : Zp = altitude du terrain + (1 013 − QNH) × 27 à 28 ft/hPa'],
  ['altitude-densité|altitude densité', null, 'Altitude-densité : Zd ≈ Zp + 120 ft × (T − T<sub>ISA</sub>)'],
  ['hauteur vraie|isa ?−\\d+\\)|isa ?−\\d+ ?°c.*altimètre|air froid|franchissement', '4 %|air froid|plus bas',  'Correction de température : erreur ≈ 4 % de la hauteur par 10 °C d\'écart ISA (air froid : on est plus bas qu\'indiqué)'],
  ['base (approchée )?des (cumulus|nuages)|point de rosée', '400|×', 'Base des cumulus ≈ (T − T<sub>rosée</sub>) × 400 ft'],
  ['masse volumique|densité relative|rapport de densité|ρ inversement|contient une masse', 'ρ|P ?\\/|287|∝',  'Gaz parfait : ρ = P / (R × T) (R = 287 J/kg/K, T en K) ; densité relative σ = ρ / ρ<sub>0</sub>'],
  // ---- vitesses ----
  ['vitesse vraie approchée|tas approchée|vitesse vraie.*indiqu|\\+ ?2 % par', null, 'Vitesse vraie approchée : V<sub>v</sub> ≈ V<sub>i</sub> × (1 + 2 % × altitude en milliers de ft)'],
  ['vitesse équivalente|eas|incompressible', '√σ|√', 'V<sub>v</sub> = V<sub>E</sub> / √σ ; V<sub>E</sub> = V<sub>v</sub> × √σ (σ = ρ / 1,225)'],
  ['mach|vitesse du son|\\btas\\b', 'M ×|× 5\\d\\d|√|\\/ ?5\\d\\d|mach|0,\\d+ ×',  'Nombre de Mach : M = V<sub>v</sub> / a ; vitesse du son a (kt) = 38,94 × √T (T en K)'],
  ['flèche', 'cos', 'Aile en flèche : Mach normal = M × cos Λ (Λ : angle de flèche)'],
  ['aquaplanage', null, 'Vitesse d\'aquaplanage dynamique (kt) ≈ 9 × √p (pression des pneus en psi)'],
  // ---- carburant ----
  ['carburant (minimum|au bloc)|bloc minimum|délestage.*réserve|réserve finale.*(supplément|aléas|étape)|carburant pour \\d', null, 'Carburant minimum = roulage + étape (délestage) + réserve de route (aléas, % de l\'étape) + dégagement + réserve finale (débit × durée)'],
  ['consomm|carburant restant|carburant supplémentaire|débit(?! d\'air)|carburant d\'étape|réserve finale|autonomie', '[×\\/]', 'Carburant = débit horaire × temps (heures décimales) ; autonomie = carburant / débit'],
  ['par tonne|distance spécifique|distance franchissable', null, 'Distance spécifique (NM/kg) = vitesse sol / débit carburant'],
  ['kg\\/L|densité de l\'avgas|masse volumique \\d|densité 0|litres à ajouter|volume à avitailler|pèsent', null, 'Masse = volume × masse volumique ; volume = masse / masse volumique (Jet A-1 ≈ 0,80 kg/L, AVGAS ≈ 0,72 kg/L)'],
  // ---- masse et centrage ----
  ['% de cma|% cma', null, 'Centrage en % de CMA = (X<sub>CG</sub> − X<sub>bord d\'attaque CMA</sub>) / CMA × 100'],
  ['déplaçant du fret|on déplace|passent de la rangée|reculer le centre|avancer le centre|quelle masse placer', null, 'Déplacement de masse : Δm × d = M × ΔX<sub>CG</sub> ; centrage = Σ moments / Σ masses'],
  ['centre de gravité|centrage|\\bcg\\b|bras|moment total|moments', '[×\\/+]', 'Centrage : X<sub>CG</sub> = Σ (masse × bras) / Σ masses (moment = masse × bras de levier)'],
  ['moment d\'une force', null, 'Moment = force × distance à l\'axe (N·m)'],
  // ---- mécanique du vol ----
  ['coefficient de portance|c_l|portance d\'une aile|portance à ρ|double.*portance|portance l ?=|portance.*(double|vitesse|densité)|à vitesse doublée, la portance', null, 'Portance : L = ½ ρ V² S C<sub>L</sub> (proportionnelle à ρ et au carré de la vitesse)'],
  ['traînée induite', null, 'Traînée induite ∝ 1 / V² (à masse constante, en palier)'],
  ['la traînée (\\(à incidence|doit)', null, 'Traînée : D = ½ ρ V² S C<sub>D</sub> (proportionnelle au carré de la vitesse)'],
  ['pression dynamique', null, 'Pression dynamique : q = ½ ρ V²'],
  ['plané|finesse \\d', null, 'Distance de plané = hauteur × finesse (1 NM = 6 076 ft)'],
  ['énergie cinétique|énergie de freinage|énergie à dissiper|freins doivent absorber', null, 'Énergie cinétique : E<sub>c</sub> = ½ m v² (doubler v multiplie E<sub>c</sub> par 4)'],
  ['énergie potentielle|énergie dissipée', null, 'Énergie potentielle : E<sub>p</sub> = m × g × h'],
  ['puissance', 'P ?=|×', 'Puissance = force × vitesse : P = D × V (W)'],
  ['poids d\'un avion|le poids', '9,81', 'Poids : P = m × g (g = 9,81 m/s²)'],
  ['accélération', 'Δ|\\/', 'Accélération moyenne : a = Δv / Δt'],
  ['distance (parcourue|d\'arrêt|pour atteindre)|décélération', null, 'Mouvement uniformément accéléré : d = ½ a t² ; d = v² / (2a) depuis (ou jusqu\'à) l\'arrêt'],
  ['poussée nette|newton|f ?= ?m', 'a ?=', 'Deuxième loi de Newton : a = F / m'],
  ['distance de décollage varie', null, 'Distance de décollage ∝ V² / a (V : vitesse sol au décollage)'],
  // ---- calcul général ----
  ['interpol', null, 'Interpolation linéaire : y = y<sub>1</sub> + (x − x<sub>1</sub>) × (y<sub>2</sub> − y<sub>1</sub>) / (x<sub>2</sub> − x<sub>1</sub>)'],
  ['puis elle (baisse|monte)|température.*baisse de', null, 'Nombres relatifs : on ajoute une hausse, on retranche une baisse ; sous 0, le résultat est négatif'],
  ['trois quarts|aux deux tiers|la moitié de', null, 'Fraction : A × p / q (ex. trois quarts : A × 3 / 4)'],
  ['%', 'successi|×\\s*1,|\\d \\/ 100|× \\d+ \\/ 100', 'Pourcentage : p % de A = A × p / 100 ; hausses successives : A × (1 + p<sub>1</sub>) × (1 + p<sub>2</sub>)'],
  ['heures décimales|en heures et minutes|minutes au total|h \\d+ min.*heures', null, 'Minutes = heures décimales × 60 ; heures décimales = minutes / 60'],
  ['combien en|règle de trois|proportionnel', '×|\\/', 'Proportionnalité (règle de trois) : x = b × c / a'],
  ['y ?= ?k', null, 'y = k·x² : k = y / x², puis x = √(y / k)'],
  ['racine carrée', null, '√a = b ⇔ b × b = a'],
  ['^sin |^cos |vaut :.*(sin|cos)', null, 'sin α = côté opposé / hypoténuse ; cos α = côté adjacent / hypoténuse'],
  ['notation scientifique|en hertz', null, 'Notation scientifique : a × 10ⁿ avec 1 ≤ a < 10 (kilo = 10³, méga = 10⁶)'],
  ['cap \\d+°.*tourn|on tourne', null, 'Nouveau cap = cap + virage (− 360 si le résultat dépasse 359°)'],
  ['résoudre', null, 'On regroupe les x d\'un côté et les nombres de l\'autre, en changeant le signe de ce qui change de côté'],
  // ---- compléments (navigation, temps, radio, électricité, performances, masse, physiologie) ----
  ['hpa|qnh|calage', 'ft\\/hpa|× 2[78]\\b|2[78] ft|\\/ ?2[78]\\b', 'Altimétrie près du sol : écart d\'altitude ≈ Δp (hPa) × 27 à 28 ft/hPa (« des hautes vers les basses pressions, danger »)'],
  ['qfe', null, 'QFE ≈ QNH − altitude du terrain (ft) / 27 (hPa)'],
  ['plus bas niveau', null, 'Altitude d\'un niveau de vol ≈ FL × 100 − (1 013 − QNH) × 27 ft'],
  ['fl ?\\d+ correspond', null, 'Niveau de vol = altitude-pression en centaines de pieds (calage 1 013,25 hPa) ; × 0,3048 pour les mètres'],
  ['latitude|méridien', '60|NM', 'Sur un méridien : 1′ de latitude = 1 NM ; 1° = 60 NM (≈ 111 km)'],
  ['longitude|parallèle', 'cos|60', 'Sur un parallèle : distance (NM) = Δλ (′) × cos(latitude) ; à l\'équateur 1° = 60 NM'],
  ['utc|décalage horaire|heure légale|heure locale|heure d\'arrivée.*h', 'utc|z\\b|[−+] ?\\d+ h', 'Heure UTC = heure locale − décalage (UTC+n) ; heure locale = UTC + décalage'],
  ['heure solaire|midi solaire|tourne de combien|minutes de temps|vitesse angulaire', null, 'La Terre tourne de 15° par heure : 1° de longitude = 4 min de temps'],
  ['degrés décimaux', null, 'Degrés décimaux = degrés + minutes / 60'],
  ['facteur de base', null, 'Facteur de base : Fb = 60 / Vp (minutes par NM)'],
  ['dérive maximale', 'fb|0,6', 'Dérive maximale : X<sub>max</sub> = V<sub>travers</sub> × Fb (Fb = 60 / Vp)'],
  ['loi d\'ohm|\\bcourant\\b|résistances?', null, 'Loi d\'Ohm : U = R × I ; puissance P = U × I ; en parallèle 1/R = Σ 1/R<sub>i</sub> ; en série R = Σ R<sub>i</sub>'],
  ['batterie.*temps|combien de temps peut', null, 'Autonomie d\'une batterie (h) = capacité (Ah) / courant (A)'],
  ['batterie', 'wh|×', 'Énergie d\'une batterie (Wh) = tension (V) × capacité (Ah)'],
  ['longueur d\'onde', null, 'Longueur d\'onde : λ = c / f (c = 3 × 10⁸ m/s)'],
  ['portée vhf|contacter une station', null, 'Portée VHF (NM) ≈ 1,23 × (√h<sub>1</sub> + √h<sub>2</sub>) (hauteurs en ft)'],
  ['écho radar', null, 'Distance radar = c × t / 2 (aller-retour)'],
  ['dme', null, 'Le DME mesure la distance oblique : d<sub>horizontale</sub> = √(DME² − h²) (h en NM = ft / 6 076)'],
  ['ressource', null, 'Facteur de charge en ressource : n = 1 + V² / (g × R)'],
  ['centripète', null, 'Force centripète : F = m v² / R'],
  ['chute libre', null, 'Chute libre : v = √(2 g h)'],
  ['exerce une pression|vérin', null, 'Pression = force / surface : p = F / S ; surface d\'un piston S = π d² / 4'],
  ['bernoulli|anémomètre', null, 'Bernoulli : p + ½ ρ V² = constante ; vitesse indiquée V = √(2q / ρ<sub>0</sub>)'],
  ['vitesse en altitude', null, 'Échange d\'énergie : ½ (v<sub>1</sub>² − v<sub>2</sub>²) = g × Δh (la masse s\'élimine)'],
  ['composante du poids', null, 'Composante du poids sur la trajectoire = P × sin γ'],
  ['pente (de montée maximale|de montée|\\?)|pente.*moteur', 'sin', 'Pente de montée : sin γ = (poussée − traînée) / poids'],
  ['marge|c_lmax|buffeting|1,2 v_s', null, 'Facteur de charge disponible : n<sub>max</sub> = (V / V<sub>s</sub>)² ; inclinaison correspondante : cos φ = 1 / n'],
  ['charge (de manœuvre )?limite positi', null, 'CS 25.337 : n = 2,1 + 24 000 / (W + 10 000) (W en lb), borné entre 2,5 et 3,8'],
  ['charge extrême', null, 'Charge extrême = charge limite × 1,5 (facteur de sécurité, CS 25.303)'],
  ['rafale verticale', null, 'Rafale : Δn = ρ V a U S / (2 W)'],
  ['rafale montante', null, 'Facteur de charge en rafale : n = 1 ± Δn'],
  ['rendement propulsif', null, 'Rendement propulsif : η<sub>p</sub> = 2 / (1 + V<sub>j</sub> / V<sub>0</sub>)'],
  ['poussée ?\\?|même poussée', 'v0|vj|\\(|ṁ', 'Poussée nette : F = débit d\'air × (V<sub>j</sub> − V<sub>0</sub>)'],
  ['bout de pale', null, 'Hélice : V<sub>rotation</sub> = π n D ; vitesse résultante = √(V² + V<sub>rotation</sub>²)'],
  ['avance par tour', null, 'Avance par tour : J = V / (n D) (n en tr/s)'],
  ['adiabati|particule d\'air|föhn|gradient réel', null, 'Gradient adiabatique sec ≈ 9,8 °C/km (3 °C/1 000 ft) ; saturé ≈ 6 °C/km'],
  ['géostrophique', null, 'Vent géostrophique : V<sub>g</sub> = ΔP / (ρ × f × Δn), avec f = 2Ω sin φ'],
  ['micro-rafale.*kt', null, 'Cisaillement : perte de vitesse air = variation totale du vent (de face → arrière : V<sub>face</sub> + V<sub>arrière</sub>)'],
  ['pnr|point de non-retour', null, 'Point de non-retour : T = E × V<sub>retour</sub> / (V<sub>aller</sub> + V<sub>retour</sub>) ; distance = T × V<sub>aller</sub>'],
  ['règle des 3|vent arrière moyen|ft à perdre|début de descente à', null, 'Début de descente ≈ 3 × milliers de ft à perdre (NM), + 2 NM par 10 kt de vent arrière'],
  ['pression partielle', null, 'Pression partielle de l\'oxygène = 20,95 % × pression totale'],
  ['volume d\'un gaz', null, 'Boyle-Mariotte : P<sub>1</sub> × V<sub>1</sub> = P<sub>2</sub> × V<sub>2</sub>'],
  ['alcoolémie', null, 'Durée = (taux initial − taux visé) / vitesse d\'élimination'],
  ['facteur 1,43', null, 'Distance d\'atterrissage disponible ≥ distance du manuel × 1,43'],
  ['distance (d\'atterrissage|disponible)|lda|piste mouillée', '0,6|1,15', 'Avion à réaction : distance disponible ≥ distance certifiée / 0,6 ; piste mouillée : + 15 %'],
  ['distance tous moteurs', null, 'Distance de décollage = max(distance avec panne ; 1,15 × distance tous moteurs)'],
  ['v2 minimale', null, 'V2 ≥ max(1,13 V<sub>SR</sub> ; 1,10 V<sub>MCA</sub>)'],
  ['vent à utiliser|vent annoncé', null, 'Performances : vent arrière compté à 150 %, vent de face à 50 %'],
  ['^(?!.*formule du simulateur)(?:.*)(?:zfw|\\btow\\b|\\blw\\b|masse au décollage|charge offerte|sous-charge|underload)', null, 'ZFW = DOM + charge marchande ; TOW = ZFW + carburant au décollage (bloc − roulage) ; TOW max = min(MTOW ; MLW + délestage ; MZFW + carburant au décollage)'],
  ['indice de coût', null, 'Indice de coût : CI = coût du temps / prix du carburant'],
  ['indices? (partiel|:)|indice 4', null, 'Indice = m × (x − x<sub>réf</sub>) / C + K (K une seule fois) ; les indices s\'additionnent'],
  ['emport|pénalité', null, 'Surconsommation d\'emport ≈ masse emportée × pénalité (% par heure) × durée'],
  ['pression différentielle', null, 'Pression différentielle : Δp = P<sub>cabine</sub> − P<sub>extérieure</sub> (1 psi = 68,95 hPa)'],
  ['débitmètres|jauges', null, 'Carburant attendu = carburant au départ − carburant consommé ; écart = attendu − jaugé'],
  ['temps de protection', null, 'Fin de protection = début de la dernière application + temps de protection'],
  ['distance sol pour', null, 'Distance sol par masse de carburant = (V<sub>v</sub> − vent de face) / débit × masse'],
  ['portée ?\\?', '1,23', 'Portée VHF (NM) ≈ 1,23 × (√h<sub>1</sub> + √h<sub>2</sub>) (hauteurs en ft)'],
  ['densité relative σ.*puissance|ne fournit-il plus', null, 'Puissance d\'un moteur atmosphérique : P / P<sub>0</sub> ≈ 1,132 σ − 0,132 (Gagg et Farrar)'],
  ['\\bcas ?\\?', null, 'Pression d\'impact : q<sub>c</sub> = P × [(1 + 0,2 M²)<sup>3,5</sup> − 1], puis CAS = vitesse qui donne ce q<sub>c</sub> au niveau de la mer'],
  ['réserve de route|carburant de route', null, 'Réserve de route = 5 % de l\'étape (délestage)'],
  ['carburant (prévu )?à l\'atterrissage', null, 'Carburant à l\'atterrissage = bloc − roulage − étape'],
  ['herbe', null, 'Distance corrigée = distance du manuel × coefficient de surface (herbe mouillée ≈ 1,3), puis marge réglementaire'],
  ['masse \\+ ?\\d+ ?%|à \\d+ t \\(même piste', null, 'Distance de décollage ≈ ∝ masse² (à conditions égales)'],
  ['cap à tenir', null, 'Correction de dérive : sin X = V<sub>vent</sub> × sin(angle vent/route) / V<sub>v</sub> ; cap = route ± X (vers le vent)'],
  ['arrivée utc', null, 'Heure d\'arrivée = heure de départ + temps de vol (au-delà de 24:00, on retire 24 h : lendemain)'],
  ['kt de vent de face', '²', 'Distance de décollage ∝ (vitesse sol)² : d<sub>vent</sub> = d × (1 − V<sub>vent</sub> / V<sub>décollage</sub>)²'],
  ['finesse maximale', null, 'Finesse maximale : f<sub>max</sub> = 1 / (2 √(C<sub>D0</sub> × k)), atteinte quand traînée induite = traînée de forme (k = 1 / (π A e))'],
  ['vr \\(formule du simulateur', null, 'VR (simulateur) = 118 kt + 6 kt par tonne au-dessus de 8 t [SIMULÉ]'],
  // ---- conversions ----
  ['en mètres|en pieds|ft en|m en pieds|piste de \\d.*ft', null, 'Conversion : 1 ft = 0,3048 m ; m → ft : ÷ 0,3048'],
  ['km\\/h|kilomètres|nm (valent|vaut)|en m\\/s|m\\/s vaut|vent de \\d+ m\\/s|NM en', null, 'Conversion : 1 kt = 1 NM/h = 1,852 km/h = 0,5144 m/s ; 1 NM = 1 852 m ; 1 m/s = 3,6 km/h'],
  ['°f|fahrenheit', null, 'Conversion : °F = °C × 9/5 + 32 ; °C = (°F − 32) × 5/9'],
  ['kelvin', null, 'Conversion : T (K) = T (°C) + 273,15'],
  ['lb|livres', '0,45|2,205', 'Conversion : 1 lb = 0,4536 kg ; 1 kg = 2,205 lb'],
  ['gallons?|gal us', null, 'Conversion : 1 gallon US = 3,785 L'],
  ['inhg|pouces de mercure', null, 'Conversion : 1 inHg = 33,864 hPa (29,92 inHg = 1 013,25 hPa)'],
  ['ft\\/min', 'm\\/s|0,3048', 'Conversion : m/s → ft/min : × 60 ÷ 0,3048 (≈ × 197)'],
  ['milles terrestres|\\bSM\\b', null, 'Conversion : 1 mille terrestre (SM) = 1 609 m ; 1 NM = 1 852 m'],
];

const COMPILED = RULES.map(([q, e, f]) => [new RegExp(q, 'i'), e ? new RegExp(e, 'i') : null, f] as const);
/** Signe d'un calcul dans la correction (chiffres et opérations) ou dans l'énoncé. */
const CALC = /\d\s*[×÷/*+−-]\s*\(?\d|√|\b(sin|cos|tan)\b|=\s*\d|\d\s*%|≈\s*\d/i;

export function formulesFor(q: string, why: string): string[] {
  if (!CALC.test(why || '') && !CALC.test(q)) return [];
  const out: string[] = [];
  for (const [rq, re, f] of COMPILED) {
    if (out.length >= 3) break;
    if (rq.test(q) && (!re || re.test(why || '')) && !out.includes(f)) out.push(f);
  }
  return out;
}
export const MARK = '📐';
/** Correction avec la formule en tête (HTML) ; inchangée si aucune formule ou déjà ajoutée. */
export function withFormules(q: string, why: string): string {
  if (!why || why.includes(MARK)) return why;
  const f = formulesFor(q, why);
  return f.length ? `<span class="fx">${MARK} <b>Formule${f.length > 1 ? 's' : ''}</b> : ${f.join(' · ')}</span>${why}` : why;
}
/** Même logique, en texte, pour l'injecter dans le moteur (iframe). */
export const FORMULES_JS = `(function(){ var R=${JSON.stringify(RULES)}.map(function(r){ return [new RegExp(r[0],'i'), r[1]?new RegExp(r[1],'i'):null, r[2]]; });
 var C=${CALC.toString()};
 function F(q,w){ if(!C.test(w||'')&&!C.test(q)) return []; var o=[]; for(var i=0;i<R.length&&o.length<3;i++){ var r=R[i]; if(r[0].test(q)&&(!r[1]||r[1].test(w||''))&&o.indexOf(r[2])<0) o.push(r[2]); } return o; }
 function W(q,w){ if(!w||w.indexOf('${MARK}')>=0) return w; var f=F(q,w); return f.length?'<span class="fx">${MARK} <b>Formule'+(f.length>1?'s':'')+'</b> : '+f.join(' · ')+'</span>'+w:w; }
 return {F:F,W:W}; })()`;
