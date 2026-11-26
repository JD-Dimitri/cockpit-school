// Point d'entrée du module : import CalcConvertWidget from './calc-convert';
export { default } from './CalcConvertWidget.jsx';
export { default as CalcConvertWidget } from './CalcConvertWidget.jsx';

// Moteurs réutilisables sans interface (ex. dans la logique du simulateur)
export { evaluate, formatNumber } from './lib/expression.js';
export { localApi } from './lib/localApi.js';
export { createHttpApi } from './lib/httpApi.js';

// Données de l'onglet Aviation (formules, étapes du vol), réutilisables par le simulateur
export { FORMULAS as AVIATION_FORMULAS, PHASES as AVIATION_PHASES, GROUPS as AVIATION_GROUPS } from './lib/aviation/index.js';
