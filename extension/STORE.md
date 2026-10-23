# Chrome Web Store listing (ready to paste)

Status: submitted 2026-10-23, rejected for keyword spam (site-name list in the description); description below is the fix to resubmit.

Per PRD §6.4: write around AI words / AI writing patterns / em dash. Never use "humanizer", "undetectable", "bypass", or detector names.
Claims below match what the extension does today (0.1.0, rules en-v1.1); keep them in step when the rules change.

## Store listing tab

**Name** (from the manifest): Naturable – AI Writing Pattern Checker

**Summary** (from the manifest `description`, 121/132 chars; the dashboard doesn't take a separate one):
Underlines AI writing patterns (AI words, template openers, em dashes) where you type. Runs locally; nothing is uploaded.

**Category:** Communication
(Writing email and posts is the main use. "Tools" is the store's catch-all for extensions that fit nowhere else.)

**Language:** English

**Description:**
(Revised 2026-10-23 after review flagged keyword spam, "Yellow Argon": no lists of site or product names, and only a
couple of example words. Keep it that way.)

```
Naturable underlines the patterns that make writing sound like a chatbot, in the text boxes of the sites you choose, and explains each one.

What it flags
• Overused AI vocabulary, such as "delve" and "leverage"
• Template openers and closers, such as "The future looks bright"
• Vague sources, such as "Experts believe"
• Leftover assistant phrases, such as "I hope this helps!"
• Stacked hedges, wordy filler and heavy em dash use

How it works
• Turn it on for a site from the toolbar button. Chrome asks once, for that site only
• Hover an underline to see the rule, why it reads as AI-written, and what to do instead
• Ignore a phrase you meant to use, or open the full explanation on naturable.app
• Right-click selected text and choose "Check with Naturable" to see a score and every finding in the side panel
• Paste any text into the side panel, including from editors that can't be underlined
• Choose what you're writing (email, blog, academic and more) to adjust how strict it is

Private by design
• Runs on your device. Your text is never uploaded, and there's no account
• It stays off until you turn it on for a site, and never turns on for banking, payment or sign-in pages
• It doesn't read password, payment or one-time-code fields

Open rules
Every rule is open source, with examples and tests, and is the same one the naturable.app editor uses. English rules are stable; Chinese rules are in beta.

Naturable is not an AI detector. A flag is a style signal, not evidence of who wrote the text. It doesn't rewrite your text; you decide what to change.
```

**Homepage URL:** https://naturable.app/en/chrome-extension/
**Support URL:** https://naturable.app/en/support/ (the dashboard rejects mailto: links)

**Screenshots (1280×800 RGB PNG, upload in this order):**
1. `store/screenshots/01-mail-hover-card.png`: webmail compose, underlines + hover card on "Experts believe"
2. `store/screenshots/02-social-post-underlines.png`: social post composer, underlines only (solid = strong, dotted = suggestion)
3. `store/screenshots/03-side-panel-selection.png`: selection + right-click "Check with Naturable" + the side panel result
4. `store/screenshots/04-hover-card-closeup.png`: hover card close-up in a notes app
5. The Signs of AI Writing page on naturable.app (from the asset review pack, 05-signs-of-ai-writing.png)

1–4 are rendered by `node scripts/store-assets.mjs` from the real extension running in Chrome for Testing on generic mock pages
(`store/pages/`, fictional names, no real product branding). The only drawn element is the right-click menu in 3 (native menus
can't be captured headless); its Naturable item is the real one. Re-run the script after any UI change so the listing stays accurate.

**Promo tiles:** `store/promo/promo-small-440x280.png` (upload; listings without one rank lower) and
`store/promo/promo-marquee-1400x560.png` (optional, only for featuring).

**Store icon:** `src/icons/128.png` (96px artwork + 16px transparent padding), read from the uploaded zip.

## Privacy practices tab

**Single purpose:**
Naturable checks text the user is writing for common AI writing patterns and explains each one, so the user can decide what to change.

**Permission justifications:**
- `activeTab`: Lets the user run the checker once on the current page from the toolbar popup ("Check this page once") without granting the site permanently.
- `contextMenus`: Adds "Check with Naturable" to the right-click menu for selected text.
- `sidePanel`: Shows the full check (score and every finding) for selected or pasted text in Chrome's side panel.
- `storage`: Saves the user's writing purpose and the phrases they chose to ignore, on the device only.
- `scripting`: Starts the checker on the sites the user has turned on, and on the current page when they choose "Check this page once".
- Host permissions (optional `http://*/*`, `https://*/*`): Requested one site at a time, only when the user turns Naturable on for that site, so it can underline text in that site's text boxes. Nothing is requested at install. Turning the site off removes the access.

**Remote code:** No, I am not using remote code. (All code and rules ship in the package; nothing is fetched at runtime.)

**Data usage:** tick none of the data types. Naturable doesn't collect or transmit personally identifiable info, health, financial, authentication, personal communications, location, web history, user activity or website content. Text is analyzed in the page and never leaves the device.
Then certify all three: not sold to third parties; not used or transferred for purposes unrelated to the single purpose; not used for creditworthiness or lending.

**Privacy policy URL:** https://naturable.app/en/privacy/ (has a "Chrome extension" section)

## Distribution tab
Visibility: Public · Regions: all · Pricing: free.
