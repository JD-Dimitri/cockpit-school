import { useEffect, useState } from 'react';
import { ArrowUpDown } from '../../icons.js';
import { formatMoney } from '../../lib/format.js';
import { useCalcApi } from '../../lib/apiContext.js';
import { parseInput, useApiResult } from '../../lib/useApiResult.js';
import { ResultLine } from './ui.jsx';
import { cx } from '../../lib/cx.js';

export default function CurrencyPanel() {
  const api = useCalcApi();
  const [info, setInfo] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [from, setFrom] = useState('EUR');
  const [to, setTo] = useState('USD');
  const [text, setText] = useState('100');

  useEffect(() => {
    api.currencies().then(setInfo).catch((e) => setLoadError(e.message));
  }, []);

  const value = parseInput(text);
  const { data, error, loading } = useApiResult(
    (signal) => api.currency({ from, to, value }, signal),
    [from, to, value],
    value !== null && info !== null,
  );

  if (loadError) return <p className={cx("error")}>{loadError}</p>;
  if (!info) return <p className={cx("muted")}>Chargement des taux…</p>;

  const codes = Object.keys(info.rates);
  const options = codes.map((c) => (
    <option key={c} value={c}>{c} — {info.names[c]}</option>
  ));

  return (
    <div className={cx("form")}>
      <label className={cx("field")}>
        <span>De</span>
        <select value={from} onChange={(e) => setFrom(e.target.value)}>{options}</select>
        <input inputMode="decimal" value={text} onChange={(e) => setText(e.target.value)} aria-label="Montant" />
      </label>

      <button className={cx("swap")} aria-label="Inverser les devises" onClick={() => { setFrom(to); setTo(from); }}>
        <ArrowUpDown size={11} />
      </button>

      <label className={cx("field")}>
        <span>Vers</span>
        <select value={to} onChange={(e) => setTo(e.target.value)}>{options}</select>
      </label>

      <ResultLine
        loading={loading}
        error={error}
        value={data && `${formatMoney(data.result)} ${to}`}
        hint={`Source : ${info.source}${info.date ? `, taux du ${new Date(`${info.date}T00:00:00`).toLocaleDateString('fr-FR')}` : ''}`}
      />
    </div>
  );
}
