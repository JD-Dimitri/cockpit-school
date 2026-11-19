/**
 * Simulateur : le moteur d'origine (V10.42.1) tourne tel quel dans un cadre isolé.
 * Rien n'est perdu pendant la migration ; chaque module porté en TypeScript le remplacera ensuite.
 */
export function Simulator() {
  return (
    <section className="sim">
      <iframe
        title="Simulateur PLANE TRAJECTORIES"
        src="legacy/plane-trajectories.html"
        allow="fullscreen; microphone; autoplay"
        allowFullScreen
      />
    </section>
  );
}
