import { useEffect, useState } from 'react';
import { ArrowUpDown } from '../../icons.js';
import { formatFr } from '../../lib/format.js';
import { useCalcApi } from '../../lib/apiContext.js';
import { parseInput, useApiResult } from '../../lib/useApiResult.js';
import { ResultLine } from './ui.jsx';
import { cx } from '../../lib/cx.js';

// Unités par défaut à l'ouverture de chaque catégorie
const DEFAULTS = {
  longueur: ['m', 'cm'],
  masse: ['kg', 'g'],
  aire: ['m2', 'ha'],
  temps: ['h', 'min'],
  donnees: ['go', 'mo'],
  volume: ['l', 'ml'],
  vitesse: ['kmh', 'ms'],
  temperature: ['c', 'f'],
};

// Le catalogue ne change pas : on le garde en mémoire après le premier appel (un cache par source de calcul)
const catalogCache = new WeakMap();
const loadCatalog = (api) => {
  if (!catalogCache.has(api)) {
    catalogCache.set(api, api.units().catch((e) => {
      catalogCache.delete(api);
      throw e;
    }));
  }
  return catalogCache.get(api);
};

export default function UnitPanel({ category }) {
  const api = useCalcApi();
  const [units, setUnits] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [from, setFrom] = useState(DEFAULTS[category][0]);
  const [to, setTo] = useState(DEFAULTS[category][1]);
  const [text, setText] = useState('1');

  useEffect(() => {
    loadCatalog(api)
      .then((catalog) => setUnits(catalog[category].units))
      .catch((e) => setLoadError(e.message));
  }, [api, category]);

  const value = parseInput(text);
  const { data, error, loading } = useApiResult(
    (signal) => api.convert({ category, from, to, value }, signal),
    [category, from, to, value],
    value !== null,
  );

  const unitLabel = (code) => units.find((u) => u.code === code)?.label ?? code;

  if (loadError) return <p className={cx("error")}>{loadError}</p>;

  return (
    <div className={cx("form")}>
      <label className={cx("field")}>
        <span>De</span>
        <select value={from} onChange={(e) => setFrom(e.target.value)}>
          {units.map((u) => (
            <option key={u.code} value={u.code}>{u.label}</option>
          ))}
        </select>
        <input
          inputMode="decimal"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Valeur à convertir"
        />
      </label>

      <button
        className={cx("swap")}
        aria-label="Inverser les unités"
        onClick={() => {
          setFrom(to);
          setTo(from);
        }}
      >
        <ArrowUpDown size={11} />
      </button>

      <label className={cx("field")}>
        <span>Vers</span>
        <select value={to} onChange={(e) => setTo(e.target.value)}>
          {units.map((u) => (
            <option key={u.code} value={u.code}>{u.label}</option>
          ))}
        </select>
      </label>

      <ResultLine
        loading={loading}
        error={error}
        value={data && formatFr(data.result, 8)}
        hint={unitLabel(to)}
      />
    </div>
  );
}
