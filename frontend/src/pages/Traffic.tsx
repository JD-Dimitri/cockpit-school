/**
 * Trafic réel autour des aéroports du projet (#/trafic) : sources, état de chacune, appareils observés.
 * Page d'accueil des futures sources (récepteur Raspberry Pi, OpenSky, Flightradar24) ; aucune n'est active par défaut.
 */
import { useEffect, useState } from 'react';
import { useData } from '../data';
import { gcKm } from '../engine';
import { fetchTraffic, zoneAround, SOURCE_LABEL, type SourceName, type TrafficResult } from '../traffic';

interface Airport { n: string; lat: number; lon: number; heli?: boolean }
const n0 = (v: number | null, d = 0) => (v == null ? '—' : v.toLocaleString('fr-FR', { maximumFractionDigits: d }));

export function Traffic({ apt }: { apt?: string }) {
  const { data } = useData<Record<string, Airport>>('airports');
  const [res, setRes] = useState<TrafficResult | null>(null);
  const keys = data ? Object.keys(data).filter((k) => !data[k].heli) : [];
  const k = apt && data?.[apt] ? apt : keys.includes('LFPG') ? 'LFPG' : keys[0];
  const a = k && data ? data[k] : null;

  useEffect(() => {
    if (!a) return;
    let alive = true;
    const load = () => fetchTraffic(zoneAround(a.lat, a.lon)).then((r) => alive && setRes(r));
    setRes(null);
    load();
    const id = setInterval(load, 5000);
    return () => { alive = false; clearInterval(id); };
  }, [k, !!a]);

  if (!data || !a) return <p className="page">Chargement…</p>;
  const list = res?.ok ? [...res.data.appareils].sort((x, y) => gcKm(a.lat, a.lon, x.lat, x.lon) - gcKm(a.lat, a.lon, y.lat, y.lon)) : [];
  return (
    <section className="page traffic">
      <h1>Trafic réel</h1>
      <p className="sub">Appareils réels observés autour des aéroports du projet [OBSERVÉ]. Mis à jour toutes les 5 secondes.</p>
      <div className="tabs" role="tablist" aria-label="Choisir un aéroport">
        {keys.map((x) => (
          <a key={x} role="tab" aria-selected={x === k} href={'#/trafic/' + x}>{x}</a>
        ))}
      </div>
      <h2>{a.n} <span className="meta">· zone ±1,5° de latitude, ±2° de longitude</span></h2>
      {!res && <p>Chargement…</p>}
      {res && !res.ok && <p className="notice" role="status">{res.message}</p>}
      {res?.ok && (
        <>
          <ul className="srcs" aria-label="Sources">
            {(Object.keys(SOURCE_LABEL) as SourceName[]).map((s) => {
              const st = res.data.sources[s];
              const cls = st?.etat === 'ok' ? 'ok' : st?.etat === 'erreur' ? 'err' : 'off';
              return (
                <li key={s} className={cls}>
                  <b>{SOURCE_LABEL[s]}</b> : {st ? (st.etat === 'ok' ? `${st.appareils} appareil(s)` : st.etat === 'erreur' ? 'erreur, ' + st.message : 'non configurée') : '—'}
                </li>
              );
            })}
          </ul>
          {list.length === 0 ? (
            <p className="note">Aucun appareil reçu dans cette zone pour l'instant.</p>
          ) : (
            <div className="scroll">
              <table className="tgrid">
                <thead>
                  <tr><th>Indicatif</th><th>Type</th><th>Altitude (ft)</th><th>Vitesse sol (kt)</th><th>Route (°)</th><th>V/S (ft/min)</th><th>Distance (km)</th><th>De → vers</th><th>Source</th></tr>
                </thead>
                <tbody>
                  {list.map((t) => (
                    <tr key={t.id}>
                      <td>{t.indicatif || t.id}</td>
                      <td>{[t.type, t.immat].filter(Boolean).join(' · ') || '—'}</td>
                      <td>{t.auSol ? 'au sol' : n0(t.altFt)}</td>
                      <td>{n0(t.solKt)}</td>
                      <td>{n0(t.route)}</td>
                      <td>{n0(t.vsFtMin)}</td>
                      <td>{n0(gcKm(a.lat, a.lon, t.lat, t.lon), 1)}</td>
                      <td>{t.depart || t.arrivee ? `${t.depart ?? '?'} → ${t.arrivee ?? '?'}` : '—'}</td>
                      <td>{SOURCE_LABEL[t.source]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      <p className="note">
        Sources possibles : récepteur ADS-B personnel (Raspberry Pi, voir tools/recepteur/README.md), OpenSky Network (usage non
        commercial), Flightradar24 (API payante). Aucune n'est active par défaut : leur choix et leur licence relèvent de l'auteur.
        Simulateur pédagogique : ces données ne servent jamais à la navigation réelle.
      </p>
    </section>
  );
}
