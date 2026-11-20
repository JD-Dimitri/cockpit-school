/**
 * Version imprimable d'un module ou d'une partie entière de l'Académie, QCM et corrigés compris.
 * Sert au téléchargement PDF : par le serveur (Symfony, quand il est joignable) ou, en secours,
 * par « Enregistrer au format PDF » de la fenêtre d'impression du navigateur.
 */
import { useEffect } from 'react';
import DOMPurify from 'dompurify';
import { useCourses, allParts } from '../courses';
import { useData, type Module, type Part } from '../data';

const safe = (h: string) => ({ __html: DOMPurify.sanitize(h) });
const LETTERS = 'ABCDEFGH';

function ModuleBlock({ m }: { m: Module }) {
  const quiz = m.quiz ?? [];
  return (
    <article className="pmod">
      <h2>{m.t}</h2>
      <div className="body" dangerouslySetInnerHTML={safe(m.h)} />
      {quiz.length > 0 && (
        <>
          <h3>Exercices · QCM ({quiz.length} questions)</h3>
          <ol className="pq">
            {quiz.map((q, i) => (
              <li key={i}>
                <p>{q.q}</p>
                <ul>
                  {q.o.map((o, j) => (
                    <li key={j}><b>{LETTERS[j]}.</b> {o}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <section className="corr">
            <h3>Corrigé</h3>
            <ol>
              {quiz.map((q, i) => (
                <li key={i}>
                  <b>{LETTERS[q.c]}. {q.o[q.c]}</b>
                  {q.why && <span dangerouslySetInnerHTML={safe(' — ' + q.why)} />}
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </article>
  );
}

export function PrintCourse({ part, mod, auto }: { part?: string; mod?: string; auto?: boolean }) {
  const { cycles, error } = useCourses();
  const data = cycles ? allParts(cycles) : null;
  const P = data?.find((p) => p.id === part);
  const mods = P ? (mod ? P.mods.filter((m) => m.id === mod) : P.mods) : [];
  const title = P ? (mod && mods[0] ? mods[0].t : P.n) : '';
  useEffect(() => {
    if (!title) return;
    const before = document.title;
    // Le titre de la page devient le nom proposé pour le fichier PDF.
    document.title = 'COCKPIT SCHOOL - ' + title;
    let t = 0;
    if (auto) t = window.setTimeout(() => window.print(), 400);
    return () => {
      clearTimeout(t);
      document.title = before;
    };
  }, [title, auto]);
  if (error) return <p className="page err">Données indisponibles : {error}</p>;
  if (!data) return <p className="page">Chargement…</p>;
  if (!P || mods.length === 0) return <p className="page err">Cours introuvable.</p>;
  const back = mod ? `#/cours/${P.id}/${mod}` : `#/cours/${P.id}`;
  return (
    <div className="print">
      <div className="noprint pbar">
        <a href={back}>← Retour au cours</a>
        <button className="btn" onClick={() => window.print()}>Enregistrer en PDF / imprimer</button>
        <small>Dans la fenêtre d'impression, choisissez « Enregistrer au format PDF ».</small>
      </div>
      <header className="phead">
        <p>COCKPIT SCHOOL · Académie</p>
        <h1>{title}</h1>
        {mod && <p>{P.n}</p>}
        <p className="pnote">Document pédagogique. Ne remplace pas un manuel de vol approuvé ni l'enseignement d'un instructeur.</p>
      </header>
      {mods.map((m) => (
        <ModuleBlock key={m.id} m={m} />
      ))}
    </div>
  );
}
