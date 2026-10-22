// One-time import of the pre-v2 site (Next.js export) into content/legacy/*.json.
// Usage: node scripts/import-legacy.mjs <dir-with-downloaded-html>
// Files are named like the URL path with "/" -> "__" (e.g. en__learn__foo.html).
// The output is committed; this script only needs to run again if the old pages are re-fetched.

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = process.argv[2];
if (!srcDir) {
  console.error("usage: node scripts/import-legacy.mjs <dir>");
  process.exit(1);
}

// Pages rebuilt by hand in v2 are not imported.
const SKIP = new Set(["en", "zh-cn", "en__app", "zh-cn__app", "en__pricing", "zh-cn__pricing", "en__learn", "zh-cn__learn", "en__how-it-works", "en__privacy"]);

const KEEP_TAGS = new Set(["h2", "h3", "h4", "p", "ul", "ol", "li", "strong", "b", "em", "i", "a", "mark", "del", "ins", "code", "blockquote", "table", "thead", "tbody", "tr", "th", "td", "br"]);
const BLOCK_TAGS = new Set(["div", "section", "article", "aside", "header", "footer", "figure"]);

function decodeCfEmail(hex) {
  const key = parseInt(hex.slice(0, 2), 16);
  let out = "";
  for (let i = 2; i < hex.length; i += 2) out += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ key);
  return out;
}

function pick(re, s) {
  const m = s.match(re);
  return m ? m[1] : null;
}

function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function sanitize(html) {
  let s = html
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<svg[\s\S]*?<\/svg>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<button[\s\S]*?<\/button>/g, "")
    .replace(/<a href="\/cdn-cgi\/l\/email-protection"[^>]*data-cfemail="([0-9a-f]+)"[^>]*>[\s\S]*?<\/a>/g, (_, hex) => {
      const email = decodeCfEmail(hex);
      return `<a href="mailto:${email}">${email}</a>`;
    });
  // Promote small labels and card titles to paragraphs/headings so unwrapped cards still read in order.
  s = s.replace(/<small[^>]*>([\s\S]*?)<\/small>/g, "<p><strong>$1</strong></p>");
  s = s.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/g, "<h2>$1</h2>");
  s = s.replace(/<(\/?)([a-zA-Z0-9]+)([^>]*)>/g, (full, close, tag, attrs) => {
    tag = tag.toLowerCase();
    if (KEEP_TAGS.has(tag)) {
      if (close) return `</${tag}>`;
      if (tag === "a") {
        const href = pick(/href="([^"]*)"/, attrs);
        return href ? `<a href="${href}">` : "<a>";
      }
      return `<${tag}>`;
    }
    if (BLOCK_TAGS.has(tag)) return "\n";
    return ""; // span, i (style), etc. are unwrapped
  });
  s = s.replace(/<b>/g, "<strong>").replace(/<\/b>/g, "</strong>");
  s = s.replace(/<p>\s*<\/p>/g, "").replace(/\n{2,}/g, "\n").trim();
  return s;
}

function importPage(name, html) {
  const path = "/" + name.replace(/__/g, "/") + "/";
  const lang = name.startsWith("zh-cn") ? "zh" : "en";
  const title = decodeEntities(pick(/<title>([\s\S]*?)<\/title>/, html) || "");
  const description = decodeEntities(pick(/<meta name="description" content="([^"]*)"/, html) || "");
  const main = pick(/<main[^>]*>([\s\S]*?)<\/main>/, html) || "";
  const isContentPage = /<main[^>]*content-page/.test(html);
  const article = isContentPage ? main : pick(/<article[^>]*>([\s\S]*?)<\/article>/, main) || main;
  const related = [...(pick(/<aside class="related-posts">([\s\S]*?)<\/aside>/, main) || "").matchAll(/<a href="([^"]+)"><span>([^<]*)<\/span><b>([^<]*)<\/b><\/a>/g)]
    .map(([, href, topic, title]) => ({ href, topic: decodeEntities(topic), title: decodeEntities(title) }));

  const h1 = decodeEntities((pick(/<h1[^>]*>([\s\S]*?)<\/h1>/, article) || "").replace(/<[^>]+>/g, ""));
  const dek = decodeEntities((pick(/<p class="article-dek">([\s\S]*?)<\/p>/, article) || "").replace(/<[^>]+>/g, ""));
  const topic = decodeEntities(pick(/<span class="guide-topic">([\s\S]*?)<\/span>/, article) || "");
  const meta = [...(pick(/<div class="article-meta">([\s\S]*?)<\/div>/, article) || "").matchAll(/<span>([^<]*)<\/span>/g)].map((m) => m[1]);
  const dateModified = pick(/"dateModified":"([^"]+)"/, main);
  const datePublished = pick(/"datePublished":"([^"]+)"/, main);

  let body = article
    .replace(/<nav class="breadcrumbs"[\s\S]*?<\/nav>/, "")
    .replace(/<span class="guide-topic">[\s\S]*?<\/span>/, "")
    .replace(/<h1[^>]*>[\s\S]*?<\/h1>/, "")
    .replace(/<p class="article-dek">[\s\S]*?<\/p>/, "")
    .replace(/<div class="article-meta">[\s\S]*?<\/div>/, "")
    .replace(/<section class="article-cta">[\s\S]*?<\/section>/, "")
    .replace(/<div class="content-actions">[\s\S]*?<\/div>/, "")
    .replace(/<a class="btn"[^>]*>[\s\S]*?<\/a>/g, "");
  // Content pages (no <article>) start with a hero <section>: use its first paragraph as the dek.
  let lede = dek;
  if (isContentPage) {
    // Interactive demos from the old React page don't survive as prose; keep the explanatory text.
    body = body
      .replace(/<section class="(?:evidence-grid|compare-demo)">[\s\S]*?<\/section>/g, "")
      .replace(/<div class="dimension-list">[\s\S]*?<\/div><\/div>/g, "")
      .replace(/<span>\d\d<\/span>/g, "");
  }
  if (!lede && isContentPage) {
    const hero = pick(/<section class="content-hero">([\s\S]*?)<\/section>/, body);
    if (hero) {
      lede = decodeEntities((pick(/<p>([\s\S]*?)<\/p>/, hero) || "").replace(/<[^>]+>/g, ""));
      body = body.replace(/<section class="content-hero">[\s\S]*?<\/section>/, "");
    }
  } else if (!lede) {
    // Plain prose pages: first paragraph becomes the lede.
    const first = pick(/^\s*<p>([\s\S]*?)<\/p>/, body);
    if (first) {
      lede = decodeEntities(first.replace(/<[^>]+>/g, ""));
      body = body.replace(/^\s*<p>[\s\S]*?<\/p>/, "");
    }
  }

  return {
    path, lang, title, description, h1, lede, topic,
    readTime: meta.find((m) => /min|分钟/.test(m)) || null,
    datePublished, dateModified,
    bodyHtml: sanitize(body),
    related,
    importedFrom: "https://naturable.app" + path,
  };
}

const outDir = join(root, "content", "legacy");
mkdirSync(outDir, { recursive: true });
let n = 0;
for (const file of readdirSync(srcDir).filter((f) => f.endsWith(".html")).sort()) {
  const name = file.replace(/\.html$/, "");
  if (SKIP.has(name)) continue;
  const page = importPage(name, readFileSync(join(srcDir, file), "utf8"));
  writeFileSync(join(outDir, name + ".json"), JSON.stringify(page, null, 2) + "\n");
  n++;
}
console.log(`imported ${n} pages into content/legacy/`);
