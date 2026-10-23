/* Burstiness calculator ([data-burstiness]). Uses Naturable.burstiness — the same numbers the editor's Rhythm score uses. */
(function () {
  "use strict";

  function init(root) {
    var U = window.NatUI, N = window.Naturable;
    if (!U || !N) return;
    var q = function (name) { return root.querySelector('[data-el="' + name + '"]'); };
    var input = q("input"), bars = q("bars"), hist = q("hist"), verdict = q("verdict"), note = q("note"), runs = q("runs");
    var out = { n: q("n"), mean: q("mean"), sd: q("sd"), cv: q("cv"), rhythm: q("rhythm") };

    function render() {
      var text = input.value;
      var lang = N.detectLanguage(text) === "zh" ? "zh" : "en";
      var b = N.burstiness(text, lang);
      var sents = N.sentences(text, lang);
      var lens = b.lengths || [];
      var max = Math.max.apply(null, [1].concat(lens));
      var inRun = lens.map(function () { return false; });
      for (var i = 0; i + 2 < lens.length; i++) {
        var w = lens.slice(i, i + 3);
        if (Math.max.apply(null, w) - Math.min.apply(null, w) <= 2) inRun[i] = inRun[i + 1] = inRun[i + 2] = true;
      }
      var rhythm = b.n < 3 ? null : Math.max(35, Math.min(100, Math.round(55 + b.cv * 55)));

      out.n.textContent = String(b.n);
      out.mean.textContent = b.mean ? b.mean.toFixed(1) : "—";
      out.sd.textContent = b.n > 1 ? b.sd.toFixed(1) : "—";
      out.cv.textContent = b.n > 1 ? b.cv.toFixed(2) : "—";
      out.rhythm.textContent = rhythm == null ? "—" : String(rhythm);

      var cls = b.n < 3 ? "none" : b.cv < 0.3 ? "bad" : b.cv < 0.5 ? "warn" : "ok";
      verdict.textContent = b.n < 3 ? "Need at least 3 sentences." : b.cv < 0.3 ? "Flat rhythm." : b.cv < 0.5 ? "Some variation." : "Varied rhythm.";
      verdict.className = "ink-" + cls;
      var runCount = inRun.filter(Boolean).length;
      note.textContent = runCount ? runCount + " sentences sit in same-length runs (highlighted)." : "No same-length runs of three or more.";

      bars.textContent = "";
      bars.setAttribute("aria-label", "Bar chart of " + b.n + " sentence lengths; " + runCount + " in same-length runs");
      if (!lens.length) bars.appendChild(U.el("span", { class: "empty", text: "Paste a few sentences to see the chart." }));
      lens.forEach(function (len, idx) {
        bars.appendChild(U.el("div", { class: "b" + (inRun[idx] ? " run" : ""), title: "Sentence " + (idx + 1) + ": " + len + " words" }, [
          U.el("span", { class: "n", text: String(len) }),
          U.el("span", { class: "r", style: "height:" + Math.max(2, Math.round((len / max) * 160)) + "px" }),
        ]));
      });

      // Histogram: sentence counts per 5-word band (31+ in one bin).
      var BINS = [[1, 5], [6, 10], [11, 15], [16, 20], [21, 25], [26, 30], [31, Infinity]];
      var counts = BINS.map(function (r) { return lens.filter(function (l) { return l >= r[0] && l <= r[1]; }).length; });
      var top = Math.max.apply(null, [1].concat(counts));
      hist.textContent = "";
      hist.setAttribute("aria-label", "Histogram of sentence lengths: " + BINS.map(function (r, i) {
        return (r[1] === Infinity ? r[0] + "+" : r[0] + "–" + r[1]) + " words: " + counts[i];
      }).join("; "));
      if (!lens.length) hist.appendChild(U.el("span", { class: "empty", text: "Paste a few sentences to see the histogram." }));
      else BINS.forEach(function (r, i) {
        var label = r[1] === Infinity ? r[0] + "+" : r[0] + "–" + r[1];
        hist.appendChild(U.el("div", { class: "b", title: counts[i] + " sentences of " + label + " words" }, [
          U.el("span", { class: "n", text: String(counts[i]) }),
          U.el("span", { class: "r", style: "height:" + (counts[i] ? Math.max(2, Math.round((counts[i] / top) * 140)) : 0) + "px" }),
          U.el("span", { class: "lbl", text: label }),
        ]));
      });

      runs.textContent = "";
      var start = -1;
      for (var k = 0; k <= inRun.length; k++) {
        if (inRun[k] && start < 0) start = k;
        if (!inRun[k] && start >= 0) {
          var first = sents[start] || "";
          runs.appendChild(U.el("li", { text: "Sentences " + (start + 1) + "–" + k + ": “" + (first.length > 70 ? first.slice(0, 70) + "…" : first) + "”" }));
          start = -1;
        }
      }
      runs.parentNode.hidden = !runs.children.length;
    }

    input.addEventListener("input", render);
    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-burstiness]").forEach(init);
  });
})();
