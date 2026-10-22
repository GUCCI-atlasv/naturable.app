import { esc, icons, breadcrumbs, faqHtml, faqSchema, articleSchema } from "../layout.mjs";
import { checker } from "../components.mjs";
import { TELLS } from "../content/tells.mjs";

const PATH = "/en/signs-of-ai-writing/";

const FAQ = [
  ["How can you tell if something was written by AI?", "You can't tell for certain from the text alone. You can spot patterns that are common in chatbot drafts, like the ones on this page, but people write all of them too. Treat them as editing prompts for your own work, not as evidence about someone else's."],
  ["Are AI detectors reliable?", "Not reliable enough to accuse anyone. They produce false positives, especially on formal writing and on writing by non-native speakers, and their results change with small edits. Naturable doesn't detect AI and doesn't test against detectors."],
  ["Which sign matters most?", "Assistant leftovers and model disclaimers are the strongest: they only make sense in a chat window. Single words matter least. Most of the time it's a cluster of several signs in one paragraph that makes a draft feel machine-made."],
];

export default function signsPage() {
  const crumbs = breadcrumbs("en", [["Guides", "/en/learn/"], ["Signs of AI writing", null]]);
  const description = "15 signs of AI writing readers notice, from assistant leftovers and template openers to em dashes and same-length sentences, with an example and a fix for each. Plus what these signs can't tell you.";
  const tells = TELLS.map((t, i) => ({ ...t, n: String(i + 1).padStart(2, "0") }));

  const toc = tells.map((t) => `<a href="#${t.id}"><span class="num">${t.n}</span>${esc(t.title)}</a>`).join("");
  const cards = tells
    .map(
      (t) => `<section class="tell" id="${t.id}" aria-labelledby="${t.id}-h">
  <div class="head"><span class="n" aria-hidden="true">${t.n}</span><h2 id="${t.id}-h">${esc(t.title)}</h2></div>
  <p><strong>How to spot it:</strong> ${esc(t.spot)}</p>
  <div class="ba-grid">
    <div class="ba ba-before"><span class="lbl">Before</span><span>${esc(t.before)}</span></div>
    <div class="ba ba-after"><span class="lbl">After</span><span>${esc(t.after)}</span></div>
  </div>
  <p class="fix"><strong>Fix:</strong> ${esc(t.fix)}${t.link ? ` <a href="${t.link[0]}">${esc(t.link[1])}</a>` : ""}</p>
  <span class="rule">Checked by ${t.rules.map((r) => `<code>${esc(r)}</code>`).join(", ")}</span>
</section>`,
    )
    .join("\n");

  return {
    lang: "en",
    path: PATH,
    updated: "2026-10-22",
    ogType: "article",
    title: "Signs of AI Writing: 15 Tells and How to Fix Each One",
    description,
    scripts: ["/assets/js/naturable.iife.js", "/assets/js/docs.js", "/assets/js/site.js", "/assets/js/checker.js"],
    schema: [
      crumbs.schema,
      articleSchema({ lang: "en", path: PATH, headline: "Signs of AI Writing: How to Tell If Text Was Written by AI", description, datePublished: "2026-10-22", dateModified: "2026-10-22" }),
      faqSchema(FAQ),
    ],
    body: `<div class="wrap">
  ${crumbs.html}
  <header class="page-head">
    <h1>Signs of AI writing: how to tell if text was written by AI</h1>
    <p class="dek">These are the 15 patterns that make a draft feel machine-written. Each one comes with a way to spot it, a fix, and the Naturable rule that checks for it. At the end: what these signs can't tell you.</p>
    <p class="meta">Updated October 2026 · 9 min read</p>
  </header>

  ${checker({ lang: "en", id: "signs-draft", limit: 3, cats: true, heading: "Check a draft for these signs" })}

  <div class="with-toc">
    <nav class="toc" aria-label="Tells on this page">
      <span class="eyebrow">The tells</span>
      ${toc}
      <a href="#limits" style="margin-top:6px;font-weight:600">What these signs can't tell you</a>
      <a href="#faq">Questions</a>
    </nav>

    <article style="gap:20px">
      <section class="prose" aria-label="Introduction" style="font-size:17px">
        <p>People notice AI-written text before they can say why. Usually it's not one word but a handful of habits stacked together: an opener about "today's digital landscape", a source nobody can check, three adjectives where one fact should be, and a closing line that could end any article. Each habit is easy to fix once you can name it. That's what this guide is for.</p>
        <p>The signs are ordered roughly by how strongly they read as AI. The first few only make sense in a chat window; the last few are style habits that plenty of human writers share.</p>
      </section>
      <div class="tells">
        ${cards}
      </div>

      <section class="limits" id="limits" aria-labelledby="lim-h">
        <div class="head">${icons.info}<h2 id="lim-h">What these signs can't tell you</h2></div>
        <p>None of these patterns proves that an AI wrote something. People wrote all of them first. They also show up more in some kinds of human writing:</p>
        <ul>
          <li>Formal and academic prose, which uses transitions like "moreover" on purpose</li>
          <li>People writing in a second language, who often learn from formal templates</li>
          <li>Corporate and legal documents that follow a house style</li>
          <li>Short texts, where one stock phrase can look like a pattern</li>
        </ul>
        <p>AI detectors have the same problem at a larger scale: they flag careful human writers and miss lightly edited AI drafts. Use these signs to edit your own writing. Don't use them to accuse someone else.</p>
      </section>

      <section id="faq" aria-labelledby="faq-h" class="faq">
        <h2 class="h2" id="faq-h" style="margin-bottom:8px">Questions</h2>
        ${faqHtml(FAQ)}
      </section>

      <section class="related-row" aria-label="Related">
        <a href="/en/ai-words-to-avoid/"><span class="k">Next</span><span class="t">AI words to avoid →</span></a>
        <a href="/en/chatgpt-em-dash/"><span class="k">Tool</span><span class="t">Em dash checker →</span></a>
        <a href="/en/learn/what-is-perplexity-and-burstiness/"><span class="k">Tool</span><span class="t">Burstiness calculator →</span></a>
      </section>
    </article>
  </div>
</div>`,
  };
}
