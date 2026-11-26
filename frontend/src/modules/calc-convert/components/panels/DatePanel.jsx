import { useState } from 'react';
import { useCalcApi } from '../../lib/apiContext.js';
import { useApiResult } from '../../lib/useApiResult.js';
import { Segmented } from './ui.jsx';
import { cx } from '../../lib/cx.js';

// Date du jour en heure locale, au format AAAA-MM-JJ attendu par <input type="date">
const today = () => new Date().toLocaleDateString('sv-SE');
const plural = (n, word) => `${n} ${word}${n > 1 && !word.endsWith('s') ? 's' : ''}`;

export default function DatePanel() {
  const api = useCalcApi();
  const [mode, setMode] = useState('diff');
  const [start, setStart] = useState(today());
  const [end, setEnd] = useState(today());
  const [days, setDays] = useState('30');

  const isDiff = mode === 'diff';
  const daysNumber = /^-?\d+$/.test(days.trim()) ? Number(days) : null;

  const { data, error } = useApiResult(
    (signal) => (isDiff ? api.dateDiff({ start, end }, signal) : api.dateAdd({ start, days: daysNumber }, signal)),
    [mode, start, end, daysNumber],
    Boolean(start) && (isDiff ? Boolean(end) : daysNumber !== null),
  );

  return (
    <div className={cx("form")}>
      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          { value: 'diff', label: 'Écart entre dates' },
          { value: 'add', label: 'Ajouter des jours' },
        ]}
      />

      <label className={cx("field")}>
        <span>{isDiff ? 'Date de début' : 'Date de départ'}</span>
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
      </label>

      {isDiff ? (
        <label className={cx("field")}>
          <span>Date de fin</span>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
      ) : (
        <label className={cx("field")}>
          <span>Nombre de jours (négatif pour retirer)</span>
          <input inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value)} />
        </label>
      )}

      {error && <p className={cx("result error")}>{error}</p>}

      {data && !error && isDiff && 'totalDays' in data && (
        <div className={cx("result")}>
          <strong>{plural(data.totalDays, 'jour')}</strong>
          <small className={cx("muted")}>
            {[data.years && plural(data.years, 'an'), data.months && `${data.months} mois`, plural(data.days, 'jour')]
              .filter(Boolean)
              .join(', ')}
            {' · '}
            {plural(data.weeks, 'semaine')} et {plural(data.remainingDays, 'jour')}
          </small>
        </div>
      )}

      {data && !error && !isDiff && 'date' in data && (
        <div className={cx("result")}>
          <strong>{new Date(`${data.date}T00:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
          <small className={cx("muted")}>C’est un {data.weekday}.</small>
        </div>
      )}
    </div>
  );
}
