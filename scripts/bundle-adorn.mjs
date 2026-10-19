// Bundles the REAL adorn build (../adorn/dist) into a browser IIFE for the playground, so the site
// demonstrates the library itself rather than a re-implementation that could drift from it.
//
//   npm run bundle            (expects a fresh `npm run build` in ../adorn)
//   ADORN_DIR=path npm run bundle
import {build} from 'esbuild';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const adornDir = resolve(process.env.ADORN_DIR ?? resolve(here, '../../adorn'));
const entry = resolve(adornDir, 'dist/index.js');
if (!existsSync(entry)) {
    console.error(`No adorn build at ${entry}. Run \`npm run build\` in ${adornDir} first.`);
    process.exit(1);
}

const pkg = JSON.parse(readFileSync(resolve(adornDir, 'package.json'), 'utf8'));
const out = resolve(here, '../public/vendor/adorn.browser.js');

await build({
    entryPoints: [entry],
    outfile: out,
    bundle: true,
    format: 'iife',
    globalName: 'adorn',
    platform: 'browser',
    target: 'es2020',
    minify: true,
    legalComments: 'none',
    // Production mode would silence the dev-time diagnostics the playground is happy to show.
    define: {'process.env.NODE_ENV': '"development"'},
    banner: {js: `/* adorn ${pkg.version} (MIT) — bundled from dist/ for the adorn website playground. */`},
});

writeFileSync(
    resolve(here, '../public/vendor/adorn.version.json'),
    JSON.stringify({version: pkg.version, bundledAt: new Date().toISOString().slice(0, 10)}, null, 2) + '\n',
);
console.log(`bundled adorn ${pkg.version} -> ${out}`);
