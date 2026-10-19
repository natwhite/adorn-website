// The searchable public-surface index (reads window.ADORN_REFERENCE from reference-data.js).
(function () {
  'use strict';

  const data = window.ADORN_REFERENCE || [];
  const cats = window.ADORN_REFERENCE_CATEGORIES || {};
  const list = document.getElementById('refList');
  const search = document.getElementById('refSearch');
  const count = document.getElementById('refCount');
  const catBar = document.getElementById('refCats');
  if (!list) return;

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let activeCat = 'all';

  const makeButton = (key, label) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.cat = key;
    b.textContent = label;
    b.setAttribute('aria-pressed', String(key === activeCat));
    catBar.appendChild(b);
  };
  makeButton('all', `All (${data.length})`);
  Object.entries(cats).forEach(([key, label]) => {
    const n = data.filter((d) => d.cat === key).length;
    if (n) makeButton(key, `${label} (${n})`);
  });

  function draw() {
    const q = search.value.trim().toLowerCase();
    const hits = data.filter((d) =>
      (activeCat === 'all' || d.cat === activeCat) &&
      (!q || `${d.name} ${d.sig} ${d.desc} ${d.module}`.toLowerCase().includes(q)));
    count.textContent = `${hits.length} of ${data.length}`;
    list.innerHTML = hits.length
      ? hits.map((d) => `
        <li class="ref-item" id="api-${esc(d.name)}">
          <header><h3>${esc(d.name)}</h3><span class="sig">${esc(d.sig)}</span></header>
          <p>${esc(d.desc)}</p>
          <div class="meta"><span class="pill ${d.module === 'adorn' ? 'accent' : 'brass'}">${esc(d.module)}</span><span class="pill ok">${esc(cats[d.cat] || d.cat)}</span></div>
        </li>`).join('')
      : '<li class="ref-empty">Nothing matches. Try a decorator name such as "OneOf", or a concept such as "strict".</li>';
  }

  catBar.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-cat]');
    if (!b) return;
    activeCat = b.dataset.cat;
    catBar.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    draw();
  });
  search.addEventListener('input', draw);

  // "/" focuses the search box, as on most docs sites.
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      search.focus();
    }
  });

  draw();
})();
