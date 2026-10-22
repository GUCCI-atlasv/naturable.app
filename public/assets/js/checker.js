/* Embeddable checker ([data-checker]). Uses window.Naturable (naturable-rules) — all checks run locally. */
(function () {
  "use strict";

  function init(root) {
    var N = window.Naturable, U = window.NatUI;
    if (!N || !U) return;
    var t = U.t;
    var q = function (name) { return root.querySelector('[data-el="' + name + '"]'); };
    var input = q("input"), view = q("view"), editBox = q("edit"), reviewBox = q("review");
    var btnCheck = q("check"), btnEdit = q("edit-btn"), btnSample = q("sample"), btnClear = q("clear");
    var scoreNum = q("score"), scoreLabel = q("score-label"), meter = q("meter"), countLine = q("count");
    var clean = q("clean"), list = q("findings"), more = q("more"), cats = q("cats");
    var limit = parseInt(root.getAttribute("data-limit") || "4", 10);
    var purpose = root.getAttribute("data-purpose") || "general";
    var only = root.getAttribute("data-only");
    var onlySet = only ? new Set(only.split(",")) : null;
    var sample = input.value;
    var mode = "review";

    function setMode(next) {
      mode = next;
      editBox.hidden = mode !== "edit";
      reviewBox.hidden = mode === "edit";
      btnCheck.hidden = mode !== "edit";
      btnEdit.hidden = mode === "edit";
      if (mode === "edit") input.focus();
      else run();
    }

    function finding(issue) {
      var sev = U.sevClass(issue);
      return U.el("li", { class: "finding" }, [
        U.el("div", { class: "finding-head" }, [
          U.el("span", { class: "sev sev-" + sev, text: U.sevLabel(issue) }),
          U.el("span", { class: "finding-name", text: issue.rule.title }),
        ]),
        U.el("span", { class: "quote", text: issue.text ? "“" + issue.text + "”" : t.wholeDoc }),
        U.el("span", { class: "finding-why", text: issue.rule.reason }),
        U.el("span", { class: "finding-fix" }, [U.el("span", { class: "arrow", "aria-hidden": "true", text: "→ " }), issue.rule.suggestion + " "]),
        U.el("a", { class: "finding-more", href: U.docsFor(issue), text: t.learnMore }),
      ]);
    }

    function run() {
      var text = input.value;
      var res = text.trim() ? N.engine.analyze(text, { purpose: purpose, only: onlySet || undefined }) : null;
      var issues = res ? res.issues : [];
      if (onlySet) issues = issues.filter(function (i) { return onlySet.has(i.rule.id); });
      var total = res ? res.score.total : null;
      var band = U.scoreBand(total);

      U.renderHighlights(view, text, issues, function (issue, idx, s) {
        return U.el("mark", { class: "hit hit-" + U.sevClass(issue), title: issue.rule.title + ": " + issue.rule.reason, text: s });
      });

      scoreNum.textContent = total == null ? "—" : String(total);
      scoreNum.className = "score-num ink-" + band.cls;
      scoreLabel.textContent = band.label;
      scoreLabel.className = "score-label ink-" + band.cls;
      meter.style.width = (total || 0) + "%";
      meter.className = "bg-" + band.cls;

      var strong = issues.filter(function (i) { return i.rule.severity === "strong"; }).length;
      countLine.textContent = res ? t.counts(strong, issues.length - strong) : t.noText;
      clean.hidden = !(res && issues.length === 0);

      list.textContent = "";
      issues.slice(0, limit).forEach(function (i) { list.appendChild(finding(i)); });
      var rest = issues.length - Math.min(limit, issues.length);
      more.hidden = rest <= 0;
      more.textContent = t.more(rest);

      if (cats) {
        cats.textContent = "";
        var byLayer = {};
        issues.forEach(function (i) { var l = i.rule.layer || i.layer; byLayer[l] = (byLayer[l] || 0) + 1; });
        Object.keys(t.layers).forEach(function (l) {
          cats.appendChild(U.el("li", null, [t.layers[l] + " ", U.el("b", { text: String(byLayer[l] || 0) })]));
        });
      }
    }

    btnCheck.addEventListener("click", function () { setMode("review"); });
    btnEdit.addEventListener("click", function () { setMode("edit"); });
    btnSample.addEventListener("click", function () { input.value = sample; setMode("review"); });
    btnClear.addEventListener("click", function () { input.value = ""; run(); setMode("edit"); });
    view.addEventListener("click", function () { if (!window.getSelection().toString()) setMode("edit"); });
    input.addEventListener("paste", function () { setTimeout(function () { setMode("review"); }, 0); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setMode("review"); }
    });
    // "Open the full editor" carries the current draft over (same tab, sessionStorage only).
    root.querySelectorAll("[data-handoff]").forEach(function (a) {
      a.addEventListener("click", function () { try { sessionStorage.setItem("nat-handoff", input.value); } catch (e) { /* ignore */ } });
    });
    root.classList.add("is-live");
    run();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-checker]").forEach(init);
  });
})();
