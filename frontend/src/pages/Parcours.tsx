/**
 * Parcours (F40) : choisir un parcours → choisir l'appareil (fiches avec vignette) → fiche de présentation de l'appareil
 * → « Valider le parcours avec cet appareil » → « Parcours commencé » → simulateur, avec la même suite qu'aujourd'hui.
 * #/parcours · #/parcours/<parcours> · #/parcours/<parcours>/<appareil>
 */
import { useEffect, useState } from 'react';
import { useData, type Aircraft, type Mission, type Airport } from '../data';
import { gcKm, takeoffBench, type FixedWing } from '../engine';
import { AIRCRAFT_IMAGES, IMAGE_CREDIT } from '../aircraftImages';
import { parcoursList, launchAction, MODES, type Mode, type Parcours as P } from '../parcours';

const num = (v: number | undefined, unit: string, d = 0) => (v == null ? '—' : v.toLocaleString('fr-FR', { maximumFractionDigits: d }) + ' ' + unit);
const short = (name: string) => name.replace(/\s*\(.*\)/, '');

function Logo({ k, ac, size = 'sm' }: { k: string; ac: Aircraft; size?: 'sm' | 'lg' }) {
  const src = AIRCRAFT_IMAGES[k];
  return (
    <span className={'aclogo ' + size}>
      {src ? <img src={src} alt={size === 'lg' ? `${ac.name} (${IMAGE_CREDIT.toLowerCase()})` : ''} /> : <span aria-hidden="true">{ac.kind === 'fw' ? '✈' : '🚁'}</span>}
    </span>
  );
}

export function Parcours({ mi, ac: acKey }: { mi?: string; ac?: string }) {
  const { data: missions, error } = useData<Record<string, Mission>>('missions');
  const { data: aircraft } = useData<Record<string, Aircraft>>('aircraft');
  const { data: apts } = useData<Record<string, Airport>>('airports');
  if (error) return <p className="page err">Données indisponibles : {error}</p>;
  if (!missions || !aircraft) return <p className="page">Chargement…</p>;
  const list = parcoursList(missions, aircraft);
  const p = mi ? list.find((x) => x.key === mi) : undefined;
  if (mi && !p) return <section className="page"><h1>Parcours introuvable</h1><p><a href="#/parcours">← Tous les parcours</a></p></section>;
  if (p && acKey && p.aircraft.includes(acKey)) return <Sheet p={p} k={acKey} ac={aircraft[acKey]} apts={apts} />;
  if (p) return <Choose p={p} aircraft={aircraft} apts={apts} />;
  return <All list={list} aircraft={aircraft} />;
}

/** Liste des parcours, chacun avec les vignettes de ses appareils. */
function All({ list, aircraft }: { list: P[]; aircraft: Record<string, Aircraft> }) {
  const groups: [string, P[]][] = [
    ['Parcours pilote complets', list.filter((x) => x.tag === 'Parcours pilote complet')],
    ['Scénarios', list.filter((x) => x.tag === 'Scénario')],
    ['Vols libres', list.filter((x) => x.tag === 'Vol libre')],
  ];
  return (
    <section className="page parcours">
      <h1>Parcours</h1>
      <p className="lead">Choisissez un parcours, puis l'appareil : sa fiche vous le présente avant de commencer.</p>
      {groups.map(([title, l]) => l.length > 0 && (
        <div key={title}>
          <h2>{title}</h2>
          <div className="grid">
            {l.map((x) => (
              <a key={x.key} className="card pcard" href={'#/parcours/' + x.key}>
                <small>{x.tag}</small>
                <b>{x.mission.n}</b>
                <span>{x.mission.d}</span>
                <span className="logos" aria-label={'Appareils : ' + x.aircraft.map((k) => short(aircraft[k].name)).join(', ')}>
                  {x.aircraft.map((k) => <Logo key={k} k={k} ac={aircraft[k]} />)}
                </span>
              </a>
            ))}
          </div>
        </div>
      ))}
      <p className="note">Vignettes : {IMAGE_CREDIT.toLowerCase()}.</p>
    </section>
  );
}

function Route({ m, apts }: { m: Mission; apts?: Record<string, Airport> | null }) {
  const D = m.dest && apts?.[m.dest];
  const km = D && m.start ? Math.round(gcKm(m.start.lat, m.start.lon, D.lat, D.lon)) : null;
  return km != null && km > 20 ? <small className="route">Départ → {m.dest} : {km.toLocaleString('fr-FR')} km en orthodromie [CALCULÉ]</small> : null;
}

/** Fiches de choix de l'appareil pour un parcours. */
function Choose({ p, aircraft, apts }: { p: P; aircraft: Record<string, Aircraft>; apts?: Record<string, Airport> | null }) {
  return (
    <section className="page parcours">
      <p className="crumb"><a href="#/parcours">← Tous les parcours</a></p>
      <small className="tag">{p.tag}</small>
      <h1>{p.mission.n}</h1>
      <p className="lead">{p.mission.d}</p>
      <Route m={p.mission} apts={apts} />
      <h2>{p.aircraft.length > 1 ? 'Choisissez l\'appareil' : 'Appareil de ce parcours'}</h2>
      <div className="acgrid">
        {p.aircraft.map((k) => (
          <a key={k} className="card accard" href={`#/parcours/${p.key}/${k}`} data-ac={k}>
            <Logo k={k} ac={aircraft[k]} />
            <span className="txt">
              <small>{aircraft[k].kind === 'fw' ? 'Avion' : 'Hélicoptère'}</small>
              <b>{aircraft[k].name}</b>
              <span>{aircraft[k].sub}</span>
            </span>
            <span className="go" aria-hidden="true">Voir la fiche ▸</span>
          </a>
        ))}
      </div>
    </section>
  );
}

/** Fiche de présentation de l'appareil pour ce parcours, puis validation. */
function Sheet({ p, k, ac, apts }: { p: P; k: string; ac: Aircraft; apts?: Record<string, Airport> | null }) {
  const [mode, setMode] = useState<Mode>('guide');
  const [started, setStarted] = useState(false);
  const action = launchAction(k, p.key, mode);
  useEffect(() => {
    if (!started) return;
    const id = setTimeout(() => { location.hash = '#/simulateur/' + action; }, 1600);
    return () => clearTimeout(id);
  }, [started]);
  const rows: [string, string][] =
    ac.kind === 'fw'
      ? [
          ['Type', 'Avion' + (ac.sep ? ' école' : '')],
          ['Masse de référence', num(ac.m / 1000, 't', 1)],
          ['Poussée maximale (total)', num(ac.Tmax && ac.Tmax / 1000, 'kN')],
          ['VR / V2', `${num(ac.Vr, 'kt')} / ${num(ac.V2, 'kt')}`],
          ['VMO / MMO', `${num(ac.Vmo, 'kt')} / ${ac.Mmo ?? '—'}`],
          ['Plafond', num(ac.ceil, 'ft')],
          ['Longueur / envergure', `${num(ac.ext.len, 'm', 1)} / ${num(ac.ext.span, 'm', 2)}`],
        ]
      : [
          ['Type', 'Hélicoptère ' + (ac.twin ? 'biturbine' : 'monomoteur')],
          ['Masse de référence', num(ac.m, 'kg')],
          ['VNE', num(ac.Vne, 'kt')],
          ['Longueur / rotor', `${num(ac.ext.len, 'm', 1)} / ${num(ac.ext.rotor, 'm', 1)}`],
        ];
  const tko = ac.kind === 'fw' ? takeoffBench({ ...(ac as unknown as FixedWing), fixedGear: k === 'c172' }) : null;
  if (started)
    return (
      <section className="page parcours started" role="status" aria-live="polite">
        <Logo k={k} ac={ac} size="lg" />
        <h1>Parcours commencé</h1>
        <p className="lead"><b>{p.mission.n}</b><br />avec le <b>{ac.name}</b>{p.full ? ` · mode ${MODES.find((x) => x[0] === mode)![1].toLowerCase()}` : ''}</p>
        <p>Ouverture du simulateur…</p>
        <a className="btn" href={'#/simulateur/' + action}>Aller au simulateur ▸</a>
      </section>
    );
  return (
    <section className="page parcours">
      <p className="crumb"><a href="#/parcours">← Tous les parcours</a> · <a href={'#/parcours/' + p.key}>{p.aircraft.length > 1 ? 'Changer d\'appareil' : 'Retour au parcours'}</a></p>
      <small className="tag">{p.mission.n.startsWith(p.tag) ? p.mission.n : `${p.tag} · ${p.mission.n}`}</small>
      <div className="sheet">
        <figure>
          <Logo k={k} ac={ac} size="lg" />
          <figcaption>{IMAGE_CREDIT}</figcaption>
        </figure>
        <div>
          <h1>{ac.name}</h1>
          <p className="sub">{ac.sub}</p>
          <table className="kv"><tbody>{rows.map(([a, b]) => <tr key={a}><th scope="row">{a}</th><td>{b}</td></tr>)}</tbody></table>
          {tko?.screen && (
            <p className="note">Décollage calculé par le modèle de vol (niveau de la mer, sans vent, masse de référence) : 35 ft passés à{' '}
              {num(tko.screen.d, 'm')} [CALCULÉ], pas une performance constructeur.</p>
          )}
          <h2>Ce parcours avec cet appareil</h2>
          <p>{p.mission.d}</p>
          <Route m={p.mission} apts={apts} />
          {p.full && (
            <fieldset className="modes">
              <legend>Mode</legend>
              {MODES.map(([id, label, d]) => (
                <label key={id} className={mode === id ? 'on' : ''}>
                  <input type="radio" name="mode" value={id} checked={mode === id} onChange={() => setMode(id)} />
                  <span><b>{label}</b><small>{d}</small></span>
                </label>
              ))}
            </fieldset>
          )}
          <button type="button" className="btn validate" onClick={() => setStarted(true)}>✔ Valider le parcours avec cet appareil</button>
          <p className="note">Vous retrouverez ensuite le dossier de vol puis le parcours, comme aujourd'hui. Données de l'appareil : réglages du simulateur, pas des données constructeur certifiées.</p>
        </div>
      </div>
    </section>
  );
}
