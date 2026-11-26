/**
 * Accueil public (hors connexion) : présentation courte, sans simulateur ni contenu de cours.
 * Le simulateur et toutes les fonctions ne s'ouvrent qu'après connexion (F41).
 */
import { dirOf, useLang, type Key } from '../i18n';

const POINTS = ['p1', 'p2', 'p3', 'p4'];

export function Welcome() {
  const [lang, t] = useLang();
  return (
    <section className="page welcome" dir={dirOf(lang)}>
      <h1>{t('wel.h1')}</h1>
      <p className="lead">{t('wel.lead')}</p>
      <div className="cta">
        <a className="btn" href="#/inscription">{t('wel.signup')}</a>
        <a className="btn ghost" href="#/connexion">{t('wel.login')}</a>
      </div>
      <ul className="points">
        {POINTS.map((p) => (
          <li key={p}><b>{t(('wel.' + p + 't') as Key)}</b><span>{t(('wel.' + p + 'd') as Key)}</span></li>
        ))}
      </ul>
    </section>
  );
}
