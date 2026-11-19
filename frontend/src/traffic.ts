/**
 * Trafic réel : client de GET /api/trafic (backend/src/Controller/TrafficController.php).
 * Sources possibles : récepteur ADS-B personnel (Raspberry Pi), OpenSky Network, Flightradar24 ;
 * c'est le serveur qui les interroge (clés secrètes, une réponse partagée par tous les élèves).
 */
import { apiAvailable } from './auth';

export type SourceName = 'recepteur' | 'opensky' | 'fr24';
export const SOURCE_LABEL: Record<SourceName, string> = { recepteur: 'Récepteur ADS-B', opensky: 'OpenSky Network', fr24: 'Flightradar24' };

export interface TrafficTarget {
  id: string; indicatif: string | null; immat: string | null; type: string | null;
  lat: number; lon: number; altFt: number | null; solKt: number | null; route: number | null; vsFtMin: number | null;
  auSol: boolean | null; squawk: string | null; depart: string | null; arrivee: string | null;
  t: number; source: SourceName; statut: 'OBSERVÉ';
}
export interface SourceState { etat: 'ok' | 'non configurée' | 'erreur'; appareils?: number; message?: string }
export interface TrafficResponse {
  heure: number;
  zone: { latmin: number; lonmin: number; latmax: number; lonmax: number };
  sources: Partial<Record<SourceName, SourceState>>;
  appareils: TrafficTarget[];
  statut: 'OBSERVÉ';
}
export interface Zone { latmin: number; lonmin: number; latmax: number; lonmax: number }

/** Zone autour d'un point (± dLat, ± dLon degrés), dans les limites acceptées par le serveur (400 °²). */
export function zoneAround(lat: number, lon: number, dLat = 1.5, dLon = 2): Zone {
  return { latmin: Math.max(-90, lat - dLat), lonmin: Math.max(-180, lon - dLon), latmax: Math.min(90, lat + dLat), lonmax: Math.min(180, lon + dLon) };
}

export type TrafficResult = { ok: true; data: TrafficResponse } | { ok: false; message: string };

export async function fetchTraffic(z: Zone, sources?: SourceName[]): Promise<TrafficResult> {
  if (!(await apiAvailable())) return { ok: false, message: 'Le serveur n\'est pas joignable : le trafic réel passe par le serveur de la version Pro (absent de la version autonome).' };
  const q = new URLSearchParams({ latmin: String(z.latmin), lonmin: String(z.lonmin), latmax: String(z.latmax), lonmax: String(z.lonmax) });
  if (sources) q.set('sources', sources.join(','));
  try {
    const r = await fetch('api/trafic?' + q, { headers: { Accept: 'application/json' } });
    const j = await r.json();
    return r.ok ? { ok: true, data: j } : { ok: false, message: j?.erreur || 'Erreur ' + r.status };
  } catch {
    return { ok: false, message: 'Serveur injoignable.' };
  }
}
