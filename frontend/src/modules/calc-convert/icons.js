// Icônes SVG intégrées (remplacent lucide-react dans la version autonome)
import { createElement as h } from 'react';

const make = (children) => ({ size = 24, strokeWidth = 2, ...rest }) =>
  h(
    'svg',
    {
      width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
      strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', role: rest['aria-label'] ? 'img' : undefined,
      'aria-label': rest['aria-label'], 'aria-hidden': rest['aria-label'] ? undefined : true,
    },
    ...children.map(([tag, attrs], i) => h(tag, { key: i, ...attrs })),
  );

const p = (d) => ['path', { d }];
const c = (cx, cy, r) => ['circle', { cx, cy, r }];
const r = (x, y, width, height, rx) => ['rect', { x, y, width, height, rx }];

export const ArrowLeft = make([p('M19 12H5M12 19l-7-7 7-7')]);
export const Binary = make([r(14, 4, 4, 6, 2), r(6, 14, 4, 6, 2), p('M6 4v6M4 4h2M4 10h4M16 14v6M14 14h2M14 20h4')]);
export const Box = make([p('M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8')]);
export const CalendarDays = make([r(3, 4, 18, 18, 2), p('M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01')]);
export const Clock = make([c(12, 12, 10), p('M12 6v6l4 2')]);
export const Coins = make([c(8, 8, 6), p('M18.09 10.37A6 6 0 1 1 10.34 18M7 6h1v4')]);
export const Gauge = make([p('M12 14l4-4M3.34 19a10 10 0 1 1 17.32 0')]);
export const HandCoins = make([c(16, 7, 4), p('M2 15h3l4 2h5a2 2 0 0 0 0-4h-4M2 21h5l6-1 8-5'), p('M16 5.5v3')]);
export const HardDrive = make([p('M22 12H2M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11zM6 16h.01M10 16h.01')]);
export const Ruler = make([p('M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0zM14.5 12.5l2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2')]);
export const Scale = make([r(3, 3, 18, 18, 4), p('M8 10a4 4 0 0 1 8 0M12 10l1.5-2')]);
export const Square = make([r(3, 3, 18, 18, 2), p('M3 7h2M3 17h2M19 7h2M19 17h2')]);
export const Tag = make([p('M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.42l8.7 8.7a2.43 2.43 0 0 0 3.42 0l6.58-6.58a2.43 2.43 0 0 0 0-3.42z'), c(7.5, 7.5, 1)]);
export const Thermometer = make([p('M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0zM18 6h2M18 10h2')]);
export const Weight = make([c(12, 5, 3), p('M6.5 8a2 2 0 0 0-1.9 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.93-2.54L19.4 9.5A2 2 0 0 0 17.48 8z')]);
export const ArrowUpDown = make([p('M7 3v18M3 7l4-4 4 4M17 21V3M13 17l4 4 4-4')]);
export const ArrowLeftRight = make([p('M8 3L4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4')]);
export const Delete = make([p('M10 5a2 2 0 0 0-1.34.52l-5.88 5.48a1.4 1.4 0 0 0 0 2l5.88 5.48A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zM12 9l6 6M18 9l-6 6')]);
export const EllipsisVertical = make([c(12, 5, 1), c(12, 12, 1), c(12, 19, 1)]);
export const X = make([p('M18 6L6 18M6 6l12 12')]);
