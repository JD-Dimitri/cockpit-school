/**
 * FORMULES dans le moteur (27/11/2026, « Dans tous les tests précise les formules ») : ajoute en tête de chaque
 * correction de calcul la formule générale (règles partagées avec le site : src/formules.ts).
 * Banques couvertes : test de positionnement (MATH, AERO, questions expertes), test post-parcours (CULT), QCM du
 * simulateur (QB, dont l'examen blanc PPL), QZ, et tous les QCM de l'Académie (ACAD.PARTS). Rien n'est retiré :
 * la correction chiffrée d'origine suit la formule. Répété toutes les 3 s (parties de l'Académie ajoutées plus tard),
 * sans doublon (repère 📐).
 */
import { FORMULES_JS } from '../formules';

const EXT = String.raw`(function(){
  if (window.__PS_FX__) return;
  var FX = ` + FORMULES_JS + String.raw`;
  var n = 0;
  function arr(x){ if (Array.isArray(x) && typeof x[0]==='string' && Array.isArray(x[1]) && typeof x[2]==='number' && typeof x[3]==='string') { var w = FX.W(x[0], x[3]); if (w !== x[3]) { x[3] = w; n++; } return true; } return false; }
  function walk(v, d){ if (!v || d > 6) return; if (Array.isArray(v)) { if (!arr(v)) v.forEach(function(y){ walk(y, d+1); }); } else if (typeof v === 'object') { if (typeof v.q==='string' && Array.isArray(v.o) && typeof v.why==='string') { var w = FX.W(v.q, v.why); if (w !== v.why) { v.why = w; n++; } } else Object.keys(v).forEach(function(k){ walk(v[k], d+1); }); } }
  function run(){
    try { walk(MATH, 0); } catch(e){}
    try { walk(AERO, 0); } catch(e){}
    try { walk(CULT, 0); } catch(e){}
    try { walk(QB, 0); } catch(e){}
    try { walk(QZ, 0); } catch(e){}
    try { if (window.__PS_NIV2__) { walk(__PS_NIV2__.XM, 0); walk(__PS_NIV2__.XA, 0); walk(__PS_NIV2__.MATH, 0); walk(__PS_NIV2__.AERO, 0); walk(__PS_NIV2__.CULT, 0); } } catch(e){}
    try { if (window.ACAD && ACAD.PARTS) ACAD.PARTS.forEach(function(p){ (p.mods||[]).forEach(function(m){ walk(m.quiz, 0); }); }); } catch(e){}
  }
  run(); setInterval(run, 3000);
  var st = document.createElement('style');
  st.textContent = '.fx{display:block;margin:0 0 4px;padding:4px 8px;border-left:3px solid #38bdf8;background:#0b2130;color:#bae6fd;border-radius:4px;font-size:.95em;line-height:1.45;user-select:text}.fx b{color:#7dd3fc;font-size:inherit;font-weight:700}';
  document.head.appendChild(st);
  window.__PS_FX__ = { F: FX.F, W: FX.W, count: function(){ return n; }, run: run };
})();`;

export function installFormulesExt(frame: HTMLIFrameElement | null): boolean {
  const d = frame?.contentDocument, w = frame?.contentWindow as any;
  if (!d || !w || !w.ACAD) return false;
  if (w.__PS_FX__) return true;
  const s = d.createElement('script');
  s.textContent = EXT;
  d.body.appendChild(s);
  return !!w.__PS_FX__;
}
