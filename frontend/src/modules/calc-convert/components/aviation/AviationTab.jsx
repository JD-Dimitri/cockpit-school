import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft } from '../../icons.js';
import { cx } from '../../lib/cx.js';
import { AIRCRAFT_LONG, AIRCRAFT_TAG, FORMULAS, FORMULA_BY_ID, GROUPS, PHASES } from '../../lib/aviation/index.js';
import FormulaCard from './FormulaCard.jsx';
import { Example, Exercise, Specifics } from './parts.jsx';

const normalize = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Fait défiler le conteneur du widget (et lui seul) jusqu'à l'élément demandé */
function scrollToId(id) {
  const el = document.getElementById(id);
  const box = el?.closest('.cc-content');
  if (!el || !box) return;
  const top = el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - 6;
  box.scrollTo({ top, behavior: 'smooth' });
}

/**
 * Onglet Aviation.
 * Une seule liste pour tous les aéronefs (avions et hélicoptères) : chaque formule porte son étiquette
 * et ses particularités avion / hélicoptère.
 * variant "cours"      : formules + mini-cours + annexes (cours complet, 10 exercices corrigés) + étapes avec exemples et exercices.
 * variant "simulateur" : formules et calculateurs uniquement, pour un usage en vol simulé.
 */
export default function AviationTab({ variant = 'cours' }) {
  const isCourse = variant !== 'simulateur';
  const [view, setView] = useState('formules');
  const [query, setQuery] = useState('');
  const [phaseId, setPhaseId] = useState(null);
  const [openCards, setOpenCards] = useState(() => new Set());
  const [openAnnexes, setOpenAnnexes] = useState(() => new Set());
  const [pendingScroll, setPendingScroll] = useState(null);
  const rootRef = useRef(null);

  // Défilement après le rendu (la cible peut ne pas exister avant)
  useEffect(() => {
    if (!pendingScroll) return;
    const id = requestAnimationFrame(() => {
      scrollToId(pendingScroll);
      setPendingScroll(null);
    });
    return () => cancelAnimationFrame(id);
  }, [pendingScroll]);

  const toggle = (setter) => (id) =>
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleCard = toggle(setOpenCards);
  const toggleAnnex = toggle(setOpenAnnexes);

  const deepen = (id) => {
    setView('formules');
    setPhaseId(null);
    setOpenAnnexes((prev) => new Set(prev).add(id));
    setPendingScroll(`cc-av-annexe-${id}`);
  };

  const backToFormula = (id) => {
    setOpenCards((prev) => new Set(prev).add(id));
    setPendingScroll(`cc-av-f-${id}`);
  };

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    return FORMULAS.filter(
      (f) => !q || normalize(`${f.title} ${f.formula} ${f.mini}`).includes(q),
    );
  }, [query]);

  const phase = PHASES.find((p) => p.id === phaseId);

  const goTop = () => {
    const box = rootRef.current?.closest('.cc-content');
    box?.scrollTo({ top: 0 });
  };

  // ---------- Page d'une étape ----------
  if (phase) {
    let exampleNo = 0;
    return (
      <section ref={rootRef} className={cx('av')}>
        <div className={cx('panel-head')}>
          <button type="button" className={cx('icon-btn')} onClick={() => { setPhaseId(null); goTop(); }} aria-label="Retour aux étapes">
            <ArrowLeft size={13} />
          </button>
          <h2>{phase.title}</h2>
        </div>
        {isCourse && <p className={cx('av-intro')}>{phase.intro}</p>}
        {isCourse && <Specifics item={phase} sameText="Calculs identiques pour les avions et les hélicoptères." />}

        <h3 className={cx('av-h3')}>Calculs de l’étape</h3>
        <div className={cx('av-list')}>
          {phase.formulas
            .map((id) => FORMULA_BY_ID[id])
            .map((f) => (
              <FormulaCard
                key={f.id}
                formula={f}
                anchorPrefix={`p-${phase.id}`}
                open={openCards.has(f.id)}
                onToggle={() => toggleCard(f.id)}
                onDeepen={deepen}
                isCourse={isCourse}
              />
            ))}
        </div>

        {isCourse && (
          <>
            <h3 className={cx('av-h3')}>5 exemples résolus</h3>
            <ol className={cx('av-examples')}>
              {phase.examples.map((ex, i) => {
                exampleNo += 1;
                return <Example key={i} n={exampleNo} formula={FORMULA_BY_ID[ex.f]} v={ex.v} scenario={ex.s} />;
              })}
            </ol>

            <h3 className={cx('av-h3')}>Exercices de l’étape</h3>
            <ol className={cx('av-exercises')}>
              {phase.exercises.map((ex, i) => (
                <Exercise key={i} n={i + 1} formula={FORMULA_BY_ID[ex.f]} v={ex.v} scenario={ex.s} />
              ))}
            </ol>
          </>
        )}
      </section>
    );
  }

  // ---------- Liste des formules ou des étapes ----------
  return (
    <section ref={rootRef} className={cx('av')}>
      <div className={cx('segmented')} role="tablist">
        {[
          { value: 'formules', label: 'Formules' },
          { value: 'etapes', label: 'Étapes du vol' },
        ].map((o) => (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={view === o.value}
            className={cx(view === o.value ? 'active' : '')}
            onClick={() => setView(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>

      <p className={cx('av-scope')}>
        <strong>Aéronefs (avions, hélicoptères)</strong> · chaque formule indique si elle concerne tous les aéronefs, les
        avions ou les hélicoptères, et précise les particularités de chacun quand le calcul ou son usage diffère.
      </p>

      {isCourse && (
        <p className={cx('av-disclaimer')}>
          Outil pédagogique : il ne remplace ni le manuel de vol de l’appareil, ni la documentation officielle, ni l’instruction.
        </p>
      )}

      {view === 'etapes' ? (
        <div className={cx('av-phases')}>
          {PHASES.map((p, i) => (
            <button key={p.id} type="button" className={cx('av-phase')} onClick={() => { setPhaseId(p.id); goTop(); }}>
              <span className={cx('av-phase-no')}>{i + 1}</span>
              <span className={cx('av-phase-text')}>
                <strong>
                  {p.title} <span className={cx(`av-tag ${p.aircraft}`)} title={AIRCRAFT_LONG[p.aircraft]}>{AIRCRAFT_TAG[p.aircraft]}</span>
                </strong>
                {isCourse && <small>{p.intro}</small>}
                <small className={cx('muted')}>
                  {p.formulas.length} calculs{isCourse ? ` · 5 exemples · ${p.exercises.length} exercices` : ''}
                </small>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <>
          <input
            className={cx('av-search')}
            type="search"
            placeholder="Rechercher une formule (vent, carburant, virage…)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Rechercher une formule"
          />
          {GROUPS.map((g) => {
            const items = visible.filter((f) => f.group === g.id);
            if (!items.length) return null;
            return (
              <div key={g.id} className={cx('av-group')}>
                <h3 className={cx('av-h3')}>{g.label}</h3>
                <div className={cx('av-list')}>
                  {items.map((f) => (
                    <FormulaCard
                      key={f.id}
                      formula={f}
                      open={openCards.has(f.id)}
                      onToggle={() => toggleCard(f.id)}
                      onDeepen={deepen}
                      isCourse={isCourse}
                          />
                  ))}
                </div>
              </div>
            );
          })}
          {!visible.length && <p className={cx('muted small')}>Aucune formule ne correspond.</p>}

          {isCourse && (
            <section className={cx('av-annexes')} aria-label="Annexes">
              <h3 className={cx('av-h3 av-annex-title')}>Annexes : cours complets et exercices corrigés</h3>
              {FORMULAS.map((f, i) => {
                const open = openAnnexes.has(f.id);
                return (
                  <article key={f.id} id={`cc-av-annexe-${f.id}`} className={cx(`av-annex ${open ? 'open' : ''}`)}>
                    <button type="button" className={cx('av-card-head')} onClick={() => toggleAnnex(f.id)} aria-expanded={open}>
                      <span className={cx('av-card-title')}>Annexe {i + 1} · {f.title}</span>
                      <span className={cx('av-chevron')} aria-hidden="true">{open ? '−' : '+'}</span>
                    </button>
                    {open && (
                      <div className={cx('av-card-body')}>
                        <pre className={cx('av-formula')}>{f.formula}</pre>
                        <h4 className={cx('av-h4')}>Cours</h4>
                        {f.course.map((p, j) => (
                          <p key={j} className={cx('av-p')}>{p}</p>
                        ))}
                        <h4 className={cx('av-h4')}>Avion ou hélicoptère</h4>
                        <p className={cx('av-p')}>S’applique à : {AIRCRAFT_LONG[f.aircraft].toLowerCase()}.</p>
                        <Specifics item={f} />
                        <h4 className={cx('av-h4')}>10 exercices corrigés</h4>
                        <ol className={cx('av-exercises')}>
                          {f.ex.map((v, j) => (
                            <Exercise key={j} n={j + 1} formula={f} v={v} />
                          ))}
                        </ol>
                        <button type="button" className={cx('av-link')} onClick={() => backToFormula(f.id)}>
                          ↑ Retour à la formule et au calculateur
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </section>
          )}
        </>
      )}
    </section>
  );
}
