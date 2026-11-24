import { BASE_FORMULAS } from './formulas-base.js';
import { NAV_FORMULAS } from './formulas-nav.js';
import { PERF_FORMULAS } from './formulas-perf.js';

import { PHASES as RAW_PHASES } from './phases.js';
import { FORMULA_SPECIFICS, PHASE_SPECIFICS } from './specifics.js';

export { AIRCRAFT_LONG, AIRCRAFT_TAG } from './specifics.js';

/** Familles de formules, dans l'ordre d'affichage */
export const GROUPS = [
  { id: 'unites', label: 'Unités et conversions' },
  { id: 'atmo', label: 'Atmosphère et altimétrie' },
  { id: 'vitesses', label: 'Vitesses, distances et temps' },
  { id: 'nav', label: 'Navigation et vent' },
  { id: 'montee', label: 'Montée et descente' },
  { id: 'virage', label: 'Virages et facteur de charge' },
  { id: 'carburant', label: 'Carburant' },
  { id: 'masse', label: 'Masse et centrage' },
  { id: 'perfo', label: 'Performances et aérodynamique' },
  { id: 'helico', label: 'Hélicoptère' },
];

/**
 * specifics : { avion?, helico? } = particularités selon l'appareil.
 * Absent = calcul et usage identiques pour tous les aéronefs.
 */
export const FORMULAS = [...BASE_FORMULAS, ...NAV_FORMULAS, ...PERF_FORMULAS].map((f) => ({
  ...f,
  specifics: FORMULA_SPECIFICS[f.id] ?? null,
}));

export const PHASES = RAW_PHASES.map((p) => ({ ...p, specifics: PHASE_SPECIFICS[p.id] ?? null }));

export const FORMULA_BY_ID = Object.fromEntries(FORMULAS.map((f) => [f.id, f]));

/** Valeurs par défaut du calculateur d'une formule */
export const defaults = (f) => Object.fromEntries(f.inputs.map((i) => [i.k, i.def]));
