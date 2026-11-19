/**
 * Accès aux données. Aujourd'hui : fichiers JSON statiques (data/*.json, extraits du moteur d'origine).
 * Demain : API Symfony (/api/...), avec la même forme de données — seul BASE change.
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
  acs?: string[];
  route?: [number, number, string][];
  start?: { lat: number; lon: number; hdg: number; elev: number } | null;
}
export interface Quiz { q: string; o: string[]; c: number; why?: string }
export interface Module { id: string; t: string; h: string; quiz?: Quiz[] }
export interface Part { id: string; n: string; d: string; mods: Module[] }
export interface DataIndex { source: string; engine: string; simver: string; extracted: string; files: Record<string, number> }

const cache = new Map<string, Promise<unknown>>();

export function load<T>(name: string): Promise<T> {
  if (!cache.has(name)) {
    cache.set(
      name,
      fetch(BASE + name + '.json').then((r) => {
        if (!r.ok) throw new Error(`${name}.json : ${r.status}`);
        return r.json();
      }),
    );
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
