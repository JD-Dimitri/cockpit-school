import { useState } from 'react';
import { formatMoney } from '../../lib/format.js';
import { useCalcApi } from '../../lib/apiContext.js';
import { parseInput, useApiResult } from '../../lib/useApiResult.js';
import { NumberField } from './ui.jsx';
import { cx } from '../../lib/cx.js';

/** Simulateur de prêt : mensualité, coût total, intérêts. */
export default function FinancePanel() {
  const api = useCalcApi();
  const [principal, setPrincipal] = useState('10000');
  const [rate, setRate] = useState('4,5');
  const [years, setYears] = useState('5');

  const p = parseInput(principal);
  const r = parseInput(rate);
  const y = parseInput(years);
  const ready = p !== null && r !== null && y !== null;

  const { data, error, loading } = useApiResult(
    (signal) => api.loan({ principal: p, rate: r, months: Math.round(y * 12) }, signal),
    [p, r, y],
    ready,
  );

  return (
    <div className={cx("form")}>
      <NumberField label="Montant emprunté" value={principal} onChange={setPrincipal} suffix="€" />
      <NumberField label="Taux annuel" value={rate} onChange={setRate} suffix="%" />
      <NumberField label="Durée" value={years} onChange={setYears} suffix="ans" />

      {error && <p className={cx("result error")}>{error}</p>}
      {data && !error && (
        <dl className={cx(`summary ${loading ? 'loading' : ''}`)}>
          <dt>Mensualité</dt>
          <dd className={cx("big")}>{formatMoney(data.monthlyPayment)} €</dd>
          <dt>Coût des intérêts</dt>
          <dd>{formatMoney(data.totalInterest)} €</dd>
          <dt>Total remboursé</dt>
          <dd>{formatMoney(data.totalPaid)} €</dd>
          <dt>Nombre de mensualités</dt>
          <dd>{data.months}</dd>
        </dl>
      )}
      <p className={cx("muted small")}>Hors assurance et frais de dossier.</p>
    </div>
  );
}
