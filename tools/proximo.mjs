import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const [, , fila, id] = process.argv;
const q = JSON.parse(fs.readFileSync(path.join(root, "content/fila.json"), "utf8"));
const done = new Set(JSON.parse(fs.readFileSync(path.join(root, "content/publicados.json"), "utf8")).map((p) => p.id));
if (!q[fila]) { console.error("fila inválida: " + Object.keys(q).join(", ")); process.exit(2); }
const item = id ? q[fila].find((i) => i.id === id) : q[fila].find((i) => !done.has(i.id));
if (!item) { console.log(JSON.stringify({ vazia: true })); process.exit(0); }
const dir = fila.startsWith("stories") ? "stories" : fila === "carrosseis" ? "carrosseis" : "posts";
const out = path.join(root, dir, item.id);
const specFile = path.join(out, "spec.json");
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(specFile, JSON.stringify(item.slides || [item.spec]));
execFileSync("node", [path.join(here, "render.mjs"), specFile, out], { stdio: ["ignore", "ignore", "inherit"] });
fs.rmSync(specFile);
const files = fs.readdirSync(out).filter((f) => f.endsWith(".jpg")).sort();
const base = "https://raw.githubusercontent.com/gabriellaroca/aciona-posts/main/" + dir + "/" + item.id + "/";
console.log(JSON.stringify({ id: item.id, tipo: dir, legenda: item.legenda || null, ref: item.ref || null, arquivos: files.map((f) => path.join(out, f)), urls: files.map((f) => base + f) }, null, 1));
