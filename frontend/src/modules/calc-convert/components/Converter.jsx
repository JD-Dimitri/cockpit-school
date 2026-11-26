import { useState } from 'react';
import {
  ArrowLeft, Binary, Box, CalendarDays, Clock, Coins, Gauge, HandCoins,
  HardDrive, Ruler, Scale, Square, Tag, Thermometer, Weight,
} from '../icons.js';
import UnitPanel from './panels/UnitPanel.jsx';
import CurrencyPanel from './panels/CurrencyPanel.jsx';
import FinancePanel from './panels/FinancePanel.jsx';
import DatePanel from './panels/DatePanel.jsx';
import DiscountPanel from './panels/DiscountPanel.jsx';
import NumeralPanel from './panels/NumeralPanel.jsx';
import BmiPanel from './panels/BmiPanel.jsx';
import { cx } from '../lib/cx.js';

/** Les 14 tuiles, dans l'ordre de l'écran du téléphone. */
const TOOLS = [
  { id: 'devise', label: 'Devise', icon: Coins, panel: CurrencyPanel },
  { id: 'longueur', label: 'Longueur', icon: Ruler, unit: true },
  { id: 'masse', label: 'Masse', icon: Weight, unit: true },
  { id: 'aire', label: 'Aire', icon: Square, unit: true },
  { id: 'temps', label: 'Temps', icon: Clock, unit: true },
  { id: 'finance', label: 'Finance', icon: HandCoins, panel: FinancePanel },
  { id: 'donnees', label: 'Données', icon: HardDrive, unit: true },
  { id: 'date', label: 'Date', icon: CalendarDays, panel: DatePanel },
  { id: 'reduction', label: 'Réduction', icon: Tag, panel: DiscountPanel },
  { id: 'volume', label: 'Volume', icon: Box, unit: true },
  { id: 'numeral', label: 'Système numérique', icon: Binary, panel: NumeralPanel },
  { id: 'vitesse', label: 'Vitesse', icon: Gauge, unit: true },
  { id: 'temperature', label: 'Température', icon: Thermometer, unit: true },
  { id: 'imc', label: 'IMC', icon: Scale, panel: BmiPanel },
];

export default function Converter() {
  const [selected, setSelected] = useState(null);
  const tool = TOOLS.find((t) => t.id === selected);

  if (tool) {
    const Panel = tool.panel;
    return (
      <section className={cx("panel")}>
        <div className={cx("panel-head")}>
          <button className={cx("icon-btn")} onClick={() => setSelected(null)} aria-label="Retour">
            <ArrowLeft size={13} />
          </button>
          <h2>{tool.label}</h2>
        </div>
        {tool.unit ? <UnitPanel category={tool.id} /> : <Panel />}
      </section>
    );
  }

  return (
    <section className={cx("tool-grid")}>
      {TOOLS.map(({ id, label, icon: Icon }) => (
        <button key={id} className={cx("tool")} onClick={() => setSelected(id)}>
          <Icon size={22} strokeWidth={1.75} />
          <span>{label}</span>
        </button>
      ))}
    </section>
  );
}
