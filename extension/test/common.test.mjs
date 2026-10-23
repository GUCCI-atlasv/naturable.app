import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const ctx = { console, URL };
ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ["../src/vendor/naturable.iife.js", "../src/shared/docs-words.js", "../src/shared/common.js"]) {
  vm.runInContext(readFileSync(new URL(f, import.meta.url), "utf8"), ctx);
}
const S = ctx.NatShared;

test("sensitive hosts stay off", () => {
  for (const h of ["www.paypal.com", "online.chase.com", "bankofamerica.com", "my.hsbcbank.co.uk", "accounts.google.com",
    "login.example.com", "secure.example.org", "irs.gov", "gov.uk.example.gov.uk", "vault.bitwarden.com"]) {
    assert.ok(S.isSensitiveHost(h), h);
  }
  for (const h of ["mail.google.com", "www.linkedin.com", "x.com", "www.reddit.com", "www.notion.so", "medium.com", "wordpress.com", "docs.google.com"]) {
    assert.ok(!S.isSensitiveHost(h), h);
  }
});

test("origin patterns", () => {
  assert.equal(S.originPattern("https://mail.google.com/mail/u/0/#inbox"), "https://mail.google.com/*");
  assert.equal(S.originPattern("http://localhost:3000/x"), "http://localhost/*");
  assert.equal(S.originPattern("chrome://extensions"), null);
});

test("learn-more links: words get their own anchor, rules their docs", () => {
  const r = S.analyze("Experts believe we should delve into it.", { purpose: "general", ignoredKeys: [] });
  const byId = Object.fromEntries(r.issues.map((i) => [i.text.toLowerCase(), S.docsFor(i)]));
  assert.equal(byId["delve"], "https://naturable.app/en/ai-words-to-avoid/#delve");
  assert.equal(byId["experts believe"], "https://naturable.app/en/signs-of-ai-writing/#vague-sources");
});

test("ignored keys are skipped; oversized text is not analyzed", () => {
  const r = S.analyze("We should delve into it.", { purpose: "general", ignoredKeys: ["en.lexicon.cliche:delve"] });
  assert.ok(!r.issues.some((i) => i.text === "delve"));
  assert.equal(S.analyze("a".repeat(S.MAX_CHARS + 1), { purpose: "general", ignoredKeys: [] }), null);
});

test("score bands match the site", () => {
  assert.equal(S.scoreBand(85).label, "Reads mostly natural");
  assert.equal(S.scoreBand(70).label, "Some AI patterns");
  assert.equal(S.scoreBand(40).label, "Many AI patterns");
});
