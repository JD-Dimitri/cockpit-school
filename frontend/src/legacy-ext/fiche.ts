/**
 * Fiche de l'appareil dans le simulateur (demande de l'auteur du 20/11 20:12) : choix de l'aéronef → fiche → simulateur.
 * Toucher un appareil du menu du moteur ouvre sa fiche (illustration, caractéristiques, tous ses parcours) ; un bouton de la
 * fiche lance le vol par les gestes du menu d'origine (mode coché puis appareil ou mission). Le contenu de l'ancienne page
 * « Parcours » est ainsi dans le choix des aéronefs, en deux touchers.
 * Posé dans le document du moteur dès son chargement (texte ajouté avant </body>) : rien ne dépend de l'accès au cadre
 * depuis la page, qui n'est pas toujours permis (aperçu de fichier sur téléphone).
 * Caractéristiques : réglages du simulateur (objet AC du moteur), pas des données constructeur certifiées.
 */
const SCRIPT = String.raw`(function(){
var IMG = __IMG__;
var BYP = 0; window.__PS_BYP__ = 0;
var st = document.createElement('style');
st.textContent = '#ps-fiche{position:fixed;inset:0;z-index:90;background:rgba(3,8,14,.86);overflow:auto;padding:16px}'
 + '#ps-fiche .w{max-width:760px;margin:0 auto;background:#0b1622;border:1px solid #1f3a52;border-radius:14px;padding:16px;color:#e6f1fa;font:14px/1.45 Inter,system-ui,sans-serif}'
 + '#ps-fiche .top{display:flex;justify-content:space-between;align-items:center;gap:8px}#ps-fiche .top button{font:600 14px Inter,sans-serif;padding:8px 12px;border-radius:9px;border:1px solid #3fd0ff;background:#0d2232;color:#fff}'
 + '#ps-fiche img{width:100%;max-height:240px;object-fit:cover;border-radius:10px;margin:10px 0 2px}#ps-fiche figcaption{font-size:11px;opacity:.6}'
 + '#ps-fiche h2{margin:10px 0 2px;font-size:22px}#ps-fiche .sub{opacity:.75;margin:0 0 8px}#ps-fiche h3{margin:14px 0 6px;font-size:14px;text-transform:uppercase;letter-spacing:.06em;color:#3fd0ff}'
 + '#ps-fiche table{width:100%;border-collapse:collapse}#ps-fiche th,#ps-fiche td{padding:5px 4px;border-bottom:1px solid #1a2f42;text-align:left;font-size:13px}#ps-fiche th{font-weight:500;opacity:.75}'
 + '#ps-fiche .go{display:block;width:100%;text-align:left;margin:6px 0;padding:11px 12px;border-radius:10px;border:1px solid #3fd0ff;background:#0d2232;color:#fff;font:600 14px Inter,sans-serif;cursor:pointer}'
 + '#ps-fiche .go.full{border-color:#e05ad8;background:#1d0f24}#ps-fiche .go small{display:block;font-weight:400;opacity:.75;margin-top:2px}#ps-fiche .note{font-size:12px;opacity:.65;margin-top:10px}';
document.head.appendChild(st);
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function n(v, u, d){ return v == null || isNaN(v) ? null : Number(v).toLocaleString('fr-FR', { maximumFractionDigits: d || 0 }) + (u ? ' ' + u : ''); }
function fullOf(k){ try { if (window.FULLOF) return FULLOF(k); } catch (e) {} return AC[k].kind === 'fw' ? 'full-fw' : 'full-rw'; }
/* mêmes règles que la page Parcours (parcours.ts) : parcours complet de l'appareil, puis missions et scénarios */
function list(k){
  var keys = Object.keys(AC), fulls = {}, out = [];
  keys.forEach(function(x){ fulls[fullOf(x)] = 1; });
  var f = fullOf(k); if (MISSIONS[f]) out.push({ key: f, n: MISSIONS[f].n, d: MISSIONS[f].d, full: true });
  var fwK = keys.filter(function(x){ return AC[x].kind === 'fw' && !AC[x].sep; }), rwK = keys.filter(function(x){ return AC[x].kind !== 'fw'; });
  Object.keys(MISSIONS).forEach(function(key){ var m = MISSIONS[key];
    if ((/^full|^parcours/.test(key) && !/^full-777/.test(key)) || fulls[key] || m.soon || m.link) return;
    var ks = m.acs ? m.acs.filter(function(x){ return AC[x]; }) : m.ac ? [m.ac] : m.fw ? fwK : m.rw ? rwK : [];
    if (ks.indexOf(k) >= 0) out.push({ key: key, n: m.n, d: m.d, full: false }); });
  return out;
}
function rows(a){
  var e = a.ext || {}, r = a.kind === 'fw'
    ? [['Type', 'Avion' + (a.sep ? ' école' : '')], ['Masse de référence', n(a.m / 1000, 't', 1)], ['Poussée maximale (total)', n(a.Tmax && a.Tmax / 1000, 'kN')],
       ['VR / V2', a.Vr ? n(a.Vr, 'kt') + ' / ' + (n(a.V2, 'kt') || '—') : null], ['VMO / MMO', a.Vmo ? n(a.Vmo, 'kt') + ' / ' + (a.Mmo || '—') : null],
       ['Plafond', n(a.ceil, 'ft')], ['Longueur / envergure', e.len ? n(e.len, 'm', 1) + ' / ' + (n(e.span, 'm', 2) || '—') : null]]
    : [['Type', 'Hélicoptère ' + (a.twin ? 'biturbine' : 'monomoteur')], ['Masse de référence', n(a.m, 'kg')], ['VNE', n(a.Vne, 'kt')],
       ['Longueur / rotor', e.len ? n(e.len, 'm', 1) + ' / ' + (n(e.rotor, 'm', 1) || '—') : null]];
  return r.filter(function(x){ return x[1]; });
}
function close(){ var d = document.getElementById('ps-fiche'); if (d) d.remove(); }
function go(k, mi, mode){
  var p = document.getElementById('m-peda'), a = document.getElementById('m-auto');
  if (p) p.checked = mode === 'guide'; if (a) a.checked = mode === 'auto';
  try { localStorage.setItem('sim-intro', '1'); } catch (e) {}
  selAC = k; renderMenu();
  var b = fullOf(k) === mi ? document.querySelector('#c-ac [data-ac="' + k + '"]') : document.querySelector('.m2-mis [data-mi="' + mi + '"][data-k="' + k + '"]');
  close(); if (!b) return; BYP = 1; try { b.click(); } finally { BYP = 0; }
}
function open(k){
  var a = AC[k]; if (!a) return; close();
  var L = list(k), d = document.createElement('div'); d.id = 'ps-fiche'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Fiche ' + a.name);
  d.innerHTML = '<div class="w"><div class="top"><button type="button" data-x>← Appareils</button><small>' + (a.kind === 'fw' ? 'Avion' : 'Hélicoptère') + '</small></div>'
    + (IMG[k] ? '<figure style="margin:0"><img src="' + IMG[k] + '" alt=""><figcaption>Illustration générée, pas une photo</figcaption></figure>' : '')
    + '<h2>' + esc(a.name) + '</h2><p class="sub">' + esc(a.sub) + '</p>'
    + '<table><tbody>' + rows(a).map(function(r){ return '<tr><th scope="row">' + r[0] + '</th><td>' + r[1] + '</td></tr>'; }).join('') + '</tbody></table>'
    + '<h3>Choisissez votre vol</h3>'
    + L.map(function(x){ return x.full
        ? '<button type="button" class="go full" data-mi="' + x.key + '" data-mode="guide">▶ ' + esc(x.n) + ' · guidé<small>Pédagogique : étapes numérotées, actions guidées, calculs papier</small></button>'
        + '<button type="button" class="go full" data-mi="' + x.key + '" data-mode="auto">▶ ' + esc(x.n) + ' · automatique<small>Observation : le simulateur fait tout le vol, vous regardez et écoutez</small></button>'
        : '<button type="button" class="go" data-mi="' + x.key + '" data-mode="guide">▶ ' + esc(x.n) + (x.d ? '<small>' + esc(String(x.d).slice(0, 140)) + '</small>' : '') + '</button>'; }).join('')
    + '<p class="note">Caractéristiques : réglages du simulateur [SIMULÉ], pas des données constructeur certifiées.</p></div>';
  document.body.appendChild(d); d.scrollTop = 0;
  d.querySelector('[data-x]').onclick = close;
  d.addEventListener('click', function(e){ if (e.target === d) close(); });
  d.querySelectorAll('.go').forEach(function(b){ b.onclick = function(){ go(k, b.dataset.mi, b.dataset.mode); }; });
}
window.__PS_FICHE__ = open;
/* Calculateur (24/11/2026) : bouton « 🧮 Calculatrice » de la barre ; la page affiche le module par-dessus le simulateur.
   Mode automatique (observation) → version « cours » ; vol libre et mode guidé → version « simulateur » et pause du vol,
   reprise à la fermeture (seulement si c'est le calculateur qui a mis en pause). Échange par messages (sans accès au cadre). */
/* Vol en cours (menu fermé) signalé à la page, qui masque la bande du site (C12) ; fonctionne sans accès au cadre (24/11/2026) */
var VOL0 = null;
setInterval(function(){ try { var m = document.getElementById('menu'), v = !!(m && m.hidden); if (v !== VOL0) { VOL0 = v; parent.postMessage({ type: 'ps-vol', vol: v }, '*'); } } catch (e) {} }, 400);
var CALCP = false;
window.__PS_CALC__ = function(){
  var auto = false; try { auto = !!(AUTO && AUTO.on); } catch (e) {}
  if (!auto) { try { if (!paused) { var bp = document.getElementById('b-pause'); if (bp) { bp.click(); CALCP = true; } } } catch (e) {} }
  try { parent.postMessage({ type: 'ps-calc-open', variant: auto ? 'cours' : 'simulateur' }, '*'); } catch (e) {}
};
window.addEventListener('message', function(e){
  if (!e.data || e.data.type !== 'ps-calc-closed') return;
  if (CALCP) { CALCP = false; try { if (paused) { var bp = document.getElementById('b-pause'); if (bp) bp.click(); } } catch (x) {} }
});
/* Fin du parcours (20/11 23:21) : une fois les dernières procédures faites (« Terminer »), tous les écrans se referment :
   panneau plafond, pylône, carte, radio, documents, check-list, tablette, sous-titres de l'équipage, planche de bord 2D. */
window.__PS_ENDALL__ = function(){
  function off(id, btn){ var e = document.getElementById(id); if (e) e.hidden = true; var b = btn && document.getElementById(btn); if (b) b.classList.remove('on'); }
  try { ovhPinned = false; } catch (e) {}
  off('ovh', 'b-ovh'); off('ped', 'b-ped'); off('help');
  var mw = document.getElementById('mapw'); if (mw && !mw.hidden) { var bm = document.getElementById('b-map'); if (bm) bm.click(); if (!mw.hidden) mw.hidden = true; }
  try { if (typeof atcOpen === 'function') atcOpen(false); } catch (e) {}
  try { if (window.DOCS && DOCS.cur && DOCS.cur()) DOCS.close(); } catch (e) {}
  try { var ck = document.getElementById('ckl'); if (ck && !ck.hidden) ck.hidden = true; } catch (e) {}
  ['ps-efb', 'ps-eq', 'ps-ta', 'ps-arrow'].forEach(function(id){ var e = document.getElementById(id); if (e) e.style.display = 'none'; });
  try { if (!scrHidden) { var s = [].slice.call(document.querySelectorAll('#bar button')).find(function(b){ return /Masquer écrans/i.test(b.textContent); }); if (s) s.click(); } } catch (e) {}
  try { var g = document.getElementById('guide'); if (g) g.classList.add('min'); } catch (e) {}
};
/* Bas du poste de pilotage pour les 8 appareils (20/11 20:53) : planche de bord (face), pylône central, plancher, parois basses.
   Repère : œil du pilote (0,0,0), x vers la droite, y vers le haut, z vers l'arrière ; cx = axe de l'appareil. Cotes [ESTIMÉ]. */
window.__PS_LOWER__ = function(g, k, cx, box, M){
  var air = k === 'a320' || k === 'b777' || k === 'a350', heli = k === 'h125' || k === 'r44';
  var W = k === 'b777' ? 1.45 : k === 'a350' ? 1.4 : k === 'a320' ? 1.3 : k === 's76' ? 0.95 : k === 'lj60' ? 0.85 : k === 'c172' ? 0.56 : k === 'r44' ? 0.62 : 0.72;
  var gz = k === 'lj60' ? -0.78 : air || k === 's76' ? -0.95 : -0.72, y0 = k === 'c172' ? -0.29 : -0.35;
  var face = M(k === 'b777' ? 0x2f2b28 : 0x2a2e33), ped = M(k === 'b777' ? 0x3b3631 : 0x3a4048), floor = M(0x1c1e21), wall = M(k === 'c172' ? 0x8c8577 : 0x30353b);
  var yF = air ? -1.25 : -1.1;                                                        // plancher sous les pieds
  box(g, 2 * W, y0 - yF, 0.06, face, cx, (y0 + yF) / 2, gz - 0.06);                  // face de la planche de bord, jusqu'au plancher
  box(g, 2 * W + 0.1, 0.04, 2.4, floor, cx, yF, gz + 1.1);                          // plancher
  [-1, 1].forEach(function(s){ box(g, 0.05, y0 - yF + 0.1, 2.4, wall, cx + s * W, (y0 + yF) / 2, gz + 1.1); });   // parois basses
  if (!heli) box(g, air ? 0.5 : 0.3, 0.32, air ? 1.0 : 0.6, ped, cx, yF + 0.2, gz + (air ? 0.55 : 0.4));            // pylône central
  else box(g, 0.22, 0.25, 0.45, ped, cx, yF + 0.15, gz + 0.3);                                                       // console centrale
};
/* Écran de départ (demande de l'auteur du 20/11 20:27) : reste affiché tant qu'on n'a pas touché « Démarrer » ; ensuite le
   choix de l'appareil. Pas d'écran de départ quand un vol est lancé directement (cours, parcours) ; jamais par-dessus un vol. */
if (window.__PS_START__) {
  /* l'écran est posé dès l'ouverture du document (au début de <body>, voir startEarly) : il ne s'affiche qu'une fois */
  var sc = document.getElementById('ps-start');
  if (!sc) { sc = document.createElement('div'); sc.id = 'ps-start'; sc.innerHTML = __START_HTML__;
    var sst = document.createElement('style'); sst.textContent = __START_CSS__; document.head.appendChild(sst); document.body.appendChild(sc); }
  sc.querySelector('[data-start]').onclick = function(){ sc.remove(); try { var m = document.getElementById('menu'); if (m) m.scrollTop = 0; } catch (e) {} };
  var w0 = setInterval(function(){ var m = document.getElementById('menu'); if (!document.getElementById('ps-start')) return clearInterval(w0); if (m && m.hidden) { sc.remove(); clearInterval(w0); } }, 300);
}
document.addEventListener('click', function(e){
  if (BYP || window.__PS_BYP__) return;
  var c = e.target && e.target.closest ? e.target.closest('#c-ac [data-ac]') : null; if (!c) return;
  e.stopPropagation(); e.preventDefault(); open(c.dataset.ac);
}, true);
})();`;

/** Texte à poser dans le document du moteur avant </body> (images des appareils fournies par la page). */
export const ficheScript = (images: Record<string, string>, start = false): string =>
  '<script>window.__PS_START__=' + (start ? 1 : 0) + ';' + SCRIPT.replace('__IMG__', JSON.stringify(images).replace(/</g, '\\u003c')).replace('__START_HTML__', JSON.stringify(START_HTML)).replace('__START_CSS__', JSON.stringify(START_CSS)) + '</script>';

/** Écran « Démarrer » (demande de l'auteur du 20/11 20:27, affiché une seule fois : 21/11 00:01). */
const START_HTML = "<div class=\"w\"><h1>SIMULATEUR <b>COCKPIT SCHOOL</b></h1><p>Choisissez un appareil : sa fiche vous le présente, puis vous choisissez votre vol (parcours guidé ou automatique, vol libre, mission, scénario). Modèles de vol simplifiés et cockpits reconstitués d’après la documentation publique : tout ce qui est calculé est <b>[SIMULÉ]</b>.</p><button type=\"button\" data-start>DÉMARRER ▸</button><p class=\"n\">Commandes : clavier (touche « ? » pour l’aide), manette de jeu, ou manches tactiles sur téléphone.</p></div>";
const START_CSS = "#ps-start{position:fixed;inset:0;z-index:85;overflow:auto;background:radial-gradient(ellipse at 50% 30%,#0c1a2a,#03070c);display:flex;align-items:center;justify-content:center;padding:20px}#ps-start .w{max-width:720px;color:#e6f1fa;font:16px/1.5 Inter,system-ui,sans-serif}#ps-start h1{font-size:clamp(34px,9vw,64px);line-height:1.05;margin:0 0 14px;letter-spacing:.01em}#ps-start h1 b{color:#e05ad8}#ps-start p{opacity:.8}#ps-start .n{font-size:13px;opacity:.6;margin-top:16px}#ps-start [data-start]{margin-top:18px;padding:16px 30px;border:0;border-radius:12px;background:#b0309f;color:#fff;font:700 18px Inter,sans-serif;letter-spacing:.06em;cursor:pointer}";
/** Texte à poser juste après <body> : l'écran « Démarrer » est visible dès la première image, avant le menu du moteur. */
export const startEarly = (): string => '<style>' + START_CSS + '</style><div id="ps-start">' + START_HTML + '</div>';
