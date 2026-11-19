/**
 * Banc d'essai du modèle de vol : décollage calculé avec la physique portée (flight.ts), hors de toute mission.
 * Conditions : niveau de la mer, atmosphère type, sans vent, masse de référence, volets du décollage (cran 1),
 * pleine poussée, rotation à VR, montée à pente tenue jusqu'à 35 ft.
 * Résultats [CALCULÉ] par le modèle du simulateur : ce ne sont pas des performances constructeur.
 */
import { gcKm, KT, FT } from './geo';
import { fwStep, type FixedWing, type FlightState, type Autopilot, type Controls, type FlightEnv } from './flight';

export interface TakeoffResult {
  /** Distance et temps jusqu'à VR, au décollage des roues, à 35 ft (m, s). */
  vr: { d: number; t: number } | null;
  liftoff: { d: number; t: number; kt: number } | null;
  screen: { d: number; t: number; kt: number } | null;
}

export function takeoffBench(ac: FixedWing, dt = 0.02, maxS = 150): TakeoffResult {
  const st: FlightState = {
    lat: 0, lon: 0, alt: 0, psi: 0, th: 0, ph: 0, gam: 0, V: 0, ve: 0, vn: 0, vu: 0,
    onGround: true, thr: 1, coll: 0, flap: Math.min(1, ac.flaps.length - 1), gear: true, brake: false, stall: false, spoil: false,
    eng: [true, true], nr: 1,
  };
  const ap: Autopilot = { on: false, ath: false, lat: 'HDG', hdg: 0, alt: 0, spd: 0, vs: 0, gamHold: 0, althold: false };
  const input: Controls = { pitch: 0, roll: 0, yaw: 0, thrD: 0, collD: 0, pad: { thr: null } };
  let crashed = false;
  const env: FlightEnv = {
    mission: false, airliner: false,
    elevAt: () => 0, ice: () => 0, gust: () => ({ u: 0, w: 0 }), windHead: () => 0, windNow: () => [0, 0], windDrift: () => 0,
    brkEff: () => 1, abrkTarget: () => 0, brakeHeat: () => {}, ilsDev: () => null, law: (a) => a.law, altInd: () => st.alt,
    navBearing: () => null, nearRunway: () => true, water: () => false, gearUnlocked: () => false, speedbrakeArmed: () => false,
    flash: () => {}, crash: () => { crashed = true; }, ditch: () => { crashed = true; },
  };
  const ctx = { ac, st, ap, input, env };
  const res: TakeoffResult = { vr: null, liftoff: null, screen: null };
  const dist = () => gcKm(0, 0, st.lat, st.lon) * 1000;
  for (let t = 0; t < maxS && !crashed; t += dt) {
    if (!res.vr && st.V >= ac.Vr * KT) res.vr = { d: dist(), t };
    input.pitch = st.onGround ? (st.V >= ac.Vr * KT ? 0.6 : 0) : 0;
    fwStep(ctx, dt);
    if (!res.liftoff && !st.onGround) res.liftoff = { d: dist(), t: t + dt, kt: st.V / KT };
    if (st.alt >= 35 * FT) { res.screen = { d: dist(), t: t + dt, kt: st.V / KT }; break; }
  }
  return res;
}
