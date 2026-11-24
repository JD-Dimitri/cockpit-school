/**
 * Client de l'API Symfony (mode dataSource="api").
 * Toutes les routes sont sous un préfixe configurable, par défaut /api/calc-convert.
 */
export function createHttpApi(baseUrl = '/api/calc-convert') {
  const base = baseUrl.replace(/\/$/, '');

  async function request(path, { body, signal } = {}) {
    let response;
    try {
      response = await fetch(`${base}${path}`, {
        method: body ? 'POST' : 'GET',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        signal,
      });
    } catch (e) {
      if (e.name === 'AbortError') throw e;
      throw new Error('Serveur de calcul injoignable.');
    }

    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error ?? `Erreur serveur (${response.status})`);
    return data;
  }

  return {
    units: () => request('/units'),
    convert: (payload, signal) => request('/convert', { body: payload, signal }),
    currencies: () => request('/currencies'),
    currency: (payload, signal) => request('/currency', { body: payload, signal }),
    numeral: (payload, signal) => request('/numeral', { body: payload, signal }),
    dateDiff: (payload, signal) => request('/date/diff', { body: payload, signal }),
    dateAdd: (payload, signal) => request('/date/add', { body: payload, signal }),
    loan: (payload, signal) => request('/finance/loan', { body: payload, signal }),
    discount: (payload, signal) => request('/discount', { body: payload, signal }),
    bmi: (payload, signal) => request('/bmi', { body: payload, signal }),
  };
}
