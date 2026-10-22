/* Em dash checker ([data-emdash]). Same pattern and thresholds as rule en.structure.dash_dense. */
(function () {
  "use strict";
  var MIN_COUNT = 3, PER_1000 = 8;
  var RE = /\s?(?:—|--)\s?/g;
  var OPTS = [["comma", "Comma"], ["period", "Period"], ["colon", "Colon"], ["paren", "Parentheses"], ["keep", "Keep"]];

  function init(root) {
    var U = window.NatUI, N = window.Naturable;
    if (!U) return;
    var q = function (name) { return root.querySelector('[data-el="' + name + '"]'); };
    var input = q("input"), output = q("output"), count = q("count"), density = q("density"), marker = q("marker");
    var verdict = q("verdict"), list = q("list");
    var choices = {};

    function find(text) {
      var out = [], m;
      RE.lastIndex = 0;
      while ((m = RE.exec(text))) out.push({ start: m.index, end: m.index + m[0].length });
      return out;
    }

    // Parentheses close at the next dash in the same sentence, or at the sentence end.
    function build(text, found) {
      var out = "", pos = 0, openParen = false;
      found.forEach(function (f, i) {
        var c = choices[i] || "comma";
        out += text.slice(pos, f.start);
        pos = f.end;
        if (openParen) { out += ") "; openParen = false; return; }
        if (c === "keep") out += text.slice(f.start, f.end);
        else if (c === "comma") out += ", ";
        else if (c === "colon") out += ": ";
        else if (c === "paren") {
          var next = found[i + 1];
          var sentenceEnd = text.slice(f.end).search(/[.!?]/);
          var closesAtDash = next && (sentenceEnd === -1 || next.start < f.end + sentenceEnd);
          if (closesAtDash) { out += " ("; openParen = true; }
          else if (sentenceEnd >= 0) {
            out += " (" + text.slice(f.end, f.end + sentenceEnd) + ")";
            pos = f.end + sentenceEnd;
          } else { out += " (" + text.slice(f.end) + ")"; pos = text.length; }
        } else {
          out += ". ";
          var rest = text.slice(f.end);
          if (rest) { out += rest.charAt(0).toUpperCase(); pos = f.end + 1; }
        }
      });
      return out + text.slice(pos);
    }

    function render() {
      var text = input.value;
      var found = find(text);
      var words = N ? N.wordCount(text, "en") : (text.trim() ? text.trim().split(/\s+/).length : 0);
      var per = words ? (found.length / words) * 1000 : 0;
      var flagged = found.length >= MIN_COUNT && per >= PER_1000;
      var cls = flagged ? "bad" : found.length ? "warn" : "ok";
      count.textContent = String(found.length);
      density.textContent = per.toFixed(1);
      density.className = "v ink-" + cls;
      marker.style.left = Math.min(100, (per / 20) * 100).toFixed(1) + "%";
      verdict.textContent = flagged ? "Heavy." : found.length ? "Fine." : "No dashes.";
      verdict.className = "ink-" + cls;
      output.textContent = build(text, found) || " ";

      list.textContent = "";
      found.forEach(function (f, i) {
        var pre = text.slice(Math.max(0, f.start - 32), f.start).trimStart();
        var post = text.slice(f.end, f.end + 32).trimEnd();
        var group = U.el("div", { class: "radios", role: "radiogroup", "aria-label": "Replacement for dash " + (i + 1) });
        OPTS.forEach(function (o) {
          var on = (choices[i] || "comma") === o[0];
          group.appendChild(U.el("button", {
            type: "button", role: "radio", "aria-checked": on ? "true" : "false", text: o[1],
            onclick: function () { choices[i] = o[0]; render(); },
          }));
        });
        list.appendChild(U.el("li", { class: "dash-item" }, [
          U.el("span", { class: "ctx" }, [U.el("span", { class: "n", text: "#" + (i + 1) + " · " }), "…" + pre, U.el("mark", { text: "—" }), post + "…"]),
          group,
        ]));
      });
    }

    var all = function (k) { return function () { find(input.value).forEach(function (_, i) { choices[i] = k; }); render(); }; };
    q("all-comma").addEventListener("click", all("comma"));
    q("all-keep").addEventListener("click", all("keep"));
    q("copy").addEventListener("click", function () { U.copyText(output.textContent); });
    q("use").addEventListener("click", function () { input.value = output.textContent; choices = {}; render(); });
    input.addEventListener("input", function () { choices = {}; render(); });
    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-emdash]").forEach(init);
  });
})();
