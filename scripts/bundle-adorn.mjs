// Bundles the REAL adorn build (../adorn/dist) into a browser IIFE for the playground, so the site
// demonstrates the library itself rather than a re-implementation that could drift from it.
//
//   npm run bundle            (expects a fresh `npm run build` in ../adorn)
//   ADORN_DIR=path npm run bundle
//
// DEC-097 curated the root surface: the schema projections (toolSchemaFrom, …) the playground calls now
// live on subpaths, not `adorn`. So the entry is a COMBINED one — it re-exports the root plus the four
// documented subpaths (schema/introspection/observe/privacy) into one `window.adorn` global, matching the
// surface the reference documents. The otel/test addons are node-only and deliberately left out. After the
// build we assert the global actually carries every runtime export of each surface, turning an ESM
// `export *` name collision (which would silently drop a symbol) into a hard build failure.
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const adornDir = resolve(process.env.ADORN_DIR ?? resolve(here, '../../adorn'));

// The playground's surface: root + the four documented subpaths. ESM builds give clean named re-exports
// (and a proper warning on any ambiguous name) where the CJS files would need export-synthesis.
const SURFACES = [
    {esm: 'dist/esm/index.mjs', cjs: 'dist/index.js'},
    {esm: 'dist/esm/schema.mjs', cjs: 'dist/schema.js'},
    {esm: 'dist/esm/introspection.mjs', cjs: 'dist/introspection.js'},
    {esm: 'dist/esm/observe.mjs', cjs: 'dist/observe.js'},
    {esm: 'dist/esm/privacy.mjs', cjs: 'dist/privacy.js'},
];

for (const s of SURFACES) {
    if (!existsSync(resolve(adornDir, s.esm))) {
        console.error(`No adorn build at ${resolve(adornDir, s.esm)}. Run \`npm run build\` in ${adornDir} first.`);
        process.exit(1);
    }
}

const pkg = JSON.parse(readFileSync(resolve(adornDir, 'package.json'), 'utf8'));
const out = resolve(here, '../public/vendor/adorn.browser.js');

const entryContents = SURFACES.map((s) => `export * from ${JSON.stringify(resolve(adornDir, s.esm))};`).join('\n');

const result = await build({
    stdin: {contents: entryContents, resolveDir: adornDir, sourcefile: 'adorn-playground-entry.mjs', loader: 'js'},
    outfile: out,
    bundle: true,
    format: 'iife',
    globalName: 'adorn',
    platform: 'browser',
    target: 'es2020',
    minify: true,
    legalComments: 'none',
    logLevel: 'warning',
    // Production mode would silence the dev-time diagnostics the playground is happy to show.
    define: {'process.env.NODE_ENV': '"development"'},
    banner: {js: `/* adorn ${pkg.version} (MIT) — bundled from dist/ for the adorn website playground. */`},
});
for (const w of result.warnings) {
    if (/export|ambiguous|duplicate/i.test(w.text)) {
        console.error(`bundle warning looks like a dropped export: ${w.text}`);
        process.exit(1);
    }
}

// Post-build guarantee: the global carries every documented runtime export of every surface.
const require = createRequire(resolve(adornDir, 'package.json'));
const sandbox = {};
vm.runInNewContext(readFileSync(out, 'utf8'), sandbox);
const globalLib = sandbox.adorn;
const missing = [];
for (const s of SURFACES) {
    const mod = require(resolve(adornDir, s.cjs));
    for (const name of Object.keys(mod)) {
        if (name === '__esModule') continue;
        if (!(name in globalLib)) missing.push(`${s.cjs}:${name}`);
    }
}
if (missing.length) {
    console.error(`bundle global is missing exports (ESM \`export *\` collision?):\n  ` + missing.join('\n  '));
    process.exit(1);
}

writeFileSync(
    resolve(here, '../public/vendor/adorn.version.json'),
    JSON.stringify({version: pkg.version, bundledAt: new Date().toISOString().slice(0, 10)}, null, 2) + '\n',
);
console.log(`bundled adorn ${pkg.version} -> ${out} (${Object.keys(globalLib).length} exports on window.adorn)`);
