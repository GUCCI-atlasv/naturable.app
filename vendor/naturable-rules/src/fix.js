// Fix specs: how an auto-safe rule rewrites its own match.
//   { type: "delete" }                         -> ""
//   { type: "map", map: { from: to } }         -> case-insensitive lookup
//   { type: "replace_match" }                  -> keep capture group 1 (sentence prefix), drop the rest
//   { type: "replace", with: "text" }          -> fixed replacement

export function applyFixSpec(spec, matchText, matchArr) {
  if (!spec) return matchText;
  switch (spec.type) {
    case "delete":
      return "";
    case "map": {
      const key = String(matchText);
      if (Object.prototype.hasOwnProperty.call(spec.map, key)) return spec.map[key];
      const lower = key.toLowerCase();
      for (const [k, v] of Object.entries(spec.map)) if (k.toLowerCase() === lower) return v;
      return matchText;
    }
    case "replace_match":
      return matchArr && matchArr.length > 2 ? matchArr[1] || "" : "";
    case "replace":
      return typeof spec.with === "string" ? spec.with : matchText;
    default:
      return matchText;
  }
}
