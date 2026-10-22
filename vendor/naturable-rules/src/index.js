import en from "../packs/en.json" with { type: "json" };
import zh from "../packs/zh.json" with { type: "json" };
import { createEngine } from "./engine.js";

export const packs = { en, zh };
export { createEngine, compileRule, issueKey, ENGINE_VERSION, LAYER_ORDER, PURPOSES } from "./engine.js";
export { applyFixSpec } from "./fix.js";
export { score, documentIssues } from "./score.js";
export { diff } from "./diff.js";
export {
  detectLanguage, sentences, sentenceLengths, burstiness, wordCount,
  extractFacts, conservesInformation, normalizeAfterFix,
} from "./text.js";

/** Engine preloaded with the bundled EN + ZH packs. */
export const engine = createEngine({ packs });
