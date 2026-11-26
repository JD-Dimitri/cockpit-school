/**
 * TPS1 (demandes de l'auteur du 26/11/2026 09:46 et 10:11) :
 *  1. Temps réel VRAI : en « Durées réelles » (×1, bouton « ⏱ Temps réel ») ou avec un rythme choisi (×2, ×5, ×10, ×20…),
 *     plus aucun raccourci : la sous-étape « À moins de 250 km de la destination » (croisière des avions) et « À moins de 2 km
 *     de l'aire H » (hélicoptères) ne téléportent plus l'appareil ; le vol continue sous pilote automatique jusqu'à ce point.
 *     Paris → La Réunion dure donc ≈ 11 h en temps réel. Les raccourcis restent seulement en « Étapes courtes ».
 *  2. Le rythme choisi est appliqué tel quel dans tous les parcours : l'accélération automatique (croisière ×64, hélicoptère
 *     ×16, approche ×4) ne l'écrase plus. Limite de stabilité du calcul conservée : au-delà de ×4, il faut le pilote automatique
 *     en vol (ou l'appareil arrêté au sol) ; sinon ×4 est appliqué et le rythme choisi revient dès que c'est possible.
 *  3. Bandeau « arrivée » : distance restante, heure d'arrivée prévue (UTC), temps restant au rythme choisi et temps de vol
 *     écoulé depuis le décollage [CALCULÉ : distance orthodromique ÷ vitesse sol, ou vitesse de croisière avant le décollage].
 *  4. Trajets en sens contraire en mode automatique et guidé : Paris-CDG → JFK (A320, Learjet 60) et JFK → Manhattan
 *     (hélicoptères) s'ajoutent aux retours La Réunion → Paris déjà présents (777, A350). Bouton « ⇄ Trajet retour ».
 *  5. Sons : tous les sons passent par le mélangeur (Général, Voix, Alarmes…) : voix de synthèse (contrôleur, équipage,
 *     annonces), radio et sons de l'atelier, explosion ; « Son activé » décoché coupe aussi les voix.
 */
export const TEMPS_EXT = String.raw`(function(){
if (window.__PS_TPS__ || typeof stepsFor !== 'function' || typeof MISSIONS === 'undefined') return;
var TP = window.__PS_TPS__ = { t0: null, mi: null };
var real = function(){ return !!(window.DUR_ON || window.RT_LOCK); };
function esc(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

/* ---------- 4a. missions retour ---------- */
if (!MISSIONS['full-fw-ret']) MISSIONS['full-fw-ret'] = { dep:'LFPG', depRw:'26R', n:'Parcours pilote complet Paris-CDG → JFK',
  d:'Arrivée au parking de CDG à pied, tour avion, cockpit « cold & dark », devis de masse et carburant, mise en route, roulage, décollage 26R, croisière transatlantique, approche et atterrissage 31R à JFK, roulage, parking.',
  fw:true, full:true, start:function(){ return standOf('LFPG'); }, dest:'KJFK', destRw:'31R' };
if (!MISSIONS['full-rw-ret']) MISSIONS['full-rw-ret'] = { n:'Parcours pilote complet JFK → Manhattan',
  d:'Arrivée à pied sur l\'aire hélicoptères de JFK, visite pré-vol, cold & dark, devis de masse, mise en route, vol vers Manhattan, approche et posé sur l\'héliport de Downtown Manhattan, arrêt et sécurisation.',
  rw:true, full:true, start:function(){ return standOf('JFKH'); }, dest:'KJRB' };
var PAIR = { 'full-777-af':'full-777-af-ret', 'full-777-uu':'full-777-uu-ret', 'full-350':'full-350-ret', 'full-fw':'full-fw-ret', 'full-rw':'full-rw-ret' };
Object.keys(PAIR).forEach(function(k){ PAIR[PAIR[k]] = k; });
TP.pair = PAIR;

/* ---------- 1. pas de raccourci hors « Étapes courtes » ; destination réelle pour les hélicoptères ---------- */
function destName(){ var D = MI && APTS[MI.dest]; return D ? D.n : 'la destination'; }
function guardSteps(list){
  (list || []).forEach(function(st){
    if (!st || st.__tps) return; st.__tps = 1;
    var rwRet = A && A.kind === 'rw' && MI && MI.dest && MI.dest !== 'JFKH' && APTS[MI.dest];
    if (rwRet){ st.t = String(st.t).replace(/vers JFK/g, 'vers ' + destName()); }
    (st.items || []).forEach(function(it){
      var short = /^À moins de \d+ km/.test(it[0]);
      if (rwRet && /aire H|APTS\.JFKH/.test(it[0] + String(it[1]))){
        var D = APTS[MI.dest], lim = /Posé/.test(it[0]) ? 1 : 2;
        it[0] = /Posé/.test(it[0]) ? 'Posé' : 'À moins de 2 km de ' + D.n;
        it[1] = /Posé/.test(it[0]) ? function(){ return S.onGround && gcKm(S.lat, S.lon, D.lat, D.lon) < 1; } : function(){ return gcKm(S.lat, S.lon, D.lat, D.lon) < lim; };
        if (typeof it[2] === 'function') it[2] = function(){ var p = offsetLL(D.lat, D.lon, 1500, -1500); S.lat = p[0]; S.lon = p[1]; PATCH.lat = 999; };
      }
      if (short && typeof it[2] === 'function' && !it.__tps){
        var f = it[2]; it.__tps = 1;
        Object.defineProperty(it, 2, { configurable:true, enumerable:true, get:function(){ return real() ? null : f; }, set:function(v){ f = v; } });
      }
    });
  });
  return list;
}
var sf0 = stepsFor; stepsFor = function(){ return guardSteps(sf0.apply(this, arguments)); };
setInterval(function(){ try { if (GD && GD.steps) guardSteps(GD.steps); } catch (e) {} }, 1000);

/* ---------- 2. le rythme choisi est respecté ---------- */
function allowed(r){ if (r <= 4) return r; var air = S && !S.onGround;
  if ((AP.on && air) || (A.kind === 'rw' && air && AP.althold) || (S.onGround && Math.abs(S.V) < 0.5)) return r; return 4; }
setInterval(function(){
  try {
    if (!window.DUR_ON || window.FF || paused) { TP.cap = 0; return; }
    var want = window.RT_LOCK ? 1 : (+window.RSEL || 1), r = allowed(want);
    TP.cap = r < want ? want : 0;
    if (rate !== r){ rate = r; try { rateUI(true); } catch (e) { try { rateUI(); } catch (e2) {} } }
  } catch (e) {}
}, 250);

/* ---------- 3. bandeau « arrivée » ---------- */
var css = document.createElement('style');
css.textContent = '#ps-eta{position:fixed;z-index:31;left:8px;font:600 12px Inter,sans-serif;color:#e8eef2;background:#0b1622e6;border:1px solid #2b3d50;border-radius:8px;padding:5px 9px;pointer-events:none;max-width:min(460px,calc(100vw - 16px))}' +
  '#ps-eta b{color:#3fd0ff}#ps-eta .w{color:#ffd166}' +
  '#ckl .bd{height:min(60vh,540px);max-height:none!important;overscroll-behavior:contain}' +
  '#b-ret{white-space:nowrap}';
document.head.appendChild(css);
var bar = document.createElement('div'); bar.id = 'ps-eta'; bar.hidden = true; document.body.appendChild(bar);
function hm(s){ s = Math.max(0, Math.round(s)); var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return h ? h + ' h ' + String(m).padStart(2, '0') : m + ' min'; }
function cruiseMs(){ try { var alt = (AL() ? 35000 : ACK === 'lj60' ? 41000 : 6500) * FT; if (A.kind === 'rw') return (ACK === 'r44' ? 105 : ACK === 's76' ? 145 : 125) * KT;
  if (ACK === 'c172') return 105 * KT; return (ACK === 'b777' ? 0.84 : ACK === 'a350' ? 0.85 : 0.78) * sos(alt); } catch (e) { return 230; } }
setInterval(function(){
  try {
    var on = GD && GD.on && MI && MI.full && MI.dest && APTS[MI.dest] && $('menu').hidden;
    if (!on){ bar.hidden = true; return; }
    if (TP.mi !== MI){ TP.mi = MI; TP.t0 = null; }
    if (!S.onGround && TP.t0 == null) TP.t0 = simMs;
    var D = APTS[MI.dest], km = gcKm(S.lat, S.lon, D.lat, D.lon), gs = Math.max(S.onGround ? 0 : S.V, 0);
    var v = gs > 30 ? gs : cruiseMs(), simLeft = km * 1000 / v, rl = Math.max(1, rate || 1), eta = new Date(simMs + simLeft * 1000);
    var hud = $('hud'), r = hud && !hud.hidden ? hud.getBoundingClientRect() : null;
    bar.style.top = (r ? r.bottom + 4 : 60) + 'px';
    bar.innerHTML = '🛬 <b>' + esc(MI.dest) + '</b> · ' + Math.round(km).toLocaleString('fr-FR') + ' km · arrivée ≈ <b>' + String(eta.getUTCHours()).padStart(2, '0') + ':' + String(eta.getUTCMinutes()).padStart(2, '0') + ' Z</b>' +
      ' · reste ≈ <b>' + hm(simLeft) + '</b>' + (rl > 1 ? ' simulées, soit ' + hm(simLeft / rl) + ' réelles (×' + rl + ')' : ' (temps réel)') +
      (TP.t0 != null ? ' · vol ' + hm((simMs - TP.t0) / 1000) : '') +
      (!window.DUR_ON ? ' <span class="w">· « Étapes courtes » : raccourcis permis</span>' : '') +
      (TP.cap ? ' <span class="w">· ×' + TP.cap + ' demandé : ×4 tant que le pilote automatique n\'est pas engagé</span>' : '');
    bar.hidden = false;
  } catch (e) {}
}, 1000);

/* ---------- 4b. bouton « ⇄ Trajet retour » ---------- */
function curKey(){ var k = null; Object.keys(MISSIONS).forEach(function(x){ if (MISSIONS[x] === MI) k = x; }); return k; }
function retour(){
  var k = curKey(), p = k && PAIR[k];
  if (!p){ flash(ACK === 'c172' ? 'Tour de piste : départ et arrivée au même aérodrome (pas de trajet retour)' : 'Pas de trajet retour pour cette mission', 'am'); return; }
  var mode = AUTO && AUTO.on ? 'auto' : 'guide';
  try { selMI = p; BR.fromSim = true; renderMenu(); selAC = ACK; selMI = p; BR.launchMode(mode); flash('⇄ ' + MISSIONS[p].n, 'am'); } catch (e) { console.warn('trajet retour', e); }
}
TP.retour = retour;
function addBtn(){ var b = $('b-ret'); if (b) return; var ref = $('b-jump') || $('b-auto'); if (!ref) return;
  b = document.createElement('button'); b.type = 'button'; b.id = 'b-ret'; b.textContent = '⇄ Trajet retour';
  b.title = 'Même parcours dans le sens contraire (ex. La Réunion → Paris), en automatique ou guidé'; b.onclick = retour; ref.after(b); }
addBtn(); setInterval(addBtn, 1500);
var FO = window.FULLOF;
window.FULLOF = function(k){ var f = FO ? FO(k) : ((AC[k] || A).kind === 'fw' ? 'full-fw' : 'full-rw'); try { if (window.__PS_RET__ && PAIR[f] && /-ret$/.test(PAIR[f])) return PAIR[f]; } catch (e) {} return f; };

/* ---------- 5. sons : tout passe par le mélangeur ---------- */
function vol(cat){ try { if (!window.SND) return 1; if (!SND.on) return 0; var v = SND.vol || {}; return (v.master == null ? 1 : v.master) * (v[cat] == null ? 1 : v[cat]); } catch (e) { return 1; } }
if (window.speechSynthesis && !speechSynthesis.__ps){
  var sp = speechSynthesis.speak.bind(speechSynthesis);
  speechSynthesis.speak = function(u){ try { var k = vol('vox'); u.volume = Math.max(0, Math.min(1, (u.volume == null ? 1 : u.volume) * k)); } catch (e) {} return sp(u); };   // toujours prononcé (volume 0 si coupé) : les enchaînements qui attendent la fin de la phrase continuent
  speechSynthesis.__ps = 1;
}
var BAC = window.BaseAudioContext || window.AudioContext, dd = BAC && Object.getOwnPropertyDescriptor(BAC.prototype, 'destination');
if (dd && dd.get && !BAC.prototype.__ps){
  BAC.prototype.__ps = 1;
  Object.defineProperty(BAC.prototype, 'destination', { configurable:true, get:function(){
    var real0 = dd.get.call(this);
    if (window.SND && SND.ctx === this) return real0;
    if (!this.__psG){ var g = this.createGain(); g.connect(real0); this.__psG = g; }
    return this.__psG; } });
  setInterval(function(){
    try { var list = []; if (typeof AUD !== 'undefined' && AUD) list.push([AUD, 'vox']); if (typeof FX !== 'undefined' && FX && FX.ac) list.push([FX.ac, 'alert']);
      list.forEach(function(x){ if (x[0].__psG) x[0].__psG.gain.value = vol(x[1]); }); } catch (e) {}
  }, 250);
}
window.__PS_AUBUS__ = function(x){ try { if (!window.SND || SND.ctx !== x || !SND.n || !SND.n.out) return null;
  if (!SND.n.au){ var g = x.createGain(); g.connect(SND.n.out); SND.n.au = g; setInterval(function(){ try { g.gain.value = SND.vol && SND.vol.ck != null ? SND.vol.ck : 1; } catch (e) {} }, 250); }
  return SND.n.au; } catch (e) { return null; } };
})();`;

export function installTempsExt(frame: HTMLIFrameElement | null): boolean {
  const d = frame?.contentDocument, w = frame?.contentWindow as any;
  if (!d || !w || typeof w.stepsFor !== 'function' || typeof w.goStep !== 'function' || !w.DOCS) return false;
  if (w.__PS_TPS__) return true;
  const s = d.createElement('script');
  s.textContent = TEMPS_EXT;
  d.body.appendChild(s);
  return !!w.__PS_TPS__;
}
