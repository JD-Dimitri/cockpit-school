/**
 * Formules aviation — partie 1 : unités, atmosphère et altimétrie, vitesses.
 *
 * Chaque formule fournit :
 *  - inputs   : champs du calculateur (k = clé, def = valeur par défaut)
 *  - calc(v)  : résultats [{ label, value, unit, d (décimales), text? }] — le 1er est le résultat principal
 *  - mini     : mini-cours (version COURS)
 *  - course   : cours développé de l'annexe
 *  - ask(v)   : énoncé d'un exercice construit à partir des valeurs v
 *  - steps(v) : correction détaillée, calculée avec les mêmes fonctions que le calculateur
 *  - ex       : 10 jeux de valeurs = les 10 exercices corrigés de l'annexe
 */
import { airDensity, fr, hmin, isaPressure, isaTemp, sg } from './helpers.js';

const FUELS = {
  avgas: { label: 'AVGAS 100LL', d: 0.72 },
  jet: { label: 'JET A-1 (kérosène)', d: 0.8 },
};

export const BASE_FORMULAS = [
  // ===================== UNITÉS =====================
  {
    id: 'kt-kmh',
    group: 'unites',
    aircraft: 'both',
    title: 'Nœuds en km/h et m/s',
    formula: 'V(km/h) = V(kt) × 1,852\nV(m/s) = V(kt) × 0,514',
    vars: [['kt', 'nœud = 1 mille nautique par heure']],
    inputs: [{ k: 'kt', label: 'Vitesse', unit: 'kt', def: 100 }],
    calc: (v) => [
      { label: 'Vitesse', value: v.kt * 1.852, unit: 'km/h', d: 1 },
      { label: 'Vitesse', value: (v.kt * 1852) / 3600, unit: 'm/s', d: 1 },
      { label: 'Calcul mental (×2 − 10 %)', value: v.kt * 1.8, unit: 'km/h', d: 0 },
    ],
    mini: 'En aviation, les vitesses sont en nœuds (kt). Un nœud vaut un mille nautique (1 852 m) par heure. Pour passer en km/h, on multiplie par 1,852 ; de tête : on double puis on retire 10 %.',
    course: [
      'Le mille nautique (NM) n’est pas une unité arbitraire : c’est la longueur d’une minute d’arc de latitude sur la Terre, soit 1 852 m. C’est pour cela que la navigation aérienne et maritime l’utilise : sur une carte, 1° de latitude = 60 NM, ce qui rend les mesures de distance très simples avec l’échelle des latitudes.',
      'Le nœud (kt) est une vitesse : 1 kt = 1 NM/h = 1,852 km/h = 0,514 m/s. Toutes les vitesses du manuel de vol (vitesse de décrochage, de montée, de croisière) et toutes les informations de vent sont données en nœuds.',
      'Conversion inverse : V(kt) = V(km/h) ÷ 1,852. De tête : km/h ÷ 2 puis + 10 % (ex. 200 km/h → 100 + 10 = 110 kt ; valeur exacte 108 kt).',
      'Le m/s sert surtout en aérodynamique (calcul de portance, de rayon de virage) car les formules physiques exigent des unités du Système international.',
      'Piège : certains anémomètres d’ULM ou de planeurs sont gradués en km/h. Vérifie toujours l’unité de l’instrument avant d’appliquer une vitesse du manuel.',
    ],
    ask: (v) => `Convertis ${fr(v.kt)} kt en km/h et en m/s, puis vérifie par le calcul mental.`,
    steps: (v) => [
      `1 kt = 1,852 km/h, donc ${fr(v.kt)} × 1,852 = ${fr(v.kt * 1.852, 1)} km/h.`,
      `En m/s : ${fr(v.kt * 1.852, 1)} ÷ 3,6 = ${fr((v.kt * 1852) / 3600, 1)} m/s.`,
      `Calcul mental : ${fr(v.kt)} × 2 = ${fr(v.kt * 2)}, moins 10 % → ${fr(v.kt * 1.8)} km/h (proche du résultat exact).`,
    ],
    ex: [{ kt: 90 }, { kt: 120 }, { kt: 65 }, { kt: 140 }, { kt: 250 }, { kt: 45 }, { kt: 110 }, { kt: 160 }, { kt: 75 }, { kt: 480 }],
  },
  {
    id: 'ft-m',
    group: 'unites',
    aircraft: 'both',
    title: 'Pieds en mètres',
    formula: 'Z(m) = Z(ft) × 0,3048',
    vars: [['ft', 'pied (foot)'], ['m', 'mètre']],
    inputs: [{ k: 'ft', label: 'Altitude ou hauteur', unit: 'ft', def: 3500 }],
    calc: (v) => [
      { label: 'Altitude', value: v.ft * 0.3048, unit: 'm', d: 0 },
      { label: 'Calcul mental (× 0,3)', value: v.ft * 0.3, unit: 'm', d: 0 },
    ],
    mini: 'Les altitudes et hauteurs se donnent en pieds (ft). 1 ft = 0,3048 m. De tête, on multiplie par 0,3 ; en sens inverse, mètres × 3,3 = pieds.',
    course: [
      'L’aviation internationale (OACI) utilise le pied pour les altitudes, hauteurs et niveaux de vol. Un niveau de vol (FL) est une altitude pression exprimée en centaines de pieds : FL 65 = 6 500 ft au calage 1013.',
      'Conversion : 1 ft = 0,3048 m et 1 m = 3,28 ft. De tête : ft × 0,3 (ou ÷ 3 + 10 %) donne les mètres ; m × 3,3 donne les pieds.',
      'Les cartes aéronautiques françaises (VAC, 1/500 000) donnent l’altitude des terrains et des obstacles en pieds, mais certains documents topographiques sont en mètres : convertir sans se tromper évite de sous-estimer un relief.',
      'Les visibilités et distances de piste restent en mètres, les distances de navigation en NM, les altitudes en ft : un même vol mélange donc trois unités de longueur.',
      'Piège : 3 000 m ne valent pas 3 000 ft ! 3 000 m ≈ 9 840 ft. Une confusion entre les deux peut amener sous la hauteur de sécurité d’un relief.',
    ],
    ask: (v) => `Une hauteur ou altitude vaut ${fr(v.ft)} ft. Exprime-la en mètres, exactement puis de tête.`,
    steps: (v) => [
      `1 ft = 0,3048 m, donc ${fr(v.ft)} × 0,3048 = ${fr(v.ft * 0.3048)} m.`,
      `De tête : ${fr(v.ft)} × 0,3 = ${fr(v.ft * 0.3)} m (écart d’environ 1,6 %).`,
    ],
    ex: [{ ft: 1000 }, { ft: 1500 }, { ft: 5500 }, { ft: 9500 }, { ft: 12000 }, { ft: 2500 }, { ft: 800 }, { ft: 4500 }, { ft: 18000 }, { ft: 35000 }],
  },
  {
    id: 'nm-km',
    group: 'unites',
    aircraft: 'both',
    title: 'Milles nautiques en kilomètres',
    formula: 'D(km) = D(NM) × 1,852',
    vars: [['NM', 'mille nautique = 1 852 m'], ['mi', 'mille terrestre = 1 609 m']],
    inputs: [{ k: 'nm', label: 'Distance', unit: 'NM', def: 45 }],
    calc: (v) => [
      { label: 'Distance', value: v.nm * 1.852, unit: 'km', d: 1 },
      { label: 'Distance', value: v.nm * 1.15078, unit: 'mi (terrestres)', d: 1 },
    ],
    mini: 'Les distances de navigation sont en milles nautiques (NM). 1 NM = 1,852 km. Ne pas confondre avec le mille terrestre américain (1,609 km).',
    course: [
      '1 NM = 1 852 m = une minute d’arc de latitude. Sur une carte, on mesure donc une distance en la reportant sur l’échelle des latitudes (graduations du bord gauche ou droit) : 1′ = 1 NM, 1° = 60 NM.',
      'Conversion : km = NM × 1,852 ; NM = km ÷ 1,852 (de tête : km ÷ 2 + 8 %).',
      'Le mille terrestre (statute mile, 1 609 m) apparaît dans certains manuels américains (visibilité, vitesses en mph). 1 NM = 1,151 mi.',
      'Une vitesse en kt multipliée par un temps en heures donne directement des NM : c’est tout l’intérêt du système NM/kt.',
    ],
    ask: (v) => `La distance entre deux points tournants est de ${fr(v.nm)} NM. Quelle est-elle en km et en milles terrestres ?`,
    steps: (v) => [
      `${fr(v.nm)} × 1,852 = ${fr(v.nm * 1.852, 1)} km.`,
      `${fr(v.nm)} × 1,151 = ${fr(v.nm * 1.15078, 1)} mi.`,
    ],
    ex: [{ nm: 10 }, { nm: 25 }, { nm: 60 }, { nm: 120 }, { nm: 7 }, { nm: 33 }, { nm: 85 }, { nm: 150 }, { nm: 18 }, { nm: 300 }],
  },
  {
    id: 'fuel-mass',
    group: 'unites',
    aircraft: 'both',
    title: 'Carburant : volume en masse',
    formula: 'm(kg) = V(L) × d\nAVGAS d ≈ 0,72 · JET A-1 d ≈ 0,80',
    vars: [['V', 'volume en litres'], ['d', 'densité du carburant (kg/L)'], ['m', 'masse en kg']],
    inputs: [
      { k: 'l', label: 'Volume', unit: 'L', def: 110 },
      { k: 'fuel', label: 'Carburant', type: 'select', def: 'avgas', options: Object.entries(FUELS).map(([value, f]) => ({ value, label: f.label })) },
    ],
    calc: (v) => {
      const d = FUELS[v.fuel].d;
      return [
        { label: 'Masse', value: v.l * d, unit: 'kg', d: 1 },
        { label: 'Volume', value: v.l / 3.78541, unit: 'US gal', d: 1 },
        { label: 'Masse', value: v.l * d * 2.20462, unit: 'lb', d: 0 },
      ];
    },
    mini: 'On remplit les réservoirs en litres, mais le devis de masse se fait en kilogrammes. Masse = volume × densité : 0,72 pour l’AVGAS, 0,80 pour le JET A-1.',
    course: [
      'La densité d’un carburant est la masse d’un litre. Elle varie un peu avec la température (le carburant se dilate à la chaleur) : on retient 0,72 kg/L pour l’AVGAS 100LL et 0,80 kg/L pour le JET A-1, valeurs utilisées dans la plupart des manuels.',
      'Cette conversion est indispensable pour le calcul de masse et centrage : 100 L d’AVGAS pèsent 72 kg, l’équivalent d’un passager.',
      'Sur les avions américains, les réservoirs sont en US gallons (1 US gal = 3,785 L) et les masses en livres (1 kg = 2,205 lb).',
      'Les hélicoptères à turbine (Écureuil, EC135…) et les avions à turboréacteur utilisent du JET A-1, plus dense : à volume égal, il pèse 11 % de plus que l’AVGAS.',
      'Piège : ne jamais mettre de JET A-1 dans un moteur à pistons conçu pour l’AVGAS (et inversement) : risque de panne moteur. La couleur et l’étiquetage des pompes permettent de les distinguer.',
    ],
    ask: (v) => `On embarque ${fr(v.l)} L de ${FUELS[v.fuel].label}. Quelle masse représente ce carburant (kg et lb) et combien de US gallons ?`,
    steps: (v) => {
      const d = FUELS[v.fuel].d;
      return [
        `Densité du ${FUELS[v.fuel].label} : ${fr(d, 2)} kg/L.`,
        `Masse = ${fr(v.l)} × ${fr(d, 2)} = ${fr(v.l * d, 1)} kg.`,
        `En livres : ${fr(v.l * d, 1)} × 2,205 = ${fr(v.l * d * 2.20462)} lb.`,
        `En US gallons : ${fr(v.l)} ÷ 3,785 = ${fr(v.l / 3.78541, 1)} US gal.`,
      ];
    },
    ex: [
      { l: 110, fuel: 'avgas' }, { l: 50, fuel: 'avgas' }, { l: 160, fuel: 'avgas' }, { l: 400, fuel: 'jet' }, { l: 75, fuel: 'avgas' },
      { l: 540, fuel: 'jet' }, { l: 200, fuel: 'avgas' }, { l: 1000, fuel: 'jet' }, { l: 37, fuel: 'avgas' }, { l: 250, fuel: 'jet' },
    ],
  },
  {
    id: 'hpa-inhg',
    group: 'unites',
    aircraft: 'both',
    title: 'Pression : hPa en inHg',
    formula: 'P(inHg) = P(hPa) × 0,02953',
    vars: [['hPa', 'hectopascal (= millibar)'], ['inHg', 'pouce de mercure (Amérique du Nord)']],
    inputs: [{ k: 'hpa', label: 'Pression', unit: 'hPa', def: 1013 }],
    calc: (v) => [{ label: 'Pression', value: v.hpa * 0.02953, unit: 'inHg', d: 2 }],
    mini: 'En Europe, les calages altimétriques sont en hectopascals ; en Amérique du Nord, en pouces de mercure. 1013,25 hPa = 29,92 inHg.',
    course: [
      'L’altimètre mesure la pression atmosphérique. Le calage (QNH, QFE, standard) se règle dans une petite fenêtre, graduée en hPa, en inHg, ou les deux.',
      'Valeurs à connaître : pression standard = 1013,25 hPa = 29,92 inHg. 1 inHg = 33,86 hPa.',
      'Un simulateur ou un avion américain peut n’afficher que des inHg : savoir convertir permet de régler correctement le QNH donné par la tour en hPa.',
      'Piège : une erreur de calage de 10 hPa fausse l’altitude affichée d’environ 280 ft. Un calage trop élevé fait afficher une altitude trop haute : on vole plus bas qu’on le croit.',
    ],
    ask: (v) => `La tour annonce un QNH de ${fr(v.hpa)} hPa. Quel calage afficher sur un altimètre gradué en inHg ?`,
    steps: (v) => [`${fr(v.hpa)} × 0,02953 = ${fr(v.hpa * 0.02953, 2)} inHg.`],
    ex: [{ hpa: 1013 }, { hpa: 1020 }, { hpa: 998 }, { hpa: 1005 }, { hpa: 1030 }, { hpa: 985 }, { hpa: 1017 }, { hpa: 1009 }, { hpa: 1025 }, { hpa: 992 }],
  },

  // ===================== ATMOSPHÈRE ET ALTIMÉTRIE =====================
  {
    id: 'isa',
    group: 'atmo',
    aircraft: 'both',
    title: 'Température standard (ISA) et écart ISA',
    formula: 'T_ISA = 15 − 1,98 × Z / 1 000\nΔISA = T_mesurée − T_ISA',
    vars: [['T_ISA', 'température standard à l’altitude Z (°C)'], ['Z', 'altitude pression (ft)'], ['ΔISA', 'écart à l’atmosphère standard']],
    inputs: [
      { k: 'z', label: 'Altitude pression', unit: 'ft', def: 5000 },
      { k: 'oat', label: 'Température extérieure', unit: '°C', def: 10 },
    ],
    calc: (v) => {
      const t = isaTemp(v.z);
      return [
        { label: 'Température ISA', value: t, unit: '°C', d: 1 },
        { label: 'Écart ISA', value: v.oat - t, unit: '°C', d: 1, text: `ISA ${sg(v.oat - t, 1)} °C` },
      ];
    },
    mini: 'L’atmosphère standard (ISA) sert de référence : 15 °C au niveau de la mer, puis la température baisse d’environ 2 °C tous les 1 000 ft. L’écart ISA dit si l’air est plus chaud ou plus froid que la norme.',
    course: [
      'L’atmosphère type OACI (ISA) est un modèle : au niveau de la mer, 1013,25 hPa et 15 °C ; la température décroît de 1,98 °C par 1 000 ft (6,5 °C par km) jusqu’à 36 090 ft, puis reste à −56,5 °C.',
      'Les instruments (altimètre, anémomètre) et les tableaux de performances des manuels sont établis dans cette atmosphère. Dès que la réalité s’en écarte, il faut corriger.',
      'Écart ISA = température réelle − température ISA à la même altitude. On l’écrit « ISA +10 » si l’air est 10 °C plus chaud que la norme.',
      'Air chaud (ISA positif) : air moins dense, performances dégradées (décollage plus long, montée plus faible). Air froid (ISA négatif) : meilleures performances, mais l’altimètre surestime l’altitude.',
      'De tête, on arrondit à 2 °C par 1 000 ft : à 5 000 ft, T_ISA ≈ 15 − 10 = 5 °C.',
    ],
    ask: (v) => `À l’altitude pression ${fr(v.z)} ft, on mesure ${fr(v.oat)} °C. Quelle est la température ISA et quel est l’écart ISA ?`,
    steps: (v) => {
      const t = isaTemp(v.z);
      return [
        `T_ISA = 15 − 1,98 × ${fr(v.z)} / 1 000 = 15 − ${fr((1.98 * v.z) / 1000, 1)} = ${fr(t, 1)} °C.`,
        `ΔISA = ${fr(v.oat)} − (${fr(t, 1)}) = ${sg(v.oat - t, 1)} °C, soit ISA ${sg(v.oat - t, 1)}.`,
        v.oat - t > 0 ? 'L’air est plus chaud que la norme : performances dégradées.' : 'L’air est plus froid que la norme : attention, l’altimètre surestime l’altitude.',
      ];
    },
    ex: [
      { z: 0, oat: 25 }, { z: 3000, oat: 15 }, { z: 6000, oat: -5 }, { z: 10000, oat: -15 }, { z: 2000, oat: 30 },
      { z: 8500, oat: 0 }, { z: 1500, oat: 5 }, { z: 12000, oat: -20 }, { z: 4500, oat: 12 }, { z: 35000, oat: -50 },
    ],
  },
  {
    id: 'zp',
    group: 'atmo',
    aircraft: 'both',
    title: 'Altitude pression (Zp)',
    formula: 'Zp = Z + (1013 − QNH) × 28',
    vars: [['Zp', 'altitude pression (ft)'], ['Z', 'altitude du terrain ou altitude lue au QNH (ft)'], ['QNH', 'calage local (hPa)'], ['28', 'ft par hPa près du sol']],
    inputs: [
      { k: 'z', label: 'Altitude (terrain ou QNH)', unit: 'ft', def: 1200 },
      { k: 'qnh', label: 'QNH', unit: 'hPa', def: 1003 },
    ],
    calc: (v) => {
      const zp = v.z + (1013 - v.qnh) * 28;
      return [
        { label: 'Altitude pression', value: zp, unit: 'ft', d: 0 },
        { label: 'Correction', value: (1013 - v.qnh) * 28, unit: 'ft', d: 0, text: `${sg((1013 - v.qnh) * 28)} ft` },
      ];
    },
    mini: 'L’altitude pression est ce qu’indiquerait l’altimètre calé sur 1013. On l’obtient en ajoutant à l’altitude 28 ft par hPa d’écart entre 1013 et le QNH. Elle sert aux niveaux de vol et aux tableaux de performances.',
    course: [
      'Près du sol, la pression diminue d’environ 1 hPa tous les 27 à 30 ft. En France, on retient la valeur pratique 1 hPa = 28 ft.',
      'Calé au QNH, l’altimètre donne l’altitude (au-dessus du niveau moyen de la mer). Calé sur 1013, il donne l’altitude pression Zp, utilisée pour les niveaux de vol (FL) au-dessus de l’altitude de transition.',
      'Formule : Zp = Z + (1013 − QNH) × 28. Si le QNH est bas (dépression), Zp est plus grande que Z ; si le QNH est haut (anticyclone), Zp est plus petite.',
      'Usage principal : les abaques de décollage et d’atterrissage des manuels d’avion et d’hélicoptère sont entrés avec l’altitude pression du terrain, pas avec son altitude topographique.',
      'Moyen mnémotechnique : « du haut vers le bas, attention en bas » : en passant d’une haute pression vers une basse pression sans recaler, l’altimètre surestime l’altitude.',
    ],
    ask: (v) => `Un terrain est à ${fr(v.z)} ft d’altitude, le QNH est ${fr(v.qnh)} hPa. Calcule l’altitude pression du terrain.`,
    steps: (v) => {
      const c = (1013 - v.qnh) * 28;
      return [
        `Écart de pression : 1013 − ${fr(v.qnh)} = ${sg(1013 - v.qnh)} hPa.`,
        `Correction : ${sg(1013 - v.qnh)} × 28 = ${sg(c)} ft.`,
        `Zp = ${fr(v.z)} ${c >= 0 ? '+' : '−'} ${fr(Math.abs(c))} = ${fr(v.z + c)} ft.`,
      ];
    },
    ex: [
      { z: 0, qnh: 1000 }, { z: 500, qnh: 1020 }, { z: 1200, qnh: 1003 }, { z: 2300, qnh: 995 }, { z: 350, qnh: 1013 },
      { z: 5400, qnh: 1008 }, { z: 1800, qnh: 1027 }, { z: 150, qnh: 990 }, { z: 3000, qnh: 1018 }, { z: 6000, qnh: 1001 },
    ],
  },
  {
    id: 'zd',
    group: 'atmo',
    aircraft: 'both',
    title: 'Altitude densité (Zd)',
    formula: 'Zd = Zp + 120 × (T − T_ISA)',
    vars: [['Zd', 'altitude densité (ft)'], ['Zp', 'altitude pression (ft)'], ['T', 'température réelle (°C)'], ['T_ISA', 'température standard à Zp']],
    inputs: [
      { k: 'zp', label: 'Altitude pression', unit: 'ft', def: 2000 },
      { k: 'oat', label: 'Température', unit: '°C', def: 30 },
    ],
    calc: (v) => {
      const t = isaTemp(v.zp);
      return [
        { label: 'Altitude densité', value: v.zp + 120 * (v.oat - t), unit: 'ft', d: 0 },
        { label: 'Température ISA', value: t, unit: '°C', d: 1 },
      ];
    },
    mini: 'L’altitude densité est l’altitude « ressentie » par le moteur, l’hélice, les ailes et le rotor. Chaque degré au-dessus de la norme ajoute environ 120 ft. Par forte chaleur, un terrain à 2 000 ft peut se comporter comme s’il était à plus de 4 000 ft.',
    course: [
      'Les performances dépendent de la masse volumique de l’air (sa densité), pas de l’altitude affichée. L’altitude densité est l’altitude, en atmosphère standard, où l’on trouverait la même densité.',
      'Formule pratique : Zd = Zp + 120 × (T − T_ISA). Il faut d’abord calculer l’altitude pression (QNH) puis la température ISA à cette altitude.',
      'Effets d’une Zd élevée : puissance moteur réduite (moins d’oxygène), traction de l’hélice réduite, portance réduite à vitesse indiquée égale en vitesse vraie plus grande, donc décollage plus long et montée plus faible.',
      'Pour un hélicoptère, l’altitude densité limite directement la masse maximale en stationnaire (abaques HIGE/HOGE : dans et hors effet de sol).',
      'Cas typique : « hot and high », terrain de montagne en été. Une Zd de 6 000 ft peut doubler la distance de décollage d’un avion léger.',
    ],
    ask: (v) => `Terrain d’altitude pression ${fr(v.zp)} ft, température ${fr(v.oat)} °C. Calcule l’altitude densité.`,
    steps: (v) => {
      const t = isaTemp(v.zp);
      const zd = v.zp + 120 * (v.oat - t);
      return [
        `T_ISA à ${fr(v.zp)} ft = 15 − 1,98 × ${fr(v.zp / 1000, 1)} = ${fr(t, 1)} °C.`,
        `Écart : ${fr(v.oat)} − ${fr(t, 1)} = ${sg(v.oat - t, 1)} °C.`,
        `Zd = ${fr(v.zp)} + 120 × (${sg(v.oat - t, 1)}) = ${fr(zd)} ft.`,
      ];
    },
    ex: [
      { zp: 0, oat: 35 }, { zp: 1000, oat: 25 }, { zp: 2000, oat: 30 }, { zp: 4000, oat: 20 }, { zp: 500, oat: -5 },
      { zp: 6000, oat: 25 }, { zp: 3000, oat: 10 }, { zp: 8000, oat: 15 }, { zp: 1500, oat: 38 }, { zp: 5000, oat: -10 },
    ],
  },
  {
    id: 'true-alt',
    group: 'atmo',
    aircraft: 'both',
    title: 'Altitude vraie (correction de température)',
    formula: 'Zv = Zi + 4 × (Zi − Zs) / 1 000 × ΔISA',
    vars: [['Zv', 'altitude vraie (ft)'], ['Zi', 'altitude indiquée au QNH (ft)'], ['Zs', 'altitude de la station du QNH (ft)'], ['ΔISA', 'écart ISA moyen (°C)']],
    inputs: [
      { k: 'zi', label: 'Altitude indiquée (QNH)', unit: 'ft', def: 4000 },
      { k: 'zs', label: 'Altitude de la station', unit: 'ft', def: 500 },
      { k: 'disa', label: 'Écart ISA', unit: '°C', def: -15 },
    ],
    calc: (v) => {
      const c = 4 * ((v.zi - v.zs) / 1000) * v.disa;
      return [
        { label: 'Altitude vraie', value: v.zi + c, unit: 'ft', d: 0 },
        { label: 'Correction', value: c, unit: 'ft', d: 0, text: `${sg(c)} ft` },
      ];
    },
    mini: 'L’altimètre est étalonné en atmosphère standard. Par temps froid, il affiche plus que l’altitude réelle : environ 4 ft par 1 000 ft et par degré d’écart ISA. Air froid = on est plus bas qu’on le croit.',
    course: [
      'La pression baisse plus vite avec l’altitude dans l’air froid (plus dense) que dans l’air chaud. Les surfaces isobares sont donc « tassées » par temps froid : à une même indication, l’avion est plus bas que prévu.',
      'Règle pratique : la correction vaut environ 4 % par tranche de 10 °C d’écart ISA, appliquée à la hauteur au-dessus de la station qui fournit le QNH. Soit 4 ft par 1 000 ft et par °C.',
      'Par temps froid (ΔISA négatif), la correction est négative : altitude vraie < altitude indiquée. C’est le cas dangereux pour le franchissement des reliefs et les altitudes minimales d’approche.',
      'En approche aux instruments par grand froid, les pilotes doivent majorer les altitudes minimales publiées (tables de correction froid de l’AIP).',
      'Retenir : « air froid, altimètre menteur, on est plus bas ».',
    ],
    ask: (v) => `Altimètre calé au QNH d’une station à ${fr(v.zs)} ft, il indique ${fr(v.zi)} ft. L’écart ISA est de ${sg(v.disa)} °C. Quelle est l’altitude vraie ?`,
    steps: (v) => {
      const h = v.zi - v.zs;
      const c = 4 * (h / 1000) * v.disa;
      return [
        `Hauteur au-dessus de la station : ${fr(v.zi)} − ${fr(v.zs)} = ${fr(h)} ft.`,
        `Correction = 4 × ${fr(h / 1000, 1)} × (${sg(v.disa)}) = ${sg(c)} ft.`,
        `Zv = ${fr(v.zi)} ${c >= 0 ? '+' : '−'} ${fr(Math.abs(c))} = ${fr(v.zi + c)} ft.`,
        c < 0 ? 'L’avion est plus bas qu’affiché : marge de franchissement réduite.' : 'L’avion est plus haut qu’affiché.',
      ];
    },
    ex: [
      { zi: 4000, zs: 500, disa: -15 }, { zi: 3000, zs: 0, disa: -20 }, { zi: 6500, zs: 1500, disa: -10 }, { zi: 2500, zs: 300, disa: 15 },
      { zi: 9000, zs: 2000, disa: -25 }, { zi: 5000, zs: 0, disa: -30 }, { zi: 1800, zs: 800, disa: -12 }, { zi: 8000, zs: 1000, disa: 10 },
      { zi: 3500, zs: 1200, disa: -8 }, { zi: 12000, zs: 3000, disa: -20 },
    ],
  },
  {
    id: 'cloud-base',
    group: 'atmo',
    aircraft: 'both',
    title: 'Base des nuages (cumulus)',
    formula: 'H(ft) = 400 × (T − Td)',
    vars: [['H', 'hauteur de la base au-dessus du sol (ft)'], ['T', 'température au sol (°C)'], ['Td', 'point de rosée (°C)']],
    inputs: [
      { k: 't', label: 'Température', unit: '°C', def: 22 },
      { k: 'td', label: 'Point de rosée', unit: '°C', def: 12 },
    ],
    calc: (v) => [
      { label: 'Base estimée (hauteur)', value: 400 * (v.t - v.td), unit: 'ft', d: 0 },
      { label: 'Base estimée (hauteur)', value: 122 * (v.t - v.td), unit: 'm', d: 0 },
    ],
    mini: 'L’écart entre la température et le point de rosée donne la hauteur de base des cumulus : environ 400 ft par degré d’écart. Un écart faible annonce des nuages bas ou du brouillard.',
    course: [
      'Le point de rosée (Td) est la température à laquelle l’air se sature. Une particule d’air qui monte se refroidit d’environ 3 °C/1 000 ft (adiabatique sèche) tandis que son point de rosée baisse d’environ 0,5 °C/1 000 ft : l’écart se réduit de 2,5 °C/1 000 ft.',
      'La condensation (base du nuage) se produit quand l’écart est nul : H = (T − Td) / 2,5 × 1 000 = 400 × (T − Td) ft, soit environ 122 m par degré.',
      'Les METAR donnent T et Td : « 22/12 » signifie 22 °C et point de rosée 12 °C, donc base des cumulus vers 4 000 ft sol.',
      'Cette formule vaut pour les nuages de convection (cumulus) qui se forment au-dessus du terrain, pas pour les couches stratiformes apportées par une perturbation.',
      'Écart ≤ 2 °C : risque de brouillard ou de plafond très bas, vigilance pour un vol VFR.',
    ],
    ask: (v) => `Le METAR indique ${fr(v.t)}/${fr(v.td)}. Estime la hauteur de la base des cumulus en ft et en m.`,
    steps: (v) => [
      `Écart T − Td = ${fr(v.t)} − ${fr(v.td)} = ${fr(v.t - v.td)} °C.`,
      `H = 400 × ${fr(v.t - v.td)} = ${fr(400 * (v.t - v.td))} ft (≈ ${fr(122 * (v.t - v.td))} m) au-dessus du sol.`,
    ],
    ex: [
      { t: 22, td: 12 }, { t: 15, td: 13 }, { t: 28, td: 14 }, { t: 18, td: 9 }, { t: 10, td: 8 },
      { t: 31, td: 16 }, { t: 25, td: 20 }, { t: 12, td: 4 }, { t: 20, td: 17 }, { t: 33, td: 11 },
    ],
  },
  {
    id: 'iso0',
    group: 'atmo',
    aircraft: 'both',
    title: 'Altitude de l’isotherme 0 °C',
    formula: 'Z0 = Z_sol + T_sol / 2 × 1 000',
    vars: [['Z0', 'altitude de l’isotherme 0 °C (ft)'], ['Z_sol', 'altitude du terrain (ft)'], ['T_sol', 'température au sol (°C)']],
    inputs: [
      { k: 'zs', label: 'Altitude du terrain', unit: 'ft', def: 500 },
      { k: 'ts', label: 'Température au sol', unit: '°C', def: 8 },
    ],
    calc: (v) => [{ label: 'Isotherme 0 °C', value: v.zs + (v.ts / 2) * 1000, unit: 'ft', d: 0 }],
    mini: 'Avec une baisse de 2 °C par 1 000 ft, la température atteint 0 °C à T_sol ÷ 2 milliers de pieds au-dessus du terrain. Au-dessus, risque de givrage dans les nuages.',
    course: [
      'L’isotherme 0 °C est l’altitude où la température passe sous zéro. Elle sert à évaluer le risque de givrage : en vol dans les nuages ou la pluie à température négative, la glace se dépose sur les ailes, l’hélice, le rotor.',
      'Avec le gradient standard de 2 °C/1 000 ft : Z0 = Z_sol + T_sol / 2 × 1 000. Exemple : 8 °C au sol à 500 ft → 0 °C vers 4 500 ft.',
      'Ce n’est qu’une estimation : la décroissance réelle varie et une inversion de température peut fausser le résultat. Les cartes TEMSI et prévisions donnent l’isotherme 0 °C prévu.',
      'Le givrage le plus dangereux se situe entre 0 °C et −15 °C, en présence de gouttelettes surfondues.',
      'Les avions et hélicoptères légers ne sont généralement pas certifiés pour voler en conditions givrantes connues.',
    ],
    ask: (v) => `Au sol (${fr(v.zs)} ft), il fait ${fr(v.ts)} °C. À quelle altitude se situe l’isotherme 0 °C ?`,
    steps: (v) => [
      `Hauteur de l’isotherme au-dessus du sol : ${fr(v.ts)} ÷ 2 × 1 000 = ${fr((v.ts / 2) * 1000)} ft.`,
      `Z0 = ${fr(v.zs)} + ${fr((v.ts / 2) * 1000)} = ${fr(v.zs + (v.ts / 2) * 1000)} ft.`,
    ],
    ex: [
      { zs: 500, ts: 8 }, { zs: 0, ts: 12 }, { zs: 1500, ts: 4 }, { zs: 300, ts: 16 }, { zs: 2000, ts: 6 },
      { zs: 100, ts: 20 }, { zs: 3500, ts: 2 }, { zs: 800, ts: 10 }, { zs: 1200, ts: 14 }, { zs: 0, ts: 25 },
    ],
  },
  {
    id: 'rho',
    group: 'atmo',
    aircraft: 'both',
    title: 'Masse volumique de l’air',
    formula: 'ρ = P / (R × T)\nR = 287,05 J/(kg·K) · T en kelvins · P en Pa',
    vars: [['ρ', 'masse volumique (kg/m³)'], ['P', 'pression (Pa = hPa × 100)'], ['T', 'température absolue (K = °C + 273,15)'], ['σ', 'densité relative = ρ / 1,225']],
    inputs: [
      { k: 'p', label: 'Pression', unit: 'hPa', def: 1013 },
      { k: 't', label: 'Température', unit: '°C', def: 15 },
    ],
    calc: (v) => {
      const r = airDensity(v.p, v.t);
      return [
        { label: 'Masse volumique', value: r, unit: 'kg/m³', d: 3 },
        { label: 'Densité relative σ', value: r / 1.225, unit: '', d: 3 },
      ];
    },
    mini: 'La masse volumique de l’air (ρ) est la masse d’un mètre cube d’air : 1,225 kg/m³ en atmosphère standard au niveau de la mer. Elle diminue quand la pression baisse ou quand la température monte.',
    course: [
      'Loi des gaz parfaits : ρ = P / (R × T), avec P en pascals, T en kelvins et R = 287,05 J/(kg·K) pour l’air sec.',
      'ρ apparaît dans toutes les formules d’aérodynamique : portance, traînée, puissance du rotor. Une baisse de ρ de 20 % réduit la portance de 20 % à vitesse vraie égale.',
      'La densité relative σ = ρ / 1,225 compare l’air réel à l’air standard au niveau de la mer. Elle relie vitesse indiquée et vitesse vraie : Vp = Vi / √σ.',
      'L’humidité diminue aussi légèrement la densité (la vapeur d’eau est plus légère que l’air sec), effet négligé ici.',
    ],
    ask: (v) => `Pression ${fr(v.p)} hPa, température ${fr(v.t)} °C. Calcule la masse volumique de l’air et la densité relative σ.`,
    steps: (v) => {
      const r = airDensity(v.p, v.t);
      return [
        `P = ${fr(v.p)} × 100 = ${fr(v.p * 100)} Pa ; T = ${fr(v.t)} + 273,15 = ${fr(v.t + 273.15, 2)} K.`,
        `ρ = ${fr(v.p * 100)} / (287,05 × ${fr(v.t + 273.15, 2)}) = ${fr(r, 3)} kg/m³.`,
        `σ = ${fr(r, 3)} / 1,225 = ${fr(r / 1.225, 3)}.`,
      ];
    },
    ex: [
      { p: 1013, t: 15 }, { p: 1013, t: 35 }, { p: 950, t: 20 }, { p: 900, t: 5 }, { p: 1030, t: -10 },
      { p: 843, t: -2 }, { p: 1000, t: 30 }, { p: 795, t: -5 }, { p: 970, t: 25 }, { p: 700, t: -20 },
    ],
  },

  // ===================== VITESSES =====================
  {
    id: 'tas',
    group: 'vitesses',
    aircraft: 'both',
    title: 'Vitesse propre (vitesse vraie, TAS)',
    formula: 'Vp = Vi / √σ\nRègle pratique : Vp ≈ Vi + 1 % par 600 ft',
    vars: [['Vp', 'vitesse propre ou vraie (kt)'], ['Vi', 'vitesse indiquée ou conventionnelle (kt)'], ['σ', 'densité relative de l’air']],
    inputs: [
      { k: 'vi', label: 'Vitesse indiquée', unit: 'kt', def: 110 },
      { k: 'zp', label: 'Altitude pression', unit: 'ft', def: 6000 },
      { k: 'oat', label: 'Température', unit: '°C', def: 3 },
    ],
    calc: (v) => {
      const sigma = airDensity(isaPressure(v.zp), v.oat) / 1.225;
      return [
        { label: 'Vitesse propre', value: v.vi / Math.sqrt(sigma), unit: 'kt', d: 0 },
        { label: 'Règle 1 %/600 ft', value: v.vi * (1 + v.zp / 600 / 100), unit: 'kt', d: 0 },
        { label: 'Densité relative σ', value: sigma, unit: '', d: 3 },
      ];
    },
    mini: 'L’anémomètre mesure une pression dynamique, donc la vitesse « vue » par l’air. En altitude, l’air est moins dense : la vitesse vraie par rapport à l’air est plus grande que la vitesse indiquée, d’environ 1 % tous les 600 ft.',
    course: [
      'L’anémomètre mesure la pression dynamique ½ρV². Il est étalonné pour ρ = 1,225 kg/m³. Si l’air est moins dense, il faut aller plus vite pour la même indication : Vp = Vi / √σ.',
      'La vitesse indiquée (Vi) commande le comportement de l’aéronef : décrochage, vitesses de montée et d’approche sont des vitesses indiquées, quelle que soit l’altitude.',
      'La vitesse propre (Vp ou TAS) sert à la navigation : c’est elle qui, combinée au vent, donne la vitesse sol et donc le temps de vol.',
      'Règle pratique : Vp ≈ Vi + 1 % par 600 ft d’altitude (en atmosphère proche du standard). Elle est plus juste que la règle américaine de 2 % par 1 000 ft, qui surestime légèrement.',
      'Calcul exact : 1) pression standard à Zp ; 2) ρ avec la température réelle ; 3) σ = ρ / 1,225 ; 4) Vp = Vi / √σ. Le calculateur fait ces 4 étapes (erreur de compressibilité négligée, valable pour les avions légers).',
    ],
    ask: (v) => `Vitesse indiquée ${fr(v.vi)} kt, altitude pression ${fr(v.zp)} ft, température ${fr(v.oat)} °C. Calcule la vitesse propre exacte puis par la règle pratique.`,
    steps: (v) => {
      const p = isaPressure(v.zp);
      const rho = airDensity(p, v.oat);
      const sigma = rho / 1.225;
      return [
        `Pression standard à ${fr(v.zp)} ft : P = 1013,25 × (1 − 6,8756·10⁻⁶ × ${fr(v.zp)})^5,2559 = ${fr(p, 1)} hPa.`,
        `ρ = ${fr(p * 100)} / (287,05 × ${fr(v.oat + 273.15, 2)}) = ${fr(rho, 3)} kg/m³ ; σ = ${fr(rho, 3)} / 1,225 = ${fr(sigma, 3)}.`,
        `Vp = ${fr(v.vi)} / √${fr(sigma, 3)} = ${fr(v.vi)} / ${fr(Math.sqrt(sigma), 3)} = ${fr(v.vi / Math.sqrt(sigma))} kt.`,
        `Règle pratique : ${fr(v.zp)} / 600 = ${fr(v.zp / 600, 1)} % → ${fr(v.vi)} × ${fr(1 + v.zp / 60000, 3)} = ${fr(v.vi * (1 + v.zp / 60000))} kt.`,
      ];
    },
    ex: [
      { vi: 110, zp: 6000, oat: 3 }, { vi: 100, zp: 3000, oat: 9 }, { vi: 90, zp: 8000, oat: -1 }, { vi: 120, zp: 4500, oat: 20 },
      { vi: 95, zp: 2000, oat: 11 }, { vi: 130, zp: 10000, oat: -5 }, { vi: 105, zp: 6500, oat: 15 }, { vi: 80, zp: 1500, oat: 25 },
      { vi: 140, zp: 12000, oat: -9 }, { vi: 115, zp: 5000, oat: -10 },
    ],
  },
  {
    id: 'mach',
    group: 'vitesses',
    aircraft: 'avion',
    title: 'Nombre de Mach',
    formula: 'M = Vp / a\na (kt) = 38,94 × √T(K)',
    vars: [['M', 'nombre de Mach'], ['Vp', 'vitesse propre (kt)'], ['a', 'vitesse du son (kt)'], ['T', 'température absolue (K)']],
    inputs: [
      { k: 'tas', label: 'Vitesse propre', unit: 'kt', def: 450 },
      { k: 'oat', label: 'Température', unit: '°C', def: -56.5 },
    ],
    calc: (v) => {
      const a = 38.94 * Math.sqrt(v.oat + 273.15);
      return [
        { label: 'Nombre de Mach', value: v.tas / a, unit: '', d: 3 },
        { label: 'Vitesse du son', value: a, unit: 'kt', d: 0 },
      ];
    },
    mini: 'Le nombre de Mach compare la vitesse vraie à la vitesse du son. La vitesse du son ne dépend que de la température : 661 kt à 15 °C, 573 kt à −56,5 °C.',
    course: [
      'La vitesse du son a = √(γ × R × T) ne dépend que de la température absolue. En nœuds : a = 38,94 × √T(K). À 15 °C : 661 kt ; à −56,5 °C (au-dessus de 36 000 ft en ISA) : 573 kt.',
      'Le nombre de Mach M = Vp / a. Les avions de ligne volent en croisière vers M 0,78 à 0,85. Au-delà d’un certain Mach (Mach critique), des ondes de choc apparaissent sur l’aile.',
      'En altitude, les pilotes de jets suivent le Mach plutôt que la vitesse indiquée : la limite structurale devient une limite de Mach (MMO).',
      'Pour les hélicoptères, le Mach concerne surtout le bout de la pale avançante (voir la formule « vitesse en bout de pale »).',
    ],
    ask: (v) => `Un avion vole à ${fr(v.tas)} kt de vitesse propre dans un air à ${fr(v.oat, 1)} °C. Quel est son nombre de Mach ?`,
    steps: (v) => {
      const a = 38.94 * Math.sqrt(v.oat + 273.15);
      return [
        `T = ${fr(v.oat, 1)} + 273,15 = ${fr(v.oat + 273.15, 2)} K.`,
        `a = 38,94 × √${fr(v.oat + 273.15, 2)} = ${fr(a)} kt.`,
        `M = ${fr(v.tas)} / ${fr(a)} = ${fr(v.tas / a, 3)}.`,
      ];
    },
    ex: [
      { tas: 450, oat: -56.5 }, { tas: 480, oat: -50 }, { tas: 300, oat: -20 }, { tas: 250, oat: 0 }, { tas: 520, oat: -56.5 },
      { tas: 400, oat: -40 }, { tas: 180, oat: 10 }, { tas: 350, oat: -30 }, { tas: 460, oat: -45 }, { tas: 600, oat: -56.5 },
    ],
  },
  {
    id: 'dvt',
    group: 'vitesses',
    aircraft: 'both',
    title: 'Distance, vitesse sol et temps',
    formula: 't (min) = D / Vs × 60\nD = Vs × t / 60 · Vs = D / t × 60',
    vars: [['t', 'temps (min)'], ['D', 'distance (NM)'], ['Vs', 'vitesse sol (kt)']],
    inputs: [
      { k: 'd', label: 'Distance', unit: 'NM', def: 48 },
      { k: 'gs', label: 'Vitesse sol', unit: 'kt', def: 96 },
    ],
    calc: (v) => [{ label: 'Temps de vol', value: (v.d / v.gs) * 60, unit: 'min', d: 1, text: `${fr((v.d / v.gs) * 60, 1)} min (${hmin((v.d / v.gs) * 60)})` }],
    mini: 'La relation de base de la navigation : temps = distance ÷ vitesse sol. En nœuds et milles nautiques, on obtient des heures ; × 60 pour des minutes.',
    course: [
      'Toute la navigation à l’estime repose sur D = V × t. Avec D en NM et V en kt, t sort en heures : multiplier par 60 pour des minutes.',
      'On utilise la vitesse sol (Vs, GS), c’est-à-dire la vitesse propre corrigée du vent, et non la vitesse indiquée.',
      'Les trois formes : t = D/Vs (heure estimée d’arrivée), D = Vs × t (position estimée après un temps donné), Vs = D/t (mesure de la vitesse sol réelle entre deux repères).',
      'En vol, on compare l’heure réelle de passage aux points tournants avec l’heure estimée : un retard révèle un vent plus fort que prévu, à corriger pour les tronçons suivants.',
    ],
    ask: (v) => `Une branche de navigation mesure ${fr(v.d)} NM, la vitesse sol prévue est ${fr(v.gs)} kt. Combien de temps dure-t-elle ?`,
    steps: (v) => [
      `t = ${fr(v.d)} / ${fr(v.gs)} = ${fr(v.d / v.gs, 3)} h.`,
      `En minutes : ${fr(v.d / v.gs, 3)} × 60 = ${fr((v.d / v.gs) * 60, 1)} min.`,
    ],
    ex: [
      { d: 48, gs: 96 }, { d: 35, gs: 105 }, { d: 120, gs: 90 }, { d: 22, gs: 110 }, { d: 75, gs: 125 },
      { d: 150, gs: 140 }, { d: 18, gs: 80 }, { d: 60, gs: 72 }, { d: 240, gs: 160 }, { d: 9, gs: 100 },
    ],
  },
  {
    id: 'fb',
    group: 'vitesses',
    aircraft: 'both',
    title: 'Facteur de base',
    formula: 'Fb = 60 / Vs\nt (min) = D × Fb',
    vars: [['Fb', 'facteur de base (min par NM)'], ['Vs', 'vitesse sol (kt)'], ['D', 'distance (NM)']],
    inputs: [
      { k: 'gs', label: 'Vitesse sol', unit: 'kt', def: 120 },
      { k: 'd', label: 'Distance', unit: 'NM', def: 34 },
    ],
    calc: (v) => [
      { label: 'Facteur de base', value: 60 / v.gs, unit: 'min/NM', d: 2 },
      { label: 'Temps', value: v.d * (60 / v.gs), unit: 'min', d: 1 },
    ],
    mini: 'Le facteur de base est le temps pour parcourir 1 NM. À 120 kt, Fb = 0,5 min/NM : 34 NM prennent 17 min. Il simplifie tout le calcul mental en vol.',
    course: [
      'Fb = 60 / Vs donne des minutes par mille nautique. Valeurs rondes à retenir : 60 kt → 1 ; 80 kt → 0,75 ; 90 kt → 0,67 ; 100 kt → 0,6 ; 120 kt → 0,5 ; 150 kt → 0,4 ; 180 kt → 0,33.',
      'Temps = distance × Fb. Exemple à 90 kt : 30 NM × 0,67 = 20 min.',
      'Le facteur de base sert aussi pour la dérive maximale (Xmax = Vw × Fb) et pour le calcul des taux de descente.',
      'On choisit souvent une vitesse de croisière ronde (90, 100, 120 kt) pour obtenir un facteur de base simple et faire les calculs de tête.',
    ],
    ask: (v) => `Vitesse sol ${fr(v.gs)} kt. Calcule le facteur de base puis le temps pour parcourir ${fr(v.d)} NM.`,
    steps: (v) => [
      `Fb = 60 / ${fr(v.gs)} = ${fr(60 / v.gs, 2)} min/NM.`,
      `t = ${fr(v.d)} × ${fr(60 / v.gs, 2)} = ${fr(v.d * (60 / v.gs), 1)} min.`,
    ],
    ex: [
      { gs: 120, d: 34 }, { gs: 90, d: 30 }, { gs: 100, d: 45 }, { gs: 80, d: 24 }, { gs: 150, d: 70 },
      { gs: 60, d: 13 }, { gs: 110, d: 55 }, { gs: 180, d: 90 }, { gs: 75, d: 40 }, { gs: 135, d: 27 },
    ],
  },
];
