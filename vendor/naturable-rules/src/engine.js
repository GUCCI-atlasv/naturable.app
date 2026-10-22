// Naturable rules engine — pure, stateless, runs in browsers, extensions, workers and Node.
// Ported from naturable.app engine 2.2.0 with the DOM/UI layer removed.

import { heuristicHits } from "./heuristics.js";
import { applyFixSpec } from "./fix.js";
import { score, documentIssues } from "./score.js";
import { detectLanguage, conservesInformation, normalizeAfterFix } from "./text.js";

export const ENGINE_VERSION = "3.0.0";
export const LAYER_ORDER = ["hollow", "structure", "artifact", "lexicon"];
export const LAYER_RANK = Object.fromEntries(LAYER_ORDER.map((l, i) => [l, i]));
export const PURPOSES = ["general", "blog", "email", "marketing", "academic", "social", "technical"];

const rank = (layer) => LAYER_RANK[layer] ?? 99;

function makeRe(pattern, flags) {
  const f = flags || "g";
  return new RegExp(pattern, f.includes("g") ? f : f + "g");
}

export function compileRule(raw, packVersion, language) {
  const detect = raw.detect || {};
  const rule = {
    id: raw.id,
    class_id: raw.class_id || null,
    language,
    layer: raw.layer || "lexicon",
    category: raw.category || raw.layer || "vocabulary",
    severity: raw.severity || "suggestion",
    confidence: raw.confidence || "medium",
    name_en: raw.name_en,
    name_zh: raw.name_zh,
    title: language === "zh" ? raw.name_zh || raw.name_en : raw.name_en || raw.name_zh,
    reason: raw.reason || "",
    suggestion: raw.rewrite || "",
    before: raw.before || "",
    after: raw.after || "",
    auto: !!raw.auto,
    fixSpec: raw.fix || null,
    evidence_policy: raw.evidence_policy || "never_invent",
    purpose_weights: raw.purpose_weights || {},
    docs: raw.docs || null,
    packVersion,
    detect,
  };
  if (detect.type === "regex") rule.re = makeRe(detect.pattern, detect.flags);
  return rule;
}

export function issueKey(issue) {
  return `${issue.rule.id}:${(issue.text || "").toLowerCase()}`;
}

/**
 * createEngine({ packs: { en, zh }, rules? })
 * Returns stateless functions. Callers own ignore-lists, undo history and storage.
 */
export function createEngine({ packs }) {
  const rules = [];
  for (const lang of Object.keys(packs)) {
    const pack = packs[lang];
    if (!pack) continue;
    (pack.rules || []).forEach((raw) => rules.push(compileRule(raw, pack.version, pack.language || lang)));
  }
  rules.sort((a, b) => rank(a.layer) - rank(b.layer));

  function effectiveRule(rule, purpose) {
    const w = typeof rule.purpose_weights[purpose] === "number" ? rule.purpose_weights[purpose] : 1;
    let { severity, confidence } = rule;
    // Academic/technical writing: demote weakly weighted strong rules.
    if (w < 0.75 && severity === "strong") {
      severity = "suggestion";
      confidence = "medium";
    }
    return { ...rule, severity, confidence, weight: w, safeFix: rule.auto && !!rule.fixSpec };
  }

  /**
   * scan(text, opts) -> issues[]
   * opts: { language: "auto"|"en"|"zh", purpose, ignoredRules: Set, ignoredKeys: Set, only: Set<ruleId> }
   */
  function scan(text, opts = {}) {
    const purpose = opts.purpose || "general";
    const ignoredRules = opts.ignoredRules || new Set();
    const ignoredKeys = opts.ignoredKeys || new Set();
    const detected = opts.language && opts.language !== "auto" ? opts.language : detectLanguage(text);
    const languages = detected === "mixed" ? ["en", "zh"] : [detected];
    const found = [];

    for (const r of rules) {
      if (!languages.includes(r.language)) continue;
      if (opts.only && !opts.only.has(r.id)) continue;
      if (ignoredRules.has(r.id)) continue;
      const eff = effectiveRule(r, purpose);
      const push = (hit) => {
        if (!ignoredKeys.has(issueKey(hit))) found.push(hit);
      };

      if (r.detect.type === "heuristic") {
        for (const h of heuristicHits(r, text, r.language)) {
          push({
            id: `${r.id}:${h.start}:${(h.text || "").length}`,
            rule: eff,
            start: h.document ? null : h.start,
            end: h.document ? null : h.end,
            text: h.text || "",
            document: !!h.document,
            layer: r.layer,
          });
        }
        continue;
      }
      if (!r.re) continue;
      r.re.lastIndex = 0;
      let m;
      while ((m = r.re.exec(text))) {
        if (!m[0]) { r.re.lastIndex++; continue; }
        push({
          id: `${r.id}:${m.index}:${m[0].length}`,
          rule: eff,
          start: m.index,
          end: m.index + m[0].length,
          text: m[0],
          match: [...m],
          document: false,
          layer: r.layer,
        });
      }
    }

    // Overlaps: keep one per span, earlier layer wins (hollow > structure > artifact > lexicon).
    const kept = found.filter((i) => i.document);
    found
      .filter((i) => !i.document)
      .sort((a, b) => a.start - b.start || rank(a.layer) - rank(b.layer) || b.end - a.end)
      .forEach((i) => {
        const clash = kept.find((k) => !k.document && !(i.end <= k.start || i.start >= k.end));
        if (!clash) { kept.push(i); return; }
        if (rank(i.layer) < rank(clash.layer)) kept[kept.indexOf(clash)] = i;
      });

    kept.sort((a, b) => {
      const la = rank(a.layer), lb = rank(b.layer);
      if (la !== lb) return la - lb;
      const sa = a.rule.severity === "strong" ? 0 : 1;
      const sb = b.rule.severity === "strong" ? 0 : 1;
      if (sa !== sb) return sa - sb;
      return (a.start ?? 1e15) - (b.start ?? 1e15);
    });
    return kept;
  }

  /** Full check: issues (incl. document-level) + score. */
  function analyze(text, opts = {}) {
    const detected = opts.language && opts.language !== "auto" ? opts.language : detectLanguage(text);
    const issues = scan(text, opts).concat(documentIssues(text, detected));
    return { language: detected, issues, score: score(text, issues, detected) };
  }

  function proposedFix(text, issue) {
    if (!issue || issue.document || issue.start == null) return null;
    if (!issue.rule.auto || !issue.rule.fixSpec) return null;
    const replacement = applyFixSpec(issue.rule.fixSpec, issue.text, issue.match);
    return normalizeAfterFix(text.slice(0, issue.start) + replacement + text.slice(issue.end));
  }

  /** Apply one safe fix. Returns { ok, text, reason }. */
  function applyIssue(text, issue) {
    const after = proposedFix(text, issue);
    if (after == null) return { ok: false, text, reason: "not_auto" };
    if (!conservesInformation(text, after)) return { ok: false, text, reason: "conservation" };
    return { ok: true, text: after };
  }

  /** Apply every safe fix from the end of the text backwards. */
  function autofix(text, issues) {
    const safe = issues
      .filter((i) => !i.document && i.rule.auto && i.rule.fixSpec && i.start != null)
      .sort((a, b) => b.start - a.start);
    let out = text;
    let applied = 0;
    for (const i of safe) {
      const replacement = applyFixSpec(i.rule.fixSpec, i.text, i.match);
      const proposed = out.slice(0, i.start) + replacement + out.slice(i.end);
      if (!conservesInformation(out, proposed)) continue;
      out = proposed;
      applied++;
    }
    return { text: normalizeAfterFix(out), applied, skipped: safe.length - applied };
  }

  return { rules, scan, analyze, applyIssue, autofix, proposedFix, issueKey };
}
