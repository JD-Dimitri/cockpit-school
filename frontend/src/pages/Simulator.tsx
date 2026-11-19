/**
 * Simulateur : le moteur d'origine (V10.42.1) tourne tel quel dans un cadre isolé.
 * Rien n'est perdu pendant la migration ; chaque module porté en TypeScript le remplacera ensuite.
 * Version autonome : le moteur est intégré au fichier (window.__PT_LEGACY__) et chargé par srcdoc.
 *
 * #/simulateur/<action> lance directement une action des cours (mêmes actions que l'Académie d'origine,
 * fonction act() de acad.js) : auto, guide, exam, brief, sys:<appareil>[:<scène>], doc:<document>.
 * #/simulateur/go:<appareil>:<parcours>:<mode> lance un parcours validé sur la page Parcours, par les boutons du menu
 * d'origine (même suite qu'aujourd'hui : dossier de vol, puis parcours dans le mode choisi).
 */
import { useEffect, useRef, useState } from 'react';
import { apiAvailable } from '../auth';
import { installRadioExt } from '../legacy-ext/radio';

const ACTION = /^(auto|guide|exam|brief|sys:[a-z0-9]+(:[a-z0-9]+)?|doc:[a-z0-9-]+|go:[a-z0-9]+:[a-z0-9-]+:(guide|auto|free))$/;

/** Reprend act() de l'Académie d'origine avec les fonctions publiques du moteur. */
function runAction(w: any, k: string): boolean {
  if (k.startsWith('go:')) {
    if (!w.BR?.launchMode || typeof w.renderMenu !== 'function') return false;
    const [, ac, mi, mode] = k.split(':');
    // Mêmes gestes que dans le menu d'origine : mode coché, puis clic sur l'appareil (parcours complet)
    // ou sur le bouton « ▶ appareil » de la mission ; l'appareil et la mission sont vérifiés par le moteur.
    return !!w.eval(
      `(function(ac,mi,mode){ if(!AC[ac]||!MISSIONS[mi]) throw new Error('Parcours ou appareil inconnu : '+mi+' / '+ac);` +
        ` var p=document.getElementById('m-peda'), a=document.getElementById('m-auto'); if(p) p.checked=mode==='guide'; if(a) a.checked=mode==='auto';` +
        ` var i=document.getElementById('intro'); if(i) i.hidden=true; selAC=ac; renderMenu();` +
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
  // Version autonome : srcdoc (même origine que la page, y compris ouverte en file://, ce qui permet de lancer les actions).
  const embedded = window.__PT_LEGACY__;
  // En ligne : moteur servi par l'API, seulement aux comptes connectés (F41) ; sans serveur : fichier statique (développement).
  const [src, setSrc] = useState<string | null>(embedded ? null : '');
  useEffect(() => {
    if (!embedded) apiAvailable().then((up) => setSrc(up ? 'api/moteur' : 'legacy/plane-trajectories.html'));
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

  return (
    <section className="sim">
      {(embedded || src) && (
        <iframe
          ref={frame}
          title="Simulateur PLANE SIMULATOR (moteur d'origine PLANE SIMULATOR)"
          {...(embedded ? { srcDoc: embedded } : { src: src! })}
          allow="fullscreen; microphone; autoplay"
          allowFullScreen
          onLoad={() => {
            loaded.current = true;
            // F37 : boutons radio (Répéter, Standby, Radio, Mayday / Pan-Pan) dès que le moteur est prêt
            let n = 0;
            const ext = () => { if (!installRadioExt(frame.current) && ++n < 150) setTimeout(ext, 200); };
            ext();
            if (action && ACTION.test(action)) launch(action);
          }}
        />
      )}
    </section>
  );
}
