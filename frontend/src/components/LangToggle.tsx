// Bouton de langue FR / EN (étape 1 de l'I18N) ; le sélecteur à 10 langues (LanguagePicker) viendra avec les autres langues.
import { FLAGS, setLang, useLang } from '../i18n';

export function LangToggle() {
  const [lang, t] = useLang();
  const next = lang === 'fr' ? 'en' : 'fr';
  return (
    <button type="button" className="lang-toggle" onClick={() => setLang(next)} aria-label={t('lang.switch')} title={t('lang.switch')}>
      <img src={FLAGS[next]} alt="" width={22} height={22} />
      <span lang={next}>{next.toUpperCase()}</span>
    </button>
  );
}
