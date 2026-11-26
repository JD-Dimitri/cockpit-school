import { useMemo, useState } from 'react';
import { cx } from '../../lib/cx.js';
import { fr } from '../../lib/aviation/helpers.js';
import { defaults } from '../../lib/aviation/index.js';

/** Champs pouvant être négatifs : clavier texte pour avoir le signe moins sur mobile */
const SIGNED = new Set(['oat', 'disa', 'dm', 'dev', 't', 'td', 'ts']);

const parse = (s) => {
  const n = Number(String(s).replace(/\s/g, '').replace(',', '.').replace('−', '-'));
  return String(s).trim() === '' || !Number.isFinite(n) ? null : n;
};

export const formatResult = (r) => r.text ?? `${fr(r.value, r.d)}${r.unit ? ` ${r.unit}` : ''}`;


/** Calculateur d'une formule : champs + résultats en direct */
export function FormulaCalculator({ formula }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(Object.entries(defaults(formula)).map(([k, v]) => [k, typeof v === 'number' ? String(v).replace('.', ',') : v])),
  );

  const results = useMemo(() => {
    const v = {};
    for (const input of formula.inputs) {
      if (input.type === 'select') v[input.k] = values[input.k];
      else {
        const n = parse(values[input.k]);
        if (n === null) return null;
        v[input.k] = n;
      }
    }
    try {
      const res = formula.calc(v);
      return res.every((r) => Number.isFinite(r.value)) ? res : null;
    } catch {
      return null;
    }
  }, [formula, values]);

  return (
    <div className={cx('av-calc')}>
      <div className={cx('av-inputs')}>
        {formula.inputs.map((input) => (
          <label key={input.k} className={cx(`av-field ${input.type === 'select' ? 'wide' : ''}`)}>
            <span>{input.label}{input.unit ? ` (${input.unit})` : ''}</span>
            {input.type === 'select' ? (
              <select value={values[input.k]} onChange={(e) => setValues({ ...values, [input.k]: e.target.value })}>
                {input.options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : (
              <input
                inputMode={SIGNED.has(input.k) ? 'text' : 'decimal'}
                value={values[input.k]}
                onChange={(e) => setValues({ ...values, [input.k]: e.target.value })}
              />
            )}
          </label>
        ))}
      </div>
      <div className={cx('av-results')} aria-live="polite">
        {results ? (
          results.map((r, i) => (
            <div key={i} className={cx(`av-res ${i === 0 ? 'main' : ''}`)}>
              <span>{r.label}</span>
              <strong>{formatResult(r)}</strong>
            </div>
          ))
        ) : (
          <p className={cx('muted small')}>Saisis des valeurs numériques valides.</p>
        )}
      </div>
    </div>
  );
}

/** Énoncé + correction pas à pas + résultats */
export function Solution({ formula, v }) {
  const res = formula.calc(v);
  return (
    <div className={cx('av-solution')}>
      <ol>
        {formula.steps(v).map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
      <p className={cx('av-answer')}>
        <span>Réponse : </span>
        {res.slice(0, 2).map((r, i) => (
          <strong key={i}>{i > 0 ? ' · ' : ''}{r.label} {formatResult(r)}</strong>
        ))}
      </p>
    </div>
  );
}

/** Exercice avec correction masquée */
export function Exercise({ n, formula, v, scenario }) {
  const [open, setOpen] = useState(false);
  return (
    <li className={cx('av-exercise')}>
      <p>
        <b>Exercice {n}. </b>
        {scenario ? `${scenario} ` : ''}
        {formula.ask(v)}
      </p>
      <button type="button" className={cx('av-link')} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {open ? 'Masquer la correction' : 'Voir la correction'}
      </button>
      {open && <Solution formula={formula} v={v} />}
    </li>
  );
}

/** Exemple résolu (toujours affiché) */
export function Example({ n, formula, v, scenario }) {
  return (
    <li className={cx('av-example')}>
      <p className={cx('av-example-head')}>
        <b>Exemple {n} · {formula.title}</b>
      </p>
      <p>{scenario} {formula.ask(v)}</p>
      <Solution formula={formula} v={v} />
    </li>
  );
}

const SPEC_ROWS = [
  ['avion', 'Avion'],
  ['helico', 'Hélicoptère'],
];

/**
 * Particularités avion / hélicoptère d'une formule ou d'une étape.
 * Sans particularité : rappelle (version cours) que le calcul est le même pour tous les aéronefs.
 */
export function Specifics({ item, isCourse = true, sameText = 'Calcul identique pour les avions et les hélicoptères.' }) {
  const s = item.specifics;
  if (!s) {
    return isCourse && item.aircraft === 'both' ? <p className={cx('av-same')}>{sameText}</p> : null;
  }
  const rows = SPEC_ROWS.filter(([k]) => s[k]);
  if (!rows.length) return null;
  return (
    <div className={cx('av-specifics')}>
      <p className={cx('av-specifics-title')}>Particularités</p>
      {rows.map(([k, label]) => (
        <p key={k}>
          <b>{label} : </b>
          {s[k]}
        </p>
      ))}
    </div>
  );
}
