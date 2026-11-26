/**
 * Avion ou hélicoptère : ce qui change.
 *
 * - Une formule ABSENTE de FORMULA_SPECIFICS se calcule et s'utilise de la même façon
 *   pour tous les aéronefs : elle est présentée sous « Aéronefs (avions, hélicoptères) ».
 * - Une formule PRÉSENTE ici a le même calcul de base mais un usage, des valeurs ou des limites
 *   différentes selon l'appareil : les particularités sont affichées pour chaque cas.
 * - Une formule réservée à un seul type (aircraft: 'avion' ou 'helico') explique ici
 *   ce qui la remplace pour l'autre type.
 */
export const FORMULA_SPECIFICS = {
  'fuel-mass': {
    avion: 'Moteurs à pistons : AVGAS 100LL (0,72). Avions à turbine (turbopropulseurs, jets) : JET A-1 (0,80).',
    helico: 'Hélicoptères à pistons (Robinson R22, R44, Guimbal Cabri) : AVGAS. Hélicoptères à turbine (Écureuil, EC135, Alouette…) : JET A-1, plus dense : à volume égal, 11 % plus lourd.',
  },
  zp: {
    avion: 'Sert à entrer dans les abaques de décollage, d’atterrissage et de montée du manuel, et à voler aux niveaux de vol.',
    helico: 'Sert en plus aux abaques de stationnaire (HIGE / HOGE, dans et hors effet de sol) et au tableau de VNE, qui diminue avec l’altitude pression.',
  },
  zd: {
    avion: 'Une altitude densité élevée allonge la distance de décollage et réduit le taux de montée.',
    helico: 'Une altitude densité élevée réduit la masse maximale en stationnaire, la marge de puissance et la VNE. C’est souvent le facteur qui limite un décollage en montagne l’été.',
  },
  tas: {
    avion: 'Calcul habituel en croisière ; l’anémomètre est fiable sur toute la plage de vol.',
    helico: 'Même calcul, mais l’anémomètre est peu fiable aux basses vitesses (souffle du rotor), en dessous d’environ 30 à 40 kt selon l’appareil, et inutilisable en stationnaire.',
  },
  'wind-comp': {
    avion: 'On compare le vent traversier à la composante maximale démontrée du manuel et on évite le vent arrière au décollage et à l’atterrissage.',
    helico: 'On compare le vent aux secteurs à éviter du manuel : certains vents de travers ou arrière en stationnaire réduisent l’efficacité du rotor anticouple. Décoller face au vent fait gagner plus vite la portance de translation.',
  },
  'vz-slope': {
    avion: 'Approche classique sur un plan de 3° (PAPI, ILS) : Vz ≈ 5 × vitesse sol.',
    helico: 'Les approches sont souvent plus raides (pentes de 6 à 10° selon les procédures et les aires de poser), à vitesse plus faible. Éviter les forts taux de descente à faible vitesse d’avancement : risque d’état d’anneau tourbillonnaire (vortex).',
  },
  tod: {
    avion: 'Descente de croisière et approche généralement sur 3°.',
    helico: 'Même calcul, avec des pentes souvent plus fortes vers une hélisurface. Même vigilance sur les forts taux de descente à basse vitesse (état d’anneau tourbillonnaire).',
  },
  gradient: {
    avion: 'Pente maximale à Vx (franchissement d’obstacles), taux maximal à Vy.',
    helico: 'La montée se règle surtout à la puissance (collectif) et à la vitesse de meilleur taux du manuel. Au décollage, respecter le diagramme hauteur-vitesse (zone d’où une autorotation ne serait pas réussie).',
  },
  'load-factor': {
    avion: 'n = 1 / cos φ et la vitesse de décrochage de l’aile augmente comme √n.',
    helico: 'n = 1 / cos φ reste vrai, mais il n’y a pas de « vitesse de décrochage » de l’appareil : le facteur de charge augmente la puissance nécessaire et peut provoquer une perte de régime rotor ou, à grande vitesse, le décrochage de la pale reculante. La deuxième ligne du calculateur ne concerne que l’avion.',
  },
  'fuel-required': {
    avion: 'Réserve finale EASA Part-NCO : 30 min en VFR de jour, 45 min en VFR de nuit ou en IFR.',
    helico: 'Réserve finale EASA Part-NCO : 20 min en VFR, 30 min en IFR (10 min seulement pour certaines opérations spécialisées de jour, avec départ et arrivée au même site et en restant à moins de 25 NM). Choisis la bonne ligne dans le menu « Réserve finale ».',
  },
  'weight-balance': {
    avion: 'Centrage longitudinal (avant-arrière) à comparer au domaine du manuel, au décollage et à l’atterrissage.',
    helico: 'Centrage longitudinal ET latéral (gauche-droite) : un centre de gravité hors limites peut épuiser le débattement du cyclique. Les charges sous élingue se traitent à part. Le calculateur traite le centrage longitudinal.',
  },
  lift: {
    avion: 'S est la surface de l’aile, V la vitesse de l’avion.',
    helico: 'La même formule s’applique à chaque section de pale, avec sa vitesse locale (rotation ± avancement). C’est pour cela que la pale avançante porte plus que la pale reculante.',
  },
  glide: {
    avion: 'Vol plané à la vitesse de finesse maximale ; finesse d’environ 8 à 10 pour un avion léger.',
    helico: 'Autorotation : finesse d’environ 3 à 5 seulement. L’entrée en autorotation doit être immédiate (abaisser le collectif) pour garder le régime rotor, puis arrondi et amortissement à la fin.',
  },
  mach: {
    helico: 'Non utilisé pour piloter un hélicoptère, dont la vitesse reste loin du Mach. Le Mach compte en revanche en bout de pale avançante : voir « Vitesse en bout de pale ».',
  },
  'vs-mass': {
    helico: 'Non applicable : l’hélicoptère n’a pas de vitesse de décrochage. Son équivalent est la masse maximale en stationnaire (abaques HIGE / HOGE) et la puissance disponible : voir « Charge du disque ».',
  },
  takeoff: {
    helico: 'Non applicable tel quel : l’hélicoptère décolle verticalement ou avec une courte translation. On vérifie plutôt la masse maximale en stationnaire (HIGE / HOGE), la puissance disponible et le diagramme hauteur-vitesse.',
  },
  'rotor-tip': {
    avion: 'Le même calcul de vitesse en bout de pale s’applique à l’hélice d’un avion : π × diamètre × régime / 60. Il n’y a en revanche pas de pale « reculante » : la dissymétrie avançante / reculante est propre au rotor d’hélicoptère.',
  },
  'disk-load': {
    avion: 'Non applicable : la sustentation de l’avion vient de l’aile, pas d’un rotor. Son équivalent est la charge alaire (masse / surface de l’aile) et la vitesse de décrochage.',
  },
};

/** Particularités par étape du vol */
export const PHASE_SPECIFICS = {
  preparation: {
    avion: 'Vérifier la longueur des pistes de départ, d’arrivée et de dégagement ; réserve finale de 30 min de jour.',
    helico: 'Vérifier les aires de poser (dimensions, obstacles, pente), la masse en stationnaire HIGE / HOGE au départ et à l’arrivée, le centrage latéral ; réserve finale de 20 min en VFR.',
  },
  decollage: {
    avion: 'Roulage puis rotation à la vitesse du manuel : calculer la distance de décollage corrigée et la comparer à la piste disponible.',
    helico: 'Mise en stationnaire puis translation : vérifier la puissance disponible (charge du disque, altitude densité), les secteurs de vent à éviter et le diagramme hauteur-vitesse. Pas de distance de roulage à calculer.',
  },
  montee: {
    avion: 'Montée à Vx pour franchir les obstacles, puis à Vy.',
    helico: 'Montée à la vitesse de meilleur taux du manuel, en sortant rapidement de la zone à éviter du diagramme hauteur-vitesse.',
  },
  croisiere: {
    avion: 'Calculs identiques. Les avions rapides surveillent aussi le Mach en altitude.',
    helico: 'Calculs identiques. La VNE baisse avec l’altitude et la température (tableau du manuel) ; la vitesse est limitée par la pale reculante et la compressibilité en bout de pale.',
  },
  virages: {
    avion: 'Le facteur de charge augmente la vitesse de décrochage : piège classique du dernier virage à basse vitesse.',
    helico: 'Le facteur de charge augmente la puissance nécessaire et peut faire chuter le régime rotor ; pas de vitesse de décrochage de l’appareil. Rayon et taux de virage se calculent comme pour l’avion.',
  },
  descente: {
    avion: 'Descente sur 3° environ, sans dépasser la VNE.',
    helico: 'Pentes souvent plus fortes ; éviter les forts taux de descente à faible vitesse d’avancement (état d’anneau tourbillonnaire).',
  },
  approche: {
    avion: 'Plan de 3°, vitesse d’approche à environ 1,3 × Vs, vent traversier comparé à la limite démontrée. En panne moteur : vol plané à finesse 8 à 10.',
    helico: 'Approche plus raide et plus lente jusqu’au stationnaire ou au poser, face au vent de préférence. En panne moteur : autorotation, finesse 3 à 5.',
  },
  helico: {
    avion: 'Étape réservée à l’hélicoptère. Pour l’avion, la vitesse en bout de pale d’hélice se calcule de la même façon (voir la formule).',
  },
};

export const AIRCRAFT_TAG = { both: 'Aéronefs', avion: 'Avions', helico: 'Hélicoptères' };
export const AIRCRAFT_LONG = {
  both: 'Aéronefs (avions, hélicoptères)',
  avion: 'Avions uniquement',
  helico: 'Hélicoptères uniquement',
};
