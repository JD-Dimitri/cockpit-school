import { useCallback, useMemo, useRef, useState } from 'react';
import { ArrowLeftRight, Delete, X } from '../icons.js';
import { evaluate, formatNumber, hasOperation } from '../lib/expression.js';
import { cx } from '../lib/cx.js';

const OPERATORS = ['+', '−', '×', '÷', '^'];
const FUNCTION_PREFIXES = ['asin(', 'acos(', 'atan(', 'sin(', 'cos(', 'tan(', 'ln(', 'lg(', '√('];
const HISTORY_KEY = 'calc-convert:history'; // préfixé pour ne pas écraser une clé du projet hôte

/** Chaque touche : ce qu'elle affiche, ce qu'elle envoie, son style. */
const KEYS = {
  second: { label: '2nd', kind: 'sci' },
  angle: { kind: 'sci' },
  sin: { label: 'sin', alt: 'sin⁻¹', input: 'sin(', altInput: 'asin(', kind: 'sci' },
  cos: { label: 'cos', alt: 'cos⁻¹', input: 'cos(', altInput: 'acos(', kind: 'sci' },
  tan: { label: 'tan', alt: 'tan⁻¹', input: 'tan(', altInput: 'atan(', kind: 'sci' },
  pow: { label: 'xʸ', input: '^', kind: 'sci' },
  lg: { label: 'lg', input: 'lg(', kind: 'sci' },
  ln: { label: 'ln', input: 'ln(', kind: 'sci' },
  lpar: { label: '(', input: '(', kind: 'sci' },
  rpar: { label: ')', input: ')', kind: 'sci' },
  sqrt: { label: '√x', input: '√(', kind: 'sci' },
  clear: { label: 'C', kind: 'accent' },
  back: { kind: 'accent' },
  percent: { label: '%', input: '%', kind: 'accent' },
  div: { label: '÷', input: '÷', kind: 'accent' },
  fact: { label: 'x!', input: '!', kind: 'sci' },
  mul: { label: '×', input: '×', kind: 'accent' },
  inv: { label: '¹/x', kind: 'sci' },
  sub: { label: '−', input: '−', kind: 'accent' },
  pi: { label: 'π', input: 'π', kind: 'sci' },
  add: { label: '+', input: '+', kind: 'accent' },
  mode: { kind: 'accent' },
  e: { label: 'e', input: 'e', kind: 'sci' },
  comma: { label: ',', input: ',' },
  equals: { label: '=', kind: 'equals' },
};
for (const d of '0123456789') KEYS[d] = { label: d, input: d };

const SCIENTIFIC_LAYOUT = [
  ['second', 'angle', 'sin', 'cos', 'tan'],
  ['pow', 'lg', 'ln', 'lpar', 'rpar'],
  ['sqrt', 'clear', 'back', 'percent', 'div'],
  ['fact', '7', '8', '9', 'mul'],
  ['inv', '4', '5', '6', 'sub'],
  ['pi', '1', '2', '3', 'add'],
  ['mode', 'e', '0', 'comma', 'equals'],
];

const BASIC_LAYOUT = [
  ['clear', 'back', 'percent', 'div'],
  ['7', '8', '9', 'mul'],
  ['4', '5', '6', 'sub'],
  ['1', '2', '3', 'add'],
  ['mode', '0', 'comma', 'equals'],
];

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    /* stockage indisponible (navigation privée) : on ignore */
  }
}

const openParens = (expr) => (expr.match(/\(/g) || []).length - (expr.match(/\)/g) || []).length;
const endsWithOperand = (expr) => /[0-9)!%πe]$/.test(expr);

export default function Calculator({ historyOpen, onCloseHistory }) {
  const [expr, setExpr] = useState('');
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [error, setError] = useState('');
  const [angleMode, setAngleMode] = useState('deg');
  const [second, setSecond] = useState(false);
  const [scientific, setScientific] = useState(true);
  const [history, setHistory] = useState(loadHistory);

  // Aperçu en direct du résultat, comme sur le téléphone : "= 805"
  const preview = useMemo(() => {
    if (!hasOperation(expr)) return '';
    try {
      return formatNumber(evaluate(expr, angleMode));
    } catch {
      return '';
    }
  }, [expr, angleMode]);

  const append = useCallback(
    (text, { fresh = false } = {}) => {
      setError('');
      setExpr((current) => (justEvaluated && fresh ? text : current + text));
      setJustEvaluated(false);
    },
    [justEvaluated],
  );

  const pressOperator = useCallback(
    (op) => {
      setError('');
      setJustEvaluated(false);
      setExpr((current) => {
        const last = current.at(-1);
        if (current === '' || last === '(') return op === '−' ? current + op : current;
        if (OPERATORS.includes(last)) {
          // "5×−" est permis (nombre négatif) ; sinon on remplace l'opérateur
          if (op === '−' && ['×', '÷', '^'].includes(last)) return current + op;
          const trimmed = current.replace(/[+−×÷^]+$/, '');
          return trimmed === '' ? current : trimmed + op;
        }
        return current + op;
      });
    },
    [],
  );

  const pressComma = useCallback(() => {
    setError('');
    if (justEvaluated) {
      setExpr('0,');
      setJustEvaluated(false);
      return;
    }
    setExpr((current) => {
      const lastNumber = current.match(/[0-9,]*$/)[0];
      if (lastNumber.includes(',')) return current;
      return current + (lastNumber === '' ? '0,' : ',');
    });
  }, [justEvaluated]);

  const backspace = useCallback(() => {
    setError('');
    setJustEvaluated(false);
    setExpr((current) => {
      const fn = FUNCTION_PREFIXES.find((f) => current.endsWith(f));
      return fn ? current.slice(0, -fn.length) : current.slice(0, -1);
    });
  }, []);

  const clear = useCallback(() => {
    setExpr('');
    setError('');
    setJustEvaluated(false);
  }, []);

  const equals = useCallback(() => {
    if (!expr) return;
    try {
      const result = formatNumber(evaluate(expr, angleMode)).replace('-', '−');
      if (hasOperation(expr)) {
        const next = [{ expr, result }, ...history].slice(0, 50);
        setHistory(next);
        saveHistory(next);
      }
      setExpr(result);
      setJustEvaluated(true);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, [expr, angleMode, history]);

  const press = useCallback(
    (id) => {
      const key = KEYS[id];
      switch (id) {
        case 'second':
          return setSecond((s) => !s);
        case 'angle':
          return setAngleMode((m) => (m === 'deg' ? 'rad' : 'deg'));
        case 'mode':
          return setScientific((s) => !s);
        case 'clear':
          return clear();
        case 'back':
          return backspace();
        case 'equals':
          return equals();
        case 'comma':
          return pressComma();
        case 'inv':
          if (expr) {
            setExpr(`1÷(${expr})`);
            setJustEvaluated(false);
          }
          return undefined;
        case 'rpar':
          if (openParens(expr) > 0 && endsWithOperand(expr)) append(')');
          return undefined;
        case 'percent':
        case 'fact':
          if (endsWithOperand(expr)) append(key.input);
          return undefined;
        default:
          break;
      }

      if (OPERATORS.includes(key.input)) return pressOperator(key.input);

      const input = second && key.altInput ? key.altInput : key.input;
      // Un chiffre, une fonction ou une constante après "=" démarre un nouveau calcul
      append(input, { fresh: true });
      return undefined;
    },
    [append, backspace, clear, equals, expr, pressComma, pressOperator, second],
  );

  // Clavier physique : écouté UNIQUEMENT quand le focus est dans la calculatrice,
  // pour ne jamais capturer les touches du projet hôte (commandes du simulateur).
  // Échap n'est pas utilisé : il reste disponible pour l'hôte (fermer un panneau...).
  const sectionRef = useRef(null);
  const onKeyDown = (e) => {
    if (historyOpen || e.ctrlKey || e.metaKey || e.altKey) return;
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
    const map = {
      Enter: 'equals', '=': 'equals', Backspace: 'back', Delete: 'clear',
      '+': 'add', '-': 'sub', '*': 'mul', x: 'mul', '/': 'div', '^': 'pow',
      '(': 'lpar', ')': 'rpar', ',': 'comma', '.': 'comma', '%': 'percent', '!': 'fact',
    };
    const id = /^[0-9]$/.test(e.key) ? e.key : map[e.key];
    if (id) {
      e.preventDefault();
      e.stopPropagation(); // la touche ne remonte pas jusqu'au simulateur
      press(id);
    }
  };
  // Safari ne donne pas le focus aux boutons cliqués : on le pose sur la calculatrice
  const onPointerDown = () => {
    if (!sectionRef.current?.contains(document.activeElement)) {
      sectionRef.current?.focus({ preventScroll: true });
    }
  };

  const layout = scientific ? SCIENTIFIC_LAYOUT : BASIC_LAYOUT;
  const exprSize = expr.length > 16 ? 'small' : expr.length > 10 ? 'medium' : 'large';

  const renderLabel = (id) => {
    const key = KEYS[id];
    if (id === 'back') return <Delete size={15} aria-label="Effacer" />;
    if (id === 'mode') return <ArrowLeftRight size={14} aria-label="Mode scientifique ou simple" />;
    if (id === 'angle') return angleMode;
    if (second && key.alt) return key.alt;
    return key.label;
  };

  return (
    <section
      ref={sectionRef}
      className={cx("calculator")}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      aria-label="Calculatrice"
    >
      <div className={cx("display")} aria-live="polite">
        <div className={cx(`expression ${exprSize}`)}>{expr || '0'}</div>
        <div className={cx(`preview ${error ? 'error' : ''}`)}>
          {error || (preview && !justEvaluated ? `= ${preview}` : ' ')}
        </div>
      </div>

      <div className={cx(`keypad ${scientific ? 'sci' : 'basic'}`)}>
        {layout.flat().map((id) => (
          <button
            key={id}
            className={cx(`key ${KEYS[id].kind ?? ''} ${id === 'second' && second ? 'on' : ''}`)}
            onClick={() => press(id)}
          >
            {renderLabel(id)}
          </button>
        ))}
      </div>

      {historyOpen && (
        <div className={cx("sheet")} role="dialog" aria-label="Historique">
          <div className={cx("sheet-head")}>
            <h2>Historique</h2>
            <button className={cx("icon-btn")} onClick={onCloseHistory} aria-label="Fermer">
              <X size={12} />
            </button>
          </div>
          {history.length === 0 ? (
            <p className={cx("muted")}>Aucun calcul pour l’instant.</p>
          ) : (
            <>
              <ul className={cx("history")}>
                {history.map((item, i) => (
                  <li key={i}>
                    <button
                      onClick={() => {
                        setExpr(item.expr);
                        setJustEvaluated(false);
                        onCloseHistory();
                      }}
                    >
                      <span className={cx("muted")}>{item.expr}</span>
                      <strong>= {item.result}</strong>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                className={cx("link-btn")}
                onClick={() => {
                  setHistory([]);
                  saveHistory([]);
                }}
              >
                Effacer l’historique
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
