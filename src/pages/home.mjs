import { esc, icons, faqHtml, faqSchema, abs } from "../layout.mjs";
import { checker } from "../components.mjs";
import { SITE, githubHref, chromeHref } from "../site.mjs";
import { packs } from "../../vendor/naturable-rules/src/index.js";

const RULE_COUNT = packs.en.rules.length + packs.zh.rules.length;

const FAQ_EN = [
  ["Can Naturable tell whether a text was written by AI?", "No. It finds writing patterns that are common in chatbot output, and people write them too. Don't use the score to judge someone else's work."],
  ["Will this help my text pass an AI detector?", "That isn't what it's for. We don't test against detectors or promise any result. The goal is clearer writing that sounds like you."],
  ["Is my text uploaded?", "No. The rules run in your browser. Drafts are saved only on your device."],
  ["Is it free?", "Yes. No account, no word limit, no watermark."],
  ["Where do the rules come from?", "They're open: every rule is public JSON with a reason, a suggested fix and before/after examples that are tested on every change. You can read them, use them in your own tools, or suggest new ones."],
];

const FAQ_ZH = [
  ["Naturable 能判断一段文字是不是 AI 写的吗？", "不能。它只标出聊天机器人常见的写作模式，而这些模式人也会写。请不要用评分去评判别人的作品。"],
  ["正文会上传到服务器吗？", "不会。检查、草稿、修改对比和编辑记录都留在当前浏览器。你可以随时在编辑器里清除本地数据。"],
  ["它会帮我通过 AI 检测吗？", "这不是它的用途。我们不针对任何检测器测试，也不承诺任何结果。目标是让表达更清楚、更具体、更像你自己写的。"],
  ["需要付费或注册吗？", "不需要。免费使用，不用注册，没有字数限制。"],
];

export default function home() {
  const tick = (s) => `<li>${icons.check}${esc(s)}</li>`;
  const orgSameAs = [SITE.githubUrl, SITE.chromeStoreUrl].filter(Boolean);

  const en = {
    lang: "en",
    path: "/en/",
    alternate: "/zh-cn/",
    updated: "2026-10-22",
    title: "Naturable — Local AI Writing Pattern Checker (No Upload)",
    description: "Paste a draft to see what reads like AI: assistant chatter, template openers, vague sources, stacked hedges and words like delve. Every flag explains itself. Runs in your browser; nothing is uploaded.",
    scripts: ["/assets/js/naturable.iife.js", "/assets/js/docs.js", "/assets/js/site.js", "/assets/js/checker.js"],
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": abs("/#organization"),
        name: "Naturable",
        url: SITE.origin + "/",
        logo: abs("/favicon.svg"),
        ...(orgSameAs.length ? { sameAs: orgSameAs } : {}),
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": abs("/#website"),
        name: "Naturable",
        url: SITE.origin + "/",
        inLanguage: ["en", "zh-CN"],
        publisher: { "@id": abs("/#organization") },
      },
      faqSchema(FAQ_EN),
    ],
    body: `<div class="wrap">
  <section class="hero">
    <div class="hero-copy">
      <p class="pill">Free · open-source rules · runs in your browser</p>
      <h1>Find the parts of your draft that sound like AI.</h1>
      <p class="dek">Naturable flags assistant chatter, template openers, vague sources, stacked hedges and words like <em>delve</em> and <em>leverage</em>. Each flag comes with an explanation, so you decide what to change. Nothing you paste leaves your browser.</p>
    </div>
    ${checker({ lang: "en", id: "home-draft" })}
    <ul class="check-list">
      ${tick("Your text stays on your device")}${tick("Every flag explains itself")}${tick(`${RULE_COUNT} open rules, English + Chinese beta`)}${tick("No account, no word limit")}
    </ul>
  </section>

  <section class="home-section" aria-labelledby="learn-h">
    <div class="section-head">
      <h2 class="section-title" id="learn-h">Learn the patterns</h2>
      <a class="link-arrow" href="/en/learn/">All guides →</a>
    </div>
    <div class="guide-cards">
      <a class="guide-card" href="/en/ai-words-to-avoid/">
        <span class="eyebrow">Word list</span>
        <span class="title">AI words to avoid</span>
        <span class="desc">Delve, tapestry, leverage, robust, and the stock openers that come with them. Each one gets a plainer word you can use instead.</span>
        <span class="foot"><span class="chip chip-strong">delve</span><span class="chip chip-strong">leverage</span><span class="chip chip-sugg">in order to</span></span>
      </a>
      <a class="guide-card" href="/en/signs-of-ai-writing/">
        <span class="eyebrow">Guide</span>
        <span class="title">Signs of AI writing</span>
        <span class="desc">The tells readers notice first, how to fix each one, and why none of them proves who wrote a text.</span>
        <span class="foot">Read the guide →</span>
      </a>
      <a class="guide-card" href="/en/learn/do-ai-humanizers-work/">
        <span class="eyebrow">Honest review</span>
        <span class="title">Do AI humanizers work?</span>
        <span class="desc">What one-click rewriters actually change, what they break, and a better way to edit an AI-assisted draft.</span>
        <span class="foot">Read the review →</span>
      </a>
    </div>
    <div class="tool-links">
      <a class="tool-link" href="/en/chatgpt-em-dash/"><span class="glyph" aria-hidden="true">—</span><span><span class="t">Em dash checker</span><span class="d">Count dashes per 1,000 words and swap them one by one</span></span></a>
      <a class="tool-link" href="/en/learn/what-is-perplexity-and-burstiness/">${icons.bars}<span><span class="t">Burstiness calculator</span><span class="d">See your sentence-length rhythm at a glance</span></span></a>
    </div>
  </section>

  <section class="home-section" aria-labelledby="where-h">
    <div class="where-row">
      <div class="where-dark">
        <div class="text">
          <h2 id="where-h">Check where you write</h2>
          <p>The Chrome extension underlines the same patterns in Gmail, LinkedIn, Notion, Reddit and most text boxes. It runs locally, like the site.</p>
          <a class="btn btn-light" href="${esc(chromeHref())}">${SITE.chromeStoreUrl ? "Add to Chrome, free" : "Get the Chrome extension"}</a>
        </div>
        <div class="mock-mail" aria-hidden="true">
          <span class="to">To: team · Re: Q3 plan</span>
          <span>Hi all, I wanted to <span class="mock-u-strong">leverage</span> this week to share the plan. <span class="mock-u-sugg">In order to</span> ship on time…</span>
          <span class="mock-badge"><i></i>2</span>
        </div>
      </div>
      <div class="where-light">
        <h2>Open rules you can check</h2>
        <p>Every rule is public JSON with examples and tests. Use it in your own tools, or as an Agent Skill for Claude and Codex.</p>
        <code class="cmd">npx naturable-check draft.md</code>
        <a class="link-arrow" style="margin-top:auto" href="${esc(githubHref())}">${SITE.githubUrl ? "View on GitHub →" : "Browse the rules →"}</a>
      </div>
    </div>
  </section>

  <section class="home-section" aria-labelledby="how-h">
    <h2 class="section-title" id="how-h">How it works</h2>
    <ol class="steps">
      <li><span class="t">1 · Paste or type</span><span class="d">Emails, essays, posts, product copy. English, with Chinese in beta.</span></li>
      <li><span class="t">2 · Read why</span><span class="d">Each flag names the pattern, explains why it reads as AI-written, and suggests a direction.</span></li>
      <li><span class="t">3 · Fix what you agree with</span><span class="d">Apply safe fixes in one click, ignore the rest, and recheck. Numbers and names are never changed for you.</span></li>
    </ol>
  </section>
</div>
<section class="home-faq faq" aria-labelledby="faq-h">
  <h2 class="section-title" id="faq-h">Questions</h2>
  ${faqHtml(FAQ_EN)}
</section>`,
  };

  const zh = {
    lang: "zh",
    path: "/zh-cn/",
    alternate: "/en/",
    updated: "2026-10-22",
    title: "给博客 / 邮件 / 营销稿去 GPT 味 — 草稿不上云 — Naturable",
    description: "在浏览器里给博客、邮件、营销稿去 GPT 味：清套话、破结构。本地隐私，草稿不上云，无需注册。英中规则分轨。",
    scripts: ["/assets/js/naturable.iife.js", "/assets/js/docs.js", "/assets/js/site.js", "/assets/js/checker.js"],
    schema: [faqSchema(FAQ_ZH)],
    body: `<div class="wrap">
  <section class="hero">
    <div class="hero-copy">
      <p class="pill">草稿不离开浏览器 · 博客 · 邮件 · 营销</p>
      <h1>给博客 / 邮件 / 营销稿去 GPT 味，草稿不离开浏览器</h1>
      <p class="dek">在浏览器里标出套话和僵硬结构，边改边对比。专为博客、邮件、营销稿；草稿不离开浏览器，文本不上传。</p>
    </div>
    ${checker({ lang: "zh", id: "home-draft-zh", purpose: "blog" })}
    <ul class="check-list">
      ${tick("文本不上云，只留在当前设备")}${tick("每处标注都说明原因")}${tick("中文规则 Beta，与英文规则分轨")}${tick("无需注册，没有字数限制")}
    </ul>
  </section>

  <section class="home-section" aria-labelledby="zh-learn-h">
    <div class="section-head">
      <h2 class="section-title" id="zh-learn-h">Naturable 会检查什么</h2>
      <a class="link-arrow" href="/zh-cn/learn/">全部文章 →</a>
    </div>
    <div class="guide-cards">
      <a class="guide-card" href="/zh-cn/learn/common-patterns-in-chinese-ai-copy/">
        <span class="eyebrow">中文写作</span>
        <span class="title">中文 AI 文案的常见套路</span>
        <span class="desc">元话语、宣传动词、机械连接词、模板递进和意义拔高，以及怎样改得更自然。</span>
        <span class="foot"><span class="chip chip-sugg">值得注意的是</span><span class="chip chip-strong">不是……而是……</span></span>
      </a>
      <a class="guide-card" href="/zh-cn/learn/how-to-remove-ai-tells/">
        <span class="eyebrow">AI 写作</span>
        <span class="title">怎样改掉明显的“AI 腔”</span>
        <span class="desc">从套话、泛化用词、模板句式、模糊来源和助手寒暄入手，逐项修改，又不丢掉自己的表达。</span>
        <span class="foot">阅读文章 →</span>
      </a>
      <a class="guide-card" href="/zh-cn/learn/make-a-stiff-email-more-direct/">
        <span class="eyebrow">邮件写作</span>
        <span class="title">把生硬的邮件改得直接</span>
        <span class="desc">删掉程式化客套，提前说明请求、负责人和截止时间。</span>
        <span class="foot">阅读文章 →</span>
      </a>
    </div>
  </section>

  <section class="home-section" aria-labelledby="zh-how-h">
    <h2 class="section-title" id="zh-how-h">一次本地检查怎么做</h2>
    <ol class="steps">
      <li><span class="t">1 · 粘贴文本</span><span class="d">博客、邮件或营销稿。中文规则为 Beta。</span></li>
      <li><span class="t">2 · 看原因</span><span class="d">每处高亮都给出规则名和原因，并附上可核对的修改建议。</span></li>
      <li><span class="t">3 · 你来决定</span><span class="d">只接受说得通的修改，再对比、再检查。数字和名称不会被自动改动。</span></li>
    </ol>
  </section>
</div>
<section class="home-faq faq" aria-labelledby="zh-faq-h">
  <h2 class="section-title" id="zh-faq-h">常见问题</h2>
  ${faqHtml(FAQ_ZH)}
</section>`,
  };

  return [en, zh];
}
