/**
 * Test de positionnement relevé (NIV2, demande de l'auteur du 26/11/2026 18:35 : « les tests de niveau sont trop faciles
 * selon un ingénieur aéronautique, on va augmenter le niveau de difficulté »).
 *
 * Retouches du moteur d'origine (texte remplacé dans prepare, rien n'est supprimé) :
 * - 40 questions de niveau EXPERT ajoutées (20 mathématiques, 20 sciences), du calcul de ligne et d'ingénieur :
 *   règle du 1 sur 60, Mach et vitesse du son, triangle des vitesses, altitude-densité, centrage en % de CMA, carburant
 *   réglementaire, point équitemps, coefficient de portance, traînée induite, pente moteur en panne… [CALCULÉ]
 *   Les leurres sont des erreurs plausibles (oubli d'un terme, mauvais sens de correction, facteur oublié).
 * - Le test garde 30 + 30 questions, mais ne pose plus le premier tiers (facile) : par matière, 6 questions moyennes
 *   tirées au sort, les 10 difficiles, et 14 expertes tirées au sort parmi 20 (tirage renouvelé à chaque test).
 *   Les questions faciles restent dans le moteur (rien n'est perdu).
 * - Les comptes, jauges et seuils (80 % / 50 %) sont calculés sur les questions réellement posées.
 */

const EXPERT_M = String.raw`
 ['Écart de 4 NM à droite de la route après 60 NM parcourus ; il reste 40 NM. Correction de cap pour rejoindre directement la destination (règle du 1 sur 60) ?',['10° à gauche','4° à gauche','6° à gauche','10° à droite'],0,'Erreur de route : 4 × 60 / 60 = 4° ; convergence : 4 × 60 / 40 = 6° ; total 4 + 6 = 10°, vers la gauche pour revenir.'],
 ['Vitesse vraie 480 kt, température extérieure −56,5 °C. Nombre de Mach (a ≈ 38,94 × √T en K, en kt) ?',['≈ 0,84','≈ 0,80','≈ 0,78','≈ 0,88'],0,'T = 216,65 K ; a = 38,94 × 14,72 ≈ 573 kt ; M = 480 / 573 ≈ 0,84.'],
 ['Croisière à Mach 0,78, température extérieure −54 °C. Vitesse vraie ?',['≈ 450 kt','≈ 470 kt','≈ 430 kt','≈ 520 kt'],0,'a = 38,94 × √219,15 ≈ 576 kt ; 0,78 × 576 ≈ 450 kt.'],
 ['Vitesse vraie 200 kt, route 360°, vent du 030° pour 40 kt. Vitesse sol ?',['≈ 164 kt','≈ 172 kt','≈ 156 kt','≈ 180 kt'],0,'Vent de face 40 × cos 30° ≈ 34,6 kt ; traversier 20 kt, correction de dérive asin(20/200) ≈ 5,7° ; Vs = 200 × cos 5,7° − 34,6 ≈ 164 kt.'],
 ['Altitude-pression 5 000 ft, température extérieure +25 °C. Altitude-densité approchée (120 ft par °C d\'écart ISA) ?',['≈ 7 400 ft','≈ 5 600 ft','≈ 9 000 ft','≈ 2 600 ft'],0,'ISA à 5 000 ft : +5 °C ; écart +20 °C ; 5 000 + 20 × 120 = 7 400 ft.'],
 ['Centre de gravité à 18,6 m du repère, bord d\'attaque de la CMA à 17,8 m, CMA 4,2 m. Centrage en % de CMA ?',['≈ 19 %','≈ 25 %','≈ 4,4 %','≈ 81 %'],0,'(18,6 − 17,8) / 4,2 = 0,19, soit 19 % de la corde aérodynamique moyenne.'],
 ['Avion de 60 000 kg : il faut reculer le centre de gravité de 0,10 m en déplaçant du fret entre deux soutes distantes de 15 m. Masse à déplacer ?',['400 kg','600 kg','40 kg','900 kg'],0,'Masse déplacée × distance = masse totale × déplacement du CG : 60 000 × 0,10 / 15 = 400 kg.'],
 ['Descente du FL350 à 3 000 ft sur un plan de 3°. Distance de début de descente, sans vent ?',['≈ 100 NM','≈ 32 NM','≈ 60 NM','≈ 160 NM'],0,'32 000 ft / (tan 3° × 6 076 ft) ≈ 32 000 / 318 ≈ 100 NM (règle : 3 × 32 ≈ 96 NM).'],
 ['Inclinaison d\'un virage au taux 1 (3°/s) à 180 kt de vitesse vraie ?',['≈ 26°','≈ 18°','≈ 35°','≈ 45°'],0,'tan φ = V × ω / g = 92,6 × 0,0524 / 9,81 ≈ 0,49 ; φ ≈ 26° (règle : V/10 + 7 = 25°).'],
 ['Rayon de virage à 250 kt de vitesse vraie et 25° d\'inclinaison ?',['≈ 2,0 NM','≈ 1,0 NM','≈ 4,0 NM','≈ 0,5 NM'],0,'R = V² / (g tan φ) = 128,6² / (9,81 × 0,466) ≈ 3 615 m ≈ 1,95 NM.'],
 ['Roulage 200 kg, délestage 6 200 kg, réserve de route 5 % du délestage, dégagement 1 800 kg, réserve finale 30 min à 2 400 kg/h. Carburant minimum au bloc ?',['9 710 kg','9 400 kg','9 510 kg','10 020 kg'],0,'200 + 6 200 + 310 + 1 800 + 1 200 = 9 710 kg.'],
 ['Débit carburant 2 400 kg/h, vitesse sol 450 kt. Distance franchissable par tonne de carburant ?',['≈ 188 NM','≈ 5,3 NM','≈ 1 080 NM','≈ 240 NM'],0,'450 / 2 400 = 0,1875 NM/kg, soit ≈ 188 NM par tonne (distance spécifique).'],
 ['Aérodrome à 1 200 ft, QNH 983 hPa (1 hPa ≈ 27 ft). Altitude-pression de l\'aérodrome ?',['≈ 2 010 ft','≈ 390 ft','≈ 1 230 ft','≈ 2 610 ft'],0,'(1 013 − 983) × 27 = 810 ft ; 1 200 + 810 = 2 010 ft.'],
 ['Par ISA −20 °C, l\'altimètre indique 3 000 ft au-dessus de la station. Hauteur vraie approchée (4 % par 10 °C d\'écart) ?',['≈ 2 760 ft','≈ 3 240 ft','≈ 2 400 ft','3 000 ft'],0,'Air froid : l\'avion est plus bas qu\'indiqué ; 8 % de 3 000 = 240 ft ; 3 000 − 240 = 2 760 ft.'],
 ['Moteur en panne : taux de montée 600 ft/min à 150 kt de vitesse sol. Pente de montée ?',['≈ 4,0 %','≈ 2,4 %','≈ 6,0 %','≈ 0,4 %'],0,'1 kt ≈ 101 ft/min ; pente ≈ 600 / (150 × 101) ≈ 3,9 %.'],
 ['Route orthodromique : écart de longitude 40°, latitude moyenne 30°. Variation de la route vraie entre départ et arrivée ?',['≈ 20°','≈ 40°','≈ 35°','≈ 10°'],0,'Convergence des méridiens : Δλ × sin(latitude moyenne) = 40 × 0,5 = 20°.'],
 ['Le relèvement VOR varie de 10° en 3 minutes en volant perpendiculairement au radial. Temps pour rejoindre la station ?',['18 min','30 min','6 min','10 min'],0,'Temps = minutes écoulées × 60 / degrés parcourus = 3 × 60 / 10 = 18 min.'],
 ['Vitesse de décrochage 120 kt à 64 t. À 49 t, même configuration ?',['105 kt','92 kt','113 kt','120 kt'],0,'Vs ∝ √masse : 120 × √(49/64) = 120 × 0,875 = 105 kt.'],
 ['Plan de 3°, vitesse air 140 kt avec 20 kt de vent arrière. Vitesse verticale à afficher ?',['≈ 850 ft/min','≈ 640 ft/min','≈ 740 ft/min','≈ 1 000 ft/min'],0,'On utilise la vitesse SOL : 160 kt ; 160 × 5,3 ≈ 850 ft/min (740 ft/min correspondrait à la vitesse air).'],
 ['Étape de 2 000 NM : vitesse sol 480 kt en continuant, 420 kt en revenant. Distance du point équitemps depuis le départ ?',['≈ 933 NM','≈ 1 067 NM','1 000 NM','≈ 875 NM'],0,'d = D × Vretour / (Valler + Vretour) = 2 000 × 420 / 900 ≈ 933 NM.'],`;

const EXPERT_A = String.raw`
 ['Masse 60 t, S = 122,6 m², ρ = 1,225 kg/m³, V = 70 m/s, vol en palier. Coefficient de portance CL ?',['≈ 1,60','≈ 0,80','≈ 3,20','≈ 1,20'],0,'CL = 2 m g / (ρ V² S) = 1 177 200 / (1,225 × 4 900 × 122,6) ≈ 1,60.'],
 ['En palier à masse constante, la vitesse augmente de 20 %. La traînée induite :',['Baisse d\'environ 31 %','Baisse de 20 %','Baisse de 44 %','Augmente de 44 %'],0,'Traînée induite ∝ 1 / V² : 1 / 1,2² ≈ 0,69, soit −31 %.'],
 ['Finesse 17, panne totale des moteurs à 33 000 ft, sans vent. Distance de plané ?',['≈ 92 NM','≈ 56 NM','≈ 170 NM','≈ 33 NM'],0,'33 000 × 17 = 561 000 ft ; / 6 076 ≈ 92 NM.'],
 ['La vitesse du son dans l\'air dépend :',['De la température seule','De la pression seule','De l\'altitude-pression et de l\'humidité','De la masse volumique seule'],0,'a = √(γ R T) : seule la température absolue intervient (gaz parfait).'],
 ['Facteur de charge limite 2,5, vitesse de décrochage 1 g 130 kt. Vitesse de manœuvre (décrochage sous 2,5 g) ?',['≈ 206 kt','≈ 325 kt','≈ 163 kt','≈ 130 kt'],0,'Va = Vs × √n = 130 × √2,5 ≈ 206 kt (325 kt serait 130 × 2,5).'],
 ['Pression dynamique à 100 m/s, ρ = 1,225 kg/m³ ?',['≈ 61 hPa','≈ 6 hPa','≈ 123 hPa','≈ 612 hPa'],0,'q = ½ ρ V² = 0,5 × 1,225 × 10 000 = 6 125 Pa ≈ 61 hPa.'],
 ['Pression 500 hPa, température −20 °C (R = 287 J/kg/K). Masse volumique de l\'air ?',['≈ 0,69 kg/m³','≈ 0,50 kg/m³','≈ 1,23 kg/m³','≈ 0,34 kg/m³'],0,'ρ = P / (R T) = 50 000 / (287 × 253,15) ≈ 0,69 kg/m³.'],
 ['Densité relative σ = 0,25, vitesse équivalente 250 kt. Vitesse vraie ?',['500 kt','1 000 kt','250 kt','≈ 354 kt'],0,'VV = VE / √σ = 250 / 0,5 = 500 kt.'],
 ['Pour un avion à réaction, l\'autonomie maximale (endurance) est obtenue à :',['La vitesse de traînée minimale (Vmd)','Environ 1,32 Vmd','La vitesse de puissance minimale','La vitesse maximale d\'utilisation (VMO)'],0,'Débit carburant ∝ poussée = traînée : minimum à Vmd ; le rayon d\'action maximal est vers 1,32 Vmd. La puissance minimale concerne l\'hélice.'],
 ['Le nombre de Mach critique d\'une aile est :',['Le Mach de vol à partir duquel l\'écoulement atteint localement Mach 1 sur l\'aile','Mach 1','Le Mach de décrochage','Le Mach maximal certifié (MMO)'],0,'Au-delà apparaissent des zones supersoniques, une onde de choc et la traînée d\'onde.'],
 ['En montant à masse constante et à Mach constant, la marge entre décrochage basse vitesse et buffet haute vitesse :',['Se réduit (« coin du cercueil »)','Augmente','Reste constante','Disparaît dès le FL100'],0,'La vitesse de décrochage vraie augmente avec l\'altitude, tandis que le Mach de buffet reste à peu près fixe.'],
 ['Traînée 50 kN à 120 m/s. Puissance nécessaire au vol ?',['6 MW','0,42 MW','60 MW','6 kW'],0,'P = D × V = 50 000 × 120 = 6 000 000 W = 6 MW.'],
 ['Aile en flèche de 30° volant à Mach 0,80. Mach de la composante normale au bord d\'attaque ?',['≈ 0,69','≈ 0,40','0,80','≈ 0,92'],0,'M × cos 30° = 0,80 × 0,866 ≈ 0,69 : la flèche retarde l\'apparition du choc.'],
 ['Pneus gonflés à 200 psi. Vitesse d\'aquaplanage dynamique approchée (9 × √p, en kt) ?',['≈ 127 kt','≈ 90 kt','≈ 180 kt','≈ 1 800 kt'],0,'9 × √200 ≈ 9 × 14,1 ≈ 127 kt.'],
 ['Avion de 70 t à 150 kt (77 m/s). Énergie cinétique à dissiper par les freins lors d\'une interruption de décollage ?',['≈ 210 MJ','≈ 105 MJ','≈ 420 MJ','≈ 21 MJ'],0,'E = ½ m v² = 0,5 × 70 000 × 77,2² ≈ 208 MJ (105 MJ : oubli du carré ou du ½).'],
 ['Biréacteur de 70 t, 2 × 120 kN de poussée, traînée 60 kN. Un moteur en panne : pente de montée ?',['≈ 8,7 %','≈ 17,5 %','≈ 4,4 %','≈ 26 %'],0,'sin γ ≈ (T − D) / W = (120 − 60) / 686,7 ≈ 0,087, soit ≈ 8,7 % ; il ne reste que la moitié de la poussée.'],
 ['Température 25 °C, point de rosée 13 °C. Base approchée des cumulus (400 ft par °C d\'écart) ?',['≈ 4 800 ft','≈ 1 200 ft','≈ 3 000 ft','≈ 9 600 ft'],0,'(25 − 13) × 400 = 4 800 ft.'],
 ['Tropopause de l\'atmosphère type OACI :',['11 000 m (36 089 ft), −56,5 °C','8 000 m, −40 °C','11 000 ft, −7 °C','20 000 m, −56,5 °C'],0,'Au-dessus, la température reste constante à −56,5 °C jusqu\'à 20 km.'],
 ['Une force appliquée à un gyroscope en rotation produit son effet :',['Décalé de 90° dans le sens de rotation (précession)','Dans la direction de la force','À 180° de la force','Aucun effet'],0,'C\'est la précession gyroscopique (effet sur les hélices et les instruments).'],
 ['Si le centre de gravité recule jusqu\'au point neutre :',['La stabilité statique longitudinale devient nulle','L\'avion devient plus stable','La vitesse de décrochage augmente fortement','Seule la stabilité latérale change'],0,'Marge statique = point neutre − centre de gravité : nulle, l\'avion ne revient plus de lui-même.'],`;

const ALL_OLD = "const T={i:0,ans:[]}, ALL=()=>[...MATH.map(q=>q.concat('m')),...AERO.map(q=>q.concat('a'))];";
const ALL_NEW =
  "const XM=[" + EXPERT_M + "], XA=[" + EXPERT_A + "];\n" +
  "let SEL=null; const PICK=(a,n)=>{ const b=a.slice(); for(let i=b.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [b[i],b[j]]=[b[j],b[i]]; } return b.slice(0,n); };\n" +
  // par matière : 6 moyennes (2e tiers), les difficiles (3e tiers), 14 expertes sur 20 ; ordre progressif
  "const SECT=(L,X,t)=>{ const a=Math.floor(L.length/3), b=Math.floor(2*L.length/3), mid=L.slice(a,b), km=new Set(PICK(mid,6)), kx=new Set(PICK(X,14)); return [...mid.filter(q=>km.has(q)),...L.slice(b),...X.filter(q=>kx.has(q))].map(q=>q.concat(t)); };\n" +
  "const BUILD=()=>[...SECT(MATH,XM,'m'),...SECT(AERO,XA,'a')];\n" +
  "const T={i:0,ans:[]}, ALL=()=>SEL||(SEL=BUILD()); const NM=()=>ALL().filter(q=>q[4]==='m').length, NA=()=>ALL().filter(q=>q[4]==='a').length;\n" +
  "window.__PS_NIV2__={XM,XA,ALL:()=>ALL(),reset:()=>{ SEL=null; }};";
const LVL_OLD = "const LVL=q=>{ const L=q[4]==='m'?MATH:AERO, k=L.findIndex(x=>x[0]===q[0]), r=k/L.length; return r<1/3?'facile':r<2/3?'moyen':'difficile'; };";
const LVL_NEW = "const LVL=q=>{ const L=q[4]==='m'?MATH:AERO, k=L.findIndex(x=>x[0]===q[0]); if(k<0) return 'expert'; const r=k/L.length; return r<1/3?'facile':r<2/3?'moyen':'difficile'; };";
const TEST_OLD = 'function test(i,ans){ T.i=i; T.ans=ans;';
const TEST_NEW = 'function test(i,ans){ if(i===0&&!(ans&&ans.length)) SEL=null; T.i=i; T.ans=ans;';
const RES_OLD = 'const m=T.ans.slice(0,MATH.length).reduce((s,x)=>s+x,0), a=T.ans.slice(MATH.length).reduce((s,x)=>s+x,0)';
const RES_NEW = "const QS=ALL(), m=T.ans.reduce((s,x,i)=>s+(QS[i]&&QS[i][4]==='m'?x:0),0), a=T.ans.reduce((s,x,i)=>s+(QS[i]&&QS[i][4]==='a'?x:0),0)";
const SAVE_OLD = "localStorage.setItem('sim-level',JSON.stringify({m,a,t:Date.now()}))";
const SAVE_NEW = "localStorage.setItem('sim-level',JSON.stringify({m,a,nm:NM(),na:NA(),v:2,t:Date.now()}))";
const OK_OLD = 'mOK=m>=Math.ceil(MATH.length*0.8), mMid=m>=Math.ceil(MATH.length*0.5)&&!mOK, aOK=a>=Math.ceil(AERO.length*0.8)';
const OK_NEW = 'mOK=m>=Math.ceil(NM()*0.8), mMid=m>=Math.ceil(NM()*0.5)&&!mOK, aOK=a>=Math.ceil(NA()*0.8)';
const G_OLD = "${gauge('Mathématiques utiles aux calculs',m,MATH.length,80)}${gauge('Sciences utiles au vol',a,AERO.length)}${gauge('Niveau global',m+a,MATH.length+AERO.length)}";
const G_NEW = "${gauge('Mathématiques utiles aux calculs',m,NM(),80)}${gauge('Sciences utiles au vol',a,NA())}${gauge('Niveau global',m+a,NM()+NA())}<small>Test relevé (niveau ingénieur) : questions moyennes, difficiles et expertes [CALCULÉ].</small>";
const LG_OLD = "${gauge('Mathématiques',r.m,MATH.length,80)}${gauge('Sciences utiles au vol',r.a,AERO.length)}${gauge('Global',r.m+r.a,MATH.length+AERO.length)}";
const LG_NEW = "${gauge('Mathématiques',r.m,r.nm||MATH.length,80)}${gauge('Sciences utiles au vol',r.a,r.na||AERO.length)}${gauge('Global',r.m+r.a,(r.nm||MATH.length)+(r.na||AERO.length))}";

const PAIRS: [string, string][] = [
  [ALL_OLD, ALL_NEW], [LVL_OLD, LVL_NEW], [TEST_OLD, TEST_NEW], [RES_OLD, RES_NEW],
  [SAVE_OLD, SAVE_NEW], [OK_OLD, OK_NEW], [G_OLD, G_NEW], [LG_OLD, LG_NEW],
];

/** Applique les retouches ; une ancre introuvable laisse le test d'origine intact (aucune casse). */
export function patchNiveau(html: string): string {
  if (!PAIRS.every(([o]) => html.includes(o))) {
    console.warn('NIV2 : ancre du test de positionnement introuvable, test d\'origine conservé');
    return html;
  }
  return PAIRS.reduce((h, [o, n]) => h.replace(o, () => n), html);
}
