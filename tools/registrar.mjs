import fs from "node:fs";
import path from "node:path";
import { carregar, historicoMd, root } from "./conteudo.mjs";

const [, , id, media, extra] = process.argv;
if (!id || !media) { console.error("uso: node tools/registrar.mjs <id> <media_id>"); process.exit(2); }
const ctx = carregar();
const r = ctx.recs.find((x) => x.id === id);
if (!r) { console.error("id não encontrado: " + id); process.exit(2); }
if (ctx.pubs.some((p) => p.id === id)) { console.error("já registrado: " + id); process.exit(2); }
const hora = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }).format(new Date());
const dir = r.item.cenas && r.slot === "posts" ? "reels" : r.slot.startsWith("stories") ? "stories" : (r.item.slides || r.item.imagens || []).length > 1 ? "carrosseis" : "posts";
ctx.pubs.push({ id, tipo: dir, fila: r.slot, quadro: r.quadro, tema: r.tema, ideia: r.ideia, gancho: r.gancho, cta: r.cta, fatos: r.fatos, estrutura: r.estrutura, data: ctx.hoje, hora, media_id: media, ...(extra ? { obs: extra } : {}) });
fs.writeFileSync(path.join(root, "content/publicados.json"), JSON.stringify(ctx.pubs, null, 1));
const mes = ctx.hoje.slice(0, 7);
fs.mkdirSync(path.join(root, "content/historico"), { recursive: true });
fs.writeFileSync(path.join(root, `content/historico/${mes}.md`), historicoMd(carregar(), mes));
console.log(`registrado ${id} (${media}); histórico content/historico/${mes}.md atualizado`);
