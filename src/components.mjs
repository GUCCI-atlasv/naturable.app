// Server-rendered markup for the interactive tools. The client scripts in public/assets/js take over on load;
// until then (or without JS) the sample result is shown, computed here with the same engine.
import { engine } from "../vendor/naturable-rules/src/index.js";
import { esc, icons } from "./layout.mjs";
import { docsFor } from "./docs.mjs";

const L = {
  en: {
    title: "Check a draft", local: "Runs in your browser · nothing is uploaded", draft: "Your draft",
    placeholder: "Paste an email, essay or post…", check: "Check", edit: "Edit text", sample: "Try a sample", clear: "Clear",
    openEditor: "Open the full editor", editor: "/en/app/", of: "/ 100",
    note: "Pattern score. It doesn't tell you whether a person or an AI wrote the text.",
    strong: "Strong", suggestion: "Suggestion", noIssues: "No common AI patterns found.", learnMore: "Learn more",
    counts: (s, g) => `${s} strong · ${g} suggestion${g === 1 ? "" : "s"}`, more: (n) => `+${n} more in the full editor →`,
    natural: "Reads mostly natural", some: "Some AI patterns", many: "Many AI patterns",
    layers: { hollow: "Hollow claims", structure: "Structure", artifact: "Assistant leftovers", lexicon: "Word choice" },
    byCategory: "Hits by category",
  },
  zh: {
    title: "检查草稿", local: "在浏览器里运行 · 文本不上传", draft: "你的文本",
    placeholder: "粘贴博客、邮件或营销稿……", check: "检查", edit: "编辑文本", sample: "示例", clear: "清空",
    openEditor: "打开完整编辑器", editor: "/zh-cn/app/", of: "/ 100",
    note: "自然度评分是改稿参考，不能说明文本是人写的还是 AI 写的。",
    strong: "明确问题", suggestion: "改进建议", noIssues: "没有发现常见的 AI 写作模式。", learnMore: "了解更多",
    counts: (s, g) => `${s} 个明确问题 · ${g} 条建议`, more: (n) => `还有 ${n} 处，打开完整编辑器 →`,
    natural: "整体较自然", some: "有一些 AI 写作模式", many: "AI 写作模式较多",
    layers: { hollow: "空洞主张", structure: "结构", artifact: "助手残留", lexicon: "用词" },
    byCategory: "按类别统计",
  },
};

function band(total, l) {
  if (total == null) return { cls: "none", label: "" };
  if (total >= 80) return { cls: "ok", label: l.natural };
  if (total >= 60) return { cls: "warn", label: l.some };
  return { cls: "bad", label: l.many };
}

function highlight(text, issues, tag = "mark") {
  const ranged = issues.filter((i) => !i.document && i.start != null).sort((a, b) => a.start - b.start);
  let pos = 0, out = "";
  for (const i of ranged) {
    if (i.start < pos) continue;
    out += esc(text.slice(pos, i.start));
    const sev = i.rule.severity === "strong" ? "strong" : "suggestion";
    out += `<${tag} class="hit hit-${sev}" title="${esc(i.rule.title + ": " + i.rule.reason)}">${esc(text.slice(i.start, i.end))}</${tag}>`;
    pos = i.end;
  }
  return out + esc(text.slice(pos));
}

export const SAMPLES = {
  en: "Great question! In today's digital landscape, experts believe this robust technology is not just a tool, it's a pivotal shift. In order to leverage it, teams could potentially rethink their work. The future looks bright. I hope this helps!",
  enEditor:
    "Great question! In today's digital landscape, experts believe this robust technology is not just a tool, it's a pivotal shift. In order to leverage it, teams could potentially rethink their work.\n\nFurthermore, the future looks bright. Our pilot cut review time from 4 days to 1, and it is clear that adoption will rise. I hope this helps!",
  zh: "值得注意的是，人工智能正在赋能各行各业。首先，它可以提升效率；其次，它能够助力创新。此外，有研究表明，这项技术不仅改变了工作方式，更将开启新的篇章。希望这对你有所帮助！",
};

/**
 * Embeddable checker (design: "Component — embeddable checker").
 * opts: { lang, sample, limit, purpose, cats (show per-category counts), only (rule ids), heading }
 */
export function checker(opts = {}) {
  const lang = opts.lang || "en";
  const l = L[lang];
  const sample = opts.sample ?? SAMPLES[lang];
  const limit = opts.limit ?? 4;
  const purpose = opts.purpose || "general";
  const only = opts.only ? new Set(opts.only) : null;
  const res = engine.analyze(sample, { purpose, only: only || undefined });
  const issues = only ? res.issues.filter((i) => only.has(i.rule.id)) : res.issues;
  const total = res.score.total;
  const b = band(total, l);
  const strong = issues.filter((i) => i.rule.severity === "strong").length;
  const rest = issues.length - Math.min(limit, issues.length);
  const byLayer = {};
  for (const i of issues) byLayer[i.rule.layer] = (byLayer[i.rule.layer] || 0) + 1;
  const id = opts.id || "nat-draft";

  const findings = issues
    .slice(0, limit)
    .map((i) => {
      const sev = i.rule.severity === "strong" ? "strong" : "suggestion";
      return `<li class="finding"><div class="finding-head"><span class="sev sev-${sev}">${sev === "strong" ? l.strong : l.suggestion}</span><span class="finding-name">${esc(i.rule.title)}</span></div><span class="quote">“${esc(i.text)}”</span><span class="finding-why">${esc(i.rule.reason)}</span><span class="finding-fix"><span class="arrow" aria-hidden="true">→ </span>${esc(i.rule.suggestion)} </span><a class="finding-more" href="${esc(docsFor(i))}">${l.learnMore}</a></li>`;
    })
    .join("");

  return `<section class="checker" aria-label="${lang === "zh" ? "AI 写作模式检查" : "AI writing pattern checker"}" data-checker data-limit="${limit}" data-purpose="${purpose}"${opts.only ? ` data-only="${opts.only.join(",")}"` : ""}>
  <div class="checker-top">
    <h2>${esc(opts.heading || l.title)}</h2>
    <p class="local-note">${icons.lock}${l.local}</p>
  </div>
  <div class="checker-body">
    <div class="checker-main">
      <div data-el="edit" hidden>
        <label class="field-label" for="${id}">${l.draft}</label>
        <textarea class="draft-input" id="${id}" data-el="input" placeholder="${esc(l.placeholder)}" spellcheck="true">${esc(sample)}</textarea>
      </div>
      <div data-el="review">
        <p class="draft-view" data-el="view" title="${lang === "zh" ? "点击编辑" : "Click to edit"}">${highlight(sample, issues)}</p>
      </div>
      <div class="checker-actions">
        <button type="button" class="btn btn-primary" data-el="check" hidden>${l.check}</button>
        <button type="button" class="btn btn-primary" data-el="edit-btn">${l.edit}</button>
        <button type="button" class="btn" data-el="sample">${l.sample}</button>
        <button type="button" class="btn btn-ghost" data-el="clear">${l.clear}</button>
        <a class="to-editor" href="${l.editor}" data-handoff>${l.openEditor} <span aria-hidden="true">→</span></a>
      </div>
    </div>
    <div class="checker-side" aria-live="polite">
      <div class="score-row">
        <span class="score-num ink-${b.cls}" data-el="score">${total}</span>
        <span class="score-of">${l.of}</span>
        <span class="score-label ink-${b.cls}" data-el="score-label">${b.label}</span>
      </div>
      <div class="meter" aria-hidden="true"><span class="bg-${b.cls}" data-el="meter" style="width:${total}%"></span></div>
      <p class="fine">${l.note}</p>
      <p class="count-line" data-el="count">${l.counts(strong, issues.length - strong)}</p>
      ${opts.cats ? `<div><span class="sr-only">${l.byCategory}</span><ul class="cat-stats" data-el="cats">${Object.entries(l.layers).map(([k, v]) => `<li>${v} <b>${byLayer[k] || 0}</b></li>`).join("")}</ul></div>` : ""}
      <p class="clean-line" data-el="clean" hidden>${icons.check.replace('stroke="#2F5F3F"', 'stroke="currentColor"')}${l.noIssues}</p>
      <ol class="findings" data-el="findings">${findings}</ol>
      <a class="more-link" href="${l.editor}" data-el="more" data-handoff${rest > 0 ? "" : " hidden"}>${l.more(rest)}</a>
    </div>
  </div>
</section>`;
}

/** Full editor (design: "Editor"). */
export function editor({ lang = "en" } = {}) {
  const zh = lang === "zh";
  const sample = zh ? SAMPLES.zh : SAMPLES.enEditor;
  const purposes = zh
    ? [["general", "通用"], ["blog", "博客"], ["email", "邮件"], ["marketing", "营销"], ["academic", "学术"], ["social", "社交媒体"], ["technical", "技术文档"]]
    : [["general", "General"], ["blog", "Blog"], ["email", "Email"], ["marketing", "Marketing"], ["academic", "Academic"], ["social", "Social post"], ["technical", "Technical"]];
  const res = engine.analyze(sample, { purpose: "blog" });
  const s = (en, z) => (zh ? z : en);
  return `<div class="wrap-wide editor-shell" data-editor data-purpose="blog">
  <template data-el="sample">${esc(sample)}</template>
  <div class="ed-toolbar">
    <h1>${s("Editor", "编辑器")}</h1>
    <span class="ed-meta" data-el="meta">${s("Loading the rules…", "正在加载规则……")}</span>
    <div class="ed-purpose">
      <label for="ed-purpose">${s("Writing for", "写作场景")}</label>
      <select class="select" id="ed-purpose" data-el="purpose">${purposes.map(([v, t]) => `<option value="${v}"${v === "blog" ? " selected" : ""}>${t}</option>`).join("")}</select>
    </div>
    <div class="ed-tools">
      <button type="button" class="icon-btn" aria-label="${s("Undo", "撤销")}" title="${s("Undo", "撤销")}" data-el="undo">${icons.undo}</button>
      <button type="button" class="icon-btn" aria-label="${s("Copy text", "复制")}" title="${s("Copy text", "复制")}" data-el="copy">${icons.copy}</button>
      <button type="button" class="icon-btn" aria-label="${s("Import TXT or Markdown", "导入 TXT / Markdown")}" title="${s("Import TXT or Markdown", "导入 TXT / Markdown")}" data-el="import">${icons.importIcon}</button>
      <input type="file" accept=".txt,.md,.markdown,text/plain,text/markdown" data-el="file" hidden>
      <span style="position:relative;display:inline-flex">
        <button type="button" class="icon-btn" aria-label="${s("Export Markdown or HTML", "导出 Markdown / HTML")}" title="${s("Export Markdown or HTML", "导出 Markdown / HTML")}" aria-haspopup="true" aria-expanded="false" data-el="export">${icons.exportIcon}</button>
        <span data-el="export-menu" hidden style="position:absolute;top:44px;right:0;z-index:5;background:#fff;border:1px solid var(--line);border-radius:10px;padding:6px;display:flex;flex-direction:column;gap:4px;box-shadow:0 8px 24px rgba(31,29,26,.12)">
          <button type="button" class="btn btn-ghost btn-sm" data-kind="md">Markdown (.md)</button>
          <button type="button" class="btn btn-ghost btn-sm" data-kind="html">HTML (.html)</button>
        </span>
      </span>
      <button type="button" class="icon-btn" aria-label="${s("Clear draft", "清空")}" title="${s("Clear draft", "清空")}" data-el="clear">${icons.trash}</button>
      <span class="sep" aria-hidden="true"></span>
      <button type="button" class="btn btn-md" data-el="fix-all">${s("Fix safe", "一键修复")}</button>
      <button type="button" class="btn btn-primary btn-md" data-el="mode">${s("Edit text", "编辑文本")}</button>
    </div>
  </div>

  <div class="ed-layout">
    <section class="ed-draft" aria-label="${s("Draft", "草稿")}">
      <div class="ed-paper">
        <div data-el="edit" hidden>
          <label for="ed-text">${s("Your draft (press Check when you're done)", "你的文本（写完后点「检查」）")}</label>
          <textarea class="ed-text" id="ed-text" data-el="input" spellcheck="true"></textarea>
        </div>
        <p class="ed-view" data-el="view">${highlight(sample, res.issues)}</p>
      </div>
      <details class="ed-diff" data-el="diff">
        <summary>${s("Changes since first check", "修改对比")} <span>· <span data-el="diff-line">${s("no edits yet", "还没有修改")}</span></span></summary>
        <p data-el="diff-body"></p>
      </details>
    </section>

    <aside class="ed-side" aria-label="${s("Findings", "问题与建议")}">
      <div class="ed-score">
        <div class="score-row">
          <span class="score-num" data-el="score">${res.score.total}</span>
          <span class="score-of">/ 100</span>
          <span class="counts"><strong data-el="strong">${res.score.strong}</strong> ${s("strong", "个明确问题")}<br><strong data-el="sugg">${res.score.suggestions}</strong> ${s("suggestions", "条建议")}</span>
        </div>
        <div class="dims" data-el="dims"></div>
        <p class="fine">${s("Pattern score for editing. It doesn't tell you whether a person or an AI wrote the text.", "自然度评分是改稿参考，不能说明文本是人写的还是 AI 写的。")}</p>
      </div>
      <div class="tabs" role="tablist" aria-label="${s("Filter findings", "筛选")}" data-el="tabs"></div>
      <ol class="findings" data-el="items"></ol>
      <button type="button" class="restore" data-el="restore" hidden></button>
      <p class="fine">${s("Rules", "规则")} <span data-el="version"></span> · ${s("open source · checks run on this device", "开源 · 检查只在本机运行")}</p>
    </aside>
  </div>
  <noscript><p class="fine">${s("The editor needs JavaScript. The rules run in your browser; nothing is sent to a server.", "编辑器需要 JavaScript。规则在你的浏览器中运行，不会发送到服务器。")}</p></noscript>
</div>`;
}

/** Em dash tool (design: "Em dash tool"). */
export function emDashTool() {
  const sample = "The launch plan — dates, owners and budget — is ready. We tested it with three teams — and it held up. Next step — sign-off on Friday.";
  return `<section class="tool-panel" aria-label="Em dash tool" data-emdash>
  <div class="tool-main">
    <label class="field-label" for="dash-text">Your draft</label>
    <textarea class="draft-input" id="dash-text" data-el="input" style="min-height:180px">${esc(sample)}</textarea>
    <span class="field-label" style="margin-top:6px">Result</span>
    <p class="result-box" data-el="output" aria-live="polite">${esc(sample)}</p>
    <div class="checker-actions">
      <button type="button" class="btn btn-primary" data-el="copy">Copy result</button>
      <button type="button" class="btn" data-el="use">Use result as draft</button>
      <button type="button" class="btn" data-el="all-comma">Set all to comma</button>
      <button type="button" class="btn" data-el="all-keep">Keep all</button>
    </div>
  </div>
  <div class="tool-side">
    <div class="stat-grid">
      <div class="stat"><span class="k">Em dashes</span><span class="v" data-el="count">4</span></div>
      <div class="stat"><span class="k">Per 1,000 words</span><span class="v" data-el="density">—</span></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px">
      <div class="density" aria-hidden="true"><i data-el="marker" style="left:100%"></i></div>
      <p class="verdict-note"><strong data-el="verdict">Heavy.</strong> Naturable flags drafts with 3 or more dashes and 8+ per 1,000 words (rule <code>en.structure.dash_dense</code>). That threshold is our starting rule, not a scientific line.</p>
    </div>
    <ol class="dash-list" data-el="list" aria-label="Each dash and its replacement"></ol>
  </div>
</section>`;
}

/** Burstiness calculator (design: "Burstiness calculator"). */
export function burstinessTool() {
  const sample =
    "Our team reviewed the quarterly results in detail. The numbers showed steady growth across regions. The new pricing model performed better than expected. Customer churn declined compared to last quarter. Then it broke. One region lost a third of its accounts in a week, and nobody saw it coming because the dashboard averaged it away. We fixed the dashboard first.";
  const stat = (k, el) => `<div class="stat"><span class="k">${k}</span><span class="v" data-el="${el}">—</span></div>`;
  return `<section class="tool-panel col" aria-label="Burstiness tool" data-burstiness>
  <div style="display:flex;flex-wrap:wrap;gap:20px">
    <div class="tool-main" style="gap:8px">
      <label class="field-label" for="b-text">Your draft</label>
      <textarea class="draft-input" id="b-text" data-el="input">${esc(sample)}</textarea>
    </div>
    <div class="tool-side" style="flex-basis:300px">
      <div class="stat-grid">
        ${stat("Sentences", "n")}${stat("Avg. words", "mean")}${stat("Std. deviation", "sd")}${stat("Burstiness (sd ÷ mean)", "cv")}
      </div>
      <div class="stat"><span class="k">Rhythm score (same as the editor)</span><span class="v" data-el="rhythm">—</span></div>
      <p class="verdict-note" style="font-size:14px"><strong data-el="verdict">—</strong> <span data-el="note"></span></p>
    </div>
  </div>
  <figure class="chart">
    <figcaption><span>Words per sentence, in order</span><span class="legend"><span><i></i>sentence</span><span><i class="run"></i>part of a same-length run</span></span></figcaption>
    <div class="bars" role="img" data-el="bars" aria-label="Sentence length chart"></div>
  </figure>
  <div hidden><p class="field-label" style="margin:0 0 6px">Same-length runs to look at</p><ul class="run-list" data-el="runs"></ul></div>
</section>`;
}
