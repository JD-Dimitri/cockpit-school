declare module '*.webp' {
  const url: string;
  export default url;
}
declare module '*.svg' {
  const text: string;
  export default text;
}
// textes bruts (bibliothèques tierces injectées dans le moteur d'origine, ex. Leaflet)
declare module '*.txt' {
  const content: string;
  export default content;
}
