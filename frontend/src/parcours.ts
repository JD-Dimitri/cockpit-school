/**
 * Parcours et appareils possibles : mêmes règles que le menu du moteur d'origine (V10.42.1, addon menu2.js) :
 * - parcours pilote complet de chaque appareil : FULLOF (a350.js, b777.js, c172.js), sinon full-fw / full-rw ;
 * - missions et scénarios : appareils de « acs », sinon l'appareil imposé (« ac »), sinon tous les avions
 *   (hors avion école) pour une mission avion, tous les hélicoptères pour une mission hélicoptère.
 * Le lancement passe par les boutons du menu d'origine : la suite (dossier de vol, parcours) est inchangée.
 */
import type { Aircraft, Mission } from './data';

const OWN_FULL: Record<string, string> = { a350: 'full-350', b777: 'full-777-af', c172: 'full-c172' };

/** Parcours pilote complet d'un appareil (FULLOF de l'original). */
export const fullOf = (k: string, ac: Aircraft): string => OWN_FULL[k] ?? (ac.kind === 'fw' ? 'full-fw' : 'full-rw');

export type Mode = 'guide' | 'auto' | 'free';
export const MODES: [Mode, string, string][] = [
  ['guide', 'Guidé (pédagogique)', 'Boîtes numérotées, actions guidées, calculs papier'],
  ['auto', 'Automatique (observation)', 'Le simulateur enchaîne seul toutes les étapes'],
  ['free', 'Libre', 'Sans guidage : vous pilotez seul'],
];

export interface Parcours {
  key: string;
  mission: Mission;
  /** parcours pilote complet (choix du mode) ou mission / scénario */
  full: boolean;
  tag: string;
  aircraft: string[];
}

export function parcoursList(missions: Record<string, Mission>, aircraft: Record<string, Aircraft>): Parcours[] {
  const keys = Object.keys(aircraft);
  const fulls = new Map<string, string[]>();
  keys.forEach((k) => {
    const f = fullOf(k, aircraft[k]);
    if (missions[f]) fulls.set(f, [...(fulls.get(f) ?? []), k]);
  });
  const out: Parcours[] = [];
  fulls.forEach((acs, key) => out.push({ key, mission: missions[key], full: true, tag: 'Parcours pilote complet', aircraft: acs }));
  const fwK = keys.filter((k) => aircraft[k].kind === 'fw' && !aircraft[k].sep), rwK = keys.filter((k) => aircraft[k].kind !== 'fw');
  for (const [key, m] of Object.entries(missions)) {
    if ((/^full|^parcours/.test(key) && !/^full-777/.test(key)) || fulls.has(key) || m.soon || m.link) continue;
    const ks = m.acs ? m.acs.filter((k) => aircraft[k]) : m.ac ? [m.ac] : m.fw ? fwK : m.rw ? rwK : [];
    if (!ks.length) continue;
    out.push({ key, mission: m, full: false, tag: /^sc-/.test(key) ? 'Scénario' : /^full-777/.test(key) ? 'Parcours pilote complet' : 'Vol libre', aircraft: ks });
  }
  return out;
}

/** Action du simulateur qui lance ce parcours avec cet appareil (voir pages/Simulator.tsx). */
export const launchAction = (ac: string, key: string, mode: Mode = 'guide'): string => `go:${ac}:${key}:${mode}`;
