import { esc, breadcrumbs, faqHtml, faqSchema, articleSchema } from "../layout.mjs";
import { checker } from "../components.mjs";
import { WORD_GROUPS, PHRASE_GROUPS } from "../content/ai-words.mjs";
import { slug } from "../docs.mjs";
import { chromeHref, chromeLabel, githubHref, SITE } from "../site.mjs";
import { packs } from "../../vendor/naturable-rules/src/index.js";

const PATH = "/en/ai-words-to-avoid/";

// The 25 rows in the summary table, in order. All are entries below.
const TOP = ["delve", "tapestry", "leverage", "robust", "seamless", "pivotal", "landscape", "realm", "foster", "myriad", "plethora", "showcase", "harness", "elevate", "embark", "nestled", "boasts", "testament", "journey", "game-changer", "underscore the importance", "crucial", "comprehensive", "vibrant", "Furthermore"];

const FAQ = [
  ["Why does ChatGPT use \"delve\" so much?", "Nobody outside the labs knows for sure. Common explanations point to the training data and to feedback from human raters during fine-tuning. Newer models use it less, but similar favorites take its place."],
  ["Is it wrong to use these words?", "No. Every word here has a legitimate use: \"robust\" in statistics, \"landscape\" in a photo caption, \"furthermore\" in a legal brief. The list is a prompt to look again, not a ban."],
  ["If I remove these words, will my text pass an AI detector?", "We don't make that claim, and this list isn't built for it. It's for making writing clearer and more like your own."],
  ["What's the difference between \"Checked by Naturable\" and \"Watch list\"?", `Checked words are matched by the open rules (pack ${packs.en.version}), so the checker, the editor and the Chrome extension flag them. Watch-list words are common in chatbot drafts but not in the rules yet, usually because they have too many legitimate uses to flag automatically.`],
  ["Can I suggest a word?", "Yes. Open an issue or pull request on the rules repository with a real before/after example and a note on where the word is legitimate."],
];

export default function wordsPage({ annotated }) {
  // annotated: { [word]: { checked: bool, ruleId } } — computed by the build with the rules engine.
  const all = WORD_GROUPS.flatMap((g) => g.entries.map((e) => ({ group: g, e })));
  const byWord = Object.fromEntries(all.map((x) => [x.e[0], x]));
  const missing = TOP.filter((w) => !byWord[w]);
  if (missing.length) throw new Error("TOP words missing entries: " + missing.join(", "));
  const nWords = all.length;
  const nPhrases = PHRASE_GROUPS.reduce((n, g) => n + g.entries.length, 0);
  const nChecked = Object.values(annotated).filter((a) => a.checked).length;

  const status = (word) => {
    const a = annotated[word];
    return a && a.checked
      ? `<span class="status-tag status-checked">Checked by Naturable</span>`
      : `<span class="status-tag status-watch">Watch list</span>`;
  };

  const table = TOP.map((w) => {
    const [word, , why, instead] = byWord[w].e;
    const a = annotated[word];
    return `<tr><th scope="row"><a class="word-link${a && a.checked ? "" : " watch"}" href="#${slug(word)}">${esc(word)}</a></th><td>${esc(why.split(". ")[0].replace(/\.$/, ""))}.</td><td>${esc(instead)}</td></tr>`;
  }).join("");

  const entry = ([word, pos, why, instead, before, after]) => {
    const a = annotated[word];
    return `<section class="word-entry" id="${slug(word)}" aria-labelledby="${slug(word)}-h">
  <div class="head">
    <h4 id="${slug(word)}-h">${esc(word)}</h4>
    <span class="info">${esc(pos)}${a && a.checked ? ` · rule <code>${esc(a.ruleId)}</code>` : ""}</span>
    ${status(word)}
    <button type="button" class="copy" data-copy-link="#${slug(word)}">Copy link</button>
  </div>
  <p>${esc(why)}</p>
  <div class="ba-grid">
    <div class="ba ba-before"><span class="lbl">Before</span><span>${esc(before)}</span></div>
    <div class="ba ba-after"><span class="lbl">After</span><span>${esc(after)}</span></div>
  </div>
  <p class="instead"><strong>Try instead:</strong> ${esc(instead)}</p>
</section>`;
  };

  const groups = WORD_GROUPS.map(
    (g) => `<section class="word-cat" id="${g.id}" aria-labelledby="${g.id}-h">
  <h3 id="${g.id}-h">${esc(g.title)}</h3>
  <p class="lead-p">${esc(g.intro)}</p>
  ${g.entries.map(entry).join("\n")}
</section>`,
  ).join("\n");

  const phraseCards = PHRASE_GROUPS.map(
    (g) => `<div class="phrase-group" id="${g.id}">
  <h3>${esc(g.title)}</h3>
  <ul>${g.entries.map(([p, instead]) => `<li id="${slug(p)}"><span class="p">${esc(p)}</span><span class="i"><span class="arrow" aria-hidden="true">→ </span>${esc(instead)}</span></li>`).join("")}</ul>
</div>`,
  ).join("\n");

  const phraseExamples = PHRASE_GROUPS.map(
    (g) => `<h3 class="serif" style="margin:8px 0 0;font-size:22px">${esc(g.title)}</h3>
<p class="lead-p">${esc(g.intro)}</p>
<div class="table-wrap"><table class="word-table"><thead><tr><th scope="col">Phrase</th><th scope="col">Before</th><th scope="col">After</th></tr></thead><tbody>${g.entries
      .map(([p, , before, after]) => `<tr><th scope="row"><span class="word-link${annotated[p] && annotated[p].checked ? "" : " watch"}">${esc(p)}</span></th><td>${esc(before)}</td><td>${esc(after)}</td></tr>`)
      .join("")}</tbody></table></div>`,
  ).join("\n");

  const azLinks = all
    .map((x) => x.e[0])
    .sort((a, b) => a.localeCompare(b))
    .map((w) => `<a href="#${slug(w)}">${esc(w)}</a>`)
    .join("");

  const crumbs = breadcrumbs("en", [["Guides", "/en/learn/"], ["AI words to avoid", null]]);
  const description = `${nWords + nPhrases} words and phrases ChatGPT overuses — delve, tapestry, leverage, "in today's fast-paced world" — with why each sounds like AI and what to write instead. Free checker included.`;

  return {
    lang: "en",
    path: PATH,
    updated: "2026-10-22",
    ogType: "article",
    title: "AI Words to Avoid: 100+ Overused ChatGPT Words & Better Alternatives",
    description,
    scripts: ["/assets/js/naturable.iife.js", "/assets/js/docs.js", "/assets/js/site.js", "/assets/js/checker.js"],
    schema: [
      crumbs.schema,
      articleSchema({ lang: "en", path: PATH, headline: "AI Words to Avoid (and What to Write Instead)", description, datePublished: "2026-10-22", dateModified: "2026-10-22" }),
      faqSchema(FAQ),
      {
        "@context": "https://schema.org",
        "@type": "Dataset",
        name: "Naturable AI words to avoid",
        description: "Words and phrases that are over-represented in chatbot writing, with reasons, alternatives and before/after examples.",
        license: "https://creativecommons.org/licenses/by/4.0/",
        creator: { "@type": "Organization", name: "Naturable", url: SITE.origin + "/" },
        distribution: [
          { "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: SITE.origin + "/downloads/ai-words-to-avoid.csv" },
          { "@type": "DataDownload", encodingFormat: "application/json", contentUrl: SITE.origin + "/downloads/ai-words-to-avoid.json" },
        ],
      },
    ],
    body: `<div class="wrap">
  ${crumbs.html}
  <header class="page-head">
    <h1>AI words to avoid, and what to write instead</h1>
    <p class="dek">Chatbots lean on the same few dozen words and phrases. Any one of them is fine on its own. When they cluster, readers notice. Here's the list Naturable checks for, with a plainer option for each.</p>
    <p class="meta">Updated October 2026 · ${nWords} words and ${nPhrases} phrases · ${nChecked} checked by the open Naturable rules (${packs.en.version}) · <a href="/downloads/ai-words-to-avoid.csv">Download as CSV</a> / <a href="/downloads/ai-words-to-avoid.json">JSON</a></p>
  </header>

  ${checker({ lang: "en", id: "words-draft", limit: 3, heading: "Check a draft for AI words" })}

  <div class="with-toc">
    <nav class="toc" aria-label="On this page">
      <span class="eyebrow">On this page</span>
      <a href="#tldr">The short version</a>
      <a href="#top-words">The 25 most common AI words</a>
      <a href="#phrases">Phrases: openers, closers, filler</a>
      ${WORD_GROUPS.map((g) => `<a href="#${g.id}">${esc(g.title.split(" ")[0])}: full list</a>`).join("")}
      <a href="#phrase-examples">Phrase examples</a>
      <a href="#cluster">One word isn't the problem</a>
      <a href="#a-z">A–Z index</a>
      <a href="#faq">Questions</a>
      <a href="#download">Download the list</a>
    </nav>

    <article>
      <section id="tldr" aria-labelledby="tldr-h" style="display:flex;flex-direction:column;gap:14px">
        <h2 class="h2" id="tldr-h">The short version</h2>
        <p class="lead-p">The words below show up far more often in chatbot drafts than in everyday human writing. They tend to share three habits: they inflate (<em>pivotal</em>, <em>groundbreaking</em>), they abstract (<em>landscape</em>, <em>realm</em>, <em>tapestry</em>), or they promise an action without naming it (<em>leverage</em>, <em>foster</em>, <em>delve</em>). The fix is almost always the same: replace the word with the specific thing it stands for.</p>
        <p class="lead-p">Each entry has its own link (try <a href="#delve">#delve</a> or <a href="#tapestry">#tapestry</a>), so you can share one word with a colleague or cite it in a style guide. Entries marked <span class="status-tag status-checked">Checked by Naturable</span> are flagged by the checker above, the full editor and the Chrome extension. <span class="status-tag status-watch">Watch list</span> entries aren't in the rules yet.</p>
      </section>

      <section id="top-words" aria-labelledby="top-h" style="display:flex;flex-direction:column;gap:16px">
        <h2 class="h2" id="top-h">The 25 most common AI words</h2>
        <p class="lead-p">These words show up again and again in chatbot drafts. Each row links to its own section with an example.</p>
        <div class="table-wrap">
          <table class="word-table">
            <thead><tr><th scope="col">Word</th><th scope="col">Why it reads as AI</th><th scope="col">Write instead</th></tr></thead>
            <tbody>${table}</tbody>
          </table>
        </div>
      </section>

      <section id="phrases" aria-labelledby="ph-h" style="display:flex;flex-direction:column;gap:16px">
        <h2 class="h2" id="ph-h">Phrases: openers, closers, filler</h2>
        <p class="lead-p">Phrases give AI drafts away faster than single words do, because they sit where readers look first: the start and the end.</p>
        <div class="phrase-groups">${phraseCards}</div>
      </section>

      <section aria-labelledby="full-h" style="display:flex;flex-direction:column;gap:28px">
        <h2 class="h2" id="full-h">The full list, by type</h2>
        ${groups}
      </section>

      <section id="phrase-examples" aria-labelledby="pe-h" style="display:flex;flex-direction:column;gap:14px">
        <h2 class="h2" id="pe-h">Phrase examples, before and after</h2>
        ${phraseExamples}
      </section>

      <section id="cluster" aria-labelledby="cl-h" style="display:flex;flex-direction:column;gap:12px">
        <h2 class="h2" id="cl-h">One word isn't the problem</h2>
        <p class="lead-p">"Robust" is the right word for a statistician. "Landscape" is fine in a photo caption. Naturable flags these words so you can look, not so you have to cut them. The signal is a cluster: three or four of them in a paragraph, usually next to a template opener and a vague source.</p>
        <p class="lead-p">That's also why swapping words one for one doesn't fix a draft. "We leverage a robust, seamless platform" becomes "We use a strong, smooth platform", which is just as empty. The real fix is to say the fact the adjective was covering for: what the platform runs on, what it survived, how many steps it saves.</p>
        <p class="lead-p">Avoid using this list to judge someone else's writing. People used these words long before chatbots did, and people who learned English from formal textbooks use some of them more often. For the wider set of patterns, and their limits, see <a href="/en/signs-of-ai-writing/">Signs of AI writing</a>.</p>
      </section>

      <section id="a-z" aria-labelledby="az-h" style="display:flex;flex-direction:column;gap:12px">
        <h2 class="h2" id="az-h">A–Z index</h2>
        <nav class="az-nav" aria-label="All words, A to Z">${azLinks}</nav>
      </section>

      <section id="download" class="dark-cta" aria-labelledby="dl-h">
        <div class="text">
          <h2 id="dl-h">Use this list anywhere</h2>
          <p>The full list is open data (CC BY 4.0). Download it, put it in your style guide, or check drafts as you type. Please credit "Naturable (naturable.app)" with a link.</p>
        </div>
        <div class="actions">
          <a class="btn btn-light" href="/downloads/ai-words-to-avoid.csv" download>Download CSV</a>
          <a class="btn btn-on-dark" href="/downloads/ai-words-to-avoid.json" download>JSON</a>
          <a class="btn btn-on-dark" href="${esc(githubHref())}">${SITE.githubUrl ? "Rules on GitHub" : "Browse the rules"}</a>
          <a class="btn btn-on-dark" href="${esc(chromeHref())}">${esc(chromeLabel())}</a>
        </div>
      </section>

      <section id="faq" aria-labelledby="faq-h" class="faq">
        <h2 class="h2" id="faq-h" style="margin-bottom:8px">Questions</h2>
        ${faqHtml(FAQ)}
      </section>

      <section class="related-row" aria-label="Related">
        <a href="/en/signs-of-ai-writing/"><span class="k">Guide</span><span class="t">Signs of AI writing →</span></a>
        <a href="/en/chatgpt-em-dash/"><span class="k">Tool</span><span class="t">Em dash checker →</span></a>
        <a href="/en/app/"><span class="k">Tool</span><span class="t">Open the full editor →</span></a>
      </section>
    </article>
  </div>
</div>`,
  };
}
