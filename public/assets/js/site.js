/* Naturable site helpers: menu, copy-link, shared UI helpers for the checkers. No tracking, no network. */
(function () {
  "use strict";

  var lang = document.documentElement.lang === "zh-CN" ? "zh" : "en";

  var I18N = {
    en: {
      strong: "Strong", suggestion: "Suggestion", safeFix: "Safe fix",
      waiting: "Waiting for text", natural: "Reads mostly natural", some: "Some AI patterns", many: "Many AI patterns",
      noText: "No text yet", noIssues: "No common AI patterns found.",
      counts: function (s, g) { return s + " strong · " + g + (g === 1 ? " suggestion" : " suggestions"); },
      more: function (n) { return "+" + n + " more in the full editor →"; },
      placeholder: "Paste or type a draft, then press Check.",
      check: "Check", editText: "Edit text", wholeDoc: "Whole document", learnMore: "Learn more",
      words: "words", chars: "characters", english: "English", chinese: "Chinese (beta)", mixed: "Mixed", saved: "saved on this device",
      apply: "Apply", ignore: "Ignore", ruleOff: "Turn off rule",
      fixSafe: function (n) { return "Fix " + n + " safe"; },
      restore: function (n) { return "Restore " + n + " ignored"; },
      tabAll: "All", tabStrong: "Strong", tabSafe: "Safe fixes",
      noEdits: "no edits yet",
      diffLine: function (c, a, r) { return c + " changes · +" + a + " / −" + r + " tokens"; },
      copied: "Copied", copyFail: "Copy failed. Select the text and copy it manually.",
      applied: function (n) { return n ? "Applied " + n + " safe fix" + (n === 1 ? "" : "es") : "No safe fixes to apply"; },
      skipped: "Skipped: that fix would change a number or name.",
      cleared: "Draft cleared", undone: "Undone", nothingUndo: "Nothing to undo", imported: "Imported",
      dims: [["clarity", "Clarity"], ["specificity", "Specificity"], ["structure", "Structure"], ["artifactFree", "Artifact-free"], ["rhythm", "Rhythm"]],
      layers: { hollow: "Hollow claims", structure: "Structure", artifact: "Assistant leftovers", lexicon: "Word choice" },
    },
    zh: {
      strong: "明确问题", suggestion: "改进建议", safeFix: "安全修复",
      waiting: "等待文本", natural: "整体较自然", some: "有一些 AI 写作模式", many: "AI 写作模式较多",
      noText: "还没有文本", noIssues: "没有发现常见的 AI 写作模式。",
      counts: function (s, g) { return s + " 个明确问题 · " + g + " 条建议"; },
      more: function (n) { return "还有 " + n + " 处，打开完整编辑器 →"; },
      placeholder: "粘贴或输入草稿，然后点「检查」。",
      check: "检查", editText: "编辑文本", wholeDoc: "全文", learnMore: "了解更多",
      words: "词", chars: "字", english: "English", chinese: "简体中文 · Beta", mixed: "中英混合", saved: "已保存到本地",
      apply: "应用", ignore: "忽略", ruleOff: "关闭此规则",
      fixSafe: function (n) { return "一键修复 " + n + " 处"; },
      restore: function (n) { return "恢复 " + n + " 个已忽略项"; },
      tabAll: "全部", tabStrong: "明确问题", tabSafe: "安全修复",
      noEdits: "还没有修改",
      diffLine: function (c, a, r) { return c + " 处修改 · +" + a + " / −" + r; },
      copied: "已复制", copyFail: "复制失败，请手动选择文本复制。",
      applied: function (n) { return n ? "已应用 " + n + " 处安全修复" : "没有可自动修复的问题"; },
      skipped: "已跳过：该修改会改变数字或名称。",
      cleared: "已清空", undone: "已撤销", nothingUndo: "没有可撤销的操作", imported: "已导入",
      dims: [["clarity", "清晰度"], ["specificity", "具体程度"], ["structure", "文章结构"], ["artifactFree", "无助手残留"], ["rhythm", "句子节奏"]],
      layers: { hollow: "空洞主张", structure: "结构", artifact: "助手残留", lexicon: "用词" },
    },
  };

  var t = I18N[lang];

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k) || attrs[k] == null || attrs[k] === false) continue;
        if (k === "class") n.className = attrs[k];
        else if (k === "text") n.textContent = attrs[k];
        else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), attrs[k]);
        else n.setAttribute(k, attrs[k] === true ? "" : attrs[k]);
      }
    }
    (children || []).forEach(function (c) {
      if (c == null || c === false) return;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return n;
  }

  function scoreBand(total) {
    if (total == null) return { cls: "none", label: t.waiting };
    if (total >= 80) return { cls: "ok", label: t.natural };
    if (total >= 60) return { cls: "warn", label: t.some };
    return { cls: "bad", label: t.many };
  }

  /** Ranged, non-overlapping issues sorted by position, keeping their index in the original list. */
  function ranged(issues) {
    return issues
      .map(function (i, idx) { return { i: i, idx: idx }; })
      .filter(function (x) { return !x.i.document && x.i.start != null; })
      .sort(function (a, b) { return a.i.start - b.i.start; });
  }

  /** Render text with highlights into `target`. makeHit(issue, idx, text) returns the hit element. */
  function renderHighlights(target, text, issues, makeHit) {
    target.textContent = "";
    if (!text) {
      target.appendChild(el("span", { class: "placeholder", text: t.placeholder }));
      return;
    }
    var pos = 0;
    ranged(issues).forEach(function (x) {
      if (x.i.start < pos) return;
      if (x.i.start > pos) target.appendChild(document.createTextNode(text.slice(pos, x.i.start)));
      target.appendChild(makeHit(x.i, x.idx, text.slice(x.i.start, x.i.end)));
      pos = x.i.end;
    });
    if (pos < text.length) target.appendChild(document.createTextNode(text.slice(pos)));
  }

  function sevClass(issue) { return issue.rule.severity === "strong" ? "strong" : "suggestion"; }
  function sevLabel(issue) { return issue.rule.severity === "strong" ? t.strong : t.suggestion; }

  /** Link from a hit to the page that explains it. Data comes from docs.js (generated from the rules). */
  function docsFor(issue) {
    var D = window.NAT_DOCS || { rules: {}, words: {} };
    if (issue.rule.docs) return issue.rule.docs;
    if (issue.text) {
      var w = D.words[issue.text.toLowerCase()];
      if (w && issue.rule.id === "en.lexicon.cliche") return w;
    }
    return D.rules[issue.rule.id] || (issue.rule.language === "zh" ? "/zh-cn/how-it-works/" : "/en/how-it-works/#rule-" + issue.rule.id.replace(/\./g, "-"));
  }

  var toastTimer;
  function toast(msg) {
    var n = document.getElementById("nat-toast");
    if (!n) {
      n = el("div", { id: "nat-toast", class: "toast", role: "status", "aria-live": "polite" });
      document.body.appendChild(n);
    }
    n.textContent = msg;
    n.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { n.classList.remove("show"); }, 2200);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { toast(t.copied); }, function () { toast(t.copyFail); });
    }
    var ta = el("textarea", { style: "position:fixed;opacity:0" });
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    ta.remove();
    toast(ok ? t.copied : t.copyFail);
    return Promise.resolve();
  }

  function store(key, value) {
    try {
      if (value === undefined) return JSON.parse(localStorage.getItem(key) || "null");
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { return null; }
  }

  window.NatUI = {
    lang: lang, t: t, el: el, scoreBand: scoreBand, renderHighlights: renderHighlights,
    sevClass: sevClass, sevLabel: sevLabel, docsFor: docsFor, toast: toast, copyText: copyText, store: store,
  };

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.querySelector("[data-menu]");
    var nav = document.getElementById("mobile-nav");
    if (btn && nav) {
      btn.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
    document.querySelectorAll("[data-copy-link]").forEach(function (b) {
      b.addEventListener("click", function () {
        copyText(location.origin + location.pathname + b.getAttribute("data-copy-link"));
      });
    });
  });
})();
