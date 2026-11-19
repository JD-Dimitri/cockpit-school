/**
 * Géographie sur la sphère terrestre — portage exact du moteur d'origine
 * (plane-trajectories-simulator V10.42.1, src/base.html : gcKm, brg, gcFrac, offsetLL, ecef, enuBasis).
 * Les résultats doivent rester identiques au moteur d'origine : voir tests/parity_engine.py.
 */
export const D2R = Math.PI / 180;
export const R2D = 180 / Math.PI;
/** Rayon terrestre (m) utilisé par le moteur d'origine pour le repère 3D. */
export const RE = 6371000;
/** Unités du moteur d'origine : nœud (m/s), pied (m), pesanteur standard (m/s²). */
export const KT = 0.514444;
export const FT = 0.3048;
export const G0 = 9.80665;
/** Rayon terrestre (km) utilisé pour les distances orthodromiques. */
export const RE_KM = 6371;

export const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
export const wrap360 = (a: number): number => ((a % 360) + 360) % 360;
export const wrapPi = (a: number): number => {
  a = (a + Math.PI) % (2 * Math.PI);
  if (a < 0) a += 2 * Math.PI;
  return a - Math.PI;
};

/** Distance orthodromique (km), formule de haversine. */
export function gcKm(a1: number, o1: number, a2: number, o2: number): number {
  const d = Math.sin(((a2 - a1) * D2R) / 2) ** 2 + Math.cos(a1 * D2R) * Math.cos(a2 * D2R) * Math.sin(((o2 - o1) * D2R) / 2) ** 2;
  return 2 * RE_KM * Math.asin(Math.sqrt(d));
}

/** Route initiale vraie (°) de 1 vers 2. */
export function brg(a1: number, o1: number, a2: number, o2: number): number {
  const y = Math.sin((o2 - o1) * D2R) * Math.cos(a2 * D2R);
  const x = Math.cos(a1 * D2R) * Math.sin(a2 * D2R) - Math.sin(a1 * D2R) * Math.cos(a2 * D2R) * Math.cos((o2 - o1) * D2R);
  return wrap360(Math.atan2(y, x) * R2D);
}

/**
 * Point à la fraction f de l'orthodromie 1 → 2 ([lat, lon]) : interpolation de la corde ECEF
 * puis projection sur la sphère, comme le moteur d'origine.
 */
export function gcFrac(a1: number, o1: number, a2: number, o2: number, f: number): [number, number] {
  const P = ecef(a1, o1, 0), Q = ecef(a2, o2, 0);
  const p = [0, 1, 2].map((i) => P[i] + (Q[i] - P[i]) * f);
  const n = Math.hypot(p[0], p[1], p[2]);
  return [Math.asin(p[2] / n) * R2D, Math.atan2(p[1], p[0]) * R2D];
}

/** Décalage local en mètres vers le nord (dN) et l'est (dE). */
export function offsetLL(lat: number, lon: number, dN: number, dE: number): [number, number] {
  return [lat + (dN / RE) * R2D, lon + (dE / (RE * Math.cos(lat * D2R))) * R2D];
}

/** Coordonnées ECEF sur la sphère (m). */
export function ecef(lat: number, lon: number, h: number): [number, number, number] {
  const r = RE + h, cl = Math.cos(lat * D2R);
  return [r * cl * Math.cos(lon * D2R), r * cl * Math.sin(lon * D2R), r * Math.sin(lat * D2R)];
}

export interface Enu { E: [number, number, number]; N: [number, number, number]; U: [number, number, number] }

/** Base locale Est / Nord / Haut. */
export function enuBasis(lat: number, lon: number): Enu {
  const sl = Math.sin(lat * D2R), cl = Math.cos(lat * D2R), so = Math.sin(lon * D2R), co = Math.cos(lon * D2R);
  return { E: [-so, co, 0], N: [-sl * co, -sl * so, cl], U: [cl * co, cl * so, sl] };
}
