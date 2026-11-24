// Déclarations TypeScript du module (écrit en JavaScript, non réécrit : voir INSTRUCTIONS d'intégration).
import type { CSSProperties, ReactElement } from 'react';
export interface CalcConvertProps {
  dataSource?: 'local' | 'api';
  apiBaseUrl?: string;
  initialTab?: 'calculator' | 'converter' | 'aviation';
  variant?: 'cours' | 'simulateur';
  tabs?: Array<'calculator' | 'converter' | 'aviation'>;
  onClose?: () => void;
  className?: string;
  style?: CSSProperties;
}
declare function CalcConvertWidget(props: CalcConvertProps): ReactElement;
export default CalcConvertWidget;
export { CalcConvertWidget };
export function evaluate(expression: string, mode?: 'deg' | 'rad'): number;
export function formatNumber(n: number): string;
export const localApi: unknown;
export const AVIATION_FORMULAS: unknown[];
export const AVIATION_PHASES: unknown[];
export const AVIATION_GROUPS: unknown[];
