// Zip src/ for the Chrome Web Store: dist/naturable-extension-<version>.zip
import { readFileSync, mkdirSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = resolve(import.meta.dirname, "..");
const { version } = JSON.parse(readFileSync(join(ROOT, "src/manifest.json"), "utf8"));
const out = join(ROOT, "dist", `naturable-extension-${version}.zip`);
mkdirSync(join(ROOT, "dist"), { recursive: true });
rmSync(out, { force: true });
execFileSync("zip", ["-r", "-X", "-q", out, ".", "-x", "*.DS_Store"], { cwd: join(ROOT, "src") });
console.log(`packed ${out.replace(ROOT + "/", "")}`);
