# Chrome Web Store listing (draft, not submitted)

Per PRD §6.4: write around AI words / AI writing patterns / em dash. Never use "humanizer", "undetectable", "bypass", or detector names.

**Name:** Naturable – AI Writing Pattern Checker

**Summary (≤132 chars):**
Underlines AI writing patterns (AI words, template openers, em dashes) where you type, and explains each one. Runs locally.

**Category:** Tools (Productivity)

**Description:**

Naturable underlines the patterns that make writing sound like a chatbot, right where you write: Gmail, LinkedIn, X, Reddit, Notion, Medium, WordPress and other sites you turn it on for.

What it flags
• AI vocabulary: delve, leverage, robust, tapestry, and 100+ more
• Template openers and closers: "In today's fast-paced world", "The future looks bright"
• Vague sources: "Experts believe", "Studies show"
• Assistant leftovers: "Great question!", "I hope this helps"
• Stacked hedges, filler phrases, and em dash overuse

How it works
• Hover an underline to see the rule, why it reads as AI, and a suggestion
• Ignore a phrase you meant to use, or open the full explanation on naturable.app
• Right-click selected text → "Check with Naturable" for a score and full list in the side panel
• Paste anything into the side panel, including text from Google Docs

Private by design
• Runs on your device. Your text is never uploaded, and there's no account
• It's off until you turn it on for a site, and it never turns on for banking, payment or sign-in pages
• It doesn't read password or payment fields

Open rules
The rules are open source (CC BY 4.0) and the same ones naturable.app uses: github.com/GUCCI-atlasv/naturable-rules

Naturable is not an AI detector. A hit is a style signal, not evidence of who wrote the text. It doesn't rewrite your text.

**Screenshots (1280×800, 5):** Gmail compose with hover card · LinkedIn post · side panel · hover card close-up · rules page on naturable.app.
`node scripts/screens.mjs` renders the first and the side panel from a local mock; the LinkedIn shot needs a real (test) account.

**Privacy practices tab:**
- Single purpose: check text the user writes for AI writing patterns and explain them.
- Data collected: none. (No personally identifiable info, no website content, no user activity leaves the device.)
- Permission justifications: see README "Permissions".
- Remote code: No.

**Homepage:** https://naturable.app/en/chrome-extension/
**Privacy policy:** https://naturable.app/en/privacy/
**Support:** privacy@naturable.app
