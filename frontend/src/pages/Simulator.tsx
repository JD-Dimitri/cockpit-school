/**
 * Simulateur : le moteur d'origine (V10.42.1) tourne tel quel dans un cadre isolé.
 * Rien n'est perdu pendant la migration ; chaque module porté en TypeScript le remplacera ensuite.
 * Version autonome : le moteur est intégré au fichier (window.__PT_LEGACY__) et chargé par srcdoc.
 *
 * #/simulateur/<action> lance directement une action des cours (mêmes actions que l'Académie d'origine,
 * fonction act() de acad.js) : auto, guide, exam, brief, sys:<appareil>[:<scène>], doc:<document>.
 */
import { useEffect, useRef } from 'react';

const ACTION = /^(auto|guide|exam|brief|sys:[a-z0-9]+(:[a-z0-9]+)?|doc:[a-z0-9-]+)$/;

/** Reprend act() de l'Académie d'origine avec les fonctions publiques du moteur. */
function runAction(w: any, k: string): boolean {
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
  const frame = useRef<HTMLIFrameElement>(null);
  const loaded = useRef(false);

  /** Attend que le moteur soit prêt (≤ 8 s), puis lance l'action demandée. */
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
      if (!done && ++tries < 40) setTimeout(tick, 200);
    };
    tick();
  };

  useEffect(() => {
    if (action && ACTION.test(action) && loaded.current) launch(action);
  }, [action]);

  return (
    <section className="sim">
      {(
        <iframe
          ref={frame}
          title="Simulateur PLANE TRAJECTORIES"
          {...(embedded ? { srcDoc: embedded } : { src: 'legacy/plane-trajectories.html' })}
          allow="fullscreen; microphone; autoplay"
          allowFullScreen
          onLoad={() => {
            loaded.current = true;
            if (action && ACTION.test(action)) launch(action);
          }}
        />
      )}
    </section>
  );
}
