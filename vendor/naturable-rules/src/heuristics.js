// Heuristic detectors referenced by rules with detect.type === "heuristic".
// Each returns hits: { start, end, text } or { document: true, ... } for document-level findings.

import { sentences, wordCount } from "./text.js";

/** Find every occurrence of `needle` at or after `from`; returns the first index >= from. */
function locate(text, needle, from) {
  const at = text.indexOf(needle, from);
  return at >= 0 ? at : text.indexOf(needle);
}

const HEURISTICS = {
  adjacent_parallel(text, language) {
    if (language !== "en") return [];
    const hits = [];
    const s = sentences(text, "en");
    let cursor = 0;
    for (let i = 0; i < s.length - 1; i++) {
      const a = s[i], b = s[i + 1];
      const start = locate(text, a, cursor);
      if (start >= 0) cursor = start + a.length;
      const wa = (a.match(/^\W*([A-Za-z]+)/) || [])[1];
      const wb = (b.match(/^\W*([A-Za-z]+)/) || [])[1];
      if (!wa || !wb) continue;
      if (wa.toLowerCase() === wb.toLowerCase() && a.split(/\s+/).length <= 12 && b.split(/\s+/).length <= 12) {
        if (start >= 0) hits.push({ start, end: start + a.length, text: a });
      }
    }
    return hits;
  },

  specificity_cover(text) {
    const hits = [];
    if (!/\d/.test(text)) return hits;
    const hollow = /\b(experts (?:believe|say)|studies (?:show|suggest)|growth is strong|significant (?:impact|progress))\b/gi;
    let m;
    while ((m = hollow.exec(text))) hits.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
    return hits;
  },

  // New in en-v1.1: per-dash hits once em-dash density crosses the threshold.
  en_dash_dense(text, language, params = {}) {
    if (language !== "en") return [];
    const minCount = params.min_count ?? 3;
    const perThousand = params.per_1000_words ?? 8;
    const re = /\s?(?:—|--)\s?/g;
    const found = [];
    let m;
    while ((m = re.exec(text))) found.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
    const words = wordCount(text, "en") || 1;
    if (found.length >= minCount && (found.length / words) * 1000 >= perThousand) return found;
    return [];
  },

  zh_adjacent_parallel(text, language) {
    if (language !== "zh") return [];
    const hits = [];
    const s = sentences(text, "zh");
    let cursor = 0;
    for (let i = 0; i < s.length - 1; i++) {
      const a = s[i], b = s[i + 1];
      const start = locate(text, a, cursor);
      if (start >= 0) cursor = start + a.length;
      if (a.length < 4 || b.length < 4) continue;
      const ha = a.slice(0, 1), hb = b.slice(0, 1);
      const sameVerbShape = /^(它|他|她|这|那|我们|他们)/.test(a) && ha === hb && Math.abs(a.length - b.length) <= 4;
      if (sameVerbShape || a.slice(0, 2) === b.slice(0, 2)) {
        if (start >= 0) hits.push({ start, end: start + a.length, text: a });
      }
    }
    return hits;
  },

  zh_dash_dense(text, language) {
    if (language !== "zh") return [];
    const dashes = (text.match(/——|—/g) || []).length;
    const chars = (text.match(/[㐀-鿿]/g) || []).length || 1;
    if (dashes >= 3 && dashes / chars > 0.02) {
      return [{ start: 0, end: Math.min(text.length, 12), text: text.slice(0, 12), document: true }];
    }
    return [];
  },

  zh_enumeration_dense(text, language) {
    if (language !== "zh") return [];
    const hits = [];
    const re = /[^、\n]{1,12}(?:、[^、\n]{1,12}){4,}/g;
    let m;
    while ((m = re.exec(text))) hits.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
    return hits;
  },

  zh_zero_anaphora(text, language) {
    if (language !== "zh") return [];
    const hits = [];
    const evalStart = /^(值得肯定|令人振奋|至关重要|显而易见|不难发现|总而言之)/;
    const re = /[^\n]+/g; // paragraphs = non-empty lines, offsets kept exact
    let m;
    while ((m = re.exec(text))) {
      const para = m[0];
      const trimmed = para.trim();
      if (trimmed && evalStart.test(trimmed) && !/^(这|该|上述|此)/.test(trimmed)) {
        const start = m.index + para.indexOf(trimmed);
        const slice = trimmed.slice(0, Math.min(12, trimmed.length));
        hits.push({ start, end: start + slice.length, text: slice });
      }
    }
    return hits;
  },
};

export function heuristicHits(rule, text, language) {
  const name = rule.detect && rule.detect.name;
  const fn = HEURISTICS[name];
  if (!fn) return [];
  return fn(text, language, rule.detect.params);
}

export const HEURISTIC_NAMES = Object.keys(HEURISTICS);
