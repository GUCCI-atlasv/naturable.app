import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {execFileSync} from "node:child_process";

fs.copyFileSync("site/_worker.js","out/_worker.js");
// Prefer self-hosted public/robots.txt (Next also copies public/ → out/; overwrite to be sure).
const robotsSrc = fs.existsSync("public/robots.txt") ? "public/robots.txt" : "site/robots.txt";
fs.copyFileSync(robotsSrc, "out/robots.txt");
if (fs.existsSync("public/llms.txt")) fs.copyFileSync("public/llms.txt", "out/llms.txt");
if (fs.existsSync("public/_headers")) fs.copyFileSync("public/_headers", "out/_headers");

// Content-hash engine.js so HTML can keep long-lived immutable cache without ?v= bumps.
{
  const engineSrc = path.join("out", "assets", "engine.js");
  if (!fs.existsSync(engineSrc)) {
    throw new Error("postbuild: out/assets/engine.js missing — did Next copy public/assets?");
  }
  const engineBuf = fs.readFileSync(engineSrc);
  const hash = crypto.createHash("sha256").update(engineBuf).digest("hex").slice(0, 12);
  const hashedName = `engine.${hash}.js`;
  const hashedPath = path.join("out", "assets", hashedName);
  fs.writeFileSync(hashedPath, engineBuf);
  // Leave unhashed engine.js for stray bookmarks; HTML/JS refs become hashed-only.
  const replaceEngineRefs = text => {
    const hashed = `/assets/${hashedName}`;
    const hashedEsc = `\\/assets\\/${hashedName}`;
    text = text.replace(/\/assets\/engine\.js\?v=[^"'\\\s]*/g, hashed);
    text = text.replace(/\\\/assets\\\/engine\.js\?v=[^"'\\\s]*/g, hashedEsc);
    text = text.replaceAll("/assets/engine.js", hashed);
    text = text.replaceAll("\\/assets\\/engine.js", hashedEsc);
    return text;
  };
  let rewritten = 0;
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.(html|js|json|txt|map)$/i.test(entry.name)) continue;
      if (full === engineSrc || full === hashedPath) continue;
      const before = fs.readFileSync(full, "utf8");
      if (!before.includes("assets/engine.js")) continue;
      const after = replaceEngineRefs(before);
      if (after !== before) {
        fs.writeFileSync(full, after);
        rewritten += 1;
      }
    }
  };
  walk("out");
  const homeHtml = fs.readFileSync(path.join("out", "en", "index.html"), "utf8");
  if (!homeHtml.includes(`/assets/${hashedName}`)) {
    throw new Error(`postbuild: en/index.html missing hashed engine ref ${hashedName}`);
  }
  if (/\/assets\/engine\.js\?v=/.test(homeHtml)) {
    throw new Error("postbuild: en/index.html still has engine.js?v=");
  }
  console.log(`postbuild: engine → ${hashedName} (sha256[:12]); rewritten ${rewritten} files`);
}


const origin = "https://naturable.app";
const locales = ["en", "zh-cn"];
const paths = [
  "",
  "app",
  "how-it-works",
  "pricing",
  "about",
  "privacy",
  "terms",
  "learn",
  "learn/remove-ai-writing-style",
  "learn/how-to-remove-ai-tells",
  "learn/what-is-perplexity-and-burstiness",
  "learn/do-ai-humanizers-work",
  "learn/common-patterns-in-chinese-ai-copy",
  "learn/make-a-stiff-email-more-direct",
  "learn/replace-claims-with-evidence"
];

/** Source files that drive each sitemap path (for real lastmod). */
const pathSources = {
  "": ["lib/content.tsx", "app/[locale]/[[...slug]]/page.tsx", "site/index.html"],
  app: ["components/AppPage.tsx", "components/Checker.tsx", "public/assets/engine.js", "site/app.html"],
  "how-it-works": ["components/ContentPages.tsx", "site/how-it-works.html"],
  pricing: ["components/ContentPages.tsx", "site/pricing.html"],
  about: ["lib/content.tsx", "site/about.html"],
  privacy: ["lib/content.tsx", "site/privacy.html"],
  terms: ["lib/content.tsx", "site/terms.html"],
  learn: ["components/Blog.tsx", "site/learn/index.html"]
};

const articleDateFallback = {
  "learn/remove-ai-writing-style": "2026-09-09",
  "learn/how-to-remove-ai-tells": "2026-07-12",
  "learn/what-is-perplexity-and-burstiness": "2026-07-12",
  "learn/do-ai-humanizers-work": "2026-07-12",
  "learn/common-patterns-in-chinese-ai-copy": "2026-07-12",
  "learn/make-a-stiff-email-more-direct": "2026-07-12",
  "learn/replace-claims-with-evidence": "2026-07-12"
};

function isoDay(value) {
  if (!value) return null;
  const match = String(value).match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

function gitLastmod(file) {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", file], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    return isoDay(out);
  } catch {
    return null;
  }
}

function fsLastmod(file) {
  try {
    return isoDay(fs.statSync(file).mtime.toISOString());
  } catch {
    return null;
  }
}

/** Pull dateModified / datePublished next to a slug in Blog.tsx when present. */
function blogArticleDate(slug) {
  try {
    const src = fs.readFileSync("components/Blog.tsx", "utf8");
    const idx = src.indexOf(`slug:"${slug}"`);
    if (idx < 0) return null;
    const window = src.slice(idx, idx + 800);
    const modified = window.match(/dateModified:"(\d{4}-\d{2}-\d{2})"/)?.[1];
    const published = window.match(/datePublished:"(\d{4}-\d{2}-\d{2})"/)?.[1];
    return modified || published || null;
  } catch {
    return null;
  }
}

function maxDay(dates) {
  return dates.filter(Boolean).sort().at(-1) || isoDay(new Date().toISOString());
}

function lastmodFor(pagePath) {
  if (pagePath.startsWith("learn/") && pagePath !== "learn") {
    const fromBlog = blogArticleDate(pagePath.slice("learn/".length));
    if (fromBlog) return fromBlog;
    // Curated publish dates for guides that predate explicit dateModified fields.
    if (articleDateFallback[pagePath]) return articleDateFallback[pagePath];
    return maxDay([gitLastmod("components/Blog.tsx"), fsLastmod("components/Blog.tsx")]);
  }
  const sources = pathSources[pagePath] || ["lib/content.tsx"];
  const dates = sources.flatMap(file => [gitLastmod(file), fsLastmod(file)]);
  return maxDay(dates);
}

const escapeXml = value =>
  value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const absolute = (locale, pagePath) => `${origin}/${locale}/${pagePath ? `${pagePath}/` : ""}`;

const entries = paths.flatMap(pagePath => {
  const lastmod = lastmodFor(pagePath);
  return locales.map(locale => {
    const alternates = [
      ["en", absolute("en", pagePath)],
      ["zh-CN", absolute("zh-cn", pagePath)],
      ["x-default", absolute("en", pagePath)]
    ]
      .map(
        ([language, href]) =>
          `    <xhtml:link rel="alternate" hreflang="${language}" href="${escapeXml(href)}" />`
      )
      .join("\n");
    return `  <url>\n    <loc>${escapeXml(absolute(locale, pagePath))}</loc>\n    <lastmod>${lastmod}</lastmod>\n${alternates}\n  </url>`;
  });
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join("\n")}\n</urlset>\n`;
fs.writeFileSync("out/sitemap.xml", sitemap);

// Sanity: lastmod should not be identical for every URL when sources differ.
const uniqueLastmods = new Set(paths.map(lastmodFor));
console.log(`postbuild: robots from ${robotsSrc}; sitemap lastmods=${[...uniqueLastmods].sort().join(",")}`);
