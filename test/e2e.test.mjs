// End-to-end: load the unpacked extension in Chrome for Testing and check it on local pages.
// The test copy of the extension pre-grants http://127.0.0.1/* (the real flow asks via the popup).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "playwright-core";
import { chromePath } from "../scripts/chrome.mjs";

const SRC = resolve(import.meta.dirname, "../src");
const TEXT = "Great question! Experts believe we should delve into this robust plan. The future looks bright.";

const PAGES = {
  "/textarea": `<textarea id="t" style="width:520px;height:160px;font:16px/1.5 Georgia;padding:10px"></textarea>`,
  "/scroll": `<textarea id="t" style="width:420px;height:90px;font:15px/1.4 Arial;padding:6px"></textarea>`,
  "/editable": `<div id="e" contenteditable="true" style="width:560px;min-height:120px;font:15px/1.6 Arial;padding:8px;border:1px solid #ccc"><div>Hi team,</div><div><br></div><div>Experts&nbsp;believe the <b>launch</b> will go well, and we should <i>delve</i> into it.</div></div>`,
  "/sensitive": `<form><input type="password" name="pw"><textarea id="t" style="width:400px;height:100px"></textarea></form>`,
};

let server, port, ctx, sw, extId, dir;

before(async () => {
  server = createServer((req, res) => {
    const body = PAGES[req.url];
    res.writeHead(body ? 200 : 404, { "content-type": "text/html; charset=utf-8" });
    res.end(body ? `<!doctype html><html><body style="margin:40px">${body}</body></html>` : "nope");
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  port = server.address().port;

  dir = mkdtempSync(join(tmpdir(), "naturable-ext-"));
  const ext = join(dir, "ext");
  cpSync(SRC, ext, { recursive: true });
  const m = JSON.parse(readFileSync(join(ext, "manifest.json"), "utf8"));
  m.host_permissions = ["http://127.0.0.1/*"];
  writeFileSync(join(ext, "manifest.json"), JSON.stringify(m));

  ctx = await chromium.launchPersistentContext(join(dir, "profile"), {
    executablePath: chromePath(),
    headless: false,
    args: ["--headless=new", `--disable-extensions-except=${ext}`, `--load-extension=${ext}`],
    viewport: { width: 1000, height: 700 },
  });
  sw = ctx.serviceWorkers()[0] || (await ctx.waitForEvent("serviceworker"));
  extId = new URL(sw.url()).host;
  await sw.evaluate(() => syncRegistration());
});

after(async () => {
  await ctx?.close();
  server?.close();
  rmSync(dir, { recursive: true, force: true });
});

/** Read the closed shadow root of <naturable-overlay> through CDP. */
async function overlay(page) {
  const cdp = await ctx.newCDPSession(page);
  const { root } = await cdp.send("DOM.getDocument", { depth: -1, pierce: true });
  const found = { lines: [], card: null };
  const walk = (n) => {
    const attrs = Object.fromEntries((n.attributes || []).reduce((a, v, i, arr) => (i % 2 ? a : a.concat([[v, arr[i + 1]]])), []));
    if (n.nodeName === "DIV" && /\bline\b/.test(attrs.class || "")) found.lines.push({ id: n.nodeId, cls: attrs.class, style: attrs.style });
    if (n.nodeName === "DIV" && /\bcard\b/.test(attrs.class || "")) found.card = { id: n.nodeId, hidden: "hidden" in attrs };
    for (const c of [...(n.children || []), ...(n.shadowRoots || [])]) walk(c);
  };
  walk(root);
  if (found.card) found.card.html = (await cdp.send("DOM.getOuterHTML", { nodeId: found.card.id })).outerHTML;
  const box = (style) => Object.fromEntries([...style.matchAll(/(left|top|width|height):\s*([\d.]+)px/g)].map(([, k, v]) => [k, +v]));
  found.lines = found.lines.map((l) => ({ ...l, box: box(l.style) }));
  await cdp.detach();
  return found;
}

async function waitLines(page, n) {
  for (let i = 0; i < 40; i++) {
    const o = await overlay(page);
    if (o.lines.length >= n) return o;
    await page.waitForTimeout(100);
  }
  return overlay(page);
}

const badge = (page) => sw.evaluate(async (url) => {
  const [t] = await chrome.tabs.query({ url });
  return chrome.action.getBadgeText({ tabId: t.id });
}, page.url());

test("textarea: underlines hits, explains them on hover, Ignore removes one", async () => {
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port}/textarea`);
  await page.click("#t");
  await page.keyboard.type(TEXT);
  const o = await waitLines(page, 5);
  assert.ok(o.lines.length >= 5, `expected ≥5 underlines, got ${o.lines.length}`);
  assert.equal(await badge(page), "5");

  // Every underline sits inside the textarea.
  const ta = await page.locator("#t").boundingBox();
  for (const l of o.lines) {
    assert.ok(l.box.left >= ta.x - 1 && l.box.left + l.box.width <= ta.x + ta.width + 1, "line inside textarea horizontally");
    assert.ok(l.box.top >= ta.y - 1 && l.box.top <= ta.y + ta.height, "line inside textarea vertically");
  }

  // The first underline should cover "Great question!" at the start of the text.
  const first = o.lines.slice().sort((a, b) => a.box.top - b.box.top || a.box.left - b.box.left)[0];
  const startX = await page.evaluate(() => {
    const t = document.getElementById("t"), cs = getComputedStyle(t);
    return t.getBoundingClientRect().left + t.clientLeft + parseFloat(cs.paddingLeft);
  });
  assert.ok(Math.abs(first.box.left - startX) < 2, `first underline starts at text start (${first.box.left} vs ${startX})`);

  await page.mouse.move(first.box.left + 5, first.box.top + first.box.height - 2);
  await page.waitForTimeout(400);
  const shown = await overlay(page);
  assert.ok(!shown.card.hidden, "card visible");
  assert.match(shown.card.html, /Assistant chatter/);
  assert.match(shown.card.html, /href="https:\/\/naturable\.app\/en\/signs-of-ai-writing\/#assistant-leftovers"/);

  // Click "Ignore" inside the closed shadow root by coordinates.
  const cdp = await ctx.newCDPSession(page);
  const { model } = await cdp.send("DOM.getBoxModel", { nodeId: (await (async () => {
    const { root } = await cdp.send("DOM.getDocument", { depth: -1, pierce: true });
    let id = null;
    const walk = (n) => { if (n.nodeName === "BUTTON" && n.children?.[0]?.nodeValue === "Ignore") id = n.nodeId; for (const c of [...(n.children || []), ...(n.shadowRoots || [])]) walk(c); };
    walk(root);
    return id;
  })()) });
  await cdp.detach();
  const [x1, y1, , , x3, y3] = model.content;
  await page.mouse.click((x1 + x3) / 2, (y1 + y3) / 2);
  await page.waitForTimeout(700);
  const ignored = await sw.evaluate(() => chrome.storage.local.get("ignoredKeys"));
  assert.deepEqual(ignored.ignoredKeys, ["en.artifact.chat:great question!"]);
  assert.equal(await badge(page), "4");
  await sw.evaluate(() => chrome.storage.local.set({ ignoredKeys: [] }));
  await page.close();
});

test("textarea: underlines follow scrolling and stay clipped to the box", async () => {
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port}/scroll`);
  await page.click("#t");
  const filler = ["Monday we met.", "The room was cold, so we moved twice.", "Lunch ran late", "Sam drew the plan on a napkin and we kept it.",
    "Rain.", "Then the bus broke down near the bridge on the way back.", "Nobody minded", "We got home at nine."];
  await page.keyboard.type(filler.join("\n") + "\nExperts believe it works.");
  await page.waitForTimeout(500);
  await page.evaluate(() => { const t = document.getElementById("t"); t.scrollTop = t.scrollHeight; });
  const o = await waitLines(page, 1);
  assert.equal(o.lines.length, 1);
  const ta = await page.locator("#t").boundingBox();
  assert.ok(o.lines[0].box.top > ta.y && o.lines[0].box.top < ta.y + ta.height, "visible after scrolling to the end");
  await page.evaluate(() => { document.getElementById("t").scrollTop = 0; });
  await page.waitForTimeout(300);
  assert.equal((await overlay(page)).lines.length, 0, "hidden when the hit is scrolled out of view");
  await page.close();
});

test("contenteditable: maps hits across nodes, <br> and &nbsp; to the right place", async () => {
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port}/editable`);
  await page.click("#e");
  const o = await waitLines(page, 2);
  const expected = await page.evaluate(() => {
    const out = {};
    const tn = document.querySelector("#e > div:nth-child(3)").firstChild; // "Experts believe the "
    const r = document.createRange(); r.setStart(tn, 0); r.setEnd(tn, 15);
    out.experts = r.getBoundingClientRect().toJSON();
    const i = document.querySelector("#e i").firstChild;
    const r2 = document.createRange(); r2.selectNodeContents(i);
    out.delve = r2.getBoundingClientRect().toJSON();
    return out;
  });
  for (const [name, want] of Object.entries(expected)) {
    const hit = o.lines.find((l) => Math.abs(l.box.left - want.left) < 1.5 && Math.abs(l.box.width - want.width) < 1.5);
    assert.ok(hit, `underline for "${name}" at ${want.left},${want.top} (got ${JSON.stringify(o.lines.map((l) => l.box))})`);
  }
  await page.close();
});

test("skips text boxes in forms with password fields", async () => {
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port}/sensitive`);
  await page.click("#t");
  await page.keyboard.type(TEXT);
  await page.waitForTimeout(800);
  assert.equal((await overlay(page)).lines.length, 0);
  await page.close();
});

test("turning a site off tears the overlay down", async () => {
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port}/textarea`);
  await page.click("#t");
  await page.keyboard.type(TEXT);
  await waitLines(page, 5);
  await sw.evaluate(() => tellTabs("http://127.0.0.1/*", { type: "naturable:off" }));
  await page.waitForTimeout(300);
  const has = await page.evaluate(() => !!document.querySelector("naturable-overlay"));
  assert.equal(has, false);
  await page.close();
});

test("side panel: checks a selection sent from the context menu", async () => {
  const page = await ctx.newPage();
  await page.goto(`chrome-extension://${extId}/sidepanel/sidepanel.html`);
  await sw.evaluate((text) => chrome.storage.session.set({ pending: { text, ts: Date.now() } }), TEXT);
  await page.waitForFunction(() => document.querySelectorAll(".finding").length > 0);
  assert.equal(await page.inputValue("#text"), TEXT);
  const score = Number(await page.textContent("#score"));
  assert.ok(score > 0 && score < 80, `score ${score}`);
  assert.match(await page.textContent("#band"), /AI patterns/);
  const delve = await page.locator(".finding", { hasText: "delve" }).locator("a").getAttribute("href");
  assert.equal(delve, "https://naturable.app/en/ai-words-to-avoid/#delve");
  await page.screenshot({ path: join(resolve(import.meta.dirname), "screenshots/sidepanel.png"), fullPage: true });
  await page.close();
});

test("popup renders on a page it can't run on", async () => {
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 320, height: 420 });
  await page.goto(`chrome-extension://${extId}/popup/popup.html`);
  await page.waitForFunction(() => document.getElementById("status").textContent.length > 0);
  assert.match(await page.textContent("#status"), /can't run on this page/);
  assert.match(await page.textContent("#version"), /en-v1\.1/);
  await page.close();
});
