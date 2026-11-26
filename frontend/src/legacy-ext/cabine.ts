/**
 * CAB2 (demandes de l'auteur du 26/11/2026 13:05 et 13:06) :
 *  1. Passagers dans la vue « Cabine » selon la liste nominative du manifeste (NOM Prénom · siège) : homme, femme ou enfant.
 *     Règle, dans l'ordre : titre ou catégorie écrit dans la ligne (MR, M., MRS, MS, MME, MLLE → adulte ; MSTR, MISS, CHD, INF,
 *     « enfant », « bébé » → enfant), puis prénom usuel (liste ci-dessous), sinon silhouette neutre (on ne devine pas).
 *     Silhouettes simples générées par le simulateur, sans visage ni personne réelle ; couleurs de vêtements variées.
 *  2. Toute la longueur de l'appareil est parcourable : de la cloison du poste jusqu'à l'office arrière. Boutons « ‹ Avant » et
 *     « Arrière › » (un clic = un rang, appui maintenu = déplacement continu), « ⟲ » pour se retourner, repère de position
 *     (office avant, rang 12, issue d'aile…). Toucher le haut ou le bas de la vue avance ou recule aussi d'un rang.
 */
export const CABINE_EXT = String.raw`(function(){
if (window.__PS_CAB2__ || !window.CABIN || typeof THREE === 'undefined') return;
var CB = window.__PS_CAB2__ = { people: null, sig: '' };
var F = 'Ana Emma Chloé Léa Manon Camille? Sarah Inès Jade Louise Lina Zoé Alice Lola Mila Rose Nina Yasmine Aïcha Sofia Olga Fatou Priya Mei Julie Claire Marie Anne Sophie Isabelle Linh? Sacha? Laura Lucie Juliette Clara Eva Anaïs Pauline Nathalie Sandrine Céline Aurélie Émilie Elodie Valérie Christine Catherine Martine Françoise Monique Nicole Sylvie Patricia Fatima Khadija Amina Mariam Salma Leila Nour Hanna Maria Elena Carmen Lucia Giulia Anna Olivia Mia Charlotte Amelia Grace Chen Yuki Aiko Ines Lea Chloe Zoe Aicha Emilie Elodie'.split(' ');
var M = 'Paul Jan Lucas Hugo Louis Nathan Jules Gabriel Arthur Adam Raphaël Mathis Noah Ethan Tom Théo Malik Karim Kenji Marco Pedro Mamadou Ravi David Pierre Jean Michel Nicolas Thomas Marc Léo Liam Sami Yanis Rayan Mohamed Ahmed Ali Omar Youssef Ibrahim Moussa Antoine Julien Maxime Alexandre Baptiste Romain Guillaume Kevin Florian Vincent Laurent Philippe Patrick Alain Bernard Daniel François Jacques Christophe Stéphane Frédéric Olivier Sébastien Eric Luis Carlos Diego Juan José Luca Matteo Giovanni John James William Oliver Jack Harry George Wei Hiroshi Raphael Theo Leo Andre Francois'.split(' ');
var G = {}; F.forEach(function(n){ if (n) G[n.replace('?', '').toLowerCase()] = /\?$/.test(n) ? 'n' : 'f'; }); M.forEach(function(n){ if (n) G[n.toLowerCase()] = 'm'; });
['camille','sacha','linh','dominique','claude','alex','charlie','andrea','eden','sasha','noa'].forEach(function(n){ G[n] = 'n'; });
function kind(name){
  var t = ' ' + String(name || '').replace(/[().,]/g, ' ') + ' ', u = t.toUpperCase();
  if (/\s(CHD|INF|MSTR|ENFANT|BÉBÉ|BEBE|BB)\s/.test(u)) return /\s(MISS|FILLE)\s/.test(u) ? 'cf' : (/\sMSTR\s|\sGARÇON\s/.test(u) ? 'cm' : 'cn');
  if (/\sMISS\s/.test(u)) return 'cf';
  if (/\s(MR|M|MONSIEUR)\s/.test(u)) return 'm';
  if (/\s(MRS|MS|MME|MLLE|MADAME)\s/.test(u)) return 'f';
  var words = String(name || '').trim().split(/\s+/).filter(function(w){ return w && w !== w.toUpperCase(); });   // le NOM est en capitales, le prénom non
  for (var i = 0; i < words.length; i++){ var g = G[words[i].toLowerCase()]; if (g) return g; }
  return 'n';
}
CB.kind = kind;
function paxList(){ var k = ACK, txt = '';
  try { txt = window.PAXOF ? PAXOF(k) : ''; } catch (e) {}
  return String(txt || '').split('\n').map(function(l){ return l.trim(); }).filter(Boolean).map(function(l){ var p = l.split(/\s*[·|;]\s*/); return { n:p[0], s:(p[1] || '').toUpperCase().replace(/\s/g, '') }; }); }

/* ---------- silhouettes (instances) ---------- */
var SH = [0.82, 0.82, 1.0, 0.55, 0.92, 0.92];
function mats(){ return SH.map(function(f){ return new THREE.MeshBasicMaterial({ color:new THREE.Color(f, f, f) }); }); }
var CLOTH = [0x2f5d8a, 0x8a2f3d, 0x3d7a4a, 0x6b4f9a, 0x444b55, 0xb5843a, 0x1f2a36, 0x9a5b2f, 0x2b7a78, 0x7a2b5c, 0xc9ccd1, 0x5b6b2f];
var SKIN = [0xf1c9a5, 0xe0ac84, 0xc68863, 0x8d5a3b, 0x5c3a24, 0xf5d7bd];
var HAIR = [0x1c1714, 0x3a2a1e, 0x6b4a2b, 0xb08a52, 0x8e8e8e, 0x2a1d14];
function people(k, seats, floor, g){
  if (CB.people && CB.people.parent) CB.people.parent.remove(CB.people);
  var L = paxList(), by = {}; seats.forEach(function(s){ if (s.id) by[s.id] = s; });
  var list = L.filter(function(p){ return p.s && by[p.s]; }).map(function(p){ return { s:by[p.s], k:kind(p.n), n:p.n }; });
  var P = new THREE.Group(); P.name = 'passagers'; g.add(P); CB.people = P; CB.count = list.length; CB.stats = { m:0, f:0, c:0, n:0 };
  if (!list.length) return;
  var N = list.length, mk = function(geo){ var m = new THREE.InstancedMesh(geo, mats(), N); m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3); P.add(m); return m; };
  var torso = mk(new THREE.BoxGeometry(1, 1, 1)), head = mk(new THREE.BoxGeometry(1, 1, 1)), hair = mk(new THREE.BoxGeometry(1, 1, 1)),
      thigh = mk(new THREE.BoxGeometry(1, 1, 1)), shin = mk(new THREE.BoxGeometry(1, 1, 1)), arm = mk(new THREE.BoxGeometry(1, 1, 1));
  var mx = new THREE.Matrix4(), c = new THREE.Color(), seed = 12345, rnd = function(){ seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  function put(m, i, w, h, d, x, y, z, col){ mx.makeScale(w, h, d); mx.setPosition(x, y, z); m.setMatrixAt(i, mx); c.setHex(col); m.setColorAt(i, c); }
  list.forEach(function(p, i){
    var child = p.k.charAt(0) === 'c', fem = p.k === 'f' || p.k === 'cf', sc = child ? 0.68 : (fem ? 0.94 : 1), s = p.s;
    CB.stats[child ? 'c' : p.k === 'n' ? 'n' : p.k]++;
    var cl = CLOTH[Math.floor(rnd() * CLOTH.length)], sk = SKIN[Math.floor(rnd() * SKIN.length)], hr = HAIR[Math.floor(rnd() * HAIR.length)];
    var y0 = floor + 0.52, z0 = s.z + 0.12, sh = (fem ? 0.36 : 0.42) * sc;
    put(torso, i, sh, 0.58 * sc, 0.24 * sc, s.x, y0 + 0.3 * sc, z0, cl);                                   // buste (adossé au dossier)
    put(head, i, 0.18 * sc, 0.22 * sc, 0.2 * sc, s.x, y0 + 0.72 * sc, z0 - 0.01, sk);                       // tête
    if (fem) put(hair, i, 0.21 * sc, 0.3 * sc, 0.16 * sc, s.x, y0 + 0.69 * sc, z0 + 0.06, hr);            // cheveux longs (femme, fille)
    else if (p.k === 'n' || p.k === 'cn') put(hair, i, 0.2 * sc, 0.12 * sc, 0.2 * sc, s.x, y0 + 0.82 * sc, z0 + 0.01, 0x8a8f96);   // silhouette neutre : bonnet gris
    else put(hair, i, 0.19 * sc, 0.07 * sc, 0.2 * sc, s.x, y0 + 0.85 * sc, z0 + 0.01, hr);                // cheveux courts
    put(thigh, i, sh * 0.85, 0.15 * sc, 0.44 * sc, s.x, y0 + 0.02, z0 - 0.22 * sc, fem && rnd() < 0.4 ? cl : 0x2b3440);   // cuisses (assis, vers l'avant)
    put(shin, i, sh * 0.75, 0.42 * sc, 0.12 * sc, s.x, y0 - 0.22 * sc, z0 - 0.42 * sc, 0x222831);                        // jambes
    put(arm, i, sh + 0.12 * sc, 0.1 * sc, 0.34 * sc, s.x, y0 + 0.16 * sc, z0 - 0.12 * sc, cl);                          // avant-bras sur les accoudoirs
  });
  [torso, head, hair, thigh, shin, arm].forEach(function(m){ m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; });
}
window.__CAB_ONBUILD__ = function(k, seats, floor, g){ try { people(k, seats, floor, g); CB.seats = { k:k, seats:seats, floor:floor, g:g }; CB.sig = k + '|' + (window.PAXOF ? PAXOF(k) : ''); } catch (e) { console.warn('passagers', e); } };
// le manifeste a changé (liste nominative, sièges) : on replace les passagers
setInterval(function(){ try { if (typeof view === 'undefined' || view !== 'cab' || !CB.seats || CB.seats.k !== ACK) return;
  var sig = ACK + '|' + (window.PAXOF ? PAXOF(ACK) : ''); if (sig !== CB.sig){ CB.sig = sig; people(CB.seats.k, CB.seats.seats, CB.seats.floor, CB.seats.g); } } catch (e) {} }, 2000);

/* ---------- 2. parcours de toute la longueur ---------- */
var css = document.createElement('style');
css.textContent = '#cabnav[hidden]{display:none!important}#cabnav .h2{display:flex;gap:6px}#cabnav .h2 button{width:auto;min-width:46px;padding:0 10px;font:700 14px "Barlow Condensed",sans-serif;letter-spacing:.04em}' +
  '#cabnav .where{max-width:150px;text-align:center;color:#e8eef2!important;font-size:12px!important}#cabnav .pax{max-width:150px;text-align:center}';
document.head.appendChild(css);
var anim = null;
function cam(){ try { return CABIN.cam(); } catch (e) { return null; } }
function rowsOf(C){ return (C && C.rows || []).map(function(r){ return r.z; }); }
function stepTo(dir){   // dir = +1 vers l'avant (cockpit), −1 vers l'arrière
  var C = cam(); if (!C || !CABIN.setPos) return; var p = CABIN.pos(); if (p == null) p = C.z;
  var stops = [C.zmin].concat(rowsOf(C).map(function(z){ return z - 0.05; }), [C.zmax]).sort(function(a, b){ return a - b; });
  var tgt = null;
  if (dir > 0){ for (var i = stops.length - 1; i >= 0; i--) if (stops[i] < p - 0.05){ tgt = stops[i]; break; } }
  else { for (var j = 0; j < stops.length; j++) if (stops[j] > p + 0.05){ tgt = stops[j]; break; } }
  if (tgt == null) return; var a = p, t0 = performance.now();
  if (anim) cancelAnimationFrame(anim);
  (function f(){ var k = Math.min(1, (performance.now() - t0) / 260); CABIN.setPos(a + (tgt - a) * (1 - Math.pow(1 - k, 3))); if (k < 1) anim = requestAnimationFrame(f); })();
}
CB.stepTo = stepTo;
function where(){ var C = cam(); if (!C) return ''; var p = CABIN.pos(); if (p == null) return '';
  var rows = C.rows || []; if (!rows.length) return 'cabine';
  if (p < rows[0].z - 0.5) return 'office avant';
  if (p > rows[rows.length - 1].z + 0.6) return 'office arrière';
  var best = rows[0]; rows.forEach(function(r){ if (Math.abs(r.z - p) < Math.abs(best.z - p)) best = r; });
  var cl = { J:'affaires', W:'premium', Y:'économique', C:'cabine', P:'cabine' }[best.cls] || '';
  return 'rang ' + best.r + (cl ? ' · ' + cl : ''); }
function extend(){ var C = cam(); if (!C || C.__ext || !C.back) return; C.__ext = 1;
  var rows = C.rows || []; if (rows.length){ C.zmin = Math.min(C.zmin, rows[0].z - 1.6); C.zmax = Math.max(C.zmax, rows[rows.length - 1].z + 1.6); } }
function ui(){
  var n = document.getElementById('cabnav'); if (!n || n.hidden){ return; }
  extend();
  if (!n.querySelector('.h2')){
    var h = document.createElement('div'); h.className = 'h2';
    h.innerHTML = '<button type="button" data-s="1" title="Avancer d\'un rang vers le poste de pilotage">‹ Avant</button><button type="button" data-s="-1" title="Reculer d\'un rang vers l\'arrière">Arrière ›</button><button type="button" data-turn title="Se retourner">⟲</button>';
    n.appendChild(h);
    h.querySelectorAll('[data-s]').forEach(function(b){ var d = +b.dataset.s, hold = null;
      b.addEventListener('click', function(){ stepTo(d); });
      b.addEventListener('pointerdown', function(){ hold = setTimeout(function(){ /* vers l'avant = z décroissant */ window.CAB_MV = -d; }, 380); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function(t){ b.addEventListener(t, function(){ clearTimeout(hold); window.CAB_MV = 0; }); }); });
    h.querySelector('[data-turn]').onclick = function(){ var C = cam(); if (C){ C.back = !C.back; } };
    var w = document.createElement('span'); w.className = 'where'; n.appendChild(w);
    var px = document.createElement('span'); px.className = 'pax'; n.appendChild(px);
  }
  n.querySelector('.where').textContent = '📍 ' + where();
  var s = CB.stats; n.querySelector('.pax').textContent = CB.count ? CB.count + ' passagers : ' + s.m + ' H · ' + s.f + ' F · ' + s.c + ' enf.' + (s.n ? ' · ' + s.n + ' ?' : '') : 'manifeste : aucun passager nommé';
}
setInterval(ui, 400);
// toucher le haut / le bas de la vue : un rang vers l'avant / l'arrière (sans gêner le regard à la souris : simple toucher, sans glisser)
var down = null;
addEventListener('pointerdown', function(e){ if (typeof view === 'undefined' || view !== 'cab' || e.target.tagName !== 'CANVAS') { down = null; return; } down = { x:e.clientX, y:e.clientY, t:performance.now() }; }, true);
addEventListener('pointerup', function(e){ if (!down || view !== 'cab') return; var d = down; down = null;
  if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8 || performance.now() - d.t > 350) return;
  var C = cam(); if (!C) return; var top = e.clientY < innerHeight * 0.33, bot = e.clientY > innerHeight * 0.62; if (!top && !bot) return;
  var fwd = top ? !C.back : C.back; stepTo(fwd ? 1 : -1); }, true);
try { if (typeof view !== 'undefined' && view === 'cab') CABIN.build(ACK); } catch (e) {}
})();`;

export function installCabineExt(frame: HTMLIFrameElement | null): boolean {
  const d = frame?.contentDocument, w = frame?.contentWindow as any;
  if (!d || !w || !w.CABIN || !w.THREE) return false;
  if (w.__PS_CAB2__) return true;
  const s = d.createElement('script');
  s.textContent = CABINE_EXT;
  d.body.appendChild(s);
  return !!w.__PS_CAB2__;
}
