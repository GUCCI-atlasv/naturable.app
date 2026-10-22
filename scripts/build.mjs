// Static build for naturable.app (Cloudflare Pages). Output: out/
// node scripts/build.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

import { engine, packs } from "../vendor/naturable-rules/src/index.js";
import { SITE } from "../src/site.mjs";
import { renderPage, abs } from "../src/layout.mjs";
import { DOCS } from "../src/docs.mjs";
import { WORD_GROUPS, PHRASE_GROUPS } from "../src/content/ai-words.mjs";
import { TELLS } from "../src/content/tells.mjs";
import home from "../src/pages/home.mjs";
import wordsPage from "../src/pages/words.mjs";
import signsPage from "../src/pages/signs.mjs";
import { humanizers, emDash, burstiness } from "../src/pages/articles.mjs";
import { editorPages, extensionPage, howItWorks, privacyPages, learnIndex, legacyPage, notFound } from "../src/pages/site-pages.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(root, "out");
const errors = [];
const warnings = [];

// ---------------------------------------------------------------- redirects (PRD §5.8)
// Old URL -> new URL. Also used to rewrite links inside imported legacy articles.
const REDIRECTS = {
  "/": "/en/",
  "/privacy": "/en/privacy/",
  "/terms": "/en/terms/",
  "/about": "/en/about/",
  "/app": "/en/app/",
  "/en/learn/remove-ai-writing-style/": "/en/",
  "/en/learn/how-to-remove-ai-tells/": "/en/signs-of-ai-writing/",
  "/en/pricing/": "/en/",
  "/zh-cn/pricing/": "/zh-cn/",
};

// ---------------------------------------------------------------- content checks against the rules
function hitsFor(text) {
  return engine.analyze(text, { purpose: "general", language: "en" }).issues;
}

// Words: which entries does the engine flag? (checked vs. watch list)
const annotated = {};
for (const g of WORD_GROUPS) {
  for (const [word, , , , before, after] of g.entries) {
    const hits = hitsFor(before).filter((i) => !i.document && i.text && i.text.toLowerCase().includes(word.toLowerCase().split(" ")[0]));
    const hit = hits[0];
    annotated[word] = { checked: !!hit, ruleId: hit ? hit.rule.id : null };
    if (!before.toLowerCase().includes(word.toLowerCase().slice(0, 5))) errors.push(`words: "${word}" — before example doesn't use the word: ${before}`);
    if (hit) {
      const still = hitsFor(after).filter((i) => i.rule.id === hit.rule.id);
      if (still.length) errors.push(`words: "${word}" — after example still triggers ${hit.rule.id}: ${after}`);
    }
  }
}
for (const g of PHRASE_GROUPS) {
  for (const [phrase, , before, after] of g.entries) {
    const hits = hitsFor(before).filter((i) => !i.document);
    const hit = hits.find((i) => i.text.toLowerCase().includes(phrase.toLowerCase().replace(/[,:!.]$/, "").split(" ").slice(0, 2).join(" ")));
    annotated[phrase] = { checked: !!hit, ruleId: hit ? hit.rule.id : null };
    if (hit && hitsFor(after).some((i) => i.rule.id === hit.rule.id)) errors.push(`phrases: "${phrase}" — after example still triggers ${hit.rule.id}: ${after}`);
  }
}

// Tells: each before must trigger one of its rules; after must trigger none of them.
const ruleIds = new Set(packs.en.rules.map((r) => r.id));
for (const t of TELLS) {
  for (const id of t.rules) if (!ruleIds.has(id)) errors.push(`tells: ${t.id} references unknown rule ${id}`);
  const b = hitsFor(t.before).map((i) => i.rule.id);
  const a = hitsFor(t.after).map((i) => i.rule.id);
  if (!t.rules.some((id) => b.includes(id))) errors.push(`tells: ${t.id} before doesn't trigger ${t.rules.join("/")} (got ${b.join(", ") || "nothing"})`);
  const bad = t.rules.filter((id) => a.includes(id));
  if (bad.length) errors.push(`tells: ${t.id} after still triggers ${bad.join(", ")}`);
}

// ---------------------------------------------------------------- pages
const legacyDir = join(root, "content", "legacy");
const legacy = Object.fromEntries(
  readdirSync(legacyDir).filter((f) => f.endsWith(".json")).map((f) => {
    const p = JSON.parse(readFileSync(join(legacyDir, f), "utf8"));
    return [p.path, p];
  }),
);
const mapLink = (href) => REDIRECTS[href] || href;
const zhAlt = (path) => {
  const z = path.replace(/^\/en\//, "/zh-cn/");
  return legacy[z] || ["/zh-cn/", "/zh-cn/app/", "/zh-cn/privacy/", "/zh-cn/learn/"].includes(z) ? z : undefined;
};

const pages = [];
pages.push(...home());
pages.push(wordsPage({ annotated }));
pages.push(signsPage());
pages.push(humanizers(), emDash(), burstiness());
pages.push(...editorPages(), extensionPage(), howItWorks(), ...privacyPages(), notFound());

// Legacy pages kept as-is in the new template: EN about/terms + 3 articles, and every ZH page (PRD §5.9).
const KEEP_EN = ["/en/about/", "/en/terms/", "/en/learn/common-patterns-in-chinese-ai-copy/", "/en/learn/make-a-stiff-email-more-direct/", "/en/learn/replace-claims-with-evidence/"];
const KEEP_ZH = Object.keys(legacy).filter((p) => p.startsWith("/zh-cn/") && p !== "/zh-cn/privacy/");
for (const path of [...KEEP_EN, ...KEEP_ZH]) {
  const p = legacy[path];
  let alternate;
  if (p.lang === "en") alternate = zhAlt(path);
  else {
    const en = path.replace(/^\/zh-cn\//, "/en/");
    alternate = REDIRECTS[en] ? undefined : en;
  }
  // Content dates come from the old site's Article schema; pages without one get no lastmod.
  pages.push(legacyPage(p, { alternate, mapLink, updated: p.dateModified || null }));
}

// Learn indexes
const enPosts = [
  { path: "/en/signs-of-ai-writing/", topic: "Guide", h1: "Signs of AI writing: 15 tells and how to fix each one", lede: "The patterns that make a draft feel machine-written, with a fix for each, and what they can't tell you." },
  { path: "/en/ai-words-to-avoid/", topic: "Word list", h1: "AI words to avoid, and what to write instead", lede: "Delve, tapestry, leverage and 100+ more words and phrases, each with a plainer alternative." },
  { path: "/en/learn/do-ai-humanizers-work/", topic: "Honest review", h1: "Do AI humanizers work?", lede: "What one-click rewriters change, what they break, and a better editing workflow." },
  { path: "/en/chatgpt-em-dash/", topic: "Tool", h1: "Why does ChatGPT use so many em dashes?", lede: "Count your em dashes per 1,000 words and replace each one." },
  { path: "/en/learn/what-is-perplexity-and-burstiness/", topic: "Tool", h1: "Burstiness and perplexity, with a calculator", lede: "See your sentence-length rhythm and what the metrics can and can't tell you." },
  ...KEEP_EN.filter((p) => p.includes("/learn/")).map((p) => legacy[p]),
];
const zhPosts = KEEP_ZH.filter((p) => p.includes("/learn/")).map((p) => legacy[p]);
pages.push(learnIndex("en", enPosts), learnIndex("zh", zhPosts));

// ---------------------------------------------------------------- write
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(join(root, "public"), OUT, { recursive: true });
mkdirSync(join(OUT, "assets", "js"), { recursive: true });
cpSync(join(root, "vendor/naturable-rules/dist/naturable.iife.js"), join(OUT, "assets/js/naturable.iife.js"));
writeFileSync(join(OUT, "assets/js/docs.js"), `/* Generated by scripts/build.mjs — rule/word -> explanation page. */\nwindow.NAT_DOCS = ${JSON.stringify(DOCS)};\n`);

// Downloads (CC BY 4.0): the word list as CSV + JSON.
mkdirSync(join(OUT, "downloads"), { recursive: true });
const rows = [];
for (const g of WORD_GROUPS) for (const [word, pos, why, instead, before, after] of g.entries) rows.push({ term: word, type: "word", group: g.id, pos, why, instead, before, after, status: annotated[word].checked ? "checked" : "watch", rule: annotated[word].ruleId || "", url: abs("/en/ai-words-to-avoid/#" + word.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")) });
for (const g of PHRASE_GROUPS) for (const [phrase, instead, before, after] of g.entries) rows.push({ term: phrase, type: "phrase", group: g.id, pos: "phrase", why: g.intro, instead, before, after, status: annotated[phrase].checked ? "checked" : "watch", rule: annotated[phrase].ruleId || "", url: abs("/en/ai-words-to-avoid/#" + g.id) });
const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const cols = ["term", "type", "group", "pos", "why", "instead", "before", "after", "status", "rule", "url"];
writeFileSync(join(OUT, "downloads/ai-words-to-avoid.csv"), "﻿" + [cols.join(","), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(","))].join("\r\n") + "\r\n");
writeFileSync(
  join(OUT, "downloads/ai-words-to-avoid.json"),
  JSON.stringify({ name: "Naturable AI words to avoid", source: abs("/en/ai-words-to-avoid/"), license: "CC BY 4.0 — credit \"Naturable (naturable.app)\" with a link", rules: packs.en.version, generated: new Date().toISOString().slice(0, 10), terms: rows }, null, 2) + "\n",
);

// Asset version = hash of CSS + JS, appended as ?v= so assets can be cached forever.
const hash = createHash("sha1");
for (const f of ["assets/css/site.css", ...readdirSync(join(OUT, "assets/js")).map((f) => "assets/js/" + f)]) hash.update(readFileSync(join(OUT, f)));
const assetVersion = hash.digest("hex").slice(0, 10);

const seen = new Set();
for (const p of pages) {
  if (seen.has(p.path)) errors.push(`duplicate page ${p.path}`);
  seen.add(p.path);
  const html = renderPage({ ...p, assetVersion });
  const file = p.path.endsWith(".html") ? join(OUT, p.path) : join(OUT, p.path, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  p.html = html;
}

// _redirects (Cloudflare Pages). Explicit 301s for slashless URLs override the default 308.
const redirectLines = Object.entries(REDIRECTS).map(([from, to]) => `${from} ${to} 301`);
for (const [from, to] of Object.entries(REDIRECTS)) if (from.endsWith("/") && from !== "/") redirectLines.push(`${from.slice(0, -1)} ${to} 301`);
for (const p of pages) if (!p.noindex && p.path.endsWith("/") && p.path !== "/") redirectLines.push(`${p.path.slice(0, -1)} ${p.path} 301`);
writeFileSync(join(OUT, "_redirects"), `# Generated by scripts/build.mjs\n# www -> apex is a Cloudflare zone rule (Pages _redirects can't match hosts).\n${[...new Set(redirectLines)].join("\n")}\n`);

writeFileSync(
  join(OUT, "_headers"),
  `# Generated by scripts/build.mjs
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
  X-Frame-Options: DENY

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/downloads/*
  Cache-Control: public, max-age=3600
  Access-Control-Allow-Origin: *
`,
);

// sitemap.xml — lastmod is each page's own content date (PRD §5.8), omitted where unknown.
const indexable = pages.filter((p) => !p.noindex);
const altFor = (p) => {
  if (!p.alternate) return "";
  const en = p.lang === "en" ? p.path : p.alternate;
  const zh = p.lang === "zh" ? p.path : p.alternate;
  return `\n    <xhtml:link rel="alternate" hreflang="en" href="${abs(en)}"/>\n    <xhtml:link rel="alternate" hreflang="zh-CN" href="${abs(zh)}"/>\n    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(en)}"/>`;
};
writeFileSync(
  join(OUT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${indexable
  .sort((a, b) => (a.lang === b.lang ? 0 : a.lang === "en" ? -1 : 1))
  .map((p) => `  <url>\n    <loc>${abs(p.path)}</loc>${p.updated ? `\n    <lastmod>${p.updated}</lastmod>` : ""}${altFor(p)}\n  </url>`)
  .join("\n")}
</urlset>
`,
);

writeFileSync(
  join(OUT, "llms.txt"),
  `# Naturable

> A local, explainable checker for AI writing patterns. It finds what reads like AI in a draft and explains each flag; the writer decides what to change. Runs in the browser; text is not uploaded.

## Crawling / citation

- AI *search and citation* use is welcome (indexing, linking, short excerpts, grounded answers that cite this site).
- This site is **not** offered as a training dump. Prefer linking to the URLs below.
- Rule data is CC BY 4.0: credit "Naturable (naturable.app)" with a link.

## Key URLs

${indexable.filter((p) => p.lang === "en").map((p) => `- ${abs(p.path)} — ${p.title}`).join("\n")}
- ${abs("/zh-cn/")} — 简体中文
- ${abs("/downloads/ai-words-to-avoid.json")} — word list (JSON, CC BY 4.0)

## What it is / is not

- Is: on-device pattern checks with a reason and a suggestion for every flag; open, versioned rules (${packs.en.version}, ${packs.zh.version} beta)
- Is not: an AI detector, a detector-bypass tool, a one-click humanizer, or a cloud rewrite service
`,
);

// ---------------------------------------------------------------- link + anchor check
const files = new Set();
(function walk(dir, rel) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const r = rel + "/" + f.name;
    if (f.isDirectory()) walk(join(dir, f.name), r);
    else files.add(r);
  }
})(OUT, "");
const idsByPath = {};
for (const p of pages) idsByPath[p.path] = new Set([...p.html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const resolves = (path) => files.has(path) || files.has(path.replace(/\/?$/, "/index.html")) || REDIRECTS[path] != null;
for (const p of pages) {
  for (const [, href] of p.html.matchAll(/\shref="([^"]+)"/g)) {
    if (/^(https?:|mailto:|data:)/.test(href)) continue;
    const [pathPart, hashPart] = href.split("#");
    const target = pathPart === "" ? p.path : pathPart.split("?")[0];
    if (!resolves(target)) errors.push(`${p.path}: broken link ${href}`);
    else if (hashPart && idsByPath[target] && !idsByPath[target].has(hashPart)) errors.push(`${p.path}: missing anchor ${href}`);
  }
}
for (const [id, href] of Object.entries(DOCS.rules)) {
  const [path, hashPart] = href.split("#");
  if (hashPart && !(idsByPath[path] || new Set()).has(hashPart)) errors.push(`docs: ${id} -> ${href} has no target`);
}
for (const href of new Set(Object.values(DOCS.words))) {
  const [path, hashPart] = href.split("#");
  if (!(idsByPath[path] || new Set()).has(hashPart)) errors.push(`docs: word link ${href} has no target`);
}

// Structured data: the fields Google's rich-result reports treat as required.
const APP_TYPES = new Set(["SoftwareApplication", "WebApplication", "MobileApplication"]);
for (const p of pages) {
  for (const [, json] of p.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let d;
    try { d = JSON.parse(json); } catch (e) { errors.push(`${p.path}: invalid JSON-LD (${e.message})`); continue; }
    const where = `${p.path}: ${d["@type"]}`;
    if (d["@type"] === "BreadcrumbList") {
      d.itemListElement.slice(0, -1).forEach((i) => { if (!i.item) errors.push(`${where} "${i.name}" is missing item`); });
    } else if (d["@type"] === "Article") {
      if (!d.headline || d.headline.length > 110) errors.push(`${where} headline missing or over 110 chars`);
      if (!d.datePublished) errors.push(`${where} missing datePublished`);
    } else if (d["@type"] === "FAQPage") {
      d.mainEntity.forEach((q) => { if (!q.name || !q.acceptedAnswer?.text) errors.push(`${where} has an empty question or answer`); });
    } else if (d["@type"] === "Dataset") {
      if (!d.description || d.description.length < 50) errors.push(`${where} description must be 50+ chars`);
    } else if (APP_TYPES.has(d["@type"])) {
      // Google requires aggregateRating or review for software rich results; don't add them without real data.
      if (!d.aggregateRating && !d.review) errors.push(`${where} needs aggregateRating or review (real data only)`);
    }
  }
}

if (!SITE.githubUrl) warnings.push("SITE.githubUrl is empty: GitHub links point to /en/how-it-works/#rules (src/site.mjs).");
if (!SITE.chromeStoreUrl) warnings.push("SITE.chromeStoreUrl is empty: \"Add to Chrome\" points to /en/chrome-extension/ (coming soon).");

const nChecked = Object.values(annotated).filter((a) => a.checked).length;
console.log(`built ${pages.length} pages, ${redirectLines.length} redirects · words/phrases: ${Object.keys(annotated).length} (${nChecked} checked by rules) · assets v=${assetVersion}`);
warnings.forEach((w) => console.warn("warn:", w));
if (errors.length) {
  errors.forEach((e) => console.error("error:", e));
  console.error(`${errors.length} error(s)`);
  process.exit(1);
}
