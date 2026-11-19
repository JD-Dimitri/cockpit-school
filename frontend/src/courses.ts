/**
 * Les cours en trois cycles (F42, F43) :
 * - Cours 0 · Préparation scientifique (data/academy-0.json) : sciences utiles à l'aéronautique, 30 exercices par thème ;
 * - Cours I · Initiation (data/academy.json) : les cours de l'Académie d'origine ;
 * - Cours II · Confirmé (data/academy-2.json) : mêmes thèmes, niveau très difficile (théorie de niveau ATPL).
 * Un fichier absent (pas encore rédigé) donne simplement un cycle vide.
 */
import { useEffect, useState } from 'react';
import { load, type Part } from './data';

export interface Cycle { id: string; file: string; title: string; d: string; parts: Part[] }

export const CYCLES: Omit<Cycle, 'parts'>[] = [
  { id: '0', file: 'academy-0', title: 'Cours 0 · Préparation scientifique',
    d: 'Les sciences utiles à l\'aéronautique : mathématiques, physique, unités, géographie. Un cours complet et 30 exercices corrigés par thème, du plus facile au plus difficile.' },
  { id: 'I', file: 'academy', title: 'Cours I · Initiation',
    d: 'Les bases du pilotage et de l\'aéronautique, du premier cours à la théorie du brevet de pilote.' },
  { id: 'II', file: 'academy-2', title: 'Cours II · Confirmé',
    d: 'Les mêmes thèmes au niveau très difficile : théorie de niveau ATPL, telle qu\'enseignée en école de pilotage professionnelle.' },
];

export function useCourses(): { cycles: Cycle[] | null; error: string | null } {
  const [cycles, setCycles] = useState<Cycle[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    Promise.all(
      CYCLES.map((c) =>
        load<Part[]>(c.file).then(
          (parts) => ({ ...c, parts }),
          (e: Error) => {
            if (c.file === 'academy') throw e;   // le Cours I est indispensable ; les autres peuvent manquer
            return { ...c, parts: [] as Part[] };
          },
        ),
      ),
    ).then((r) => alive && setCycles(r), (e: Error) => alive && setError(e.message));
    return () => { alive = false; };
  }, []);
  return { cycles, error };
}

export const allParts = (cycles: Cycle[]) => cycles.flatMap((c) => c.parts);
