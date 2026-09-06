import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve("out");
const origin = "https://naturable.app";
const sitemapPath = path.join(outDir, "sitemap.xml");
const errors = [];

const assert = (condition, message) => {
  if (!condition) errors.push(message);
};

const sitemap = fs.readFileSync(sitemapPath, "utf8");
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert(locations.length === 28, `Expected 28 sitemap URLs, found ${locations.length}.`);
assert(new Set(locations).size === locations.length, "Sitemap contains duplicate URLs.");

for (const location of locations) {
  assert(location.startsWith(`${origin}/`), `Non-canonical sitemap host or protocol: ${location}`);
  assert(location.endsWith("/"), `Sitemap URL is missing a trailing slash: ${location}`);
  assert(!location.includes("www."), `Sitemap contains a www URL: ${location}`);
  assert(!location.endsWith(".html"), `Sitemap contains a legacy HTML URL: ${location}`);

  const pathname = new URL(location).pathname;
  const htmlPath = path.join(outDir, pathname, "index.html");
  assert(fs.existsSync(htmlPath), `Sitemap target is missing from the export: ${pathname}`);
  if (!fs.existsSync(htmlPath)) continue;

  const html = fs.readFileSync(htmlPath, "utf8");
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  assert(canonical === location, `Canonical mismatch for ${pathname}: ${canonical || "missing"}`);

  const alternateLinks = [...html.matchAll(/<link rel="alternate"[^>]*>/gi)].map(match => match[0]);
  const alternates = Object.fromEntries(alternateLinks.map(link => {
    const href = link.match(/\shref="([^"]+)"/i)?.[1];
    const language = link.match(/\shreflang="([^"]+)"/i)?.[1];
    return [language, href];
  }).filter(([language, href]) => language && href));
  const counterpart = pathname.startsWith("/zh-cn/")
    ? location.replace("/zh-cn/", "/en/")
    : location.replace("/en/", "/zh-cn/");
  assert(alternates.en === (pathname.startsWith("/en/") ? location : counterpart), `English hreflang mismatch for ${pathname}`);
  assert(alternates["zh-CN"] === (pathname.startsWith("/zh-cn/") ? location : counterpart), `Chinese hreflang mismatch for ${pathname}`);
  assert(alternates["x-default"] === alternates.en, `x-default mismatch for ${pathname}`);

  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map(match => match[1]);
  for (const href of hrefs) {
    assert(!/naturable\.app\/.*\.html(?:[?#]|$)/.test(href), `Legacy absolute link in ${pathname}: ${href}`);
    assert(!/^\/(?:app|about|privacy|pricing|terms|how-it-works|learn)(?:\/|[?#]|$)/.test(href), `Unlocalized internal link in ${pathname}: ${href}`);
  }
}

const worker = fs.readFileSync(path.join(outDir, "_worker.js"), "utf8");
assert(worker.includes('"X-Robots-Tag": "noindex"'), "RSC text responses are missing X-Robots-Tag: noindex.");

if (errors.length) {
  console.error(`SEO audit failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`SEO audit passed: ${locations.length} canonical URLs validated.`);
