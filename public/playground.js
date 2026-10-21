// The homepage playground. Everything here calls the REAL adorn build (vendor/adorn.browser.js, bundled from
// ../adorn/dist by scripts/bundle-adorn.mjs). The page computes nothing itself: the schema and the
// verdict both come from adorn.
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const paramsEl = $('pgParams');
  if (!paramsEl) return;

  const site = window.adornSite;
  const lib = window.adorn;
  const replyEl = $('pgReply');
  const strictEl = $('pgStrict');
  const exampleEl = $('pgExample');
  const schemaEl = $('pgSchema');
  const checkEl = $('pgCheck');
  const verdictEl = $('pgVerdict');
  const paramsStatus = $('pgParamsStatus');

  if (!lib) {
    paramsStatus.className = 'verdict bad';
    paramsStatus.textContent = 'vendor/adorn.browser.js did not load. Run `npm run bundle` in the site repo.';
    return;
  }

  fetch('vendor/adorn.version.json').then((r) => r.json()).then((v) => { $('pgVersion').textContent = v.version; }).catch(() => {});

  // `Contracts` is the facade — the recommended descriptor surface. The per-type namespaces stay in scope too,
  // so a hand-typed example in either style still evaluates.
  const SCOPE = ['Contracts', 'NumberContracts', 'StringContracts', 'EnumContracts', 'ArrayContracts', 'ObjectContracts', 'NullableContracts', 'BooleanContracts'];

  const EXAMPLES = [
    {
      label: 'Per-session booking: a valid reply',
      name: 'book', description: 'Book an available slot.', strict: false,
      params: `{
    // slots known only at runtime: no decorator could express this enum
    slotId: Contracts.enum(['fri-1000', 'fri-1400', 'thu-0900']),
    partySize: Contracts.number.between(1, 8),
    name: Contracts.string.notEmpty(),
}`,
      reply: '{ "slotId": "fri-1000", "partySize": 2, "name": "Ada" }',
    },
    {
      label: 'The model hallucinates a slot',
      name: 'book', description: 'Book an available slot.', strict: false,
      params: `{
    slotId: Contracts.enum(['fri-1000', 'fri-1400', 'thu-0900']),
    partySize: Contracts.number.between(1, 8),
    name: Contracts.string.notEmpty(),
}`,
      reply: '{ "slotId": "mon-0800", "partySize": 2, "name": "Ada" }',
    },
    {
      label: 'OpenAI strict mode with a nullable note',
      name: 'scheduleReminder', description: 'Schedule a reminder for a patient, optionally with a note.', strict: true,
      params: `{
    patientId: Contracts.string.uuid(),
    // strict mode forbids absent properties, so "optional" means nullable
    note: Contracts.nullable(Contracts.string.notEmpty()),
}`,
      reply: '{ "patientId": "3f7c1e94-2a8b-4d6f-9c11-5b0e2a7d8f34", "note": null }',
    },
    {
      label: 'A bad element deep in a nested list',
      name: 'addMember', description: 'Add a team member.', strict: false,
      params: `{
    member: Contracts.object({
        name: Contracts.string.notEmpty(),
        email: Contracts.string.email(),
        roles: Contracts.array(
            Contracts.enum(['admin', 'editor', 'viewer']),
            { minItems: 1 },
        ),
    }),
}`,
      reply: '{ "member": { "name": "Ada", "email": "ada@example.com", "roles": ["admin", "wizard"] } }',
    },
    {
      label: 'Strict mode refuses an open map at build time',
      name: 'tag', description: 'Attach free-form tags.', strict: true,
      params: `{
    id: Contracts.string.uuid(),
    // an open Record<string, V> can't be expressed in OpenAI strict mode
    tags: Contracts.dictionary(Contracts.string.notEmpty()),
}`,
      reply: '{ "id": "3f7c1e94-2a8b-4d6f-9c11-5b0e2a7d8f34", "tags": { "env": "prod" } }',
    },
  ];

  EXAMPLES.forEach((ex, i) => {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = ex.label;
    exampleEl.appendChild(opt);
  });

  let current = EXAMPLES[0];

  function load(i) {
    current = EXAMPLES[i];
    paramsEl.value = current.params;
    replyEl.value = current.reply;
    strictEl.checked = current.strict;
    run();
  }

  const show = (el, text, lang) => { el.innerHTML = site.highlight(text, lang); };

  function setStatus(el, ok, text) {
    el.className = 'verdict ' + (ok ? 'ok' : 'bad');
    el.textContent = text;
  }

  function evalParams(src) {
    const fn = new Function(...SCOPE, '"use strict"; return (' + src + '\n);');
    const params = fn(...SCOPE.map((k) => lib[k]));
    if (!params || typeof params !== 'object' || Array.isArray(params)) throw new Error('params must evaluate to an object of descriptors');
    return params;
  }

  function run() {
    let params;
    try {
      params = evalParams(paramsEl.value);
      setStatus(paramsStatus, true, `✓ ${Object.keys(params).length} parameter descriptor(s)`);
    } catch (e) {
      setStatus(paramsStatus, false, '✗ ' + (e && e.message ? e.message : String(e)));
      return;
    }

    // 1. The schema the model reads.
    try {
      const schema = lib.toolSchemaFrom({ name: current.name, description: current.description, params }, { provider: 'openai', strict: strictEl.checked });
      show(schemaEl, JSON.stringify(schema, null, 2), 'json');
    } catch (e) {
      show(schemaEl, '// toolSchemaFrom refused to build this schema:\n// ' + String(e.message).split('\n').join('\n// '), 'ts');
    }

    // 2. The model's reply, checked against the SAME descriptors.
    let reply;
    try {
      reply = JSON.parse(replyEl.value);
    } catch (e) {
      show(checkEl, '// the reply is not valid JSON: ' + e.message, 'ts');
      setStatus(verdictEl, false, '✗ unparseable reply');
      return;
    }
    try {
      const result = lib.Verify.check(lib.Contracts.object(params), 'args', reply);
      show(checkEl, JSON.stringify(result, null, 2), 'json');
      if (result.ok) setStatus(verdictEl, true, '✓ ok: the body would run with these arguments');
      else setStatus(verdictEl, false, `✗ rejected at ${JSON.stringify(result.path || [])}: expected ${result.expected || result.constraint}`);
    } catch (e) {
      show(checkEl, '// ' + e.message, 'ts');
      setStatus(verdictEl, false, '✗ ' + e.message);
    }
  }

  let timer;
  const debounced = () => { clearTimeout(timer); timer = setTimeout(run, 200); };
  paramsEl.addEventListener('input', debounced);
  replyEl.addEventListener('input', debounced);
  strictEl.addEventListener('change', run);
  exampleEl.addEventListener('change', () => load(Number(exampleEl.value)));

  load(0);
})();
