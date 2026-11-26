/**
 * Préfixe chaque classe CSS par "cc-" : cx('key accent on') -> 'cc-key cc-accent cc-on'.
 * Ainsi le widget n'entre jamais en conflit avec les classes du projet hôte (.display, .panel, .key...).
 */
export const cx = (classes) =>
  String(classes ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .map((c) => `cc-${c}`)
    .join(' ');
