import { cx } from '../../lib/cx.js';
import { AIRCRAFT_LONG, AIRCRAFT_TAG } from '../../lib/aviation/index.js';
import { FormulaCalculator, Specifics } from './parts.jsx';

/**
 * Une formule : titre, type d'aéronef, expression, puis (dépliée) légende, mini-cours,
 * particularités avion / hélicoptère, calculateur et « Approfondir ».
 * En variante "simulateur" : expression, particularités et calculateur.
 */
export default function FormulaCard({ formula, open, onToggle, onDeepen, isCourse, anchorPrefix = 'f' }) {
  return (
    <article id={`cc-av-${anchorPrefix}-${formula.id}`} className={cx(`av-card ${open ? 'open' : ''}`)}>
      <button type="button" className={cx('av-card-head')} onClick={onToggle} aria-expanded={open}>
        <span className={cx('av-card-title')}>{formula.title}</span>
        <span className={cx(`av-tag ${formula.aircraft}`)} title={AIRCRAFT_LONG[formula.aircraft]}>
          {AIRCRAFT_TAG[formula.aircraft]}
        </span>
        <span className={cx('av-chevron')} aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      <pre className={cx('av-formula')}>{formula.formula}</pre>

      {open && (
        <div className={cx('av-card-body')}>
          {isCourse && (
            <>
              <dl className={cx('av-vars')}>
                {formula.vars.map(([sym, desc]) => (
                  <div key={sym} className={cx('row')}>
                    <dt>{sym}</dt>
                    <dd>{desc}</dd>
                  </div>
                ))}
              </dl>
              <p className={cx('av-mini')}>{formula.mini}</p>
            </>
          )}
          {/* Particularités affichées dans les deux versions : elles conditionnent le bon usage du calcul */}
          <Specifics item={formula} isCourse={isCourse} />
          <FormulaCalculator formula={formula} />
          {isCourse && (
            <button type="button" className={cx('av-deepen')} onClick={() => onDeepen(formula.id)}>
              Approfondir : cours complet et 10 exercices corrigés ↓
            </button>
          )}
        </div>
      )}
    </article>
  );
}
