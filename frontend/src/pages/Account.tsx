/** Pages de compte : connexion, inscription, mot de passe oublié, réinitialisation. */
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { apiAvailable, auth, goAfterLogin, passwordProblem, setUser, useUser } from '../auth';
import { PasswordField } from '../components/PasswordField';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Message honnête quand l'API n'est pas joignable (version autonome, fichiers statiques). */
function useApi(): boolean | null {
  const [up, setUp] = useState<boolean | null>(null);
  useEffect(() => void apiAvailable().then(setUp), []);
  return up;
}

function Shell({ title, children, up }: { title: string; children: ReactNode; up: boolean | null }) {
  return (
    <section className="page auth">
      <h1>{title}</h1>
      {up === false && (
        <p className="notice" role="status">
          Les comptes élèves passent par le serveur de la version Pro, qui n'est pas joignable ici (version autonome ou
          hors ligne). Le simulateur et les cours restent utilisables sans compte.
        </p>
      )}
      {children}
    </section>
  );
}

function Status({ msg, kind }: { msg: string | null; kind: 'err' | 'ok' }) {
  return (
    <p className={kind === 'err' ? 'ferr big' : 'fok'} role={kind === 'err' ? 'alert' : 'status'} aria-live="polite">
      {msg}
    </p>
  );
}

export function Login() {
  const up = useApi();
  const user = useUser();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (user && !user.demo) {
    return (
      <Shell title="Connexion" up={up}>
        <p>Connecté en tant que <b>{user.name || user.email}</b>.</p>
        <button className="btn" onClick={() => auth.logout().then(() => { setUser(null); location.hash = '#/'; })}>Se déconnecter</button>
      </Shell>
    );
  }
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL.test(email)) return setErr('Adresse e-mail invalide.');
    if (!pw) return setErr('Saisissez votre mot de passe.');
    setBusy(true);
    setErr(null);
    const r = await auth.login(email.trim(), pw);
    setBusy(false);
    if (r.ok) {
      setUser(r.data);
      goAfterLogin();
    } else setErr(r.status === 401 ? 'E-mail ou mot de passe incorrect.' : r.message);
  };
  return (
    <Shell title="Connexion" up={up}>
      <form className="form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="login-email">Adresse e-mail</label>
          <input id="login-email" name="email" type="email" autoComplete="username" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <PasswordField label="Mot de passe" value={pw} onChange={setPw} autoComplete="current-password" />
        <p className="aside"><a href="#/mot-de-passe-oublie">Mot de passe oublié ?</a></p>
        <Status msg={err} kind="err" />
        <button className="btn" type="submit" disabled={busy || up === false}>{busy ? 'Connexion…' : 'Se connecter'}</button>
      </form>
      <p className="aside">Pas encore de compte ? <a href="#/inscription">Créer un compte</a></p>
    </Shell>
  );
}

export function Register() {
  const up = useApi();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const pwErr = pw ? passwordProblem(pw) : null;
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setErr('Indiquez votre prénom ou un pseudonyme.');
    if (!EMAIL.test(email)) return setErr('Adresse e-mail invalide.');
    const p = passwordProblem(pw);
    if (p) return setErr('Mot de passe : ' + p);
    if (pw !== pw2) return setErr('Les deux mots de passe ne sont pas identiques.');
    setBusy(true);
    setErr(null);
    const r = await auth.register(name.trim(), email.trim(), pw);
    setBusy(false);
    if (r.ok) {
      setUser(r.data);
      goAfterLogin();
    } else setErr(r.message);
  };
  return (
    <Shell title="Créer un compte" up={up}>
      <form className="form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="reg-name">Prénom ou pseudonyme</label>
          <input id="reg-name" name="name" autoComplete="nickname" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="reg-email">Adresse e-mail</label>
          <input id="reg-email" name="email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <PasswordField label="Mot de passe" value={pw} onChange={setPw} autoComplete="new-password" hint="Au moins 10 caractères, lettres et chiffres." error={pwErr} />
        <PasswordField label="Confirmer le mot de passe" name="password2" value={pw2} onChange={setPw2} autoComplete="new-password" error={pw2 && pw2 !== pw ? 'Différent du premier.' : null} />
        <Status msg={err} kind="err" />
        <button className="btn" type="submit" disabled={busy || up === false}>{busy ? 'Création…' : 'Créer mon compte'}</button>
      </form>
      <p className="aside">Déjà inscrit ? <a href="#/connexion">Se connecter</a></p>
    </Shell>
  );
}

export function Forgot() {
  const up = useApi();
  const [email, setEmail] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL.test(email)) return setErr('Adresse e-mail invalide.');
    setBusy(true);
    setErr(null);
    const r = await auth.forgot(email.trim());
    setBusy(false);
    // Même réponse que l'adresse existe ou non : on ne révèle pas qui a un compte.
    if (r.ok || r.status === 404) setSent(true);
    else setErr(r.message);
  };
  return (
    <Shell title="Mot de passe oublié" up={up}>
      {sent ? (
        <p className="fok" role="status">
          Si un compte existe pour cette adresse, un e-mail vient d'être envoyé avec un lien de réinitialisation. Le lien
          est valable 1 heure et ne sert qu'une fois.
        </p>
      ) : (
        <form className="form" onSubmit={submit} noValidate>
          <p>Indiquez l'adresse de votre compte : vous recevrez un lien pour choisir un nouveau mot de passe.</p>
          <div className="field">
            <label htmlFor="fg-email">Adresse e-mail</label>
            <input id="fg-email" name="email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <Status msg={err} kind="err" />
          <button className="btn" type="submit" disabled={busy || up === false}>{busy ? 'Envoi…' : 'Recevoir le lien'}</button>
        </form>
      )}
      <p className="aside"><a href="#/connexion">Retour à la connexion</a></p>
    </Shell>
  );
}

export function Reset({ token }: { token?: string }) {
  const up = useApi();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const p = passwordProblem(pw);
    if (p) return setErr('Mot de passe : ' + p);
    if (pw !== pw2) return setErr('Les deux mots de passe ne sont pas identiques.');
    setBusy(true);
    setErr(null);
    const r = await auth.reset(token ?? '', pw);
    setBusy(false);
    if (r.ok) setDone(true);
    else setErr(r.status === 400 || r.status === 404 ? 'Ce lien est invalide ou expiré. Demandez-en un nouveau.' : r.message);
  };
  if (!token) {
    return (
      <Shell title="Nouveau mot de passe" up={up}>
        <p className="ferr big" role="alert">Lien incomplet.</p>
        <p className="aside"><a href="#/mot-de-passe-oublie">Demander un nouveau lien</a></p>
      </Shell>
    );
  }
  return (
    <Shell title="Nouveau mot de passe" up={up}>
      {done ? (
        <p className="fok" role="status">Mot de passe changé. <a href="#/connexion">Se connecter</a></p>
      ) : (
        <form className="form" onSubmit={submit} noValidate>
          <PasswordField label="Nouveau mot de passe" value={pw} onChange={setPw} autoComplete="new-password" hint="Au moins 10 caractères, lettres et chiffres." error={pw ? passwordProblem(pw) : null} />
          <PasswordField label="Confirmer" name="password2" value={pw2} onChange={setPw2} autoComplete="new-password" error={pw2 && pw2 !== pw ? 'Différent du premier.' : null} />
          <Status msg={err} kind="err" />
          <button className="btn" type="submit" disabled={busy || up === false}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
        </form>
      )}
    </Shell>
  );
}
