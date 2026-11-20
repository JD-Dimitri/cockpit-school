/**
 * TA1 (demande de l'auteur, 20/11/2026 07:18) : visite de contrôle visuel (tour avion) plus réaliste.
 *  - plus de bip de recul (« signal sonore ») pendant la visite : retiré au chargement du moteur (pages/Simulator.tsx) ;
 *  - visite automatique plus lente, avec un ARRÊT devant chaque point numéroté (≈ 3 min, réglable) : le marcheur s'arrête,
 *    les bruits de pas cessent, la vue reste sur la pièce ; « Point suivant ▸ » permet d'écourter ;
 *  - logements de train : vue accroupie vers le haut, contrôle de l'intérieur (trappes ouvertes) ajouté au texte du point ;
 *    les ailes et l'empennage étaient déjà des points de la visite ;
 *  - flèches rouges qui montrent la pièce à contrôler (et le bord de l'écran quand elle est hors champ) ;
 *  - bouton « Bilan contrôle visuel » à la fin : tableau des points (contrôlé, anomalie, durée) → « Valider » → le bilan est
 *    rangé dans les documents de vol (📁 Documents, rubrique « Appareil et équipage »).
 * Limite honnête : les trappes de train ne s'ouvrent pas encore en 3D (texte et vue seulement). « On améliorera encore après. »
 */
export const TOUR_EXT = String.raw`(function(){
if (window.__PS_TA__ || typeof WALKPTS === 'undefined' || typeof autoWalk !== 'function') return;
var TA = window.__PS_TA__ = { hold: 180, cur: -1, until: 0, t0: {}, dur: {}, last: 0, bilan: null, key: '' };

/* ---------- 1. Logements de train : contrôle de l'intérieur ---------- */
var WELL = ' Intérieur du logement de train (trappes ouvertes, accroupi, lampe) : pas de fuite hydraulique ni de liquide, ' +
  'câblages et canalisations attachés, pas de corps étranger (FOD), vérins et mécanismes de verrouillage propres, trappes sans dommage.';
function enrich(){ Object.keys(WALKPTS).forEach(function(k){ (WALKPTS[k] || []).forEach(function(p){
  if (/train/i.test(p[2]) && !/Intérieur du logement/.test(p[3])) p[3] += WELL; }); }); }
enrich();
function isGear(i){ var p = (WALKPTS[ACK] || [])[i]; return !!p && /train/i.test(p[2]); }

/* ---------- 2. Arrêt devant chaque point (visite automatique) ---------- */
function seenN(){ return GD && GD.seen ? GD.seen.size : 0; }
function nextIdx(){ var pts = WALKPTS[ACK] || [], i = 0; while (i < pts.length && GD.seen.has(i)) i++; return i; }
function key(){ return (typeof MI !== 'undefined' && MI ? (MI.n || '') : '') + '|' + ACK; }
function reset(){ TA.asked = 0; TA.cur = -1; TA.until = 0; TA.t0 = {}; TA.dur = {}; TA.last = 0; TA.bilan = null; }
var walkBox0 = window.walkBox;
window.walkBox = function(i){
  walkBox0(i);
  var now = performance.now();
  if (TA.cur >= 0 && TA.t0[TA.cur] != null && TA.dur[TA.cur] == null) TA.dur[TA.cur] = (now - TA.t0[TA.cur]) / 1000;
  TA.cur = i; TA.t0[i] = now; TA.until = now + TA.hold * 1000;
  decorate();
};
var auto0 = window.autoWalk;
window.autoWalk = function(dt){
  if (key() !== TA.key) { TA.key = key(); reset(); }
  if (typeof AUTO !== 'undefined' && AUTO.on && TA.cur >= 0 && performance.now() < TA.until && !(typeof paused !== 'undefined' && paused)) {
    // à l'arrêt : on regarde la pièce contrôlée (pas de déplacement, donc pas de bruit de pas)
    try { var p = WALKPTS[ACK][TA.cur], q = m2l(p[0], p[1]), dx = q[0] - GD.walk.x, dz = q[1] - GD.walk.z;
      GD.walk.yaw += wrapPi(Math.atan2(-dx, -dz) - GD.walk.yaw - LK.yaw) * Math.min(1, dt * 1.5); } catch (e) {}
    return;
  }
  auto0(dt * 0.6);   // marche plus lente (≈ 0,9 m/s au lieu de 1,5 m/s)
};
/* fin de visite : l'étape « Tous les points contrôlés » n'est validée qu'avec le bilan, si la visite a vraiment été faite à pied
   (points atteints un par un) ; un saut d'étape (points cochés d'un coup) ne l'exige pas */
function walked(){ var n = (WALKPTS[ACK] || []).length; return n > 0 && Object.keys(TA.t0).length >= n; }
var done0 = window.walkDone;
window.walkDone = function(){ var d = done0(); if (!d || !walked()) return d; if (!TA.bilan && !document.getElementById('ps-bilan') && !TA.asked) { TA.asked = 1; setTimeout(bilanOpen, 600); } return !!TA.bilan; };
/* pause : le temps d'arrêt ne s'écoule pas */
setInterval(function(){ try { if (typeof paused !== 'undefined' && paused && TA.until) TA.until += 500; } catch (e) {} }, 500);
/* vue accroupie vers le haut devant un logement de train */
var cam0 = window.placeWalkCam;
window.placeWalkCam = function(){
  cam0.apply(this, arguments);
  try { if (TA.cur >= 0 && isGear(TA.cur) && performance.now() < TA.until) {
    var q = m2l(WALKPTS[ACK][TA.cur][0], WALKPTS[ACK][TA.cur][1]);
    if (Math.hypot(GD.walk.x - q[0], GD.walk.z - q[1]) < (A.kind === 'fw' ? 6 : 3)) { camera.position.y = 0.9; camera.rotateX(0.32); } } } catch (e) {}
};

/* ---------- 3. Flèches rouges vers la pièce à contrôler ---------- */
var css = document.createElement('style');
css.textContent = '#ps-arrow{position:fixed;left:0;top:0;width:0;height:0;pointer-events:none;z-index:64;display:none}'
 + '#ps-arrow svg{position:absolute;left:-60px;top:-60px;width:120px;height:120px;overflow:visible;filter:drop-shadow(0 0 3px #000)}'
 + '#ps-arrow span{position:absolute;left:18px;top:24px;white-space:nowrap;background:#d7261e;color:#fff;font:700 13px/1.2 "Barlow Condensed",sans-serif;letter-spacing:.04em;padding:3px 7px;border-radius:4px}'
 + '#ps-ta{position:fixed;left:50%;bottom:120px;transform:translateX(-50%);z-index:65;width:min(560px,calc(100vw - 20px));background:#0b1520ee;border:1px solid #2b3d50;border-left:4px solid #d7261e;border-radius:10px;padding:8px 10px;color:#e8eef2;font:13px/1.35 Inter,sans-serif;display:none}'
 + '.ps-hold{flex-wrap:wrap;gap:6px 8px;align-items:center}.ps-hold [hidden]{display:none!important}.ps-hold .ps-pt{flex:1 1 100%;font:700 14px "Barlow Condensed",sans-serif;letter-spacing:.04em}.ps-hold .bar{flex:1 1 120px;height:6px;background:#22313f;border-radius:3px;overflow:hidden}.ps-hold .bar i{display:block;height:100%;background:#d7261e}'
 + '.ps-hold button,.ps-bilan button{background:#132232;color:#fff;border:1px solid #2b3d50;border-radius:8px;padding:6px 10px;font:700 13px "Barlow Condensed",sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer}'
 + '.ps-hold button.go,.ps-bilan button.go{background:#1f8a4c;border-color:#3ddc84}'
 + '#ps-bilan{position:fixed;inset:0;z-index:72;background:#000a;display:flex;align-items:center;justify-content:center;padding:12px}'
 + '#ps-bilan .ps-bilan{background:#0d1824;color:#e8eef2;border:1px solid #2b3d50;border-radius:12px;max-width:680px;width:100%;max-height:90vh;overflow:auto;padding:14px 16px;font:14px/1.45 Inter,sans-serif}'
 + '#ps-bilan table{width:100%;border-collapse:collapse;font-size:13px}#ps-bilan td,#ps-bilan th{border-bottom:1px solid #1d2f40;padding:5px 4px;text-align:left;vertical-align:top}'
 + '#ps-bilan .ok{color:#3ddc84}#ps-bilan .ano{color:#ffb4a8}#ps-bilan h3{margin:0 0 6px;font:700 20px "Barlow Condensed",sans-serif;letter-spacing:.05em}';
document.head.appendChild(css);
var ar = document.createElement('div'); ar.id = 'ps-arrow'; ar.setAttribute('aria-hidden', 'true');
ar.innerHTML = '<svg viewBox="-60 -60 120 120"><g id="ps-arrow-g"><line x1="0" y1="0" x2="0" y2="52" stroke="#e02a1f" stroke-width="7" stroke-linecap="round"/>'
 + '<path d="M0 0 L-15 22 L15 22 Z" fill="#e02a1f"/></g></svg><span></span>';
document.body.appendChild(ar);
var V3 = new THREE.Vector3();
function arrowTick(){
  try {
    var on = typeof view !== 'undefined' && view === 'walk' && MI && $('menu').hidden, pts = WALKPTS[ACK] || [];
    var i = TA.cur >= 0 && performance.now() < TA.until ? TA.cur : nextIdx();
    if (!on || i >= pts.length || !GD.markers || !GD.markers.children[i]) { ar.style.display = 'none'; return; }
    GD.markers.children[i].getWorldPosition(V3); V3.y = Math.max(V3.y - 0.6, 0.4);
    var behind = V3.clone().sub(camera.position).dot(camera.getWorldDirection(new THREE.Vector3())) < 0;
    V3.project(camera); var W = innerWidth, H = innerHeight, x = (V3.x + 1) / 2 * W, y = (1 - V3.y) / 2 * H, ang = 0;
    if (behind) { x = W - x; y = H - y; }
    var off = behind || x < 30 || x > W - 30 || y < 60 || y > H - 60;
    if (off) {   // hors champ : flèche au bord de l'écran, tournée vers la pièce
      var cx = W / 2, cy = H / 2, dx = x - cx, dy = y - cy, k = Math.min((W / 2 - 40) / Math.max(1, Math.abs(dx)), (H / 2 - 80) / Math.max(1, Math.abs(dy)));
      x = cx + dx * k; y = cy + dy * k; ang = Math.atan2(dy, dx) * 180 / Math.PI - 90 + 180;
    }
    ar.style.display = 'block'; ar.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
    document.getElementById('ps-arrow-g').setAttribute('transform', 'rotate(' + Math.round(ang) + ')');
    ar.querySelector('span').textContent = (i + 1) + ' · ' + pts[i][2] + (off ? ' ←' : '');
  } catch (e) { ar.style.display = 'none'; }
}
setInterval(arrowTick, 100);

/* ---------- 4. Compte à rebours, « Point suivant », « Bilan contrôle visuel » ---------- */
/* bandeau propre à la visite, toujours visible (le panneau du guide peut être replié) ; structure fixe : les boutons ne sont
   jamais recréés pendant le compte à rebours, ils restent cliquables */
var ctl = document.createElement('div'); ctl.id = 'ps-ta'; ctl.className = 'ps-hold'; ctl.setAttribute('role', 'status');
ctl.innerHTML = '<b class="ps-pt"></b><span class="ps-left"></span><span class="bar"><i></i></span><button type="button" data-ta="next">Point suivant ▸</button>'
  + '<button type="button" class="go" data-ta="bilan">Bilan contrôle visuel</button>';
document.body.appendChild(ctl);
function decorate(){
  var pts = WALKPTS[ACK] || [], inWalk = typeof view !== 'undefined' && view === 'walk' && MI && $('menu').hidden;
  var left = Math.max(0, (TA.until - performance.now()) / 1000), done = seenN() >= pts.length && pts.length > 0;
  var holding = typeof AUTO !== 'undefined' && AUTO.on && left > 0 && TA.cur >= 0;
  ctl.style.display = inWalk && (holding || done || TA.cur >= 0) ? 'flex' : 'none';
  var P = ctl.querySelector('.ps-pt'), nm = TA.cur >= 0 && pts[TA.cur] ? (TA.cur + 1) + ' · ' + pts[TA.cur][2] : '';
  if (P.textContent !== nm) P.textContent = nm;
  var t = 'contrôle en cours : ' + Math.floor(left / 60) + ' min ' + String(Math.floor(left % 60)).padStart(2, '0') + ' s';
  var L = ctl.querySelector('.ps-left'); if (L.textContent !== t) L.textContent = t;
  L.hidden = !holding; ctl.querySelector('.bar').hidden = !holding; ctl.querySelector('[data-ta=next]').hidden = !holding;
  ctl.querySelector('.bar i').style.width = Math.round(100 * (1 - left / TA.hold)) + '%';
  ctl.querySelector('[data-ta=bilan]').hidden = !done;
}
setInterval(function(){ try { decorate(); } catch (e) {} }, 500);
document.addEventListener('click', function(e){
  var b = e.target.closest && e.target.closest('[data-ta]'); if (!b) return;
  if (b.dataset.ta === 'next') { TA.until = 0; decorate(); }
  if (b.dataset.ta === 'bilan') bilanOpen();
  if (b.dataset.ta === 'ok') bilanValidate();
  if (b.dataset.ta === 'x') { var m = document.getElementById('ps-bilan'); if (m) m.remove(); }
});
function anomalies(){ return (window.ANO_LOG || []).slice(); }
function rows(){
  var pts = WALKPTS[ACK] || [], ano = anomalies();
  if (TA.cur >= 0 && TA.t0[TA.cur] != null && TA.dur[TA.cur] == null) TA.dur[TA.cur] = (performance.now() - TA.t0[TA.cur]) / 1000;
  return pts.map(function(p, i){
    var a = ano.filter(function(x){ return x.pt === p[2] || x.pt === (i + 1) + '. ' + p[2] || String(x.pt).indexOf(p[2]) >= 0; })[0];
    return { n: i + 1, pt: p[2], seen: GD.seen.has(i), dur: TA.dur[i] || 0, ano: a ? a.txt + ' — ' + a.act : '' };
  });
}
function fmtD(s){ s = Math.round(s); return s >= 60 ? Math.floor(s / 60) + ' min ' + String(s % 60).padStart(2, '0') + ' s' : s + ' s'; }
function bilanOpen(){
  var R = rows(), tot = R.reduce(function(a, r){ return a + r.dur; }, 0), nA = R.filter(function(r){ return r.ano; }).length;
  var m = document.getElementById('ps-bilan'); if (m) m.remove();
  m = document.createElement('div'); m.id = 'ps-bilan'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-label', 'Bilan contrôle visuel');
  m.innerHTML = '<div class="ps-bilan"><h3>Bilan contrôle visuel</h3><p>' + A.name + ' · ' + R.length + ' points · durée ' + fmtD(tot) + ' · '
    + (nA ? nA + ' anomalie(s) traitée(s)' : 'aucune anomalie') + '</p><table><tr><th>N°</th><th>Point</th><th>État</th><th>Durée</th></tr>'
    + R.map(function(r){ return '<tr><td>' + r.n + '</td><td>' + r.pt + '</td><td class="' + (r.ano ? 'ano' : 'ok') + '">' + (r.seen ? (r.ano ? r.ano : 'Contrôlé · RAS') : 'non contrôlé') + '</td><td>' + (r.dur ? fmtD(r.dur) : '—') + '</td></tr>'; }).join('')
    + '</table><p style="font-size:12px;color:#8fa4b8">Le commandant de bord (ou son délégué) atteste la visite ; une anomalie est inscrite au compte rendu matériel et traitée avant le vol. [SIMULÉ]</p>'
    + '<div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap"><button type="button" data-ta="x">Fermer</button><button type="button" class="go" data-ta="ok">Valider</button></div></div>';
  document.body.appendChild(m);
}
function bilanValidate(){
  var R = rows(), d = new Date(), tot = R.reduce(function(a, r){ return a + r.dur; }, 0);
  TA.bilan = { date: d.toISOString().slice(0, 16).replace('T', ' ') + 'Z', ac: A.name, rows: R, tot: tot };
  if (window.DOCS && DOCS.D) {
    DOCS.D.walkcheck = { t: 'Bilan contrôle visuel (tour avion)', cat: 'Appareil et équipage', gen: function(c){
      var B = TA.bilan; if (!B) return { txt: 'Aucun bilan validé.' };
      return { txt: 'BILAN CONTRÔLE VISUEL (VISITE PRÉVOL EXTÉRIEURE) — ' + (c.reg || '') + ' (' + B.ac + ')\n'
        + 'VOL ' + (c.flt || '') + '   ' + (c.dep || '') + ' → ' + (c.dest || '') + '   validé le ' + B.date + '\n'
        + 'DURÉE TOTALE : ' + fmtD(B.tot) + '\n\n'
        + B.rows.map(function(r){ return String(r.n).padStart(2, ' ') + '. ' + r.pt + ' : ' + (r.seen ? (r.ano ? 'ANOMALIE — ' + r.ano : 'contrôlé, RAS') : 'NON CONTRÔLÉ') + (r.dur ? '   (' + fmtD(r.dur) + ')' : ''); }).join('\n')
        + '\n\nAnomalies : reportées au compte rendu matériel (tech log).\nVisa CDB : ' + ((c.crew && c.crew.cdb) || '________') + '\n[SIMULÉ] exercice pédagogique.' }; } };
  }
  var m = document.getElementById('ps-bilan'); if (m) m.remove();
  decorate();
  flash('Bilan contrôle visuel validé : rangé dans 📁 Documents (Appareil et équipage)', 'am');
  try { DOCS.open('walkcheck'); } catch (e) {}
}

/* ---------- 5. Moteurs en marche : zones de danger (MET2, demande de l'auteur du 20/11 08:41) ----------
   Une personne près de l'entrée d'air d'un réacteur en marche est aspirée ; derrière, le souffle la projette. Hélice et rotors
   tournants : zone interdite. Rayons et longueurs : ordres de grandeur au ralenti [ESTIMÉ] ; les valeurs exactes sont dans les
   documents des constructeurs (Airbus « Aircraft Characteristics – Airport and Maintenance Planning », § 6-3 « Danger areas of the
   engines » ; Boeing « Airplane Characteristics for Airport Planning », § 6) et dans le manuel de l'exploitant. Diamètres de rotor
   [RÉFÉRENCÉ constructeurs] : S-76 13,41 m, H125 10,69 m, R44 10,06 m. */
var DZ = { a320: { j: 1, rin: 4, lex: 45, hw: 4 }, a350: { j: 1, rin: 5.5, lex: 60, hw: 5 }, b777: { j: 1, rin: 6, lex: 60, hw: 5.5 }, lj60: { j: 1, rin: 2.5, lex: 25, hw: 2.5 },
  c172: { prop: [0, -3.6], r: 2.6 }, s76: { rot: 6.7 }, h125: { rot: 5.35 }, r44: { rot: 5.03 } };
function l2m(x, z){ var t = S.psi, c = Math.cos(t), s2 = Math.sin(t); return [x * c + z * s2, -x * s2 + z * c]; }
function engOn(i){ return !!(S.eng && (S.eng[i] || (S.n2 && S.n2[i] > 0.05))); }
function danger(){
  var d = DZ[ACK]; if (!d || !GD.walk) return null; var m = l2m(GD.walk.x, GD.walk.z), x = m[0], z = m[1];
  if (d.j) { var pts = (WALKPTS[ACK] || []).filter(function(p){ return /[Mm]oteur|[Rr]éacteur/.test(p[2]) && !/[Cc]apot/.test(p[2]); });
    for (var i = 0; i < pts.length; i++) { var e = pts[i], on = engOn(e[0] < 0 ? 0 : 1); if (!on) continue; var dx = x - e[0], dz = z - e[1];
      if (Math.hypot(dx, dz) < d.rin && dz < 2) return 'ASPIRÉ PAR L\'ENTRÉE D\'AIR du ' + e[2].toLowerCase() + ' en marche : à moins de ' + d.rin + ' m devant un réacteur, l\'aspiration emporte une personne.';
      if (dz >= 2 && dz < d.lex && Math.abs(dx) < d.hw) return 'PROJETÉ PAR LE SOUFFLE du ' + e[2].toLowerCase() + ' en marche : derrière un réacteur, même au ralenti, le jet (plusieurs centaines de km/h près de la tuyère) renverse et projette sur des dizaines de mètres.'; } }
  if (d.prop && S.eng && S.eng[0] && Math.hypot(x - d.prop[0], z - d.prop[1]) < d.r) return 'HAPPÉ PAR L\'HÉLICE en rotation : une hélice qui tourne est presque invisible ; on ne passe jamais dans son plan ni devant.';
  if (d.rot && (S.nr || 0) > 0.05) { var tail = (WALKPTS[ACK] || []).filter(function(p){ return /queue|arrière|anticouple/i.test(p[2]); })[0];
    if (tail && Math.hypot(x - tail[0], z - tail[1]) < 2.5) return 'HEURTÉ PAR LE ROTOR DE QUEUE en rotation : zone mortelle, on ne passe jamais derrière un hélicoptère rotor tournant.';
    if (Math.hypot(x, z) < d.rot + 0.5) return 'ENTRÉE SOUS LE ROTOR EN ROTATION sans le signe du pilote : on n\'approche qu\'à l\'avant, dans le champ de vision du pilote, après son accord, en se baissant.'; }
  return null;
}
setInterval(function(){
  try { if (typeof view === 'undefined' || view !== 'walk' || !MI || TA.acc) return; var why = danger(); if (!why) return;
    TA.acc = 1; showCrash('ACCIDENT AU SOL [SIMULÉ] — ' + why + ' Règle : moteurs ou rotors en marche, personne ne s\'approche des zones de danger ; le feu anticollision (BEACON) allumé signifie « moteurs en marche ou sur le point de démarrer ».');
    setTimeout(function(){ TA.acc = 0; }, 8000);
  } catch (e) {}
}, 200);
window.__PS_DANGER__ = danger;

/* Atelier des systèmes : véhicule ou personne près d'un moteur au démarrage ou en marche → interdit, sinon accident */
setInterval(function(){
  try { var sa = window.SYSAT, root = document.getElementById('sysat'); if (!sa || !root || root.hidden) return; var st = sa.S; if (!st || !st.es || !st.act) return;
    var svg = root.querySelector('svg.ac'); if (!svg) return;
    for (var i = 0; i < st.es.length; i++) { if (!st.es[i]) continue; var r = svg.querySelector('[data-p="e' + (i + 1) + '"]'); if (!r) continue; var b = r.getBBox(), cx = b.x + b.width / 2, R = b.width * 1.6;
      for (var id in st.act) { var a = st.act[id]; if (!a || /^(cdb|opl|cc|pnc|pax)/.test(id)) continue;   // équipage et passagers à bord
        var dIn = Math.hypot(a.x - cx, a.y - b.y), behind = a.y > b.y + b.height && a.y < b.y + b.height * 7 && Math.abs(a.x - cx) < b.width * 1.2;
        if ((dIn < R && a.y < b.y + b.height * 0.4) || behind) {
          st.es[i] = 0; delete st.act[id];
          var m = root.querySelector('#ps-acc'); if (!m) { m = document.createElement('div'); m.id = 'ps-acc'; m.setAttribute('role', 'alert'); root.appendChild(m); }
          m.innerHTML = '<b>ACCIDENT AU SOL [SIMULÉ]</b><p>' + (a.l || id) + ' ' + (behind ? 'dans le souffle' : 'dans la zone d\'aspiration') + ' du moteur ' + (i + 1) + ' au démarrage ou en marche. Moteur coupé.</p>'
            + '<p>Règle : avant la mise en route, tout véhicule (GPU, tracteur, bus) et toute personne sont hors des zones de danger des moteurs ; le mécanicien reste à l\'avant, relié par l\'interphone, dans le champ de vision du commandant.</p><button type="button" onclick="this.parentNode.remove()">Compris</button>';
          return; } } }
  } catch (e) {}
}, 300);
var cssA = document.createElement('style');
cssA.textContent = '#ps-acc{position:absolute;left:50%;top:20%;transform:translateX(-50%);z-index:20;max-width:min(460px,92vw);background:#3b0d0d;border:2px solid #ff3b30;border-radius:12px;padding:12px 14px;color:#fff;font:14px/1.45 Inter,sans-serif;box-shadow:0 10px 40px #000}'
 + '#ps-acc b{font:700 18px "Barlow Condensed",sans-serif;letter-spacing:.06em;color:#ff8a80}#ps-acc button{background:#ff3b30;color:#fff;border:0;border-radius:8px;padding:6px 14px;font:700 14px "Barlow Condensed",sans-serif;cursor:pointer}';
document.head.appendChild(cssA);
})();`;

export function installTourExt(frame: HTMLIFrameElement | null): boolean {
  const d = frame?.contentDocument, w = frame?.contentWindow as any;
  if (!d || !w || typeof w.autoWalk !== 'function' || !w.DOCS) return false;
  if (w.__PS_TA__) return true;
  const s = d.createElement('script');
  s.textContent = TOUR_EXT;
  d.body.appendChild(s);
  return !!w.__PS_TA__;
}
