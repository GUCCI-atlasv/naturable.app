// Static checks before testing or packing. Fails on:
//  - permissions beyond what the landing page and store listing explain
//  - static host access or content scripts (sites must be opted into at runtime)
//  - remote code or code-from-strings (Chrome Web Store policy, PRD §6.2)
//  - files referenced by the manifest, HTML pages or the service worker that don't exist
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { execFileSync } from "node:child_process";

const SRC = resolve(import.meta.dirname, "../src");
const m = JSON.parse(readFileSync(join(SRC, "manifest.json"), "utf8"));
const errors = [];
const err = (msg) => errors.push(msg);

const ALLOWED = ["activeTab", "contextMenus", "sidePanel", "storage", "scripting"];
for (const p of m.permissions || []) if (!ALLOWED.includes(p)) err(`permission not allowed: ${p}`);
for (const p of ALLOWED) if (!(m.permissions || []).includes(p)) err(`missing permission: ${p}`);
if (m.host_permissions?.length) err("host_permissions must be empty (sites are granted one by one at runtime)");
if (m.content_scripts?.length) err("no static content_scripts (scripts are registered per enabled site)");
for (const o of m.optional_host_permissions || []) if (!/^https?:\/\/\*\/\*$/.test(o)) err(`unexpected optional host: ${o}`);
if (m.manifest_version !== 3) err("manifest_version must be 3");

const files = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : [join(dir, f)]));
const all = files(SRC);
const need = (from, rel) => { const p = resolve(from, rel); if (!existsSync(p)) err(`${from.replace(SRC, "src")}: missing ${rel}`); };

// Manifest references
const refs = [m.background?.service_worker, m.action?.default_popup, m.side_panel?.default_path,
  ...Object.values(m.icons || {}), ...Object.values(m.action?.default_icon || {})].filter(Boolean);
for (const r of refs) need(SRC, r);

for (const f of all) {
  const text = /\.(js|html|css)$/.test(f) ? readFileSync(f, "utf8") : "";
  if (f.endsWith(".html")) {
    for (const [, src] of text.matchAll(/<(?:script|link)[^>]+(?:src|href)="([^"]+)"/g)) {
      if (/^https?:|^\/\//.test(src)) err(`${f.replace(SRC, "src")}: remote resource ${src}`);
      else need(dirname(f), src);
    }
    if (/<script(?![^>]*\bsrc=)[^>]*>/.test(text)) err(`${f.replace(SRC, "src")}: inline <script> (blocked by MV3 CSP)`);
  }
  if (f.endsWith(".js")) {
    try { execFileSync(process.execPath, ["--check", f], { stdio: "pipe" }); } catch (e) { err(`${f.replace(SRC, "src")}: syntax error\n${e.stderr}`); }
    if (/\beval\s*\(|new Function\s*\(|\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon/.test(text)) err(`${f.replace(SRC, "src")}: network or code-from-string call`);
  }
}

// Files the service worker injects
const sw = readFileSync(join(SRC, m.background.service_worker), "utf8");
const cs = JSON.parse(sw.match(/const CS_FILES = (\[[^\]]+\])/)[1]);
for (const f of cs) need(SRC, f);
for (const [, f] of sw.matchAll(/importScripts\("([^"]+)"\)/g)) need(SRC, f);

if (errors.length) { console.error(errors.map((e) => "ERROR " + e).join("\n")); process.exit(1); }
console.log(`manifest ok · ${m.version} · permissions: ${m.permissions.join(", ")} · ${all.length} files`);
