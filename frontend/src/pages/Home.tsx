import { useData, type DataIndex } from '../data';

const CARDS = [
  { href: '#/simulateur', t: 'Simulateur', d: 'Le simulateur complet : 8 appareils, parcours guidés, contrôle aérien, pannes, examens.' },
  { href: '#/cours', t: 'Cours', d: "L'Académie : du premier cours au métier de pilote de ligne, avec QCM corrigés." },
  { href: '#/appareils', t: 'Appareils', d: 'Les avions et hélicoptères du simulateur, en 3D, avec leurs données.' },
  { href: '#/missions', t: 'Missions', d: 'Vols libres, parcours complets et scénarios tirés de cas réels.' },
  { href: '#/aeroports', t: 'Aéroports', d: 'Aéroports et pistes utilisés, avec leurs coordonnées.' },
];

export function Home() {
  const { data: idx } = useData<DataIndex>('index');
  return (
    <section className="page">
      <h1>De zéro à la licence de pilote, et au-delà</h1>
      <p className="lead">
        Version Pro en construction : interface React, 3D Three.js, et bientôt les comptes élèves (Symfony). Le simulateur
        d'origine fonctionne déjà ici, sans perte, pendant que ses modules sont portés un par un.
      </p>
      <div className="grid">
        {CARDS.map((c) => (
          <a key={c.href} className="card" href={c.href}>
            <b>{c.t}</b>
            <span>{c.d}</span>
          </a>
        ))}
      </div>
      {idx && (
        <p className="meta">
          Données extraites le {new Date(idx.extracted).toLocaleDateString('fr-FR')} du moteur {idx.engine}.
        </p>
      )}
    </section>
  );
}
