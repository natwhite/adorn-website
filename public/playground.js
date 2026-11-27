// The playground page embeds a real StackBlitz sandbox that installs adorn from npm and runs it in a Node
// toolchain (decorators included). The project files are defined here, so the demo is version-controlled with
// the site rather than living in a saved fiddle, and there is no bundled copy of the library to drift from it.
(function () {
  'use strict';

  const mount = document.getElementById('sbEmbed');
  if (!mount) return;

  const sdk = window.StackBlitzSDK;
  const fallback = document.getElementById('sbFallback');
  const fallbackLink = document.getElementById('sbFallbackLink');
  const openBtn = document.getElementById('sbOpen');

  // The npm package name and version. If adorn ever moves (a scope, a rename), change it here only.
  const PKG = 'adorn';
  const VERSION = '0.3.0';

  // The toolbar note names the installed version from this one constant, so the two can't disagree.
  const versionNote = document.getElementById('sbVersion');
  if (versionNote) versionNote.textContent = PKG + '@' + VERSION;

  function showFallback() {
    if (fallback) fallback.hidden = false;
  }

  if (!sdk) { showFallback(); return; }

  // The demo: one decorated declaration, then the artifacts derived from it. String concatenation (not
  // template literals) in the body keeps this source free of backticks so it nests cleanly here.
  const indexTs = [
    "import {",
    "    Contract, Describe, NotEmpty, OneOf,",
    "    GreaterThanEqual, LessThanEqual, Verify, Contracts,",
    "} from 'adorn';",
    "import { toolSchemaForMethod } from 'adorn/schema';",
    "",
    "// One declaration: the contract. The runtime check, the JSON Schema, the docs",
    "// and an LLM tool schema are all derived from it, so they can't drift apart.",
    "@Contract()",
    "class WeatherService {",
    "    getWeather(",
    "        @Describe('the city to look up') @NotEmpty() location: string,",
    "        @OneOf(['celsius', 'fahrenheit']) unit: string,",
    "        @GreaterThanEqual(1) @LessThanEqual(7) days: number,",
    "    ): string {",
    "        // the body only ever sees valid arguments",
    "        return days + '-day forecast for ' + location + ' in ' + unit;",
    "    }",
    "}",
    "",
    "const weather = new WeatherService();",
    "",
    "// 1 — a valid call runs the body:",
    "console.log('VALID    -> ' + weather.getWeather('Lisbon', 'celsius', 3));",
    "",
    "// 2 — a caller asks for 99 days: rejected before the body runs,",
    "//     with the value redacted by default.",
    "try {",
    "    weather.getWeather('Lisbon', 'celsius', 99);",
    "} catch (err) {",
    "    console.log('\\nREJECTED -> ' + (err as Error).message);",
    "}",
    "",
    "// 3 — one derived artifact: the tool schema a function-calling API reads.",
    "//     The description is given here, at the projection call site.",
    "console.log('\\nTOOL SCHEMA\\n' + JSON.stringify(",
    "    toolSchemaForMethod(WeatherService, 'getWeather', {",
    "        description: 'Look up a weather forecast.',",
    "    }), null, 2,",
    "));",
    "",
    "// The same constraints without a decoration point (the descriptor-first path).",
    "// { extra: 'reject' } makes the object exact: an undeclared key is refused too.",
    "const params = {",
    "    location: Contracts.string.notEmpty(),",
    "    unit: Contracts.enum(['celsius', 'fahrenheit']),",
    "    days: Contracts.number.between(1, 7),",
    "};",
    "const args = Contracts.object(params, { extra: 'reject' });",
    "",
    "const replies = [",
    "    { location: 'Oslo', unit: 'celsius', days: 2 },",
    "    { location: 'Oslo', unit: 'kelvin', days: 2 },",
    "    { location: 'Oslo', unit: 'celsius', days: 2, debug: true },",
    "];",
    "for (const reply of replies) {",
    "    const r = Verify.check(args, 'args', reply);",
    "    console.log('\\nCHECK    -> ' + (r.ok",
    "        ? 'ok: ' + JSON.stringify(r.value)",
    "        : 'refused at ' + JSON.stringify(r.path) + ': expected ' + r.expected));",
    "}",
    "",
    "// Edit a constraint — say @LessThanEqual(7) -> 14, or Between(1, 7) -> Between(1, 14) —",
    "// or change an argument, then save. tsx re-runs and the schema and the verdict move together.",
    "",
  ].join('\n');

  const packageJson = {
    name: 'adorn-playground',
    private: true,
    version: '0.0.0',
    scripts: {
      start: 'tsx watch index.ts',
      dev: 'tsx watch index.ts',
    },
    dependencies: {
      [PKG]: VERSION,
    },
    devDependencies: {
      tsx: '^4.19.0',
      typescript: '^5.7.0',
    },
  };

  const tsconfig = {
    compilerOptions: {
      target: 'ES2020',
      module: 'ESNext',
      moduleResolution: 'bundler',
      experimentalDecorators: true,
      useDefineForClassFields: false,
      strict: true,
      skipLibCheck: true,
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
    },
    include: ['index.ts'],
  };

  const readme = [
    '# adorn playground',
    '',
    'This sandbox installs [adorn](https://www.npmjs.com/package/adorn) from npm and runs it with `tsx`.',
    'Edit `index.ts` and save — `tsx watch` re-runs it and prints to the terminal.',
    '',
    'Everything here is the real library; see https://adorn-ts.dev for the docs.',
    '',
  ].join('\n');

  const project = {
    title: 'adorn playground',
    description: 'Edit one decorated declaration and watch the runtime check and the derived schema move together.',
    template: 'node',
    files: {
      'index.ts': indexTs,
      'package.json': JSON.stringify(packageJson, null, 2) + '\n',
      'tsconfig.json': JSON.stringify(tsconfig, null, 2) + '\n',
      'README.md': readme,
    },
  };

  const theme = () => document.documentElement.dataset.theme
    || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  const openOptions = { openFile: 'index.ts', newWindow: true };

  if (openBtn) {
    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sdk.openProject(project, openOptions);
    });
  }
  if (fallbackLink) {
    fallbackLink.addEventListener('click', (e) => {
      e.preventDefault();
      sdk.openProject(project, openOptions);
    });
  }

  sdk.embedProject(mount, project, {
    openFile: 'index.ts',
    view: 'editor',
    showSidebar: true,
    hideNavigation: true,
    startScript: 'start',
    // Our page is cross-origin isolated (see public/_headers). This tells the SDK to serve the embed with
    // corp=1 and to add allow="cross-origin-isolated" to the iframe, so StackBlitz's WebContainer can boot
    // and the frame loads with its credentials. Without it the frame is refused under the isolated page.
    crossOriginIsolated: true,
    terminalHeight: 50,
    height: Math.max(560, Math.min(820, Math.round(window.innerHeight * 0.82))),
    theme: theme(),
  }).catch(showFallback);
})();
