/**
 * Version autonome de l'API : les services Symfony (backend/src/Service) portés en JavaScript,
 * même interface que httpApi.js. Aucun serveur nécessaire : c'est le mode par défaut du widget.
 */

const fail = (message) => { throw new Error(message); };
const ok = (fn) => new Promise((resolve, reject) => { try { resolve(fn()); } catch (e) { reject(e); } });

// ---------- UnitConverter ----------
const CATEGORIES = {
  longueur: { label: 'Longueur', units: { km: ['Kilomètre', 1000], m: ['Mètre', 1], dm: ['Décimètre', 0.1], cm: ['Centimètre', 0.01], mm: ['Millimètre', 0.001], um: ['Micromètre', 1e-6], nm: ['Nanomètre', 1e-9], mi: ['Mile', 1609.344], yd: ['Yard', 0.9144], ft: ['Pied', 0.3048], in: ['Pouce', 0.0254], nmi: ['Mille marin', 1852] } },
  masse: { label: 'Masse', units: { t: ['Tonne', 1000], kg: ['Kilogramme', 1], g: ['Gramme', 0.001], mg: ['Milligramme', 1e-6], lb: ['Livre (lb)', 0.45359237], oz: ['Once', 0.028349523125], ct: ['Carat', 0.0002] } },
  aire: { label: 'Aire', units: { km2: ['Kilomètre carré', 1e6], ha: ['Hectare', 1e4], a: ['Are', 100], m2: ['Mètre carré', 1], dm2: ['Décimètre carré', 0.01], cm2: ['Centimètre carré', 1e-4], mm2: ['Millimètre carré', 1e-6], mi2: ['Mile carré', 2589988.110336], acre: ['Acre', 4046.8564224], ft2: ['Pied carré', 0.09290304], in2: ['Pouce carré', 0.00064516] } },
  temps: { label: 'Temps', units: { an: ['Année (365 j)', 31536000], sem: ['Semaine', 604800], j: ['Jour', 86400], h: ['Heure', 3600], min: ['Minute', 60], s: ['Seconde', 1], ms: ['Milliseconde', 0.001], us: ['Microseconde', 1e-6] } },
  donnees: { label: 'Données', units: { bit: ['Bit', 0.125], o: ['Octet', 1], ko: ['Kilooctet (Ko)', 1e3], mo: ['Mégaoctet (Mo)', 1e6], go: ['Gigaoctet (Go)', 1e9], to: ['Téraoctet (To)', 1e12], kio: ['Kibioctet (Kio)', 1024], mio: ['Mébioctet (Mio)', 1048576], gio: ['Gibioctet (Gio)', 1073741824], tio: ['Tébioctet (Tio)', 1099511627776] } },
  volume: { label: 'Volume', units: { m3: ['Mètre cube', 1], l: ['Litre', 0.001], dl: ['Décilitre', 1e-4], cl: ['Centilitre', 1e-5], ml: ['Millilitre', 1e-6], cm3: ['Centimètre cube', 1e-6], galus: ['Gallon US', 0.003785411784], galuk: ['Gallon impérial', 0.00454609], ft3: ['Pied cube', 0.028316846592], in3: ['Pouce cube', 1.6387064e-5] } },
  vitesse: { label: 'Vitesse', units: { ms: ['Mètre par seconde', 1], kmh: ['Kilomètre par heure', 1 / 3.6], mph: ['Mile par heure', 0.44704], kn: ['Nœud', 1852 / 3600], fts: ['Pied par seconde', 0.3048], mach: ['Mach (niveau de la mer, 15 °C)', 340.29] } },
};
const TEMPERATURE = { c: 'Degré Celsius', f: 'Degré Fahrenheit', k: 'Kelvin' };

function catalog() {
  const out = {};
  for (const [key, cat] of Object.entries(CATEGORIES)) {
    out[key] = { label: cat.label, units: Object.entries(cat.units).map(([code, [label]]) => ({ code, label })) };
  }
  out.temperature = { label: 'Température', units: Object.entries(TEMPERATURE).map(([code, label]) => ({ code, label })) };
  return out;
}

function convertUnit({ category, from, to, value }) {
  if (category === 'temperature') {
    for (const code of [from, to]) if (!TEMPERATURE[code]) fail(`Unité de température inconnue : "${code}".`);
    const kelvin = { c: value + 273.15, f: ((value - 32) * 5) / 9 + 273.15, k: value }[from];
    if (kelvin < 0) fail('Température impossible : en dessous du zéro absolu.');
    return { result: { c: kelvin - 273.15, f: ((kelvin - 273.15) * 9) / 5 + 32, k: kelvin }[to] };
  }
  const cat = CATEGORIES[category] ?? fail(`Catégorie inconnue : "${category}".`);
  for (const code of [from, to]) if (!cat.units[code]) fail(`Unité inconnue pour ${category} : "${code}".`);
  return { result: (value * cat.units[from][1]) / cat.units[to][1] };
}

// ---------- CurrencyRateProvider ----------
const FIXED_PEGS = { XOF: 655.957, XAF: 655.957, XPF: 119.33174 };
const FALLBACK = { USD: 1.16, GBP: 0.87, CHF: 0.93, JPY: 178, CAD: 1.62, CNY: 8.3, MAD: 10.7 };
const NAMES = { EUR: 'Euro', USD: 'Dollar américain', GBP: 'Livre sterling', CHF: 'Franc suisse', JPY: 'Yen japonais', CAD: 'Dollar canadien', CNY: 'Yuan chinois', MAD: 'Dirham marocain', XOF: 'Franc CFA (UEMOA)', XAF: 'Franc CFA (CEMAC)', XPF: 'Franc Pacifique' };
let ratesPromise = null;

async function fetchLive() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://api.frankfurter.app/latest?from=EUR', { signal: controller.signal });
    clearTimeout(timer);
    const json = await res.json();
    if (!json.rates) return null;
    return { date: json.date, source: 'Banque centrale européenne (via Frankfurter)', rates: json.rates };
  } catch {
    return null;
  }
}

function getRates() {
  ratesPromise ??= fetchLive().then((live) => {
    const data = live ?? { date: null, source: 'Taux indicatifs intégrés (hors ligne, non à jour)', rates: FALLBACK };
    const rates = Object.fromEntries(Object.entries({ EUR: 1, ...data.rates, ...FIXED_PEGS }).sort(([a], [b]) => a.localeCompare(b)));
    const names = Object.fromEntries(Object.keys(rates).map((c) => [c, NAMES[c] ?? c]));
    return { base: 'EUR', date: data.date, source: data.source, rates, names };
  });
  return ratesPromise;
}

// ---------- NumeralConverter ----------
const DIGITS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const INT_MAX = 9223372036854775807n;

function numeral({ value, base }) {
  if (base < 2 || base > 36) fail('La base doit être comprise entre 2 et 36.');
  let v = String(value).trim().toUpperCase();
  const negative = v.startsWith('-');
  if (negative) v = v.slice(1);
  if (!v) fail('Valeur vide.');
  let n = 0n;
  for (const ch of v) {
    const d = DIGITS.indexOf(ch);
    if (d < 0 || d >= base) fail(`Le caractère "${ch}" n'existe pas en base ${base}.`);
    n = n * BigInt(base) + BigInt(d);
    if (n > INT_MAX) fail('Nombre trop grand (limite : 9 223 372 036 854 775 807).');
  }
  const out = (b) => (n === 0n ? '0' : (negative ? '-' : '') + n.toString(b).toUpperCase());
  return { bin: out(2), oct: out(8), dec: out(10), hex: out(16) };
}

// ---------- DateCalculator ----------
function parseDate(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '');
  const d = m && new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (!d || d.toISOString().slice(0, 10) !== value) fail(`Date invalide : "${value}" (format attendu AAAA-MM-JJ).`);
  return d;
}

function dateDiff({ start, end }) {
  let s = parseDate(start);
  let e = parseDate(end);
  const inFuture = e >= s;
  if (!inFuture) [s, e] = [e, s];
  // Nombre de mois entiers : on ajoute des mois à la date de début tant qu'on ne dépasse pas la fin
  // (débordement comme en PHP : 31 janvier + 1 mois = 3 mars)
  const addMonths = (d, n) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, d.getUTCDate()));
  let totalMonths = (e.getUTCFullYear() - s.getUTCFullYear()) * 12 + (e.getUTCMonth() - s.getUTCMonth());
  while (totalMonths > 0 && addMonths(s, totalMonths) > e) totalMonths -= 1;
  const days = Math.round((e - addMonths(s, totalMonths)) / 86400000);
  const totalDays = Math.round((e - s) / 86400000);
  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    days,
    totalDays,
    weeks: Math.floor(totalDays / 7),
    remainingDays: totalDays % 7,
    inFuture,
  };
}

function dateAdd({ start, days }) {
  const d = parseDate(start);
  d.setUTCDate(d.getUTCDate() + days);
  const weekdays = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  return { date: d.toISOString().slice(0, 10), weekday: weekdays[d.getUTCDay()] };
}

// ---------- Finance, réduction, IMC ----------
const round2 = (x) => Math.round(x * 100) / 100;

function loan({ principal, rate, months }) {
  if (principal <= 0) fail('Le montant emprunté doit être positif.');
  if (rate < 0) fail('Le taux ne peut pas être négatif.');
  if (months < 1 || months > 600) fail('La durée doit être comprise entre 1 et 600 mois.');
  const r = rate / 12 / 100;
  const monthly = r === 0 ? principal / months : (principal * r) / (1 - (1 + r) ** -months);
  const total = monthly * months;
  return { monthlyPayment: round2(monthly), totalPaid: round2(total), totalInterest: round2(total - principal), months };
}

function discount({ price, percent, extraPercent = 0 }) {
  if (price < 0) fail('Le prix ne peut pas être négatif.');
  for (const p of [percent, extraPercent]) if (p < 0 || p > 100) fail('Une réduction doit être comprise entre 0 et 100 %.');
  const final = price * (1 - percent / 100) * (1 - extraPercent / 100);
  const saved = price - final;
  return { finalPrice: round2(final), saved: round2(saved), effectivePercent: price > 0 ? round2((saved / price) * 100) : 0 };
}

function bmi({ weight, height }) {
  if (weight <= 0 || weight > 500) fail('Poids invalide (entre 1 et 500 kg).');
  if (height < 50 || height > 272) fail('Taille invalide (entre 50 et 272 cm).');
  const value = Math.round((weight / (height / 100) ** 2) * 10) / 10;
  const [category, level] =
    value < 18.5 ? ['Insuffisance pondérale', 'warning']
      : value < 25 ? ['Corpulence normale', 'good']
        : value < 30 ? ['Surpoids', 'warning']
          : value < 35 ? ['Obésité modérée', 'critical']
            : value < 40 ? ['Obésité sévère', 'critical']
              : ['Obésité massive', 'critical'];
  return { bmi: value, category, level };
}

export const localApi = {
  units: () => ok(catalog),
  convert: (payload) => ok(() => convertUnit(payload)),
  currencies: () => getRates(),
  currency: async ({ from, to, value }) => {
    const { rates, date, source } = await getRates();
    for (const code of [from, to]) if (!rates[code]) fail(`Devise inconnue : "${code}".`);
    return { result: (value / rates[from]) * rates[to], date, source };
  },
  numeral: (payload) => ok(() => numeral(payload)),
  dateDiff: (payload) => ok(() => dateDiff(payload)),
  dateAdd: (payload) => ok(() => dateAdd(payload)),
  loan: (payload) => ok(() => loan(payload)),
  discount: (payload) => ok(() => discount(payload)),
  bmi: (payload) => ok(() => bmi(payload)),
};
