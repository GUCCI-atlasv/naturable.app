/* Full editor ([data-editor]). Everything stays in this browser: drafts go to localStorage only. */
(function () {
  "use strict";

  function init(root) {
    var N = window.Naturable, U = window.NatUI;
    if (!N || !U) return;
    var t = U.t, el = U.el;
    var q = function (name) { return root.querySelector('[data-el="' + name + '"]'); };
    var KEY = "nat-editor-v2-" + U.lang;
    var sample = q("sample").textContent;

    var saved = U.store(KEY) || {};
    var handoff = null;
    try { handoff = sessionStorage.getItem("nat-handoff"); sessionStorage.removeItem("nat-handoff"); } catch (e) { handoff = null; }
    var start = handoff != null && handoff.trim() ? handoff : saved.text != null ? saved.text : sample;

    var st = {
      text: start,
      baseline: handoff != null && handoff.trim() ? handoff : saved.baseline != null ? saved.baseline : start,
      mode: start.trim() ? "review" : "edit",
      purpose: saved.purpose || root.getAttribute("data-purpose") || "blog",
      filter: "all",
      ignoredKeys: saved.ignoredKeys || [],
      ignoredRules: saved.ignoredRules || [],
      history: [],
      sel: 0,
    };
    var issues = [];

    var els = {
      meta: q("meta"), purpose: q("purpose"), undo: q("undo"), copy: q("copy"), importBtn: q("import"), file: q("file"),
      exportBtn: q("export"), exportMenu: q("export-menu"), clear: q("clear"), fixAll: q("fix-all"), mode: q("mode"),
      editBox: q("edit"), input: q("input"), view: q("view"), diff: q("diff"), diffLine: q("diff-line"), diffBody: q("diff-body"),
      score: q("score"), strong: q("strong"), sugg: q("sugg"), dims: q("dims"), tabs: q("tabs"), items: q("items"),
      restore: q("restore"), version: q("version"),
    };

    function persist() {
      U.store(KEY, { text: st.text, baseline: st.baseline, purpose: st.purpose, ignoredKeys: st.ignoredKeys, ignoredRules: st.ignoredRules });
    }

    function pushText(next) {
      if (next === st.text) return false;
      st.history = st.history.concat([st.text]).slice(-50);
      st.text = next;
      return true;
    }

    function analyze() {
      if (!st.text.trim()) return { issues: [], score: null, language: "en" };
      return N.engine.analyze(st.text, {
        purpose: st.purpose,
        ignoredKeys: new Set(st.ignoredKeys),
        ignoredRules: new Set(st.ignoredRules),
      });
    }

    function render() {
      var res = analyze();
      issues = res.issues;
      if (st.sel >= issues.length) st.sel = 0;
      var lang = res.language;
      var words = N.wordCount(st.text, lang === "zh" ? "zh" : "en");
      els.meta.textContent = words + " " + (lang === "zh" ? t.chars : t.words) + " · " +
        (lang === "zh" ? t.chinese : lang === "mixed" ? t.mixed : t.english) + " · " + t.saved;

      var safe = issues.filter(function (i) { return i.rule.auto && i.rule.fixSpec && !i.document; });
      var strongN = issues.filter(function (i) { return i.rule.severity === "strong"; }).length;
      els.fixAll.textContent = t.fixSafe(safe.length);
      els.fixAll.disabled = !safe.length;
      els.mode.textContent = st.mode === "edit" ? t.check : t.editText;

      // Draft
      els.editBox.hidden = st.mode !== "edit";
      els.view.hidden = st.mode === "edit";
      if (st.mode === "edit") {
        if (els.input.value !== st.text) els.input.value = st.text;
      } else {
        U.renderHighlights(els.view, st.text, issues, function (issue, idx, s) {
          return el("button", {
            type: "button",
            class: "hitbtn hit-" + U.sevClass(issue) + (idx === st.sel ? " sel" : ""),
            "aria-label": issue.rule.title + ": " + s,
            onclick: function () { select(idx, true); },
            text: s,
          });
        });
      }

      // Diff vs. first check
      var d = N.diff(st.baseline, st.text);
      els.diffLine.textContent = d.changes ? t.diffLine(d.changes, d.added, d.removed) : t.noEdits;
      els.diffBody.textContent = "";
      d.ops.forEach(function (o) {
        els.diffBody.appendChild(o.type === "same" ? document.createTextNode(o.text) : el(o.type === "add" ? "ins" : "del", { text: o.text }));
      });
      if (d.changes && !els.diff.dataset.touched) els.diff.open = true;

      // Score
      var sc = res.score, total = sc ? sc.total : null, band = U.scoreBand(total);
      els.score.textContent = total == null ? "—" : String(total);
      els.score.className = "score-num ink-" + band.cls;
      els.strong.textContent = String(strongN);
      els.sugg.textContent = String(issues.length - strongN);
      els.dims.textContent = "";
      t.dims.forEach(function (pair) {
        var v = sc ? sc.dimensions[pair[0]] : null;
        var val = v == null ? "—" : String(Math.round(v));
        els.dims.appendChild(el("div", { class: "dim" }, [
          el("span", { class: "row" }, [el("span", { text: pair[1] }), el("b", { text: val })]),
          el("span", { class: "bar", "aria-hidden": "true" }, [el("span", { style: "width:" + (v == null ? 0 : Math.round(v)) + "%" })]),
        ]));
      });

      // Tabs
      var all = issues.map(function (i, idx) {
        return { i: i, idx: idx, safe: !!(i.rule.auto && i.rule.fixSpec && !i.document), strong: i.rule.severity === "strong" };
      });
      var counts = { all: all.length, strong: strongN, safe: safe.length };
      els.tabs.textContent = "";
      [["all", t.tabAll], ["strong", t.tabStrong], ["safe", t.tabSafe]].forEach(function (p) {
        els.tabs.appendChild(el("button", {
          type: "button", role: "tab", "aria-selected": st.filter === p[0] ? "true" : "false",
          onclick: function () { st.filter = p[0]; render(); },
          text: p[1] + " " + counts[p[0]],
        }));
      });

      // Findings
      els.items.textContent = "";
      all.filter(function (f) { return st.filter === "all" || (st.filter === "strong" && f.strong) || (st.filter === "safe" && f.safe); })
        .forEach(function (f) { els.items.appendChild(item(f)); });

      var ignoredN = st.ignoredKeys.length + st.ignoredRules.length;
      els.restore.hidden = !ignoredN;
      els.restore.textContent = t.restore(ignoredN);
      persist();
    }

    function item(f) {
      var i = f.i, sev = U.sevClass(i);
      var acts = [];
      if (f.safe) acts.push(el("button", { type: "button", class: "btn btn-dark btn-sm", onclick: function () { applyOne(i); }, text: t.apply }));
      acts.push(el("button", { type: "button", class: "btn btn-sm", onclick: function () { ignoreKey(i); }, text: t.ignore }));
      acts.push(el("button", { type: "button", class: "btn btn-ghost btn-sm", onclick: function () { ignoreRule(i); }, text: t.ruleOff }));
      acts.push(el("a", { href: U.docsFor(i), text: t.learnMore }));
      return el("li", { class: "ed-item" + (f.idx === st.sel ? " sel" : ""), "data-idx": String(f.idx) }, [
        el("button", { type: "button", class: "pick", onclick: function () { select(f.idx, false); } }, [
          el("span", { class: "finding-head" }, [
            el("span", { class: "sev sev-" + sev, text: U.sevLabel(i) }),
            el("span", { class: "finding-name", text: i.rule.title }),
            f.safe ? el("span", { class: "safe-tag", text: t.safeFix }) : null,
          ]),
          el("span", { class: "quote", text: i.text ? "“" + i.text + "”" : t.wholeDoc }),
        ]),
        el("span", { class: "finding-why", text: i.rule.reason }),
        el("span", { class: "finding-fix" }, [el("span", { class: "arrow", "aria-hidden": "true", text: "→ " }), i.rule.suggestion]),
        el("span", { class: "acts" }, acts),
      ]);
    }

    function select(idx, fromText) {
      st.sel = idx;
      if (st.mode === "edit") st.mode = "review";
      render();
      var target = fromText ? els.items.querySelector('[data-idx="' + idx + '"]') : els.view.querySelector(".hitbtn.sel");
      if (target) target.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }

    function applyOne(i) {
      var r = N.engine.applyIssue(st.text, i);
      if (r.ok) { pushText(r.text); render(); }
      else U.toast(t.skipped);
    }
    function ignoreKey(i) { st.ignoredKeys = st.ignoredKeys.concat([N.engine.issueKey(i)]); render(); }
    function ignoreRule(i) { st.ignoredRules = st.ignoredRules.concat([i.rule.id]); render(); }

    function download(name, type, body) {
      var a = el("a", { href: URL.createObjectURL(new Blob([body], { type: type })), download: name });
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
    }
    function toHtml(text) {
      var escH = function (s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
      return "<!doctype html>\n<meta charset=\"utf-8\">\n" + text.split(/\n{2,}/).map(function (p) {
        return "<p>" + escH(p).replace(/\n/g, "<br>") + "</p>";
      }).join("\n") + "\n";
    }

    // Wiring
    els.purpose.value = st.purpose;
    els.purpose.addEventListener("change", function () { st.purpose = els.purpose.value; render(); });
    els.input.addEventListener("input", function () { st.text = els.input.value; persist(); });
    els.input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); st.mode = "review"; render(); }
    });
    els.mode.addEventListener("click", function () {
      if (st.mode === "edit") { st.text = els.input.value; st.mode = "review"; st.sel = 0; }
      else st.mode = "edit";
      render();
      if (st.mode === "edit") els.input.focus();
    });
    els.fixAll.addEventListener("click", function () {
      var r = N.engine.autofix(st.text, issues);
      pushText(r.text);
      render();
      U.toast(t.applied(r.applied));
    });
    els.undo.addEventListener("click", function () {
      if (!st.history.length) { U.toast(t.nothingUndo); return; }
      st.text = st.history[st.history.length - 1];
      st.history = st.history.slice(0, -1);
      render();
      U.toast(t.undone);
    });
    els.copy.addEventListener("click", function () { U.copyText(st.mode === "edit" ? els.input.value : st.text); });
    els.clear.addEventListener("click", function () {
      pushText("");
      st.baseline = "";
      st.mode = "edit";
      render();
      els.input.focus();
      U.toast(t.cleared);
    });
    els.importBtn.addEventListener("click", function () { els.file.click(); });
    els.file.addEventListener("change", function () {
      var f = els.file.files && els.file.files[0];
      if (!f) return;
      f.text().then(function (txt) {
        pushText(txt);
        st.baseline = txt;
        st.mode = "review";
        render();
        U.toast(t.imported);
      });
      els.file.value = "";
    });
    els.exportBtn.addEventListener("click", function () {
      var open = els.exportMenu.hidden;
      els.exportMenu.hidden = !open;
      els.exportBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    els.exportMenu.addEventListener("click", function (e) {
      var kind = e.target.getAttribute("data-kind");
      if (!kind) return;
      if (kind === "md") download("draft.md", "text/markdown;charset=utf-8", st.text);
      else download("draft.html", "text/html;charset=utf-8", toHtml(st.text));
      els.exportMenu.hidden = true;
      els.exportBtn.setAttribute("aria-expanded", "false");
    });
    els.diff.addEventListener("toggle", function () { els.diff.dataset.touched = "1"; });
    els.restore.addEventListener("click", function () { st.ignoredKeys = []; st.ignoredRules = []; render(); });
    els.version.textContent = N.packs.en.version + " / " + N.packs.zh.version;

    root.classList.add("is-live");
    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-editor]").forEach(init);
  });
})();
