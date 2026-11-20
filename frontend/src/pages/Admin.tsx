import { useEffect, useState } from 'react';
import { auth, useUser } from '../auth';

/**
 * Espace administrateur : documentation interne « Comment ce projet a été réalisé ? ».
 * En ligne, le texte vient de /api/admin/doc, réservé à ROLE_ADMIN par le serveur (un élève reçoit 403) : il n'est pas
 * dans le code de l'interface. Version autonome (démonstration de l'auteur) : texte intégré au fichier.
 */
export function Admin() {
  const user = useUser();
  const [doc, setDoc] = useState<{ title: string; html: string } | null>(window.__PT_ADMIN_DOC__ ?? null);
  const [err, setErr] = useState('');
  useEffect(() => {
    if (doc || !user || user.demo) return;
    auth.adminDoc().then((r) => (r.ok ? setDoc(r.data) : setErr(r.status === 403 ? 'Espace réservé aux administrateurs.' : r.message)));
  }, [user]);
  useEffect(() => {
    // sommaire : ancres internes sans changer la route (#/admin)
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[data-to]') as HTMLAnchorElement | null;
      if (!a) return;
      e.preventDefault();
      document.getElementById(a.dataset.to!)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  if (user && !user.admin) return <section className="page"><h1>Admin</h1><p>Espace réservé aux administrateurs.</p></section>;
  if (err) return <section className="page"><h1>Admin</h1><p role="alert">{err}</p></section>;
  if (!doc) return <p className="page">Chargement…</p>;
  return (
    <section className="page course admin-doc">
      <p className="crumb">Espace administrateur · documentation interne</p>
      <h1>{doc.title}</h1>
      <article className="body" dangerouslySetInnerHTML={{ __html: doc.html }} />
    </section>
  );
}
