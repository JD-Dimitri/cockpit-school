import { useState } from 'react';
import DOMPurify from 'dompurify';
import { useData, type Part, type Quiz } from '../data';

/** Le contenu des cours est du HTML rédigé dans le projet ; il est tout de même nettoyé avant affichage. */
const safe = (h: string) => ({ __html: DOMPurify.sanitize(h, { ADD_ATTR: ['target'] }) });

function QuizBlock({ quiz }: { quiz: Quiz[] }) {
  const [ans, setAns] = useState<Record<number, number>>({});
  const done = Object.keys(ans).length;
  const ok = quiz.filter((q, i) => ans[i] === q.c).length;
  return (
    <div className="quiz">
      <h3>QCM · {quiz.length} questions</h3>
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
  const { data, error } = useData<Part[]>('academy');
  if (error) return <p className="page err">Données indisponibles : {error}</p>;
  if (!data) return <p className="page">Chargement…</p>;
  const P = data.find((p) => p.id === part);
  const M = P?.mods.find((m) => m.id === mod);
  if (P && M) {
    const i = P.mods.indexOf(M), prev = P.mods[i - 1], next = P.mods[i + 1];
    return (
      <article className="page course">
        <p className="crumb"><a href="#/cours">Cours</a> › <a href={'#/cours/' + P.id}>{P.n}</a></p>
        <h1>{M.t}</h1>
        <div className="body" dangerouslySetInnerHTML={safe(M.h)} />
        {M.quiz && M.quiz.length > 0 && <QuizBlock key={M.id} quiz={M.quiz} />}
        <nav className="pager" aria-label="Modules">
          {prev ? <a href={`#/cours/${P.id}/${prev.id}`}>← {prev.t}</a> : <span />}
          {next ? <a href={`#/cours/${P.id}/${next.id}`}>{next.t} →</a> : <span />}
        </nav>
      </article>
    );
  }
  return (
    <section className="page">
      <h1>Cours</h1>
      <p className="lead">Les cours de l'Académie du simulateur, repris tels quels. Le téléchargement PDF arrive avec le serveur Symfony.</p>
      {data.filter((p) => !P || p === P).map((p) => (
        <div key={p.id}>
          <h2><a href={'#/cours/' + p.id}>{p.n}</a></h2>
          <p className="sub" dangerouslySetInnerHTML={safe(p.d)} />
          <ol className="mods">
            {p.mods.map((m) => (
              <li key={m.id}>
                <a href={`#/cours/${p.id}/${m.id}`}>{m.t}</a>
                {m.quiz?.length ? <small> · QCM {m.quiz.length}</small> : null}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </section>
  );
}
