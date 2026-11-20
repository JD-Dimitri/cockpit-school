/**
 * F37 : boutons radio ajoutés au panneau « RADIO · CONTRÔLE AÉRIEN » du moteur d'origine (V10.42.1).
 * Le moteur a déjà : Régler, Appeler / Annoncer, Collationner (copilote, texte ou dictée vérifiés), WILCO, XPDR.
 * Ajouts : Répéter (« say again »), Standby, Radio (choix de la station et de la fréquence du parcours), Mayday, Pan-Pan.
 * Chaque bouton passe par les fonctions du moteur (atcLog, atcTune, atcEmergency, hears…) : mêmes stations, mêmes
 * fréquences sourcées, même indicatif, même suite d'échanges que le parcours, l'appareil et la position en cours.
 * Aucune fréquence n'est ajoutée ni choisie ici. Le script s'exécute DANS le cadre du moteur (accès à ATC, STN, A, S…).
 */
export const RADIO_EXT = String.raw`(function(){
if (window.__PS_RADIO__ || typeof atcRender !== 'function') return; window.__PS_RADIO__ = 1;
var css = document.createElement('style');
css.textContent = '#atc .abtn2{margin-top:6px}#atc .abtn2 .emer{border-color:#ff3b30;color:#ff8a80}#atc .apick{margin:6px 0;display:flex;flex-direction:column;gap:4px}'
 + '#atc .apick button{display:flex;justify-content:space-between;gap:8px;text-align:left}#atc .apick .now{border-color:#3ddc84}#atc .apick small{opacity:.75}';
document.head.appendChild(css);
var OPEN = null;   // sous-panneau ouvert : 'radio' ou 'emer'
function single(){ return A.kind === 'fw' ? !!A.single : !A.twin; }
/* Motifs d'urgence : les mêmes formulations que les pannes du moteur, choisies selon l'appareil */
function reasons(){
  var m = [['mayday','engine fire','feu moteur'], ['mayday','smoke in the cockpit','fumée dans le poste'], ['mayday','electrical emergency','urgence électrique']];
  if (single()) m.push(A.kind === 'fw' ? ['mayday','engine failure, forced landing','panne moteur, atterrissage forcé'] : ['mayday','engine failure, autorotation','panne moteur, autorotation']);
  else m.push(['mayday','dual engine failure, attempting relight','double panne moteur, tentative de rallumage']);
  var p = [['pan','medical emergency on board','urgence médicale à bord'], ['pan','fuel leak','fuite de carburant']];
  if (!single()) p.unshift(['pan','one engine inoperative','un moteur en panne']);
  if (ACK === 'c172' || ACK === 'r44') p.push(['pan','rough running engine','moteur qui tourne mal']);
  return m.concat(p);
}
/* Station d'un message du journal (qui garde le nom) : plusieurs stations portent le même nom (Kennedy Tower 123.9 et 119.1,
   selon les pistes) ; on retient celle qui est réglée, sinon celle de l'échange en cours, sinon la première. */
function stKey(name){ var c = [], x = curX(); for (var k in STN) if (STN[k].n === name) c.push(k); if (!c.length) return null;
  for (var i = 0; i < c.length; i++) if (Math.abs(tunedF() - STN[c[i]].f) < 0.004) return c[i];
  return (x && c.indexOf(x.st) >= 0) ? x.st : c[0]; }
function lastAtc(){ for (var i = ATC.log.length - 1; i >= 0; i--) if (ATC.log[i].who === 'ATC') return ATC.log[i]; return null; }
/* Stations du parcours en cours, dans l'ordre de la route (sol → tour → départ → centres → approche → tour) */
function routeStations(){
  var seen = {}, out = [];
  (ATC.seq || []).concat(ATC.q || []).forEach(function(x){ if (x && x.st && !seen[x.st] && STN[x.st] && !STN[x.st].dl) { seen[x.st] = 1; out.push(x.st); } });
  return out;
}
function sayAgain(){
  var m = lastAtc(), x = curX(), st = (m && stKey(m.st)) || (x && x.st) || ATC.curSt; if (!st) return;
  if (!radioPowered()) { flash('Radio non alimentée', 'am'); return; }
  atcLog('PIL', st, STN[st].n + ', ' + CSN() + ', say again', 'Répétez votre dernier message.');
  setTimeout(function(){
    if (!m) { atcLog('SYS', null, 'Aucun message à répéter : le contrôle ne vous a encore rien transmis.'); return; }
    if (!hears(st)) { atcLog('SYS', null, 'Pas de réponse : ' + STN[st].n + ' écoute ' + fq(st) + '.'); return; }
    var cs = CSN(), body = m.en.indexOf(cs + ', ') === 0 ? m.en.slice(cs.length + 2) : m.en;   // indicatif dit une seule fois
    var en = cs + ', I say again, ' + body; squelch(); atcLog('ATC', st, en, m.fr ? 'Je répète : ' + m.fr : ''); speak(en);
  }, 1400 + rnd() * 800);
}
function standby(){
  var x = curX(), st = (x && x.st) || ATC.curSt; if (!st) return;
  atcLog('PIL', st, CSN() + ', standby', 'Patientez : vous rappellerez pour collationner.');
  flash('Standby annoncé : le contrôleur attend votre collationnement', 'am');
}
function declare(e){
  if ((ATC.q || []).some(function(x){ return x.emer; })) { flash('Urgence déjà déclarée : appuyez sur « Appeler »', 'am'); return; }
  atcEmergency(e); OPEN = null; ATC.ver++;
  flash((e[0] === 'mayday' ? 'MAYDAY' : 'PAN PAN') + ' préparé : appuyez sur « Appeler » pour le transmettre', 'am');
}
var orig = window.atcRender;
window.atcRender = function(force){
  orig.apply(this, arguments);
  var p = document.getElementById('atc'); if (!p || p.hidden || p.querySelector('.abtn2') || !MI || !ATC.seq) return;
  var base = p.querySelector('.abtn'); if (!base) return;
  var x = curX(), air = !S.onGround, declared = (ATC.q || []).some(function(q){ return q.emer; });
  var html = '<div class="abtn abtn2">'
    + '<button type="button" data-x="again" ' + (lastAtc() ? '' : 'disabled') + ' title="Demander au contrôleur de répéter son dernier message">Répéter</button>'
    + '<button type="button" data-x="stby" ' + (ATC.state === 'rb' ? '' : 'disabled') + ' title="Différer votre collationnement">Standby</button>'
    + '<button type="button" data-x="radio" aria-expanded="' + (OPEN === 'radio') + '" title="Choisir la station et la fréquence">Radio ▾</button>'
    + '<button type="button" class="emer" data-x="emer" aria-expanded="' + (OPEN === 'emer') + '" ' + (air && !declared ? '' : 'disabled') + ' title="' + (air ? 'Déclarer une urgence' : 'En vol seulement') + '">Mayday / Pan-Pan</button>'
    + '</div>';
  if (OPEN === 'radio') {
    var cur = x ? x.st : ATC.curSt;
    html += '<div class="apick" role="group" aria-label="Stations du parcours">' + routeStations().map(function(k){
      var s = STN[k], on = Math.abs(tunedF() - s.f) < 0.004;
      return '<button type="button" data-st="' + k + '" class="' + (on ? 'now' : '') + '"><span>' + (k === cur ? '★ ' : '') + s.n + '</span><span>' + fq(k)
        + ' MHz <small>' + (s.ref ? '[RÉFÉRENCÉ]' : s.est ? '[ESTIMÉ]' : '') + (on ? ' · réglée' : '') + '</small></span></button>';
    }).join('') + '<p class="anote">★ station attendue à ce point du parcours. Stations et fréquences du moteur, avec leur source.</p></div>';
  }
  if (OPEN === 'emer') {
    html += '<div class="apick" role="group" aria-label="Motif de l\'urgence">' + reasons().map(function(r, i){
      return '<button type="button" data-em="' + i + '"><span>' + (r[0] === 'mayday' ? 'MAYDAY' : 'PAN PAN') + ' · ' + r[2] + '</span><small>' + r[1] + '</small></button>';
    }).join('') + '<p class="anote">Mayday : détresse, danger grave et imminent. Pan-Pan : urgence sans danger immédiat. Le message part au « Appeler ».</p></div>';
  }
  base.insertAdjacentHTML('afterend', html);
  p.querySelectorAll('[data-x]').forEach(function(b){ b.onclick = function(){
    var a = b.dataset.x;
    if (a === 'again') sayAgain(); else if (a === 'stby') standby();
    else if (a === 'radio') OPEN = OPEN === 'radio' ? null : 'radio'; else if (a === 'emer') OPEN = OPEN === 'emer' ? null : 'emer';
    ATC.ver++; atcRender(true);
  }; });
  p.querySelectorAll('[data-st]').forEach(function(b){ b.onclick = function(){
    var k = b.dataset.st; atcTune(k); atcLog('SYS', null, STN[k].n + ' : fréquence ' + fq(k) + ' affichée et activée.'); OPEN = null; ATC.ver++; atcRender(true);
  }; });
  var R = reasons();
  p.querySelectorAll('[data-em]').forEach(function(b){ b.onclick = function(){ declare(R[+b.dataset.em]); atcRender(true); }; });
};

/* Son sur téléphone (demande de l'auteur du 20/11 17:33 : « je n'entends pas les conversations de la radio en mode mobile »).
   1) Le bouton « Son » rend audibles toutes les conversations : la voix du contrôleur suit « Son » (la case « Voix du
      contrôleur » reste disponible pour la couper seule).
   2) Les navigateurs des téléphones (Safari surtout) ne laissent parler la voix de synthèse qu'après un premier son lancé
      par un toucher de l'écran ; nos répliques partent après un délai, elles étaient donc bloquées. Au premier toucher, on
      prononce un texte vide (volume 0) et on réveille le son de la page ; ensuite les répliques passent. Chrome sur Android
      met parfois la voix en pause : elle est relancée régulièrement. */
var SON0 = null;
setInterval(function(){
  try { var on = !!(window.SND && SND.on); if (on !== SON0) { if (SON0 !== null || on) ATC.voice = on; SON0 = on; ATC.ver++; }
    if (window.speechSynthesis && speechSynthesis.paused) speechSynthesis.resume(); } catch (e) {}
}, 400);
function unlockVoice(){
  try { if (window.speechSynthesis) { var u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); speechSynthesis.resume(); }
    if (typeof AUD !== 'undefined') { AUD = AUD || new (window.AudioContext || window.webkitAudioContext)(); if (AUD.state === 'suspended') AUD.resume(); }
    if (window.SND && SND.ctx && SND.ctx.state === 'suspended') SND.ctx.resume();
    window.__PS_VOICE_OK__ = (window.__PS_VOICE_OK__ || 0) + 1; } catch (e) {}
}
['pointerdown', 'touchend', 'keydown'].forEach(function(ev){ document.addEventListener(ev, function f(){ unlockVoice(); if (window.__PS_VOICE_OK__ >= 3) document.removeEventListener(ev, f, true); }, true); });
})();`;

/** Ajoute les boutons au moteur chargé dans le cadre (même origine : servi par l'API ou intégré en srcdoc). */
export function installRadioExt(frame: HTMLIFrameElement | null): boolean {
  const d = frame?.contentDocument, w = frame?.contentWindow as any;
  if (!d || !w || typeof w.atcRender !== 'function') return false;
  if (w.__PS_RADIO__) return true;
  const s = d.createElement('script');
  s.textContent = RADIO_EXT;
  d.body.appendChild(s);
  return !!w.__PS_RADIO__;
}
