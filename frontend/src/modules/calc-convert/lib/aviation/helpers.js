/** Outils partagés par les formules aviation. */

export const G = 9.80665; // pesanteur (m/s²)
export const KT_MS = 1852 / 3600; // 1 kt en m/s
export const FT_MIN_PER_KT = 6076.12 / 60; // 1 kt = 101,27 ft/min
export const NM_FT = 6076.12; // 1 NM en pieds

/** Nombre à la française : fr(1234.5, 1) -> "1 234,5" */
export const fr = (x, d = 0) =>
  Number(x).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });

/** Nombre signé : "+3" / "−2" */
export const sg = (x, d = 0) => (x >= 0 ? '+' : '−') + fr(Math.abs(x), d);

export const rad = (d) => (d * Math.PI) / 180;
export const deg = (r) => (r * 180) / Math.PI;

/** Angle dans ]−180 ; 180] */
export const rel = (a) => {
  let x = ((a % 360) + 360) % 360;
  if (x > 180) x -= 360;
  return x;
};

/** Cap ou route sur 3 chiffres : 5 -> "005°", 0 -> "360°" */
export const hdg = (a) => {
  let x = Math.round(((a % 360) + 360) % 360);
  if (x === 0) x = 360;
  return `${String(x).padStart(3, '0')}°`;
};

/** Minutes -> "1 h 25 min" */
export const hmin = (minutes) => {
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')} min`;
};

/** Température ISA (°C) à une altitude pression (ft) */
export const isaTemp = (zp) => 15 - (1.98 * zp) / 1000;

/** Pression ISA (hPa) à une altitude pression (ft) */
export const isaPressure = (zp) => 1013.25 * (1 - 6.8756e-6 * zp) ** 5.2559;

/** Masse volumique de l'air (kg/m³) */
export const airDensity = (pHpa, tC) => (pHpa * 100) / (287.05 * (tC + 273.15));
