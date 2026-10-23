// Naturalness score: a heuristic writing indicator, NOT an AI-authorship probability.

import { sentences, burstiness } from "./text.js";

export function documentIssues(text, language) {
  if (language !== "en" && language !== "zh") return [];
  const s = sentences(text, language);
  if (s.length < 4) return [];
  const starts = s
    .map((x) => (language === "zh" ? x.slice(0, 2) : (x.match(/^\W*([A-Za-z]+)/) || [])[1]?.toLowerCase()))
    .filter(Boolean);
  const freq = {};
  starts.forEach((x) => { freq[x] = (freq[x] || 0) + 1; });
  const best = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
  if (!best || best[1] / s.length < 0.6) return [];
  const zh = language === "zh";
  const reason = zh
    ? `${s.length} 个句子中有 ${best[1]} 个以“${best[0]}”开头。`
    : `${best[1]} of ${s.length} sentences begin with “${best[0]}”.`;
  return [{
    id: `${language}.rhythm.repeated_start:doc`,
    rule: {
      id: `${language}.rhythm.repeated_start`,
      language,
      layer: "structure",
      category: "rhythm",
      severity: "suggestion",
      confidence: "medium",
      title: zh ? "句首同构" : "Repeated sentence openings",
      reason,
      suggestion: zh ? "调整句首与句子重心。" : "Vary the opening and sentence focus.",
      auto: false,
      safeFix: false,
      weight: 1,
      docs: zh ? "https://naturable.app/zh-cn/how-it-works/" : "https://naturable.app/en/signs-of-ai-writing/#same-shape-sentences",
    },
    start: null,
    end: null,
    text: "",
    document: true,
    layer: "structure",
  }];
}

export function score(text, issues, language) {
  const counts = { vocabulary: 0, sentence: 0, structure: 0, rhythm: 0, evidence: 0, artifact: 0 };
  for (const i of issues) {
    const w = i.rule.weight || 1;
    const base = i.rule.severity === "strong" ? 8 : 4;
    const cat = i.rule.category || "vocabulary";
    counts[cat] = (counts[cat] || 0) + base * w;
  }
  const b = language === "en" || language === "zh" ? burstiness(text, language) : { n: 0, cv: 0 };
  const rhythm = b.n < 3 ? null : Math.max(35, Math.min(100, Math.round(55 + b.cv * 55)));
  const dimensions = {
    clarity: Math.max(0, 100 - counts.vocabulary - counts.sentence),
    specificity: Math.max(0, 100 - counts.evidence * 1.4),
    rhythm,
    structure: Math.max(0, 100 - counts.structure - counts.rhythm),
    artifactFree: Math.max(0, 100 - counts.artifact * 1.8),
  };
  const vals = Object.values(dimensions).filter((x) => x !== null);
  const raw = Math.round(vals.reduce((a, v) => a + v, 0) / vals.length);
  const strong = issues.filter((i) => i.rule.severity === "strong").length;
  const artifacts = issues.filter((i) => i.rule.severity === "strong" && i.rule.category === "artifact").length;
  let cap = 100;
  if (strong >= 5) cap = 64;
  else if (strong >= 3) cap = 72;
  else if (strong >= 1) cap = 86;
  if (artifacts) cap = Math.min(cap, 68);
  return { total: Math.min(raw, cap), raw, cap, dimensions, rhythm: b, strong, suggestions: issues.length - strong };
}
