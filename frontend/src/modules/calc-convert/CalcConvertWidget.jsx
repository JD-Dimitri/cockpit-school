import { useMemo, useState } from 'react';
import { EllipsisVertical, X } from './icons.js';
import Calculator from './components/Calculator.jsx';
import Converter from './components/Converter.jsx';
import AviationTab from './components/aviation/AviationTab.jsx';
import { CalcApiContext } from './lib/apiContext.js';
import { createHttpApi } from './lib/httpApi.js';
import { localApi } from './lib/localApi.js';
import { cx } from './lib/cx.js';
import './calc-convert.css';

const TABS = [
  { id: 'calculator', label: 'Calculatrice' },
  { id: 'converter', label: 'Convertisseur' },
  { id: 'aviation', label: 'Aviation' },
];

/**
 * Calculatrice scientifique + 14 convertisseurs + onglet Aviation, prêts à intégrer.
 *
 * Le widget remplit son conteneur : donne-lui une hauteur (ex. 640px ou 100%).
 *
 * @param {object}   props
 * @param {'local'|'api'} [props.dataSource='local'] 'local' : tout est calculé dans le navigateur (aucun serveur).
 *                                                    'api'   : les conversions passent par l'API Symfony.
 * @param {string}   [props.apiBaseUrl='/api/calc-convert'] préfixe des routes Symfony (mode 'api')
 * @param {'calculator'|'converter'|'aviation'} [props.initialTab='calculator']
 * @param {'cours'|'simulateur'} [props.variant='cours'] onglet Aviation : 'cours' = formules + mini-cours, annexes,
 *                                                    exemples et exercices corrigés ; 'simulateur' = formules et calculateurs seuls
 * @param {Array<'calculator'|'converter'|'aviation'>} [props.tabs] onglets visibles (par défaut les trois)
 * @param {() => void} [props.onClose] si fourni, affiche un bouton ✕ (utile dans une fenêtre du cockpit)
 * @param {string}   [props.className] classe ajoutée sur la racine
 * @param {object}   [props.style]     style ajouté sur la racine (ex. { height: 640 })
 */
export default function CalcConvertWidget({
  dataSource = 'local',
  apiBaseUrl = '/api/calc-convert',
  initialTab = 'calculator',
  variant = 'cours',
  tabs = ['calculator', 'converter', 'aviation'],
  onClose,
  className = '',
  style,
}) {
  const [tab, setTab] = useState(tabs.includes(initialTab) ? initialTab : tabs[0]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const api = useMemo(
    () => (dataSource === 'api' ? createHttpApi(apiBaseUrl) : localApi),
    [dataSource, apiBaseUrl],
  );

  return (
    <CalcApiContext.Provider value={api}>
      <div className={`cc-root ${className}`.trim()} style={style}>
        <div className={cx('app')}>
          <header className={cx('topbar')}>
            <nav className={cx('tabs')} aria-label="Mode">
              {TABS.filter((t) => tabs.includes(t.id)).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={cx(`tab ${tab === t.id ? 'active' : ''}`)}
                  onClick={() => {
                    setTab(t.id);
                    if (t.id !== 'calculator') setHistoryOpen(false);
                  }}
                >
                  {t.label}
                </button>
              ))}
            </nav>
            <div className={cx('actions')}>
              {tabs.includes('calculator') && (
              <button
                type="button"
                className={cx('icon-btn')}
                aria-label="Historique"
                onClick={() => {
                  setTab('calculator');
                  setHistoryOpen((open) => !open);
                }}
              >
                <EllipsisVertical size={13} />
              </button>
              )}
              {onClose && (
                <button type="button" className={cx('icon-btn')} aria-label="Fermer la calculatrice" onClick={onClose}>
                  <X size={13} />
                </button>
              )}
            </div>
          </header>

          <main className={cx('content')}>
            {tab === 'calculator' && <Calculator historyOpen={historyOpen} onCloseHistory={() => setHistoryOpen(false)} />}
            {tab === 'converter' && <Converter />}
            {tab === 'aviation' && <AviationTab variant={variant} />}
          </main>
        </div>
      </div>
    </CalcApiContext.Provider>
  );
}
