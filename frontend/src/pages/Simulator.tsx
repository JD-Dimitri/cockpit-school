/**
 * Simulateur : le moteur d'origine (V10.42.1) tourne tel quel dans un cadre isolé.
 * Rien n'est perdu pendant la migration ; chaque module porté en TypeScript le remplacera ensuite.
 * Version autonome : le moteur est intégré au fichier (window.__PT_LEGACY__) et chargé par srcdoc.
 *
 * #/simulateur/<action> lance directement une action des cours (mêmes actions que l'Académie d'origine,
 * fonction act() de acad.js) : auto, guide, exam, brief, sys:<appareil>[:<scène>], doc:<document>.
 * #/simulateur/ac:<appareil> ouvre directement l'écran de départ du simulateur (appareil, mission, heure, Démarrer),
 * avec cet appareil déjà choisi (bouton « Simulateur » de la fiche de l'appareil), sans autre étape :
 * l'écran s'ouvre sur la liste des appareils, carte de l'appareil choisie au centre et entourée (un toucher lance son parcours).
 * #/simulateur/go:<appareil>:<parcours>:<mode> lance un parcours validé sur la page Parcours, par les boutons du menu
 * d'origine (même suite qu'aujourd'hui : dossier de vol, puis parcours dans le mode choisi).
 */
import { useEffect, useRef, useState } from 'react';
import { apiAvailable } from '../auth';
import { installRadioExt } from '../legacy-ext/radio';
import { installMeteoExt } from '../legacy-ext/meteo';
import { installTourExt } from '../legacy-ext/tourAvion';
import { installEquipageExt } from '../legacy-ext/equipage';

/** Retouches d'affichage du moteur (version autonome : posées dès le chargement, sans attendre). */
const UI_CSS = '#intro .skip{display:none!important}#c-ac .ps-pick{outline:3px solid var(--cy);outline-offset:2px}#rtprop{bottom:calc(var(--barh,56px) + 18px)!important}';
const UI_STYLE = '<style id="ps-ui">' + UI_CSS + '</style>';

/** Indicatif radio propre à chaque appareil (F37) : le moteur d'origine donnait « SIMU 01 » au 777, à l'A350 et au C172.
 *  Indicatifs fictifs [SIMULÉ], posés au chargement du moteur sans modifier le fichier d'origine. */
const CSN_OLD = "{a320:'320',lj60:'60',s76:'76',h125:'125',r44:'44'}[ACK]||'01'";
const CSN_NEW = "{a320:'320',b777:'777',a350:'350',c172:'172',lj60:'60',s76:'76',h125:'125',r44:'44'}[ACK]||'01'";
/** F21 : trois fonctions du moteur audio (privées à son script) rendues accessibles à l'extension météo : état météo sonore
 *  à la position de l'avion, éclair, tonnerre. Ajout au chargement, fichier d'origine inchangé. */
const SND_OLD = 'SND.panel=sndPanel;';
const SND_NEW = 'SND.panel=sndPanel; SND.wxHere=wxHere; SND.lightning=lightning; SND.thunder=thunder;';
/** TA1 : plus de bip de recul de véhicule (« signal sonore ») pendant la visite à pied. TA2 : documents du dossier de vol
 *  accessibles à la tablette (DOCS.D). Ajouts au chargement, fichier d'origine inchangé. */
/** MET2 : densité de l'air réelle (température et QNH du METAR), voir legacy-ext/meteo.ts (__PS_RHOK__). */
const RHO_OLD = 'const isaRho=h=>isaP(Math.max(-500,h))/(287.05*isaT(Math.max(-500,h)));';
const RHO_NEW = 'const isaRho=h=>isaP(Math.max(-500,h))/(287.05*isaT(Math.max(-500,h)))*(window.__PS_RHOK__?window.__PS_RHOK__(h):1);';
const BEEP_OLD = 'if(onApt&&walk&&t>ST.beepT){ ST.beepT=t+25+R()*40; beeper(); }';
const DOCS_OLD = 'window.DOCS={ctx:()=>ctx(),';
const DOCS_NEW = 'window.DOCS={D,ctx:()=>ctx(),';
const prepare = (html: string) =>
  html.replace('</head>', UI_STYLE + '</head>').replace(CSN_OLD, CSN_NEW).replace(SND_OLD, SND_NEW).replace(BEEP_OLD, '').replace(DOCS_OLD, DOCS_NEW).replace(RHO_OLD, RHO_NEW)
    // Nom du projet (décision de l'auteur du 20/11 18:46) et bouton Introduction au-dessus d'« Académie » (19:03), dès le chargement
    .replace('<h1>SIMULATEUR <b>PLANE TRAJECTORIES</b></h1>', '<h1>SIMULATEUR <b>COCKPIT SCHOOL</b></h1>')
    .replace('<h1>✈ PLANE TRAJECTORIES · Introduction</h1>', '<h1>✈ COCKPIT SCHOOL · Introduction</h1>')
    .replace('b.onclick=home; box.prepend(b); } }', "b.onclick=home; const ac=box.querySelector('.acad-b'); if(ac) ac.before(b); else box.prepend(b); } }");

const ACTION = /^(auto|guide|exam|brief|sys:[a-z0-9]+(:[a-z0-9]+)?|doc:[a-z0-9-]+|go:[a-z0-9]+:[a-z0-9-]+:(guide|auto|free)|ac:[a-z0-9]+)$/;

/** Reprend act() de l'Académie d'origine avec les fonctions publiques du moteur. */
function runAction(w: any, k: string): boolean {
  if (k.startsWith('ac:')) {
    if (typeof w.renderMenu !== 'function' || !w.eval(`typeof AC==='object' && !!AC[${JSON.stringify(k.slice(3))}]`)) return false;
    return !!w.eval(
      `(function(ac){ var i=document.getElementById('intro'); if(i) i.hidden=true; try{ localStorage.setItem('sim-intro','1'); }catch(e){}` +
        ` selAC=ac; renderMenu(); var m=document.getElementById('menu'); if(m){ m.hidden=false; m.scrollTop=0; }` +
        // Choix direct (demande de l'auteur, 19/11 21:59) : la liste « Appareil — un clic lance le parcours » est affichée,
        // la carte de l'appareil choisi au centre et entourée ; un toucher sur la carte lance le parcours comme d'habitude.
        ` var pick=function(){ var c=document.querySelector('#c-ac [data-ac="'+ac+'"]'); if(!c) return;` +
        ` document.querySelectorAll('#c-ac .ps-pick').forEach(function(e){ e.classList.remove('ps-pick'); }); c.classList.add('ps-pick');` +
        ` c.scrollIntoView({block:'center'}); }; pick(); setTimeout(pick, 400);` +
        ` [500,1200,2500].forEach(function(t){ setTimeout(function(){ var j=document.getElementById('intro'); if(j) j.hidden=true; }, t); }); return true; })(${JSON.stringify(k.slice(3))})`,
    );
  }
  if (k.startsWith('go:')) {
    if (!w.BR?.launchMode || typeof w.renderMenu !== 'function') return false;
    const [, ac, mi, mode] = k.split(':');
    // Mêmes gestes que dans le menu d'origine : mode coché, puis clic sur l'appareil (parcours complet)
    // ou sur le bouton « ▶ appareil » de la mission ; l'appareil et la mission sont vérifiés par le moteur.
    return !!w.eval(
      `(function(ac,mi,mode){ if(!AC[ac]||!MISSIONS[mi]) throw new Error('Parcours ou appareil inconnu : '+mi+' / '+ac);` +
        ` var p=document.getElementById('m-peda'), a=document.getElementById('m-auto'); if(p) p.checked=mode==='guide'; if(a) a.checked=mode==='auto';` +
        ` var i=document.getElementById('intro'); if(i) i.hidden=true; try{ localStorage.setItem('sim-intro','1'); }catch(e){} selAC=ac; renderMenu();` +
        ` var full=(window.FULLOF?FULLOF(ac):null)===mi;` +
        ` var b=full?document.querySelector('#c-ac [data-ac="'+ac+'"]'):document.querySelector('.m2-mis [data-mi="'+mi+'"][data-k="'+ac+'"]');` +
        ` if(!b) return false; b.click(); return true; })(${JSON.stringify(ac)},${JSON.stringify(mi)},${JSON.stringify(mode)})`,
    );
  }
  if (k.startsWith('doc:')) {
    if (!w.DOCS?.open) return false;
    w.DOCS.open(k.slice(4));
    return true;
  }
  if (k.startsWith('sys')) {
    if (!w.SYSAT?.open) return false;
    const q = k.split(':');
    w.SYSAT.open(q[1], q[2]);
    return true;
  }
  if (!w.BR?.launchMode) return false;
  // selAC / selMI sont des variables du script d'origine : on les règle comme act() le fait.
  w.eval(
    `(function(k){ if(!selAC) selAC='a320'; if(!selMI||!MISSIONS[selMI]) selMI=(AC[selAC].kind==='fw')?'full-fw':'full-rw';` +
      ` try{ renderMenu(); }catch(e){} if(k==='brief'){ if(window.BR&&BR.show) BR.show(false,0); return; } BR.launchMode(k); })(${JSON.stringify(k)})`,
  );
  return true;
}

export function Simulator({ action }: { action?: string }) {
  // Parcours ou action lancés depuis la version Pro : l'introduction du moteur d'origine (déjà présentée par l'accueil et
  // la fiche du parcours) ne doit pas réapparaître par-dessus le vol. Même effet que son bouton « Passer ».
  if (action && ACTION.test(action)) {
    try { localStorage.setItem('sim-intro', '1'); } catch { /* stockage indisponible : runAction masque l'introduction */ }
  }
  // Version autonome : srcdoc (même origine que la page, y compris ouverte en file://, ce qui permet de lancer les actions).
  const embedded = window.__PT_LEGACY__;
  // En ligne : moteur servi par l'API, seulement aux comptes connectés (F41) ; sans serveur : fichier statique (développement).
  // Le moteur est chargé en texte puis affiché par srcdoc (même origine) : les retouches d'affichage sont posées
  // avant son démarrage, sans course au chargement.
  const [doc, setDoc] = useState<string | null>(embedded ?? null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  useEffect(() => {
    if (embedded) return;
    apiAvailable()
      .then((up) => fetch(up ? 'api/moteur' : 'legacy/plane-trajectories.html', { credentials: 'same-origin' }))
      .then((r) => { if (!r.ok) throw new Error(r.status === 401 ? 'connexion requise' : 'erreur ' + r.status); return r.text(); })
      .then(setDoc, (e: Error) => setLoadErr(e.message));
  }, []);
  const frame = useRef<HTMLIFrameElement>(null);
  const loaded = useRef(false);

  /** Attend que le moteur soit prêt (≤ 30 s : téléphones lents, moteur de 4,8 Mo), puis lance l'action demandée. */
  const launch = (k: string) => {
    let tries = 0;
    const tick = () => {
      const w = frame.current?.contentWindow as any;
      let done = false;
      try {
        done = !!w && runAction(w, k);
      } catch (e) {
        console.warn('Action du cours non lancée', k, e);
        return;
      }
      if (!done && ++tries < 150) setTimeout(tick, 200);
    };
    tick();
  };

  useEffect(() => {
    if (action && ACTION.test(action) && loaded.current) launch(action);
  }, [action]);

  // Demande de l'auteur (20/11 07:49) : une fois le vol lancé (menu du moteur fermé), la bande du site (logo, Parcours,
  // Simulateur, Cours, bandeau de démonstration) disparaît et laisse tout l'écran au simulateur ; elle revient avec le menu.
  useEffect(() => {
    const root = document.documentElement;
    const t = setInterval(() => {
      let vol = false;
      try {
        const m = frame.current?.contentDocument?.getElementById('menu');
        vol = !!m && m.hidden;
      } catch { /* moteur pas encore chargé */ }
      root.classList.toggle('sim-vol', vol);
    }, 400);
    return () => { clearInterval(t); root.classList.remove('sim-vol'); };
  }, []);

  return (
    <section className="sim">
      {loadErr && <p className="page err">Simulateur indisponible : {loadErr}</p>}
      {doc && (
        <iframe
          ref={frame}
          title="Simulateur COCKPIT SCHOOL (moteur d'origine PLANE TRAJECTORIES)"
          srcDoc={prepare(doc)}
          allow="fullscreen; microphone; autoplay"
          allowFullScreen
          onLoad={() => {
            loaded.current = true;
            // F37 : boutons radio (Répéter, Standby, Radio, Mayday / Pan-Pan) ajoutés dès que le moteur est prêt (≤ 30 s)
            let nx = 0;
            // F21 : choix de la météo et ses effets (piste, visibilité, précipitations, orage, foudre), voix du pilote
            // TA1 : tour avion (arrêts, flèches rouges, bilan) ; TA2 : tablette de documents et double contrôle de l'équipage
            const ext = () => {
              const f = frame.current, ok = [installRadioExt(f), installMeteoExt(f), installTourExt(f), installEquipageExt(f)];
              if (ok.includes(false) && ++nx < 150) setTimeout(ext, 200);
            };
            ext();
            // Introduction du moteur : bouton « Passer et aller au simulateur » du haut retiré (demande de l'auteur, 19/11 18:34) ;
            // « Plus tard : aller au simulateur » reste en bas. Style posé dès que le document du moteur est prêt (≤ 30 s).
            // Vérifié pendant 30 s : le document du moteur peut être remplacé au chargement (version autonome).
            let tries = 0;
            const ui = () => {
              try {
                const d = frame.current?.contentDocument;
                if (d?.head && d.URL !== 'about:blank' && !d.getElementById('ps-ui')) {
                  const st = d.createElement('style');
                  st.id = 'ps-ui';
                  st.textContent = UI_CSS;
                  d.head.appendChild(st);
                }
              } catch { return; /* cadre d'une autre origine : sans effet */ }
              if (++tries < 60) setTimeout(ui, 500);
            };
            ui();
            if (action && ACTION.test(action)) launch(action);
          }}
        />
      )}
    </section>
  );
}
