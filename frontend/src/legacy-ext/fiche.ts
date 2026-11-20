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
document.addEventListener('click', function(e){
  if (BYP || window.__PS_BYP__) return;
  var c = e.target && e.target.closest ? e.target.closest('#c-ac [data-ac]') : null; if (!c) return;
  e.stopPropagation(); e.preventDefault(); open(c.dataset.ac);
}, true);
})();`;

/** Texte à poser dans le document du moteur avant </body> (images des appareils fournies par la page). */
export const ficheScript = (images: Record<string, string>): string =>
  '<script>' + SCRIPT.replace('__IMG__', JSON.stringify(images).replace(/</g, '\\u003c')) + '</script>';
