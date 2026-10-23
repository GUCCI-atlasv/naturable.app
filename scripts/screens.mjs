// Render screenshots of the extension at work (also the starting point for store screenshots, PRD §6.4).
// Output: test/screenshots/*.png
import { createServer } from "node:http";
import { cpSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "playwright-core";
import { chromePath } from "./chrome.mjs";

const ROOT = resolve(import.meta.dirname, "..");
const OUT = join(ROOT, "test/screenshots");
mkdirSync(OUT, { recursive: true });

const COMPOSE = `<!doctype html><html><body style="margin:0;background:#f6f8fc;font-family:Arial,sans-serif">
<div style="position:absolute;right:40px;bottom:0;width:560px;background:#fff;border-radius:10px 10px 0 0;box-shadow:0 4px 20px rgba(0,0,0,.2)">
  <div style="background:#f2f6fc;padding:10px 14px;border-radius:10px 10px 0 0;font-size:14px">New Message</div>
  <div style="padding:8px 14px;border-bottom:1px solid #eee;font-size:14px;color:#555">To: design-team@example.com</div>
  <div style="padding:8px 14px;border-bottom:1px solid #eee;font-size:14px">Q3 launch plan</div>
  <div id="body" contenteditable="true" style="padding:12px 14px;min-height:260px;font-size:14px;line-height:1.6;outline:none">
    <div>Hi team,</div><div><br></div>
    <div>I wanted to leverage this week to share where the launch stands. Experts believe the new tier will lift conversion, and the pricing page is not just a page, it's a pivotal moment for the brand.</div>
    <div><br></div><div>We will delve into the numbers on Thursday. The future looks bright.</div>
    <div><br></div><div>Best,<br>Maya</div>
  </div>
</div></body></html>`;

const server = createServer((req, res) => { res.writeHead(200, { "content-type": "text/html" }); res.end(COMPOSE); });
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const url = `http://127.0.0.1:${server.address().port}/compose`;

const dir = mkdtempSync(join(tmpdir(), "naturable-shots-"));
const ext = join(dir, "ext");
cpSync(join(ROOT, "src"), ext, { recursive: true });
const m = JSON.parse(readFileSync(join(ext, "manifest.json"), "utf8"));
m.host_permissions = ["http://127.0.0.1/*"];
writeFileSync(join(ext, "manifest.json"), JSON.stringify(m));

const ctx = await chromium.launchPersistentContext(join(dir, "profile"), {
  executablePath: chromePath(), headless: false,
  args: ["--headless=new", `--disable-extensions-except=${ext}`, `--load-extension=${ext}`],
  viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1,
});
const sw = ctx.serviceWorkers()[0] || (await ctx.waitForEvent("serviceworker"));
const id = new URL(sw.url()).host;
await sw.evaluate(() => syncRegistration());

const page = await ctx.newPage();
await page.goto(url);
await page.click("#body");
await page.waitForTimeout(800);
// Hover "Experts believe": find it in the page and move there.
const box = await page.evaluate(() => {
  const walker = document.createTreeWalker(document.getElementById("body"), NodeFilter.SHOW_TEXT);
  for (let n; (n = walker.nextNode()); ) {
    const i = n.nodeValue.indexOf("Experts believe");
    if (i >= 0) { const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + 15); return r.getBoundingClientRect().toJSON(); }
  }
});
await page.mouse.move(box.left + 20, box.bottom - 3);
await page.waitForTimeout(500);
await page.screenshot({ path: join(OUT, "inline-hover.png") });

const tabId = await sw.evaluate(async (u) => (await chrome.tabs.query({ url: u }))[0].id, url);
const popup = await ctx.newPage();
await popup.setViewportSize({ width: 320, height: 400 });
await popup.goto(`chrome-extension://${id}/popup/popup.html?tab=${tabId}`);
await popup.waitForTimeout(400);
await popup.screenshot({ path: join(OUT, "popup.png"), fullPage: true });

const panel = await ctx.newPage();
await panel.setViewportSize({ width: 400, height: 900 });
await panel.goto(`chrome-extension://${id}/sidepanel/sidepanel.html`);
await sw.evaluate(() => chrome.storage.session.set({ pending: { ts: Date.now(), text:
  "I wanted to leverage this week to share where the launch stands. Experts believe the new tier will lift conversion. We will delve into the numbers on Thursday. The future looks bright." } }));
await panel.waitForSelector(".finding");
await panel.screenshot({ path: join(OUT, "sidepanel.png"), fullPage: true });

await ctx.close();
server.close();
rmSync(dir, { recursive: true, force: true });
console.log("screenshots in test/screenshots/");
