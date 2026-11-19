import { useEffect, useState } from 'react';
import { Home } from './pages/Home';
import { Simulator } from './pages/Simulator';
import { AircraftPage } from './pages/Aircraft';
import { Airports } from './pages/Airports';
import { Missions } from './pages/Missions';
import { Courses } from './pages/Courses';

const ROUTES = [
  { path: '', label: 'Accueil', el: () => <Home /> },
  { path: 'simulateur', label: 'Simulateur', el: () => <Simulator /> },
  { path: 'cours', label: 'Cours', el: (p: string[]) => <Courses part={p[0]} mod={p[1]} /> },
  { path: 'appareils', label: 'Appareils', el: (p: string[]) => <AircraftPage id={p[0]} /> },
  { path: 'missions', label: 'Missions', el: () => <Missions /> },
  { path: 'aeroports', label: 'Aéroports', el: () => <Airports /> },
] as const;

/** Routage par ancre (#/cours/p1/avion) : fonctionne sans configuration serveur. */
function useRoute(): string[] {
  const read = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const [r, setR] = useState(read);
  useEffect(() => {
    const on = () => {
      setR(read());
      window.scrollTo(0, 0);
    };
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  return r;
}

export function App() {
  const [head = '', ...rest] = useRoute();
  const route = ROUTES.find((x) => x.path === head) ?? ROUTES[0];
  const full = route.path === 'simulateur';
  return (
    <div className={full ? 'shell full' : 'shell'}>
      <header className="top">
        <a className="brand" href="#/">
          <span className="mark" aria-hidden="true">✈</span>
          <span>PLANE TRAJECTORIES <em>Pro</em></span>
        </a>
        <nav aria-label="Navigation principale">
          {ROUTES.slice(1).map((x) => (
            <a key={x.path} href={'#/' + x.path} aria-current={x.path === route.path ? 'page' : undefined}>
              {x.label}
            </a>
          ))}
        </nav>
      </header>
      <main id="contenu">{route.el(rest)}</main>
      {!full && (
        <footer className="foot">
          Simulateur pédagogique : ne pas utiliser pour la navigation réelle. Données : statuts [RÉFÉRENCÉ] / [ESTIMÉ] / [SIMULÉ]
          affichés là où elles servent.
        </footer>
      )}
    </div>
  );
}
