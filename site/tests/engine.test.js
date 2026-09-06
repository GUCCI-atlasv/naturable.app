const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");

const elements = new Map();
const document = {
  addEventListener() {},
  getElementById(id) { return elements.get(id) || null; },
  querySelector() { return null; },
};
const window = {};
const context = vm.createContext({ window, document, navigator: {}, console, Set, URLSearchParams });
vm.runInContext(fs.readFileSync(new URL("../assets/engine.js", `file://${__filename}`).pathname, "utf8"), context);

const { normalizeAfterFix, burstiness, scan, detectLanguage, diff, score, markdownToHtml, safeName, feedbackPayload } = window.naturable._test;

assert.equal(
  normalizeAfterFix("  to use the tool 🚀.!  ".replace("🚀", "")),
  "To use the tool."
);
assert.equal(normalizeAfterFix("hello.  this works!"), "Hello. This works!");
assert.equal(burstiness("One sentence only.").n, 1);
assert.equal(scan("Great question! Experts believe this is a robust landscape.").length, 3);
assert.equal(scan("值得注意的是，有研究表明技术正在赋能行业。", "zh").length, 3);
assert.equal(detectLanguage("这是一段中文内容。"), "zh");
assert.equal(detectLanguage("This is English text."), "en");
assert.equal(detectLanguage("这是 mixed English 内容。"), "mixed");
const change = diff("Use the old tool.", "Use a better tool.");
assert.ok(change.added > 0 && change.removed > 0);
assert.ok(score("One sentence.", [], "en").dimensions.rhythm === null);
const noisyText = "Great question! Experts believe this robust landscape is a pivotal shift. The possibilities are endless. I hope this helps!";
const noisy = scan(noisyText);
const noisyScore = score(noisyText, noisy, "en");
assert.ok(noisy.filter(x => x.rule.severity === "strong").length >= 5);
assert.ok(noisyScore.total <= 64, "five strong issues must cap the naturalness score");
assert.ok(score("A clear, specific sentence.", [], "en").total > noisyScore.total);
assert.equal(safeName("My draft.markdown"), "My-draft");
const exportedHtml = markdownToHtml("# Title\n\n**Clear** text\n\n- One\n- Two\n\n<script>alert(1)</script>");
assert.match(exportedHtml, /<h1>Title<\/h1>/);
assert.match(exportedHtml, /<strong>Clear<\/strong>/);
assert.match(exportedHtml, /<ul>/);
assert.doesNotMatch(exportedHtml, /<script>/);
const feedbackIssue = scan("Experts believe this robust claim.")[0];
const feedback = feedbackPayload(feedbackIssue, "false_positive");
assert.deepEqual(Object.keys(feedback), ["event","rule_id","feedback","language","purpose","severity","confidence","engine_version"]);
assert.equal(feedback.engine_version, "2.1.0");
assert.ok(!JSON.stringify(feedback).includes(feedbackIssue.text));
assert.equal(window.NATURABLE_RULES.length, 17);

console.log("engine tests passed");
