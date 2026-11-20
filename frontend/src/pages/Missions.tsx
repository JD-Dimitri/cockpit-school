import { useData, type Mission, type Airport } from '../data';
import { gcKm } from '../engine';

const GROUPS: [string, (k: string, m: Mission) => boolean][] = [
  ['Parcours complets', (k, m) => !!m.full || k.startsWith('full')],
  ['Scénarios', (k) => k.startsWith('sc-')],
  ['Vols de ligne et vols libres', () => true],
];

export function Missions() {
  const { data, error } = useData<Record<string, Mission>>('missions');
  const { data: apts } = useData<Record<string, Airport>>('airports');
  if (error) return <p className="page err">Données indisponibles : {error}</p>;
  if (!data) return <p className="page">Chargement…</p>;
  const used = new Set<string>();
  return (
    <section className="page">
      <h1>Missions</h1>
      <p className="lead">Pour commencer une mission, choisissez l'appareil dans le <a href="#/simulateur">Simulateur</a> (ou la page <a href="#/parcours">Parcours</a>) : choix de l'appareil, fiche de présentation, puis validation. Elles restent aussi accessibles depuis le <a href="#/simulateur">Simulateur</a>.</p>
      {GROUPS.map(([title, test]) => {
        const list = Object.entries(data).filter(([k, m]) => !used.has(k) && test(k, m));
        list.forEach(([k]) => used.add(k));
        return (
          <div key={title}>
            <h2>{title}</h2>
            <div className="grid">
              {list.map(([k, m]) => {
                const D = m.dest && apts?.[m.dest];
                const km = D && m.start ? Math.round(gcKm(m.start.lat, m.start.lon, D.lat, D.lon)) : null;
                return (
                  <div key={k} className={'card' + (m.soon ? ' off' : '')}>
                    <small>{m.soon ? 'À venir' : k}</small>
                    <b>{m.n}</b>
                    <span>{m.d}</span>
                    {km != null && km > 20 && <small>Orthodromie départ → {m.dest} : {km.toLocaleString('fr-FR')} km [CALCULÉ]</small>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}
