import fs from "node:fs";
import path from "node:path";
import { root, carregar } from "./conteudo.mjs";

const [, , arq] = process.argv;
const df = path.join(root, "content/desempenho.json");
const base = fs.existsSync(df) ? JSON.parse(fs.readFileSync(df, "utf8")) : {};
if (arq) {
  const raw = JSON.parse(fs.readFileSync(arq, "utf8"));
  const rows = Array.isArray(raw) ? raw : raw.data || raw.result || [];
  const hoje = new Date().toISOString().slice(0, 10);
  for (const r of rows) if (r.media_id) base[r.media_id] = { ...(base[r.media_id] || {}), ...r, atualizado: hoje };
  fs.writeFileSync(df, JSON.stringify(base, null, 1));
}
const ctx = carregar();
const porMedia = new Map(ctx.pubs.filter((p) => p.media_id).map((p) => [String(p.media_id), p]));
const n = (x) => +x || 0;
const linhas = Object.values(base).map((m) => {
  const p = porMedia.get(String(m.media_id)) || {};
  const rec = ctx.recs.find((r) => r.id === p.id);
  const it = rec ? rec.item : {};
  const reach = n(m.media_reach);
  const pontos = n(m.media_like_count) + 2 * n(m.media_comments_count) + 3 * n(m.media_saved) + 4 * n(m.media_shares) + 3 * n(m.media_profile_visits) + 5 * n(m.media_follows);
  const foto = !!(p.foto || /"layout":"(photo|beforeafter)"/.test(JSON.stringify(it)));
  return {
    id: p.id || "?", data: m.date, tipo: m.media_product_type === "REELS" ? "reel" : m.media_type === "CAROUSEL_ALBUM" ? "carrossel" : "imagem",
    quadro: p.quadro || (rec && rec.quadro) || "sem quadro", tema: p.tema || (rec && rec.tema) || "?", capa: (p.estrutura || (rec && rec.estrutura) || "?").split(">")[0],
    foto, reach, views: n(m.media_views), pontos, taxa: reach ? pontos / reach : 0, skip: m.media_reel_skip_rate, watch: m.media_reel_avg_watch_time,
  };
});
const media = (l, f) => (l.length ? l.reduce((a, x) => a + f(x), 0) / l.length : 0);
const grupo = (chave) => {
  const g = {};
  for (const l of linhas) (g[l[chave]] = g[l[chave]] || []).push(l);
  return Object.entries(g).map(([k, l]) => ({ k, n: l.length, reach: media(l, (x) => x.reach), taxa: media(l, (x) => x.taxa) })).sort((a, b) => b.reach - a.reach);
};
const tab = (t, g) => `\n### ${t}\n| Grupo | Posts | Alcance médio | Interação por alcance |\n|---|---|---|---|\n` + g.map((x) => `| ${x.k} | ${x.n} | ${x.reach.toFixed(1)} | ${(x.taxa * 100).toFixed(1)}% |`).join("\n") + "\n";
const ord = [...linhas].sort((a, b) => b.reach - a.reach);
const reels = linhas.filter((l) => l.tipo === "reel");
const fotoS = linhas.filter((l) => l.foto), fotoN = linhas.filter((l) => !l.foto);
const conclusoes = [];
if (fotoS.length && fotoN.length) {
  const r = media(fotoS, (x) => x.reach) / Math.max(1, media(fotoN, (x) => x.reach));
  conclusoes.push(`Posts com foto real tiveram alcance médio ${r.toFixed(1)}x o dos posts só com arte (${fotoS.length} contra ${fotoN.length} posts).`);
}
if (reels.length) {
  const sk = media(reels.filter((r) => r.skip != null), (r) => r.skip);
  const w = media(reels.filter((r) => r.watch != null), (r) => r.watch) / 1000;
  conclusoes.push(`Reels: ${(sk * 100).toFixed(0)}% pulam nos 3 primeiros segundos e o tempo médio assistido é ${w.toFixed(1)} s. Meta: pulos abaixo de 50%.`);
}
const g1 = grupo("tipo");
if (g1.length > 1) conclusoes.push(`Formato com maior alcance médio: ${g1[0].k} (${g1[0].reach.toFixed(1)}).`);
let md = `Aprendizados do Instagram @aciona.portoes. Gerado por tools/desempenho.mjs em ${ctx.hoje} com ${linhas.length} publicações do feed. Leia antes de planejar.\n\n## Conclusões\n${conclusoes.map((c) => "- " + c).join("\n") || "- Ainda sem dados suficientes."}\n`;
md += `\n## Melhores por alcance\n` + ord.slice(0, 5).map((l) => `- ${l.data} ${l.id} (${l.tipo}, ${l.quadro}): alcance ${l.reach}, interação ${(l.taxa * 100).toFixed(0)}%`).join("\n") + "\n";
md += `\n## Piores por alcance\n` + ord.slice(-5).reverse().map((l) => `- ${l.data} ${l.id} (${l.tipo}, ${l.quadro}): alcance ${l.reach}`).join("\n") + "\n";
md += tab("Por formato", g1) + tab("Por quadro", grupo("quadro")) + tab("Por layout da capa", grupo("capa")) + tab("Foto real x só arte", grupo("foto"));
if (reels.length) md += `\n### Reels\n| Data | Id | Alcance | Pulam em 3 s | Assistido |\n|---|---|---|---|---|\n` + reels.map((r) => `| ${r.data} | ${r.id} | ${r.reach} | ${r.skip != null ? (r.skip * 100).toFixed(0) + "%" : "?"} | ${r.watch != null ? (r.watch / 1000).toFixed(1) + " s" : "?"} |`).join("\n") + "\n";
fs.writeFileSync(path.join(root, "content/aprendizados.md"), md);
console.log(md);
