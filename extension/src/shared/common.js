/* Shared by the content script, popup, side panel and service worker (classic script, no imports). */
(function (root) {
  "use strict";

  const SITE = "https://naturable.app";
  const PURPOSES = ["general", "blog", "email", "marketing", "academic", "social", "technical"];
  const DEFAULTS = { purpose: "general", ignoredKeys: [] };
  const MAX_CHARS = 50000;

  // Sites where Naturable refuses to turn on, even if asked: banking, payments, password managers, sign-in pages.
  const SENSITIVE_DOMAINS = [
    "paypal.com", "venmo.com", "wise.com", "revolut.com", "stripe.com", "chase.com", "wellsfargo.com", "citi.com",
    "americanexpress.com", "capitalone.com", "schwab.com", "fidelity.com", "vanguard.com", "robinhood.com",
    "coinbase.com", "binance.com", "kraken.com", "alipay.com", "1password.com", "bitwarden.com", "lastpass.com",
    "dashlane.com", "keepersecurity.com", "okta.com", "accounts.google.com", "login.microsoftonline.com",
    "login.live.com", "appleid.apple.com", "icloud.com",
  ];
  const SENSITIVE_SUBDOMAIN = /^(login|signin|sign-in|auth|accounts?|secure|sso|id|pay|payments?|checkout|billing|wallet)\./;
  const SENSITIVE_LABEL = /(^|\.)[a-z0-9-]*bank[a-z0-9-]*\./; // bankofamerica.com, online.mybank.co.uk

  function isSensitiveHost(hostname) {
    const h = String(hostname || "").toLowerCase().replace(/^www\./, "");
    if (!h) return false;
    if (SENSITIVE_DOMAINS.some((d) => h === d || h.endsWith("." + d))) return true;
    if (SENSITIVE_SUBDOMAIN.test(h)) return true;
    if (SENSITIVE_LABEL.test(h)) return true;
    return /\.gov(\.[a-z]{2})?$/.test(h);
  }

  // Text boxes Naturable never reads: payment, password and one-time-code fields.
  const SENSITIVE_FIELD = /(card|cc-?num|cvv|cvc|iban|password|passcode|passwd|ssn|social.?security|otp|one.?time|pin\b)/i;
  function isSensitiveField(el) {
    if (!el || el.nodeType !== 1) return true;
    const ac = (el.getAttribute("autocomplete") || "").toLowerCase();
    if (/cc-|password|one-time-code/.test(ac)) return true;
    const hint = [el.getAttribute("name"), el.id, el.getAttribute("aria-label"), el.getAttribute("placeholder")].join(" ");
    if (SENSITIVE_FIELD.test(hint)) return true;
    const form = el.closest && el.closest("form");
    return !!(form && form.querySelector('input[type="password"], input[autocomplete^="cc-"]'));
  }

  /** "https://mail.google.com/x" -> "https://mail.google.com/*" (null for non-web pages). */
  function originPattern(url) {
    try {
      const u = new URL(url);
      if (u.protocol !== "https:" && u.protocol !== "http:") return null;
      return `${u.protocol}//${u.hostname}/*`;
    } catch (e) {
      return null;
    }
  }

  function hostOf(url) {
    try { return new URL(url).hostname; } catch (e) { return ""; }
  }

  /** Higher = reads more natural. Same bands and wording as naturable.app. */
  function scoreBand(total) {
    if (total == null) return { cls: "none", label: "Waiting for text" };
    if (total >= 80) return { cls: "ok", label: "Reads mostly natural" };
    if (total >= 60) return { cls: "warn", label: "Some AI patterns" };
    return { cls: "bad", label: "Many AI patterns" };
  }

  /** Where a hit is explained on naturable.app. Word hits go to the word's own anchor. */
  function docsFor(issue) {
    const words = root.NAT_WORDS || {};
    if (issue.rule.id === "en.lexicon.cliche" && issue.text) {
      const w = words[issue.text.toLowerCase()];
      if (w) return w;
    }
    if (issue.rule.docs) return issue.rule.docs;
    return issue.rule.language === "zh" ? SITE + "/zh-cn/how-it-works/" : SITE + "/en/how-it-works/";
  }

  function issueKey(issue) {
    return `${issue.rule.id}:${(issue.text || "").toLowerCase()}`;
  }

  async function getSettings() {
    const s = await chrome.storage.local.get(DEFAULTS);
    return { purpose: PURPOSES.includes(s.purpose) ? s.purpose : "general", ignoredKeys: Array.isArray(s.ignoredKeys) ? s.ignoredKeys : [] };
  }

  async function ignoreKey(key) {
    const { ignoredKeys } = await getSettings();
    if (!ignoredKeys.includes(key)) await chrome.storage.local.set({ ignoredKeys: ignoredKeys.concat(key) });
  }

  /** Run the bundled rules. Returns null for empty or oversized text. */
  function analyze(text, settings) {
    if (!text || !text.trim() || text.length > MAX_CHARS) return null;
    return root.Naturable.engine.analyze(text, {
      purpose: settings.purpose,
      language: "auto",
      ignoredKeys: new Set(settings.ignoredKeys),
    });
  }

  function rulesVersion() {
    const p = root.Naturable && root.Naturable.packs;
    return p ? `${p.en.version} / ${p.zh.version}` : "";
  }

  root.NatShared = {
    SITE, PURPOSES, DEFAULTS, MAX_CHARS, isSensitiveHost, isSensitiveField, originPattern, hostOf,
    scoreBand, docsFor, issueKey, getSettings, ignoreKey, analyze, rulesVersion,
  };
})(typeof globalThis !== "undefined" ? globalThis : self);
