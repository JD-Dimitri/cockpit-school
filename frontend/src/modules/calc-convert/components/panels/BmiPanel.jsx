import { useState } from 'react';
import { useCalcApi } from '../../lib/apiContext.js';
import { parseInput, useApiResult } from '../../lib/useApiResult.js';
import { NumberField } from './ui.jsx';
import { cx } from '../../lib/cx.js';

export default function BmiPanel() {
  const api = useCalcApi();
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('175');

  const w = parseInput(weight);
  const h = parseInput(height);
  const { data, error } = useApiResult(
    (signal) => api.bmi({ weight: w, height: h }, signal),
    [w, h],
    w !== null && h !== null,
  );

  return (
    <div className={cx("form")}>
      <NumberField label="Poids" value={weight} onChange={setWeight} suffix="kg" />
      <NumberField label="Taille" value={height} onChange={setHeight} suffix="cm" />

      {error && <p className={cx("result error")}>{error}</p>}
      {data && !error && (
        <div className={cx("result")}>
          <strong>IMC : {data.bmi.toLocaleString('fr-FR')}</strong>
          <span className={cx(`badge ${data.level}`)}>{data.category}</span>
        </div>
      )}
      <p className={cx("muted small")}>
        Classes de l’OMS pour les adultes. Indicatif, ne remplace pas l’avis d’un professionnel de santé.
      </p>
    </div>
  );
}
