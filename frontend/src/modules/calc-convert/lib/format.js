/** Formats d'affichage à la française. */

export function formatFr(value, maxDecimals = 6) {
  if (value === null || value === undefined || Number.isNaN(value)) return '';
  const abs = Math.abs(value);
  if (abs !== 0 && (abs >= 1e15 || abs < 1e-6)) {
    return value.toExponential(6).replace('.', ',').replace('e+', 'E').replace('e', 'E');
  }
  return value.toLocaleString('fr-FR', { maximumFractionDigits: maxDecimals });
}

export const formatMoney = (value) =>
  value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
