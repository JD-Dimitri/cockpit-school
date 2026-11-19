import { useData, type Airport } from '../data';
import { brg, gcKm } from '../engine';

export function Airports() {
  const { data, error } = useData<Record<string, Airport>>('airports');
  if (error) return <p className="page err">Données indisponibles : {error}</p>;
  if (!data) return <p className="page">Chargement…</p>;
  return (
    <section className="page">
      <h1>Aéroports et pistes</h1>
      <p className="lead">
        Longueur et orientation calculées à partir des extrémités de piste du simulateur (orientation vraie, pas magnétique).
        Ne pas utiliser pour la navigation réelle.
      </p>
      <div className="tbl">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Nom</th>
              <th>Altitude</th>
              <th>Pistes (longueur · orientation vraie)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data).map(([k, a]) => (
              <tr key={k}>
                <td><b>{k}</b></td>
                <td>{a.n}</td>
                <td>{Math.round(a.elev)} ft</td>
                <td>
                  {(a.rw ?? []).map((r) => (
                    <div key={r[0]}>
                      {r[0]}/{r[1]} · {Math.round(gcKm(r[2], r[3], r[4], r[5]) * 1000).toLocaleString('fr-FR')} m ·{' '}
                      {Math.round(brg(r[2], r[3], r[4], r[5]))}°
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
