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

    // Opening a parenthesis at dash i closes it at the next dash when that dash is in the same sentence;
    // that next dash then has no choice of its own. Returns { i+1: i } for those pairs.
    function closers(text, found) {
      var map = {};
      found.forEach(function (f, i) {
        if (map[i] != null || (choices[i] || "comma") !== "paren") return;
        var next = found[i + 1];
        var sentenceEnd = text.slice(f.end).search(/[.!?]/);
        if (next && (sentenceEnd === -1 || next.start < f.end + sentenceEnd)) map[i + 1] = i;
      });
      return map;
    }

    function build(text, found, closedBy) {
      var out = "", pos = 0;
      found.forEach(function (f, i) {
        var c = choices[i] || "comma";
        out += text.slice(pos, f.start);
        pos = f.end;
        if (closedBy[i] != null) { out += ") "; return; }
        if (c === "keep") out += text.slice(f.start, f.end);
        else if (c === "comma") out += ", ";
        else if (c === "colon") out += ": ";
        else if (c === "paren") {
          var sentenceEnd = text.slice(f.end).search(/[.!?]/);
          if (closedBy[i + 1] === i) out += " (";
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
      var closedBy = closers(text, found);
      output.textContent = build(text, found, closedBy) || " ";

      // Keep keyboard focus on the same control across re-renders.
      var active = document.activeElement, keep = active && list.contains(active) ? active.getAttribute("data-key") : null;
      list.textContent = "";
      found.forEach(function (f, i) {
        var pre = text.slice(Math.max(0, f.start - 32), f.start).trimStart();
        var post = text.slice(f.end, f.end + 32).trimEnd();
        var ctx = U.el("span", { class: "ctx" }, [U.el("span", { class: "n", text: "#" + (i + 1) + " · " }), "…" + pre, U.el("mark", { text: "—" }), post + "…"]);
        if (closedBy[i] != null) {
          list.appendChild(U.el("li", { class: "dash-item" }, [ctx, U.el("span", { class: "closes", text: "Closes the parentheses from #" + (closedBy[i] + 1) + "." })]));
          return;
        }
        var current = choices[i] || "comma";
        var group = U.el("div", { class: "radios", role: "radiogroup", "aria-label": "Replacement for dash " + (i + 1) });
        OPTS.forEach(function (o, k) {
          var on = current === o[0];
          group.appendChild(U.el("button", {
            type: "button", role: "radio", "aria-checked": on ? "true" : "false", text: o[1],
            tabindex: on ? "0" : "-1", "data-key": i + ":" + o[0],
            onclick: function () { choices[i] = o[0]; render(); },
            onkeydown: function (e) {
              var d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
              if (!d) return;
              e.preventDefault();
              var n = OPTS[(k + d + OPTS.length) % OPTS.length][0];
              choices[i] = n;
              render();
              var b = list.querySelector('[data-key="' + i + ":" + n + '"]');
              if (b) b.focus();
            },
          }));
        });
        list.appendChild(U.el("li", { class: "dash-item" }, [ctx, group]));
      });
      if (keep) {
        var again = list.querySelector('[data-key="' + keep + '"]');
        if (again) again.focus();
      }
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
