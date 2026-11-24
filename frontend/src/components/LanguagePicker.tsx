import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import './LanguagePicker.css';

export const LANGUAGES = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'es', name: 'Español' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ar', name: 'العربية' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

const STORAGE_KEY = 'cs-lang';
const DEFAULT_LANGUAGE: LanguageCode = 'fr';

interface LanguagePickerProps {
  onChange: (language: LanguageCode) => void;
  /** Default for Vite at the site root; override for a subdirectory. */
  flagsBaseUrl?: string;
}

/** Also usable by the parent to initialize its own language state. */
export function getStoredLanguage(): LanguageCode {
  try {
    const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
    const match = LANGUAGES.find((language) => language.code === savedLanguage);
    return match?.code ?? DEFAULT_LANGUAGE;
  } catch {
    // Storage may be unavailable or blocked. The picker remains usable.
    return DEFAULT_LANGUAGE;
  }
}

export default function LanguagePicker({
  onChange,
  flagsBaseUrl = '/flags',
}: LanguagePickerProps) {
  const [language, setLanguage] = useState<LanguageCode>(getStoredLanguage);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);
  const listboxId = useId();

  const activeIndex = LANGUAGES.findIndex((item) => item.code === language);
  const activeLanguage = LANGUAGES[activeIndex];
  const flagUrl = (code: LanguageCode) => `${flagsBaseUrl.replace(/\/$/, '')}/${code}.svg`;

  // Move actual DOM focus when the popup opens or a keyboard arrow is used.
  useEffect(() => {
    if (isOpen) optionRefs.current[focusedIndex]?.focus();
  }, [isOpen, focusedIndex]);

  // Close the popup on outside interaction without stealing the new focus.
  useEffect(() => {
    if (!isOpen) return;
    function handleOutsidePointer(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('pointerdown', handleOutsidePointer);
    return () => document.removeEventListener('pointerdown', handleOutsidePointer);
  }, [isOpen]);

  function openPicker(index = activeIndex) {
    setFocusedIndex(index);
    setIsOpen(true);
  }

  function closePicker() {
    setIsOpen(false);
    buttonRef.current?.focus();
  }

  function chooseLanguage(nextLanguage: LanguageCode) {
    setLanguage(nextLanguage);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    } catch {
      // Keep the selection in memory even when persistence fails.
    }
    closePicker();
    // No translation, navigation or document language change at this stage.
    onChange(nextLanguage);
  }

  function handleButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openPicker();
    } else if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      closePicker();
    }
    // Native button handles Enter and Space through onClick.
  }

  function handleListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex((index) => (index + 1) % LANGUAGES.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex((index) => (index - 1 + LANGUAGES.length) % LANGUAGES.length);
        break;
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setFocusedIndex(LANGUAGES.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        chooseLanguage(LANGUAGES[focusedIndex].code);
        break;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        closePicker();
        break;
      // Tab remains native. The root's onBlur closes on focus leaving.
    }
  }

  return (
    <div
      className="cs-language-picker"
      ref={rootRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className="cs-language-picker__trigger"
        aria-label="Choisir la langue"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        title={activeLanguage.name}
        onKeyDown={handleButtonKeyDown}
        onClick={() => (isOpen ? closePicker() : openPicker())}
      >
        <img src={flagUrl(language)} width={32} height={32} alt="" />
      </button>
      {isOpen && (
        <ul
          id={listboxId}
          className="cs-language-picker__list"
          role="listbox"
          aria-label="Langues disponibles"
          onKeyDown={handleListKeyDown}
        >
          {LANGUAGES.map((item, index) => (
            <li
              key={item.code}
              ref={(element) => { optionRefs.current[index] = element; }}
              role="option"
              aria-selected={item.code === language}
              tabIndex={index === focusedIndex ? 0 : -1}
              className="cs-language-picker__option"
              onFocus={() => setFocusedIndex(index)}
              onClick={() => chooseLanguage(item.code)}
            >
              <img src={flagUrl(item.code)} width={24} height={24} alt="" />
              <span lang={item.code} dir={item.code === 'ar' ? 'rtl' : 'ltr'}>
                {item.name}
              </span>
              {item.code === language && <span aria-hidden="true">✓</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
