// Sélecteur de langue (I18N étape 2, 26/11/2026) : drapeau rond de la langue active ; un toucher déploie verticalement
// les 9 autres drapeaux ronds (« les drapeaux O déployables verticalement à droite »). Échap ou toucher ailleurs : referme.
import { useEffect, useRef, useState } from 'react';
import { FLAGS, LANGS, setLang, useLang, type Lang } from '../i18n';

export function LangToggle() {
  const [lang, t] = useLang();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const cur = LANGS.find((x) => x.code === lang) ?? LANGS[0];

  useEffect(() => {
    if (!open) return;
    const out = (e: PointerEvent) => { if (e.target instanceof Node && !root.current?.contains(e.target)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', out);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', out); document.removeEventListener('keydown', esc); };
  }, [open]);

  const pick = (l: Lang) => { setLang(l); setOpen(false); };
  return (
    <div className={open ? 'lang-toggle open' : 'lang-toggle'} ref={root}>
      <button type="button" className="lang-cur" aria-haspopup="listbox" aria-expanded={open}
        aria-label={t('lang.label') + ' : ' + cur.name} title={t('lang.label') + ' : ' + cur.name} onClick={() => setOpen(!open)}>
        <img src={FLAGS[lang]} alt="" width={30} height={30} />
      </button>
      {open && (
        <ul className="lang-list" role="listbox" aria-label={t('lang.label')}>
          {LANGS.filter((x) => x.code !== lang).map((x) => (
            <li key={x.code} role="option" aria-selected={false}>
              <button type="button" onClick={() => pick(x.code)} title={x.name} aria-label={x.name} lang={x.code}>
                <img src={FLAGS[x.code]} alt="" width={30} height={30} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
