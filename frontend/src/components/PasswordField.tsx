/**
 * Champ mot de passe avec un œil pour afficher / masquer la saisie.
 * Accessible : vrai bouton, aria-pressed, libellé qui change, utilisable au clavier ;
 * le curseur reste dans le champ après le clic.
 */
import { useId, useRef, useState } from 'react';

const Eye = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOff = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a10 10 0 0 0 5.4-1.6" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    <path d="M3 3l18 18" />
  </svg>
);

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: 'current-password' | 'new-password';
  hint?: string;
  error?: string | null;
  name?: string;
}

export function PasswordField({ label, value, onChange, autoComplete, hint, error, name = 'password' }: Props) {
  const id = useId();
  const [shown, setShown] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const describedBy = [hint && id + '-hint', error && id + '-err'].filter(Boolean).join(' ') || undefined;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="pw">
        <input
          ref={input}
          id={id}
          name={name}
          type={shown ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          autoCapitalize="off"
          spellCheck={false}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
        <button
          type="button"
          className="eye"
          aria-controls={id}
          aria-pressed={shown}
          aria-label={shown ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          title={shown ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setShown(!shown);
            input.current?.focus();
          }}
        >
          {shown ? <EyeOff /> : <Eye />}
        </button>
      </div>
      {hint && <small id={id + '-hint'} className="hint">{hint}</small>}
      {error && <small id={id + '-err'} className="ferr">{error}</small>}
    </div>
  );
}
