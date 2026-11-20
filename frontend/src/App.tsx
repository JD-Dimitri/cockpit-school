import { useEffect, useState, type JSX } from 'react';
import { Home } from './pages/Home';
import { Simulator } from './pages/Simulator';
import { AircraftPage } from './pages/Aircraft';
import { Airports } from './pages/Airports';
import { Missions } from './pages/Missions';
import { Courses } from './pages/Courses';
import { PrintCourse } from './pages/PrintCourse';
import { Login, Register, Forgot, Reset } from './pages/Account';
import { Traffic } from './pages/Traffic';
import { Parcours } from './pages/Parcours';
import { useUser, rememberNext } from './auth';
import { Welcome } from './pages/Welcome';
import { Admin } from './pages/Admin';

const ROUTES = [
  { path: '', label: 'Accueil', el: () => <Home /> },
  { path: 'parcours', label: 'Parcours', el: (p: string[]) => <Parcours mi={p[0]} ac={p[1]} /> },
  { path: 'simulateur', label: 'Simulateur', el: (p: string[]) => <Simulator action={p[0]} /> },
  { path: 'cours', label: 'Cours', el: (p: string[]) => <Courses part={p[0]} mod={p[1]} /> },
] as const;

/** Pages ouvertes sans compte (F41) : accueil public et pages du compte. Tout le reste demande une connexion. */
const PUBLIC = new Set(['', 'connexion', 'inscription', 'mot-de-passe-oublie', 'reinitialiser']);

/** Pages hors menu principal. */
const HIDDEN: Record<string, (p: string[]) => JSX.Element> = {
  connexion: () => <Login />,
  inscription: () => <Register />,
  'mot-de-passe-oublie': () => <Forgot />,
  reinitialiser: (p) => <Reset token={p[0]} />,
  trafic: (p) => <Traffic apt={p[0]} />,
  // Appareils : retiré du menu (demande de l'auteur, 19/11 18:31 : redondant avec Parcours et l'écran de départ du simulateur) ;
  // la page reste ouverte par son adresse pour les liens existants.
  appareils: (p) => <AircraftPage id={p[0]} />,
  // Missions et Aéroports : retirés du menu aussi (demande de l'auteur, 19/11 18:36) ; pages gardées par leur adresse.
  missions: () => <Missions />,
  aeroports: () => <Airports />,
  // Espace administrateur (20/11) : lien visible seulement pour un administrateur ; l'accès est contrôlé par le serveur.
  admin: () => <Admin />,
  imprimer: (p) => <PrintCourse part={p[0]} mod={p[1] === 'auto' ? undefined : p[1]} auto={p.includes('auto')} />,
};

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
  const user = useUser();
  const open = PUBLIC.has(head);
  const guest = user === null;
  // Page réservée demandée sans être connecté : on la retient, puis on passe par la connexion.
  useEffect(() => {
    if (guest && !open) {
      rememberNext(location.hash);
      location.replace('#/connexion');
    }
  }, [guest, open, head]);
  const hidden = HIDDEN[head];
  const route = ROUTES.find((x) => x.path === head) ?? ROUTES[0];
  const full = !!user && !hidden && route.path === 'simulateur';
  let body: JSX.Element;
  if (user === undefined) body = <p className="page">Chargement…</p>;
  else if (guest) body = head === '' ? <Welcome /> : open && hidden ? hidden(rest) : <p className="page">Connexion requise…</p>;
  else body = hidden ? hidden(rest) : route.el(rest);
  return (
    <div className={full ? 'shell full' : head === 'imprimer' ? 'shell printing' : 'shell'}>
      <header className="top">
        <a className="brand" href="#/">
          <span className="mark" aria-hidden="true">✈</span>
          <span>PLANE <em>SIMULATOR</em></span>
        </a>
        <nav aria-label="Navigation principale">
          {user
            ? ROUTES.slice(1).map((x) => (
                <a key={x.path} href={'#/' + x.path} aria-current={x.path === route.path && !hidden ? 'page' : undefined}>
                  {x.label}
                </a>
              ))
            : user === null && (
                <a href="#/inscription" aria-current={head === 'inscription' ? 'page' : undefined}>Créer un compte</a>
              )}
          {user?.admin && (
            <a href="#/admin" aria-current={head === 'admin' ? 'page' : undefined}>Admin</a>
          )}
          <a className="acct" href="#/connexion" aria-current={head === 'connexion' ? 'page' : undefined}>
            {user ? '● ' + (user.name || user.email) : 'Connexion'}
          </a>
        </nav>
      </header>
      {user?.demo && !full && (
        <p className="demo" role="note">Version de démonstration hors ligne (sans compte), réservée aux essais. En ligne, le simulateur et les cours s'ouvrent après connexion.</p>
      )}
      <main id="contenu">{body}</main>
      {!full && (
        <footer className="foot">
          Simulateur pédagogique : ne pas utiliser pour la navigation réelle. Données : statuts [RÉFÉRENCÉ] / [ESTIMÉ] / [SIMULÉ]
          affichés là où elles servent.
        </footer>
      )}
    </div>
  );
}
