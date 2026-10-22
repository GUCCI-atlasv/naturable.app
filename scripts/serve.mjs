// Local preview of out/ that behaves like Cloudflare Pages: _redirects, directory index.html, 404.html.
// node scripts/serve.mjs [port]
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname, dirname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "out");
const PORT = Number(process.argv[2] || process.env.PORT || 8788);
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff2": "font/woff2", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".csv": "text/csv; charset=utf-8" };

const redirects = new Map(
  readFileSync(join(OUT, "_redirects"), "utf8").split("\n").filter((l) => l && !l.startsWith("#")).map((l) => {
    const [from, to, code] = l.trim().split(/\s+/);
    return [from, [to, Number(code || 302)]];
  }),
);

const server = createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  const path = decodeURIComponent(url.pathname);
  const r = redirects.get(path);
  if (r) {
    res.writeHead(r[1], { Location: r[0] + url.search });
    return res.end();
  }
  let file = normalize(join(OUT, path));
  if (!file.startsWith(OUT)) { res.writeHead(400); return res.end(); }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) {
    if (!path.endsWith("/") && existsSync(join(OUT, path, "index.html"))) {
      res.writeHead(308, { Location: path + "/" });
      return res.end();
    }
    res.writeHead(404, { "Content-Type": TYPES[".html"] });
    return res.end(readFileSync(join(OUT, "404.html")));
  }
  res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
  res.end(readFileSync(file));
});

// If the port is taken (e.g. another preview is running), try the next few.
let port = PORT;
server.on("error", (err) => {
  if (err.code === "EADDRINUSE" && port < PORT + 10) {
    console.warn(`port ${port} is in use, trying ${port + 1}`);
    server.listen(++port);
  } else throw err;
});
server.on("listening", () => console.log(`naturable preview: http://localhost:${port}/en/`));
server.listen(port);
