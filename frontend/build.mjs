// Construction de l'interface : esbuild (TypeScript + JSX) → dist/
// - dist/app.js, dist/app.css, dist/index.html
// - dist/data/   : copie de ../data (JSON extraits du moteur d'origine)
// - dist/legacy/ : moteur d'origine V10.42.1, lancé tel quel dans l'onglet « Simulateur »
//
// Variables facultatives (environnement sans accès au registre npm) :
//   ESBUILD=<chemin de esbuild/lib/main.js>   NODE_DIRS=<dossier node_modules>   THREE_PATH=<three.min.js r128>
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const esbuild = await import(process.env.ESBUILD || 'esbuild');
const out = resolve(here, 'dist');
const watch = process.argv.includes('--watch');

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(resolve(here, '../data'), resolve(out, 'data'), { recursive: true });
cpSync(resolve(here, '../legacy'), resolve(out, 'legacy'), { recursive: true });
writeFileSync(resolve(out, 'index.html'), readFileSync(resolve(here, 'index.html'), 'utf8'));

const opts = {
  entryPoints: [resolve(here, 'src/main.tsx')],
  bundle: true,
  format: 'esm',
  target: 'es2022',
  outfile: resolve(out, 'app.js'),
  minify: !watch,
  sourcemap: true,
  jsx: 'automatic',
  loader: { '.svg': 'text' },
  define: { 'process.env.NODE_ENV': watch ? '"development"' : '"production"' },
  nodePaths: process.env.NODE_DIRS ? [process.env.NODE_DIRS] : [],
  alias: process.env.THREE_PATH ? { three: process.env.THREE_PATH } : {},
  logLevel: 'info',
};

if (watch) {
  const ctx = await esbuild.context(opts);
  await ctx.watch();
} else {
  await esbuild.build(opts);
}
