// Traduction de l'interface (I18N, demande de l'auteur du 24/11/2026 : « go i18n », « Fais anglais »).
// Étape 1 : français et anglais pour l'en-tête, les menus, le bandeau et le pied de page. Les autres langues et le reste
// des textes (moteur, cours, documents) suivront. La langue choisie est mémorisée (clé « cs-lang »).
import { useEffect, useState } from 'react';
import frFlag from '../assets/flags/fr.svg';
import enFlag from '../assets/flags/en.svg';

export type Lang = 'fr' | 'en';
const KEY = 'cs-lang';
export const FLAGS: Record<Lang, string> = {
  fr: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(frFlag),
  en: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(enFlag),
};

const T = {
  fr: {
    'nav.simulateur': 'Simulateur', 'nav.cours': 'Cours', 'nav.admin': 'Admin', 'nav.signup': 'Créer un compte', 'nav.login': 'Connexion', 'demo.user': 'Démonstration hors ligne',
    'nav.aria': 'Navigation principale', 'lang.switch': 'Langue : English', 'loading': 'Chargement…', 'login.required': 'Connexion requise…',
    'demo': "Version de démonstration hors ligne (sans compte), réservée aux essais. En ligne, le simulateur et les cours s'ouvrent après connexion.",
    'foot': 'Simulateur pédagogique : ne pas utiliser pour la navigation réelle. Données : statuts [RÉFÉRENCÉ] / [ESTIMÉ] / [SIMULÉ] affichés là où elles servent.',
  },
  en: {
    'nav.simulateur': 'Simulator', 'nav.cours': 'Courses', 'nav.admin': 'Admin', 'nav.signup': 'Create an account', 'nav.login': 'Log in', 'demo.user': 'Offline demo',
    'nav.aria': 'Main navigation', 'lang.switch': 'Language: Français', 'loading': 'Loading…', 'login.required': 'Login required…',
    'demo': 'Offline demonstration version (no account), for testing only. Online, the simulator and the courses open after logging in.',
    'foot': 'Training simulator: not for real-world navigation. Data: [REFERENCED] / [ESTIMATED] / [SIMULATED] status shown where it is used.',
  },
} as const;
export type Key = keyof typeof T.fr;

function stored(): Lang { try { return localStorage.getItem(KEY) === 'en' ? 'en' : 'fr'; } catch { return 'fr'; } }
let current: Lang = stored();
const subs = new Set<(l: Lang) => void>();

export function setLang(l: Lang) {
  current = l;
  try { localStorage.setItem(KEY, l); } catch { /* mémoire seulement */ }
  document.documentElement.lang = l;
  subs.forEach((f) => f(l));
}
/** Langue active + fonction de traduction ; le composant se redessine quand la langue change. */
export function useLang(): [Lang, (k: Key) => string] {
  const [l, set] = useState<Lang>(current);
  useEffect(() => { subs.add(set); document.documentElement.lang = current; return () => { subs.delete(set); }; }, []);
  return [l, (k: Key) => T[l][k] ?? T.fr[k]];
}
