import { useData, type Aircraft } from '../data';
import { AircraftViewer } from '../three/AircraftViewer';
import { takeoffBench, type FixedWing } from '../engine';

const n = (v: number | undefined, unit: string, d = 0) =>
  v == null ? '—' : v.toLocaleString('fr-FR', { maximumFractionDigits: d }) + ' ' + unit;

export function AircraftPage({ id }: { id?: string }) {
  const { data, error } = useData<Record<string, Aircraft>>('aircraft');
  if (error) return <p className="page err">Données indisponibles : {error}</p>;
  if (!data) return <p className="page">Chargement…</p>;
  const keys = Object.keys(data);
  const k = id && data[id] ? id : keys[0];
  const ac = data[k];
  const rows: [string, string][] =
    ac.kind === 'fw'
      ? [
          ['Masse de référence du moteur', n(ac.m / 1000, 't', 1)],
          ['Surface alaire', n(ac.S, 'm²', 1)],
          ['Poussée maximale (total)', n(ac.Tmax && ac.Tmax / 1000, 'kN')],
          ['VR / V2', `${n(ac.Vr, 'kt')} / ${n(ac.V2, 'kt')}`],
          ['VMO / MMO', `${n(ac.Vmo, 'kt')} / ${ac.Mmo ?? '—'}`],
          ['Plafond', n(ac.ceil, 'ft')],
          ['Autonomie', n(ac.range, 'km')],
          ['Crans de volets', (ac.flaps ?? []).map((f) => f.n).join(' · ') || '—'],
          ['Longueur / envergure', `${n(ac.ext.len, 'm', 1)} / ${n(ac.ext.span, 'm', 2)}`],
        ]
      : [
          ['Masse de référence du moteur', n(ac.m, 'kg')],
          ['VNE', n(ac.Vne, 'kt')],
          ['Motorisation', ac.twin ? 'biturbine' : 'monomoteur'],
          ['Longueur / rotor', `${n(ac.ext.len, 'm', 1)} / ${n(ac.ext.rotor, 'm', 1)}`],
        ];
  // Banc d'essai : décollage calculé par la physique portée (identique au moteur d'origine, tests/parity_flight.py)
  const tko = ac.kind === 'fw' ? takeoffBench({ ...(ac as unknown as FixedWing), fixedGear: k === 'c172' }) : null;
  return (
    <section className="page">
      <h1>Appareils</h1>
      <div className="tabs" role="tablist" aria-label="Choisir un appareil">
        {keys.map((x) => (
          <a key={x} role="tab" aria-selected={x === k} href={'#/appareils/' + x}>
            {data[x].name.replace(/\s*\(.*\)/, '')}
          </a>
        ))}
      </div>
      <div className="ac">
        <AircraftViewer ac={ac} />
        <div>
          <h2>{ac.name}</h2>
          <p className="sub">{ac.sub}</p>
          <table className="kv">
            <tbody>
              {rows.map(([a, b]) => (
                <tr key={a}>
                  <th scope="row">{a}</th>
                  <td>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {tko && (
            <div className="bench">
              <h3>Décollage calculé par le modèle de vol</h3>
              <table className="kv">
                <tbody>
                  <tr><th scope="row">VR atteinte</th><td>{tko.vr ? `${n(tko.vr.d, 'm')} · ${n(tko.vr.t, 's', 1)}` : '—'}</td></tr>
                  <tr><th scope="row">Décollage des roues</th><td>{tko.liftoff ? `${n(tko.liftoff.d, 'm')} · ${n(tko.liftoff.t, 's', 1)} · ${n(tko.liftoff.kt, 'kt')}` : '—'}</td></tr>
                  <tr><th scope="row">Passage des 35 ft</th><td>{tko.screen ? `${n(tko.screen.d, 'm')} · ${n(tko.screen.t, 's', 1)} · ${n(tko.screen.kt, 'kt')}` : '—'}</td></tr>
                </tbody>
              </table>
              <p className="note">
                [CALCULÉ] par la physique du simulateur : niveau de la mer, atmosphère type, sans vent, masse de référence,
                volets 1, pleine poussée, rotation à VR. Ce ne sont pas des performances du constructeur : pour un vrai
                décollage, seul le manuel de vol de l'appareil fait foi.
              </p>
            </div>
          )}
          <p className="note">
            Valeurs du moteur de simulation (réglages de vol, pas des données constructeur certifiées) ; leur statut détaillé
            reste celui affiché dans le simulateur. Silhouette 3D : [SIMULÉ], à l'échelle des dimensions ci-dessus.
          </p>
        </div>
      </div>
    </section>
  );
}
