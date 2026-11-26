/**
 * Accueil public (hors connexion) : présentation courte, sans simulateur ni contenu de cours.
 * Le simulateur et toutes les fonctions ne s'ouvrent qu'après connexion (F41).
 */
const POINTS: [string, string][] = [
  ['Des parcours de pilote complets', 'De la visite prévol à l\'arrêt des moteurs, sur avions de ligne, avion d\'affaires, avion école et hélicoptères.'],
  ['Une école théorique', 'Des cours du premier pas jusqu\'au métier de pilote de ligne, avec exercices corrigés, téléchargeables en PDF.'],
  ['Un simulateur de vol 3D', 'Poste de pilotage, contrôle aérien, météo, pannes et examens, dans le navigateur.'],
  ['Des données sourcées', 'Chaque valeur porte son statut : référencée, calculée, estimée ou simulée.'],
];

export function Welcome() {
  return (
    <section className="page welcome">
      <h1>Apprendre à piloter, du premier cours au métier de pilote</h1>
      <p className="lead">
        COCKPIT SCHOOL - PLANE SIMULATOR est une école de pilotage en ligne : cours, parcours guidés et simulateur de vol.
        Créez votre compte pour y accéder.
      </p>
      <div className="cta">
        <a className="btn" href="#/inscription">Créer un compte</a>
        <a className="btn ghost" href="#/connexion">Se connecter</a>
      </div>
      <ul className="points">
        {POINTS.map(([t, d]) => (
          <li key={t}><b>{t}</b><span>{d}</span></li>
        ))}
      </ul>
    </section>
  );
}
