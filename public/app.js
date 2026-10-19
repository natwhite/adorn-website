// adorn website — shared behaviour: theme, menu, highlighting, copy buttons, tabs, filters, TOC.
(function () {
  'use strict';

  const root = document.documentElement;
  root.classList.remove('no-js');

  /* ---------- theme ---------- */

  const THEME_KEY = 'adorn-theme';
  const storedTheme = (() => { try { return localStorage.getItem(THEME_KEY); } catch { return null; } })();
  if (storedTheme === 'light' || storedTheme === 'dark') root.dataset.theme = storedTheme;

  const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = () => root.dataset.theme || (prefersDark() ? 'dark' : 'light');

  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    const sync = () => btn.setAttribute('aria-label', currentTheme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    sync();
    btn.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem(THEME_KEY, next); } catch { /* private mode: theme just won't persist */ }
      sync();
    });
  });

  /* ---------- mobile menu ---------- */

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('siteNav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ---------- syntax highlighting ----------
     A deliberately small tokenizer: comments, strings, decorators, keywords, numbers, JSON keys.
     It only has to make the site's own snippets readable, not parse TypeScript. */

  const KEYWORDS = new Set(('import export from const let var function return class new extends implements ' +
    'interface type async await if else throw try catch private public readonly static true false null ' +
    'undefined this of in as typeof void number string boolean unknown').split(' '));

  const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function highlight(src, lang) {
    const rules = lang === 'bash'
      ? [[/#[^\n]*/y, 'com'], [/'[^']*'|"[^"]*"/y, 'str'], [/--?[\w-]+/y, 'kw'], [/\b(?:npm|npx|adorn|git|node)\b/y, 'dec']]
      : lang === 'json'
        ? [[/"(?:[^"\\]|\\.)*"(?=\s*:)/y, 'key'], [/"(?:[^"\\]|\\.)*"/y, 'str'], [/-?\b\d+(?:\.\d+)?\b/y, 'num'], [/\b(?:true|false|null)\b/y, 'kw']]
        : [
            [/\/\/[^\n]*|\/\*[\s\S]*?\*\//y, 'com'],
            [/'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/y, 'str'],
            [/@[A-Za-z_]\w*/y, 'dec'],
            [/\b\d[\d_]*(?:\.\d+)?\b/y, 'num'],
            [/[A-Za-z_$][\w$]*/y, 'word'],
          ];
    let out = '';
    let i = 0;
    let plain = '';
    const flush = () => { if (plain) { out += escapeHtml(plain); plain = ''; } };
    outer: while (i < src.length) {
      for (const [re, cls] of rules) {
        re.lastIndex = i;
        const m = re.exec(src);
        if (m && m[0].length) {
          if (cls === 'word') {
            if (KEYWORDS.has(m[0])) { flush(); out += `<span class="tok-kw">${m[0]}</span>`; } else { plain += m[0]; }
          } else {
            flush();
            out += `<span class="tok-${cls}">${escapeHtml(m[0])}</span>`;
          }
          i += m[0].length;
          continue outer;
        }
      }
      plain += src[i++];
    }
    flush();
    return out;
  }

  // Lines containing a `// ◆` marker get emphasised (the marker itself is stripped).
  function render(pre) {
    const lang = pre.dataset.lang || 'ts';
    const raw = pre.textContent.replace(/^\n/, '').replace(/\s+$/, '');
    pre.dataset.raw = raw.replace(/\s*\/\/ ◆/g, '');
    pre.innerHTML = raw.split('\n').map((line) => {
      const marked = line.includes('// ◆');
      const html = highlight(line.replace(/\s*\/\/ ◆/, ''), lang);
      return marked ? `<span class="tok-hl">${html}</span>` : html;
    }).join('\n');
  }
  window.adornSite = { highlight, escapeHtml, render };

  document.querySelectorAll('pre[data-lang]').forEach(render);

  /* ---------- copy buttons ---------- */

  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.copy');
    if (!btn) return;
    const target = btn.dataset.target ? document.getElementById(btn.dataset.target) : btn.closest('.code').querySelector('pre, textarea');
    const text = target.value ?? target.dataset.raw ?? target.textContent;
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = 'copied';
    } catch {
      btn.textContent = 'press ctrl+c';
    }
    setTimeout(() => { btn.textContent = 'copy'; }, 1400);
  });

  /* ---------- tabs ---------- */

  document.querySelectorAll('[role="tablist"]').forEach((list) => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const select = (tab) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
    };
    tabs.forEach((tab, idx) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        const next = tabs[(idx + d + tabs.length) % tabs.length];
        next.focus();
        select(next);
      });
    });
  });

  /* ---------- status filter ---------- */

  document.querySelectorAll('[data-filter-for]').forEach((group) => {
    const list = document.getElementById(group.dataset.filterFor);
    group.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      group.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      const f = btn.dataset.filter;
      list.querySelectorAll('li').forEach((li) => { li.hidden = f !== 'all' && li.dataset.status !== f; });
    });
  });

  /* ---------- reveal on scroll ---------- */

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('visible'));
  }

  /* ---------- table-of-contents scroll spy ---------- */

  const tocLinks = [...document.querySelectorAll('.toc a[href^="#"]')];
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const byId = new Map(tocLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        tocLinks.forEach((a) => a.classList.remove('active'));
        byId.get(en.target.id)?.classList.add('active');
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- footer year ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
})();
