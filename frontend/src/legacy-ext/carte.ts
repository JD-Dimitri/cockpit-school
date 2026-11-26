/**
 * MAP2 (demande de l'auteur du 26/11/2026 13:05 « go Leaflet ») : carte du monde réelle et gratuite dans le panneau « Carte ».
 * Bouton « 🛰 Satellite » dans l'en-tête du panneau : une carte Leaflet (licence BSD-2, intégrée au simulateur) remplace la carte
 * dessinée, suit l'appareil, trace la route du plan de vol, la trace parcourue et la destination. Trois fonds (normes OGC WMTS / XYZ) :
 *   • Satellite monde : EOX « Sentinel-2 cloudless 2016 » — CC BY 4.0, usage commercial permis avec mention ;
 *   • Satellite France : IGN Géoplateforme, orthophotographies — Licence Ouverte 2.0 (Etalab), sans clé ;
 *   • Plan : OpenStreetMap — données ODbL ; les tuiles de tile.openstreetmap.org sont réservées à un usage modéré
 *     (politique d'usage OSMF) : en production, passer par un fournisseur ou ses propres tuiles.
 * Les mentions obligatoires sont affichées en bas de la carte. Sans réseau (version autonome hors ligne), la carte dessinée reste.
 */
import LJS from '../vendor/leaflet.js.txt';
import LCSS from '../vendor/leaflet.css.txt';

export const CARTE_EXT = String.raw`(function(){
if (window.__PS_MAP2__) return;
var L = window.L;   // Leaflet (window.L), même si le moteur a une variable globale L
var MP = window.__PS_MAP2__ = { on:false, map:null };
try { MP.on = localStorage.getItem('cs-map-sat') === '1'; } catch (e) {}
var css = document.createElement('style');
css.textContent = '#mapw .lfl{position:absolute;left:0;right:0;z-index:2;background:#0b1622}#mapw .lfl[hidden]{display:none}' +
  '#mapw .mh [data-sat].on{background:#e04ad8;color:#fff;border-color:#e04ad8}#mapw .leaflet-control-attribution{font-size:9px;max-width:100%;white-space:normal}' +
  '#mapw .lfl .off{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:12px;color:#9fb1c1;font:12px Inter,sans-serif;z-index:500;pointer-events:none}' +
  '.ps-ac{font-size:22px;line-height:22px;text-shadow:0 0 3px #000}';
document.head.appendChild(css);
function geom(W){ var h = W.querySelector('.mh'), f = W.querySelector('.mf'), c = W.querySelector('canvas'), d = MP.div; if (!d || !c) return;
  d.style.top = c.offsetTop + 'px'; d.style.height = c.offsetHeight + 'px'; if (MP.map) MP.map.invalidateSize(false); }
function layers(){
  var eox = L.tileLayer('https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg', { maxZoom:15, maxNativeZoom:15,
    attribution:'<a href="https://s2maps.eu" target="_blank" rel="noopener">Sentinel-2 cloudless 2016</a> by EOX IT Services GmbH (contient des données Copernicus Sentinel modifiées 2016) · CC BY 4.0' });
  var ign = L.tileLayer('https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&FORMAT=image/jpeg&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
    { minZoom:6, maxZoom:19, maxNativeZoom:19, bounds:[[41, -5.5], [51.5, 10]], attribution:'Orthophotos © <a href="https://geoservices.ign.fr" target="_blank" rel="noopener">IGN</a> · Licence Ouverte 2.0' });
  var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19,
    attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">contributeurs OpenStreetMap</a>' });
  var sat = L.layerGroup([eox, ign]);
  return { 'Satellite (Sentinel-2 monde + IGN France)':sat, 'Plan (OpenStreetMap)':osm };
}
function make(W){
  if (MP.map || typeof L === 'undefined') return;
  var d = document.createElement('div'); d.className = 'lfl'; d.hidden = true; W.appendChild(d); MP.div = d;
  var m = L.map(d, { zoomControl:false, attributionControl:true, worldCopyJump:true, preferCanvas:true }).setView([S.lat, S.lon], 8);
  m.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
  var B = layers(), first = B[Object.keys(B)[0]]; first.addTo(m); L.control.layers(B, null, { position:'topright', collapsed:true }).addTo(m);
  MP.route = L.polyline([], { color:'#e04ad8', weight:2, dashArray:'6 6' }).addTo(m);
  MP.track = L.polyline([], { color:'#ffd166', weight:2 }).addTo(m);
  MP.dest = L.circleMarker([0, 0], { radius:6, color:'#3fd0ff', weight:2, fillOpacity:0.3 }).addTo(m);
  MP.ac = L.marker([S.lat, S.lon], { icon:L.divIcon({ className:'ps-ac', html:'<div>✈</div>', iconSize:[22, 22], iconAnchor:[11, 11] }), interactive:false, keyboard:false }).addTo(m);
  MP.follow = true; m.on('dragstart', function(){ MP.follow = false; });
  var off = document.createElement('div'); off.className = 'off'; off.hidden = true; off.textContent = 'Images satellite indisponibles (pas de réseau) : touchez 🛰 pour revenir à la carte dessinée.'; d.appendChild(off); MP.offEl = off;
  var errs = 0; m.eachLayer(function(l){ if (l.on) l.on('tileerror', function(){ if (++errs > 8) off.hidden = false; }); l.on && l.on('tileload', function(){ errs = 0; off.hidden = true; }); });
  MP.map = m;
}
function tick(){
  var W = document.getElementById('mapw'); if (!W) return;
  var hd = W.querySelector('.mh'); if (hd && !hd.querySelector('[data-sat]')){
    var b = document.createElement('button'); b.type = 'button'; b.dataset.sat = '1'; b.textContent = '🛰'; b.title = 'Carte satellite réelle (Leaflet : Sentinel-2, IGN, OpenStreetMap)';
    b.onclick = function(){ MP.on = !MP.on; try { localStorage.setItem('cs-map-sat', MP.on ? '1' : '0'); } catch (e) {} MP.follow = true; tick(); };
    var x = hd.querySelector('[data-b]') || hd.querySelector('[data-x]'); hd.insertBefore(b, x);
    hd.querySelectorAll('[data-m]').forEach(function(bb){ bb.addEventListener('click', function(){ MP.follow = bb.dataset.m === 'follow'; MP.fit = bb.dataset.m === 'route'; }); });
    hd.querySelectorAll('[data-z]').forEach(function(bb){ bb.addEventListener('click', function(){ if (MP.on && MP.map) MP.map.setZoom(MP.map.getZoom() + (+bb.dataset.z)); }); });
  }
  var sb = hd && hd.querySelector('[data-sat]'); if (sb) sb.classList.toggle('on', MP.on);
  if (W.hidden) return;
  if (MP.on) make(W);
  if (!MP.map) return;
  MP.div.hidden = !MP.on; if (!MP.on) return;
  geom(W);
  try {
    var p = [S.lat, S.lon]; MP.ac.setLatLng(p); var ic = MP.ac.getElement(); if (ic) ic.firstChild.style.transform = 'rotate(' + Math.round((S.psi * 180 / Math.PI) - 45) + 'deg)';
    var F = window.FPLN; MP.route.setLatLngs(F && F.pts ? F.pts.map(function(q){ return [q[0], q[1]]; }) : []);
    var D = MI && MI.dest && APTS[MI.dest]; if (D) MP.dest.setLatLng([D.lat, D.lon]).bindTooltip(D.n);
    if (MP.fit && F && F.pts && F.pts.length > 1){ MP.map.fitBounds(L.latLngBounds(F.pts.map(function(q){ return [q[0], q[1]]; })), { padding:[16, 16] }); MP.fit = false; }
    else if (MP.follow) MP.map.panTo(p, { animate:false });
    if (!MP.tr) MP.tr = []; var l = MP.tr[MP.tr.length - 1]; if (!l || Math.abs(l[0] - p[0]) + Math.abs(l[1] - p[1]) > 0.005){ MP.tr.push(p); if (MP.tr.length > 3000) MP.tr.shift(); MP.track.setLatLngs(MP.tr); }
  } catch (e) {}
}
setInterval(tick, 700);
})();`;

export function installCarteExt(frame: HTMLIFrameElement | null): boolean {
  const d = frame?.contentDocument, w = frame?.contentWindow as any;
  if (!d || !w || typeof w.gcKm !== 'function') return false;
  if (w.__PS_MAP2__) return true;
  if (!w.L) {
    const st = d.createElement('style'); st.textContent = LCSS; d.head.appendChild(st);
    const lj = d.createElement('script'); lj.textContent = LJS; d.body.appendChild(lj);
  }
  const s = d.createElement('script');
  s.textContent = CARTE_EXT;
  d.body.appendChild(s);
  return !!w.__PS_MAP2__;
}
