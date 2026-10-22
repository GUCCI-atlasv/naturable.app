// Rewritten long-form pages: humanizers (P0-3), em dash (P1-1), burstiness (P1-2).
import { esc, breadcrumbs, faqHtml, faqSchema, articleSchema } from "../layout.mjs";
import { emDashTool, burstinessTool } from "../components.mjs";
import { TEST_RESULTS, TEST_SOURCE } from "../content/humanizer-tests.mjs";
import { chromeHref } from "../site.mjs";

const TOOL_SCRIPTS = (tool) => ["/assets/js/naturable.iife.js", "/assets/js/site.js", `/assets/js/${tool}.js`];

function sideCta() {
  return `<aside aria-label="Tools">
  <div class="side-cta">
    <h2>Check your own draft</h2>
    <p>See every pattern in your text, with a reason and a fix you choose. Runs in your browser.</p>
    <a class="btn btn-light" href="/en/app/">Open the editor</a>
  </div>
  <div class="side-links">
    <a href="/en/signs-of-ai-writing/"><span class="k">Guide</span><span class="t">Signs of AI writing</span></a>
    <a href="/en/ai-words-to-avoid/"><span class="k">Word list</span><span class="t">AI words to avoid</span></a>
    <a href="${esc(chromeHref())}"><span class="k">Extension</span><span class="t">Check as you type in Chrome</span></a>
  </div>
</aside>`;
}

/* ---------------- P0-3: Do AI humanizers work? ---------------- */
export function humanizers() {
  const PATH = "/en/learn/do-ai-humanizers-work/";
  const crumbs = breadcrumbs("en", [["Learn", "/en/learn/"], ["Do AI humanizers work?", null]]);
  const description = "Do AI humanizers work? They change surface features, but often bend the meaning, add errors and give unstable detector results. How they work, the risks, and a better editing workflow.";
  const FAQ = [
    ["Do AI humanizers work?", "They work at changing surface features: word choice, sentence order, punctuation. They don't reliably make writing better, and they often change the meaning or introduce errors. Any effect on AI detectors is inconsistent and can change with the next detector update."],
    ["How do AI humanizers work?", "Most combine three techniques: swapping words for synonyms, reshuffling sentence structure, and adding noise such as odd word choices, typos or filler. Some run a second language model with instructions to sound casual."],
    ["Are AI humanizers safe for school or work?", "Using one doesn't change who wrote the ideas. If your school or employer requires disclosure of AI use, a humanizer doesn't remove that obligation, and a rewrite that introduces errors can do more damage than the original draft."],
    ["What's a better alternative?", "Edit the draft yourself with a checker that explains each problem: find the template openers, vague sources and filler, fix the ones you agree with, then reread for facts. You keep control of meaning and tone."],
  ];
  const hasTests = TEST_RESULTS.length > 0;
  const testTable = hasTests
    ? `<h2 id="test">What we found when we tested ${TEST_RESULTS.length} humanizers</h2>
<p>We ran the same paragraph through each tool on the dates shown and compared the output with the source for readability, meaning and factual errors. We didn't measure detector scores.</p>
${TEST_SOURCE ? `<div class="callout"><p><strong>Source paragraph</strong></p><p>${esc(TEST_SOURCE)}</p></div>` : ""}
<table><thead><tr><th>Tool</th><th>Tested</th><th>Readability</th><th>Meaning</th><th>Fact errors</th><th>Notes</th></tr></thead><tbody>${TEST_RESULTS.map(
        (r) => `<tr><td>${esc(r.tool)}</td><td>${esc(r.tested)}</td><td>${esc(r.readability)}</td><td>${esc(r.meaning)}</td><td>${esc(r.factErrors)}</td><td>${esc(r.notes)}</td></tr>`,
      ).join("")}</tbody></table>`
    : "";

  return {
    lang: "en",
    path: PATH,
    alternate: "/zh-cn/learn/do-ai-humanizers-work/",
    updated: "2026-10-22",
    ogType: "article",
    // PRD title says "Test"; it only claims that once real results are in humanizer-tests.mjs.
    title: hasTests ? "Do AI Humanizers Work? An Honest Test (2026)" : "Do AI Humanizers Work? An Honest Look (2026)",
    description,
    scripts: ["/assets/js/site.js"],
    schema: [
      crumbs.schema,
      articleSchema({ lang: "en", path: PATH, headline: hasTests ? "Do AI Humanizers Work? An Honest Test (2026)" : "Do AI Humanizers Work? An Honest Look (2026)", description, datePublished: "2026-07-12", dateModified: "2026-10-22" }),
      faqSchema(FAQ),
    ],
    body: `<div class="wrap">
  ${crumbs.html}
  <header class="page-head">
    <h1>Do AI humanizers work? An honest look</h1>
    <p class="dek">Short answer: they change how a draft looks, not how good it is. They often bend the meaning, add errors, and give detector results that don't hold. Here's how they work, what goes wrong, and a workflow that leaves you in control.</p>
    <p class="meta">Updated October 2026 · 8 min read</p>
  </header>
  <div class="prose-layout">
    <div class="prose">
      <div class="callout">
        <p><strong>The verdict.</strong> An AI humanizer can remove some repeated phrases and vary sentence length. It can't make a weak draft clear, it can't check facts, and it often swaps a precise word for a wrong one. If the goal is writing that sounds like you, editing beats rewriting.</p>
      </div>

      <h2 id="how">How AI humanizers work</h2>
      <p>"Humanizer" is a marketing label, not a technique. Under the hood, most tools combine three moves. The examples below are our own illustrations of each technique, not output from a specific product.</p>
      <h3>1. Synonym swapping</h3>
      <p>Words are replaced with near-synonyms, often from a thesaurus list. This changes the vocabulary a reader (or a model) sees, but synonyms are rarely exact.</p>
      <table><thead><tr><th>Source</th><th>After synonym swap</th></tr></thead><tbody>
        <tr><td>The trial reduced hospital stays by two days.</td><td>The <mark>experiment</mark> <mark>diminished</mark> <mark>infirmary</mark> stays by two days.</td></tr>
      </tbody></table>
      <p>"Trial" in medicine has a specific meaning. "Experiment" doesn't, and "infirmary" is a different kind of place.</p>
      <h3>2. Sentence reshuffling</h3>
      <p>Clauses are reordered, active becomes passive, sentences are split or merged. This changes rhythm, the thing <a href="/en/learn/what-is-perplexity-and-burstiness/">burstiness</a> measures, but it can also move the emphasis to the wrong place.</p>
      <table><thead><tr><th>Source</th><th>After reshuffling</th></tr></thead><tbody>
        <tr><td>We cut the price because sales fell.</td><td>Sales fell. <mark>The price was cut by us, which</mark> happened because of that.</td></tr>
      </tbody></table>
      <h3>3. Adding noise</h3>
      <p>Some tools insert filler, casual asides, unusual words or deliberate small errors so the text is less predictable. Predictability (perplexity) is one signal some detectors look at, so noise can move a score. It also makes the writing worse on purpose.</p>
      <table><thead><tr><th>Source</th><th>After adding noise</th></tr></thead><tbody>
        <tr><td>Submit the form by Friday.</td><td><mark>Honestly,</mark> submit the form by Friday<mark>, more or less</mark>.</td></tr>
      </tbody></table>
      <p>"More or less" turns a deadline into a suggestion. That's a real cost in an email to a client.</p>

      ${testTable}

      <h2 id="risks">The risks</h2>
      <h3>Meaning drift and fact errors</h3>
      <p>Whole-document rewriting can change numbers, swap technical terms for vague ones, and drop qualifiers that mattered. The output reads smoothly, which makes the errors harder to spot. Every rewritten paragraph needs to be checked against the original, which often takes longer than editing the original would have.</p>
      <h3>Academic integrity</h3>
      <p>A humanizer doesn't change who did the thinking. If your course or journal requires you to disclose AI use, running a draft through a rewriter doesn't remove that requirement, and getting caught hiding it is usually treated more seriously than the AI use itself.</p>
      <h3>Brand voice</h3>
      <p>Humanizers have a voice of their own: casual fillers, odd synonyms, the same "conversational" tics across every customer. For a company with a style guide, that's a step backwards from a clean first draft.</p>
      <h3>Detector results that don't hold</h3>
      <p>Detectors disagree with each other and change over time. A tool that moves one score today can stop working with the next update, and detectors also flag careful human writing. We don't test against detectors and don't recommend choosing a tool based on detector scores.</p>

      <h2 id="test-it">How to test a humanizer yourself</h2>
      <p>If you're evaluating one, judge it as an editor would, not by a detector score.</p>
      <ol>
        <li>Pick a paragraph you know well that contains numbers, a name and one technical term.</li>
        <li>Run it through the tool once, with default settings.</li>
        <li>Check every number, name and term against the source.</li>
        <li>Read both versions aloud. Which one would you send?</li>
        <li>Note what changed in meaning, even slightly. "Reduced" and "lowered" are close; "trial" and "experiment" aren't.</li>
      </ol>

      <h2 id="workflow">A better workflow: find, fix, recheck</h2>
      <p>The problems humanizers claim to solve are ordinary editing problems: stock openers, vague sources, filler, AI vocabulary, sentences that all have the same shape. You can fix those directly and keep control of meaning.</p>
      <ol>
        <li><strong>Find.</strong> Paste the draft into a checker that explains each flag. <a href="/en/app/">Naturable's editor</a> marks the patterns and says why each one reads as AI.</li>
        <li><strong>Fix what you agree with.</strong> Apply the safe one-click fixes (filler like "in order to"), rewrite the rest yourself, and ignore flags that don't fit your context.</li>
        <li><strong>Recheck.</strong> Compare against your first version, check names and numbers, and read it once more as your reader would.</li>
      </ol>
      <p>For the full list of patterns, see <a href="/en/signs-of-ai-writing/">Signs of AI writing</a> and <a href="/en/ai-words-to-avoid/">AI words to avoid</a>.</p>

      <h2 id="faq">Questions</h2>
      <div class="faq">${faqHtml(FAQ)}</div>
    </div>
    ${sideCta()}
  </div>
</div>`,
  };
}

/* ---------------- P1-1: ChatGPT em dash ---------------- */
export function emDash() {
  const PATH = "/en/chatgpt-em-dash/";
  const crumbs = breadcrumbs("en", [["Tools", null], ["Em dash checker", null]]);
  const description = "Why does ChatGPT use so many em dashes? The likely reasons, when a dash is worth keeping, and a free em dash remover that counts dashes per 1,000 words and lets you replace each one.";
  const FAQ = [
    ["Why does ChatGPT use so many em dashes?", "Nobody outside the AI labs knows for sure. Likely reasons: edited books and articles in the training data use them heavily, and human raters may have preferred replies that read as polished. Both are plausible; neither is proven."],
    ["Does using em dashes mean a text was written by AI?", "No. Writers have used em dashes for centuries, and many careful human writers use them a lot. A high count is a reason to reread, not evidence of who wrote the text."],
    ["How many em dashes is too many?", "There's no fixed number. Naturable flags a draft when it has at least 3 em dashes and 8 or more per 1,000 words. That's our starting threshold, not a rule of grammar."],
    ["What can I use instead of an em dash?", "A comma for a light pause, a period for a hard break, a colon before an explanation or list, or parentheses for an aside."],
  ];
  return {
    lang: "en",
    path: PATH,
    updated: "2026-10-22",
    ogType: "article",
    title: "Why Does ChatGPT Use So Many Em Dashes? (+ Free Em Dash Remover)",
    description,
    scripts: TOOL_SCRIPTS("emdash"),
    schema: [
      crumbs.schema,
      articleSchema({ lang: "en", path: PATH, headline: "Why Does ChatGPT Use So Many Em Dashes?", description, datePublished: "2026-10-22", dateModified: "2026-10-22" }),
      faqSchema(FAQ),
      { "@context": "https://schema.org", "@type": "WebApplication", name: "Em dash checker", url: "https://naturable.app" + PATH, applicationCategory: "UtilitiesApplication", operatingSystem: "Web browser", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
    ],
    body: `<div class="wrap" style="padding-bottom:64px">
  ${crumbs.html}
  <header class="page-head">
    <h1>Why does ChatGPT use so many em dashes? Check and fix yours.</h1>
    <p class="dek">Paste a draft to count its em dashes, see how dense they are, and choose a replacement for each one. Nothing is uploaded.</p>
  </header>
  ${emDashTool()}
  <article class="prose prose-article">
    <h2>Why chatbots love the em dash</h2>
    <p>Nobody outside the AI labs knows for sure. The usual explanations are that edited books and articles in the training data use dashes heavily, and that human raters tended to prefer replies that read as polished. Both are plausible, and neither is proven. What's easy to see is the result: dashes in most sentences, often in pairs, doing the job a comma would do.</p>
    <h2>When to keep a dash</h2>
    <p>A dash works when you want a sharp break, like an aside that interrupts a sentence or a punchline at the end. The problem is a dash in every sentence, because then none of them stand out. Keep the one or two that earn it and turn the rest into commas or periods.</p>
    <h2>What to use instead</h2>
    <ul>
      <li><strong>Comma</strong> for a light pause or an aside that belongs in the sentence.</li>
      <li><strong>Period</strong> when the dash is joining two complete thoughts.</li>
      <li><strong>Colon</strong> before an explanation, an example or a list.</li>
      <li><strong>Parentheses</strong> for an aside the reader could skip.</li>
    </ul>
    <h2>Em dash, en dash, hyphen</h2>
    <p>The em dash (—) is the long one. The en dash (–) joins ranges, like 2020–2026. The hyphen (-) joins words, like <em>well-known</em>. Many chatbots type the em dash directly; people often type two hyphens (--), which this checker also counts.</p>
    <h2>Questions</h2>
    <div class="faq">${faqHtml(FAQ)}</div>
    <p style="font-size:15px;color:var(--muted)">Related: <a href="/en/signs-of-ai-writing/#em-dashes">Signs of AI writing</a> · <a href="/en/ai-words-to-avoid/">AI words to avoid</a> · <a href="/en/learn/what-is-perplexity-and-burstiness/">Burstiness calculator</a></p>
  </article>
</div>`,
  };
}

/* ---------------- P1-2: Perplexity & burstiness ---------------- */
export function burstiness() {
  const PATH = "/en/learn/what-is-perplexity-and-burstiness/";
  const crumbs = breadcrumbs("en", [["Tools", null], ["Burstiness calculator", null]]);
  const description = "What burstiness and perplexity mean in writing, why AI detectors use them, and their limits. Free burstiness calculator: sentence-length chart, standard deviation and same-length runs.";
  const FAQ = [
    ["What does burstiness mean in writing?", "How much sentence length and shape vary across a text. Writing that mixes short and long sentences has high burstiness; writing where every sentence is about the same length has low burstiness."],
    ["What is perplexity?", "A measure of how predictable a text is to a language model. Common phrases and familiar word sequences have low perplexity. It needs a language model to compute, so this page doesn't calculate it."],
    ["Do perplexity and burstiness prove a text was written by AI?", "No. A careful human writer can produce predictable, even prose, and an edited AI draft can vary a lot. Topic, genre and language level all move both numbers."],
    ["How is the burstiness score calculated here?", "We split the text into sentences, count the words in each, and divide the standard deviation of those lengths by the average (the coefficient of variation). The rhythm score is the same one the Naturable editor uses."],
  ];
  return {
    lang: "en",
    path: PATH,
    alternate: "/zh-cn/learn/what-is-perplexity-and-burstiness/",
    updated: "2026-10-22",
    ogType: "article",
    title: "Burstiness & Perplexity in Writing: Meaning + Free Burstiness Calculator",
    description,
    scripts: TOOL_SCRIPTS("burstiness"),
    schema: [
      crumbs.schema,
      articleSchema({ lang: "en", path: PATH, headline: "Perplexity and burstiness in writing: what the metrics really mean", description, datePublished: "2026-07-12", dateModified: "2026-10-22" }),
      faqSchema(FAQ),
      { "@context": "https://schema.org", "@type": "WebApplication", name: "Burstiness calculator", url: "https://naturable.app" + PATH, applicationCategory: "UtilitiesApplication", operatingSystem: "Web browser", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
    ],
    body: `<div class="wrap" style="padding-bottom:64px">
  ${crumbs.html}
  <header class="page-head">
    <h1>Burstiness calculator: see the rhythm of your sentences</h1>
    <p class="dek">Burstiness measures how much your sentence lengths vary. Paste a draft to see every sentence as a bar and spot runs that all have the same length.</p>
  </header>
  ${burstinessTool()}
  <article class="prose prose-article">
    <h2 id="burstiness">What burstiness means</h2>
    <p>Here, burstiness is the standard deviation of sentence length divided by the average. People tend to mix short and long sentences. Drafts that come straight from a model often keep every sentence at about the same length. As a rough guide, below 0.3 reads flat, 0.3 to 0.5 has some variation, and above 0.5 reads varied. Those cut-offs are ours, chosen for editing, not taken from any detector.</p>
    <h2 id="perplexity">What perplexity means</h2>
    <p>Perplexity describes how predictable a sequence of words is to a language model. Familiar phrases and common word combinations are easier to predict and score lower. Computing it needs a language model, which would mean sending your text somewhere or downloading a large model, so this page measures rhythm only.</p>
    <h2 id="detectors">Why detectors use them, and why that fails</h2>
    <p>Some AI detectors combine the two: low perplexity (predictable wording) plus low burstiness (even rhythm) is treated as a sign of machine text. Both signals are weak on their own. A careful human writer can produce predictable, even prose. An edited AI draft can vary a lot. Topic, genre, translation, quotations, technical terms and the writer's language level all move both numbers. That's why neither can prove who wrote a text, and why a rhythm score should guide editing, not judge authorship.</p>
    <h2 id="rhythm">How to vary rhythm without forcing it</h2>
    <p>Look for a highlighted run. Merge two short sentences that share a subject, or break up a long one where the idea turns. Put a hard point in its own short sentence. Don't insert rare words or random fragments to move a number; read the paragraph aloud instead. Rhythm should follow meaning.</p>
    <h2>A better review question</h2>
    <p>Instead of asking whether the score looks human, ask whether the reader can follow the argument, check the evidence, and hear the writer's judgment.</p>
    <h2>Questions</h2>
    <div class="faq">${faqHtml(FAQ)}</div>
    <p style="font-size:15px;color:var(--muted)">Related: <a href="/en/signs-of-ai-writing/#same-shape-sentences">Signs of AI writing</a> · <a href="/en/chatgpt-em-dash/">Em dash checker</a> · <a href="/en/app/">Full editor</a></p>
  </article>
</div>`,
  };
}
