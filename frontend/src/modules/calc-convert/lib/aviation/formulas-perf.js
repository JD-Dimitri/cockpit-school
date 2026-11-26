/**
 * Formules aviation — partie 3 : carburant, masse et centrage, performances, hélicoptère.
 * Même structure que formulas-base.js.
 */
import { G, KT_MS, NM_FT, deg, fr, hmin } from './helpers.js';

/** Réserves finales de carburant (EASA Part-NCO, AMC1 NCO.OP.125(b)) */
const RESERVES = {
  avd: { label: 'Avion, VFR de jour (30 min)', min: 30 },
  avn: { label: 'Avion, VFR de nuit ou IFR (45 min)', min: 45 },
  hev: { label: 'Hélicoptère, VFR (20 min)', min: 20 },
  hei: { label: 'Hélicoptère, IFR (30 min)', min: 30 },
};
const reserveOptions = Object.entries(RESERVES).map(([value, r]) => ({ value, label: r.label }));

const SURFACES = {
  dur: { label: 'Piste en dur sèche', f: 1 },
  herbe: { label: 'Herbe sèche (jusqu’à 20 cm)', f: 1.2 },
  herbem: { label: 'Herbe mouillée (jusqu’à 20 cm)', f: 1.3 },
  mou: { label: 'Sol mou ou neige', f: 1.25 },
};
const SLOPES = { plat: { label: 'Piste plate', f: 1 }, montee: { label: 'Montée de 2 %', f: 1.1 } };
const SAFETY = { oui: { label: 'Oui (× 1,33)', f: 1.33 }, non: { label: 'Non', f: 1 } };
const opts = (o) => Object.entries(o).map(([value, x]) => ({ value, label: x.label }));

const AVGAS = 0.72;

export const PERF_FORMULAS = [
  // ===================== CARBURANT =====================
  {
    id: 'fuel-required',
    group: 'carburant',
    aircraft: 'both',
    title: 'Carburant nécessaire au vol',
    formula: 'Q = CH × (t_vol + t_réserve) / 60 + roulage',
    vars: [['Q', 'carburant à embarquer (L)'], ['CH', 'consommation horaire (L/h)'], ['t_vol', 'temps de vol prévu (min)'], ['t_réserve', 'réserve finale réglementaire (min)']],
    inputs: [
      { k: 'ch', label: 'Consommation horaire', unit: 'L/h', def: 30 },
      { k: 'tvol', label: 'Temps de vol prévu', unit: 'min', def: 95 },
      { k: 'res', label: 'Réserve finale', type: 'select', def: 'avd', options: reserveOptions },
      { k: 'taxi', label: 'Roulage et mise en route', unit: 'L', def: 3 },
    ],
    calc: (v) => {
      const r = RESERVES[v.res].min;
      const q = (v.ch * (v.tvol + r)) / 60 + v.taxi;
      return [
        { label: 'Carburant minimal', value: q, unit: 'L', d: 1 },
        { label: 'Dont réserve', value: (v.ch * r) / 60, unit: 'L', d: 1 },
        { label: 'Masse (AVGAS)', value: q * AVGAS, unit: 'kg', d: 1 },
      ];
    },
    mini: 'Le carburant minimal = consommation × (temps de vol + réserve finale) + roulage. Réserves EASA pour l’aviation générale : avion VFR de jour 30 min, de nuit ou IFR 45 min ; hélicoptère VFR 20 min, IFR 30 min.',
    course: [
      'Le commandant de bord ne peut décoller que s’il emporte assez de carburant pour rejoindre la destination (et un dégagement si nécessaire) plus une réserve finale, à ne pas consommer en situation normale.',
      'Réserves finales minimales en aviation générale non commerciale (EASA Part-NCO, AMC1 NCO.OP.125(b)) : avion VFR de jour 30 min, avion VFR de nuit ou IFR 45 min, hélicoptère VFR 20 min, hélicoptère IFR 30 min (10 min seulement pour certaines opérations spécialisées de jour, avec départ et arrivée au même site et à moins de 25 NM). Vérifie toujours la réglementation applicable à ton vol et les consignes de ton aéroclub.',
      'Calcul : Q = CH × (t_vol + t_réserve) / 60 + carburant de roulage. On ajoute souvent une marge pour les imprévus (vent plus fort, attente, déroutement).',
      'Le temps de vol se calcule avec la vitesse sol (vent compris), et la consommation horaire se lit dans le manuel pour le régime de croisière choisi.',
      'Bonne pratique : vérifier visuellement le niveau des réservoirs avant le vol, ne pas se fier uniquement à la jauge, et noter les heures de bascule entre réservoirs.',
      'La panne sèche reste une cause d’accident fréquente : le calcul carburant est un point clé de la préparation.',
    ],
    ask: (v) => `Vol prévu de ${hmin(v.tvol)}, consommation ${fr(v.ch)} L/h, réserve : ${RESERVES[v.res].label.toLowerCase()}, roulage ${fr(v.taxi)} L. Quelle quantité minimale de carburant embarquer ?`,
    steps: (v) => {
      const r = RESERVES[v.res].min;
      const q = (v.ch * (v.tvol + r)) / 60 + v.taxi;
      return [
        `Temps total à couvrir : ${fr(v.tvol)} + ${fr(r)} = ${fr(v.tvol + r)} min.`,
        `Carburant de vol + réserve : ${fr(v.ch)} × ${fr(v.tvol + r)} / 60 = ${fr((v.ch * (v.tvol + r)) / 60, 1)} L.`,
        `Q = ${fr((v.ch * (v.tvol + r)) / 60, 1)} + ${fr(v.taxi)} = ${fr(q, 1)} L (soit ${fr(q * AVGAS, 1)} kg d’AVGAS).`,
      ];
    },
    ex: [
      { ch: 30, tvol: 95, res: 'avd', taxi: 3 }, { ch: 25, tvol: 60, res: 'avd', taxi: 2 }, { ch: 38, tvol: 140, res: 'avn', taxi: 4 },
      { ch: 45, tvol: 50, res: 'hev', taxi: 3 }, { ch: 22, tvol: 75, res: 'avd', taxi: 2 }, { ch: 160, tvol: 90, res: 'hev', taxi: 10 },
      { ch: 33, tvol: 120, res: 'avn', taxi: 3 }, { ch: 180, tvol: 70, res: 'hei', taxi: 12 }, { ch: 28, tvol: 45, res: 'avd', taxi: 2 },
      { ch: 40, tvol: 180, res: 'avn', taxi: 5 },
    ],
  },
  {
    id: 'endurance',
    group: 'carburant',
    aircraft: 'both',
    title: 'Autonomie et distance franchissable',
    formula: 'Autonomie (h) = Q / CH\nDistance = (autonomie − réserve) × Vs',
    vars: [['Q', 'carburant utilisable (L)'], ['CH', 'consommation horaire (L/h)'], ['Vs', 'vitesse sol (kt)']],
    inputs: [
      { k: 'q', label: 'Carburant utilisable', unit: 'L', def: 110 },
      { k: 'ch', label: 'Consommation horaire', unit: 'L/h', def: 28 },
      { k: 'gs', label: 'Vitesse sol', unit: 'kt', def: 105 },
      { k: 'res', label: 'Réserve à conserver', unit: 'min', def: 30 },
    ],
    calc: (v) => {
      const t = (v.q / v.ch) * 60;
      return [
        { label: 'Autonomie totale', value: t, unit: 'min', d: 0, text: hmin(t) },
        { label: 'Autonomie hors réserve', value: t - v.res, unit: 'min', d: 0, text: hmin(Math.max(0, t - v.res)) },
        { label: 'Distance franchissable', value: (Math.max(0, t - v.res) / 60) * v.gs, unit: 'NM', d: 0 },
      ];
    },
    mini: 'L’autonomie est le temps de vol possible avec le carburant disponible : quantité ÷ consommation. En retirant la réserve et en multipliant par la vitesse sol, on obtient la distance franchissable.',
    course: [
      'Autonomie (en heures) = carburant utilisable / consommation horaire. Attention : seul le carburant utilisable compte (une partie reste piégée dans les réservoirs et canalisations, indiquée dans le manuel).',
      'Autonomie utile = autonomie − réserve finale. C’est ce temps qui est disponible pour la navigation et les imprévus.',
      'Distance franchissable = autonomie utile × vitesse sol. Avec du vent de face, elle diminue alors que l’autonomie (en temps) ne change pas.',
      'Le régime moteur (et donc la consommation) influe fortement : en réduisant la puissance, on augmente l’autonomie ; le manuel donne la vitesse d’autonomie maximale et celle de distance maximale.',
    ],
    ask: (v) => `${fr(v.q)} L utilisables, consommation ${fr(v.ch)} L/h, vitesse sol ${fr(v.gs)} kt, réserve de ${fr(v.res)} min à conserver. Calcule l’autonomie totale, l’autonomie hors réserve et la distance franchissable.`,
    steps: (v) => {
      const t = (v.q / v.ch) * 60;
      const u = Math.max(0, t - v.res);
      return [
        `Autonomie = ${fr(v.q)} / ${fr(v.ch)} = ${fr(v.q / v.ch, 2)} h = ${fr(t)} min (${hmin(t)}).`,
        `Hors réserve : ${fr(t)} − ${fr(v.res)} = ${fr(u)} min (${hmin(u)}).`,
        `Distance = ${fr(u / 60, 2)} h × ${fr(v.gs)} kt = ${fr((u / 60) * v.gs)} NM.`,
      ];
    },
    ex: [
      { q: 110, ch: 28, gs: 105, res: 30 }, { q: 80, ch: 25, gs: 95, res: 30 }, { q: 150, ch: 35, gs: 120, res: 45 },
      { q: 60, ch: 20, gs: 80, res: 30 }, { q: 400, ch: 160, gs: 115, res: 20 }, { q: 200, ch: 40, gs: 140, res: 45 },
      { q: 95, ch: 30, gs: 90, res: 30 }, { q: 540, ch: 180, gs: 125, res: 20 }, { q: 130, ch: 32, gs: 110, res: 30 },
      { q: 45, ch: 18, gs: 70, res: 30 },
    ],
  },

  // ===================== MASSE ET CENTRAGE =====================
  {
    id: 'weight-balance',
    group: 'masse',
    aircraft: 'both',
    title: 'Masse et centrage',
    formula: 'Moment = masse × bras\nCentre de gravité = Σ moments / Σ masses',
    vars: [['bras', 'distance au plan de référence (m)'], ['moment', 'masse × bras (kg·m)'], ['CG', 'position du centre de gravité (m)']],
    inputs: [
      { k: 'me', label: 'Masse à vide', unit: 'kg', def: 620 },
      { k: 'be', label: 'Bras masse à vide', unit: 'm', def: 0.38 },
      { k: 'mf', label: 'Pilote + passager avant', unit: 'kg', def: 160 },
      { k: 'bf', label: 'Bras sièges avant', unit: 'm', def: 0.41 },
      { k: 'mr', label: 'Passagers arrière', unit: 'kg', def: 70 },
      { k: 'br', label: 'Bras sièges arrière', unit: 'm', def: 1.19 },
      { k: 'mb', label: 'Bagages', unit: 'kg', def: 20 },
      { k: 'bb', label: 'Bras bagages', unit: 'm', def: 1.9 },
      { k: 'fl', label: 'Carburant (AVGAS)', unit: 'L', def: 100 },
      { k: 'bfu', label: 'Bras carburant', unit: 'm', def: 1.12 },
    ],
    calc: (v) => {
      const items = wbItems(v);
      const m = items.reduce((s, i) => s + i.m, 0);
      const mo = items.reduce((s, i) => s + i.m * i.b, 0);
      return [
        { label: 'Centre de gravité', value: mo / m, unit: 'm', d: 3 },
        { label: 'Masse totale', value: m, unit: 'kg', d: 1 },
        { label: 'Moment total', value: mo, unit: 'kg·m', d: 1 },
      ];
    },
    mini: 'Chaque charge crée un moment = masse × bras. Le centre de gravité est la somme des moments divisée par la masse totale. Il doit rester entre les limites avant et arrière du manuel, et la masse sous la masse maximale.',
    course: [
      'Un aéronef n’est contrôlable et stable que si son centre de gravité (CG) se trouve dans une plage définie par le constructeur. Trop en arrière : instabilité, décrochage difficile à récupérer. Trop en avant : profondeur insuffisante à l’arrondi.',
      'Le bras est la distance d’une charge à un plan de référence choisi par le constructeur (souvent le bord d’attaque ou la cloison pare-feu). Le moment = masse × bras.',
      'Méthode : 1) lister chaque charge avec sa masse et son bras ; 2) calculer chaque moment ; 3) additionner masses et moments ; 4) CG = moment total / masse totale ; 5) comparer au domaine de centrage du manuel.',
      'Le carburant se convertit en masse (AVGAS × 0,72). Il faut vérifier le centrage au décollage ET à l’atterrissage (carburant consommé).',
      'En hélicoptère, le centrage est longitudinal et latéral : un CG hors limites peut épuiser le débattement du cyclique.',
      'Les valeurs par défaut du calculateur sont celles d’un avion d’école fictif : utilise toujours la fiche de pesée et le manuel de ton appareil.',
    ],
    ask: (v) => `Masse à vide ${fr(v.me)} kg (bras ${fr(v.be, 2)} m) ; avant ${fr(v.mf)} kg (bras ${fr(v.bf, 2)} m) ; arrière ${fr(v.mr)} kg (bras ${fr(v.br, 2)} m) ; bagages ${fr(v.mb)} kg (bras ${fr(v.bb, 2)} m) ; ${fr(v.fl)} L d’AVGAS (bras ${fr(v.bfu, 2)} m). Calcule la masse totale et la position du centre de gravité.`,
    steps: (v) => {
      const items = wbItems(v);
      const m = items.reduce((s, i) => s + i.m, 0);
      const mo = items.reduce((s, i) => s + i.m * i.b, 0);
      return [
        `Carburant : ${fr(v.fl)} L × 0,72 = ${fr(v.fl * AVGAS, 1)} kg.`,
        ...items.map((i) => `${i.n} : ${fr(i.m, 1)} kg × ${fr(i.b, 2)} m = ${fr(i.m * i.b, 1)} kg·m.`),
        `Masse totale = ${fr(m, 1)} kg ; moment total = ${fr(mo, 1)} kg·m.`,
        `CG = ${fr(mo, 1)} / ${fr(m, 1)} = ${fr(mo / m, 3)} m. À comparer aux limites du manuel.`,
      ];
    },
    ex: [
      { me: 620, be: 0.38, mf: 160, bf: 0.41, mr: 70, br: 1.19, mb: 20, bb: 1.9, fl: 100, bfu: 1.12 },
      { me: 620, be: 0.38, mf: 85, bf: 0.41, mr: 0, br: 1.19, mb: 10, bb: 1.9, fl: 80, bfu: 1.12 },
      { me: 620, be: 0.38, mf: 180, bf: 0.41, mr: 150, br: 1.19, mb: 30, bb: 1.9, fl: 60, bfu: 1.12 },
      { me: 560, be: 0.42, mf: 150, bf: 0.45, mr: 0, br: 1.2, mb: 25, bb: 1.6, fl: 90, bfu: 0.95 },
      { me: 560, be: 0.42, mf: 140, bf: 0.45, mr: 80, br: 1.2, mb: 0, bb: 1.6, fl: 120, bfu: 0.95 },
      { me: 700, be: 0.9, mf: 170, bf: 0.95, mr: 160, br: 1.85, mb: 40, bb: 2.4, fl: 150, bfu: 1.22 },
      { me: 700, be: 0.9, mf: 90, bf: 0.95, mr: 0, br: 1.85, mb: 15, bb: 2.4, fl: 100, bfu: 1.22 },
      { me: 1100, be: 3.4, mf: 160, bf: 2.6, mr: 240, br: 3.5, mb: 50, bb: 4.2, fl: 300, bfu: 3.6 },
      { me: 620, be: 0.38, mf: 200, bf: 0.41, mr: 75, br: 1.19, mb: 40, bb: 1.9, fl: 110, bfu: 1.12 },
      { me: 480, be: 0.35, mf: 165, bf: 0.37, mr: 0, br: 1, mb: 15, bb: 1.25, fl: 70, bfu: 0.6 },
    ],
  },
  {
    id: 'vs-mass',
    group: 'masse',
    aircraft: 'avion',
    title: 'Vitesse de décrochage et masse',
    formula: 'Vs2 = Vs1 × √(m2 / m1)',
    vars: [['Vs1', 'vitesse de décrochage connue (kt)'], ['m1', 'masse correspondante (kg)'], ['m2', 'masse réelle (kg)']],
    inputs: [
      { k: 'vs1', label: 'Vs à la masse maximale', unit: 'kt', def: 52 },
      { k: 'm1', label: 'Masse maximale', unit: 'kg', def: 1100 },
      { k: 'm2', label: 'Masse réelle', unit: 'kg', def: 880 },
    ],
    calc: (v) => [
      { label: 'Vitesse de décrochage', value: v.vs1 * Math.sqrt(v.m2 / v.m1), unit: 'kt', d: 1 },
      { label: 'Approche à 1,3 × Vs', value: 1.3 * v.vs1 * Math.sqrt(v.m2 / v.m1), unit: 'kt', d: 0 },
    ],
    mini: 'Plus l’avion est lourd, plus il faut de portance, donc de vitesse : la vitesse de décrochage varie comme la racine carrée de la masse. 20 % de masse en moins → environ 10 % de vitesse en moins.',
    course: [
      'Au décrochage, Cz est maximal : poids = ½ ρ V² S Cz max. La vitesse de décrochage est donc proportionnelle à √(masse) : Vs2 = Vs1 × √(m2/m1).',
      'Les manuels donnent souvent les vitesses à la masse maximale. À masse plus faible, les vitesses de décrochage, d’approche (1,3 Vs) et de manœuvre diminuent.',
      'Approximation : une variation de masse de x % change la vitesse de décrochage d’environ x/2 %.',
      'Les vitesses de référence d’approche sont parfois corrigées de la masse sur les avions plus lourds ; sur un avion d’école, on garde en général les vitesses du manuel, plus sûres.',
    ],
    ask: (v) => `Vs = ${fr(v.vs1)} kt à ${fr(v.m1)} kg. Quelle est la vitesse de décrochage à ${fr(v.m2)} kg, et la vitesse d’approche à 1,3 Vs ?`,
    steps: (v) => {
      const k = Math.sqrt(v.m2 / v.m1);
      return [
        `Rapport des masses : ${fr(v.m2)} / ${fr(v.m1)} = ${fr(v.m2 / v.m1, 3)} → √ = ${fr(k, 3)}.`,
        `Vs2 = ${fr(v.vs1)} × ${fr(k, 3)} = ${fr(v.vs1 * k, 1)} kt.`,
        `1,3 × ${fr(v.vs1 * k, 1)} = ${fr(1.3 * v.vs1 * k)} kt.`,
      ];
    },
    ex: [
      { vs1: 52, m1: 1100, m2: 880 }, { vs1: 48, m1: 900, m2: 750 }, { vs1: 55, m1: 1150, m2: 1000 }, { vs1: 60, m1: 1500, m2: 1200 },
      { vs1: 45, m1: 750, m2: 600 }, { vs1: 50, m1: 1000, m2: 1000 }, { vs1: 64, m1: 1700, m2: 1350 }, { vs1: 42, m1: 600, m2: 480 },
      { vs1: 58, m1: 1300, m2: 950 }, { vs1: 110, m1: 70000, m2: 55000 },
    ],
  },

  // ===================== PERFORMANCES ET AÉRODYNAMIQUE =====================
  {
    id: 'takeoff',
    group: 'perfo',
    aircraft: 'avion',
    title: 'Distance de décollage corrigée',
    formula: 'TODR = D × (1 + 0,1 × Zp/1 000) × (1 + 0,1 × ΔISA/10) × f_surface × f_pente × 1,33',
    vars: [['D', 'distance du manuel au passage des 15 m (50 ft), niveau de la mer ISA (m)'], ['Zp', 'altitude pression du terrain (ft)'], ['ΔISA', 'écart ISA positif (°C)'], ['1,33', 'facteur de sécurité recommandé']],
    inputs: [
      { k: 'd', label: 'Distance du manuel (15 m)', unit: 'm', def: 450 },
      { k: 'zp', label: 'Altitude pression', unit: 'ft', def: 1500 },
      { k: 'disa', label: 'Écart ISA', unit: '°C', def: 15 },
      { k: 'surf', label: 'Surface', type: 'select', def: 'herbe', options: opts(SURFACES) },
      { k: 'pente', label: 'Pente', type: 'select', def: 'plat', options: opts(SLOPES) },
      { k: 'sec', label: 'Facteur de sécurité', type: 'select', def: 'oui', options: opts(SAFETY) },
    ],
    calc: (v) => {
      const f = toFactors(v);
      return [
        { label: 'Distance de décollage requise', value: v.d * f.total, unit: 'm', d: 0 },
        { label: 'Coefficient global', value: f.total, unit: '', d: 2 },
      ];
    },
    mini: 'Les distances du manuel sont mesurées dans des conditions idéales. On les majore : +10 % par 1 000 ft d’altitude, +10 % par 10 °C au-dessus de la norme, × 1,2 sur herbe sèche, × 1,3 sur herbe mouillée, × 1,1 en montée de 2 %, puis × 1,33 de sécurité.',
    course: [
      'Le manuel de vol donne la distance de décollage (jusqu’au passage d’un obstacle de 15 m / 50 ft) pour un avion neuf, un pilote d’essai, une piste en dur. La réalité est presque toujours moins favorable.',
      'Facteurs pratiques publiés par l’autorité britannique (CAA, Safety Sense Leaflet 7) et largement enseignés : +10 % par 1 000 ft d’altitude pression ; +10 % par 10 °C au-dessus de l’ISA ; herbe sèche courte × 1,2 ; herbe mouillée × 1,3 ; sol mou ou neige × 1,25 ou plus ; pente montante de 2 % × 1,1 ; vent arrière égal à 10 % de la vitesse de décollage × 1,2 ; masse +10 % → distance +20 %.',
      'Les facteurs se multiplient entre eux, puis on applique un facteur de sécurité recommandé de 1,33 au décollage (1,43 à l’atterrissage).',
      'Si l’abaque du manuel est déjà entré avec l’altitude pression et la température réelle, n’applique pas une seconde fois les facteurs d’altitude et de température : seulement ceux de surface, pente, vent et sécurité.',
      'Comparer la distance requise à la distance disponible (TODA de la carte VAC). Si elle dépasse, il faut réduire la masse, attendre des conditions plus fraîches ou renoncer.',
      'Ces règles ne remplacent pas le manuel de vol de ton avion, qui reste la référence.',
    ],
    ask: (v) => `Le manuel donne ${fr(v.d)} m au passage des 15 m (niveau de la mer, ISA, piste en dur). Terrain : Zp ${fr(v.zp)} ft, ISA ${v.disa >= 0 ? '+' : '−'}${fr(Math.abs(v.disa))} °C, ${SURFACES[v.surf].label.toLowerCase()}, ${SLOPES[v.pente].label.toLowerCase()}. Facteur de sécurité : ${v.sec === 'oui' ? 'oui' : 'non'}. Quelle distance de décollage prévoir ?`,
    steps: (v) => {
      const f = toFactors(v);
      return [
        `Altitude : 1 + 0,1 × ${fr(v.zp / 1000, 1)} = ${fr(f.alt, 3)}.`,
        `Température : 1 + 0,1 × ${fr(Math.max(v.disa, 0))}/10 = ${fr(f.temp, 3)}${v.disa < 0 ? ' (air plus froid que la norme : on ne retient pas de bonus)' : ''}.`,
        `Surface : × ${fr(f.surf, 2)} ; pente : × ${fr(f.pente, 2)} ; sécurité : × ${fr(f.sec, 2)}.`,
        `Coefficient global = ${fr(f.alt, 3)} × ${fr(f.temp, 3)} × ${fr(f.surf, 2)} × ${fr(f.pente, 2)} × ${fr(f.sec, 2)} = ${fr(f.total, 2)}.`,
        `Distance requise = ${fr(v.d)} × ${fr(f.total, 2)} = ${fr(v.d * f.total)} m.`,
      ];
    },
    ex: [
      { d: 450, zp: 1500, disa: 15, surf: 'herbe', pente: 'plat', sec: 'oui' },
      { d: 400, zp: 0, disa: 0, surf: 'dur', pente: 'plat', sec: 'oui' },
      { d: 520, zp: 2500, disa: 20, surf: 'herbe', pente: 'plat', sec: 'oui' },
      { d: 380, zp: 500, disa: 10, surf: 'herbem', pente: 'plat', sec: 'oui' },
      { d: 600, zp: 3000, disa: 10, surf: 'dur', pente: 'montee', sec: 'oui' },
      { d: 350, zp: 1000, disa: -5, surf: 'herbe', pente: 'montee', sec: 'oui' },
      { d: 480, zp: 4500, disa: 25, surf: 'dur', pente: 'plat', sec: 'oui' },
      { d: 420, zp: 200, disa: 18, surf: 'mou', pente: 'plat', sec: 'oui' },
      { d: 500, zp: 1800, disa: 12, surf: 'herbem', pente: 'montee', sec: 'oui' },
      { d: 450, zp: 1500, disa: 15, surf: 'herbe', pente: 'plat', sec: 'non' },
    ],
  },
  {
    id: 'lift',
    group: 'perfo',
    aircraft: 'both',
    title: 'Portance',
    formula: 'Fz = ½ × ρ × V² × S × Cz',
    vars: [['Fz', 'portance (N)'], ['ρ', 'masse volumique de l’air (kg/m³)'], ['V', 'vitesse propre (m/s)'], ['S', 'surface alaire (m²)'], ['Cz', 'coefficient de portance']],
    inputs: [
      { k: 'rho', label: 'Masse volumique ρ', unit: 'kg/m³', def: 1.225 },
      { k: 'v', label: 'Vitesse propre', unit: 'kt', def: 100 },
      { k: 's', label: 'Surface alaire', unit: 'm²', def: 14 },
      { k: 'cz', label: 'Coefficient Cz', unit: '', def: 0.4 },
    ],
    calc: (v) => {
      const V = v.v * KT_MS;
      const fz = 0.5 * v.rho * V * V * v.s * v.cz;
      return [
        { label: 'Portance', value: fz, unit: 'N', d: 0 },
        { label: 'Masse sustentée en palier', value: fz / G, unit: 'kg', d: 0 },
      ];
    },
    mini: 'La portance dépend de la densité de l’air, du carré de la vitesse, de la surface de l’aile et de l’angle d’incidence (via Cz). Doubler la vitesse quadruple la portance.',
    course: [
      'Fz = ½ ρ V² S Cz : ½ ρ V² est la pression dynamique (ce que mesure l’anémomètre), S la surface de référence de l’aile, Cz un coefficient sans unité qui dépend surtout de l’angle d’incidence et de la configuration (volets).',
      'En palier stabilisé, la portance égale le poids : Fz = m × g. Si la vitesse baisse, il faut augmenter Cz (cabrer, donc augmenter l’incidence) jusqu’au Cz max : c’est le décrochage.',
      'Les volets augmentent le Cz max : on peut voler plus lentement à l’approche.',
      'Effet de l’altitude : ρ diminue, il faut une vitesse vraie plus grande pour la même portance, mais la vitesse indiquée reste la même (l’anémomètre mesure ½ρV²).',
      'La même formule s’applique aux pales d’un rotor d’hélicoptère, avec la vitesse locale de chaque section de pale.',
    ],
    ask: (v) => `ρ = ${fr(v.rho, 3)} kg/m³, V = ${fr(v.v)} kt, S = ${fr(v.s, 1)} m², Cz = ${fr(v.cz, 2)}. Calcule la portance et la masse qu’elle peut soutenir en palier.`,
    steps: (v) => {
      const V = v.v * KT_MS;
      const fz = 0.5 * v.rho * V * V * v.s * v.cz;
      return [
        `V = ${fr(v.v)} × 0,5144 = ${fr(V, 1)} m/s.`,
        `Fz = 0,5 × ${fr(v.rho, 3)} × ${fr(V, 1)}² × ${fr(v.s, 1)} × ${fr(v.cz, 2)} = ${fr(fz)} N.`,
        `Masse sustentée = ${fr(fz)} / 9,81 = ${fr(fz / G)} kg.`,
      ];
    },
    ex: [
      { rho: 1.225, v: 100, s: 14, cz: 0.4 }, { rho: 1.225, v: 60, s: 14, cz: 1.2 }, { rho: 1.0, v: 110, s: 16, cz: 0.45 },
      { rho: 1.225, v: 80, s: 12, cz: 0.6 }, { rho: 0.9, v: 130, s: 16.2, cz: 0.35 }, { rho: 1.1, v: 90, s: 15, cz: 0.5 },
      { rho: 1.225, v: 50, s: 18, cz: 1.4 }, { rho: 0.74, v: 250, s: 122, cz: 0.5 }, { rho: 1.2, v: 120, s: 10, cz: 0.3 },
      { rho: 1.225, v: 70, s: 13, cz: 0.9 },
    ],
  },
  {
    id: 'glide',
    group: 'perfo',
    aircraft: 'both',
    title: 'Finesse et distance de plané',
    formula: 'Distance = finesse × hauteur\nPente = arctan(1 / finesse)',
    vars: [['finesse', 'rapport portance / traînée (f)'], ['hauteur', 'hauteur au-dessus du sol']],
    inputs: [
      { k: 'f', label: 'Finesse', unit: '', def: 9 },
      { k: 'h', label: 'Hauteur', unit: 'ft', def: 3000 },
    ],
    calc: (v) => {
      const dft = v.f * v.h;
      return [
        { label: 'Distance de plané', value: dft / NM_FT, unit: 'NM', d: 1 },
        { label: 'Distance de plané', value: (dft * 0.3048) / 1000, unit: 'km', d: 1 },
        { label: 'Angle de plané', value: deg(Math.atan(1 / v.f)), unit: '°', d: 1 },
      ];
    },
    mini: 'Moteur arrêté, un avion parcourt « finesse × hauteur ». Avec une finesse de 9, 3 000 ft de hauteur donnent environ 4,4 NM (8 km) par vent nul. En hélicoptère, l’autorotation a une finesse de 3 à 5.',
    course: [
      'La finesse f = Fz / Fx (portance sur traînée) est aussi le rapport distance parcourue / hauteur perdue en vol plané. Avion léger : 8 à 10 ; planeur : 30 à 60 ; hélicoptère en autorotation : environ 3 à 5.',
      'Distance = f × hauteur (dans la même unité). En NM : f × H(ft) / 6 076. Règle mentale pour f = 9 : environ 1,5 NM par 1 000 ft.',
      'La finesse maximale est obtenue à une vitesse précise (vitesse de finesse max, dans le manuel). Voler plus vite ou plus lentement réduit la distance.',
      'Le vent modifie la distance au sol : vent de face, distance réduite ; vent arrière, distance augmentée. On choisit un terrain de dégagement de préférence face au vent mais bien à portée.',
      'Application : choisir un champ en cas de panne moteur, ou décider d’une altitude de croisière suffisante au-dessus d’une zone sans terrain.',
    ],
    ask: (v) => `Panne moteur à ${fr(v.h)} ft sol. Finesse de l’appareil : ${fr(v.f, 1)}. Quelle distance peut-on parcourir par vent nul, et sous quel angle de plané ?`,
    steps: (v) => {
      const dft = v.f * v.h;
      return [
        `Distance = ${fr(v.f, 1)} × ${fr(v.h)} = ${fr(dft)} ft.`,
        `En NM : ${fr(dft)} / 6 076 = ${fr(dft / NM_FT, 1)} NM ; en km : ${fr((dft * 0.3048) / 1000, 1)} km.`,
        `Angle = arctan(1 / ${fr(v.f, 1)}) = ${fr(deg(Math.atan(1 / v.f)), 1)}°.`,
      ];
    },
    ex: [
      { f: 9, h: 3000 }, { f: 8, h: 2000 }, { f: 10, h: 4500 }, { f: 4, h: 1500 }, { f: 35, h: 3000 },
      { f: 9, h: 1000 }, { f: 12, h: 6000 }, { f: 3.5, h: 800 }, { f: 17, h: 35000 }, { f: 7, h: 2500 },
    ],
  },

  // ===================== HÉLICOPTÈRE =====================
  {
    id: 'rotor-tip',
    group: 'helico',
    aircraft: 'helico',
    title: 'Vitesse en bout de pale et avance réduite',
    formula: 'V_bout = 2π × R × N / 60\nPale avançante = V_bout + V · reculante = V_bout − V\nμ = V / V_bout',
    vars: [['R', 'rayon du rotor (m)'], ['N', 'régime rotor (tr/min)'], ['V', 'vitesse d’avancement (m/s)'], ['μ', 'paramètre d’avancement (avance réduite)']],
    inputs: [
      { k: 'r', label: 'Rayon du rotor', unit: 'm', def: 5.35 },
      { k: 'n', label: 'Régime rotor', unit: 'tr/min', def: 390 },
      { k: 'v', label: 'Vitesse d’avancement', unit: 'kt', def: 120 },
    ],
    calc: (v) => {
      const tip = (2 * Math.PI * v.r * v.n) / 60;
      const V = v.v * KT_MS;
      return [
        { label: 'Vitesse en bout de pale', value: tip, unit: 'm/s', d: 0 },
        { label: 'Pale avançante', value: tip + V, unit: 'm/s', d: 0 },
        { label: 'Pale reculante', value: tip - V, unit: 'm/s', d: 0 },
        { label: 'Mach pale avançante (15 °C)', value: (tip + V) / 340.3, unit: '', d: 2 },
        { label: 'Avance réduite μ', value: V / tip, unit: '', d: 2 },
      ];
    },
    mini: 'En translation, la pale qui avance cumule sa vitesse de rotation et la vitesse de l’hélicoptère, celle qui recule les soustrait. Cette dissymétrie limite la vitesse maximale : compressibilité côté avançant, décrochage côté reculant.',
    course: [
      'Vitesse en bout de pale en stationnaire : V_bout = ω × R = 2π × R × N / 60. Sur un hélicoptère léger, elle est de l’ordre de 200 à 220 m/s.',
      'En translation à la vitesse V : la pale avançante voit V_bout + V, la pale reculante V_bout − V. C’est la dissymétrie de portance, compensée par le battement des pales et la commande cyclique.',
      'Limites : quand la pale avançante approche Mach 0,85 à 0,9, les effets de compressibilité apparaissent (vibrations, traînée) ; quand la pale reculante doit trop augmenter son incidence, elle décroche (décrochage de pale reculante). Ces deux phénomènes fixent la VNE de l’hélicoptère.',
      'L’avance réduite μ = V / V_bout résume la situation : la plupart des hélicoptères conventionnels sont limités vers μ ≈ 0,35 à 0,4.',
      'La VNE diminue avec l’altitude et la température (vitesse du son plus faible, air moins dense) : les manuels donnent un tableau de VNE en fonction de Zp et de la température.',
    ],
    ask: (v) => `Rotor de ${fr(v.r, 2)} m de rayon tournant à ${fr(v.n)} tr/min, vitesse ${fr(v.v)} kt. Calcule la vitesse en bout de pale, les vitesses des pales avançante et reculante, le Mach de la pale avançante et l’avance réduite.`,
    steps: (v) => {
      const tip = (2 * Math.PI * v.r * v.n) / 60;
      const V = v.v * KT_MS;
      return [
        `V_bout = 2π × ${fr(v.r, 2)} × ${fr(v.n)} / 60 = ${fr(tip)} m/s.`,
        `V = ${fr(v.v)} kt × 0,5144 = ${fr(V, 1)} m/s.`,
        `Avançante : ${fr(tip)} + ${fr(V, 1)} = ${fr(tip + V)} m/s (Mach ${fr((tip + V) / 340.3, 2)} à 15 °C) ; reculante : ${fr(tip)} − ${fr(V, 1)} = ${fr(tip - V)} m/s.`,
        `μ = ${fr(V, 1)} / ${fr(tip)} = ${fr(V / tip, 2)}.`,
      ];
    },
    ex: [
      { r: 5.35, n: 390, v: 120 }, { r: 3.85, n: 530, v: 90 }, { r: 5.1, n: 395, v: 110 }, { r: 7.5, n: 260, v: 140 }, { r: 4.4, n: 470, v: 100 },
      { r: 5.35, n: 390, v: 0 }, { r: 8.15, n: 260, v: 150 }, { r: 3.6, n: 560, v: 75 }, { r: 6.0, n: 340, v: 130 }, { r: 10.0, n: 205, v: 155 },
    ],
  },
  {
    id: 'disk-load',
    group: 'helico',
    aircraft: 'helico',
    title: 'Charge du disque et puissance induite en stationnaire',
    formula: 'Charge du disque = m / (π R²)\nv_i = √(m g / (2 ρ π R²)) · P_i = m g × v_i',
    vars: [['m', 'masse (kg)'], ['R', 'rayon du rotor (m)'], ['ρ', 'masse volumique de l’air (kg/m³)'], ['v_i', 'vitesse induite (m/s)'], ['P_i', 'puissance induite idéale (W)']],
    inputs: [
      { k: 'm', label: 'Masse', unit: 'kg', def: 2250 },
      { k: 'r', label: 'Rayon du rotor', unit: 'm', def: 5.35 },
      { k: 'rho', label: 'Masse volumique ρ', unit: 'kg/m³', def: 1.225 },
    ],
    calc: (v) => {
      const a = Math.PI * v.r * v.r;
      const t = v.m * G;
      const vi = Math.sqrt(t / (2 * v.rho * a));
      return [
        { label: 'Puissance induite idéale', value: (t * vi) / 1000, unit: 'kW', d: 0 },
        { label: 'Charge du disque', value: v.m / a, unit: 'kg/m²', d: 1 },
        { label: 'Vitesse induite', value: vi, unit: 'm/s', d: 1 },
        { label: 'Puissance induite', value: (t * vi) / 735.5, unit: 'ch', d: 0 },
      ];
    },
    mini: 'Pour tenir en stationnaire, le rotor accélère de l’air vers le bas. Plus le disque est petit pour une masse donnée (forte charge du disque), ou plus l’air est léger, plus il faut de puissance.',
    course: [
      'Théorie de la quantité de mouvement (Froude) : en stationnaire, la poussée du rotor T = m g est obtenue en accélérant l’air à travers le disque à la vitesse induite v_i = √(T / (2 ρ A)), avec A = π R².',
      'Puissance induite idéale P_i = T × v_i. Elle croît comme T^1,5 et comme 1/√ρ : 10 % de masse en plus demande environ 15 % de puissance en plus ; en altitude ou par forte chaleur (ρ faible), il en faut davantage.',
      'La puissance réelle est plus élevée : il faut ajouter la traînée de profil des pales, le rotor anticouple et la transmission. Le rapport puissance idéale / puissance réelle (facteur de mérite) est d’environ 0,6 à 0,75.',
      'Charge du disque = m / A : de l’ordre de 15 à 40 kg/m² pour les hélicoptères légers et moyens. Une forte charge du disque donne un souffle rotor plus violent et une moins bonne efficacité en stationnaire.',
      'C’est pourquoi les abaques HIGE/HOGE (stationnaire dans et hors effet de sol) limitent la masse en fonction de l’altitude pression et de la température.',
    ],
    ask: (v) => `Hélicoptère de ${fr(v.m)} kg, rotor de ${fr(v.r, 2)} m de rayon, ρ = ${fr(v.rho, 3)} kg/m³. Calcule la charge du disque, la vitesse induite et la puissance induite idéale en stationnaire.`,
    steps: (v) => {
      const a = Math.PI * v.r * v.r;
      const t = v.m * G;
      const vi = Math.sqrt(t / (2 * v.rho * a));
      return [
        `A = π × ${fr(v.r, 2)}² = ${fr(a, 1)} m² ; charge du disque = ${fr(v.m)} / ${fr(a, 1)} = ${fr(v.m / a, 1)} kg/m².`,
        `T = ${fr(v.m)} × 9,81 = ${fr(t)} N.`,
        `v_i = √(${fr(t)} / (2 × ${fr(v.rho, 3)} × ${fr(a, 1)})) = ${fr(vi, 1)} m/s.`,
        `P_i = ${fr(t)} × ${fr(vi, 1)} = ${fr(t * vi)} W = ${fr((t * vi) / 1000)} kW (${fr((t * vi) / 735.5)} ch), avant pertes.`,
      ];
    },
    ex: [
      { m: 2250, r: 5.35, rho: 1.225 }, { m: 620, r: 3.85, rho: 1.225 }, { m: 1450, r: 5.1, rho: 1.225 }, { m: 2250, r: 5.35, rho: 1.0 },
      { m: 2900, r: 5.1, rho: 1.225 }, { m: 900, r: 4.4, rho: 1.1 }, { m: 5000, r: 7.8, rho: 1.225 }, { m: 1450, r: 5.1, rho: 0.95 },
      { m: 3700, r: 6.0, rho: 1.15 }, { m: 11000, r: 8.15, rho: 1.225 },
    ],
  },
];

function wbItems(v) {
  return [
    { n: 'Masse à vide', m: v.me, b: v.be },
    { n: 'Avant', m: v.mf, b: v.bf },
    { n: 'Arrière', m: v.mr, b: v.br },
    { n: 'Bagages', m: v.mb, b: v.bb },
    { n: 'Carburant', m: v.fl * AVGAS, b: v.bfu },
  ];
}

function toFactors(v) {
  const alt = 1 + (0.1 * v.zp) / 1000;
  const temp = 1 + (0.1 * Math.max(v.disa, 0)) / 10;
  const surf = SURFACES[v.surf].f;
  const pente = SLOPES[v.pente].f;
  const sec = SAFETY[v.sec].f;
  return { alt, temp, surf, pente, sec, total: alt * temp * surf * pente * sec };
}
