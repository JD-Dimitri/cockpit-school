/**
 * Illustrations des appareils (vignettes des fiches de choix et fiche de présentation).
 * Images fournies par l'auteur (illustrations générées, 19/11/2026) : ce ne sont pas des photos.
 * Recadrées et réduites (WebP 560 px) ; intégrées au code pour fonctionner aussi dans la version autonome.
 */
import a320 from '../assets/appareils/a320.webp';
import a350 from '../assets/appareils/a350.webp';
import b777 from '../assets/appareils/b777.webp';
import lj60 from '../assets/appareils/lj60.webp';
import c172 from '../assets/appareils/c172.webp';
import h125 from '../assets/appareils/h125.webp';
import r44 from '../assets/appareils/r44.webp';
import s76 from '../assets/appareils/s76.webp';

export const AIRCRAFT_IMAGES: Record<string, string> = { a320, a350, b777, lj60, c172, h125, r44, s76 };
export const IMAGE_CREDIT = 'Illustration générée, pas une photo';
