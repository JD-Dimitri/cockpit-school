/**
 * TA2 (demande de l'auteur, 20/11/2026 07:20) : tablette de documents à l'installation dans le poste, et double contrôle
 * pilote / copilote aux moments clés du parcours guidé.
 *
 * Tablette (EFB) : à l'étape « Monter à bord / installé en poste », un écran de tablette s'ouvre avec tous les documents du
 * dossier de vol en tuiles (ceux du moteur : 📁 Documents) ; toucher une tuile ouvre le document ; « Fermer » la range.
 *
 * Double contrôle : principe des procédures d'exploitation réelles [RÉFÉRENCÉ] : les deux pilotes confirment à voix haute
 * les instructions du contrôle et les données saisies, et regardent tous deux à gauche et à droite avant de rouler, d'entrer sur
 * une piste ou de la traverser (CAAS AC 121-2-4, « Flight Crew Procedures and Training During Taxi Operations », 2018, § 2.3.2
 * et § 2.5.1). Les mots exacts (« Clear left », « Clear right », « Cross-checked »…) sont les annonces usuelles des procédures
 * standard ; chaque compagnie fixe les siennes dans son manuel d'exploitation [ESTIMÉ, formulation générique].
 * Voix de synthèse, présentées comme telles ; appareils à un seul pilote (C172, R44, H125) : pas de copilote, l'élève annonce seul.
 */
export const EQUIPAGE_EXT = String.raw`(function(){
if (window.__PS_EQ__ || typeof GD === 'undefined' || !window.DOCS) return;
var EQ = window.__PS_EQ__ = { last: '', played: {}, tabShown: {}, log: [] };
function twoCrew(){ return ['a320', 'a350', 'b777', 'lj60', 's76'].indexOf(ACK) >= 0; }
function cdbName(){ return 'CDB'; }

/* ---------- échanges de double contrôle (déclenchés par l'étape du parcours guidé) ---------- */
var X = [
  { re: /Monter à bord|installé en poste|cold/i, k: 'bord', two: [
      ['CDB', 'Documents on board, flight folder checked.', 'Documents à bord, dossier de vol vérifié.'],
      ['OPL', 'Checked. Tech log and MEL reviewed, no open item affecting the flight.', 'Vérifié. Compte rendu matériel et MEL consultés : rien qui empêche le vol.']],
    one: [['CDB', 'Documents on board, tech log checked.', 'Documents à bord, compte rendu matériel vérifié.']] },
  { re: /FMS|Performances|INIT/i, k: 'perf', two: [
      ['CDB', 'Take-off data: please cross-check V1, VR, V2 and flap setting.', 'Données de décollage : contre-vérifie V1, VR, V2 et le braquage des volets.'],
      ['OPL', 'Cross-checked, data agree with the performance computation.', 'Contre-vérifié : conforme au calcul de performances.']],
    one: [['CDB', 'Take-off data checked against the performance computation.', 'Données de décollage vérifiées avec le calcul de performances.']] },
  { re: /Before Start|Avant la mise en route/i, k: 'bstart', two: [
      ['CDB', 'Before start checklist.', 'Check-list avant mise en route.'],
      ['OPL', 'Before start checklist completed.', 'Check-list avant mise en route terminée.']],
    one: [['CDB', 'Before start checklist completed.', 'Check-list avant mise en route terminée.']] },
  { re: /roulage/i, k: 'taxi', two: [
      ['CDB', 'Taxi clearance: both agree on the route on the aerodrome chart?', 'Clairance de roulage : on est d\'accord sur l\'itinéraire, carte d\'aérodrome en main ?'],
      ['OPL', 'Route agreed, I follow our progress on the chart.', 'Itinéraire d\'accord, je suis notre progression sur la carte.'],
      ['CDB', 'Clear left.', 'Dégagé à gauche.'],
      ['OPL', 'Clear right.', 'Dégagé à droite.']],
    one: [['CDB', 'Taxi route checked on the chart. Clear left, clear right.', 'Itinéraire vérifié sur la carte. Dégagé à gauche, dégagé à droite.']] },
  { re: /Before Takeoff|Décollage/i, k: 'rwy', two: [
      ['CDB', 'Lining up: runway in use confirmed, heading checked.', 'Alignement : piste en service confirmée, cap vérifié.'],
      ['OPL', 'Runway confirmed. Approach path clear, runway clear.', 'Piste confirmée. Trajectoire d\'approche dégagée, piste dégagée.']],
    one: [['CDB', 'Runway confirmed. Approach path clear, runway clear.', 'Piste confirmée. Trajectoire d\'approche dégagée, piste dégagée.']] },
  { re: /Approche/i, k: 'app', two: [
      ['OPL', 'One thousand.', 'Mille pieds.'],
      ['CDB', 'Stabilized, continue.', 'Stabilisé, on continue.']],
    one: [['CDB', 'One thousand, stabilized, continue.', 'Mille pieds, stabilisé, on continue.']] }
];
var css = document.createElement('style');
css.textContent = '#ps-eq{position:fixed;right:10px;top:70px;z-index:64;max-width:min(420px,calc(100vw - 20px));background:#0b1520ee;border:1px solid #2b3d50;border-left:4px solid #3fd0ff;border-radius:10px;padding:8px 10px;color:#e8eef2;font:13px/1.4 Inter,sans-serif;display:none}'
 + '#ps-eq b{font:700 12px "Barlow Condensed",sans-serif;letter-spacing:.12em;color:#3fd0ff;text-transform:uppercase}#ps-eq p{margin:4px 0}#ps-eq .w{color:#ffd166;font-weight:700}#ps-eq small{color:#8fa4b8}'
 + '#ps-eq button{float:right;background:none;border:0;color:#8fa4b8;font-size:18px;cursor:pointer;line-height:1}'
 + '#ps-efb{position:fixed;inset:0;z-index:71;background:#000b;display:flex;align-items:center;justify-content:center;padding:12px}'
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
function say(who, en){
  try { if (!window.speechSynthesis || (typeof ATC !== 'undefined' && !ATC.voice)) return;
    var u = new SpeechSynthesisUtterance(en); u.lang = 'en-GB'; u.rate = 1.05; u.pitch = who === 'OPL' ? 1.15 : 0.85;
    var v = speechSynthesis.getVoices().filter(function(x){ return /^en/i.test(x.lang); }); if (v.length > 2) u.voice = v[who === 'OPL' ? 2 : 1];
    speechSynthesis.speak(u); } catch (e) {}
}
function play(x){
  var lines = twoCrew() ? x.two : x.one, i = 0;
  box.style.display = 'block';
  box.innerHTML = '<button type="button" aria-label="Fermer" data-eqx>×</button><b>Équipage · double contrôle</b><small> — voix de synthèse</small>';
  (function next(){
    if (i >= lines.length) { setTimeout(function(){ if (box.dataset.k === x.k) box.style.display = 'none'; }, 9000); return; }
    var L = lines[i++], p = document.createElement('p');
    p.innerHTML = '<span class="w">' + (L[0] === 'CDB' ? 'Commandant (vous)' : 'Copilote') + ' :</span> « ' + L[1] + ' » <small>' + L[2] + '</small>';
    box.appendChild(p); EQ.log.push([x.k, L[0], L[1]]); say(L[0], L[1]);
    setTimeout(next, 2600 + L[1].length * 45);
  })();
  box.dataset.k = x.k;
}
box.addEventListener('click', function(e){ if (e.target.closest('[data-eqx]')) box.style.display = 'none'; });
function cur(){ try { var s = GD.steps && GD.steps[GD.i]; return s ? (s.t || '') : ''; } catch (e) { return ''; } }
function tick(){
  try {
    if (!MI || !GD.on) return; var t = cur(), id = (MI.n || '') + '|' + ACK + '|' + t;
    if (t && id !== EQ.last) { EQ.last = id;
      for (var j = 0; j < X.length; j++) { var x = X[j], k = (MI.n || '') + '|' + ACK + '|' + x.k;
        if (x.re.test(t) && !EQ.played[k]) { EQ.played[k] = 1; if (x.k === 'bord') { tabletOpen(); setTimeout(function(){ play(X[0]); }, 600); } else play(x); break; } } }
  } catch (e) {}
}
setInterval(tick, 700);

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
setInterval(function(){ try { document.querySelectorAll('#ckl .st').forEach(function(st){ var i = stepIdx(st); if (i < 0) return;
  var d = docsOf(i).length > 0; st.classList.toggle('ps-doc', d); st.classList.toggle('ps-go', !d); }); } catch (e) {} }, 400);
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
