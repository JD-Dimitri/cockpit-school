// Fenêtre du calculateur (module calc-convert, intégré le 24/11/2026 à la demande de l'auteur).
// - version « simulateur » (formules et calculateurs) : simulateur en vol libre et en mode guidé ;
// - version « cours » (mini-cours, annexes, exemples, exercices) : simulateur en mode automatique et onglet COURS.
// Fenêtre à droite sur ordinateur, plein écran sur téléphone. Les clics et la molette ne passent pas au simulateur ;
// la frappe se fait dans la page (hors du cadre du moteur) : aucune commande de vol déclenchée.
import CalcConvertWidget from '../modules/calc-convert';

export function CalcPanel({ variant, onClose }: { variant: 'cours' | 'simulateur'; onClose: () => void }) {
  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();
  return (
    <div className="sim-calc-window" role="dialog" aria-label="Calculatrice et formules" data-variant={variant}
      onPointerDown={stop} onWheel={stop} onContextMenu={stop}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <CalcConvertWidget variant={variant} initialTab="aviation" onClose={onClose} />
    </div>
  );
}
