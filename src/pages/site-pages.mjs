import { esc, breadcrumbs, faqHtml, faqSchema, articleSchema, icons } from "../layout.mjs";
import { editor } from "../components.mjs";
import { ruleAnchor } from "../docs.mjs";
import { SITE, githubHref, chromeHref, cliCmd } from "../site.mjs";
import { packs, ENGINE_VERSION } from "../../vendor/naturable-rules/src/index.js";

const EDITOR_SCRIPTS = ["/assets/js/naturable.iife.js", "/assets/js/docs.js", "/assets/js/site.js", "/assets/js/editor.js"];

/* ---------------- Editor ---------------- */
export function editorPages() {
  return [
    {
      lang: "en",
      path: "/en/app/",
      alternate: "/zh-cn/app/",
      updated: "2026-10-22",
      title: "Editor: check and fix AI writing patterns locally — Naturable",
      description: "The full Naturable editor: highlights AI writing patterns, explains each one, applies safe fixes you approve, and compares versions. Drafts stay in your browser.",
      scripts: EDITOR_SCRIPTS,
      body: editor({ lang: "en" }),
    },
    {
      lang: "zh",
      path: "/zh-cn/app/",
      alternate: "/en/app/",
      updated: "2026-10-22",
      title: "本地去掉 AI 写作腔 — 编辑器 — Naturable",
      description: "打开编辑器，用浏览器内规则清套话、破结构。草稿不上云；每处修改由你确认。",
      scripts: EDITOR_SCRIPTS,
      body: editor({ lang: "zh" }),
    },
  ];
}

/* ---------------- Chrome extension landing (/en/chrome-extension/) ---------------- */
export function extensionPage() {
  const PATH = "/en/chrome-extension/";
  const live = !!SITE.chromeStoreUrl;
  const crumbs = breadcrumbs("en", [["Chrome extension", null]]);
  const FAQ = [
    ["Does the extension read everything I type?", "No. It's off until you turn it on for a site, and then it checks only the text box you're typing in, on your device. It never sends text anywhere. It won't turn on for banking, payment or sign-in sites, and it never reads password or payment fields."],
    ["Why does Chrome ask to \"read and change\" data on a site?", "That is Chrome's standard wording for letting an extension run on a site. Naturable asks for one site at a time, only when you turn it on there, and it only reads the text box you're typing in to draw underlines. Turning the site off in the popup removes the access again."],
    ["Does it work in Google Docs?", "Google Docs draws text on a canvas, so inline underlines can't reach it. Select the text and use \"Check with Naturable\", or paste it into the side panel."],
    ["Does it rewrite my text?", "No. It underlines patterns and explains them. You decide what to change."],
    ["Is it free?", "Yes. No account, no word limit."],
  ];
  const perms = [
    ["activeTab", "Check the text box you're using when you ask it to."],
    ["contextMenus", "Add \"Check with Naturable\" to the right-click menu."],
    ["sidePanel", "Show the full check in Chrome's side panel."],
    ["storage", "Remember your writing purpose and the phrases you've chosen to ignore, on this device."],
    ["scripting", "Start the checker on the sites you've turned on."],
    ["Site access (optional)", "Asked for one site at a time, only when you turn Naturable on for that site. Nothing is requested when you install it."],
  ];
  return {
    lang: "en",
    path: PATH,
    updated: "2026-10-23",
    title: "Naturable for Chrome — AI Writing Pattern Checker Extension",
    description: "Naturable for Chrome underlines AI writing patterns — AI words, template openers, em dashes — as you type in Gmail, LinkedIn, Notion and more. Runs locally; nothing is uploaded.",
    scripts: ["/assets/js/site.js"],
    schema: [
      crumbs.schema,
      faqSchema(FAQ)
    ],
    body: `<div class="wrap" style="padding-bottom:64px">
  ${crumbs.html}
  <section class="ext-hero" aria-labelledby="ext-h">
    <div class="text">
      <span class="brand" style="color:var(--bg);font-size:26px;min-height:0">Naturable<span style="color:var(--accent-soft)">.</span> for Chrome</span>
      <h1 id="ext-h">Spot AI-sounding writing where you type.</h1>
      <p>Naturable underlines template openers, vague sources and AI vocabulary in Gmail, LinkedIn, Notion and more.</p>
      <ul><li><i></i>Runs locally, nothing uploaded</li><li><i></i>Explains every flag</li><li><i></i>Open-source rules</li></ul>
      ${live
        ? `<a class="btn btn-light" href="${esc(SITE.chromeStoreUrl)}" style="align-self:flex-start">${icons.plus}Add to Chrome, free</a>`
        : `<p style="font-size:15px"><strong style="color:var(--bg)">Coming soon to the Chrome Web Store.</strong> Until then, the <a href="/en/app/" style="color:var(--accent-soft)">web editor</a> runs the same rules.</p>`}
    </div>
    <div class="ext-shot" aria-hidden="true">
      <div class="mail">
        <p class="h">To: design-team@example.com</p>
        <p class="s">Subject: Q3 launch plan</p>
        <p>I wanted to <span class="u">leverage</span> this week to share where the launch stands.</p>
        <p><span class="u">Experts believe</span> the new tier will lift conversion.</p>
      </div>
      <div class="pop">
        <div class="r"><span class="sev sev-strong">Strong</span><strong>Vague source</strong></div>
        <span class="w">The attribution can't be checked as written.</span>
        <span><span class="arrow">→ </span>Name the source and date, or cut it. You already have the pilot numbers.</span>
        <span class="acts"><span class="btn btn-sm">Ignore</span><span class="btn btn-ghost btn-sm">Learn more</span></span>
      </div>
    </div>
  </section>

  <section class="home-section" aria-labelledby="feat-h">
    <h2 class="section-title" id="feat-h">${live ? "What it does" : "What it will do"}</h2>
    <div class="feature-grid">
      <div class="feature"><h3>Underlines as you type</h3><p>Hits appear in text boxes and editors on the sites you enable: Gmail, LinkedIn, X, Reddit, Notion, Medium, WordPress and more.</p></div>
      <div class="feature"><h3>Explains each flag</h3><p>Hover a hit to see the rule, why it reads as AI, a suggestion, and a link to the full explanation on this site.</p></div>
      <div class="feature"><h3>Check a selection</h3><p>Right-click selected text and choose "Check with Naturable" to see the result and score in the side panel.</p></div>
      <div class="feature"><h3>Side panel for anything</h3><p>Paste text into the side panel for a full check. Useful for Google Docs and other editors that draw text on a canvas.</p></div>
      <div class="feature"><h3>Per-site switch</h3><p>Turn it on only where you write. It never turns on for banking, payment or sign-in sites, and never reads password or payment fields.</p></div>
      <div class="feature"><h3>Rules ship with the extension</h3><p>The rule pack is bundled and updated with each release. The extension never downloads code at runtime.</p></div>
    </div>
  </section>

  <section class="home-section" aria-labelledby="perm-h">
    <h2 class="section-title" id="perm-h">Permissions, and why</h2>
    <p class="lead-p" style="max-width:760px">No account, no text collection. The checker runs only on sites you turn on, and only you can grant that, one site at a time.</p>
    <div style="overflow-x:auto"><table class="perm-table"><thead><tr><th>Permission</th><th>Used for</th></tr></thead><tbody>${perms.map(([p, d]) => `<tr><td><code>${p}</code></td><td>${esc(d)}</td></tr>`).join("")}</tbody></table></div>
    <p class="fine">It doesn't rewrite your text automatically, doesn't upload anything, and doesn't score other people's writing.</p>
  </section>

  <section class="home-section faq" aria-labelledby="ext-faq-h" style="max-width:860px">
    <h2 class="section-title" id="ext-faq-h">Questions</h2>
    ${faqHtml(FAQ)}
  </section>
</div>`,
  };
}

/* ---------------- How it works + rules index (/en/how-it-works/) ---------------- */
const LAYER_INFO = {
  hollow: ["Hollow claims", "Claims without substance: vague sources, generic conclusions, fake certainty. Checked first, because they matter most."],
  structure: ["Structure", "Template shapes: not-just-but frames, signposts, stock conclusions, dense dashes."],
  artifact: ["Assistant leftovers", "Chat-window phrases that don't belong in a document."],
  lexicon: ["Word choice", "Word-level habits: AI diction, filler phrases, stacked hedges."],
};

export function howItWorks() {
  const PATH = "/en/how-it-works/";
  const crumbs = breadcrumbs("en", [["How it works", null]]);
  const en = packs.en;
  const byLayer = {};
  for (const r of en.rules) (byLayer[r.layer] = byLayer[r.layer] || []).push(r);
  const ruleCards = Object.keys(LAYER_INFO)
    .map((layer) => {
      const [name, desc] = LAYER_INFO[layer];
      const cards = (byLayer[layer] || [])
        .map(
          (r) => `<section class="rule-card" id="${ruleAnchor(r.id)}" aria-labelledby="${ruleAnchor(r.id)}-h">
  <div class="head"><span class="sev sev-${r.severity === "strong" ? "strong" : "suggestion"}">${r.severity === "strong" ? "Strong" : "Suggestion"}</span><h4 id="${ruleAnchor(r.id)}-h">${esc(r.name_en)}</h4>${r.auto ? '<span class="safe-tag">Safe fix</span>' : ""}<code>${esc(r.id)}</code></div>
  <p><strong>Why:</strong> ${esc(r.reason)}</p>
  <p><strong>Instead:</strong> ${esc(r.rewrite)}</p>
  <div class="ba-grid"><div class="ba ba-before"><span class="lbl">Before</span><span>${esc(r.before)}</span></div><div class="ba ba-after"><span class="lbl">After</span><span>${esc(r.after)}</span></div></div>
</section>`,
        )
        .join("\n");
      return `<div class="rule-layer" id="layer-${layer}"><h3>${esc(name)} <span style="font-family:var(--sans);font-size:14px;font-weight:400;color:var(--muted)">· ${byLayer[layer]?.length || 0} rules</span></h3><p class="lead-p">${esc(desc)}</p>${cards}</div>`;
    })
    .join("\n");

  const description = `How Naturable checks a draft: ${en.rules.length} open English rules (${en.version}) and a Chinese beta pack, run locally in four layers. Every rule with its reason, fix and examples, plus the Agent Skill and CLI.`;
  return {
    lang: "en",
    path: PATH,
    alternate: "/zh-cn/how-it-works/",
    updated: "2026-10-22",
    title: "How Naturable works — open rules for AI writing patterns",
    description,
    scripts: ["/assets/js/site.js"],
    schema: [crumbs.schema],
    body: `<div class="wrap" style="padding-bottom:64px">
  ${crumbs.html}
  <header class="page-head">
    <h1>How Naturable works</h1>
    <p class="dek">Naturable runs a versioned set of open rules in your browser. Each rule names a writing pattern, explains why it reads as AI, and suggests what to do instead. You decide every edit.</p>
    <p class="meta">English pack ${esc(en.version)} (${en.rules.length} rules) · Chinese pack ${esc(packs.zh.version)} beta (${packs.zh.rules.length} rules) · engine ${ENGINE_VERSION}</p>
  </header>

  <div class="prose-layout">
    <div class="prose">
      <h2 id="steps">From draft to recheck</h2>
      <ol>
        <li><strong>Paste.</strong> Blog posts, emails, marketing copy, essays. Language is detected automatically.</li>
        <li><strong>Check.</strong> The rules run locally in four layers. Where two hits overlap, the earlier layer wins.</li>
        <li><strong>Edit and compare.</strong> Each highlight shows the rule and the reason. Apply, ignore, or turn a rule off. Safe fixes only remove filler and never change numbers or names.</li>
        <li><strong>Recheck.</strong> The editor compares your draft with the first version and updates the score.</li>
      </ol>

      <h2 id="score">One score, five dimensions</h2>
      <p>The score (0–100) combines clarity, specificity, structure, artifact-free and rhythm. Strong findings cap it. It's a writing-quality guide for editing: <strong>it is not a probability that AI wrote the text</strong>, and it says nothing about how any detector will respond.</p>

      <h2 id="privacy">Local by design</h2>
      <p>The rule engine is plain JavaScript that runs in the page. Your text is never sent to a server. The editor saves drafts in your browser's local storage, and you can clear them at any time.</p>

      <h2 id="rules">The rules</h2>
      <p>Every English rule is listed below with its id. The checker, the editor and the Chrome extension link here when they flag something. Rule data is licensed CC BY 4.0 and the code MIT${SITE.githubUrl ? `; the source is on <a href="${esc(SITE.githubUrl)}">GitHub</a>` : ""}. Every rule's <em>before</em> example must trigger it and its <em>after</em> example must not; that is tested on every change.</p>
      ${ruleCards}

      <h3 id="zh-rules">Chinese pack (${esc(packs.zh.version)}, beta)</h3>
      <p>The Chinese rules are a separate set, not a translation: ${packs.zh.rules.map((r) => esc(r.name_zh)).join("、")}.</p>

      <h2 id="skill">Use the rules elsewhere: Agent Skill and CLI</h2>
      <p>The same rules ship as an Agent Skill for Claude, Codex and other agents. The Skill lists hits with their location and reason first, and rewrites only the parts you approve. It never offers to get text past a detector.</p>
      <p>From a terminal:</p>
      <pre class="cmd" style="white-space:pre"># readable report
${esc(cliCmd("draft.md"))}
# JSON, for tools and agents
${esc(cliCmd("draft.md --json"))}
# print the text with safe fixes applied
${esc(cliCmd("draft.md --fix"))}</pre>
      <p>${SITE.npmPublished ? "" : "This runs the checker straight from the public repository (Node 18+, no install). "}Pipe text in with <code>--purpose email</code> or <code>--lang zh</code> to change the weighting or language.</p>
      <p>For Claude Code, copy the <code>skill/</code> folder from the rules repository into <code>~/.claude/skills/naturable-writing-check/</code>. ${SITE.githubUrl ? `<a href="${esc(SITE.githubUrl)}">Get it on GitHub</a>.` : ""}</p>

      <h2 id="limits">What it isn't</h2>
      <p>Naturable isn't an AI detector and doesn't help text evade one. A flag is a style signal, not evidence of who wrote something. See <a href="/en/signs-of-ai-writing/#limits">what these signs can't tell you</a>.</p>
    </div>
    <aside aria-label="Shortcuts">
      <div class="side-cta"><h2>Try it on a draft</h2><p>Paste text and see every rule in action.</p><a class="btn btn-light" href="/en/app/">Open the editor</a></div>
      <div class="side-links">
        ${Object.entries(LAYER_INFO).map(([k, [n]]) => `<a href="#layer-${k}"><span class="k">Rules</span><span class="t">${esc(n)}</span></a>`).join("")}
        <a href="#skill"><span class="k">Developers</span><span class="t">Agent Skill &amp; CLI</span></a>
      </div>
    </aside>
  </div>
</div>`,
  };
}

/* ---------------- Privacy (rewritten to match v2, which has no analytics or feedback calls) ---------------- */
export function privacyPages() {
  const mail = `<a href="mailto:${SITE.contactEmail}">${SITE.contactEmail}</a>`;
  return [
    {
      lang: "en",
      path: "/en/privacy/",
      alternate: "/zh-cn/privacy/",
      updated: "2026-10-23",
      title: "Privacy Policy — Naturable",
      description: "Naturable checks text in your browser. Drafts are not uploaded, there are no accounts, and the site uses no analytics or advertising cookies.",
      scripts: ["/assets/js/site.js"],
      body: proseShell("en", "Privacy Policy", "Checks run entirely in your browser. Your text, earlier versions and diffs are not uploaded.", `
<h2>Your text</h2>
<p>The rules engine runs in the page. Text you paste or type is processed on your device and is never sent to our servers or to any third party.</p>
<h2>What's stored on your device</h2>
<p>The editor saves your current draft, its first checked version, your writing purpose and the rules you've turned off in your browser's local storage, so they're there when you come back. "Open the full editor" passes the draft to the editor through session storage in the same tab. Clear the draft in the editor, or clear site data in your browser, to remove them.</p>
<h2>Chrome extension</h2>
<p>Naturable for Chrome runs the same rules inside your browser. It checks text only in the text box you're typing in, and only on sites you've turned it on for (or on a page where you click "Check this page once"). Text you select and send with "Check with Naturable" goes to the extension's side panel on your device. The extension never sends text, browsing history or page content to us or to anyone else, and it has no account, analytics or remote code.</p>
<p>It never turns on for banking, payment, password-manager or sign-in sites, and it doesn't read password, payment or one-time-code fields, or text boxes in forms that contain them.</p>
<p>On your device, the extension stores your writing purpose and the phrases you've chosen to ignore (Chrome extension storage), and a selection waiting for the side panel (cleared when the side panel reads it or the browser closes). Which sites it may run on is kept by Chrome as the extension's site access. Turning a site off in the popup removes that site's access; "Reset" in the popup clears ignored phrases; removing the extension deletes everything it stored.</p>
<h2>Cookies and analytics</h2>
<p>This site sets no cookies and runs no analytics, advertising or tracking scripts.</p>
<h2>Hosting</h2>
<p>The site is served by Cloudflare. Like any web host, Cloudflare processes standard request data (such as IP address, browser type and the page requested) to deliver pages and protect the site. This never includes the text you check.</p>
<h2>Changes</h2>
<p>If we add a feature that sends any data, we'll describe it here before it ships.</p>
<p>Questions: ${mail}</p>`),
    },
    {
      lang: "zh",
      path: "/zh-cn/privacy/",
      alternate: "/en/privacy/",
      updated: "2026-10-23",
      title: "隐私政策 — Naturable",
      description: "Naturable 在浏览器中检查文本。草稿不上传，无需账号，网站不使用统计或广告 Cookie。",
      scripts: ["/assets/js/site.js"],
      body: proseShell("zh", "隐私政策", "检查和修改都在浏览器里完成。你的正文、修改前版本和对比内容不会上传到服务器。", `
<h2>你的文本</h2>
<p>规则引擎在页面中运行。你粘贴或输入的文本只在当前设备上处理，不会发送到我们的服务器或任何第三方。</p>
<h2>保存在本机的内容</h2>
<p>编辑器会把当前草稿、首次检查时的版本、写作场景和你关闭的规则保存在浏览器的本地存储中，方便下次继续。点击「打开完整编辑器」时，草稿通过同一标签页的会话存储传给编辑器。你可以在编辑器里清空草稿，或在浏览器中清除网站数据来删除它们。</p>
<h2>Chrome 扩展</h2>
<p>Naturable 的 Chrome 扩展在浏览器内运行同一套规则。它只检查你正在输入的文本框，而且只在你开启过的网站上运行（或在你点击「检查此页面一次」的页面上）。通过「Check with Naturable」发送的选中文本只会进入本机的扩展侧边栏。扩展不会把文本、浏览记录或页面内容发送给我们或任何第三方，也没有账号、统计或远程代码。</p>
<p>它不会在银行、支付、密码管理器和登录类网站上开启，也不会读取密码、支付卡、一次性验证码字段，以及包含这些字段的表单中的文本框。</p>
<p>扩展会在本机保存你的写作场景和你选择忽略的短语（Chrome 扩展存储），以及等待侧边栏读取的选中文本（侧边栏读取后或浏览器关闭时清除）。允许运行的网站由 Chrome 作为扩展的网站访问权限保存。在弹窗中关闭某个网站会撤销该网站的访问权限，点击「Reset」会清空忽略的短语，卸载扩展会删除它保存的全部内容。</p>
<h2>Cookie 与统计</h2>
<p>本网站不设置 Cookie，也不运行统计、广告或追踪脚本。</p>
<h2>托管服务</h2>
<p>网站由 Cloudflare 提供服务。和所有网站托管一样，Cloudflare 会处理标准的请求信息（如 IP 地址、浏览器类型和访问的页面）来传送页面和保护网站，其中不包含你检查的文本。</p>
<h2>变更</h2>
<p>如果以后增加任何会发送数据的功能，我们会在上线前在这里说明。</p>
<p>如有疑问，请联系 ${mail}。</p>`),
    },
  ];
}

/* ---------------- Learn index ---------------- */
export function learnIndex(lang, posts) {
  const zh = lang === "zh";
  const path = zh ? "/zh-cn/learn/" : "/en/learn/";
  const crumbs = breadcrumbs(lang, [[zh ? "博客" : "Learn", null]]);
  const cards = posts
    .map(
      (p) => `<a class="guide-card" href="${p.path}"><span class="eyebrow">${esc(p.topic)}</span><span class="title">${esc(p.h1)}</span><span class="desc">${esc(p.lede)}</span><span class="foot">${zh ? "阅读文章 →" : "Read →"}</span></a>`,
    )
    .join("\n");
  return {
    lang,
    path,
    alternate: zh ? "/en/learn/" : "/zh-cn/learn/",
    updated: "2026-10-23",
    title: zh ? "自然写作与 AI 改稿博客 — Naturable" : "Guides to AI writing patterns — Naturable",
    description: zh
      ? "Naturable 博客：AI 写作模式、AI Humanizer、困惑度与句子节奏、中文 AI 文案、商务邮件与有证据的营销文案。"
      : "Guides and tools for spotting and fixing AI writing patterns: AI words to avoid, signs of AI writing, humanizers, em dashes, burstiness, and editing guides.",
    scripts: ["/assets/js/site.js"],
    schema: [crumbs.schema],
    body: `<div class="wrap">
  ${crumbs.html}
  <header class="page-head">
    <h1>${zh ? "自然写作与 AI 改稿" : "Guides and tools"}</h1>
    <p class="dek">${zh ? "关于 AI 写作模式、句子节奏、中文 AI 文案、商务邮件和可信营销内容的实用指南。" : "How to spot the patterns that make a draft read as AI-written, and how to fix them without losing your voice."}</p>
  </header>
  <div class="post-list">${cards}</div>
</div>`,
  };
}

/* ---------------- Legacy prose pages (content/legacy) ---------------- */
export function proseShell(lang, h1, lede, bodyHtml, extra = {}) {
  const zh = lang === "zh";
  const crumbs = extra.crumbs ? extra.crumbs.html : "";
  const related = (extra.related || [])
    .map((r) => `<a href="${r.href}"><span class="k">${esc(r.topic)}</span><span class="t">${esc(r.title)}</span></a>`)
    .join("");
  return `<div class="wrap">
  ${crumbs}
  <header class="page-head">
    ${extra.topic ? `<span class="eyebrow">${esc(extra.topic)}</span>` : ""}
    <h1>${esc(h1)}</h1>
    ${lede ? `<p class="dek">${esc(lede)}</p>` : ""}
    ${extra.meta ? `<p class="meta">${esc(extra.meta)}</p>` : ""}
  </header>
  <div class="prose-layout">
    <div class="prose">${bodyHtml}</div>
    <aside aria-label="${zh ? "相关" : "Related"}">
      <div class="side-cta">
        <h2>${zh ? "检查你自己的草稿" : "Check your own draft"}</h2>
        <p>${zh ? "把这些方法用到真实文本中，逐条查看、修改并复查。文本不上传。" : "Apply these ideas to a real draft: check it, edit, and recheck. Nothing is uploaded."}</p>
        <a class="btn btn-light" href="${zh ? "/zh-cn/app/" : "/en/app/"}">${zh ? "打开编辑器" : "Open the editor"}</a>
      </div>
      ${related ? `<div class="side-links">${related}</div>` : ""}
    </aside>
  </div>
</div>`;
}

export function legacyPage(p, { alternate, mapLink, updated }) {
  const zh = p.lang === "zh";
  const isArticle = p.path.includes("/learn/");
  const crumbItems = isArticle ? [[zh ? "博客" : "Learn", zh ? "/zh-cn/learn/" : "/en/learn/"], [p.h1, null]] : [[p.h1, null]];
  const crumbs = breadcrumbs(p.lang, crumbItems);
  const body = p.bodyHtml.replace(/href="([^"]+)"/g, (_, h) => `href="${mapLink(h)}"`);
  const related = p.related.map((r) => ({ ...r, href: mapLink(r.href) })).filter((r) => r.href !== p.path);
  const meta = isArticle ? [zh ? `更新于 ${updated}` : `Updated ${updated}`, p.readTime].filter(Boolean).join(" · ") : "";
  return {
    lang: p.lang,
    path: p.path,
    alternate,
    updated,
    ogType: isArticle ? "article" : "website",
    title: p.title,
    description: p.description,
    scripts: ["/assets/js/site.js"],
    schema: [
      crumbs.schema,
      ...(isArticle ? [articleSchema({ lang: p.lang, path: p.path, headline: p.h1, description: p.description, datePublished: p.datePublished || updated, dateModified: p.dateModified || updated })] : []),
    ],
    body: proseShell(p.lang, p.h1, p.lede, body, { crumbs, related, meta, topic: p.topic }),
  };
}

/* ---------------- 404 ---------------- */
export function notFound() {
  return {
    lang: "en",
    path: "/404.html",
    noindex: true,
    updated: "2026-10-23",
    title: "Page not found — Naturable",
    description: "This page doesn't exist.",
    scripts: ["/assets/js/site.js"],
    body: `<div class="wrap notfound">
  <h1>That page isn't here.</h1>
  <p class="lead-p">It may have moved when the site was rebuilt. Try one of these:</p>
  <div class="checker-actions">
    <a class="btn btn-primary" href="/en/">Check a draft</a>
    <a class="btn" href="/en/ai-words-to-avoid/">AI words to avoid</a>
    <a class="btn" href="/en/signs-of-ai-writing/">Signs of AI writing</a>
    <a class="btn btn-ghost" href="/zh-cn/" lang="zh-CN">简体中文</a>
  </div>
</div>`,
  };
}
