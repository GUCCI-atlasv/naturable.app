# Changelog

## 1.2.0 — 2026-10-23 · packs en-v1.1 / zh-v1.1 · engine 3.0.0

No detection changes: the same text gets the same hits and the same score as 1.1.0.

- Every rule now has a `docs` URL pointing to its explanation on naturable.app. `npm run validate` fails if one is missing. The document-level "Repeated sentence openings" issue links there too.
- The CLI's `--json` output includes `learn_more` for each issue, and the text report prints it.
- `skill/references/*.md` list each rule's link, and the README's rules index is generated from the packs.

## 1.1.0 — 2026-10-22 · packs en-v1.1 / zh-v1.1 · engine 3.0.0

This release extracts the rules from naturable.app (engine 2.2.0, packs en-v1.0 / zh-v1.0, released 2026-10-01) into a standalone repository.

**Parity:** on the site's built-in sample, the new engine returns the same score, issues and rhythm as the live editor (64 · 8 strong · 3 suggestions · rhythm 97). This is covered by a test.

### Rule fixes (found by the new self-test: each rule's `before` must trigger, `after` must not)
- `en.structure.positive_negative_parallel`: the pattern required a comma before "or", so the common form ("Whether you're a beginner or an expert, this is essential.") never matched, including the rule's own example. The pattern now makes that comma optional and also accepts "you are / it is" and "will be / that".
- `zh.translationese.de_stack`: the example sentence contained only two 的, so it could never trigger the rule, which needs three or more. The example is corrected; the pattern is unchanged.

### New rule
- `en.structure.dash_dense` (suggestion, rhythm): flags each em dash (or `--`) once a text has ≥ 3 dashes and ≥ 8 per 1,000 words. These thresholds are a starting point and need calibrating against real drafts. This rule powers the em-dash tool page.

### Engine changes (vs. site engine 2.2.0)
- Pure and stateless: no DOM, no `window`, no localStorage. Ignore lists are passed in through options. Works in browsers, MV3 extensions, workers and Node.
- `adjacent_parallel` / `zh_adjacent_parallel`: hits now point at the correct sentence when the same sentence appears more than once. Previously `indexOf` always returned the first occurrence.
- `zh_zero_anaphora`: paragraphs are now split on every line break, with exact offsets. Previously only blank-line breaks counted, and offsets drifted when there were three or more newlines.
- `normalizeAfterFix`: deleting a sentence-initial transition no longer leaves ". ," behind.
- `heuristic` rules can now take `detect.params`.
- `diff()` returns `ops` instead of HTML; callers render it themselves.
- Removed the unused `flagsFrom`. The feedback API, i18n strings and Markdown export stay in the app, not in this library.

### Known limits (not changed in this release)
- `en.lexicon.cliche` matches "landscape" literally, so it fires on photography and geography text. Purpose weights soften this, but it still needs a context rule.
- `en.lexicon.filler_phrase` covers "it is important to note that" but not the contraction "it's important to note".
- Chinese rules are beta: 11 validated classes, with 4 rejected rules documented in `banned_rules`.
