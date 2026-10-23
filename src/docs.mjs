// Where each rule (and each flagged word) is explained on the site. Used by the build-time render and
// emitted as /assets/js/docs.js for the browser, so the checker, editor and site always link to the same anchor.
// Rule packs may add their own `docs` field later; when present it wins (see NatUI.docsFor).
import { packs } from "../vendor/naturable-rules/src/index.js";
import { SITE } from "./site.mjs";
import { WORD_GROUPS, PHRASE_GROUPS } from "./content/ai-words.mjs";

export const WORDS_PATH = "/en/ai-words-to-avoid/";
export const SIGNS_PATH = "/en/signs-of-ai-writing/";
export const RULES_PATH = "/en/how-it-works/";

export const slug = (s) =>
  s.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const ruleAnchor = (id) => "rule-" + id.replace(/\./g, "-");

// Rule links come from the packs (`docs`, required by naturable-rules >= 1.2.0) so the site, the extension,
// the Skill and the GitHub README all point to the same anchor. The build's link check fails if one breaks.
const rules = {};
for (const r of [...packs.en.rules, ...packs.zh.rules]) {
  if (!r.docs?.startsWith(SITE.origin + "/")) throw new Error(`${r.id}: docs must start with ${SITE.origin}/`);
  rules[r.id] = r.docs.slice(SITE.origin.length);
}
// Document-level issue built by the engine's scorer (not a pack rule).
rules["en.rhythm.repeated_start"] = SIGNS_PATH + "#same-shape-sentences";

// Word-level anchors for en.lexicon.cliche hits (lower-cased matched text -> anchor).
const words = {};
for (const g of WORD_GROUPS) {
  for (const [word] of g.entries) {
    const w = word.toLowerCase();
    const href = WORDS_PATH + "#" + slug(word);
    [w, w + "s", w + "d", w + "ing", w.replace(/e$/, "") + "ing", w + "ly", w.replace(/s$/, "")].forEach((v) => { words[v] = href; });
  }
}
for (const g of PHRASE_GROUPS) for (const [phrase] of g.entries) words[phrase.toLowerCase()] = WORDS_PATH + "#" + slug(phrase);

export const DOCS = { rules, words };

export function docsFor(issue) {
  if (issue.rule.id === "en.lexicon.cliche" && issue.text && words[issue.text.toLowerCase()]) return words[issue.text.toLowerCase()];
  return rules[issue.rule.id] || RULES_PATH;
}
