// Chrome Web Store assets, rendered from the real extension (PRD §6.4).
//   store/screenshots/01–04  1280×800 RGB PNG: underlines, hover card and side panel are the extension's own UI,
//                            running in Chrome for Testing on generic mock pages (store/pages/).
//   store/promo/             440×280 small tile, 1400×560 marquee (HTML in store/pages/).
// Screenshot 05 (the Signs page on naturable.app) comes from the site and isn't rendered here.
// Usage: node scripts/store-assets.mjs
import { createServer } from "node:http";
import { cpSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, extname } from "node:path";
import { chromium } from "playwright-core";
import { chromePath } from "./chrome.mjs";

const ROOT = resolve(import.meta.dirname, "..");
const PAGES = join(ROOT, "store/pages");
const SHOTS = join(ROOT, "store/screenshots");
const PROMO = join(ROOT, "store/promo");
mkdirSync(SHOTS, { recursive: true });
mkdirSync(PROMO, { recursive: true });

// ---- Local server for the mock pages ----
const ALIASES = { "/icon-16.png": join(ROOT, "src/icons/32.png"), "/icon-mark.png": join(ROOT, "store/source/icon-128-padded.png") };
const TYPES = { ".html": "text/html; charset=utf-8", ".png": "image/png", ".woff2": "font/woff2" };
const server = createServer((req, res) => {
  const path = new URL(req.url, "http://x").pathname;
  const file = ALIASES[path] || join(PAGES, path.replace(/^\/+/, ""));
  if (!file.startsWith(ROOT) || !existsSync(file)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const PORT = server.address().port;
const ON = `http://127.0.0.1:${PORT}`; // extension enabled here
const OFF = `http://localhost:${PORT}`; // not enabled (selection + side panel shot)

// ---- Extension copy with the test origin pre-granted (the real flow asks in the popup) ----
const tmp = mkdtempSync(join(tmpdir(), "naturable-store-"));
const ext = join(tmp, "ext");
cpSync(join(ROOT, "src"), ext, { recursive: true });
const manifest = JSON.parse(readFileSync(join(ext, "manifest.json"), "utf8"));
manifest.host_permissions = ["http://127.0.0.1/*"];
writeFileSync(join(ext, "manifest.json"), JSON.stringify(manifest));

async function withExtension(scale, viewport, name) {
  const ctx = await chromium.launchPersistentContext(join(tmp, "profile-" + name), {
    executablePath: chromePath(), headless: false, deviceScaleFactor: scale, viewport,
    args: ["--headless=new", `--disable-extensions-except=${ext}`, `--load-extension=${ext}`, "--hide-scrollbars"],
  });
  const sw = ctx.serviceWorkers()[0] || (await ctx.waitForEvent("serviceworker"));
  await sw.evaluate(() => syncRegistration());
  return { ctx, sw, id: new URL(sw.url()).host };
}

/** Viewport rect of the first occurrence of `phrase` inside `selector`. */
const rectOf = (page, selector, phrase) => page.evaluate(([sel, ph]) => {
  const w = document.createTreeWalker(document.querySelector(sel), NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode()); ) {
    const i = n.nodeValue.indexOf(ph);
    if (i >= 0) { const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + ph.length); return r.getBoundingClientRect().toJSON(); }
  }
  throw new Error("not found: " + ph);
}, [selector, phrase]);

async function focusEnd(page, selector) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    el.focus();
    const r = document.createRange(); r.selectNodeContents(el); r.collapse(false);
    const s = getSelection(); s.removeAllRanges(); s.addRange(r);
  }, selector);
  await page.waitForTimeout(900); // analysis is debounced; give layout a frame
}

async function hover(page, selector, phrase) {
  const r = await rectOf(page, selector, phrase);
  await page.mouse.move(r.left + Math.min(24, r.width / 3), r.bottom - 3);
  await page.waitForTimeout(600);
}

const shot = (page, name) => page.screenshot({ path: join(SHOTS, name), type: "png" });

// ---- Screenshots 1–3 at 1.6× (800×500 CSS = 1280×800) ----
{
  const { ctx, sw, id } = await withExtension(1.6, { width: 800, height: 500 }, "a");

  // 01 Mail compose: underlines + hover card on "Experts believe".
  const mail = await ctx.newPage();
  await mail.goto(`${ON}/mail.html`);
  await focusEnd(mail, "#body");
  await hover(mail, "#body", "Experts believe");
  await shot(mail, "01-mail-hover-card.png");

  // 02 Social post: underlines only (strong = solid, suggestion = dotted).
  const social = await ctx.newPage();
  await social.goto(`${ON}/social.html`);
  await focusEnd(social, "#post");
  await social.mouse.move(790, 490);
  await social.waitForTimeout(300);
  await shot(social, "02-social-post-underlines.png");

  // 03 Selection + right-click menu (left) and the real side panel (right), composed side by side.
  const LEFT = 465, PANEL = 800 - LEFT; // CSS px; ×1.6 = 744 + 536
  const notes = await ctx.newPage();
  await notes.setViewportSize({ width: LEFT, height: 500 });
  await notes.goto(`${OFF}/notes.html?mode=select`);
  const selected = await notes.evaluate(() => {
    const p = document.getElementById("sel");
    const r = document.createRange(); r.selectNodeContents(p);
    const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    const box = r.getBoundingClientRect(), menu = document.getElementById("menu");
    menu.hidden = false;
    // Right-click spot: inside the selection, with the whole menu on screen.
    menu.style.left = Math.min(box.left + 110, innerWidth - menu.offsetWidth - 12) + "px";
    menu.style.top = Math.min(box.top + box.height * 0.55, innerHeight - menu.offsetHeight - 16) + "px";
    return p.textContent;
  });
  const left = await notes.screenshot({ type: "png" });

  const panel = await ctx.newPage();
  await panel.setViewportSize({ width: PANEL, height: 500 });
  await panel.goto(`chrome-extension://${id}/sidepanel/sidepanel.html`);
  await sw.evaluate((text) => chrome.storage.session.set({ pending: { text, ts: Date.now() } }), selected);
  await panel.waitForSelector(".finding");
  await panel.waitForTimeout(200);
  const right = await panel.screenshot({ type: "png" });
  await ctx.close();

  const plain = await chromium.launch({ executablePath: chromePath() });
  const comp = await plain.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  const b64 = (buf) => "data:image/png;base64," + buf.toString("base64");
  await comp.setContent(`<body style="margin:0;display:flex;background:#fff">
    <img src="${b64(left)}" style="width:744px;height:800px;display:block">
    <img src="${b64(right)}" style="width:536px;height:800px;display:block;box-shadow:-1px 0 0 #d9d6cf, -10px 0 24px rgba(0,0,0,.06)">
  </body>`);
  await comp.waitForTimeout(100);
  await shot(comp, "03-side-panel-selection.png");

  // ---- Promo tiles (exact size, 1×) ----
  for (const [file, w, h] of [["promo-small.html", 440, 280], ["promo-marquee.html", 1400, 560]]) {
    const p = await plain.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await p.goto(`${ON}/${file}`);
    await p.waitForTimeout(150);
    await p.screenshot({ path: join(PROMO, `${file.replace(".html", "")}-${w}x${h}.png`), type: "png" });
  }
  await plain.close();
}

// ---- Screenshot 4: hover card close-up at 2× (640×400 CSS) ----
{
  const { ctx } = await withExtension(2, { width: 640, height: 400 }, "b");
  const page = await ctx.newPage();
  await page.goto(`${ON}/notes.html`);
  await focusEnd(page, "#doc");
  await hover(page, "#doc", "Experts believe");
  await shot(page, "04-hover-card-closeup.png");
  await ctx.close();
}

server.close();
rmSync(tmp, { recursive: true, force: true });

// ---- Spec check: size and no alpha channel (PNG colour type 2 = RGB) ----
const CHECK = [
  ...["01-mail-hover-card", "02-social-post-underlines", "03-side-panel-selection", "04-hover-card-closeup"].map((n) => [join(SHOTS, n + ".png"), 1280, 800]),
  [join(PROMO, "promo-small-440x280.png"), 440, 280],
  [join(PROMO, "promo-marquee-1400x560.png"), 1400, 560],
];
let bad = 0;
for (const [f, w, h] of CHECK) {
  const b = readFileSync(f);
  const ok = b.readUInt32BE(16) === w && b.readUInt32BE(20) === h && b[25] === 2;
  if (!ok) bad++;
  console.log(`${ok ? "ok " : "BAD"} ${f.replace(ROOT + "/", "")} ${b.readUInt32BE(16)}×${b.readUInt32BE(20)} colour type ${b[25]} ${Math.round(b.length / 1024)} KB`);
}
process.exit(bad ? 1 : 0);
