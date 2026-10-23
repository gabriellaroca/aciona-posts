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
const hoje = process.env.HOJE || new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
const pubs = JSON.parse(fs.readFileSync(path.join(root, "content/publicados.json"), "utf8"));
const temaDe = (pid) => { for (const f of Object.values(q)) { const i = f.find((x) => x.id === pid); if (i) return i.tema; } return null; };
const ultimo = {};
for (const p of pubs) { const t = p.tema || temaDe(p.id); if (t && (!ultimo[t] || ultimo[t] < p.data)) ultimo[t] = p.data; }
const dias = (d) => (Date.parse(hoje) - Date.parse(d)) / 864e5;
const pubHoje = new Set(pubs.filter((p) => p.data === hoje).map((p) => p.id));
const livres = q[fila].filter((i) => !done.has(i.id) && !falhas.includes(i.id));
const refs = livres.filter((i) => i.ref && pubHoje.has(i.ref));
const score = (i) => (ultimo[i.tema] ? dias(ultimo[i.tema]) : 999);
const resto = livres.filter((i) => !i.ref).map((i, k) => ({ i, k, s: score(i) })).sort((a, b) => b.s - a.s || a.k - b.k);
const pf = path.join(root, "content/pautas.json");
let doDia = null, pauta = null;
if (!id && fs.existsSync(pf)) {
  const P = JSON.parse(fs.readFileSync(pf, "utf8"));
  const dow = new Date(hoje + "T12:00:00Z").getUTCDay();
  pauta = P.find((x) => x.data === hoje) || P.find((x) => !x.data && x.dia === dow) || P.find((x) => !x.data);
  if (pauta) {
    if (!pauta.data) { pauta.data = hoje; fs.writeFileSync(pf, JSON.stringify(P, null, 1)); }
    const it = pauta.itens[fila];
    if (it && !done.has(it.id) && !falhas.includes(it.id)) doDia = it;
  }
}
const item = id ? (q[fila].find((i) => i.id === id) || (fs.existsSync(pf) && JSON.parse(fs.readFileSync(pf, "utf8")).flatMap((x) => Object.values(x.itens)).find((i) => i.id === id))) : doDia || refs[0] || (resto[0] && resto[0].i);
if (!item) { console.log(JSON.stringify({ vazia: true })); process.exit(0); }
const video = !!item.cenas;
const multi = !!(item.slides || item.imagens) && (item.slides || item.imagens).length > 1;
const dir = video && fila === "posts" ? "reels" : fila.startsWith("stories") ? "stories" : multi ? "carrosseis" : "posts";
const out = path.join(root, dir, item.id);
fs.mkdirSync(out, { recursive: true });
if (video) {
  const { makeVideo } = await import("./video.mjs");
  await makeVideo({ id: item.id, cenas: item.cenas, out: path.join(out, "video.mp4"), fim: item.fim !== false });
} else if (item.imagens) {
  item.imagens.forEach((f, k) => fs.copyFileSync(path.join(root, f), path.join(out, `slide_${String(k + 1).padStart(2, "0")}.jpg`)));
} else {
  const specFile = path.join(out, "spec.json");
  fs.writeFileSync(specFile, JSON.stringify(item.slides || [item.spec]));
  execFileSync("node", [path.join(here, "render.mjs"), specFile, out], { stdio: ["ignore", "ignore", "inherit"] });
  fs.rmSync(specFile);
}
const files = fs.readdirSync(out).filter((f) => /\.(jpg|mp4)$/.test(f)).sort();
const base = "https://raw.githubusercontent.com/gabriellaroca/aciona-posts/main/" + dir + "/" + item.id + "/";
const r = { id: item.id, tema: item.tema || null, tipo: dir, formato: video ? "video" : "imagem", legenda: item.legenda || null, ref: item.ref || null, arquivos: files.map((f) => path.join(out, f)), urls: files.map((f) => base + f) };
r.pauta = pauta ? { quadro: pauta.quadro, data: pauta.data } : null;
r.acao = video ? (dir === "reels" ? "create_video_post" : "create_story") : dir === "stories" ? "create_story" : r.urls.length > 1 ? "create_carousel_post" : "create_image_post";
if (video) {
  const cdn = "https://cdn.jsdelivr.net/gh/gabriellaroca/aciona-posts@main/" + dir + "/" + item.id + "/";
  r.video_url = cdn + "video.mp4";
  r.video_url_alt = base + "video.mp4";
  r.poster_url = base + "poster.jpg";
}
console.log(JSON.stringify(r, null, 1));
