import { cx } from '../../lib/cx.js';

/** Petits composants partagés par tous les panneaux. */

export function ResultLine({ loading, error, value, hint }) {
  if (error) return <p className={cx("result error")}>{error}</p>;
  return (
    <div className={cx(`result ${loading ? 'loading' : ''}`)} aria-live="polite">
      <strong>{value ?? '—'}</strong>
      {hint && <small className={cx("muted")}>{hint}</small>}
    </div>
  );
}

export function NumberField({ label, value, onChange, suffix }) {
  return (
    <label className={cx("field")}>
      <span>{label}</span>
      <div className={cx("input-wrap")}>
        <input inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} />
        {suffix && <em>{suffix}</em>}
      </div>
    </label>
  );
}

export function Segmented({ options, value, onChange }) {
  return (
    <div className={cx("segmented")} role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          className={cx(value === o.value ? 'active' : '')}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
