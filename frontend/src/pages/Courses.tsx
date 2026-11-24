import { useState } from 'react';
import { CalcPanel } from '../components/CalcPanel';

// Calculateur version « cours » (24/11/2026) : formules, mini-cours, annexes, exemples et exercices corrigés
function CoursCalc() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="btn cours-calc" onClick={() => setOpen(true)}>🧮 Calculatrice et formules</button>
      {open && <CalcPanel variant="cours" onClose={() => setOpen(false)} />}
    </>
  );
}
import type React from 'react';
import DOMPurify from 'dompurify';
import { type Quiz } from '../data';
import { useCourses, allParts } from '../courses';
import { apiAvailable } from '../auth';

/** Téléchargement PDF : généré par le serveur s'il est joignable, sinon par la fenêtre d'impression du navigateur. */
function PdfButton({ part, mod, label }: { part: string; mod?: string; label: string }) {
  const go = async () => {
    if (await apiAvailable()) location.href = `api/pdf/cours/${part}` + (mod ? '/' + mod : '');
    else location.hash = `#/imprimer/${part}` + (mod ? '/' + mod : '') + '/auto';
  };
  return (
    <button type="button" className="btn ghost" onClick={go}>
      ⬇ {label}
    </button>
  );
}

/**
 * Boutons d'action des cours (ouvrir l'atelier, lancer un mode, ouvrir un document) :
 * ils ouvrent le simulateur directement sur l'action, comme dans l'Académie d'origine.
 */
function courseAction(e: React.MouseEvent<HTMLDivElement>) {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-act],[data-docopen]');
  if (!b) return;
  e.preventDefault();
  const k = b.dataset.act ?? 'doc:' + b.dataset.docopen;
  location.hash = '#/simulateur/' + encodeURIComponent(k);
}

/** Le contenu des cours est du HTML rédigé dans le projet ; il est tout de même nettoyé avant affichage. */
const safe = (h: string) => ({ __html: DOMPurify.sanitize(h, { ADD_ATTR: ['target'] }) });

function QuizBlock({ quiz }: { quiz: Quiz[] }) {
  const [ans, setAns] = useState<Record<number, number>>({});
  const done = Object.keys(ans).length;
  const ok = quiz.filter((q, i) => ans[i] === q.c).length;
  return (
    <div className="quiz">
      <h3>Exercices · {quiz.length} questions corrigées</h3>
      {quiz.map((q, i) => (
        <fieldset key={i}>
          <legend>{i + 1}. {q.q}</legend>
          {q.o.map((o, j) => {
            const picked = ans[i] === j, show = ans[i] != null;
            const cls = show ? (j === q.c ? 'good' : picked ? 'bad' : '') : '';
            return (
              <label key={j} className={cls}>
                <input type="radio" name={'q' + i} disabled={show} checked={picked} onChange={() => setAns({ ...ans, [i]: j })} /> {o}
              </label>
            );
          })}
          {ans[i] != null && q.why && <p className="why" dangerouslySetInnerHTML={safe(q.why)} />}
        </fieldset>
      ))}
      {done === quiz.length && <p className="score">Score : {ok} / {quiz.length}</p>}
    </div>
  );
}

export function Courses({ part, mod }: { part?: string; mod?: string }) {
  const { cycles, error } = useCourses();
  if (error) return <p className="page err">Données indisponibles : {error}</p>;
  if (!cycles) return <p className="page">Chargement…</p>;
  const data = allParts(cycles);
  const P = data.find((p) => p.id === part);
  const M = P?.mods.find((m) => m.id === mod);
  if (P && M) {
    const i = P.mods.indexOf(M), prev = P.mods[i - 1], next = P.mods[i + 1];
    return (
      <article className="page course">
        <p className="crumb"><a href="#/cours">Cours</a> › <a href={'#/cours/' + P.id}>{P.n}</a> <CoursCalc /></p>
        <div className="titlebar">
          <h1>{M.t}</h1>
          <PdfButton part={P.id} mod={M.id} label="PDF du module" />
        </div>
        <div className="body" onClick={courseAction} dangerouslySetInnerHTML={safe(M.h)} />
        {M.quiz && M.quiz.length > 0 && <QuizBlock key={M.id} quiz={M.quiz} />}
        <nav className="pager" aria-label="Modules">
          {prev ? <a href={`#/cours/${P.id}/${prev.id}`}>← {prev.t}</a> : <span />}
          {next ? <a href={`#/cours/${P.id}/${next.id}`}>{next.t} →</a> : <span />}
        </nav>
      </article>
    );
  }
  const partBlock = (p: (typeof data)[number]) => (
    <div key={p.id}>
      <div className="titlebar">
        <h3><a href={'#/cours/' + p.id}>{p.n}</a></h3>
        <PdfButton part={p.id} label="PDF de la partie" />
      </div>
      <p className="sub" dangerouslySetInnerHTML={safe(p.d)} />
      <ol className="mods">
        {p.mods.map((m) => (
          <li key={m.id}>
            <a href={`#/cours/${p.id}/${m.id}`}>{m.t}</a>
            {m.quiz?.length ? <small> · {m.quiz.length} exercices</small> : null}
          </li>
        ))}
      </ol>
    </div>
  );
  return (
    <section className="page">
      <h1>Cours</h1>
      <p className="lead">Trois cycles, du plus simple au plus exigeant. Chaque module et chaque partie se téléchargent en PDF, avec les exercices et leurs corrigés.</p>
      <p><CoursCalc /></p>
      {P ? partBlock(P) : cycles.map((c) => (
        <section key={c.id} className="cycle" aria-labelledby={'cycle-' + c.id}>
          <h2 id={'cycle-' + c.id}>{c.title}</h2>
          <p className="sub">{c.d}</p>
          {c.parts.length ? c.parts.map(partBlock) : <p className="note">En cours de rédaction.</p>}
        </section>
      ))}
    </section>
  );
}
