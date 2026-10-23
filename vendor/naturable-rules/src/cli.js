// naturable-check — run the rules on a file or stdin and print issues.
// Usage:
//   naturable-check draft.md                 human-readable report
//   naturable-check draft.md --json          machine-readable (for agents)
//   cat draft.md | naturable-check --purpose email --lang en
//   naturable-check draft.md --fix           print text with only auto-safe fixes applied

import { readFileSync } from "node:fs";
import { engine, packs } from "./index.js";

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const file = args.find((a, i) => !a.startsWith("--") && !["--purpose", "--lang"].includes(args[i - 1]));

if (flag("help")) {
  console.log("naturable-check [file] [--json] [--fix] [--purpose general|blog|email|marketing|academic|social|technical] [--lang auto|en|zh]");
  process.exit(0);
}

const text = file ? readFileSync(file, "utf8") : readFileSync(0, "utf8");
const purpose = opt("purpose", "general");
const language = opt("lang", "auto");
const result = engine.analyze(text, { purpose, language });

if (flag("fix")) {
  process.stdout.write(engine.autofix(text, result.issues).text + "\n");
  process.exit(0);
}

const lineCol = (pos) => {
  const before = text.slice(0, pos);
  const line = before.split("\n").length;
  return { line, col: pos - before.lastIndexOf("\n") };
};

const issues = result.issues.map((i) => ({
  rule: i.rule.id,
  name: i.rule.language === "zh" ? i.rule.name_zh || i.rule.title : i.rule.name_en || i.rule.title,
  severity: i.rule.severity,
  category: i.rule.category,
  text: i.text,
  ...(i.start != null ? lineCol(i.start) : { document: true }),
  start: i.start,
  end: i.end,
  why: i.rule.reason,
  suggestion: i.rule.suggestion,
  safe_fix: !!(i.rule.auto && i.rule.fixSpec && !i.document),
  learn_more: i.rule.docs,
}));

const pack = packs[result.language] || packs.en;
const out = {
  language: result.language,
  purpose,
  rules_version: pack.version,
  score: result.score.total,
  score_note: "Heuristic writing indicator, not an AI-authorship probability.",
  issues,
};

if (flag("json")) {
  console.log(JSON.stringify(out, null, 2));
} else {
  console.log(`Naturable ${out.rules_version} · ${out.language} · purpose=${purpose} · score ${out.score}/100 (pattern score, not an AI detector)\n`);
  if (!issues.length) console.log("No common AI writing patterns found.");
  issues.forEach((i, n) => {
    const where = i.document ? "document" : `L${i.line}:${i.col}`;
    console.log(`${n + 1}. [${i.severity}] ${i.name} (${i.rule}) @ ${where}`);
    if (i.text) console.log(`   "${i.text}"`);
    console.log(`   why: ${i.why}`);
    console.log(`   fix: ${i.suggestion}${i.safe_fix ? "  [safe auto-fix available]" : ""}`);
    if (i.learn_more) console.log(`   more: ${i.learn_more}`);
    console.log("");
  });
}
