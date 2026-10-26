import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const rd = (f, d) => (fs.existsSync(path.join(root, f)) ? JSON.parse(fs.readFileSync(path.join(root, f), "utf8")) : d);
export const hojeBR = () => process.env.HOJE || new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
const addDias = (d, n) => new Date(Date.parse(d + "T12:00:00Z") + n * 864e5).toISOString().slice(0, 10);
export const diffDias = (a, b) => Math.abs(Date.parse(a) - Date.parse(b)) / 864e5;

const STOP = new Set("para pela pelo pelos pelas com sem que uma uns umas dos das nos nas aos como mais menos muito muita seu sua seus suas nao sim isso esse essa este esta aqui ali voce voces gente tem ter ser sao foi vai vem bem tudo todo toda quando onde qual quais quem porque pra pro tambem entre sobre depois antes ainda so ja ate cada mesmo mesma outro outra nosso nossa aciona portao portoes".split(" "));
export const palavras = (t) =>
  String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((w) => w.length >= 3 && !STOP.has(w));
export const jaccard = (a, b) => {
  const A = new Set(palavras(a)), B = new Set(palavras(b));
  if (!A.size || !B.size) return 0;
  let i = 0;
  for (const x of A) if (B.has(x)) i++;
  return i / (A.size + B.size - i);
};

const SKIP = new Set(["layout", "theme", "format", "img", "img1", "img2", "w", "fonte", "ph", "bot", "size", "bigSize", "footer", "cue"]);
function textos(o, out = []) {
  if (typeof o === "string") out.push(o);
  else if (Array.isArray(o)) o.forEach((x) => textos(x, out));
  else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) if (!SKIP.has(k)) textos(v, out);
  return out;
}
export const specs = (it) => (it.slides || (it.cenas ? it.cenas.map((c) => c.spec) : it.spec ? [it.spec] : []));
export const falas = (it) => (it.cenas || []).map((c) => c.fala || "").filter(Boolean);
export const legendaLimpa = (l) => String(l || "").split("\n").filter((x) => !/^#|WhatsApp|99634/.test(x.trim())).join(" ");
export const textoItem = (it) => [...textos(specs(it)), legendaLimpa(it.legenda), ...falas(it)].join(" ");
export const ganchoDe = (it) => {
  if (it.gancho) return it.gancho;
  const s = specs(it)[0] || {};
  return [...[].concat(s.lines || []), ...[].concat(s.accent || []), s.title || "", s.big || ""].join(" ").trim();
};
export const estrutura = (it) => (it.imagens ? "imagens" : specs(it).map((s) => s.layout).join(">") + (it.cenas ? "|video" : ""));
export const feed = (fila) => fila === "carrosseis" || fila === "posts";

export function carregar() {
  const fila = rd("content/fila.json", {});
  const P = rd("content/pautas.json", []);
  const pubs = rd("content/publicados.json", []);
  const banco = rd("content/banco.json", []);
  const hoje = hojeBR();
  const pubPor = new Map(pubs.map((p) => [p.id, p]));
  const taken = new Set(P.filter((p) => p.data).map((p) => p.data));
  const start = taken.has(hoje) ? addDias(hoje, 1) : hoje;
  for (let k = 0, d = start; k < 120; k++, d = addDias(d, 1)) {
    if (taken.has(d)) continue;
    const dow = new Date(d + "T12:00:00Z").getUTCDay();
    const p = P.find((x) => !x.data && !x._prev && x.dia === dow);
    if (p) { p._prev = d; taken.add(d); }
  }
  const recs = [];
  const add = (it, slot, pauta) => {
    const pub = pubPor.get(it.id);
    const data = pub ? pub.data : pauta ? pauta.data || pauta._prev || null : null;
    recs.push({
      id: it.id, slot, item: it, pauta: pauta ? pauta.id || "pauta" + P.indexOf(pauta) : "fila:" + it.id,
      quadro: pauta ? pauta.quadro : null, data, publicado: !!pub,
      tema: it.tema || (it.ref ? null : pauta && pauta.tema) || null,
      ideia: it.ideia || (pauta && pauta.ideia) || null,
      gancho: ganchoDe(it), cta: it.cta || null, fatos: it.fatos || [], recap: !!(it.recap || (pauta && pauta.recap)),
      estrutura: estrutura(it), texto: textoItem(it), feed: feed(slot),
    });
  };
  for (const p of P) for (const [slot, it] of Object.entries(p.itens || {})) add(it, slot, p);
  const vistos = new Set(recs.map((r) => r.id));
  for (const [slot, l] of Object.entries(fila)) for (const it of l) if (!vistos.has(it.id)) add(it, slot, null);
  return { fila, P, pubs, banco, hoje, recs };
}

const PROIBIDAS = ["no mundo de hoje", "nos dias de hoje", "fique ligado", "não perca", "garanta já", "garanta o seu", "imperdível", "revolucionário", "incrível", "tudo o que você precisa saber", "descubra agora", "clique no link", "entre em contato conosco", "confira!", "venha conferir", "solução completa", "qualidade e confiança", "seu portão merece", "não deixe para depois", "mais do que nunca", "vale lembrar que", "é importante ressaltar", "em suma", "além disso,", "sendo assim"];
const NUM = /(\d+([.,]\d+)?\s?(%|mil\b|milh|bilh|kg|kgf|km|anos\b|N\b|ciclos|rpm|µF|MHz|mW|m\/min|TB|GB|segundos|\bs\b|toneladas|metros|\bm\b|graus|°C))|\b(1[0-9]{3}|20[0-9]{2})\b/i;

export function checar(alvo, ctx, { data } = {}) {
  const erros = [], avisos = [];
  const d = data || alvo.data || ctx.hoje;
  const it = alvo.item;
  const txt = alvo.texto;
  if (!it.ref) {
    if (!alvo.tema) erros.push("falta `tema`");
    if (alvo.feed && !alvo.ideia) erros.push("falta `ideia` (a frase que resume o ângulo do post)");
    if (alvo.feed && !(alvo.cta && alvo.cta.tipo)) erros.push("falta `cta.tipo` (salvar, compartilhar, comentar, mensagem, whatsapp, perfil)");
  }
  const g = alvo.gancho.split(/\s+/).filter(Boolean).length;
  if (!it.ref && g > 8) erros.push(`gancho com ${g} palavras (máx. 8): "${alvo.gancho}"`);
  const low = (txt + " " + (it.legenda || "")).toLowerCase();
  for (const p of PROIBIDAS) if (low.includes(p)) erros.push(`frase gasta/artificial: "${p}"`);
  for (const f of [it.legenda || "", ...falas(it)]) if (/[—–]/.test(f)) erros.push("travessão (—) na legenda ou na fala: soa artificial, reescreva");
  if (alvo.feed) {
    const tags = (String(it.legenda || "").match(/#\w+/g) || []).length;
    if (tags < 3 || tags > 5) erros.push(`legenda com ${tags} hashtags (use 3 a 5)`);
    if (!/99634-1354/.test(it.legenda || "")) erros.push("legenda sem o WhatsApp (16) 99634-1354");
    const l1 = String(it.legenda || "").split("\n")[0];
    if (l1.length > 125) avisos.push("primeira linha da legenda passa de 125 caracteres e será cortada no feed");
  }
  const temFonte = alvo.fatos.length || specs(it).some((s) => s.fonte);
  if (NUM.test(txt.replace(/99634-1354|\(16\)/g, "")) && !temFonte) erros.push("número, data ou medida sem `fatos` do banco ou `fonte` na arte");
  for (const f of alvo.fatos) {
    const b = ctx.banco.find((x) => x.id === f);
    if (!b) erros.push(`fato "${f}" não existe em content/banco.json`);
    else if (!b.verificado) erros.push(`fato "${f}" ainda não foi verificado na fonte`);
  }
  const fl = falas(it);
  if (fl.length) {
    const frases = fl.join(" ").split(/(?<=[.!?…])\s+/).filter(Boolean);
    const total = fl.join(" ").split(/\s+/).length;
    if (frases[0] && frases[0].split(/\s+/).length > 12) erros.push(`primeira frase falada longa demais (máx. 12 palavras): "${frases[0]}"`);
    for (const fr of frases) if (fr.split(/\s+/).length > 20) erros.push(`frase falada com mais de 20 palavras: "${fr.slice(0, 60)}…"`);
    if (/[;()]/.test(fl.join(" "))) erros.push("fala com ponto e vírgula ou parênteses: escreva como se fala");
    const lim = alvo.slot === "posts" ? 110 : 70;
    if (total > lim) erros.push(`roteiro com ${total} palavras (máx. ${lim}): corte`);
  }
  const janela = ctx.recs.filter((r) => r.id !== alvo.id && r.pauta !== alvo.pauta && r.data && diffDias(r.data, d) <= 30);
  for (const r of janela) {
    const onde = `${r.id} (${r.data}${r.publicado ? ", publicado" : ", planejado"})`;
    if (alvo.tema && r.tema && alvo.tema === r.tema) erros.push(`tema "${alvo.tema}" repetido em ${onde}`);
    if (alvo.ideia && r.ideia && jaccard(alvo.ideia, r.ideia) >= 0.45) erros.push(`ideia parecida com ${onde}`);
    if (!it.ref && !r.item.ref && jaccard(alvo.gancho, r.gancho) >= 0.5) erros.push(`gancho parecido com ${onde}: "${r.gancho}"`);
    if (jaccard(alvo.texto, r.texto) >= 0.42) erros.push(`texto parecido com ${onde}`);
    if (!alvo.recap && !r.recap) for (const f of alvo.fatos) if (r.fatos.includes(f)) erros.push(`fato "${f}" já usado em ${onde}`);
    if (alvo.slot === "carrosseis" && r.slot === "carrosseis" && alvo.estrutura === r.estrutura) erros.push(`mesma estrutura de slides de ${onde}`);
    if (alvo.feed && r.feed && alvo.cta && r.cta && alvo.cta.texto && r.cta.texto && jaccard(alvo.cta.texto, r.cta.texto) >= 0.6) erros.push(`chamada repetida de ${onde}`);
  }
  if (alvo.feed && alvo.cta && alvo.cta.tipo) {
    const ant = ctx.recs.filter((r) => r.feed && r.data && r.data < d && r.cta && r.cta.tipo).sort((a, b) => (a.data < b.data ? 1 : -1)).slice(0, 2);
    if (ant.length === 2 && ant.every((r) => r.cta.tipo === alvo.cta.tipo)) erros.push(`chamada do tipo "${alvo.cta.tipo}" nos dois últimos posts: varie`);
  }
  if (alvo.slot === "posts" && !it.cenas) {
    const ult = ctx.recs.filter((r) => r.slot === "posts" && r.publicado && !r.item.cenas).sort((a, b) => (a.data < b.data ? 1 : -1)).slice(0, 3);
    if (ult.some((r) => r.estrutura === alvo.estrutura)) avisos.push(`layout "${alvo.estrutura}" usado num dos 3 últimos posts únicos`);
  }
  return { id: alvo.id, data: d, ok: !erros.length, erros: [...new Set(erros)], avisos };
}

export function historicoMd(ctx, mes) {
  const linhas = ctx.recs.filter((r) => r.data && r.data.startsWith(mes)).sort((a, b) => (a.data + a.slot < b.data + b.slot ? -1 : 1));
  const esc = (s) => String(s || "").replace(/\|/g, "/").replace(/\n/g, " ");
  let o = `Histórico de ${mes} (publicado e planejado). Gerado por tools/registrar.mjs; não edite à mão.\n\n| Data | Horário | Status | Quadro | Tema | Ideia | Gancho | Chamada | Estrutura | Fatos |\n|---|---|---|---|---|---|---|---|---|---|\n`;
  for (const r of linhas) o += `| ${r.data} | ${r.slot} | ${r.publicado ? "publicado" : "planejado"} | ${esc(r.quadro)} | ${esc(r.tema)} | ${esc(r.ideia)} | ${esc(r.gancho)} | ${esc(r.cta && (r.cta.tipo + ": " + (r.cta.texto || "")))} | ${esc(r.estrutura)} | ${esc(r.fatos.join(", "))} |\n`;
  return o;
}
