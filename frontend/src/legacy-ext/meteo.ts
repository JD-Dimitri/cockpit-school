/**
 * F21 : choix de la météo et comportement physique du vol en conséquence, radio entièrement en audio.
 *
 * Le moteur d'origine (V10.42.1) tire déjà de la météo METAR : vent et rafales (dérive, vitesse sol, vent de face au décollage),
 * QNH, ATIS, turbulence mécanique, givrage dans les nuages et les précipitations (portance −22 %, traînée, sondes Pitot),
 * sons (pluie, grêle, vent, tonnerre et éclairs). Il ne propose que les METAR réels (en direct ou relevés) ou collés.
 *
 * Ajouts de cette extension (elle s'exécute DANS le cadre du moteur et passe par ses fonctions) :
 *  1. Choix de la météo (panneau radio, rubrique « Météo ») : réel, sec, nuageux, pluie, brouillard, neige, vent fort,
 *     orage, tempête, givrage. Chaque choix écrit des METAR cohérents [SIMULÉ] pour les aérodromes du vol : direction du
 *     vent et température réelles gardées quand c'est possible, le reste fixé par le scénario. ATIS, vent, rafales, QNH,
 *     givrage et sons suivent tout seuls, puisqu'ils viennent du METAR.
 *  2. Freinage selon l'état de la piste (sèche, mouillée, neige, glace) : coefficients relatifs [ESTIMÉ], ordres de grandeur
 *     du format mondial (GRF, OACI) ; ce n'est pas un calcul de performance certifié.
 *  3. Visibilité : brouillard et nuages bas réduisent la distance de vue ; dans la couche nuageuse, on ne voit plus le sol.
 *  4. Pluie et neige visibles sur l'écran ; turbulence d'orage ; impacts de foudre possibles dans l'orage (éclair, bruit,
 *     message) [SIMULÉ].
 *  5. Radio : les appels et collationnements du pilote sont dits par une voix de synthèse (différente de celle du contrôle),
 *     clairement présentée comme telle. Aucune voix réelle.
 * Rien ici ne change les caractéristiques des appareils, les fréquences ni les procédures.
 */
export const METEO_EXT = String.raw`(function(){
if (window.__PS_METEO__ || typeof wxSet !== 'function' || typeof WXS === 'undefined') return; window.__PS_METEO__ = 1;

/* ---------- 1. Scénarios météo ---------- */
var PRESETS = [
  ['reel', 'Réel', 'METAR observés (en direct ou relevés)'],
  ['sec', 'Soleil ☀️', 'CAVOK, ciel dégagé, vent faible'],
  ['nuageux', 'Nuageux', 'couches à 1 500 et 4 000 ft'],
  ['pluie', 'Pluie', 'pluie modérée, plafond 800 ft, piste mouillée'],
  ['brouillard', 'Brouillard', 'visibilité 200 m, ciel invisible'],
  ['neige', 'Neige', 'neige, −2 °C, piste enneigée, givrage'],
  ['vent', 'Vent fort', '25 kt, rafales 40 kt'],
  ['orage', 'Orage', 'orage et pluie, cumulonimbus, rafales, foudre'],
  ['tempete', 'Tempête', 'orage violent, grêle, rafales 55 kt'],
  ['ouragan', 'Ouragan', 'vent 75 kt, rafales 100 kt, pluie torrentielle : aucun vol possible'],
  ['givrage', 'Givrage', 'nuages à −4 °C, bruine verglaçante']
];
var MET = { k: 'reel', real: null, lastStrike: 0, strikes: 0 };
window.__PS_MET__ = MET;
function pad(n, w){ n = String(Math.round(n)); while (n.length < (w || 2)) n = '0' + n; return n; }
function stamp(){ var d = new Date(); return pad(d.getUTCDate()) + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + 'Z'; }
function tmp(t){ return t < 0 ? 'M' + pad(-t) : pad(t); }
/* Aérodromes du vol : départ, destination, puis ceux qui ont déjà un METAR */
function airports(){
  var L = [];
  try { if (ATC && ATC.dep) L.push(ATC.dep); } catch (e) {}
  try { if (MI && MI.dest) L.push(MI.dest); } catch (e) {}
  for (var k in WXS.met) L.push(k);
  return L.filter(function(k, i){ return L.indexOf(k) === i && APTS[k]; });
}
function metarFor(icao, k){
  var r = (MET.real && MET.real[icao]) || WXS.met[icao] || {}, dir = r.vrb || !r.spd ? 240 : r.dir, T = r.temp == null ? 15 : r.temp,
      q = r.qnh || 1013, D = pad(Math.round(dir / 10) * 10 % 360 || 360, 3), w = '', vis = '9999', wx = '', cl = '', t = T, dp = (r.dew == null ? T - 5 : r.dew);
  if (k === 'sec')       { w = D + '06KT'; vis = 'CAVOK'; dp = Math.min(dp, T - 8); }
  if (k === 'nuageux')   { w = D + '10KT'; cl = 'BKN015 OVC040'; dp = T - 3; }
  if (k === 'pluie')     { w = D + '14KT'; vis = '4000'; wx = 'RA'; cl = 'BKN008 OVC020'; t = Math.min(T, 14); dp = t - 1; q -= 6; }
  if (k === 'brouillard'){ w = D + '03KT'; vis = '0200'; wx = 'FG'; cl = 'VV001'; t = Math.min(T, 8); dp = t; }
  if (k === 'neige')     { w = D + '12KT'; vis = '1500'; wx = 'SN'; cl = 'OVC008'; t = -2; dp = -3; q -= 4; }
  if (k === 'vent')      { w = D + '25G40KT'; cl = 'SCT030'; dp = T - 6; q -= 8; }
  if (k === 'orage')     { w = D + '18G35KT'; vis = '3000'; wx = 'TSRA'; cl = 'BKN012CB OVC030'; t = Math.max(T, 18); dp = t - 2; q -= 5; }
  if (k === 'tempete')   { w = D + '35G55KT'; vis = '1500'; wx = '+TSRAGR'; cl = 'BKN008CB OVC020'; t = Math.max(T, 16); dp = t - 1; q -= 18; }
  if (k === 'ouragan')   { w = D + '75G100KT'; vis = '0800'; wx = '+TSRA'; cl = 'BKN005CB OVC015'; t = Math.max(T, 26); dp = t - 1; q -= 45; }
  if (k === 'givrage')   { w = D + '10KT'; vis = '3000'; wx = 'FZDZ'; cl = 'OVC006 OVC030'; t = -4; dp = -5; }
  var qq = icao[0] === 'K' ? 'A' + pad(Math.round(q / 33.8639 * 100), 4) : 'Q' + pad(q, 4);
  return ['METAR', icao, stamp(), w, vis, wx, cl, tmp(t) + '/' + tmp(Math.min(dp, t)), qq].filter(Boolean).join(' ');
}
function snapshotReal(){ if (MET.real) return; MET.real = {}; MET.realSrc = WXS.src; MET.realLive = WXS.live;
  for (var k in WXS.met) MET.real[k] = WXS.met[k]; }
var wxSet0 = window.wxSet;
/* Pendant un scénario choisi, un METAR réel qui arrive (direct) est gardé pour le retour à « Réel », sans écraser le scénario */
window.wxSet = function(raw, src){
  if (MET.k !== 'reel' && src !== 'sim' && src !== 'user') { var m = parseMetar(raw); if (m) { MET.real = MET.real || {}; MET.real[m.icao] = m; return true; } }
  return wxSet0(raw, src);
};
function apply(k){
  if (k === MET.k) return;
  if (k === 'reel') {
    WXS.met = {}; if (MET.real) for (var i in MET.real) WXS.met[i] = MET.real[i];
    WXS.src = MET.realSrc || 'samples'; WXS.live = !!MET.realLive; MET.real = null; MET.k = 'reel';
  } else {
    snapshotReal(); MET.k = k;
    airports().forEach(function(icao){ wxSet0(metarFor(icao, k), 'sim'); });
    WXS.live = false;
  }
  WXS.ver++; try { ST.wxT = 0; } catch (e) {}
  var p = PRESETS.filter(function(x){ return x[0] === k; })[0];
  flash('Météo : ' + p[1] + (k === 'reel' ? '' : ' [SIMULÉ]') + ' — ATIS, vent, piste et sons mis à jour', 'am');
  if (k === 'ouragan') setTimeout(function(){ flash('OURAGAN [SIMULÉ] : vent moyen 75 kt, rafales 100 kt, bien au-delà des limites de vent traversier de tous les appareils : aucun décollage ni atterrissage n\'est possible. Avions amarrés ou à l\'abri, aéroport fermé.', 'red'); }, 2700);
  try { localStorage.setItem('ps-meteo', k); } catch (e) {}
  if (typeof ATC !== 'undefined') { ATC.ver++; atcRender(true); }
}
window.__PS_METEO_APPLY__ = apply;

/* Panneau météo du moteur : boutons de choix au-dessus des METAR, source exacte affichée */
var panel0 = window.wxPanelHTML;
window.wxPanelHTML = function(){
  var h = panel0();
  if (MET.k !== 'reel') {
    var p = PRESETS.filter(function(x){ return x[0] === MET.k; })[0];
    h = h.replace(/<summary>Météo · [^<]*<\/summary>/, '<summary>Météo · scénario choisi : ' + p[1] + ' [SIMULÉ]</summary>');
  }
  var b = PRESETS.map(function(x){ return '<button type="button" data-met="' + x[0] + '" title="' + x[2] + '" class="' + (x[0] === MET.k ? 'now' : '') + '">' + x[1] + '</button>'; }).join('');
  var note = '<p class="anote">Choisissez la météo du vol. Un scénario écrit des METAR [SIMULÉ] pour les aérodromes du vol ; l\'ATIS, le vent, les rafales, le QNH, l\'état de la piste, la visibilité, le givrage, la turbulence et les sons en dépendent. « Réel » revient aux METAR observés.</p>';
  return h.replace(/(<summary>[\s\S]*?<\/summary>)/, '$1<div class="wxpick">' + b + '</div>' + note);
};
var bind0 = window.wxBind;
window.wxBind = function(p){
  bind0(p);
  p.querySelectorAll('[data-met]').forEach(function(btn){ btn.onclick = function(){ apply(btn.dataset.met); }; });
};

/* ---------- 2. État de la piste et freinage ---------- */
function metHere(){ var L = metNear(S.lat, S.lon)[0]; return L && L[0] < 30 ? L[1] : null; }
function rwyState(){
  var m = metHere(); if (!m) return { c: 6, n: 'sèche', k: 1 };
  var wx = (m.wx || []).join(' ');
  if (/FZ(RA|DZ)/.test(wx) || (/PL/.test(wx) && m.temp <= 0)) return { c: 1, n: 'glace', k: 0.25 };   // pluie ou bruine verglaçante (le brouillard givrant FZFG ne glace pas la piste à lui seul)
  if (/SN|SG|PL/.test(wx)) return { c: 3, n: 'neige', k: 0.45 };
  if (/GR|GS/.test(wx) || /\+/.test(wx)) return { c: 2, n: 'eau stagnante', k: 0.4 };
  if (/RA|DZ|SH|TS/.test(wx)) return { c: 5, n: 'mouillée', k: 0.65 };
  return { c: 6, n: 'sèche', k: 1 };
}
window.__PS_RWY__ = rwyState;

/* ---------- 2 bis. Densité de l'air réelle (température et pression du METAR) ----------
   Le moteur d'origine calcule la densité de l'atmosphère type (ISA, 15 °C et 1 013 hPa au niveau de la mer). Ici :
   ρ = P / (R·T) avec la pression ramenée par le QNH et la température ISA + ΔT (ΔT = écart du METAR à l'ISA, gardé en altitude),
   ce que font les calculs de performances réels [CALCULÉ]. Par temps chaud ou en altitude, l'air est moins dense : portance et
   poussée baissent, le décollage s'allonge ; par temps froid, l'inverse. Appliqué par la fonction de densité du moteur (retouche
   faite au chargement, pages/Simulator.tsx). */
function near200(){ var L = metNear(S.lat, S.lon)[0]; return L && L[0] < 200 ? L[1] : null; }
window.__PS_RHOK__ = function(h){
  try { var m = near200(); if (!m) return 1; var el = Math.max(0, elevAt(S.lat, S.lon)), Ti = isaT(Math.max(-500, h)), dT = (m.temp == null ? 15 : m.temp) - (isaT(el) - 273.15);
    var k = ((m.qnh || 1013.25) / 1013.25) * (Ti / (Ti + dT)); return isFinite(k) && k > 0.5 && k < 1.5 ? k : 1; } catch (e) { return 1; }
};
var brk0 = window.brkEff;
window.brkEff = function(){ var e = brk0(); return S && S.onGround ? e * rwyState().k : e; };

/* ---------- 3. Visibilité : brouillard, plafond, intérieur des nuages ---------- */
function visNow(){
  var m = metHere(); if (!m) return null; var ag = (S.alt - elevAt(S.lat, S.lon)) / FT, v = m.vis >= 10000 ? null : m.vis;
  var inCloud = (m.clouds || []).some(function(c){ return (c.cov === 'BKN' || c.cov === 'OVC' || c.cov === 'VV') && ag >= c.base - 100 && ag <= c.base + 2500; });
  if (inCloud) return 60;                                   // dans la couche : on ne voit plus rien (vol aux instruments)
  var low = (m.clouds || []).filter(function(c){ return c.cov === 'BKN' || c.cov === 'OVC' || c.cov === 'VV'; }).map(function(c){ return c.base; });
  if (low.length && ag > Math.min.apply(null, low) + 2500) return null;   // au-dessus des nuages : ciel dégagé
  return v;
}
/* Le moteur exclut du brouillard les feux, les halos et les étoiles (sprites) ; par visibilité réduite, ils y entrent aussi
   (un feu de piste ne se voit pas à 2 km dans 200 m de brouillard), puis reprennent leur réglage d'origine. */
var FOGGED = false, FOG0 = new WeakMap();
function fogAll(on){
  if (on === FOGGED) return; FOGGED = on;
  try { if (typeof SKY !== 'undefined' && SKY.stars) SKY.stars.visible = !on; } catch (e) {}   // étoiles invisibles dans le brouillard ou les nuages
  scene.traverse(function(o){ var m = o.material; (Array.isArray(m) ? m : m ? [m] : []).forEach(function(x){
    if (!(x.isSpriteMaterial || x.isPointsMaterial)) return;          // feux, halos, étoiles ; jamais les shaders du moteur
    if (on) { if (!FOG0.has(x)) FOG0.set(x, x.fog); if (x.fog === false) { x.fog = true; x.needsUpdate = true; } }
    else if (FOG0.has(x) && x.fog !== FOG0.get(x)) { x.fog = FOG0.get(x); x.needsUpdate = true; } }); });
}
var pc0 = window.placeCamera;
window.placeCamera = function(){
  pc0.apply(this, arguments);
  try { var v = visNow(), far = v == null ? null : Math.max(80, v * 1.4);
    if (far != null && scene.fog && far < scene.fog.far) { scene.fog.far = far; scene.fog.near = Math.min(scene.fog.near, far * 0.05); fogAll(true); }   // couleur : celle du moteur (heure, jour / nuit)
    else fogAll(false); } catch (e) {}
};

/* ---------- 4. Pluie et neige à l'écran, turbulence d'orage, foudre ---------- */
var css = document.createElement('style');
css.textContent = '#ps-precip{position:fixed;inset:0;pointer-events:none;z-index:3;opacity:0;transition:opacity 1s}'
 + '#ps-precip.rain{background-image:repeating-linear-gradient(103deg,rgba(200,215,235,.0) 0 9px,rgba(200,215,235,.35) 9px 10px,rgba(200,215,235,0) 10px 23px);background-size:120px 120px;animation:psrain .35s linear infinite}'
 + '#ps-precip.snow{background-image:radial-gradient(circle,rgba(255,255,255,.85) 0 1.6px,transparent 2.2px),radial-gradient(circle,rgba(255,255,255,.6) 0 1.1px,transparent 1.6px);background-size:70px 70px,43px 43px;animation:pssnow 3s linear infinite}'
 + '@keyframes psrain{to{background-position:-30px 120px}}@keyframes pssnow{to{background-position:20px 70px,-15px 43px}}'
 + '#atc .wxpick{display:flex;flex-wrap:wrap;gap:4px;margin:6px 0}#atc .wxpick button{padding:3px 8px}#atc .wxpick .now{border-color:#3ddc84;color:#3ddc84}';
document.head.appendChild(css);
var pr = document.createElement('div'); pr.id = 'ps-precip'; pr.setAttribute('aria-hidden', 'true'); document.body.appendChild(pr);
function precipTick(){
  try {
    var W = SND && SND.wxHere ? SND.wxHere() : null, ag = (S.alt - elevAt(S.lat, S.lon)) / FT, on = MI && $('menu').hidden;
    var k = !on || !W ? '' : W.snow > 0.05 ? 'snow' : W.rain > 0.05 ? 'rain' : '';
    pr.className = k; pr.style.opacity = k ? String(Math.min(0.9, 0.35 + (W.snow || W.rain) * 0.45)) : '0';
    /* foudre : dans un orage du METAR ou une cellule du radar, impact possible (≈ une fois toutes les quelques minutes) */
    var ts = W && W.ts && ag > 500 && ag < 20000, cell = typeof WXR !== 'undefined' && WXR.turb > 0.5;
    if (on && !S.onGround && (ts || cell) && performance.now() - MET.lastStrike > 90000 && Math.random() < 0.02) {
      MET.lastStrike = performance.now(); MET.strikes++;
      try { SND.lightning(0.2); } catch (e) {}
      try { if (SND.on) SND.thunder(0.3, 'wx'); } catch (e) {}
      flash('IMPACT DE FOUDRE [SIMULÉ] : éclair et bruit violents, éblouissement possible. Contrôler les instruments, les moteurs et les systèmes ; noter l\'impact au compte rendu matériel (inspection après le vol).', 'am');
    }
  } catch (e) {}
}
setInterval(precipTick, 1000);
/* turbulence d'orage : s'ajoute à celle du moteur (rafales METAR, cellules du radar) */
var gust0 = window.gustStep;
window.gustStep = function(dt){
  gust0(dt);
  try { if (!MI || S.onGround) return; var m = metHere(); if (!m) return; var ts = (m.wx || []).some(function(s){ return /TS/.test(s); }), ag = (S.alt - elevAt(S.lat, S.lon)) / FT;
    if (!ts || ag > 20000) { MET.ws = null; return; } var sw = /\+/.test((m.wx || []).join(' ')) ? 4.5 : 2.5;      // σw orage modéré à fort [ESTIMÉ]
    var V = Math.max(S.V, 30), tau = Math.max(1, 300 / V), a = Math.exp(-dt / tau), kk = Math.sqrt(1 - a * a);
    MET.tw = (MET.tw || 0) * a + sw * kk * rndN(); MET.tu = (MET.tu || 0) * a + sw * 0.7 * kk * rndN();
    GUST.w += MET.tw * kk; GUST.u += MET.tu * kk;
    /* micro-rafale (cisaillement de vent) sous un orage, en basse couche : d'abord un vent de face qui augmente (la vitesse
       indiquée monte), puis un courant descendant et un vent arrière (la vitesse chute) sur ≈ 20 s. Ordres de grandeur des
       micro-rafales documentées [ESTIMÉ ; principe : FAA AC 00-54, « Pilot Windshear Guide »]. */
    if (ag > 80 && ag < 1500 && !MET.ws && performance.now() - (MET.wsLast || 0) > 180000 && Math.random() < dt / 60) { MET.ws = { t: 0 }; MET.wsLast = performance.now();
      flash('WINDSHEAR AHEAD [SIMULÉ] : micro-rafale sous l\'orage — manœuvre de sortie : pleine poussée, ailes à plat, assiette vers l\'avertisseur de décrochage, configuration inchangée', 'red'); }
    if (MET.ws) { var T = MET.ws.t += dt, f = /\+/.test((m.wx || []).join(' ')) ? 1.4 : 1;
      if (T < 6) GUST.u += 7 * f * Math.sin(Math.PI * T / 6);                       // vent de face qui forcit
      else if (T < 20) { var x = (T - 6) / 14; GUST.u -= 12 * f * Math.sin(Math.PI * x); GUST.w -= 5 * f * Math.sin(Math.PI * x); }   // vent arrière et descendance
      else MET.ws = null; }
  } catch (e) {}
};

/* ---------- 5. Radio en audio : voix de synthèse du pilote ---------- */
var log0 = window.atcLog;
window.atcLog = function(who, st, en, fr){
  log0(who, st, en, fr);
  try {
    if (who !== 'PIL' || !ATC.voice || !window.speechSynthesis || !en) return;
    var u = new SpeechSynthesisUtterance(String(en).replace(/\bFL(\d+)/g, 'flight level $1').replace(/(\d)\.(\d)/g, '$1 decimal $2'));
    u.lang = 'en-GB'; u.rate = 1.12; u.pitch = 0.85; u.volume = 0.9;
    var v = speechSynthesis.getVoices().filter(function(x){ return /^en/i.test(x.lang); });
    if (v.length > 1) u.voice = v[1];
    speechSynthesis.speak(u);
  } catch (e) {}
};

/* Choix gardé d'une séance à l'autre */
try { var k0 = localStorage.getItem('ps-meteo'); if (k0 && k0 !== 'reel') setTimeout(function(){ apply(k0); }, 400); } catch (e) {}
})();`;

export function installMeteoExt(frame: HTMLIFrameElement | null): boolean {
  const d = frame?.contentDocument, w = frame?.contentWindow as any;
  if (!d || !w || typeof w.wxSet !== 'function') return false;
  if (w.__PS_METEO__) return true;
  const s = d.createElement('script');
  s.textContent = METEO_EXT;
  d.body.appendChild(s);
  return !!w.__PS_METEO__;
}
