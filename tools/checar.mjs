import { carregar, checar } from "./conteudo.mjs";

const arg = process.argv[2];
const ctx = carregar();
let alvos;
if (!arg || arg === "--planejado") alvos = ctx.recs.filter((r) => !r.publicado && r.data && r.data >= ctx.hoje && !r.pauta.startsWith("fila:"));
else alvos = ctx.recs.filter((r) => r.id === arg);
if (!alvos.length) { console.error("nada para checar: " + (arg || "--planejado")); process.exit(2); }
const res = alvos.map((a) => checar(a, ctx));
for (const r of res) console.log(`${r.ok ? "OK  " : "ERRO"} ${r.data} ${r.id}${r.erros.map((e) => "\n     - " + e).join("")}${r.avisos.map((e) => "\n     ~ " + e).join("")}`);
process.exit(res.every((r) => r.ok) ? 0 : 1);
