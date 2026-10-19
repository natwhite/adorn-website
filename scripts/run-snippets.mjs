// Runs scripts/snippets.ts with ../adorn's own ts-node (it has the decorator-enabled tsconfig), so the
// homepage outputs are produced by the real library. Paste changed outputs from
// public/assets/snippets.json into index.html.
import {spawnSync} from 'node:child_process';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const adornDir = resolve(process.env.ADORN_DIR ?? resolve(here, '../../adorn'));

const r = spawnSync('npx', ['ts-node', '-P', 'tsconfig.json', '--transpile-only', resolve(here, 'snippets.ts')], {
    cwd: adornDir,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {...process.env, TS_NODE_COMPILER_OPTIONS: JSON.stringify({importHelpers: false})},
});
process.exit(r.status ?? 1);
