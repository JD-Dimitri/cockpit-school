import { useState } from 'react';
import { formatMoney } from '../../lib/format.js';
import { useCalcApi } from '../../lib/apiContext.js';
import { parseInput, useApiResult } from '../../lib/useApiResult.js';
import { NumberField } from './ui.jsx';
import { cx } from '../../lib/cx.js';

export default function DiscountPanel() {
  const api = useCalcApi();
  const [price, setPrice] = useState('80');
  const [percent, setPercent] = useState('30');
  const [extra, setExtra] = useState('');

  const p = parseInput(price);
  const pc = parseInput(percent);
  const ex = parseInput(extra) ?? 0;

  const { data, error, loading } = useApiResult(
    (signal) => api.discount({ price: p, percent: pc, extraPercent: ex }, signal),
    [p, pc, ex],
    p !== null && pc !== null,
  );

  return (
    <div className={cx("form")}>
      <NumberField label="Prix initial" value={price} onChange={setPrice} suffix="€" />
      <NumberField label="Réduction" value={percent} onChange={setPercent} suffix="%" />
      <NumberField label="Remise supplémentaire (facultatif)" value={extra} onChange={setExtra} suffix="%" />

      {error && <p className={cx("result error")}>{error}</p>}
      {data && !error && (
        <dl className={cx(`summary ${loading ? 'loading' : ''}`)}>
          <dt>Prix final</dt>
          <dd className={cx("big")}>{formatMoney(data.finalPrice)} €</dd>
          <dt>Économie</dt>
          <dd>{formatMoney(data.saved)} €</dd>
          <dt>Réduction réelle</dt>
          <dd>{data.effectivePercent.toLocaleString('fr-FR')} %</dd>
        </dl>
      )}
    </div>
  );
}
