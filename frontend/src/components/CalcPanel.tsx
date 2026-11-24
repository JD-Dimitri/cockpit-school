// Fenêtre du calculateur (module calc-convert, intégré le 24/11/2026 à la demande de l'auteur).
// - version « simulateur » (formules et calculateurs) : simulateur en vol libre et en mode guidé ;
// - version « cours » (mini-cours, annexes, exemples, exercices) : simulateur en mode automatique et onglet COURS.
// Fenêtre à droite sur ordinateur, plein écran sur téléphone. Les clics et la molette ne passent pas au simulateur ;
// la frappe se fait dans la page (hors du cadre du moteur) : aucune commande de vol déclenchée.
import { useEffect, useRef } from 'react';
import CalcConvertWidget from '../modules/calc-convert';

export function CalcPanel({ variant, onClose }: { variant: 'cours' | 'simulateur'; onClose: () => void }) {
  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();
  const box = useRef<HTMLDivElement>(null);
  // Échap ferme la fenêtre où que soit le focus dans la page ; la fenêtre prend le focus à l'ouverture
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    box.current?.focus();
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') close.current(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);
  return (
    <div ref={box} tabIndex={-1} className="sim-calc-window" role="dialog" aria-modal="true" aria-label="Calculatrice et formules" data-variant={variant}
      onPointerDown={stop} onWheel={stop} onContextMenu={stop}>
      <CalcConvertWidget variant={variant} initialTab="aviation" onClose={onClose} />
    </div>
  );
}
