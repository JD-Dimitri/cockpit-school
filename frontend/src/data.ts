import { apiAvailable } from './auth';
/**
 * Accès aux données. Aujourd'hui : fichiers JSON statiques (data/*.json, extraits du moteur d'origine).
 * En ligne : API Symfony (/api/data/...), même forme de données ; voir load().
 */
import { useEffect, useState } from 'react';

const BASE = 'data/';

export interface Flap { n: string; a: number; b: number; c: number }
export interface Aircraft {
  kind: 'fw' | 'rw';
  name: string;
  sub: string;
  cockpit: string;
  m: number;
  S?: number;
  Tmax?: number;
  Vr?: number;
  V2?: number;
  Vmo?: number;
  Mmo?: number;
  Vne?: number;
  ceil?: number;
  range?: number;
  flaps?: Flap[];
  twin?: boolean;
  ext: { len: number; span?: number; rotor?: number };
  /** avion école (Cessna 172) : parcours propre, hors des vols de ligne */
  sep?: boolean;
  afcs?: boolean;
}
/** Piste : [QFU 1, QFU 2, lat1, lon1, lat2, lon2, largeur?] */
export type Runway = [string, string, number, number, number, number, number?];
export interface Airport { n: string; lat: number; lon: number; elev: number; rw: Runway[] }
export interface Mission {
  n: string;
  d: string;
  fw?: boolean;
  rw?: boolean;
  soon?: boolean;
  full?: boolean;
  dest?: string;
  destRw?: string;
  aircraft?: string;
  /** appareil imposé (mission propre à un appareil) */
  ac?: string;
  acs?: string[];
  link?: string;
  dep?: string;
  route?: [number, number, string][];
  start?: { lat: number; lon: number; hdg: number; elev: number } | null;
}
export interface Quiz { q: string; o: string[]; c: number; why?: string }
export interface Module { id: string; t: string; h: string; quiz?: Quiz[] }
export interface Part { id: string; n: string; d: string; mods: Module[] }
export interface DataIndex { source: string; engine: string; simver: string; extracted: string; files: Record<string, number> }

const cache = new Map<string, Promise<unknown>>();

/** Version autonome (un seul fichier HTML) : les données y sont intégrées dans window.__PT_DATA__. */
declare global {
  interface Window { __PT_DATA__?: Record<string, unknown>; __PT_LEGACY__?: string }
}

/**
 * Site en ligne : données servies par l'API Symfony (/api/data/<nom>), réservées aux comptes connectés (F41).
 * Développement et tests sans serveur : fichiers statiques data/<nom>.json (absents du site publié).
 */
export function load<T>(name: string): Promise<T> {
  const embedded = window.__PT_DATA__?.[name];
  if (embedded !== undefined) return Promise.resolve(embedded as T);
  if (!cache.has(name)) {
    const json = (r: Response) => {
      if (!r.ok) throw new Error(`${name} : ${r.status === 401 ? 'connexion requise' : r.status}`);
      return r.json();
    };
    const p = apiAvailable().then((up) =>
      up
        ? fetch('api/data/' + name, { credentials: 'same-origin', headers: { Accept: 'application/json' } }).then((r) =>
            r.status === 404 ? fetch(BASE + name + '.json').then(json) : json(r),
          )
        : fetch(BASE + name + '.json').then(json),
    );
    p.catch(() => cache.delete(name));   // nouvel essai après connexion
    cache.set(name, p);
  }
  return cache.get(name) as Promise<T>;
}

export function useData<T>(name: string): { data: T | null; error: string | null } {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    load<T>(name).then(
      (d) => live && setData(d),
      (e: Error) => live && setError(e.message),
    );
    return () => {
      live = false;
    };
  }, [name]);
  return { data, error };
}
