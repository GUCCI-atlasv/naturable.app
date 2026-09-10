# P1 RUM note (Claude P1 preview)

Date: 2026-09-10 (HKT)

## What we checked
- Live HTML for `https://naturable.app/en/` and `/en/app/` (and Pages preview builds): only the CCC Monitor beacon is present:
  - `https://ccc-monitor.583079497.workers.dev/beacon.js` with `data-site="naturable.app"` (from `app/layout.tsx`).
- No `static.cloudflareinsights.com/beacon.min.js` / `data-cf-beacon` snippet in page source for production or recent preview deploys.
- Repo history: CCC was added in the initial Next.js release; no Cloudflare Insights script was ever committed in this codebase.
- Cloudflare `rum/site_info/list` API returned auth error with the current Wrangler OAuth scopes (no RUM admin scope), so dashboard Web Analytics site list could not be toggled from CLI.

## Decision
- **Keep CCC** — unique-IP experiments and traffic goals on the plan board depend on it.
- **No code removal needed for CF Insights** — redundant script was not present in HTML.
- **Ops follow-up (if dashboard still has Web Analytics enabled for naturable.app):** turn Automatic Setup / Insights off in Cloudflare Web Analytics so edge injection cannot double-count later. Prefer CCC as the single browser RUM for this site.

## Cut / not cut
- Cut from HTML: nothing (CF Insights already absent).
- Kept: CCC beacon in `app/layout.tsx`.
