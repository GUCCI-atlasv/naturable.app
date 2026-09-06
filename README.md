# Naturable.app

Naturable is a bilingual natural-writing editor for English and Simplified Chinese. The web app is built with Next.js and exported for Cloudflare Pages.

## Local development

```bash
npm install
npm run dev
```

## Checks and production build

```bash
npm run build
```

The build includes an SEO regression check for canonical URLs, hreflang pairs, sitemap entries, trailing slashes, and legacy links.

## Cloudflare Pages

```bash
npm run deploy
```

The rule-feedback Worker uses a separate Wrangler configuration. Copy `wrangler.feedback.example.jsonc` to `wrangler.feedback.jsonc`, update the verified email destination, and configure the private `FEEDBACK_DESTINATION` secret before deploying it.

