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
  const VERSION = '0.1.0';

  function showFallback() {
    if (fallback) fallback.hidden = false;
  }

  if (!sdk) { showFallback(); return; }

  // The demo: one decorated declaration, then the artifacts derived from it. String concatenation (not
  // template literals) in the body keeps this source free of backticks so it nests cleanly here.
  const indexTs = [
    "import {",
    "    Contract, Tool, Describe, NotEmpty, OneOf,",
    "    GreaterThanEqual, LessThanEqual, Verify, Contracts,",
    "} from 'adorn';",
    "import { toolSchemaForMethod } from 'adorn/schema';",
    "",
    "// One declaration. The constraints below are the JSON Schema an LLM reads",
    "// AND the checks its reply must pass, so the two can't drift apart.",
    "@Contract()",
    "class WeatherTool {",
    "    @Tool('Look up a weather forecast.')",
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
    "// 1 — the tool schema the model reads, derived from the decorators above:",
    "console.log('TOOL SCHEMA\\n' + JSON.stringify(",
    "    toolSchemaForMethod(WeatherTool, 'getWeather'), null, 2,",
    "));",
    "",
    "const tool = new WeatherTool();",
    "",
    "// 2 — a valid call runs the body:",
    "console.log('\\nVALID    -> ' + tool.getWeather('Lisbon', 'celsius', 3));",
    "",
    "// 3 — the model asks for 99 days: rejected before the body runs,",
    "//     with the value redacted by default.",
    "try {",
    "    tool.getWeather('Lisbon', 'celsius', 99);",
    "} catch (err) {",
    "    console.log('\\nREJECTED -> ' + (err as Error).message);",
    "}",
    "",
    "// The same constraints without a decoration point (the descriptor-first path):",
    "const params = {",
    "    location: Contracts.string.notEmpty(),",
    "    unit: Contracts.enum(['celsius', 'fahrenheit']),",
    "    days: Contracts.number.between(1, 7),",
    "};",
    "const check = Verify.check(Contracts.object(params), 'args', {",
    "    location: 'Oslo', unit: 'kelvin', days: 2,",
    "});",
    "console.log('\\nCHECK    -> ' + JSON.stringify(check, null, 2));",
    "",
    "// Edit a constraint — say @LessThanEqual(7) -> 14, or Between(1, 7) -> Between(1, 14) —",
    "// or change a reply, then save. tsx re-runs and the schema and the verdict move together.",
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
    description: 'Edit one decorated declaration and watch the tool schema and the runtime check move together.',
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
