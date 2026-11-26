import { useData, type DataIndex } from '../data';
import { dirOf, LOCALE, useLang, type Key } from '../i18n';

const CARDS = [
  { href: '#/simulateur', k: 'card.sim' },
  { href: '#/cours', k: 'card.cours' },
  // « Appareils » et « Missions » retirés de l'accueil (demande de l'auteur, 19/11 22:01), comme du menu (C4, C6) :
  // le choix de l'appareil et de la mission se fait dans Parcours et dans le simulateur. Pages gardées par leur adresse.
  { href: '#/aeroports', k: 'card.apt' },
];

export function Home() {
  const { data: idx } = useData<DataIndex>('index');
  const [lang, t] = useLang();
  return (
    <section className="page" dir={dirOf(lang)}>
      <h1>{t('home.h1')}</h1>
      <p className="lead">{t('home.lead')}</p>
      <div className="grid">
        {CARDS.map((c) => (
          <a key={c.href} className="card" href={c.href}>
            <b>{t((c.k + '.t') as Key)}</b>
            <span>{t((c.k + '.d') as Key)}</span>
          </a>
        ))}
      </div>
      {idx && (
        <p className="meta">
          {t('home.meta', { d: new Date(idx.extracted).toLocaleDateString(LOCALE[lang]), e: idx.engine })}
        </p>
      )}
    </section>
  );
}
