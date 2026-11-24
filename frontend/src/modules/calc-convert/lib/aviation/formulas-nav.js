/**
 * Formules aviation — partie 2 : navigation et vent, montée et descente, virages.
 * Même structure que formulas-base.js.
 */
import { FT_MIN_PER_KT, G, KT_MS, NM_FT, deg, fr, hdg, hmin, rad, rel, sg } from './helpers.js';

const side = (x) => (x >= 0 ? 'droite' : 'gauche');

export const NAV_FORMULAS = [
  // ===================== NAVIGATION ET VENT =====================
  {
    id: 'wind-comp',
    group: 'nav',
    aircraft: 'both',
    title: 'Composantes du vent (piste ou route)',
    formula: 'Vent de face = Vw × cos α\nVent traversier = Vw × sin α',
    vars: [['Vw', 'vitesse du vent (kt)'], ['α', 'angle entre la direction d’où vient le vent et l’axe (piste ou route)']],
    inputs: [
      { k: 'wd', label: 'Direction du vent (d’où il vient)', unit: '°', def: 250 },
      { k: 'ws', label: 'Vitesse du vent', unit: 'kt', def: 18 },
      { k: 'axe', label: 'Axe de piste ou route', unit: '°', def: 210 },
    ],
    calc: (v) => {
      const a = rel(v.wd - v.axe);
      const head = v.ws * Math.cos(rad(a));
      const cross = v.ws * Math.sin(rad(a));
      return [
        { label: head >= 0 ? 'Vent de face' : 'Vent arrière', value: Math.abs(head), unit: 'kt', d: 1 },
        { label: `Vent traversier (de ${side(cross)})`, value: Math.abs(cross), unit: 'kt', d: 1 },
        { label: 'Angle vent / axe', value: Math.abs(a), unit: '°', d: 0 },
      ];
    },
    mini: 'On décompose le vent en une partie dans l’axe (face ou arrière) et une partie de travers. Vent de face = Vw × cos α ; traversier = Vw × sin α. De tête : sin 30° = 0,5 ; sin 45° = 0,7 ; sin 60° = 0,9.',
    course: [
      'Le vent est donné par la direction d’où il vient et sa vitesse (ex. 250/18 = vent du 250° pour 18 kt). L’axe de piste se lit sur son numéro (piste 21 → 210° environ, au magnétique, comme le vent donné par la tour).',
      'α = direction du vent − axe. La composante de face (ou arrière si négative) vaut Vw × cos α, la composante traversière Vw × sin α.',
      'Valeurs mentales : à 30°, le traversier vaut la moitié du vent ; à 45°, 70 % ; à 60° et plus, presque tout le vent. La composante de face est l’inverse : 90 % à 30°, 70 % à 45°, 50 % à 60°.',
      'Usage : comparer le vent traversier à la composante maximale démontrée du manuel (souvent 15 à 20 kt pour un avion léger) ; vérifier qu’il n’y a pas de vent arrière au décollage ou à l’atterrissage.',
      'Pour un hélicoptère, la composante de vent influence la puissance nécessaire en stationnaire et la marge de contrôle du rotor anticouple : le manuel donne des secteurs de vent à éviter.',
      'Piège : ne pas mélanger vent vrai (bulletins météo écrits, METAR) et vent magnétique (tour, ATIS) avec un axe de piste magnétique. En France, l’écart est faible (déclinaison de 1 à 3°), mais pas partout.',
    ],
    ask: (v) => `Vent ${String(v.wd).padStart(3, '0')}/${fr(v.ws)} kt, axe ${hdg(v.axe)}. Calcule les composantes de face (ou arrière) et traversière.`,
    steps: (v) => {
      const a = rel(v.wd - v.axe);
      const head = v.ws * Math.cos(rad(a));
      const cross = v.ws * Math.sin(rad(a));
      return [
        `α = ${fr(v.wd)} − ${fr(v.axe)} = ${sg(a)}° (vent venant de la ${side(a)}).`,
        `Composante d’axe = ${fr(v.ws)} × cos ${fr(Math.abs(a))}° = ${fr(v.ws)} × ${fr(Math.cos(rad(a)), 2)} = ${fr(head, 1)} kt → ${head >= 0 ? 'vent de face' : 'vent arrière'} de ${fr(Math.abs(head), 1)} kt.`,
        `Traversier = ${fr(v.ws)} × sin ${fr(Math.abs(a))}° = ${fr(v.ws)} × ${fr(Math.abs(Math.sin(rad(a))), 2)} = ${fr(Math.abs(cross), 1)} kt, de ${side(cross)}.`,
      ];
    },
    ex: [
      { wd: 250, ws: 18, axe: 210 }, { wd: 300, ws: 12, axe: 270 }, { wd: 90, ws: 20, axe: 140 }, { wd: 180, ws: 15, axe: 180 },
      { wd: 10, ws: 25, axe: 330 }, { wd: 220, ws: 10, axe: 40 }, { wd: 160, ws: 22, axe: 100 }, { wd: 350, ws: 8, axe: 260 },
      { wd: 270, ws: 30, axe: 240 }, { wd: 45, ws: 16, axe: 120 },
    ],
  },
  {
    id: 'drift',
    group: 'nav',
    aircraft: 'both',
    title: 'Dérive et cap à prendre',
    formula: 'Xmax = 60 × Vw / Vp\nX = Xmax × sin α · Cap = Route + X',
    vars: [['Xmax', 'dérive maximale (°)'], ['Vw', 'vitesse du vent (kt)'], ['Vp', 'vitesse propre (kt)'], ['α', 'angle vent / route'], ['X', 'correction de dérive (°)']],
    inputs: [
      { k: 'route', label: 'Route vraie', unit: '°', def: 90 },
      { k: 'tas', label: 'Vitesse propre', unit: 'kt', def: 100 },
      { k: 'wd', label: 'Vent : direction', unit: '°', def: 180 },
      { k: 'ws', label: 'Vent : vitesse', unit: 'kt', def: 20 },
    ],
    calc: (v) => {
      const xmax = (60 * v.ws) / v.tas;
      const a = rel(v.wd - v.route);
      const x = xmax * Math.sin(rad(a));
      return [
        { label: 'Cap vrai à prendre', value: v.route + x, unit: '°', d: 0, text: hdg(v.route + x) },
        { label: `Correction de dérive (vers la ${side(x)})`, value: Math.abs(x), unit: '°', d: 0 },
        { label: 'Dérive maximale', value: xmax, unit: '°', d: 0 },
        { label: 'Vitesse sol estimée', value: v.tas - v.ws * Math.cos(rad(a)), unit: 'kt', d: 0 },
      ];
    },
    mini: 'Le vent de travers pousse l’aéronef hors de sa route : il faut orienter le nez vers le vent. La dérive maximale vaut 60 × vent ÷ vitesse propre (en degrés), puis on la multiplie par le sinus de l’angle du vent.',
    course: [
      'La route (Rv) est le trajet voulu au sol ; le cap (Cv) est la direction du nez. Avec du vent de travers, on vole avec un cap décalé de la route, du côté d’où vient le vent : c’est la correction de dérive.',
      'Dérive maximale (vent plein travers) : Xmax = 60 × Vw / Vp. Ex. 20 kt de vent à 100 kt → 12°. On peut l’écrire Xmax = Vw × Fb (avec Fb = 60/Vp).',
      'Pour un vent oblique : X = Xmax × sin α, α étant l’angle entre la direction du vent et la route. Mêmes valeurs mentales : 30° → ½ Xmax, 45° → 0,7 Xmax, 60° et plus → Xmax.',
      'Cap = Route + X si le vent vient de la droite, Route − X s’il vient de la gauche. Le calculateur gère le signe tout seul.',
      'La vitesse sol est réduite par la composante de vent de face : Vs ≈ Vp − Vw × cos α (approximation valable pour des dérives modérées).',
      'Ces règles sont celles du calcul mental du pilote VFR ; le triangle des vitesses exact (ou le computeur de navigation) donne des valeurs à 1 ou 2° près.',
    ],
    ask: (v) => `Route vraie ${hdg(v.route)}, vitesse propre ${fr(v.tas)} kt, vent ${String(v.wd).padStart(3, '0')}/${fr(v.ws)} kt. Calcule la dérive maximale, la correction, le cap vrai et la vitesse sol estimée.`,
    steps: (v) => {
      const xmax = (60 * v.ws) / v.tas;
      const a = rel(v.wd - v.route);
      const x = xmax * Math.sin(rad(a));
      return [
        `Xmax = 60 × ${fr(v.ws)} / ${fr(v.tas)} = ${fr(xmax, 1)}°.`,
        `Angle vent / route : α = ${fr(v.wd)} − ${fr(v.route)} = ${sg(a)}° (vent de la ${side(a)}).`,
        `X = ${fr(xmax, 1)} × sin ${fr(Math.abs(a))}° = ${fr(xmax, 1)} × ${fr(Math.abs(Math.sin(rad(a))), 2)} = ${fr(Math.abs(x), 1)}° vers la ${side(x)}.`,
        `Cap vrai = ${hdg(v.route)} ${x >= 0 ? '+' : '−'} ${fr(Math.abs(x))}° = ${hdg(v.route + x)}.`,
        `Vs ≈ ${fr(v.tas)} − ${fr(v.ws)} × cos ${fr(Math.abs(a))}° = ${fr(v.tas - v.ws * Math.cos(rad(a)))} kt.`,
      ];
    },
    ex: [
      { route: 90, tas: 100, wd: 180, ws: 20 }, { route: 45, tas: 120, wd: 270, ws: 30 }, { route: 180, tas: 90, wd: 220, ws: 15 },
      { route: 270, tas: 110, wd: 300, ws: 25 }, { route: 330, tas: 95, wd: 60, ws: 18 }, { route: 120, tas: 150, wd: 90, ws: 40 },
      { route: 200, tas: 80, wd: 250, ws: 12 }, { route: 10, tas: 105, wd: 320, ws: 22 }, { route: 135, tas: 125, wd: 135, ws: 20 },
      { route: 300, tas: 100, wd: 30, ws: 10 },
    ],
  },
  {
    id: 'mag-heading',
    group: 'nav',
    aircraft: 'both',
    title: 'Cap vrai, magnétique et compas',
    formula: 'Cm = Cv − Dm\nCc = Cm − d',
    vars: [['Cv', 'cap vrai'], ['Dm', 'déclinaison magnétique (+ Est, − Ouest)'], ['Cm', 'cap magnétique'], ['d', 'déviation du compas (+ Est, − Ouest)'], ['Cc', 'cap compas']],
    inputs: [
      { k: 'cv', label: 'Cap vrai', unit: '°', def: 95 },
      { k: 'dm', label: 'Déclinaison (+E / −W)', unit: '°', def: 2 },
      { k: 'dev', label: 'Déviation (+E / −W)', unit: '°', def: -1 },
    ],
    calc: (v) => [
      { label: 'Cap compas', value: v.cv - v.dm - v.dev, unit: '°', d: 0, text: hdg(v.cv - v.dm - v.dev) },
      { label: 'Cap magnétique', value: v.cv - v.dm, unit: '°', d: 0, text: hdg(v.cv - v.dm) },
    ],
    mini: 'La carte donne des directions par rapport au nord géographique (vrai), le compas les montre par rapport au nord magnétique, avec ses propres erreurs. Déclinaison Est : on la retranche ; Ouest : on l’ajoute.',
    course: [
      'Trois nords : le nord vrai (géographique, celui des méridiens de la carte), le nord magnétique (vers lequel pointe une boussole) et le nord compas (celui du compas de bord, perturbé par les masses métalliques et l’électricité de l’appareil).',
      'Déclinaison magnétique (Dm) : angle entre nord vrai et nord magnétique, indiqué sur les cartes. En France métropolitaine, elle est faible et orientée vers l’Est (de l’ordre de 0 à 3° E selon les régions, elle évolue d’année en année).',
      'Déviation (d) : erreur propre au compas de l’aéronef, lue sur la carte de déviation fixée près du compas, différente selon le cap.',
      'Formules avec la convention « Est positif » : Cm = Cv − Dm ; Cc = Cm − d. Moyen mnémotechnique : « Est on retranche, Ouest on ajoute » quand on passe du vrai au magnétique.',
      'Les pistes, le vent de la tour et les routes des cartes VAC sont magnétiques ; les routes tracées sur la carte au 1/500 000 sont vraies.',
    ],
    ask: (v) => `Cap vrai ${hdg(v.cv)}, déclinaison ${Math.abs(v.dm)}° ${v.dm >= 0 ? 'Est' : 'Ouest'}, déviation ${Math.abs(v.dev)}° ${v.dev >= 0 ? 'Est' : 'Ouest'}. Calcule le cap magnétique puis le cap compas.`,
    steps: (v) => [
      `Cm = Cv − Dm = ${fr(v.cv)} − (${sg(v.dm)}) = ${hdg(v.cv - v.dm)}.`,
      `Cc = Cm − d = ${fr(v.cv - v.dm)} − (${sg(v.dev)}) = ${hdg(v.cv - v.dm - v.dev)}.`,
    ],
    ex: [
      { cv: 95, dm: 2, dev: -1 }, { cv: 180, dm: 1, dev: 2 }, { cv: 270, dm: -5, dev: 0 }, { cv: 3, dm: 3, dev: 1 }, { cv: 45, dm: -12, dev: -2 },
      { cv: 320, dm: 2, dev: -3 }, { cv: 150, dm: 15, dev: 1 }, { cv: 358, dm: -4, dev: 2 }, { cv: 225, dm: 1, dev: -2 }, { cv: 110, dm: -8, dev: 3 },
    ],
  },
  {
    id: 'one-sixty',
    group: 'nav',
    aircraft: 'both',
    title: 'Règle du 1/60 (écart de route)',
    formula: 'Angle d’écart = 60 × e / Dp\nCorrection totale = 60 × e / Dp + 60 × e / Dr',
    vars: [['e', 'écart latéral constaté (NM)'], ['Dp', 'distance parcourue (NM)'], ['Dr', 'distance restante (NM)']],
    inputs: [
      { k: 'e', label: 'Écart latéral', unit: 'NM', def: 3 },
      { k: 'dp', label: 'Distance parcourue', unit: 'NM', def: 30 },
      { k: 'dr', label: 'Distance restante', unit: 'NM', def: 20 },
    ],
    calc: (v) => [
      { label: 'Correction de cap totale', value: (60 * v.e) / v.dp + (60 * v.e) / v.dr, unit: '°', d: 0 },
      { label: 'Erreur de route', value: (60 * v.e) / v.dp, unit: '°', d: 0 },
      { label: 'Angle pour rejoindre la destination', value: (60 * v.e) / v.dr, unit: '°', d: 0 },
    ],
    mini: 'À 60 NM, 1 NM d’écart correspond à 1°. Un écart e après une distance D vient donc d’une erreur de 60 × e / D degrés. Pour rejoindre la destination, on corrige de cet angle plus 60 × e / distance restante.',
    course: [
      'Pour les petits angles, l’angle en degrés vaut 60 × écart / distance (c’est l’approximation tan α ≈ α, avec 1 rad ≈ 57,3° arrondi à 60). D’où le nom de règle du 1/60 : 1° d’erreur donne 1 NM d’écart tous les 60 NM.',
      'Situation : après Dp NM, on se trouve à e NM à côté de la route prévue. L’erreur de cap commise vaut 60 × e / Dp.',
      'Pour revenir parallèle à la route, on corrige de cet angle. Pour rejoindre directement la destination, on ajoute l’angle 60 × e / Dr. La correction totale se fait du côté opposé à l’écart.',
      'Exemple : 3 NM à droite après 30 NM, restent 20 NM : 6° + 9° = 15° à gauche.',
      'La règle sert aussi à l’envers : une erreur de cap de 5° pendant 36 NM donne 3 NM d’écart. Et en descente : 1° de pente = 100 ft par NM environ.',
    ],
    ask: (v) => `Après ${fr(v.dp)} NM, on constate un écart de ${fr(v.e, 1)} NM à droite de la route. Il reste ${fr(v.dr)} NM. De combien corriger le cap pour rejoindre directement la destination ?`,
    steps: (v) => [
      `Erreur de route : 60 × ${fr(v.e, 1)} / ${fr(v.dp)} = ${fr((60 * v.e) / v.dp, 1)}°.`,
      `Angle pour rejoindre : 60 × ${fr(v.e, 1)} / ${fr(v.dr)} = ${fr((60 * v.e) / v.dr, 1)}°.`,
      `Correction totale = ${fr((60 * v.e) / v.dp, 1)} + ${fr((60 * v.e) / v.dr, 1)} = ${fr((60 * v.e) / v.dp + (60 * v.e) / v.dr)}° vers la gauche.`,
    ],
    ex: [
      { e: 3, dp: 30, dr: 20 }, { e: 2, dp: 40, dr: 40 }, { e: 4, dp: 24, dr: 36 }, { e: 1.5, dp: 15, dr: 45 }, { e: 5, dp: 50, dr: 25 },
      { e: 2.5, dp: 20, dr: 30 }, { e: 6, dp: 60, dr: 40 }, { e: 1, dp: 12, dr: 18 }, { e: 3.5, dp: 35, dr: 14 }, { e: 8, dp: 80, dr: 60 },
    ],
  },
  {
    id: 'pet-pnr',
    group: 'nav',
    aircraft: 'both',
    title: 'Point équitemps (PET) et point de non-retour (PNR)',
    formula: 'PET = D × Vs_r / (Vs_a + Vs_r)\nt_PNR = E × Vs_r / (Vs_a + Vs_r)',
    vars: [['D', 'distance totale (NM)'], ['Vs_a', 'vitesse sol aller (kt)'], ['Vs_r', 'vitesse sol retour (kt)'], ['E', 'autonomie utilisable, hors réserve (min)']],
    inputs: [
      { k: 'd', label: 'Distance totale', unit: 'NM', def: 180 },
      { k: 'gso', label: 'Vitesse sol aller', unit: 'kt', def: 100 },
      { k: 'gsr', label: 'Vitesse sol retour', unit: 'kt', def: 130 },
      { k: 'e', label: 'Autonomie utilisable', unit: 'min', def: 210 },
    ],
    calc: (v) => {
      const pet = (v.d * v.gsr) / (v.gso + v.gsr);
      const tpnr = (v.e * v.gsr) / (v.gso + v.gsr);
      return [
        { label: 'Point équitemps (depuis le départ)', value: pet, unit: 'NM', d: 1 },
        { label: 'Point de non-retour (depuis le départ)', value: (tpnr / 60) * v.gso, unit: 'NM', d: 1 },
        { label: 'Temps jusqu’au PNR', value: tpnr, unit: 'min', d: 0, text: hmin(tpnr) },
      ];
    },
    mini: 'Le point équitemps (PET) est l’endroit où il faut autant de temps pour continuer que pour revenir. Le point de non-retour (PNR) est le point au-delà duquel le carburant ne permet plus de revenir au départ.',
    course: [
      'Sur un vol au-dessus de la mer, d’une zone hostile ou vers une destination isolée, le pilote doit savoir où il en est vis-à-vis du retour.',
      'Point équitemps (PET, ou point critique) : distance depuis le départ = D × Vs_retour / (Vs_aller + Vs_retour). Avec du vent de face à l’aller, le PET est au-delà de la mi-parcours.',
      'Point de non-retour (PNR) : temps depuis le départ = E × Vs_retour / (Vs_aller + Vs_retour), E étant l’autonomie utilisable (réserve réglementaire exclue). Distance = ce temps × Vs_aller.',
      'Décision : en cas de problème (passager malade, panne mineure) avant le PET, on revient ; après, on continue. Au-delà du PNR, le retour n’est plus possible : seule la destination ou un dégagement en route restent.',
      'Ces points se recalculent si le vent réel diffère du vent prévu.',
    ],
    ask: (v) => `Vol de ${fr(v.d)} NM. Vitesse sol aller ${fr(v.gso)} kt, retour ${fr(v.gsr)} kt. Autonomie utilisable (hors réserve) : ${hmin(v.e)}. Calcule le PET et le PNR.`,
    steps: (v) => {
      const pet = (v.d * v.gsr) / (v.gso + v.gsr);
      const tpnr = (v.e * v.gsr) / (v.gso + v.gsr);
      return [
        `PET = ${fr(v.d)} × ${fr(v.gsr)} / (${fr(v.gso)} + ${fr(v.gsr)}) = ${fr(pet, 1)} NM du départ.`,
        `t_PNR = ${fr(v.e)} × ${fr(v.gsr)} / ${fr(v.gso + v.gsr)} = ${fr(tpnr)} min (${hmin(tpnr)}).`,
        `Distance du PNR = ${fr(tpnr / 60, 2)} h × ${fr(v.gso)} kt = ${fr((tpnr / 60) * v.gso, 1)} NM du départ.`,
      ];
    },
    ex: [
      { d: 180, gso: 100, gsr: 130, e: 210 }, { d: 120, gso: 110, gsr: 90, e: 150 }, { d: 240, gso: 140, gsr: 160, e: 240 },
      { d: 90, gso: 95, gsr: 105, e: 120 }, { d: 300, gso: 180, gsr: 220, e: 270 }, { d: 60, gso: 80, gsr: 100, e: 90 },
      { d: 150, gso: 120, gsr: 120, e: 180 }, { d: 200, gso: 105, gsr: 135, e: 200 }, { d: 75, gso: 70, gsr: 90, e: 100 },
      { d: 400, gso: 200, gsr: 240, e: 300 },
    ],
  },
  {
    id: 'vhf-range',
    group: 'nav',
    aircraft: 'both',
    title: 'Portée radio VHF',
    formula: 'D (NM) = 1,23 × (√h1 + √h2)',
    vars: [['D', 'portée théorique (NM)'], ['h1', 'hauteur de l’aéronef (ft)'], ['h2', 'hauteur de l’antenne au sol (ft)']],
    inputs: [
      { k: 'h1', label: 'Hauteur de l’aéronef', unit: 'ft', def: 3000 },
      { k: 'h2', label: 'Hauteur de l’antenne sol', unit: 'ft', def: 100 },
    ],
    calc: (v) => [{ label: 'Portée théorique', value: 1.23 * (Math.sqrt(v.h1) + Math.sqrt(v.h2)), unit: 'NM', d: 0 }],
    mini: 'La VHF (radio, VOR) se propage en ligne droite : la portée est limitée par la courbure de la Terre. Plus on vole haut, plus on porte loin : environ 1,23 × √hauteur(ft) NM.',
    course: [
      'Les ondes VHF (108 à 137 MHz : communications, VOR, ILS) se propagent « à vue », légèrement au-delà de l’horizon optique grâce à la réfraction atmosphérique.',
      'Portée théorique : D = 1,23 × (√h1 + √h2), hauteurs en ft, D en NM. À 3 000 ft, un avion « voit » une antenne au sol jusqu’à environ 80 NM.',
      'La portée réelle peut être réduite par le relief (masquage par une montagne), la puissance de l’émetteur ou la portée publiée de la balise (DOC).',
      'Conséquence pratique : en vol à basse hauteur, le contact radio avec un contrôle lointain peut être perdu ; monter améliore la réception.',
    ],
    ask: (v) => `Un aéronef vole à ${fr(v.h1)} ft au-dessus du sol, l’antenne de la station est à ${fr(v.h2)} ft. Quelle est la portée VHF théorique ?`,
    steps: (v) => [
      `√${fr(v.h1)} = ${fr(Math.sqrt(v.h1), 1)} ; √${fr(v.h2)} = ${fr(Math.sqrt(v.h2), 1)}.`,
      `D = 1,23 × (${fr(Math.sqrt(v.h1), 1)} + ${fr(Math.sqrt(v.h2), 1)}) = ${fr(1.23 * (Math.sqrt(v.h1) + Math.sqrt(v.h2)))} NM.`,
    ],
    ex: [
      { h1: 3000, h2: 100 }, { h1: 1000, h2: 25 }, { h1: 500, h2: 50 }, { h1: 5000, h2: 100 }, { h1: 10000, h2: 400 },
      { h1: 1500, h2: 0 }, { h1: 2500, h2: 64 }, { h1: 35000, h2: 100 }, { h1: 800, h2: 200 }, { h1: 7500, h2: 30 },
    ],
  },

  // ===================== MONTÉE ET DESCENTE =====================
  {
    id: 'vz-slope',
    group: 'montee',
    aircraft: 'both',
    title: 'Vitesse verticale pour une pente donnée',
    formula: 'Vz (ft/min) = Vs × 101,3 × tan θ\nRègle pour 3° : Vz ≈ 5 × Vs',
    vars: [['Vz', 'vitesse verticale (ft/min)'], ['Vs', 'vitesse sol (kt)'], ['θ', 'angle de pente (°)']],
    inputs: [
      { k: 'gs', label: 'Vitesse sol', unit: 'kt', def: 90 },
      { k: 'ang', label: 'Pente', unit: '°', def: 3 },
    ],
    calc: (v) => [
      { label: 'Vitesse verticale', value: v.gs * FT_MIN_PER_KT * Math.tan(rad(v.ang)), unit: 'ft/min', d: 0 },
      { label: 'Pente', value: Math.tan(rad(v.ang)) * 100, unit: '%', d: 1 },
      { label: 'Hauteur perdue par NM', value: NM_FT * Math.tan(rad(v.ang)), unit: 'ft/NM', d: 0 },
    ],
    mini: 'Pour suivre une pente fixe (ex. plan d’approche à 3°), le taux de descente dépend de la vitesse sol. 1 kt = 101 ft/min, donc Vz = Vs × 101 × tan θ ; pour 3°, Vz ≈ 5 × Vs.',
    course: [
      'Une pente de θ degrés signifie qu’on perd tan θ × distance parcourue. 1 kt de vitesse sol = 6 076 ft par heure = 101,3 ft par minute. D’où Vz = Vs × 101,3 × tan θ.',
      'Plan standard de 3° : tan 3° = 0,0524, soit Vz = 5,3 × Vs. Règle mentale : Vz ≈ 5 × Vs (90 kt → 450 à 480 ft/min). Sur ce plan, on perd environ 318 ft par NM (« 300 ft/NM »).',
      'Avec du vent de face, la vitesse sol baisse : il faut un taux de descente plus faible pour garder la même pente. Avec du vent arrière, un taux plus fort.',
      'En pourcentage : pente (%) = tan θ × 100. 3° ≈ 5,2 %. Une pente de 1 % correspond à environ 61 ft par NM.',
      'Usage : approches (ILS, PAPI à 3°), descentes de croisière, montées imposées (procédures de départ avec pente minimale).',
    ],
    ask: (v) => `Vitesse sol ${fr(v.gs)} kt, pente à tenir ${fr(v.ang, 1)}°. Quel taux de descente afficher ?`,
    steps: (v) => {
      const t = Math.tan(rad(v.ang));
      return [
        `tan ${fr(v.ang, 1)}° = ${fr(t, 4)}.`,
        `Vz = ${fr(v.gs)} × 101,3 × ${fr(t, 4)} = ${fr(v.gs * FT_MIN_PER_KT * t)} ft/min.`,
        v.ang === 3 ? `Contrôle mental : 5 × ${fr(v.gs)} = ${fr(5 * v.gs)} ft/min.` : `Pente en % : ${fr(t * 100, 1)} %.`,
      ];
    },
    ex: [
      { gs: 90, ang: 3 }, { gs: 70, ang: 3 }, { gs: 120, ang: 3 }, { gs: 140, ang: 3 }, { gs: 60, ang: 4 },
      { gs: 100, ang: 2.5 }, { gs: 80, ang: 5 }, { gs: 150, ang: 3 }, { gs: 110, ang: 3.5 }, { gs: 65, ang: 6 },
    ],
  },
  {
    id: 'tod',
    group: 'montee',
    aircraft: 'both',
    title: 'Point de début de descente',
    formula: 'D (NM) = ΔZ / (6 076 × tan θ)\nRègle pour 3° : D ≈ ΔZ / 1 000 × 3',
    vars: [['ΔZ', 'altitude à perdre (ft)'], ['θ', 'pente de descente (°)'], ['D', 'distance avant le point visé (NM)']],
    inputs: [
      { k: 'z1', label: 'Altitude de croisière', unit: 'ft', def: 5500 },
      { k: 'z2', label: 'Altitude visée', unit: 'ft', def: 1500 },
      { k: 'ang', label: 'Pente', unit: '°', def: 3 },
      { k: 'gs', label: 'Vitesse sol en descente', unit: 'kt', def: 110 },
    ],
    calc: (v) => {
      const dz = v.z1 - v.z2;
      const t = Math.tan(rad(v.ang));
      const d = dz / (NM_FT * t);
      return [
        { label: 'Début de descente avant le point', value: d, unit: 'NM', d: 1 },
        { label: 'Durée de la descente', value: (d / v.gs) * 60, unit: 'min', d: 1 },
        { label: 'Vitesse verticale', value: v.gs * FT_MIN_PER_KT * t, unit: 'ft/min', d: 0 },
      ];
    },
    mini: 'Pour descendre sur une pente de 3°, il faut environ 3 NM par 1 000 ft à perdre. On en déduit où commencer la descente, sa durée et le taux à afficher.',
    course: [
      'Distance de descente = altitude à perdre / (6 076 × tan θ). Pour 3° : 1 000 ft se perdent en 3,1 NM, d’où la règle « ΔZ en milliers de ft × 3 ».',
      'On calcule ensuite la durée (D / Vs × 60) et le taux à afficher (Vz = Vs × 101,3 × tan θ, environ 5 × Vs pour 3°).',
      'En VFR, on vise souvent l’altitude du tour de piste (souvent 1 000 ft au-dessus du terrain) quelques NM avant l’arrivée, pour être stabilisé.',
      'Descendre trop tard oblige à une pente forte, avec une vitesse qui augmente : risque de dépassement de la VNE et d’arrivée non stabilisée. Descendre trop tôt fait voler longtemps bas, avec une consommation plus forte.',
      'En hélicoptère, les pentes d’approche peuvent être plus raides (6° à 10°), le principe de calcul reste le même.',
    ],
    ask: (v) => `En croisière à ${fr(v.z1)} ft, on doit être à ${fr(v.z2)} ft à la verticale d’un point. Pente ${fr(v.ang, 1)}°, vitesse sol ${fr(v.gs)} kt. À quelle distance commencer la descente, combien de temps dure-t-elle et quel taux afficher ?`,
    steps: (v) => {
      const dz = v.z1 - v.z2;
      const t = Math.tan(rad(v.ang));
      const d = dz / (NM_FT * t);
      return [
        `Altitude à perdre : ${fr(v.z1)} − ${fr(v.z2)} = ${fr(dz)} ft.`,
        `D = ${fr(dz)} / (6 076 × ${fr(t, 4)}) = ${fr(d, 1)} NM avant le point.`,
        `Durée = ${fr(d, 1)} / ${fr(v.gs)} × 60 = ${fr((d / v.gs) * 60, 1)} min.`,
        `Vz = ${fr(v.gs)} × 101,3 × ${fr(t, 4)} = ${fr(v.gs * FT_MIN_PER_KT * t)} ft/min.`,
      ];
    },
    ex: [
      { z1: 5500, z2: 1500, ang: 3, gs: 110 }, { z1: 4500, z2: 2000, ang: 3, gs: 100 }, { z1: 7500, z2: 2500, ang: 3, gs: 130 },
      { z1: 3500, z2: 1000, ang: 4, gs: 90 }, { z1: 9500, z2: 3000, ang: 3, gs: 140 }, { z1: 2500, z2: 800, ang: 5, gs: 70 },
      { z1: 6500, z2: 1200, ang: 2.5, gs: 120 }, { z1: 11000, z2: 4000, ang: 3, gs: 160 }, { z1: 3000, z2: 1500, ang: 6, gs: 60 },
      { z1: 8000, z2: 2000, ang: 3, gs: 105 },
    ],
  },
  {
    id: 'gradient',
    group: 'montee',
    aircraft: 'both',
    title: 'Pente de montée à partir du variomètre',
    formula: 'Pente (%) = Vz / (Vs × 101,3) × 100\nGain (ft/NM) = Vz × 60 / Vs',
    vars: [['Vz', 'vitesse verticale (ft/min)'], ['Vs', 'vitesse sol (kt)']],
    inputs: [
      { k: 'vz', label: 'Vitesse verticale', unit: 'ft/min', def: 600 },
      { k: 'gs', label: 'Vitesse sol', unit: 'kt', def: 75 },
    ],
    calc: (v) => {
      const p = v.vz / (v.gs * FT_MIN_PER_KT);
      return [
        { label: 'Pente', value: p * 100, unit: '%', d: 1 },
        { label: 'Angle', value: deg(Math.atan(p)), unit: '°', d: 1 },
        { label: 'Gain par NM', value: (v.vz * 60) / v.gs, unit: 'ft/NM', d: 0 },
      ];
    },
    mini: 'Le variomètre donne un taux (ft/min), mais pour passer un obstacle, c’est la pente qui compte. Pente = Vz ÷ (Vs × 101). Le vent de face améliore la pente à taux égal.',
    course: [
      'Un taux de montée de 600 ft/min ne dit pas si l’on passera un relief : à 75 kt sol, on gagne 480 ft par NM ; à 120 kt sol, seulement 300 ft par NM.',
      'Pente (en fraction) = Vz / (Vs × 101,3) ; × 100 pour des %, arctangente pour des degrés. Gain par NM = Vz × 60 / Vs.',
      'Les procédures de départ (SID) imposent parfois une pente minimale, en % : il faut vérifier que l’appareil la tient avec la masse, la température et le vent du jour.',
      'Vent de face = vitesse sol plus faible = pente meilleure pour le même taux. C’est pour cela qu’on décolle face au vent.',
      'Vitesse de meilleure pente (Vx) et de meilleur taux (Vy) : Vx maximise la pente (passage d’obstacles), Vy maximise le taux (gagner de l’altitude le plus vite).',
    ],
    ask: (v) => `Le variomètre indique +${fr(v.vz)} ft/min, la vitesse sol est ${fr(v.gs)} kt. Quelle est la pente de montée (en % et en degrés) et combien de pieds gagne-t-on par NM ?`,
    steps: (v) => {
      const p = v.vz / (v.gs * FT_MIN_PER_KT);
      return [
        `Pente = ${fr(v.vz)} / (${fr(v.gs)} × 101,3) = ${fr(v.vz)} / ${fr(v.gs * FT_MIN_PER_KT)} = ${fr(p, 4)}, soit ${fr(p * 100, 1)} %.`,
        `Angle = arctan(${fr(p, 4)}) = ${fr(deg(Math.atan(p)), 1)}°.`,
        `Gain = ${fr(v.vz)} × 60 / ${fr(v.gs)} = ${fr((v.vz * 60) / v.gs)} ft/NM.`,
      ];
    },
    ex: [
      { vz: 600, gs: 75 }, { vz: 500, gs: 70 }, { vz: 700, gs: 90 }, { vz: 800, gs: 120 }, { vz: 400, gs: 60 },
      { vz: 1000, gs: 100 }, { vz: 350, gs: 80 }, { vz: 1500, gs: 160 }, { vz: 900, gs: 65 }, { vz: 450, gs: 95 },
    ],
  },
  {
    id: 'climb-time',
    group: 'montee',
    aircraft: 'both',
    title: 'Temps et distance de montée ou de descente',
    formula: 't (min) = ΔZ / Vz\nD (NM) = Vs × t / 60',
    vars: [['ΔZ', 'variation d’altitude (ft)'], ['Vz', 'vitesse verticale (ft/min)'], ['Vs', 'vitesse sol (kt)']],
    inputs: [
      { k: 'z1', label: 'Altitude de départ', unit: 'ft', def: 500 },
      { k: 'z2', label: 'Altitude visée', unit: 'ft', def: 5500 },
      { k: 'vz', label: 'Vitesse verticale', unit: 'ft/min', def: 500 },
      { k: 'gs', label: 'Vitesse sol', unit: 'kt', def: 80 },
    ],
    calc: (v) => {
      const t = Math.abs(v.z2 - v.z1) / v.vz;
      return [
        { label: 'Durée', value: t, unit: 'min', d: 1 },
        { label: 'Distance parcourue', value: (v.gs * t) / 60, unit: 'NM', d: 1 },
      ];
    },
    mini: 'Le temps pour changer d’altitude est la différence d’altitude divisée par la vitesse verticale. Pendant ce temps, l’aéronef avance de vitesse sol × temps.',
    course: [
      'Durée = ΔZ / Vz (ft ÷ ft/min = minutes). Distance = Vs × t / 60.',
      'Le taux de montée baisse avec l’altitude (moins de puissance, air moins dense) : pour une longue montée, on utilise un taux moyen, ou les tableaux « temps, carburant, distance de montée » du manuel.',
      'Pendant la montée, la vitesse sol est plus faible qu’en croisière : on en tient compte dans le log de navigation (le point de fin de montée, TOC).',
      'En descente, même calcul avec le taux de descente choisi.',
    ],
    ask: (v) => `De ${fr(v.z1)} ft à ${fr(v.z2)} ft, avec ${fr(v.vz)} ft/min et une vitesse sol de ${fr(v.gs)} kt : combien de temps et quelle distance ?`,
    steps: (v) => {
      const dz = Math.abs(v.z2 - v.z1);
      const t = dz / v.vz;
      return [
        `ΔZ = |${fr(v.z2)} − ${fr(v.z1)}| = ${fr(dz)} ft.`,
        `t = ${fr(dz)} / ${fr(v.vz)} = ${fr(t, 1)} min.`,
        `D = ${fr(v.gs)} × ${fr(t, 1)} / 60 = ${fr((v.gs * t) / 60, 1)} NM.`,
      ];
    },
    ex: [
      { z1: 500, z2: 5500, vz: 500, gs: 80 }, { z1: 0, z2: 3000, vz: 700, gs: 75 }, { z1: 1200, z2: 8500, vz: 450, gs: 85 },
      { z1: 6500, z2: 1500, vz: 500, gs: 110 }, { z1: 300, z2: 2300, vz: 800, gs: 65 }, { z1: 9000, z2: 3000, vz: 1000, gs: 140 },
      { z1: 1000, z2: 4500, vz: 600, gs: 90 }, { z1: 2000, z2: 11000, vz: 1200, gs: 150 }, { z1: 4500, z2: 1000, vz: 350, gs: 70 },
      { z1: 0, z2: 1500, vz: 1000, gs: 60 },
    ],
  },

  // ===================== VIRAGES =====================
  {
    id: 'load-factor',
    group: 'virage',
    aircraft: 'both',
    title: 'Facteur de charge en virage',
    formula: 'n = 1 / cos φ\nVs_virage = Vs × √n',
    vars: [['n', 'facteur de charge (g)'], ['φ', 'inclinaison (°)'], ['Vs', 'vitesse de décrochage en ligne droite (kt)']],
    inputs: [
      { k: 'phi', label: 'Inclinaison', unit: '°', def: 45 },
      { k: 'vs', label: 'Vitesse de décrochage (ailes à plat)', unit: 'kt', def: 50 },
    ],
    calc: (v) => {
      const n = 1 / Math.cos(rad(v.phi));
      return [
        { label: 'Facteur de charge', value: n, unit: 'g', d: 2 },
        { label: 'Décrochage en virage', value: v.vs * Math.sqrt(n), unit: 'kt', d: 0 },
        { label: 'Augmentation', value: (Math.sqrt(n) - 1) * 100, unit: '%', d: 0 },
      ];
    },
    mini: 'En virage en palier, les ailes (ou le rotor) doivent porter plus que le poids : n = 1/cos φ. À 60° d’inclinaison, n = 2 g, et la vitesse de décrochage augmente de 41 %.',
    course: [
      'En virage à altitude constante, la portance est inclinée : sa composante verticale doit toujours compenser le poids, donc la portance totale = poids / cos φ. Le facteur de charge n = portance / poids = 1 / cos φ.',
      'Valeurs à connaître : 30° → 1,15 g ; 45° → 1,41 g ; 60° → 2 g ; 70° → 2,9 g ; 75° → 3,9 g.',
      'La vitesse de décrochage augmente comme √n : à 45°, +19 % ; à 60°, +41 %. Un virage serré à basse vitesse (dernier virage en finale) est un piège classique de décrochage.',
      'Le facteur de charge maximal autorisé (souvent +3,8 g pour un avion léger en catégorie normale) limite l’inclinaison et les ressources.',
      'En hélicoptère, le facteur de charge augmente aussi la puissance nécessaire et peut provoquer une perte de régime rotor ou un décrochage de pale à grande vitesse.',
    ],
    ask: (v) => `Virage en palier à ${fr(v.phi)}° d’inclinaison. La vitesse de décrochage ailes à plat est ${fr(v.vs)} kt. Calcule le facteur de charge et la nouvelle vitesse de décrochage.`,
    steps: (v) => {
      const n = 1 / Math.cos(rad(v.phi));
      return [
        `cos ${fr(v.phi)}° = ${fr(Math.cos(rad(v.phi)), 3)} → n = 1 / ${fr(Math.cos(rad(v.phi)), 3)} = ${fr(n, 2)} g.`,
        `√n = ${fr(Math.sqrt(n), 3)} → Vs virage = ${fr(v.vs)} × ${fr(Math.sqrt(n), 3)} = ${fr(v.vs * Math.sqrt(n))} kt (+${fr((Math.sqrt(n) - 1) * 100)} %).`,
      ];
    },
    ex: [
      { phi: 30, vs: 50 }, { phi: 45, vs: 48 }, { phi: 60, vs: 52 }, { phi: 15, vs: 45 }, { phi: 20, vs: 55 },
      { phi: 70, vs: 50 }, { phi: 50, vs: 60 }, { phi: 40, vs: 47 }, { phi: 35, vs: 65 }, { phi: 75, vs: 49 },
    ],
  },
  {
    id: 'rate-one',
    group: 'virage',
    aircraft: 'both',
    title: 'Virage au taux standard (3°/s)',
    formula: 'φ ≈ Vp / 10 + 7\nR (NM) ≈ Vp / 188,5 · 360° en 2 min',
    vars: [['φ', 'inclinaison nécessaire (°)'], ['Vp', 'vitesse propre (kt)'], ['R', 'rayon du virage']],
    inputs: [{ k: 'tas', label: 'Vitesse propre', unit: 'kt', def: 100 }],
    calc: (v) => {
      const V = v.tas * KT_MS;
      const w = rad(3);
      const phi = deg(Math.atan((V * w) / G));
      const r = V / w;
      return [
        { label: 'Inclinaison exacte', value: phi, unit: '°', d: 1 },
        { label: 'Inclinaison (règle Vp/10 + 7)', value: v.tas / 10 + 7, unit: '°', d: 0 },
        { label: 'Rayon', value: r / 1852, unit: 'NM', d: 2 },
        { label: 'Rayon', value: r, unit: 'm', d: 0 },
      ];
    },
    mini: 'Le taux standard (taux 1) fait tourner de 3° par seconde, soit un tour complet en 2 minutes. L’inclinaison nécessaire vaut environ Vp/10 + 7 degrés.',
    course: [
      'Le virage au taux 1 (3°/s) est la référence du vol aux instruments : 360° en 2 min, 180° en 1 min, 90° en 30 s. L’indicateur de virage (bille-aiguille ou coordinateur) porte un repère à ce taux.',
      'Inclinaison exacte : tan φ = V × ω / g (V en m/s, ω = 0,0524 rad/s). Règle pratique : φ ≈ Vp/10 + 7 (100 kt → 17°), qui surestime de 1 à 2° aux vitesses des avions légers ; autre règle courante : φ ≈ 15 % de Vp (100 kt → 15°).',
      'Rayon : R = V / ω. En NM, R ≈ Vp / 188,5 (100 kt → 0,53 NM). Règle mentale grossière : R ≈ Vp / 200 NM.',
      'À grande vitesse, l’inclinaison du taux 1 devient trop forte : les avions de ligne limitent alors l’inclinaison à 25–30° et tournent moins vite.',
      'Utile pour les attentes (hippodromes), les demi-tours en conditions dégradées et l’anticipation des virages sur un point tournant.',
    ],
    ask: (v) => `Vitesse propre ${fr(v.tas)} kt. Quelle inclinaison prendre pour un virage au taux standard ? Quel est le rayon du virage ?`,
    steps: (v) => {
      const V = v.tas * KT_MS;
      const w = rad(3);
      return [
        `V = ${fr(v.tas)} × 0,5144 = ${fr(V, 1)} m/s ; ω = 3°/s = ${fr(w, 4)} rad/s.`,
        `tan φ = ${fr(V, 1)} × ${fr(w, 4)} / 9,81 = ${fr((V * w) / G, 3)} → φ = ${fr(deg(Math.atan((V * w) / G)), 1)}°.`,
        `Règle pratique : ${fr(v.tas)} / 10 + 7 = ${fr(v.tas / 10 + 7)}°.`,
        `R = V / ω = ${fr(V, 1)} / ${fr(w, 4)} = ${fr(V / w)} m = ${fr(V / w / 1852, 2)} NM.`,
      ];
    },
    ex: [{ tas: 100 }, { tas: 80 }, { tas: 120 }, { tas: 90 }, { tas: 150 }, { tas: 60 }, { tas: 110 }, { tas: 180 }, { tas: 70 }, { tas: 250 }],
  },
  {
    id: 'turn-radius',
    group: 'virage',
    aircraft: 'both',
    title: 'Rayon et taux de virage à inclinaison donnée',
    formula: 'R = V² / (g × tan φ)\nTaux (°/s) = g × tan φ / V × 57,3',
    vars: [['R', 'rayon (m)'], ['V', 'vitesse propre (m/s)'], ['g', '9,81 m/s²'], ['φ', 'inclinaison (°)']],
    inputs: [
      { k: 'tas', label: 'Vitesse propre', unit: 'kt', def: 100 },
      { k: 'phi', label: 'Inclinaison', unit: '°', def: 30 },
    ],
    calc: (v) => {
      const V = v.tas * KT_MS;
      const tn = Math.tan(rad(v.phi));
      const r = (V * V) / (G * tn);
      const rate = deg((G * tn) / V);
      return [
        { label: 'Rayon', value: r, unit: 'm', d: 0 },
        { label: 'Rayon', value: r / 1852, unit: 'NM', d: 2 },
        { label: 'Taux de virage', value: rate, unit: '°/s', d: 1 },
        { label: 'Durée d’un 360°', value: 360 / rate, unit: 's', d: 0 },
      ];
    },
    mini: 'Plus on va vite, plus le virage est large (le rayon varie comme le carré de la vitesse) ; plus on s’incline, plus il est serré. Le rayon est indépendant de la masse.',
    course: [
      'En virage coordonné en palier, la composante horizontale de la portance fournit la force centripète : tan φ = V² / (g × R), d’où R = V² / (g × tan φ).',
      'Le rayon double si la vitesse augmente de 41 %, et quadruple si la vitesse double. À vitesse égale, passer de 15° à 30° d’inclinaison divise le rayon par plus de 2.',
      'Taux de virage ω = g × tan φ / V (en rad/s, × 57,3 pour des °/s).',
      'Application : demi-tour dans une vallée. À 100 kt et 30° d’inclinaison, le diamètre du virage dépasse 1 000 m. Réduire la vitesse est plus efficace que d’augmenter l’inclinaison (qui augmente le facteur de charge et la vitesse de décrochage).',
      'Le vent ne change pas le rayon par rapport à l’air, mais il déforme la trajectoire au sol : le demi-tour face au vent est plus serré au sol que vent arrière.',
    ],
    ask: (v) => `Virage à ${fr(v.phi)}° d’inclinaison à ${fr(v.tas)} kt de vitesse propre. Calcule le rayon, le taux de virage et la durée d’un tour complet.`,
    steps: (v) => {
      const V = v.tas * KT_MS;
      const tn = Math.tan(rad(v.phi));
      const r = (V * V) / (G * tn);
      const rate = deg((G * tn) / V);
      return [
        `V = ${fr(v.tas)} × 0,5144 = ${fr(V, 1)} m/s ; tan ${fr(v.phi)}° = ${fr(tn, 3)}.`,
        `R = ${fr(V, 1)}² / (9,81 × ${fr(tn, 3)}) = ${fr(V * V)} / ${fr(G * tn, 2)} = ${fr(r)} m (${fr(r / 1852, 2)} NM).`,
        `Taux = 9,81 × ${fr(tn, 3)} / ${fr(V, 1)} × 57,3 = ${fr(rate, 1)}°/s → 360° en ${fr(360 / rate)} s.`,
      ];
    },
    ex: [
      { tas: 100, phi: 30 }, { tas: 80, phi: 45 }, { tas: 120, phi: 20 }, { tas: 60, phi: 30 }, { tas: 90, phi: 60 },
      { tas: 140, phi: 25 }, { tas: 70, phi: 15 }, { tas: 110, phi: 40 }, { tas: 250, phi: 25 }, { tas: 50, phi: 20 },
    ],
  },
];
