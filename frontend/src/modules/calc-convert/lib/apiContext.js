import { createContext, useContext } from 'react';
import { localApi } from './localApi.js';

/**
 * Fournit aux panneaux la source de calcul choisie par le widget :
 * localApi (calcul dans le navigateur, par défaut) ou l'API Symfony (createHttpApi).
 */
export const CalcApiContext = createContext(localApi);

export const useCalcApi = () => useContext(CalcApiContext);
