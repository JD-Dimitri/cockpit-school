import { useEffect, useState } from 'react';

/**
 * Appelle l'API quand les paramètres changent, avec :
 *  - un délai de 300 ms (on n'appelle pas à chaque frappe),
 *  - l'annulation de la requête précédente (AbortController),
 *  - la gestion du chargement et des erreurs.
 *
 * @param {(signal: AbortSignal) => Promise<any>} call  la requête à lancer
 * @param {any[]} deps                                  ce qui déclenche un nouvel appel
 * @param {boolean} enabled                             false si la saisie est incomplète
 */
export function useApiResult(call, deps, enabled = true) {
  const [state, setState] = useState({ data: null, error: null, loading: false });

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, error: null, loading: false });
      return undefined;
    }

    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true }));

    const timer = setTimeout(() => {
      call(controller.signal)
        .then((data) => setState({ data, error: null, loading: false }))
        .catch((error) => {
          if (error.name !== 'AbortError') setState({ data: null, error: error.message, loading: false });
        });
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled]);

  return state;
}

/** "12,5" ou "12.5" -> 12.5 ; chaîne vide ou invalide -> null */
export function parseInput(text) {
  const cleaned = String(text).replace(/\s/g, '').replace(',', '.');
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}
