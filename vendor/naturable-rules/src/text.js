// Text utilities shared by the engine. Pure functions, no DOM.

export function detectLanguage(text) {
  const zh = (text.match(/[㐀-鿿]/g) || []).length;
  const en = (text.match(/[A-Za-z]/g) || []).length;
  if (zh && en && zh / (zh + en) > 0.18 && en / (zh + en) > 0.18) return "mixed";
  if (zh > en * 0.18) return "zh";
  if (en) return "en";
  return "unknown";
}

export function sentences(text, language) {
  if (language === "zh") {
    return text.split(/(?<=[。！？；!?])\s*/).map((x) => x.trim()).filter(Boolean);
  }
  return text.replace(/\n+/g, " ").split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);
}

export function sentenceLengths(text, language) {
  return sentences(text, language).map((s) =>
    language === "zh"
      ? (s.match(/[㐀-鿿A-Za-z0-9]/g) || []).length
      : s.split(/\s+/).filter(Boolean).length
  );
}

/** Coefficient of variation of sentence length (sd / mean). */
export function burstiness(text, language) {
  const lens = sentenceLengths(text, language);
  if (lens.length < 2) return { cv: 0, mean: lens[0] || 0, sd: 0, n: lens.length, lengths: lens };
  const mean = lens.reduce((a, b) => a + b, 0) / lens.length;
  const sd = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length);
  return { cv: mean ? sd / mean : 0, mean, sd, n: lens.length, lengths: lens };
}

export function wordCount(text, language) {
  if (language === "zh") return (text.match(/[㐀-鿿]/g) || []).length;
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

export function extractFacts(text) {
  const numbers = text.match(/\d+(?:[.,]\d+)?%?/g) || [];
  const money = text.match(/\$\d+(?:[.,]\d+)?[MBKmbk]?/g) || [];
  const enNames = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g) || [];
  // Only high-signal Chinese person/org markers — avoid treating ordinary words as facts.
  const zhNames = text.match(/[一-鿿]{2,4}(?:先生|女士|老师|教授|博士|公司|大学)/g) || [];
  return {
    numbers: new Set([...numbers, ...money]),
    names: new Set([...enNames, ...zhNames]),
  };
}

/**
 * Information-conservation gate for automatic fixes:
 * a fix may not drop or invent numbers, and may not invent multi-word proper names.
 */
export function conservesInformation(before, after) {
  const b = extractFacts(before);
  const a = extractFacts(after);
  for (const n of b.numbers) {
    if (![...a.numbers].some((x) => x === n) && !after.includes(n)) return false;
  }
  for (const n of a.numbers) {
    if (![...b.numbers].some((x) => x === n) && !before.includes(n)) return false;
  }
  for (const name of a.names) {
    if (!b.names.has(name) && !before.includes(name)) return false;
  }
  return true;
}

/** Tidy whitespace and punctuation left behind after deleting a span. */
export function normalizeAfterFix(text) {
  return text
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([,.!?;:，。！？；：])/g, "$1")
    .replace(/([.!?。！？])\s*[.!?。！？]+/g, "$1")
    .replace(/([.!?。！？])\s*[,，;；:：]+\s*/g, "$1 ")
    .replace(/ +\n/g, "\n")
    .replace(/^\s*[,，;；:：]+\s*/gm, "")
    .replace(/(^|\n)\s+/g, "$1")
    .trim()
    .replace(/(^|[.!?]\s+)([a-z])/g, (m, p, c) => p + c.toUpperCase());
}
