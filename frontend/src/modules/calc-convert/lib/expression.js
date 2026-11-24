/**
 * Moteur de calcul de la calculatrice, sans eval().
 *
 * Étapes :
 *   1. tokenize()  : découpe "2×sin(30)+5!" en jetons (nombres, opérateurs, fonctions...)
 *   2. toRpn()     : algorithme de Dijkstra (« shunting-yard ») qui range les jetons
 *                    en notation polonaise inverse, en respectant les priorités
 *   3. evaluateRpn(): calcule le résultat avec une pile
 *
 * Symboles affichés : + − × ÷ ^ ! % √ π e ( ) et la virgule décimale.
 */

export class CalcError extends Error {}

const FUNCTIONS = ['asin', 'acos', 'atan', 'sin', 'cos', 'tan', 'ln', 'lg'];

const BINARY = {
  '+': { prec: 1, right: false, fn: (a, b) => a + b },
  '−': { prec: 1, right: false, fn: (a, b) => a - b },
  '×': { prec: 2, right: false, fn: (a, b) => a * b },
  '÷': {
    prec: 2,
    right: false,
    fn: (a, b) => {
      if (b === 0) throw new CalcError('Division par zéro');
      return a / b;
    },
  },
  '^': { prec: 4, right: true, fn: (a, b) => a ** b },
};

const NEG_PREC = 3; // moins unaire : -2^2 = -4, mais -2×3 = -6

/** Normalise les variantes clavier vers les symboles de l'écran. */
const ALIASES = { '-': '−', '*': '×', x: '×', '/': '÷', ':': '÷', '.': ',' };

export function tokenize(input) {
  const tokens = [];
  let i = 0;

  while (i < input.length) {
    let ch = ALIASES[input[i]] ?? input[i];

    if (ch === ' ') {
      i++;
      continue;
    }

    // Nombre : chiffres et une virgule au plus
    if (/[0-9,]/.test(ch)) {
      let raw = '';
      while (i < input.length && /[0-9,.]/.test(input[i])) {
        raw += input[i] === '.' ? ',' : input[i];
        i++;
      }
      if ((raw.match(/,/g) || []).length > 1 || raw === ',') {
        throw new CalcError('Nombre mal écrit');
      }
      tokens.push({ type: 'num', value: parseFloat(raw.replace(',', '.')) });
      continue;
    }

    const name = FUNCTIONS.find((f) => input.startsWith(f, i));
    if (name) {
      tokens.push({ type: 'func', value: name });
      i += name.length;
      continue;
    }

    if (ch === '√') tokens.push({ type: 'func', value: 'sqrt' });
    else if (ch === 'π') tokens.push({ type: 'num', value: Math.PI, isConst: true });
    else if (ch === 'e') tokens.push({ type: 'num', value: Math.E, isConst: true });
    else if (ch in BINARY) tokens.push({ type: 'op', value: ch });
    else if (ch === '!' || ch === '%') tokens.push({ type: 'postfix', value: ch });
    else if (ch === '(') tokens.push({ type: 'lparen' });
    else if (ch === ')') tokens.push({ type: 'rparen' });
    else throw new CalcError(`Symbole inconnu : ${ch}`);

    i++;
  }

  return addImplicitMultiplication(markUnary(tokens));
}

/** Un − ou + en début, après un opérateur ou une parenthèse ouvrante est unaire. */
function markUnary(tokens) {
  return tokens
    .map((t, idx) => {
      const prev = tokens[idx - 1];
      const startsOperand = !prev || prev.type === 'op' || prev.type === 'lparen' || prev.type === 'func' || prev.type === 'neg';
      if (t.type === 'op' && (t.value === '−' || t.value === '+') && startsOperand) {
        return t.value === '−' ? { type: 'neg' } : null; // le + unaire ne fait rien
      }
      return t;
    })
    .filter(Boolean);
}

/** "2π", "3(4)", ")(" , "5sin(30)" -> multiplication implicite. */
function addImplicitMultiplication(tokens) {
  const out = [];
  tokens.forEach((t, idx) => {
    const prev = tokens[idx - 1];
    const prevEndsOperand = prev && (prev.type === 'num' || prev.type === 'rparen' || prev.type === 'postfix');
    const startsOperand = t.type === 'num' || t.type === 'func' || t.type === 'lparen';
    if (prevEndsOperand && startsOperand) out.push({ type: 'op', value: '×' });
    out.push(t);
  });
  return out;
}

export function toRpn(tokens) {
  const output = [];
  const stack = [];
  const precOf = (t) => (t.type === 'neg' ? NEG_PREC : BINARY[t.value]?.prec ?? -1);

  for (const t of tokens) {
    switch (t.type) {
      case 'num':
      case 'postfix': // ! et % s'appliquent tout de suite à ce qui précède
        output.push(t);
        break;
      case 'func':
      case 'neg':
      case 'lparen':
        stack.push(t);
        break;
      case 'op': {
        const { prec, right } = BINARY[t.value];
        while (stack.length) {
          const top = stack.at(-1);
          if (top.type === 'lparen' || top.type === 'func') break;
          const topPrec = precOf(top);
          if (topPrec > prec || (topPrec === prec && !right)) output.push(stack.pop());
          else break;
        }
        stack.push(t);
        break;
      }
      case 'rparen': {
        while (stack.length && stack.at(-1).type !== 'lparen') output.push(stack.pop());
        if (!stack.length) throw new CalcError('Parenthèse fermante en trop');
        stack.pop(); // la parenthèse ouvrante
        if (stack.at(-1)?.type === 'func') output.push(stack.pop());
        // Un moins unaire posé avant la parenthèse s'applique au groupe
        break;
      }
      default:
        throw new CalcError('Expression invalide');
    }
  }

  // Les parenthèses non fermées sont fermées automatiquement : "sin(30" fonctionne
  while (stack.length) {
    const t = stack.pop();
    if (t.type === 'func') output.push(t);
    else if (t.type !== 'lparen') output.push(t);
  }

  return output;
}

function factorial(n) {
  if (!Number.isInteger(n) || n < 0) throw new CalcError('Factorielle : entier positif requis');
  if (n > 170) throw new CalcError('Nombre trop grand');
  let r = 1;
  for (let k = 2; k <= n; k++) r *= k;
  return r;
}

function applyFunction(name, x, angleMode) {
  const toRad = (v) => (angleMode === 'deg' ? (v * Math.PI) / 180 : v);
  const fromRad = (v) => (angleMode === 'deg' ? (v * 180) / Math.PI : v);
  // Évite 1,2E-16 au lieu de 0 pour sin(180°)
  const snap = (v) => (Math.abs(v) < 1e-12 ? 0 : v);

  switch (name) {
    case 'sin':
      return snap(Math.sin(toRad(x)));
    case 'cos':
      return snap(Math.cos(toRad(x)));
    case 'tan':
      if (angleMode === 'deg' && Math.abs(x % 180) === 90) throw new CalcError('Tangente indéfinie');
      return snap(Math.tan(toRad(x)));
    case 'asin':
    case 'acos':
      if (x < -1 || x > 1) throw new CalcError('Hors domaine [-1 ; 1]');
      return fromRad(name === 'asin' ? Math.asin(x) : Math.acos(x));
    case 'atan':
      return fromRad(Math.atan(x));
    case 'ln':
      if (x <= 0) throw new CalcError('ln : nombre positif requis');
      return Math.log(x);
    case 'lg':
      if (x <= 0) throw new CalcError('lg : nombre positif requis');
      return Math.log10(x);
    case 'sqrt':
      if (x < 0) throw new CalcError('Racine d’un nombre négatif');
      return Math.sqrt(x);
    default:
      throw new CalcError(`Fonction inconnue : ${name}`);
  }
}

export function evaluateRpn(rpn, angleMode = 'deg') {
  const stack = [];
  const pop = () => {
    if (!stack.length) throw new CalcError('Expression incomplète');
    return stack.pop();
  };

  for (const t of rpn) {
    if (t.type === 'num') stack.push(t.value);
    else if (t.type === 'neg') stack.push(-pop());
    else if (t.type === 'postfix') {
      const x = pop();
      stack.push(t.value === '!' ? factorial(x) : x / 100);
    } else if (t.type === 'func') stack.push(applyFunction(t.value, pop(), angleMode));
    else if (t.type === 'op') {
      const b = pop();
      const a = pop();
      stack.push(BINARY[t.value].fn(a, b));
    }
  }

  if (stack.length !== 1) throw new CalcError('Expression incomplète');
  const result = stack[0];
  if (!Number.isFinite(result)) throw new CalcError('Résultat hors limites');
  return result;
}

export function evaluate(expression, angleMode = 'deg') {
  if (!expression.trim()) throw new CalcError('Expression vide');
  return evaluateRpn(toRpn(tokenize(expression)), angleMode);
}

/** 805 -> "805", 0.1+0.2 -> "0,3", 1e20 -> "1E20" (12 chiffres significatifs max). */
export function formatNumber(value) {
  if (!Number.isFinite(value)) return 'Erreur';
  if (value === 0) return '0';
  const rounded = Number(value.toPrecision(12));
  const abs = Math.abs(rounded);

  if (abs >= 1e15 || abs < 1e-9) {
    const [mantissa, exp] = rounded.toExponential(9).split('e');
    const cleanMantissa = mantissa.replace(/\.?0+$/, '');
    return `${cleanMantissa}E${exp.replace('+', '')}`.replace('.', ',');
  }

  return String(rounded).replace('.', ',');
}

/** Vrai si l'expression contient un calcul (pas seulement un nombre) : sert à l'aperçu "= …". */
export function hasOperation(expression) {
  return /[+−×÷^!%√πe(]|sin|cos|tan|ln|lg/.test(expression.replace(/^−/, ''));
}
