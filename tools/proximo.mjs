import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const [, , fila, id] = process.argv;
const q = JSON.parse(fs.readFileSync(path.join(root, "content/fila.json"), "utf8"));
const done = new Set(JSON.parse(fs.readFileSync(path.join(root, "content/publicados.json"), "utf8")).map((p) => p.id));
const falhas = fs.existsSync(path.join(root, "content/falhas.json")) ? JSON.parse(fs.readFileSync(path.join(root, "content/falhas.json"), "utf8")).map((p) => p.id) : [];
if (!q[fila]) { console.error("fila inválida: " + Object.keys(q).join(", ")); process.exit(2); }
const item = id ? q[fila].find((i) => i.id === id) : q[fila].find((i) => !done.has(i.id) && !falhas.includes(i.id));
if (!item) { console.log(JSON.stringify({ vazia: true })); process.exit(0); }
const video = !!item.cenas;
const dir = video && fila === "posts" ? "reels" : fila.startsWith("stories") ? "stories" : fila === "carrosseis" ? "carrosseis" : "posts";
const out = path.join(root, dir, item.id);
fs.mkdirSync(out, { recursive: true });
if (video) {
  const { makeVideo } = await import("./video.mjs");
  await makeVideo({ id: item.id, cenas: item.cenas, out: path.join(out, "video.mp4"), fim: item.fim !== false });
} else {
  const specFile = path.join(out, "spec.json");
  fs.writeFileSync(specFile, JSON.stringify(item.slides || [item.spec]));
  execFileSync("node", [path.join(here, "render.mjs"), specFile, out], { stdio: ["ignore", "ignore", "inherit"] });
  fs.rmSync(specFile);
}
const files = fs.readdirSync(out).filter((f) => /\.(jpg|mp4)$/.test(f)).sort();
const base = "https://raw.githubusercontent.com/gabriellaroca/aciona-posts/main/" + dir + "/" + item.id + "/";
const r = { id: item.id, tipo: dir, formato: video ? "video" : "imagem", legenda: item.legenda || null, ref: item.ref || null, arquivos: files.map((f) => path.join(out, f)), urls: files.map((f) => base + f) };
if (video) { r.video_url = base + "video.mp4"; r.poster_url = base + "poster.jpg"; }
console.log(JSON.stringify(r, null, 1));
