# Naturable for Chrome

Lives in `extension/` of the naturable.app repo. Run the commands below from this folder; the site build ignores it.

Underlines AI writing patterns (AI words, template openers, vague sources, em dashes) in the text boxes you write in, and explains each one. Runs locally with the bundled [naturable-rules](https://github.com/GUCCI-atlasv/naturable-rules); nothing is uploaded. PRD v2 §6.

**Not an AI detector.** It doesn't rewrite text, doesn't score other people's writing, and doesn't help text pass detectors.

## What it does

| Feature | How |
|---|---|
| Underlines as you type | In `<textarea>` and contenteditable editors (Gmail, LinkedIn, X, Reddit, Notion, Medium, WordPress…) on sites you turn on. Underlines are drawn in a closed shadow-root overlay; the page's text and DOM are never modified. |
| Hover card | Rule name, why it reads as AI, a suggestion, **Ignore** (stops flagging that phrase for that rule) and **Learn more** (deep link to naturable.app; words go to their own anchor, e.g. `#delve`). |
| Check a selection | Right-click → **Check with Naturable** → result and score in the side panel. |
| Side panel | Paste anything for a full check. The fallback for Google Docs and other canvas editors. |
| Per-site switch | Popup toggle. Each site is a separate Chrome permission grant, so turning a site off also revokes access. **Check this page once** uses `activeTab` and needs no grant. |
| Sensitive places | Refuses to turn on for banking, payment, password-manager, sign-in and `.gov` hosts. Never reads password/payment/one-time-code fields or text boxes in forms that contain a password or card field. |
| Rules | Bundled in `src/vendor/naturable.iife.js`. No code or rules are fetched at runtime. |

## Permissions

| Permission | Why |
|---|---|
| `activeTab` | "Check this page once" from the popup, without granting the site. |
| `contextMenus` | "Check with Naturable" on selected text. |
| `sidePanel` | The full check. |
| `storage` | Purpose setting and ignored phrases, on this device. |
| `scripting` | Inject the checker on sites you turned on. |
| optional `http(s)://*/*` | Requested one site at a time when you turn it on (Chrome shows its own prompt). Nothing at install time. |

`npm run check` fails if the manifest asks for anything else, declares static host access or content scripts, or if any script contains network or code-from-string calls.

## Layout

```
src/                      the extension as loaded by Chrome (zip this)
  manifest.json
  background.js           per-site registration, context menu, badge
  content/content.js      underline overlay + hover card
  popup/  sidepanel/      UI pages
  shared/common.js        settings, sensitive-site rules, docs links (shared by all of the above)
  shared/docs-words.js    generated: word -> naturable.app anchor
  vendor/                 generated: naturable-rules engine + licenses
scripts/
  sync.mjs                refresh vendor/, docs-words.js and icons from ../../naturable-rules and the site (..)
  check.mjs               policy/static checks
  screens.mjs             screenshots into test/screenshots/
  pack.mjs                dist/naturable-extension-<version>.zip
test/                     unit tests + end-to-end tests in Chrome for Testing
STORE.md                  Chrome Web Store listing draft
```

## Develop

```bash
npm install
npm test          # static checks, unit tests, end-to-end tests in Chrome for Testing (headless)
npm run sync      # after a naturable-rules release or a change to the site's word anchors
node scripts/screens.mjs
npm run pack      # zip for the Chrome Web Store
```

Try it by hand: `chrome://extensions` → Developer mode → **Load unpacked** → `src/`. Then open a site you write on, click the Naturable icon and turn it on.

Branded Chrome no longer loads extensions from the command line, so the tests use Chrome for Testing from Playwright's cache (`CHROME_PATH` overrides).

## Known limits (MVP)

- Google Docs and other canvas editors: no inline underlines; use the selection menu or the side panel.
- One editor is tracked at a time (the one you last focused).
- Underlines follow scrolling and resizing; editors that move text without resizing or firing events may lag up to 0.5 s.
- English rules are stable; Chinese rules are beta, and their "Learn more" links go to the Chinese how-it-works page.
