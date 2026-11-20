/**
 * TA2 et TA3 (demandes de l'auteur, 20/11/2026 07:20 et 08:22) : tablette de documents à l'installation dans le poste ;
 * TOUTES les conversations de l'équipage et TOUTES les check-lists, phase par phase.
 *
 * - Check-lists : celles du dossier de vol du moteur (📁 Documents › Check-lists normales), lues en « question / réponse »
 *   [RÉFÉRENCÉ : FAA AC 120-71B, « Standard Operating Procedures and Pilot Monitoring Duties », § 5.1.4].
 * - Annonces : briefings, installation, données de décollage, mise en route, roulage (« clear left / clear right », commandes),
 *   alignement, croisière, briefing d'arrivée ; en direct d'après l'état réel de l'avion : poussée affichée, 100 kt, V1, rotation,
 *   vario positif / train rentré, altitude et niveau de transition, check-list atterrissage, 1 000 ft stabilisé, 500 ft, minima,
 *   déporteurs, inverseurs, décélération, 70 kt. Principe : AC 120-71B ; roulage : CAAS AC 121-2-4 (§ 2.3.2, § 2.5.1) ;
 *   approche stabilisée : Flight Safety Foundation, ALAR. Formulations usuelles, génériques [ESTIMÉ] : chaque compagnie fixe
 *   les siennes dans son manuel d'exploitation.
 * - Le panneau Radio lance chaque conversation ou check-list (rubrique « Équipage ») ; le parcours guidé les lance aussi à
 *   l'étape correspondante. Le bouton « 🔊 Son » du simulateur rend les voix audibles (voix de synthèse, présentées comme
 *   telles, aucune voix réelle) ; son coupé : sous-titres seulement.
 * - Appareils à un seul pilote (C172, R44, H125) : pas de copilote, le pilote lit et annonce seul.
 * - Tablette (EFB) : à l'installation en poste, tous les documents en tuiles ; checklist : étape avec documents → tablette,
 *   sinon l'étape s'ouvre.
 */
export const EQUIPAGE_EXT = String.raw`(function(){
if (window.__PS_EQ__ || typeof GD === 'undefined' || !window.DOCS) return;
var EQ = window.__PS_EQ__ = { last: '', played: {}, log: [], st: {}, flight: '' };
function twoCrew(){ return ['a320', 'a350', 'b777', 'lj60', 's76'].indexOf(ACK) >= 0; }
function fw(){ return A.kind === 'fw'; }
function rwDep(){ try { return MI.depRw || ''; } catch (e) { return ''; } }
function rwArr(){ try { return MI.destRw || ''; } catch (e) { return ''; } }
function qnh(){ try { return Math.round(qnhAt(S.lat, S.lon)); } catch (e) { return 1013; } }
function num(n){ return String(n).split('').join(' '); }

/* ---------- 1. Les check-lists : celles du dossier de vol du moteur (📁 Documents › Check-lists normales) ----------
   Lecture « challenge / response » [RÉFÉRENCÉ : FAA AC 120-71B § 5.1.4] : le pilote qui conduit la check-list annonce l'élément,
   l'autre vérifie et donne la réponse ; à la fin, « … checklist complete ». Un seul pilote : il lit et répond à voix haute. */
function ckSections(){
  var out = {}, cur = null, txt = '';
  try { txt = DOCS.D.checklist.gen(DOCS.ctx()).txt || ''; } catch (e) { return out; }
  txt.split('\n').forEach(function(l){
    if (/^[A-ZÀ-Ý][A-ZÀ-Ý \-/()]+$/.test(l.trim()) && !/CHECK-LISTS/.test(l)) { cur = l.trim(); out[cur] = []; return; }
    if (!cur) return;
    l.split(/\s{3,}(?=\S)/).forEach(function(seg){ var m = /^\s*(.+?)\s*\.{3,}\s*(.+?)\s*$/.exec(seg); if (m) out[cur].push([m[1], m[2]]); });
  });
  return out;
}
/* section de check-list pour une phase (Airbus : sections en anglais ; autres appareils : résumé en français) */
var CKMAP = { bstart: ['BEFORE START', 'AVANT MISE EN ROUTE'], astart: ['AFTER START', 'MISE EN ROUTE'], taxi: ['TAXI', ''], lineup: ['LINE-UP', 'AVANT DÉCOLLAGE'],
  app: ['APPROACH', ''], ldg: ['LANDING', ''], after: ['AFTER LANDING', ''], park: ['PARKING', 'APRÈS ATTERRISSAGE / ARRÊT'], secure: ['SECURING THE AIRCRAFT', ''] };
function checklist(k){
  var S_ = ckSections(), names = CKMAP[k] || [], name = names.filter(function(n){ return n && S_[n]; })[0]; if (!name) return [];
  var items = S_[name], two = twoCrew(), L = [];
  L.push(['CDB', name.toLowerCase().replace(/^./, function(c){ return c.toUpperCase(); }) + ' checklist.', 'Check-list « ' + name + ' ».']);
  items.forEach(function(it){
    var resp = it[1].replace(/_+/g, '').replace(/\s+/g, ' ').trim() || 'checked';
    if (two) { L.push(['OPL', it[0] + '?', it[0] + ' ?']); L.push(['CDB', resp + '.', resp + '.']); }
    else L.push(['CDB', it[0] + ': ' + resp + '.', it[0] + ' : ' + resp + '.']);
  });
  L.push([two ? 'OPL' : 'CDB', name.toLowerCase().replace(/^./, function(c){ return c.toUpperCase(); }) + ' checklist complete.', 'Check-list « ' + name + ' » terminée.']);
  return L;
}

/* ---------- 2. Les annonces de l'équipage, phase par phase ----------
   Principe des procédures standard [RÉFÉRENCÉ : FAA AC 120-71B ; CAAS AC 121-2-4 pour le roulage ; Flight Safety Foundation, ALAR,
   pour l'approche stabilisée à 1 000 ft] ; formulations usuelles, génériques [ESTIMÉ] : chaque compagnie fixe les siennes. */
function P(){ var two = twoCrew(), F = fw();
  function c(a, b){ return two ? a : b; }
  return [
  { k: 'brief', t: 'Briefing de départ', re: /Briefing|dossier de vol/i, L: c([
      ['CDB', 'Departure briefing. Runway ' + rwDep() + ', departure as cleared, initial altitude as cleared.', 'Briefing départ : piste ' + rwDep() + ', départ et altitude initiale selon la clairance.'],
      ['CDB', F ? 'Engine failure or fire before V1: I call stop and we reject. After V1: we continue, engine-out procedure.' : 'Engine failure in hover: land straight ahead. In climb: one engine inoperative procedure.', F ? 'Panne ou feu moteur avant V1 : j\'annonce « stop », on interrompt. Après V1 : on continue, procédure panne moteur.' : 'Panne en stationnaire : posé droit devant. En montée : procédure un moteur en panne.'],
      ['OPL', 'Briefing understood, no questions.', 'Briefing compris, pas de question.']],
     [['CDB', 'Departure briefing: runway ' + rwDep() + ', departure as cleared. Engine failure on take-off roll: abort.', 'Briefing départ : piste ' + rwDep() + '. Panne au décollage : on interrompt.']]) },
  { k: 'bord', t: 'Installation en poste', re: /Monter à bord|installé en poste|cold/i, L: c([
      ['CDB', 'Documents on board, flight folder checked.', 'Documents à bord, dossier de vol vérifié.'],
      ['OPL', 'Checked. Tech log and MEL reviewed, no open item affecting the flight.', 'Vérifié. Compte rendu matériel et MEL consultés : rien qui empêche le vol.']],
     [['CDB', 'Documents on board, tech log checked.', 'Documents à bord, compte rendu matériel vérifié.']]) },
  { k: 'perf', t: 'Données de décollage', re: /FMS|Performances|INIT/i, L: c([
      ['CDB', 'Take-off data: please cross-check V1, VR, V2 and flap setting.', 'Données de décollage : contre-vérifie V1, VR, V2 et les volets.'],
      ['OPL', 'V1 ' + (LS.v1 || '') + ', VR ' + (LS.vr || '') + ', V2 ' + (LS.v2 || '') + '. Cross-checked.', 'V1 ' + (LS.v1 || '—') + ', VR ' + (LS.vr || '—') + ', V2 ' + (LS.v2 || '—') + ' : contre-vérifié.']],
     [['CDB', 'Take-off data checked against the performance computation.', 'Données de décollage vérifiées avec le calcul de performances.']]) },
  { k: 'bstart', t: 'Avant mise en route', re: /Before Start|Avant la mise en route/i, L: [] },
  { k: 'start', t: 'Mise en route', re: /Démarrage/i, L: c([
      ['CDB', F ? 'Starting engine two.' : 'Starting engine.', F ? 'Démarrage du moteur 2.' : 'Démarrage du moteur.'],
      ['OPL', F ? 'N2 rising, oil pressure rising.' : 'NG rising, oil pressure rising.', F ? 'N2 qui monte, pression d\'huile qui monte.' : 'NG qui monte, pression d\'huile qui monte.'],
      ['OPL', 'Light-up, EGT rising.', 'Allumage, EGT qui monte.'],
      ['CDB', 'Engine stabilized, parameters normal.', 'Moteur stabilisé, paramètres normaux.']],
     [['CDB', 'Starting engine. Oil pressure rising. Engine stabilized.', 'Démarrage. Pression d\'huile qui monte. Moteur stabilisé.']]) },
  { k: 'astart', t: 'Après mise en route', re: /Après mise en route/i, L: [] },
  { k: 'taxi', t: 'Roulage', re: /roulage/i, L: c([
      ['CDB', 'Taxi clearance: we agree on the route on the aerodrome chart?', 'Clairance de roulage : on est d\'accord sur l\'itinéraire, carte d\'aérodrome en main ?'],
      ['OPL', 'Route agreed, I follow our progress on the chart.', 'Itinéraire d\'accord, je suis notre progression sur la carte.'],
      ['CDB', 'Clear left.', 'Dégagé à gauche.'], ['OPL', 'Clear right.', 'Dégagé à droite.'],
      ['CDB', 'Flight control check.', 'Vérification des commandes de vol.'],
      ['OPL', 'Full up, full down, neutral. Full left, full right, neutral.', 'Plein cabré, plein piqué, neutre. Plein gauche, plein droite, neutre.']],
     [['CDB', 'Taxi route checked on the chart. Clear left, clear right. Flight controls free and correct.', 'Itinéraire vérifié sur la carte. Dégagé à gauche, dégagé à droite. Commandes libres et dans le bon sens.']]) },
  { k: 'lineup', t: 'Alignement', re: /Before Takeoff|Alignement/i, L: c([
      ['CDB', 'Runway ' + rwDep() + ' confirmed, heading checked.', 'Piste ' + rwDep() + ' confirmée, cap vérifié.'],
      ['OPL', 'Runway ' + rwDep() + ' confirmed. Approach path clear, runway clear.', 'Piste ' + rwDep() + ' confirmée. Trajectoire d\'approche dégagée, piste dégagée.']],
     [['CDB', 'Runway ' + rwDep() + ' confirmed. Approach path clear, runway clear.', 'Piste ' + rwDep() + ' confirmée. Trajectoire d\'approche dégagée, piste dégagée.']]) },
  { k: 'cruise', t: 'Croisière', re: /Croisière/i, L: c([
      ['CDB', 'Fuel check: fuel on board against flight plan.', 'Contrôle carburant : carburant à bord comparé au plan de vol.'],
      ['OPL', 'Fuel checked, within plan.', 'Carburant vérifié, conforme au plan.']],
     [['CDB', 'Fuel check: on board against plan, checked.', 'Contrôle carburant : comparé au plan, vérifié.']]) },
  { k: 'desc', t: 'Briefing d\'arrivée', re: /descente|Descente/i, L: c([
      ['CDB', 'Approach briefing: runway ' + rwArr() + ', approach and minimums as published, missed approach as published.', 'Briefing arrivée : piste ' + rwArr() + ', approche et minima publiés, procédure d\'approche interrompue publiée.'],
      ['OPL', 'Briefing understood.', 'Briefing compris.']],
     [['CDB', 'Approach briefing: runway ' + rwArr() + ', minimums and missed approach as published.', 'Briefing arrivée : piste ' + rwArr() + ', minima et approche interrompue publiés.']]) },
  { k: 'app', t: 'Approche', re: /Approche|approche/i, L: [] },
  { k: 'after', t: 'Après l\'atterrissage', re: /Après l|vers le parking/i, L: [] },
  { k: 'park', t: 'Parking', re: /Parking et|Arrêt/i, L: [] },
  { k: 'secure', t: 'Sécurisation', re: /Sécurisation/i, L: [] }
  ];
}
function linesFor(ph){ var ck = checklist(ph.k); return ph.L.concat(ck); }

/* ---------- 3. Annonces en direct (vitesse, altitude, configuration) ----------
   déclenchées par l'état réel de l'avion : « 100 knots », « V1 », « rotate », « positive climb », altitude de transition,
   1 000 ft (approche stabilisée), 500 ft, minima, puis à l'atterrissage « spoilers », « reverse green », « decel », « 70 knots ». */
function live(){
  if (!MI || !GD.on || typeof airdata !== 'function') return; var f = (MI.n || '') + '|' + ACK; if (f !== EQ.flight) { EQ.flight = f; EQ.st = {}; }
  var d; try { d = airdata(); } catch (e) { return; } var st = EQ.st, two = twoCrew(), F = fw(), cas = d.cas || 0, ra = d.ra == null ? 9999 : d.ra, vs = d.vs || 0, gnd = S.onGround;
  var PM = two ? 'OPL' : 'CDB';
  function once(k, lines){ if (st[k]) return; st[k] = 1; say3(lines); }
  if (F && gnd && !ATC.flown) {
    var v1 = LS.v1 || (ACK === 'c172' ? 0 : 0), vr = LS.vr || (ACK === 'c172' ? 55 : 0), chk = ACK === 'c172' ? 0 : 100;
    if (cas > 30 && S.thr > 0.6) once('tset', [[two ? 'CDB' : 'CDB', two ? 'Take-off. Thrust set.' : 'Full power, engine instruments green.', two ? 'Décollage. Poussée affichée.' : 'Plein gaz, instruments moteur au vert.']]);
    if (ACK === 'c172' && cas >= 25) once('alive', [['CDB', 'Airspeed alive.', 'Badin actif.']]);
    if (chk && cas >= chk) once('100', [[PM, 'One hundred knots.', 'Cent nœuds.'], ['CDB', 'Checked.', 'Vérifié.']]);
    if (v1 && cas >= v1) once('v1', [[PM, 'V1.', 'V1.']]);
    if (vr && cas >= vr) once('vr', [[PM, 'Rotate.', 'Rotation.']]);
  }
  if (F && !gnd && vs > 300 && ra > 30 && ra < 1500) once('pos', [[PM, 'Positive climb.', 'Vario positif.'], ['CDB', 'Gear up.', 'Train rentré.']].concat(two ? [['OPL', 'Gear up.', 'Train rentré.']] : []));
  var h = S.alt / FT, ta = typeof transAlt === 'function' ? transAlt() : 18000;
  if (!gnd && vs > 300 && h > ta) once('ta', [[PM, 'Transition altitude, standard set.', 'Altitude de transition : calage standard.'], ['CDB', 'Standard set, crosschecked.', 'Standard affiché, contre-vérifié.']]);
  if (!gnd && vs < -300 && h < ta && st.ta) once('tl', [[PM, 'Transition level, QNH ' + qnh() + ' set.', 'Niveau de transition : QNH ' + qnh() + ' affiché.'], ['CDB', 'QNH ' + qnh() + ' set, crosschecked.', 'QNH ' + qnh() + ' affiché, contre-vérifié.']]);
  if (!gnd && st.ta && vs < -200 && ra < 1500 && ra > 1000) once('ldgck', checklist('ldg'));
  if (!gnd && st.ta && vs < -200 && ra <= 1000 && ra > 500) once('1000', [[PM, 'One thousand.', 'Mille pieds.'], ['CDB', 'Stabilized, continue.', 'Stabilisé, on continue.']]);
  if (!gnd && st.ta && vs < -200 && ra <= 500 && ra > 220) once('500', [[PM, 'Five hundred.', 'Cinq cents.']]);
  if (!gnd && st.ta && vs < -200 && ra <= 220 && ra > 50) once('mini', [[PM, 'Minimums.', 'Minima.'], ['CDB', 'Landing.', 'On atterrit.']]);
  if (F && gnd && ATC.flown && cas > 40) once('touch', two ? [['OPL', 'Spoilers.', 'Déporteurs sortis.'], ['OPL', 'Reverse green.', 'Inverseurs verts.'], ['OPL', 'Decel.', 'Décélération.']] : [['CDB', 'Braking.', 'Freinage.']]);
  if (F && gnd && ATC.flown && cas < 72 && st.touch) once('70', two ? [['OPL', 'Seventy knots.', 'Soixante-dix nœuds.']] : []);
}
setInterval(function(){ try { live(); } catch (e) {} }, 250);
window.__ps_live_now = live;   // tests : un passage immédiat

/* ---------- 4. Affichage et voix ----------
   Sous-titres toujours affichés ; voix de synthèse seulement quand le son du simulateur est actif (bouton « 🔊 Son »). */
var css = document.createElement('style');
css.textContent = '#ps-eq{position:fixed;right:10px;top:70px;z-index:64;max-width:min(420px,calc(100vw - 20px));max-height:45vh;overflow:auto;background:#0b1520ee;border:1px solid #2b3d50;border-left:4px solid #3fd0ff;border-radius:10px;padding:8px 10px;color:#e8eef2;font:13px/1.4 Inter,sans-serif;display:none}'
 + '#ps-eq b{font:700 12px "Barlow Condensed",sans-serif;letter-spacing:.12em;color:#3fd0ff;text-transform:uppercase}#ps-eq p{margin:4px 0}#ps-eq .w{color:#ffd166;font-weight:700}#ps-eq small{color:#8fa4b8}'
 + '#ps-eq button{float:right;background:none;border:0;color:#8fa4b8;font-size:18px;cursor:pointer;line-height:1}'
 + '#atc .ps-crew{margin-top:8px;border-top:1px solid #1d2f40;padding-top:6px}#atc .ps-crew b{display:block;font:700 12px "Barlow Condensed",sans-serif;letter-spacing:.12em;color:#3fd0ff;text-transform:uppercase;margin-bottom:4px}'
 + '#atc .ps-crew .row{display:flex;flex-wrap:wrap;gap:4px}#atc .ps-crew button{padding:3px 8px;font-size:12px}#atc .ps-crew button.now{border-color:#3ddc84;color:#3ddc84}'
 + '#ps-efb{position:fixed;inset:0;z-index:69;background:#000b;display:flex;align-items:center;justify-content:center;padding:12px}'
 + '#ps-efb .tab{background:#1b1f24;border:10px solid #0d0f12;border-radius:26px;box-shadow:0 10px 40px #000;width:min(760px,100%);max-height:92vh;display:flex;flex-direction:column;overflow:hidden}'
 + '#ps-efb .scr{background:#eef2f6;color:#111;flex:1;overflow:auto;padding:12px;border-radius:12px}'
 + '#ps-efb .bar{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;font:700 16px "Barlow Condensed",sans-serif;letter-spacing:.05em}'
 + '#ps-efb .bar button{background:#1f2a36;color:#fff;border:0;border-radius:8px;padding:6px 12px;font:700 13px "Barlow Condensed",sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}'
 + '#ps-efb h5{margin:10px 2px 6px;font:700 12px "Barlow Condensed",sans-serif;letter-spacing:.12em;color:#3a5568;text-transform:uppercase}'
 + '#ps-efb .tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px}'
 + '#ps-efb .tiles button{min-height:72px;background:#fff;border:1px solid #c9d3dd;border-radius:10px;padding:8px;text-align:left;font:600 13px/1.25 Inter,sans-serif;color:#122;cursor:pointer;display:flex;flex-direction:column;gap:4px}'
 + '#ps-efb .tiles button i{font-style:normal;font-size:20px}';
document.head.appendChild(css);
var box = document.createElement('div'); box.id = 'ps-eq'; box.setAttribute('role', 'log'); box.setAttribute('aria-live', 'polite'); document.body.appendChild(box);
box.addEventListener('click', function(e){ if (e.target.closest('[data-eqx]')) box.style.display = 'none'; });
function audible(){ try { return !!(window.SND && SND.on); } catch (e) { return false; } }
function voice(who, en){
  try { if (!audible() || !window.speechSynthesis) return;
    var u = new SpeechSynthesisUtterance(en.replace(/\bV1\b/g, 'V one').replace(/\bQNH\b/g, 'Q N H')); u.lang = 'en-GB'; u.rate = 1.05; u.pitch = who === 'OPL' ? 1.15 : 0.85;
    var v = speechSynthesis.getVoices().filter(function(x){ return /^en/i.test(x.lang); }); if (v.length > 2) u.voice = v[who === 'OPL' ? 2 : 1];
    speechSynthesis.speak(u); } catch (e) {}
}
function head(title){
  box.style.display = 'block';
  box.innerHTML = '<button type="button" aria-label="Fermer" data-eqx>×</button><b>Équipage · ' + title + '</b><small> — ' + (audible() ? 'voix de synthèse' : 'son coupé : sous-titres') + '</small>';
}
function line(L){ var p = document.createElement('p');
  p.innerHTML = '<span class="w">' + (L[0] === 'CDB' ? (twoCrew() ? 'Commandant (vous)' : 'Pilote (vous)') : 'Copilote') + ' :</span> « ' + L[1] + ' » <small>' + L[2] + '</small>';
  box.appendChild(p); box.scrollTop = box.scrollHeight; EQ.log.push([L[0], L[1]]); voice(L[0], L[1]); }
var Q = [], busy = false;
function say3(lines){ if (!lines || !lines.length) return; if (box.style.display !== 'block') head('annonces'); Q = Q.concat(lines); pump(); }
function pump(){ if (busy || !Q.length) return; busy = true; var L = Q.shift(); line(L); setTimeout(function(){ busy = false; pump(); }, 900 + L[1].length * 30); }
function play(ph){ var L = linesFor(ph); if (!L.length) return; head(ph.t); Q = Q.concat(L); EQ.playedK = ph.k; pump(); }
window.__PS_EQ_PLAY__ = function(k){ var ph = P().filter(function(x){ return x.k === k; })[0]; if (ph) play(ph); };

/* déclenchement par l'étape du parcours guidé */
function cur(){ try { var s = GD.steps && GD.steps[GD.i]; return s ? (s.t || '') : ''; } catch (e) { return ''; } }
function curPhase(){ var t = cur(), L = P(); for (var j = 0; j < L.length; j++) if (L[j].re.test(t)) return L[j]; return null; }
function tick(){
  try {
    if (!MI || !GD.on) return; var t = cur(), id = (MI.n || '') + '|' + ACK + '|' + t;
    if (t && id !== EQ.last) { EQ.last = id; var ph = curPhase(); if (ph) { var k = (MI.n || '') + '|' + ACK + '|' + ph.k;
      if (!EQ.played[k]) { EQ.played[k] = 1; if (ph.k === 'bord') { tabletOpen(); setTimeout(function(){ play(ph); }, 600); } else play(ph); } } }
  } catch (e) {}
}
setInterval(tick, 700);

/* ---------- 5. Le panneau Radio lance les conversations et check-lists ---------- */
var atc0 = window.atcRender;
window.atcRender = function(force){
  atc0.apply(this, arguments);
  try { var p = document.getElementById('atc'); if (!p || p.hidden || p.querySelector('.ps-crew')) return;
    var now = curPhase(), L = P().filter(function(x){ return linesFor(x).length; });
    var d = document.createElement('div'); d.className = 'ps-crew';
    d.innerHTML = '<b>Équipage · annonces et check-lists</b><div class="row">' + L.map(function(x){
      return '<button type="button" data-crew="' + x.k + '" class="' + (now && now.k === x.k ? 'now' : '') + '">' + x.t + (CKMAP[x.k] ? ' ☑' : '') + '</button>'; }).join('') + '</div>'
      + '<p class="anote">' + (twoCrew() ? 'Échanges commandant / copilote' : 'Annonces du pilote seul') + ' ; ☑ : check-list lue en « question / réponse ». Le son (🔊) rend les voix audibles ; sinon, sous-titres.</p>';
    p.appendChild(d);
    d.querySelectorAll('[data-crew]').forEach(function(b){ b.onclick = function(){ window.__PS_EQ_PLAY__(b.dataset.crew); }; });
  } catch (e) {}
};

/* ---------- tablette de documents (EFB) ---------- */
var ICON = { 'Plan de vol': '🗺️', 'Météo': '🌦️', 'Masse, centrage, carburant': '⚖️', 'Appareil et équipage': '🛠️', 'Cartes': '🧭' };
function tabletOpen(focus, label){
  var D = DOCS.D || {}, ids = DOCS.list(), cats = {};
  focus = (focus || []).filter(function(id){ return D[id]; }); if (focus.length) cats['Documents de l\'étape ' + (label || '')] = focus.map(function(id){ return [id, D[id].t]; });
  ids.forEach(function(id){ var d = D[id]; if (!d) return; var c = d.cat || 'Documents'; (cats[c] = cats[c] || []).push([id, d.t]); });
  var m = document.getElementById('ps-efb'); if (m) m.remove();
  m = document.createElement('div'); m.id = 'ps-efb'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-label', 'Tablette de documents de vol');
  m.innerHTML = '<div class="tab"><div class="scr"><div class="bar"><span>📱 Tablette de vol · ' + A.name + ' · ' + ids.length + ' documents</span><button type="button" data-efbx>Fermer</button></div>'
    + Object.keys(cats).map(function(c){ return '<h5>' + c + '</h5><div class="tiles">' + cats[c].map(function(d){
        return '<button type="button" data-efb="' + d[0] + '"><i>' + (ICON[c] || '📄') + '</i>' + d[1] + '</button>'; }).join('') + '</div>'; }).join('')
    + '<p style="font-size:12px;color:#556;margin-top:10px">Documents générés par le simulateur à partir du vol en cours ; itinéraires, TAF, NOTAM et cartes : exemples pédagogiques [SIMULÉ].</p></div></div>';
  document.body.appendChild(m);
  m.addEventListener('click', function(e){
    var b = e.target.closest('[data-efb]'); if (b) { DOCS.open(b.dataset.efb); return; }
    if (e.target.closest('[data-efbx]') || e.target === m) m.remove();
  });
}
window.__PS_EFB__ = tabletOpen;
/* Checklist (demandes de l'auteur, 20/11 07:26 et 07:27) : toucher une étape
   - qui comporte au moins un document (DOCS.forStep : dossier, devis de masse, carburant, FMS, roulage, approche…) → la
     tablette s'ouvre sur les documents de cette étape (puis tous les autres) ; pour le briefing, consulter vaut « Dossier consulté » ;
   - sinon → l'étape numérotée s'ouvre (goStep du moteur, avec ses propres contrôles des sous-étapes manquantes). */
function stepIdx(st){ var b = st.querySelector('b'), m = b && /^(?:✓\s*)?(\d+)\./.exec(b.textContent.trim()); return m ? +m[1] : -1; }
function docsOf(i){ try { return DOCS.forStep(GD.steps[i]) || []; } catch (e) { return []; } }
document.addEventListener('click', function(e){
  var st = e.target.closest && e.target.closest('#ckl .st'); if (!st || e.target.closest('button')) return;
  var i = stepIdx(st); if (i < 0 || !GD.steps[i]) return;
  var ids = docsOf(i), c = document.getElementById('ckl');
  if (c) c.hidden = true;
  if (ids.length) { if (/brief|dossier/i.test(GD.steps[i].t || '')) { try { GD.brief = true; } catch (er) {} } tabletOpen(ids, i + '. ' + GD.steps[i].t); }
  else { try { goStep(i); } catch (er) {} }
}, true);
css.textContent += '#ckl .st.ps-doc,#ckl .st.ps-go{cursor:pointer}#ckl .st.ps-doc>b::after{content:"  📱 documents";font-weight:600;color:#3fd0ff;font-size:.85em}'
 + '#ckl .st.ps-go>b::after{content:"  ▸ ouvrir l\'étape";font-weight:600;color:#8fa4b8;font-size:.85em}';
// le moteur redessine la checklist souvent : les marques sont reposées après chaque redessin
function markCkl(){ try { document.querySelectorAll('#ckl .st:not(.ps-doc):not(.ps-go)').forEach(function(st){ var i = stepIdx(st); if (i < 0) return;
  st.classList.add(docsOf(i).length > 0 ? 'ps-doc' : 'ps-go'); }); } catch (e) {} }
var mo = new MutationObserver(markCkl);
setInterval(markCkl, 300);
(function watch(){ var c = document.getElementById('ckl'); if (c) { mo.observe(c, { childList: true, subtree: true }); markCkl(); } else setTimeout(watch, 500); })();
/* bouton permanent « 📱 Tablette » dans la barre du simulateur */
function barBtn(){ if (document.getElementById('b-efb')) return; var d = document.getElementById('b-docs') || document.getElementById('b-menu'), bar = document.getElementById('bar'); if (!d && !bar) return;
  var b = document.createElement('button'); b.type = 'button'; b.id = 'b-efb'; b.textContent = '📱 Tablette'; b.onclick = function(){ tabletOpen(); };
  if (d) d.parentNode.insertBefore(b, d.nextSibling); else bar.appendChild(b); }
setInterval(barBtn, 1000);
})();`;

export function installEquipageExt(frame: HTMLIFrameElement | null): boolean {
  const d = frame?.contentDocument, w = frame?.contentWindow as any;
  if (!d || !w || !w.DOCS || !w.DOCS.D || typeof w.walkCheck !== 'function') return false;   // GD est une constante du moteur : invisible depuis window
  if (w.__PS_EQ__) return true;
  const s = d.createElement('script');
  s.textContent = EQUIPAGE_EXT;
  d.body.appendChild(s);
  return !!w.__PS_EQ__;
}
