/**
 * Physique du vol, portée du moteur d'origine (V10.42.1, base.html : fwStep, rwStep, move).
 *
 * Avions : point-masse sur trois axes, avec la loi de pilotage (manche neutre = pente maintenue),
 * le pilote automatique (pente commandée par la V/S, cap, NAV, ILS, ordre TCAS), l'automanette,
 * le roulage, le freinage, l'auto-frein, la rotation, le décollage et le toucher des roues.
 * Hélicoptères : poussée du rotor orientée par l'assiette, maintien d'altitude, autorotation simplifiée [SIMULÉ].
 *
 * Les équations sont recopiées à l'identique, dans le même ordre d'opérations, pour donner exactement
 * les mêmes nombres que l'original (test de parité : tests/parity_flight.py).
 *
 * Ce qui n'est pas encore porté (relief, vent et météo, rafales, givrage, freins et hydraulique,
 * ILS, plan de vol, crash, amerrissage, messages) est fourni par l'appelant à travers `FlightEnv` :
 * chaque module le remplacera quand il sera porté à son tour.
 */
import { D2R, R2D, KT, FT, G0, clamp, wrap360, wrapPi, offsetLL } from './geo';
import { isaRho, sos, casFromTas, tasFromCas } from './atmosphere';

/** Cran de volets : supplément de CL0 (a), de CLmax (b) et de CD0 (c). */
export interface FlapSetting { n: string; a: number; b: number; c: number }

/** Avion (mêmes champs que data/aircraft.json). */
export interface FixedWing {
  kind: 'fw';
  m: number; S: number; Tmax: number;
  CD0: number; k: number; CL0: number; CLa: number; CLmax: number; gearCD: number;
  Vr: number; Vmo?: number; Mmo: number;
  law?: string;
  flaps: FlapSetting[];
  /** Hélice : vitesse (m/s) à laquelle la traction s'annule (moteur à pistons). */
  prop?: number;
  single?: boolean;
  /** Train fixe (Cessna 172) : le train reste sorti. */
  fixedGear?: boolean;
}

/** Hélicoptère (mêmes champs que data/aircraft.json). */
export interface RotaryWing {
  kind: 'rw';
  m: number; tw: number; CdA: number;
  twin?: boolean; afcs?: boolean;
}

/** État de l'appareil (mêmes champs que l'objet S de l'original). */
export interface FlightState {
  lat: number; lon: number; alt: number;
  psi: number; th: number; ph: number; gam: number;
  V: number; ve: number; vn: number; vu: number;
  onGround: boolean; thr: number; coll: number; flap: number;
  gear: boolean; brake: boolean; stall: boolean; spoil: boolean;
  eng: boolean[]; nr: number;
  mass?: number; rev?: boolean; pbrake?: boolean; pk?: number;
  [k: string]: unknown;
}

/** Pilote automatique (mêmes champs que l'objet AP de l'original). */
export interface Autopilot {
  on: boolean; ath: boolean; lat: string; hdg: number; alt: number; spd: number; vs: number;
  gamHold: number; althold: boolean;
  appr?: boolean; gsCap?: boolean; raVs?: number | null; wxOff?: number;
  [k: string]: unknown;
}

/** Commandes (mêmes champs que l'objet IN de l'original). */
export interface Controls {
  pitch: number; roll: number; yaw: number; thrD: number; collD: number;
  pad: { thr: number | null };
}

/** Écart ILS : distance au seuil (m), écart d'alignement, écart de pente, hauteur (m), axe de piste (°). */
export interface IlsDeviation { d: number; loc: number; gs: number; h: number; crs: number }

/** Ce que la physique demande au reste du simulateur. */
export interface FlightEnv {
  /** Une mission est en cours (MI) : vent, rafales, givrage, freins et auto-frein s'appliquent. */
  mission: boolean;
  /** Avion de ligne (A320, 777, A350) : altitude indiquée au calage, loi de pilotage selon l'hydraulique. */
  airliner: boolean;
  elevAt(lat: number, lon: number): number;
  /** Givre accumulé, 0 à 1. */
  ice(): number;
  /** Rafale : composante horizontale u et verticale w (m/s). */
  gust(): { u: number; w: number };
  /** Vent de face (m/s, > 0 = de face). */
  windHead(): number;
  /** Vent [est, nord] (m/s). */
  windNow(): [number, number];
  /** Angle de correction de dérive pour une route donnée (°). */
  windDrift(trackDeg: number): number;
  brkEff(): number;
  abrkTarget(st: FlightState): number;
  brakeHeat(energyJ: number): void;
  ilsDev(): IlsDeviation | null;
  /** Loi de pilotage en vigueur ('fbw' = loi normale). */
  law(a: FixedWing): string | undefined;
  /** Altitude indiquée au calage du commandant (m). */
  altInd(): number;
  /** Relèvement de la route NAV (°), ou null sans plan de vol ni destination. */
  navBearing(lat: number, lon: number): number | null;
  nearRunway(lat: number, lon: number): boolean;
  water(lat: number, lon: number): boolean;
  gearUnlocked(): boolean;
  speedbrakeArmed(): boolean;
  flash(msg: string, cls: string): void;
  crash(vs: number, onRunway: boolean, why: string): void;
  ditch(vs: number): void;
  /** Appelé après chaque pas (guidage du parcours, par exemple). */
  afterStep?(): void;
}

export interface FlightContext<A> {
  ac: A; st: FlightState; ap: Autopilot; input: Controls; env: FlightEnv;
}

/** Nombre au format français, comme fmt() de l'original. */
export const fmt = (x: number | null | undefined, d = 0): string =>
  x == null || !isFinite(x) ? '—' : x.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });

/** Déplace l'appareil de dN mètres vers le nord et dE mètres vers l'est. */
export function move(st: FlightState, dN: number, dE: number): void {
  const p = offsetLL(st.lat, st.lon, dN, dE);
  st.lat = p[0];
  st.lon = wrap360(p[1] + 180) - 180;
}

/* ---- avions : point-masse 3 axes + loi de pilotage ---- */
function fwCore(c: FlightContext<FixedWing>, dt: number): void {
  const { ac: a, st, ap: AP, input: IN, env } = c;
  const MI = env.mission;
  const rho = isaRho(st.alt), sig = rho / 1.225, fl = a.flaps[st.flap];
  // givrage : Clmax −22 %, traînée +100 points au maximum [ESTIMÉ, ordres de grandeur publiés]
  const ice = MI ? env.ice() : 0, CL0 = a.CL0 + fl.a, CLmax = (a.CLmax + fl.b) * (1 - 0.22 * ice),
    CD0 = a.CD0 + fl.c + (st.gear ? a.gearCD : 0) + (st.spoil ? 0.03 : 0) + 0.010 * ice;
  // rafales : incidence et vitesse air ; au sol S.V = vitesse sol, vitesse air = S.V + vent de face
  const gu = !st.onGround && MI ? env.gust() : { u: 0, w: 0 }, hw = st.onGround && MI ? env.windHead() : 0,
    V = Math.max(st.V + hw + gu.u, 0.1), q = 0.5 * rho * V * V, alpha = st.th - st.gam + gu.w / Math.max(V, 30);
  let CL = CL0 + a.CLa * alpha;
  st.stall = !st.onGround && CL > CLmax;
  if (st.stall) CL = CLmax * 0.72;
  // hélice (moteur à pistons) : traction maximale au point fixe, décroissante avec la vitesse [ESTIMÉ]
  const Mm = st.mass || a.m, L = q * a.S * CL, Dg = q * a.S * (CD0 + a.k * CL * CL),
    nEng = a.single ? (st.eng[0] ? 1 : 0) : st.eng.filter(Boolean).length / 2,
    T = a.prop
      ? nEng * a.Tmax * (0.05 + 0.95 * st.thr) * (st.pk ?? 1) * sig * Math.max(0.25, 1 - V / a.prop)
      : st.thr * a.Tmax * nEng * Math.pow(sig, 0.8),
    W = Mm * G0;
  const elev = env.elevAt(st.lat, st.lon);
  // commandes (pilote ou pilote auto)
  const pin = IN.pitch, rin = IN.roll;
  if (AP.on && (Math.abs(pin) > 0.25 || Math.abs(rin) > 0.25)) { AP.on = false; env.flash('AP OFF', 'am'); }
  if (st.onGround) {
    const N = Math.max(0, W - L), eff = MI ? env.brkEff() : 1, ab = MI ? env.abrkTarget(st) : 0,
      aNat = (Dg + 0.018 * N - T) / Mm + (st.rev ? 1.6 : 0) + (st.spoil && st.V > 20 ? 0.8 : 0);
    let Fb = st.brake ? (0.32 * eff - 0.018) * N : 0;
    if (!st.brake && ab > 0) Fb = clamp((ab - aNat) * Mm, 0, (0.32 * eff - 0.018) * N); // auto-frein : décélération visée
    st.V = Math.max(0, st.V + ((T - Dg - 0.018 * N - Fb) / Mm) * dt - (st.rev ? 1.6 * dt : 0) - (st.spoil && st.V > 20 ? 0.8 * dt : 0));
    if (MI) env.brakeHeat(Fb * st.V * dt);
    if (st.pbrake) st.V = Math.max(0, st.V - 3 * dt);
    st.psi += (IN.yaw || rin) * 0.25 * Math.min(1, st.V / 12) * dt;
    if (st.V > a.Vr * KT * 0.92) st.th += pin * 3 * D2R * dt;
    else st.th += (0 - st.th) * Math.min(1, dt * 2);
    st.th = clamp(st.th, 0, 14 * D2R); st.ph = 0; st.gam = 0; st.alt = elev;
    if (L > W * 1.02 && st.th > 2 * D2R) { st.onGround = false; st.gam = 0.01; AP.gamHold = 0.05; st.V = V; }
  } else {
    const Vc = Math.max(V, 25);
    st.V += ((T - Dg) / Mm - G0 * Math.sin(st.gam)) * dt; st.V = Math.max(st.V, 5);
    st.gam += ((L * Math.cos(st.ph) - W * Math.cos(st.gam)) / (Mm * Vc)) * dt;
    st.psi += (L * Math.sin(st.ph) / (Mm * Vc * Math.cos(st.gam))) * dt;
    // assiette : loi « trajectoire » (manche neutre = pente maintenue) ; AP = pente commandée par la V/S
    let gamT: number;
    const IL = AP.on && AP.appr ? env.ilsDev() : null;
    if (!AP.appr) AP.gsCap = false;
    const fbw = () => env.law(a) === 'fbw';
    if (IL && IL.d < 40000 && (AP.gsCap || IL.gs > -0.25)) {
      AP.gsCap = true;
      const hh = st.alt - env.elevAt(st.lat, st.lon);
      gamT = hh < 15 ? -1.1 * D2R : -(3 + clamp(IL.gs * 2, -2.5, 3)) * D2R;
      if (hh < 15 && AP.ath) { AP.ath = false; st.thr = 0; env.flash('RETARD', 'am'); }
      AP.gamHold = st.gam;
    } else if (AP.on && AP.raVs != null) {
      // ordre de résolution TCAS suivi (type AP/FD TCAS) [SIMULÉ]
      gamT = Math.asin(clamp(AP.raVs * FT / 60 / Vc, -0.3, 0.3)); AP.gamHold = st.gam;
    } else if (AP.on) {
      // protection vitesse : la descente se réduit à l'approche de la VMO
      const altE = AP.alt * FT - (env.airliner && MI ? env.altInd() : st.alt), vsMax = (AP.vs || 1800) * FT / 60,
        vs0 = clamp(altE * 0.08, -vsMax, vsMax), casN = casFromTas(st.V, st.alt) / KT, vmx = a.Vmo || 340,
        vs = vs0 < 0 ? vs0 * clamp((vmx - 5 - casN) / 12, 0, 1) : vs0;
      gamT = Math.asin(clamp(vs / Vc, -0.3, 0.3)); AP.gamHold = st.gam;
    } else {
      if (Math.abs(pin) > 0.04) AP.gamHold = clamp(st.gam + pin * (fbw() ? 0.06 : 0.08), -0.35, 0.45);
      gamT = AP.gamHold;
    }
    const CLreq = W * Math.cos(st.gam) / (Math.max(0.2, Math.cos(st.ph)) * q * a.S),
      alphaReq = clamp((CLreq - CL0) / a.CLa, -0.1, (CLmax - CL0) / a.CLa);
    let thT = gamT + alphaReq;
    if (fbw()) { // protections loi normale
      thT = clamp(thT, -15 * D2R, 30 * D2R);
      const aProt = (CLmax - 0.08 - CL0) / a.CLa;
      thT = Math.min(thT, st.gam + aProt);
    }
    const thR = (fbw() ? 3 : 4) * D2R;
    st.th += clamp(thT - st.th, -thR * dt, thR * dt) + (st.stall ? -4 * D2R * dt : 0);
    // roulis
    if (AP.on) {
      const IL2 = AP.appr ? env.ilsDev() : null;
      let tgt: number;
      if (AP.lat === 'NAV') {
        const nb = env.navBearing(st.lat, st.lon);
        tgt = nb != null ? wrap360(nb + (AP.wxOff || 0)) : AP.hdg;
      } else tgt = AP.hdg;
      if (IL2 && IL2.d < 40000) tgt = (IL2.h < 40 || Math.abs(IL2.loc) > 90) ? IL2.crs : wrap360(IL2.crs + clamp(IL2.loc * 3.5, -35, 35));
      if (MI && (AP.lat === 'NAV' || (IL2 && IL2.d < 40000))) tgt = wrap360(tgt - env.windDrift(tgt)); // route visée → cap corrigé de la dérive
      const e = wrapPi((tgt - st.psi * R2D) * D2R) * R2D, nearG = (st.alt - env.elevAt(st.lat, st.lon)) < 40,
        phT = clamp(e * 1.6, nearG ? -3 : -25, nearG ? 3 : 25) * D2R;
      st.ph += clamp(phT - st.ph, -5 * D2R * dt, 5 * D2R * dt);
    } else if (fbw()) {
      if (Math.abs(rin) > 0.04) st.ph += rin * 15 * D2R * dt;
      else if (Math.abs(st.ph) > 33 * D2R) st.ph -= Math.sign(st.ph) * 5 * D2R * dt;
      st.ph = clamp(st.ph, -67 * D2R, 67 * D2R);
    } else { st.ph += rin * 22 * D2R * dt; st.ph = clamp(st.ph, -85 * D2R, 85 * D2R); }
    // automanette
    if (AP.ath) {
      const vt = Math.min(tasFromCas(AP.spd * KT, st.alt), a.Mmo * 0.98 * sos(st.alt));
      st.thr = clamp(st.thr + clamp((vt - st.V) * 0.06 - st.gam * 0.0, -0.4, 0.4) * dt, 0.03, 1);
    }
    st.alt += st.V * Math.sin(st.gam) * dt;
    if (st.alt <= elev) {
      const vs = st.V * Math.sin(st.gam), onRw = env.nearRunway(st.lat, st.lon);
      if (MI && !onRw && env.water(st.lat, st.lon)) { env.ditch(vs); return; } // amerrissage
      if (MI && env.gearUnlocked() && st.gear) {
        env.crash(vs, onRw, 'Train principal non verrouillé : affaissement à l\'atterrissage (procédure GRAVITY EXTN non appliquée).');
        return;
      }
      if (vs < -3.8 || Math.abs(st.ph) > 12 * D2R || !st.gear || !onRw || st.th < -2 * D2R) {
        env.crash(vs, onRw, !st.gear ? 'Train rentré.' : vs < -3.8 ? 'Vitesse verticale excessive.'
          : Math.abs(st.ph) > 12 * D2R ? 'Inclinaison excessive au toucher.' : !onRw ? 'Hors piste.' : 'Assiette à piquer au toucher.');
        return;
      }
      st.onGround = true; st.alt = elev; st.gam = 0; st.ph = 0; st.V = Math.max(0, st.V - (MI ? env.windHead() : 0));
      AP.on = false; AP.ath = false;
      if (env.speedbrakeArmed()) st.spoil = true;
      env.flash('Toucher : ' + fmt(-vs / FT * 60, 0) + ' ft/min', 'am');
    }
  }
  // dérive due au vent
  const wv = st.onGround || !MI ? [0, 0] : env.windNow();
  move(st, (st.V * Math.cos(st.gam) * Math.cos(st.psi) + wv[1]) * dt, (st.V * Math.cos(st.gam) * Math.sin(st.psi) + wv[0]) * dt);
  st.thr = clamp(st.thr + IN.thrD * 0.35 * dt, 0, 1);
  if (IN.pad.thr != null) st.thr = IN.pad.thr;
}

/** Un pas de calcul d'avion (dt ≤ 0,02 s dans la boucle de l'original). */
export function fwStep(c: FlightContext<FixedWing>, dt: number): void {
  fwCore(c, dt);
  if (c.ac.fixedGear) c.st.gear = true;
  c.env.afterStep?.();
}

/* ---- hélicoptères : poussée du rotor orientée par l'assiette, autorotation simplifiée ---- */
export function rwStep(c: FlightContext<RotaryWing>, dt: number): void {
  const { ac: a, st, ap: AP, input: IN, env } = c;
  const MI = env.mission;
  const rho = isaRho(st.alt), sig = rho / 1.225, Mm = st.mass || a.m, W = Mm * G0, Tmax = a.tw * a.m * G0;
  // cyclique → assiette visée ; palonnier → lacet
  const afcsHold = a.afcs && AP.on;
  const thT = IN.pitch * 20 * D2R, phT = IN.roll * 25 * D2R;
  if (afcsHold && Math.abs(IN.pitch) < 0.05 && Math.abs(IN.roll) < 0.05) { /* maintien d'assiette */ }
  else { st.th += (thT - st.th) * Math.min(1, dt * 2.2); st.ph += (phT - st.ph) * Math.min(1, dt * 2.6); }
  const vh = Math.hypot(st.ve, st.vn);
  st.psi += (IN.yaw * 0.7 + (vh > 15 ? Math.sin(st.ph) * 0.45 : 0)) * dt;
  // collectif
  const hover = W / (Tmax * sig * Math.max(0.3, st.nr * st.nr));
  if (AP.althold) {
    const e = AP.alt * FT - st.alt;
    st.coll = clamp(hover + e * 0.004 - st.vu * 0.05, 0, 1);
    if (Math.abs(IN.collD) > 0.1) { AP.althold = false; env.flash('ALT OFF', 'am'); }
  }
  st.coll = clamp(st.coll + IN.collD * 0.45 * dt, 0, 1);
  const engOK = a.twin ? (st.eng[0] || st.eng[1]) : st.eng[0], pw = a.twin && !(st.eng[0] && st.eng[1]) ? 0.62 : 1;
  // autorotation [SIMULÉ]
  const T = engOK && st.nr > 0.5
    ? st.coll * Tmax * sig * pw * (1 + 0.12 * Math.min(1, vh / 18)) * Math.min(1, st.nr * st.nr)
    : W * clamp(-st.vu / 14, 0, 1.05) * Math.min(1, st.coll * 1.6 + 0.3);
  const cp = Math.cos(st.psi), sp = Math.sin(st.psi), ct = Math.cos(st.th), stt = Math.sin(st.th);
  const f = [sp * ct, cp * ct, stt], r = [cp, -sp, 0];
  const up = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  // u : vecteur « haut » du rotor ; un piqué (th < 0) l'incline vers l'avant
  const u = [up[0] * Math.cos(st.ph) + r[0] * Math.sin(st.ph), up[1] * Math.cos(st.ph) + r[1] * Math.sin(st.ph), up[2] * Math.cos(st.ph) + r[2] * Math.sin(st.ph)];
  const vt = Math.hypot(st.ve, st.vn, st.vu), dk = 0.5 * rho * a.CdA * vt / Mm;
  const ae = T / Mm * u[0] - dk * st.ve - 0.04 * st.ve, an = T / Mm * u[1] - dk * st.vn - 0.04 * st.vn;
  const au = T / Mm * u[2] - G0 - dk * st.vu;
  st.ve += ae * dt; st.vn += an * dt; st.vu += au * dt;
  const elev = env.elevAt(st.lat, st.lon);
  st.alt += st.vu * dt;
  if (st.alt <= elev) {
    if (!st.onGround) {
      if (st.vu < -4.5 || Math.abs(st.ph) > 15 * D2R || Math.abs(st.th) > 18 * D2R) { env.crash(st.vu, true, ''); return; }
      if (st.vu < -0.3) env.flash('Posé : ' + fmt(-st.vu / FT * 60, 0) + ' ft/min', 'am');
    }
    st.alt = elev; st.vu = Math.max(0, st.vu);
    if (T < W) { st.onGround = true; st.ve *= Math.exp(-4 * dt); st.vn *= Math.exp(-4 * dt); st.th *= Math.exp(-3 * dt); st.ph *= Math.exp(-3 * dt); }
  } else st.onGround = false;
  // au contact du sol, le frottement annule la dérive
  const kw = MI ? clamp((st.alt - env.elevAt(st.lat, st.lon) - 0.3) / 3, 0, 1) : 0,
    wr = kw ? env.windNow().map((v) => v * kw) : [0, 0];
  move(st, (st.vn + wr[1]) * dt, (st.ve + wr[0]) * dt);
  st.V = Math.hypot(st.ve, st.vn, st.vu); st.gam = Math.atan2(st.vu, Math.max(0.1, vh));
}
