import { useState } from 'react';
import { useCalcApi } from '../../lib/apiContext.js';
import { useApiResult } from '../../lib/useApiResult.js';
import { Segmented } from './ui.jsx';
import { cx } from '../../lib/cx.js';

const BASES = [
  { value: 2, label: 'BIN', name: 'Binaire', key: 'bin' },
  { value: 8, label: 'OCT', name: 'Octal', key: 'oct' },
  { value: 10, label: 'DEC', name: 'Décimal', key: 'dec' },
  { value: 16, label: 'HEX', name: 'Hexadécimal', key: 'hex' },
];

/** Groupe les chiffres pour la lisibilité : 11111111 -> 1111 1111 */
const group = (s, size) => s.replace(new RegExp(`\\B(?=(\\w{${size}})+(?!\\w))`, 'g'), ' ');

export default function NumeralPanel() {
  const api = useCalcApi();
  const [base, setBase] = useState(10);
  const [value, setValue] = useState('255');

  const cleaned = value.replace(/\s/g, '');
  const { data, error } = useApiResult(
    (signal) => api.numeral({ value: cleaned, base }, signal),
    [cleaned, base],
    cleaned !== '' && cleaned !== '-',
  );

  return (
    <div className={cx("form")}>
      <Segmented
        value={base}
        onChange={setBase}
        options={BASES.map((b) => ({ value: b.value, label: b.label }))}
      />
      <label className={cx("field")}>
        <span>Valeur en base {base}</span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          autoCapitalize="characters"
          spellCheck="false"
        />
      </label>

      {error && <p className={cx("result error")}>{error}</p>}
      {data && !error && (
        <dl className={cx("summary mono")}>
          {BASES.map((b) => (
            <div key={b.key} className={cx("row")}>
              <dt>{b.name}</dt>
              <dd>{group(data[b.key], b.value === 10 ? 3 : 4)}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
