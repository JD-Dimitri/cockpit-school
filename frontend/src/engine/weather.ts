/**
 * Météo — portage exact du moteur d'origine (V10.42.1, module « MÉTÉO RÉELLE : METAR, vent, QNH, ATIS ») :
 * parseMetar, vecFrom, metNear, surfWind, windAt, windDirSpd, qnhAt.
 * Le moteur d'origine lit ses variables globales (WXS, APTS, elevAt) ; ici elles sont passées en paramètre (WxContext).
 * Les résultats doivent rester identiques à l'original : voir tests/parity_engine.py (cas « météo »).
 */
import { D2R, R2D, KT, FT, gcKm, wrap360 } from './geo';

export interface Cloud { cov: string; base: number; cb: string }
export interface Metar {
  raw: string; icao: string; day?: number; hh?: number; mm?: number;
  vrb?: boolean; dir: number; spd: number; gust: number; varF?: number; varT?: number;
  cavok?: boolean; vis: number; clouds: Cloud[]; wx: string[]; temp: number; dew?: number | null; qnh: number; inHg?: number;
}
export interface WxContext {
  /** METAR connus, par code OACI (WXS.met dans le moteur d'origine) */
  met: Record<string, Metar>;
  /** aérodromes du simulateur (APTS) : seuls ceux-là servent au vent et au QNH */
  apts: Record<string, { lat: number; lon: number }>;
  /** vent en altitude réglable (WXS.upper) */
  upper: { dir: number; spd: number; fl: number };
  /** altitude du relief (m) */
  elevAt: (lat: number, lon: number) => number;
}

const WX_RE = /^[-+]?(VC)?(MI|BC|PR|DR|BL|SH|TS|FZ)?(DZ|RA|SN|SG|PL|GR|GS|UP|BR|FG|FU|VA|DU|SA|HZ|PO|SQ|FC|SS|DS)+$/;

/** Lecture d'un METAR au format OACI (vent, visibilité en m ou en SM, nuages, temps présent, température, QNH ou altimètre). */
export function parseMetar(raw: string): Metar | null {
  const t = String(raw || '').trim().toUpperCase().replace(/=+$/, '').split(/\s+/);
  if (t.length < 3) return null;
  const m = { raw: t.join(' '), clouds: [], wx: [] } as unknown as Metar & { vis?: number; temp?: number; qnh?: number };
  let i = 0;
  if (t[i] === 'METAR' || t[i] === 'SPECI') i++;
  if (!/^[A-Z]{4}$/.test(t[i])) return null;
  m.icao = t[i++];
  if (/^\d{6}Z$/.test(t[i])) { m.day = +t[i].slice(0, 2); m.hh = +t[i].slice(2, 4); m.mm = +t[i].slice(4, 6); i++; }
  if (t[i] === 'AUTO' || t[i] === 'COR') i++;
  const w = /^(VRB|\d{3})(\d{2,3})(G(\d{2,3}))?(KT|MPS|KMH)$/.exec(t[i] || '');
  if (w) {
    const k = w[5] === 'MPS' ? 1.944 : w[5] === 'KMH' ? 0.54 : 1;
    m.vrb = w[1] === 'VRB'; m.dir = m.vrb ? 0 : +w[1]; m.spd = Math.round(+w[2] * k); m.gust = w[4] ? Math.round(+w[4] * k) : 0; i++;
  } else { m.dir = 0; m.spd = 0; m.gust = 0; }
  if (/^\d{3}V\d{3}$/.test(t[i] || '')) { m.varF = +t[i].slice(0, 3); m.varT = +t[i].slice(4); i++; }
  for (; i < t.length; i++) {
    const s = t[i];
    if (s === 'RMK' || s === 'TEMPO' || s === 'BECMG' || s === 'NOSIG') break;
    if (s === 'CAVOK') { m.cavok = true; m.vis = 10000; continue; }
    if (/^\d{4}$/.test(s) && m.vis == null) { m.vis = s === '9999' ? 10000 : +s; continue; }
    if (/^(M?\d+|\d+\/\d+|\d+ \d+\/\d+)SM$/.test(s)) {
      const v = s.replace('SM', '').replace('M', ''), fr = v.split('/');
      m.vis = Math.min(10000, Math.round((fr.length === 2 ? +fr[0] / +fr[1] : +v) * 1609)); continue;
    }
    if (/^R\d{2}[LCR]?\//.test(s)) continue;
    let c = /^(FEW|SCT|BKN|OVC|VV)(\d{3})(CB|TCU)?$/.exec(s);
    if (c) { m.clouds.push({ cov: c[1], base: +c[2] * 100, cb: c[3] || '' }); continue; }
    if (/^(SKC|CLR|NSC|NCD)$/.test(s)) continue;
    c = /^(M?\d{2})\/(M?\d{2})?$/.exec(s);
    if (c) { const f = (x?: string) => (x == null ? null : x[0] === 'M' ? -+x.slice(1) : +x); m.temp = f(c[1]) as number; m.dew = f(c[2]); continue; }
    c = /^Q(\d{4})$/.exec(s); if (c) { m.qnh = +c[1]; continue; }
    c = /^A(\d{4})$/.exec(s); if (c) { m.qnh = Math.round((+c[1] / 100) * 33.8639); m.inHg = +c[1] / 100; continue; }
    if (WX_RE.test(s) || /^[-+]?(TS|SH)$/.test(s)) m.wx.push(s);
  }
  if (m.qnh == null) m.qnh = 1013;
  if (m.temp == null) m.temp = 15;
  if (m.vis == null) m.vis = 10000;
  return m;
}

/** Vitesse de la masse d'air (m/s vers l'est, vers le nord) pour un vent qui VIENT de dir (°) à spd (kt). */
export function vecFrom(dir: number, spdKt: number): [number, number] {
  const s = spdKt * KT;
  return [-s * Math.sin(dir * D2R), -s * Math.cos(dir * D2R)];
}

/** METAR des aérodromes du simulateur, du plus proche au plus éloigné : [distance km, METAR]. */
export function metNear(lat: number, lon: number, cx: WxContext): [number, Metar][] {
  const best: [number, Metar][] = [];
  for (const k in cx.met) { const a = cx.apts[k]; if (!a) continue; best.push([gcKm(lat, lon, a.lat, a.lon), cx.met[k]]); }
  best.sort((a, b) => a[0] - b[0]);
  return best;
}

/** Vent de surface : moyenne des deux METAR les plus proches, pondérée par 1/d² (d ≥ 5 km). */
export function surfWind(lat: number, lon: number, cx: WxContext): [number, number] {
  const L = metNear(lat, lon, cx);
  if (!L.length) return [0, 0];
  let wE = 0, wN = 0, ws = 0;
  for (const [d, m] of L.slice(0, 2)) { const k = 1 / Math.max(5, d) ** 2, v = vecFrom(m.dir, m.vrb ? 0 : m.spd); wE += v[0] * k; wN += v[1] * k; ws += k; }
  return [wE / ws, wN / ws];
}

/**
 * Vent à une altitude : couche limite (le vent forcit ≈ ×1,4 jusqu'à 2 000 ft sol), puis interpolation vers le vent
 * en altitude (renforcé de 15 % sur l'Atlantique nord, réduit à 80 % ailleurs), puis décroissance au-dessus.
 */
export function windAt(lat: number, lon: number, alt: number, cx: WxContext): [number, number] {
  const ag = Math.max(0, alt - cx.elevAt(lat, lon)) / FT, s = surfWind(lat, lon, cx), U = cx.upper, oce = lon < -15 && lon > -60;
  const u = vecFrom(U.dir, U.spd * (oce ? 1.15 : 0.8)), up = U.fl * 100;
  if (ag < 2000) { const f = Math.sqrt(ag / 2000), v2 = [s[0] * 1.4, s[1] * 1.4]; return [s[0] + (v2[0] - s[0]) * f, s[1] + (v2[1] - s[1]) * f]; }
  const v2 = [s[0] * 1.4, s[1] * 1.4], h = alt / FT;
  if (h < up) { const f = (h - 2000) / (up - 2000); return [v2[0] + (u[0] - v2[0]) * f, v2[1] + (u[1] - v2[1]) * f]; }
  const f = Math.max(0.6, 1 - (h - up) / 15000);
  return [u[0] * f, u[1] * f];
}

/** Direction d'où vient le vent (°) et force (kt). */
export function windDirSpd(w: [number, number]): [number, number] {
  const s = Math.hypot(w[0], w[1]) / KT;
  return [wrap360(Math.atan2(-w[0], -w[1]) * R2D), s];
}

/** QNH (hPa) : celui du METAR le plus proche, ou interpolé entre les deux plus proches. */
export function qnhAt(lat: number, lon: number, cx: WxContext): number {
  const L = metNear(lat, lon, cx);
  if (!L.length) return 1013.25;
  if (L.length === 1) return L[0][1].qnh;
  const [a, b] = L, k = a[0] / (a[0] + b[0]);
  return a[1].qnh * (1 - k) + b[1].qnh * k;
}
