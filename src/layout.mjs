import { SITE, githubHref, chromeHref, chromeLabel } from "./site.mjs";

export const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const abs = (path) => SITE.origin + path;

export const icons = {
  check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2F5F3F" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`,
  lock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`,
  code: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/></svg>`,
  plus: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14"/><path d="M5 12h14"/></svg>`,
  menu: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
  info: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1F1D1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><path d="M12 16.5v.01"/></svg>`,
  undo: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>`,
  copy: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>`,
  importIcon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>`,
  exportIcon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/></svg>`,
  trash: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9 7V4h6v3"/></svg>`,
  bars: `<svg width="32" height="28" viewBox="0 0 32 28" aria-hidden="true"><rect x="2" y="14" width="5" height="14" rx="1" fill="#A2462A"/><rect x="10" y="4" width="5" height="24" rx="1" fill="#A2462A"/><rect x="18" y="18" width="5" height="10" rx="1" fill="#A2462A"/><rect x="26" y="9" width="5" height="19" rx="1" fill="#A2462A"/></svg>`,
};

const T = {
  en: {
    htmlLang: "en",
    home: "/en/",
    skip: "Skip to content",
    homeLabel: "Naturable home",
    nav: [
      ["/en/app/", "Editor"],
      ["/en/ai-words-to-avoid/", "AI words to avoid"],
      ["/en/signs-of-ai-writing/", "Signs of AI writing"],
      ["/en/chatgpt-em-dash/", "Tools", ["/en/learn/what-is-perplexity-and-burstiness/"]],
    ],
    gh: "Open-source rules on GitHub",
    addChrome: "Add to Chrome",
    menu: "Open menu",
    footerAbout: "Naturable points out writing patterns. It doesn't judge who wrote a text, and it doesn't promise to get anything past an AI detector.",
    cols: () => [
      ["Product", [["/en/app/", "Editor"], [chromeHref(), "Chrome extension"], [githubHref(), "Open-source rules"], ["/en/how-it-works/#skill", "Agent Skill"]]],
      ["Guides & tools", [["/en/ai-words-to-avoid/", "AI words to avoid"], ["/en/signs-of-ai-writing/", "Signs of AI writing"], ["/en/learn/do-ai-humanizers-work/", "Do AI humanizers work?"], ["/en/chatgpt-em-dash/", "ChatGPT em dash checker"], ["/en/learn/what-is-perplexity-and-burstiness/", "Burstiness calculator"], ["/en/learn/", "All articles"]]],
      ["Naturable", [["/en/how-it-works/", "How it works"], ["/en/about/", "About"], ["/en/privacy/", "Privacy"], ["/en/terms/", "Terms"]]],
    ],
    copyright: "© 2026 Naturable · Rules CC BY 4.0 · Code MIT",
    langName: "English",
    otherLangName: "简体中文",
    otherLangCode: "zh-CN",
    otherHome: "/zh-cn/",
    crumbHome: "Home",
  },
  zh: {
    htmlLang: "zh-CN",
    home: "/zh-cn/",
    skip: "跳到正文",
    homeLabel: "Naturable 首页",
    nav: [
      ["/zh-cn/app/", "文本编辑"],
      ["/zh-cn/how-it-works/", "如何使用"],
      ["/zh-cn/learn/", "博客"],
    ],
    gh: "GitHub 上的开源规则",
    addChrome: "开始检查",
    menu: "打开菜单",
    footerAbout: "Naturable 只指出写作模式，不判断作者身份，也不承诺通过任何 AI 检测。",
    cols: () => [
      ["产品", [["/zh-cn/app/", "文本编辑"], ["/zh-cn/how-it-works/", "如何使用"], [githubHref(), "开源规则"]]],
      ["博客", [["/zh-cn/learn/", "全部文章"], ["/zh-cn/learn/common-patterns-in-chinese-ai-copy/", "中文 AI 文案的常见套路"], ["/zh-cn/learn/how-to-remove-ai-tells/", "怎样改掉“AI 腔”"]]],
      ["关于", [["/zh-cn/about/", "关于我们"], ["/zh-cn/privacy/", "隐私政策"], ["/zh-cn/terms/", "服务条款"]]],
    ],
    copyright: "© 2026 Naturable · 规则 CC BY 4.0 · 代码 MIT",
    langName: "简体中文",
    otherLangName: "English",
    otherLangCode: "en",
    otherHome: "/en/",
    crumbHome: "首页",
  },
};

export const strings = (lang) => T[lang];

function header(lang, path) {
  const t = T[lang];
  const isCurrent = (href, also = []) => path === href || also.includes(path);
  const links = t.nav
    .map(([href, label, also]) => `<a href="${href}"${isCurrent(href, also) ? ' aria-current="page"' : ""}>${esc(label)}</a>`)
    .join("");
  const cta =
    lang === "en"
      ? `<a class="btn btn-outline" href="${esc(chromeHref())}">${SITE.chromeStoreUrl ? icons.plus : ""}${esc(SITE.chromeStoreUrl ? t.addChrome : "Chrome extension")}</a>`
      : `<a class="btn btn-outline" href="/zh-cn/app/">${esc(t.addChrome)}</a>`;
  return `<header class="site-header">
  <div class="bar">
    <a class="brand" href="${t.home}" aria-label="${esc(t.homeLabel)}">Naturable<span class="dot">.</span></a>
    <nav class="main-nav" aria-label="Main">${links}</nav>
    <div class="header-actions">
      <a class="gh" href="${esc(githubHref())}" aria-label="${esc(t.gh)}">${icons.code}</a>
      ${cta}
    </div>
    <button type="button" class="menu-btn" aria-label="${esc(t.menu)}" aria-expanded="false" aria-controls="mobile-nav" data-menu>${icons.menu}</button>
  </div>
  <nav class="mobile-nav" id="mobile-nav" aria-label="Main">${links}${lang === "en" ? `<a href="${esc(chromeHref())}">${esc(chromeLabel())}</a>` : ""}</nav>
</header>`;
}

function footer(lang, alternate) {
  const t = T[lang];
  const cols = t
    .cols()
    .map(
      ([title, links]) =>
        `<nav class="footer-col" aria-label="${esc(title)}"><span class="eyebrow">${esc(title)}</span>${links
          .map(([href, label]) => `<a href="${esc(href)}">${esc(label)}</a>`)
          .join("")}</nav>`,
    )
    .join("");
  const other = alternate || t.otherHome;
  return `<footer class="site-footer">
  <div class="inner">
    <div class="footer-cols">
      <div class="footer-about"><span class="brand">Naturable<span class="dot">.</span></span><p>${esc(t.footerAbout)}</p></div>
      ${cols}
    </div>
    <div class="footer-base">
      <span>${esc(t.copyright)}</span>
      <span>${esc(t.langName)} · <a href="${other}" lang="${t.otherLangCode}" hreflang="${t.otherLangCode}">${esc(t.otherLangName)}</a></span>
    </div>
  </div>
</footer>`;
}

export function breadcrumbs(lang, items) {
  // items: [[label, href|null], ...] excluding Home
  const t = T[lang];
  const all = [[t.crumbHome, t.home], ...items];
  // Google requires a URL on every breadcrumb except the last one.
  all.slice(0, -1).forEach(([label, href]) => {
    if (!href) throw new Error(`breadcrumb "${label}" needs a URL (only the last crumb may omit it)`);
  });
  const html = `<nav class="breadcrumb" aria-label="Breadcrumb"><ol>${all
    .map(([label, href], i) =>
      href && i < all.length - 1 ? `<li><a href="${href}">${esc(label)}</a></li>` : `<li${i === all.length - 1 ? ' aria-current="page"' : ""}>${esc(label)}</li>`,
    )
    .join("")}</ol></nav>`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map(([label, href], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: label,
      ...(href ? { item: abs(href) } : {}),
    })),
  };
  return { html, schema };
}

export function faqSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
}

export function faqHtml(items) {
  return items.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n");
}

export function articleSchema({ lang, path, headline, description, datePublished, dateModified }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    datePublished,
    dateModified,
    inLanguage: lang === "zh" ? "zh-CN" : "en",
    mainEntityOfPage: abs(path),
    author: { "@type": "Organization", name: "Naturable", url: abs("/en/about/") },
    publisher: { "@type": "Organization", name: "Naturable", url: SITE.origin + "/", logo: { "@type": "ImageObject", url: abs("/favicon.svg") } },
  };
}

/**
 * Full HTML document.
 * page: { lang, path, title, description, body, schema?: object[], alternate?: path (other language),
 *         scripts?: string[], noindex?: bool, ogType?: string, preloadEngine?: bool }
 */
export function renderPage(page) {
  const t = T[page.lang];
  const canonical = abs(page.path);
  const alt = page.alternate;
  const enPath = page.lang === "en" ? page.path : alt;
  const zhPath = page.lang === "zh" ? page.path : alt;
  const hreflang = alt
    ? [
        `<link rel="alternate" hreflang="en" href="${abs(enPath)}">`,
        `<link rel="alternate" hreflang="zh-CN" href="${abs(zhPath)}">`,
        `<link rel="alternate" hreflang="x-default" href="${abs(enPath)}">`,
      ].join("\n  ")
    : "";
  const schema = (page.schema || []).map((s) => `<script type="application/ld+json">${JSON.stringify(s).replace(/</g, "\\u003c")}</script>`).join("\n  ");
  const scripts = (page.scripts || []).map((src) => `<script src="${src}?v=${page.assetVersion}" defer></script>`).join("\n  ");
  return `<!doctype html>
<html lang="${t.htmlLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(page.title)}</title>
  <meta name="description" content="${esc(page.description)}">
  ${page.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${canonical}">`}
  ${hreflang}
  <meta property="og:type" content="${page.ogType || "website"}">
  <meta property="og:site_name" content="Naturable">
  <meta property="og:title" content="${esc(page.title)}">
  <meta property="og:description" content="${esc(page.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:locale" content="${page.lang === "zh" ? "zh_CN" : "en_US"}">
  <meta name="twitter:card" content="summary">
  <meta name="theme-color" content="#F4F1EA">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/favicon.svg">
  <link rel="preload" href="/assets/fonts/source-serif-4-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/css/site.css?v=${page.assetVersion}">
  ${schema}
  ${scripts}
</head>
<body>
<a class="skip-link" href="#main">${esc(t.skip)}</a>
${header(page.lang, page.path)}
<main id="main">
${page.body}
</main>
${footer(page.lang, alt)}
</body>
</html>
`;
}
