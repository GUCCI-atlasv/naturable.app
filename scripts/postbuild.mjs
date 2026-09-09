import fs from "node:fs";
fs.copyFileSync("site/_worker.js","out/_worker.js");
fs.copyFileSync("site/robots.txt","out/robots.txt");

const origin="https://naturable.app";
const locales=["en","zh-cn"];
const paths=["","app","how-it-works","pricing","about","privacy","terms","learn","learn/how-to-remove-ai-tells","learn/what-is-perplexity-and-burstiness","learn/do-ai-humanizers-work","learn/common-patterns-in-chinese-ai-copy","learn/make-a-stiff-email-more-direct","learn/replace-claims-with-evidence"];
const lastmod="2026-09-09";
const escapeXml=value=>value.replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;");
const absolute=(locale,path)=>`${origin}/${locale}/${path?`${path}/`:""}`;
const entries=paths.flatMap(path=>locales.map(locale=>{
  const alternates=[
    ["en",absolute("en",path)],
    ["zh-CN",absolute("zh-cn",path)],
    ["x-default",absolute("en",path)]
  ].map(([language,href])=>`    <xhtml:link rel="alternate" hreflang="${language}" href="${escapeXml(href)}" />`).join("\n");
  return `  <url>\n    <loc>${escapeXml(absolute(locale,path))}</loc>\n    <lastmod>${lastmod}</lastmod>\n${alternates}\n  </url>`;
}));
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join("\n")}\n</urlset>\n`;
fs.writeFileSync("out/sitemap.xml",sitemap);
