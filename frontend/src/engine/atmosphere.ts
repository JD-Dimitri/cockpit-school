/**
 * Atmosphère standard internationale (ISA) et vitesses — portage exact du moteur d'origine
 * (src/base.html : isaT, isaP, isaRho, sos, casFromTas, tasFromCas). Unités SI : h en m, vitesses en m/s.
 * Modèle : troposphère jusqu'à 11 000 m puis tropopause isotherme ; statut [CALCULÉ] (formules ISA OACI).
 */
export const isaT = (h: number): number => (h < 11000 ? 288.15 - 0.0065 * h : 216.65);

export const isaP = (h: number): number =>
  h < 11000 ? 101325 * Math.pow(1 - 2.25577e-5 * h, 5.25588) : 22632 * Math.exp(-(h - 11000) / 6341.6);

export const isaRho = (h: number): number => isaP(Math.max(-500, h)) / (287.05 * isaT(Math.max(-500, h)));

/** Vitesse du son (m/s). */
export const sos = (h: number): number => Math.sqrt(1.4 * 287.05 * isaT(h));

/** Vitesse conventionnelle à partir de la vitesse vraie (relation compressible). */
export function casFromTas(tas: number, h: number): number {
  const p = isaP(h), M = tas / sos(h), qc = p * (Math.pow(1 + 0.2 * M * M, 3.5) - 1);
  return 340.294 * Math.sqrt(5 * (Math.pow(qc / 101325 + 1, 2 / 7) - 1));
}

/** Vitesse vraie à partir de la vitesse conventionnelle (6 itérations, comme le moteur d'origine). */
export function tasFromCas(cas: number, h: number): number {
  let v = cas;
  for (let i = 0; i < 6; i++) v *= cas / Math.max(1, casFromTas(v, h));
  return v;
}

/** Nombre de Mach. */
export const mach = (tas: number, h: number): number => tas / sos(h);
