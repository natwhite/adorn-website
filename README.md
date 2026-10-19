# adorn-website

The website for [adorn](https://github.com/natwhite/adorn), served at **https://adorn-ts.dev**.

Plain static HTML, CSS and JS in `public/`, with no framework and no build step to serve it. It's modelled
on the structure of [forma-lang.dev](https://forma-lang.dev): an overview, an architecture page and a
reference page.

| Page | What it is |
| --- | --- |
| `public/index.html` | Overview: hero, why, how it works, **live playground**, OpenAI evidence, functional surface, stateful DbC, honest status, learn |
| `public/architecture.html` | Design rules, the record/install/project trick, bands and blame, trust, projection rules, strict mode, privacy, observability, testing, deliberate boundaries |
| `public/reference.html` | Getting started, constraint vocabulary, markers, conditions, values, projections, config, CLI, add-ons, gotchas, and a searchable API index |

## The no-drift rule, applied to the site

- **The playground runs the real library.** `public/vendor/adorn.browser.js` is `../adorn/dist` bundled by
  esbuild (`npm run bundle`), so the schema and verdict in the browser come from adorn itself.
- **Homepage outputs come from the real library.** `npm run snippets` runs `scripts/snippets.ts` with adorn's
  own ts-node and writes `public/assets/snippets.json`. Paste any changed output into `index.html`.
- **The API index is checked.** `npm run check` fails if `public/reference-data.js` is missing a runtime export
  of `adorn`, `adorn/test` or `adorn/otel`, names something that no longer exists, or if the bundled
  playground is a different adorn version from `../adorn`.

## Working on it

```bash
npm install              # esbuild only
(cd ../adorn && npm run build)
npm run bundle           # refresh the playground's copy of adorn
npm run check            # reference index vs. the real exports
npm run serve            # http://localhost:3000
```

Everything assumes the library is checked out next to this repo at `../adorn`. Set `ADORN_DIR` to point
elsewhere.

## Deploying (Cloudflare Workers static assets)

Cloudflare now routes new Pages projects through Workers, so this uses a Worker with static assets
(`wrangler.jsonc`, no Worker code). It's live at https://adorn-ts.dev, with `www.adorn-ts.dev` attached too.

One-time setup:

1. `npx wrangler login`
2. Add `adorn-ts.dev` to Cloudflare and point the registrar's nameservers at the two Cloudflare gives you.
3. `npm run deploy`. The `routes` in `wrangler.jsonc` attach `adorn-ts.dev` and `www` as custom domains,
   with DNS records and certificates managed by Cloudflare. Setting routes also turns off the `workers.dev` URL.

After that, every deploy is:

```bash
npm run deploy           # runs the check, then uploads public/
```

`public/_headers` sets a few security headers and caches the vendor bundle for an hour. The social card is
rendered from `scripts/social-card.html`; the command to re-render it is in that file.

## License

MIT, the same as adorn.
