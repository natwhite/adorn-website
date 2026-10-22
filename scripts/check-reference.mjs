// Fails if the site's API index (public/reference-data.js) drifts from the library: every runtime export
// of adorn, adorn/schema, adorn/introspection, adorn/observe, adorn/privacy, adorn/test and adorn/otel
// must have exactly one entry, and no entry may name a non-export.
//
//   npm run check
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const adornDir = resolve(process.env.ADORN_DIR ?? resolve(here, '../../adorn'));
const require = createRequire(resolve(adornDir, 'package.json'));

const modules = {
    adorn: require(resolve(adornDir, 'dist/index.js')),
    'adorn/schema': require(resolve(adornDir, 'dist/schema.js')),
    'adorn/introspection': require(resolve(adornDir, 'dist/introspection.js')),
    'adorn/observe': require(resolve(adornDir, 'dist/observe.js')),
    'adorn/privacy': require(resolve(adornDir, 'dist/privacy.js')),
    'adorn/test': require(resolve(adornDir, 'dist/addons/test/index.js')),
    'adorn/otel': require(resolve(adornDir, 'dist/addons/otel/index.js')),
};

const sandbox = {window: {}};
vm.runInNewContext(readFileSync(resolve(here, '../public/reference-data.js'), 'utf8'), sandbox);
const entries = sandbox.window.ADORN_REFERENCE;
const categories = sandbox.window.ADORN_REFERENCE_CATEGORIES;

const problems = [];
const seen = new Set();
for (const e of entries) {
    const key = `${e.module}:${e.name}`;
    if (seen.has(key)) problems.push(`duplicate entry ${key}`);
    seen.add(key);
    if (!modules[e.module]) problems.push(`${key}: unknown module`);
    else if (!(e.name in modules[e.module])) problems.push(`${key}: documented but not exported`);
    if (!categories[e.cat]) problems.push(`${key}: unknown category '${e.cat}'`);
}
for (const [mod, exports] of Object.entries(modules)) {
    for (const name of Object.keys(exports)) {
        if (name === '__esModule') continue;
        if (!seen.has(`${mod}:${name}`)) problems.push(`${mod}:${name}: exported but not documented`);
    }
}

const pkgVersion = JSON.parse(readFileSync(resolve(adornDir, 'package.json'), 'utf8')).version;

if (problems.length) {
    console.error(`reference check failed (${problems.length}):\n  ` + problems.join('\n  '));
    process.exit(1);
}
console.log(`reference check ok: ${entries.length} entries match the runtime surface of adorn ${pkgVersion}`);
