# Naturable — Website V1.0

Free AI writing checker. Warm editorial (Claude-style) design. Static front-end + client-side rule engine, built to deploy on **Cloudflare Pages**.

## Structure

```
site/
├── index.html                  Home (hero + embedded checker + FAQ)
├── app.html                    Full-screen checker
├── how-it-works.html           Explains the rule engine + burstiness
├── pricing.html                Free vs Pro
├── about.html · privacy.html · terms.html
├── learn/
│   ├── index.html              Content hub
│   ├── how-to-remove-ai-tells.html
│   ├── what-is-perplexity-and-burstiness.html
│   └── do-ai-humanizers-work.html
├── admin/index.html            Internal analytics dashboard (noindex; demo data)
├── assets/
│   ├── style.css               Design system (tokens + components)
│   ├── engine.js               Client-side rule linter (free tier, no AI)
│   ├── logo.svg · favicon.svg
├── robots.txt · sitemap.xml · site.webmanifest
```

## Design tokens
- Background `#F0EEE6` · panel `#FAF9F5` · ink `#1F1E1C`
- Accent (clay) `#D97757` / `#BE5D3E` · sage `#5B8C5A` · terracotta `#BF4D33`
- Serif **Fraunces** (headings) · sans **Inter** (body)
- Logo: `Naturable` in clay + `.app` in ink

## Free vs Pro
- **Free** (implemented): rule detection, highlights, Human score + burstiness, rule-based Quick fix — all in-browser, no upload.
- **Pro** (placeholder button): AI rewrite + voice matching — to be wired to a Cloudflare Worker + LLM.

## SEO
Every page: unique title + meta description + canonical + Open Graph/Twitter. JSON-LD: `SoftwareApplication` + `FAQPage` (home), `Product` (pricing), `Article` + `BreadcrumbList` (learn). `sitemap.xml`, `robots.txt`, `site.webmanifest` included.

## Deploy (Cloudflare Pages)
1. Push this `site/` folder to a repo (or upload directly).
2. Cloudflare Pages → create project → build output dir = `site` (no build command; it's static).
3. Point `naturable.app` at the project; 301 `naturable.ai` → `naturable.app`.

## To build next (backend / Pro)
- Cloudflare Worker: telemetry beacon (capture hashed IP + `request.cf` geo → D1 / Analytics Engine).
- Worker: `/api/rewrite` → Workers AI (or OpenAI/Anthropic) for the Pro tier.
- Stripe for billing. See the PRD for the full architecture.
