/**
 * Simulateur : le moteur d'origine (V10.42.1) tourne tel quel dans un cadre isolé.
 * Rien n'est perdu pendant la migration ; chaque module porté en TypeScript le remplacera ensuite.
 * Version autonome : le moteur est intégré au fichier (window.__PT_LEGACY__) et ouvert depuis la mémoire.
 */
import { useEffect, useState } from 'react';

export function Simulator() {
  const [src, setSrc] = useState(window.__PT_LEGACY__ ? '' : 'legacy/plane-trajectories.html');
  useEffect(() => {
    if (!window.__PT_LEGACY__) return;
    const url = URL.createObjectURL(new Blob([window.__PT_LEGACY__], { type: 'text/html' }));
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, []);
  return (
    <section className="sim">
      {src && (
        <iframe
          title="Simulateur PLANE TRAJECTORIES"
          src={src}
          allow="fullscreen; microphone; autoplay"
          allowFullScreen
        />
      )}
    </section>
  );
}
