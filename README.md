# naturable.app v2

Static site for [naturable.app](https://naturable.app), rebuilt from the v2 design boards and PRD v2.
No framework, no dependencies: one Node script renders every page into `out/` for Cloudflare Pages.

```bash
npm run build     # validate content against the rules, render out/
npm run dev       # build + local preview at http://localhost:8788/en/ (mimics Pages redirects/404)
```

Node 20.10+ (uses JSON import attributes).

## Layout

| Path | What |
|---|---|
| `vendor/naturable-rules/` | Copy of the `naturable-rules` package (packs, engine, `dist/naturable.iife.js`). Single source of truth for every checker. |
| `src/site.mjs` | Origin, GitHub URL, Chrome Web Store URL, contact email. **Fill the two TODO links before launch.** |
| `src/layout.mjs` | `<head>`, header, footer, breadcrumbs, schema helpers, EN/ZH strings |
| `src/components.mjs` | Server-rendered checker, editor, em dash tool, burstiness tool (sample results are computed at build time with the same engine) |
| `src/docs.mjs` | Rule id / flagged word → explanation URL. Emitted as `/assets/js/docs.js` so every "Learn more" deep-links to an on-site anchor |
| `src/content/` | AI words list (116 entries), the 15 tells, humanizer test results |
| `src/pages/` | Page definitions |
| `content/legacy/` | Text of the pre-v2 pages kept as-is (EN about/terms/3 articles, all ZH pages). Imported once with `scripts/import-legacy.mjs` |
| `public/` | CSS, client JS, fonts (self-hosted, OFL), favicon, robots.txt |

## What the build checks (and fails on)

- Every word/phrase example: if the rules flag the *before*, the *after* must not trigger that rule. Entries the rules don't flag are labeled "Watch list" on the page and in the downloads.
- Every tell on the Signs page: *before* triggers one of its rules, *after* triggers none.
- Every internal link and `#anchor` in the output resolves, including all `docs` targets.

## URLs and redirects (PRD §5.8)

`_redirects` is generated: `/` → `/en/` (301), `/privacy` → `/en/privacy/`, slashless → slashed (301 instead of Pages' default 308),
`/en/learn/remove-ai-writing-style/` → `/en/`, `/en/learn/how-to-remove-ai-tells/` → `/en/signs-of-ai-writing/`, `/en|zh-cn/pricing/` → home.
www → apex stays a Cloudflare zone rule (already live; Pages can't match hosts).

## Deploying on Cloudflare Pages

The old site was a Next.js export with a `_worker.js`. For this build set **Build command** `npm run build`, **Output directory** `out`.
With no `_worker.js`, `_redirects` and `_headers` (CSP, caching) apply directly.

## Updating rules

Replace `vendor/naturable-rules/` with a new release of the rules package and rebuild. The version shown on the site is read from the packs.
