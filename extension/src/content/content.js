/* Inline checker: underlines rule hits in the focused <textarea> or contenteditable editor and explains them
   on hover. Runs only on sites the user enabled (or once, via the popup). Never edits the page's text and never
   sends it anywhere: analysis runs here with the bundled rules. */
(() => {
  "use strict";
  if (window.__naturable) { window.__naturable.wake(); return; }

  const S = globalThis.NatShared;
  const ANALYZE_DELAY = 300;
  const BLOCK = /^(ADDRESS|ARTICLE|ASIDE|BLOCKQUOTE|DD|DIV|DL|DT|FIELDSET|FIGCAPTION|FIGURE|FOOTER|H[1-6]|HEADER|HR|LI|MAIN|NAV|OL|P|PRE|SECTION|TABLE|TBODY|TR|TD|TH|UL)$/;
  const MIRROR_PROPS = [
    "fontFamily", "fontSize", "fontWeight", "fontStyle", "fontVariant", "fontStretch", "fontFeatureSettings",
    "fontKerning", "letterSpacing", "wordSpacing", "lineHeight", "textTransform", "textIndent", "textAlign",
    "tabSize", "direction", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "whiteSpace",
    "overflowWrap", "wordBreak",
  ];

  let settings = { purpose: "general", ignoredKeys: [] };
  let tracker = null;
  let ui = null;
  let alive = true;
  const off = []; // teardown callbacks

  function listen(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    off.push(() => target.removeEventListener(type, fn, opts));
  }

  function send(msg) {
    try { chrome.runtime.sendMessage(msg).catch(() => {}); } catch (e) { teardown(); } // extension reloaded
  }

  /* ---------------- Overlay (closed shadow root, no page CSS leaks in or out) ---------------- */

  function makeUI() {
    const host = document.createElement("naturable-overlay");
    host.style.cssText = "all:initial;position:fixed;inset:0;pointer-events:none;z-index:2147483646;contain:strict;";
    const root = host.attachShadow({ mode: "closed" });
    root.innerHTML = `<style>
      :host { all: initial; }
      .lines, .mirror { position: fixed; inset: 0; pointer-events: none; }
      .line { position: fixed; height: 0; border-bottom: 2px solid #A2462A; pointer-events: none; }
      .line.suggestion { border-bottom: 2px dotted #7A5600; }
      .line.hot { background: rgba(162,70,42,.12); border-radius: 2px; }
      .mirror > div { position: fixed; visibility: hidden; overflow: hidden; border: 0; margin: 0; box-sizing: content-box; white-space: pre-wrap; overflow-wrap: break-word; }
      .card { position: fixed; pointer-events: auto; width: max-content; max-width: 320px; box-sizing: border-box;
        background: #FFFDF8; color: #1F1D1A; border: 1px solid #E2DDD2; border-radius: 12px; padding: 12px 14px;
        box-shadow: 0 8px 24px rgba(31,29,26,.16); font: 13px/1.45 Inter, system-ui, -apple-system, "Segoe UI", "PingFang SC", sans-serif; }
      .card[hidden] { display: none; }
      .r { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
      .r strong { font-weight: 600; font-size: 14px; }
      .sev { font-size: 11px; font-weight: 600; padding: 1px 7px; border-radius: 999px; background: #F6DDD1; color: #7E3520; }
      .sev.suggestion { background: #F4E5B5; color: #5E4300; }
      p { margin: 0 0 6px; }
      .q { color: #4E4A43; font-style: italic; overflow-wrap: anywhere; }
      .s { color: #3A3631; }
      .acts { display: flex; gap: 8px; margin-top: 10px; align-items: center; }
      button, a.more { font-family: inherit; font-size: 12px; font-weight: 500; line-height: 1; min-height: 28px; padding: 0 10px; border-radius: 8px; cursor: pointer;
        display: inline-flex; align-items: center; text-decoration: none; }
      button { border: 1px solid #CFC8BA; background: #fff; color: #1F1D1A; }
      a.more { color: #A2462A; border: 1px solid transparent; }
      button:hover { background: #F7F4EE; } a.more:hover { color: #7E3520; text-decoration: underline; }
      :focus-visible { outline: 2px solid #1F1D1A; outline-offset: 2px; }
      .brand { margin-left: auto; color: #4E4A43; font-size: 11px; }
    </style><div class="lines"></div><div class="mirror"></div>
    <div class="card" role="dialog" aria-label="Naturable" hidden></div>`;
    (document.documentElement || document.body).appendChild(host);
    const card = root.querySelector(".card");
    card.addEventListener("mouseenter", () => hover.keep());
    card.addEventListener("mouseleave", () => hover.scheduleHide());
    card.addEventListener("keydown", (e) => { if (e.key === "Escape") hover.hide(true); });
    return { host, root, lines: root.querySelector(".lines"), mirror: root.querySelector(".mirror"), card };
  }

  /* ---------------- Text model ---------------- */

  /** Flatten a contenteditable root into text + text-node segments (block boundaries become "\n"). */
  function buildModel(root) {
    const segs = [];
    let text = "";
    const nl = () => { if (text && !text.endsWith("\n")) text += "\n"; };
    (function walk(node) {
      for (let c = node.firstChild; c; c = c.nextSibling) {
        if (c.nodeType === 3) {
          const v = c.nodeValue;
          if (v) { segs.push({ node: c, start: text.length, end: text.length + v.length }); text += v; }
        } else if (c.nodeType === 1) {
          const tag = c.tagName;
          if (tag === "BR") { text += "\n"; continue; }
          if (tag === "SCRIPT" || tag === "STYLE" || tag === "TEMPLATE" || c.getAttribute("contenteditable") === "false") continue;
          const block = BLOCK.test(tag);
          if (block) nl();
          walk(c);
          if (block) nl();
        }
      }
    })(root);
    return { text: text.replace(/\u00a0/g, " "), segs };
  }

  /** Text offset -> { node, offset } (for a range start, or an end when preferEnd). */
  function locate(segs, pos, preferEnd) {
    let lo = 0, hi = segs.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1, s = segs[mid];
      if (pos < s.start) hi = mid - 1;
      else if (pos > s.end) lo = mid + 1;
      else {
        if (!preferEnd && pos === s.end && segs[mid + 1] && segs[mid + 1].start === pos) return { node: segs[mid + 1].node, offset: 0 };
        return { node: s.node, offset: pos - s.start };
      }
    }
    // pos falls on an inserted "\n": snap forward for starts, backward for ends.
    const s = preferEnd ? segs[hi] : segs[lo];
    if (!s) return null;
    return preferEnd ? { node: s.node, offset: s.end - s.start } : { node: s.node, offset: 0 };
  }

  /* ---------------- Tracker: one editor at a time ---------------- */

  function editableRoot(t) {
    if (!t || t.nodeType !== 1) return null;
    let el = null;
    if (t.tagName === "TEXTAREA") el = t.readOnly || t.disabled ? null : t;
    else if (t.isContentEditable) {
      el = t;
      while (el.parentElement && el.parentElement.isContentEditable) el = el.parentElement;
    }
    if (!el || S.isSensitiveField(el)) return null;
    return el;
  }

  class Tracker {
    constructor(el) {
      this.el = el;
      this.kind = el.tagName === "TEXTAREA" ? "textarea" : "editable";
      this.hits = [];
      this.timer = 0;
      this.frame = 0;
      this.lastRect = "";
      this.onInput = () => { this.clearLines(); this.schedule(); };
      el.addEventListener("input", this.onInput);
      this.ro = new ResizeObserver(() => this.relayout());
      this.ro.observe(el);
      if (this.kind === "editable") {
        // Programmatic edits (signatures, templates, paste handlers) don't always fire "input".
        this.mo = new MutationObserver(() => this.schedule());
        this.mo.observe(el, { childList: true, subtree: true, characterData: true });
      }
      this.poll = setInterval(() => {
        if (!this.el.isConnected) return detach();
        const r = this.el.getBoundingClientRect();
        const k = `${r.left},${r.top},${r.width},${r.height}`;
        if (k !== this.lastRect) { this.lastRect = k; this.relayout(); }
      }, 500);
      this.run();
    }

    destroy() {
      clearTimeout(this.timer);
      cancelAnimationFrame(this.frame);
      clearInterval(this.poll);
      this.el.removeEventListener("input", this.onInput);
      this.ro.disconnect();
      if (this.mo) this.mo.disconnect();
      this.clearLines();
      if (ui) ui.mirror.textContent = "";
      send({ type: "badge", count: 0 });
    }

    schedule() {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.run(), ANALYZE_DELAY);
    }

    run() {
      if (!alive) return;
      let text, model = null;
      if (this.kind === "textarea") text = this.el.value;
      else { model = buildModel(this.el); text = model.text; }
      const res = S.analyze(text, settings);
      this.text = text;
      this.model = model;
      // The engine lists hits by rule layer; the mirror and hover order need text order.
      this.issues = res ? res.issues.filter((i) => !i.document && i.start != null && i.end > i.start).sort((a, b) => a.start - b.start) : [];
      send({ type: "badge", count: this.issues.length });
      this.layout();
    }

    relayout() {
      cancelAnimationFrame(this.frame);
      this.frame = requestAnimationFrame(() => this.layout());
    }

    /** Visible box of the editor's content, for clipping underlines. */
    clip() {
      const r = this.el.getBoundingClientRect();
      const left = r.left + this.el.clientLeft, top = r.top + this.el.clientTop;
      return { left, top, right: left + this.el.clientWidth, bottom: top + this.el.clientHeight };
    }

    rectsTextarea() {
      const el = this.el, cs = getComputedStyle(el), r = el.getBoundingClientRect();
      ui.mirror.textContent = "";
      const m = document.createElement("div");
      for (const p of MIRROR_PROPS) m.style[p] = cs[p];
      m.style.whiteSpace = cs.whiteSpace === "nowrap" ? "pre" : "pre-wrap";
      const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      m.style.left = r.left + el.clientLeft + "px";
      m.style.top = r.top + el.clientTop + "px";
      m.style.width = Math.max(0, el.clientWidth - padX) + "px";
      m.style.height = Math.max(0, el.clientHeight - padY) + "px";
      const spans = [];
      let pos = 0;
      for (const i of this.issues) {
        if (i.start < pos) continue;
        m.appendChild(document.createTextNode(this.text.slice(pos, i.start)));
        const s = document.createElement("span");
        s.textContent = this.text.slice(i.start, i.end);
        m.appendChild(s);
        spans.push([i, s]);
        pos = i.end;
      }
      m.appendChild(document.createTextNode(this.text.slice(pos) + "\u200b"));
      ui.mirror.appendChild(m);
      m.scrollTop = el.scrollTop;
      m.scrollLeft = el.scrollLeft;
      return spans.map(([issue, s]) => ({ issue, rects: Array.from(s.getClientRects()) }));
    }

    rectsEditable() {
      const out = [];
      for (const issue of this.issues) {
        const a = locate(this.model.segs, issue.start, false), b = locate(this.model.segs, issue.end, true);
        if (!a || !b) continue;
        const range = document.createRange();
        try { range.setStart(a.node, a.offset); range.setEnd(b.node, b.offset); } catch (e) { continue; }
        out.push({ issue, rects: Array.from(range.getClientRects()) });
      }
      return out;
    }

    layout() {
      if (!ui || !this.el.isConnected) return;
      if (!this.issues || !this.issues.length) { this.hits = []; this.clearLines(); return; }
      const c = this.clip();
      const raw = this.kind === "textarea" ? this.rectsTextarea() : this.rectsEditable();
      this.hits = raw.map(({ issue, rects }) => ({
        issue,
        rects: rects
          .filter((q) => q.width > 0.5 && q.bottom > c.top && q.top < c.bottom && q.right > c.left && q.left < c.right)
          .map((q) => ({ left: Math.max(q.left, c.left), right: Math.min(q.right, c.right), top: q.top, bottom: Math.min(q.bottom, c.bottom) })),
      })).filter((h) => h.rects.length);
      const frag = document.createDocumentFragment();
      for (const h of this.hits) {
        h.lines = h.rects.map((q) => {
          const d = document.createElement("div");
          d.className = "line " + (h.issue.rule.severity === "strong" ? "strong" : "suggestion");
          d.style.cssText = `left:${q.left}px;top:${q.top}px;width:${q.right - q.left}px;height:${Math.max(0, q.bottom - q.top - 2)}px`;
          frag.appendChild(d);
          return d;
        });
      }
      ui.lines.textContent = "";
      ui.lines.appendChild(frag);
      hover.refresh();
    }

    clearLines() {
      this.hits = [];
      if (ui) ui.lines.textContent = "";
      hover.hide(true);
    }

    hitAt(x, y) {
      for (const h of this.hits) for (const q of h.rects) if (x >= q.left && x <= q.right && y >= q.top - 1 && y <= q.bottom + 3) return h;
      return null;
    }
  }

  function track(el) {
    if (tracker && tracker.el === el) return;
    if (tracker) tracker.destroy();
    if (!ui) ui = makeUI();
    tracker = new Tracker(el);
  }

  function detach() {
    if (tracker) tracker.destroy();
    tracker = null;
  }

  /* ---------------- Hover card ---------------- */

  const hover = {
    shown: null, showT: 0, hideT: 0,
    at(x, y) {
      const h = tracker && tracker.hitAt(x, y);
      if (h) {
        clearTimeout(this.hideT);
        if (h !== this.shown) { clearTimeout(this.showT); this.showT = setTimeout(() => this.show(h), 120); }
      } else {
        clearTimeout(this.showT);
        if (this.shown) this.scheduleHide();
      }
    },
    keep() { clearTimeout(this.hideT); },
    scheduleHide() { clearTimeout(this.hideT); this.hideT = setTimeout(() => this.hide(), 280); },
    hide(now) {
      clearTimeout(this.showT); clearTimeout(this.hideT);
      if (this.shown && this.shown.lines) this.shown.lines.forEach((d) => d.classList.remove("hot"));
      this.shown = null;
      if (ui) ui.card.hidden = true;
    },
    refresh() {
      // After a relayout the old hit objects are gone; close the card rather than point at stale text.
      if (this.shown && tracker && !tracker.hits.includes(this.shown)) this.hide(true);
    },
    show(h) {
      if (!ui) return;
      this.hide(true);
      this.shown = h;
      (h.lines || []).forEach((d) => d.classList.add("hot"));
      const { rule, text } = h.issue;
      const strong = rule.severity === "strong";
      const card = ui.card;
      card.textContent = "";
      const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
      const head = el("div", "r");
      head.append(el("span", "sev " + (strong ? "strong" : "suggestion"), strong ? "Strong" : "Suggestion"), el("strong", null, rule.title));
      const acts = el("div", "acts");
      const ignore = el("button", null, "Ignore");
      ignore.type = "button";
      ignore.title = `Stop flagging “${text}” for this rule`;
      ignore.addEventListener("click", () => { S.ignoreKey(S.issueKey(h.issue)); this.hide(true); });
      const more = el("a", "more", "Learn more");
      more.href = S.docsFor(h.issue);
      more.target = "_blank";
      more.rel = "noopener";
      acts.append(ignore, more, el("span", "brand", "Naturable"));
      card.append(head, el("p", "q", `“${text}”`), el("p", "w", rule.reason), el("p", "s", "→ " + rule.suggestion), acts);
      card.hidden = false;
      // Below the first line of the hit; flip above when there is no room.
      const q = h.rects[0], cw = card.offsetWidth, ch = card.offsetHeight;
      const left = Math.max(8, Math.min(q.left, innerWidth - cw - 8));
      const top = q.bottom + 6 + ch > innerHeight - 8 ? Math.max(8, q.top - ch - 6) : q.bottom + 6;
      card.style.left = left + "px";
      card.style.top = top + "px";
    },
  };

  /* ---------------- Wiring ---------------- */

  let mouseFrame = 0, mx = 0, my = 0;
  listen(document, "mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    if (mouseFrame) return;
    mouseFrame = requestAnimationFrame(() => { mouseFrame = 0; hover.at(mx, my); });
  }, { passive: true, capture: true });

  listen(document, "focusin", (e) => {
    const el = editableRoot(e.composedPath ? e.composedPath()[0] : e.target);
    if (el) track(el);
  }, true);

  listen(window, "scroll", () => tracker && tracker.relayout(), { passive: true, capture: true });
  listen(window, "resize", () => tracker && tracker.relayout(), { passive: true });
  listen(document, "keydown", (e) => { if (e.key === "Escape" && hover.shown) hover.hide(true); }, true);

  function onStorage(changes, area) {
    if (area !== "local" || !("purpose" in changes || "ignoredKeys" in changes)) return;
    S.getSettings().then((s) => { settings = s; if (tracker) tracker.run(); });
  }
  function onMessage(msg) {
    if (msg && msg.type === "naturable:off") teardown();
  }
  chrome.storage.onChanged.addListener(onStorage);
  chrome.runtime.onMessage.addListener(onMessage);
  off.push(() => { chrome.storage.onChanged.removeListener(onStorage); chrome.runtime.onMessage.removeListener(onMessage); });

  function teardown() {
    if (!alive) return;
    alive = false;
    detach();
    off.splice(0).forEach((f) => { try { f(); } catch (e) {} });
    if (ui) ui.host.remove();
    ui = null;
    delete window.__naturable;
  }

  function wake() {
    const el = editableRoot(document.activeElement);
    if (el) track(el);
  }

  window.__naturable = { wake, teardown };
  S.getSettings().then((s) => { settings = s; wake(); });
})();
