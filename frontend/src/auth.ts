/**
 * Comptes élèves : client de l'API Symfony (backend/src/Controller/AuthController.php).
 * La session est un cookie HttpOnly posé par Symfony : aucun jeton n'est stocké dans le navigateur.
 */
import { useEffect, useState } from 'react';

const API = 'api/';

export interface User { email: string; name: string }
export type ApiResult<T = unknown> = { ok: true; data: T } | { ok: false; status: number; message: string };

async function call<T>(path: string, body?: unknown): Promise<ApiResult<T>> {
  let r: Response;
  try {
    r = await fetch(API + path, {
      method: body === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      headers: body === undefined ? { Accept: 'application/json' } : { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    return { ok: false, status: 0, message: 'Serveur injoignable. Vérifiez votre connexion.' };
  }
  let data: any = null;
  try {
    data = await r.json();
  } catch {
    /* réponse sans JSON */
  }
  if (!r.ok) {
    const fallback = r.status === 429 ? 'Trop de tentatives. Réessayez dans quelques minutes.' : `Erreur ${r.status}.`;
    return { ok: false, status: r.status, message: (data && (data.message || data.error)) || fallback };
  }
  return { ok: true, data: data as T };
}

/** L'API répond-elle ? (version autonome ou fichiers statiques seuls : non). */
let health: Promise<boolean> | null = null;
export function apiAvailable(): Promise<boolean> {
  if (location.protocol === 'file:') return Promise.resolve(false);
  health ??= fetch(API + 'health', { headers: { Accept: 'application/json' } })
    .then(async (r) => r.ok && (await r.json()).status === 'ok')
    .catch(() => false);
  return health;
}

export const auth = {
  me: () => call<User>('me'),
  login: (email: string, password: string) => call<User>('login', { email, password }),
  logout: () => call('logout', {}),
  register: (name: string, email: string, password: string) => call<User>('register', { name, email, password }),
  forgot: (email: string) => call<{ message: string }>('password/forgot', { email }),
  reset: (token: string, password: string) => call<{ message: string }>('password/reset', { token, password }),
};

/** Règle de mot de passe, identique côté serveur (Assert\Length(min: 10) + PasswordStrength). */
export function passwordProblem(p: string): string | null {
  if (p.length < 10) return 'Au moins 10 caractères.';
  if (!/[a-zA-Z]/.test(p) || !/[0-9]/.test(p)) return 'Mélangez lettres et chiffres.';
  return null;
}

type Listener = (u: User | null) => void;
const listeners = new Set<Listener>();
let current: User | null | undefined;

export function setUser(u: User | null) {
  current = u;
  listeners.forEach((l) => l(u));
}

/** Utilisateur connecté (null si personne ; undefined pendant la vérification). */
export function useUser(): User | null | undefined {
  const [u, setU] = useState<User | null | undefined>(current);
  useEffect(() => {
    listeners.add(setU);
    if (current === undefined) {
      apiAvailable().then((up) => (up ? auth.me().then((r) => setUser(r.ok ? r.data : null)) : setUser(null)));
    }
    return () => void listeners.delete(setU);
  }, []);
  return u;
}
