(async () => {
  "use strict";
  const S = globalThis.NatShared;
  const $ = (id) => document.getElementById(id);
  const text = $("text");
  let settings = await S.getSettings();
  let timer = 0;

  $("version").textContent = S.rulesVersion();
  $("purpose").value = settings.purpose;

  const el = (tag, cls, txt) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  };

  function render() {
    const value = text.value;
    const res = S.analyze(value, settings);
    const list = $("findings");
    list.textContent = "";
    if (!res) {
      const tooLong = value.length > S.MAX_CHARS;
      $("score").textContent = "—";
      $("score").className = "num ink-none";
      $("band").textContent = tooLong ? `Text is over ${S.MAX_CHARS.toLocaleString()} characters` : "Waiting for text";
      $("counts").textContent = tooLong ? "Check it in parts." : "";
      $("clean").hidden = true;
      return;
    }
    const band = S.scoreBand(res.score.total);
    $("score").textContent = String(res.score.total);
    $("score").className = "num ink-" + band.cls;
    $("band").textContent = band.label;
    $("counts").textContent = `${res.score.strong} strong · ${res.score.suggestions} ${res.score.suggestions === 1 ? "suggestion" : "suggestions"}`;
    $("clean").hidden = res.issues.length > 0;

    const ordered = res.issues.slice().sort((a, b) =>
      (a.rule.severity === "strong" ? 0 : 1) - (b.rule.severity === "strong" ? 0 : 1) || (a.start ?? -1) - (b.start ?? -1));
    for (const issue of ordered) {
      const strong = issue.rule.severity === "strong";
      const li = el("li", "finding");
      const head = el("div", "head");
      head.append(el("span", "sev " + (strong ? "strong" : "suggestion"), strong ? "Strong" : "Suggestion"), el("span", "name", issue.rule.title));
      li.appendChild(head);
      if (issue.text && issue.start != null) {
        const q = el("button", "quote", `“${issue.text}”`);
        q.type = "button";
        q.title = "Select in the text";
        q.addEventListener("click", () => { text.focus(); text.setSelectionRange(issue.start, issue.end); });
        li.appendChild(q);
      }
      li.append(el("span", "why", issue.rule.reason), el("span", "fix", "→ " + issue.rule.suggestion));
      const acts = el("div", "acts");
      const more = el("a", null, "Learn more");
      more.href = S.docsFor(issue);
      more.target = "_blank";
      more.rel = "noopener";
      acts.appendChild(more);
      if (issue.text) {
        const ign = el("button", "link", "Ignore");
        ign.type = "button";
        ign.addEventListener("click", () => S.ignoreKey(S.issueKey(issue)));
        acts.appendChild(ign);
      }
      li.appendChild(acts);
      list.appendChild(li);
    }
  }

  async function takePending() {
    const { pending } = await chrome.storage.session.get("pending");
    if (!pending || !pending.text) return;
    await chrome.storage.session.remove("pending");
    text.value = pending.text;
    render();
  }

  text.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(render, 250); });
  $("purpose").addEventListener("change", (e) => chrome.storage.local.set({ purpose: e.target.value }));
  chrome.storage.onChanged.addListener(async (changes, area) => {
    if (area === "session" && changes.pending && changes.pending.newValue) return takePending();
    if (area === "local" && ("purpose" in changes || "ignoredKeys" in changes)) {
      settings = await S.getSettings();
      $("purpose").value = settings.purpose;
      render();
    }
  });

  await takePending();
  render();
})();
