import fs from "node:fs";
import path from "node:path";
import { root } from "./conteudo.mjs";
import { sharp } from "./lib.mjs";

const ent = path.join(root, "fotos/entrada"), pr = path.join(root, "fotos/prontas"), reg = path.join(root, "content/fotos.json");
const db = fs.existsSync(reg) ? JSON.parse(fs.readFileSync(reg, "utf8")) : {};
const usadas = JSON.stringify(JSON.parse(fs.readFileSync(path.join(root, "content/pautas.json"), "utf8"))) + JSON.stringify(JSON.parse(fs.readFileSync(path.join(root, "content/publicados.json"), "utf8")));
fs.mkdirSync(pr, { recursive: true });
const formatos = { "4x5": [1080, 864], story: [1080, 1190] };
for (const f of fs.readdirSync(ent).filter((x) => /\.(jpe?g|png|heic|webp)$/i.test(x))) {
  const nome = f.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "_");
  if (!db[nome]) {
    for (const [k, [w, h]] of Object.entries(formatos)) {
      await sharp(path.join(ent, f)).rotate().resize(w, h, { fit: "cover", position: sharp.strategy.attention })
        .modulate({ brightness: 1.04, saturation: 1.08 }).linear(1.06, -8).sharpen({ sigma: 0.9 }).jpeg({ quality: 88 }).toFile(path.join(pr, `${nome}_${k}.jpg`));
    }
    db[nome] = { original: "fotos/entrada/" + f, preparada: new Date().toISOString().slice(0, 10), "4x5": `fotos/prontas/${nome}_4x5.jpg`, story: `fotos/prontas/${nome}_story.jpg` };
  }
  db[nome].usada = usadas.includes(`fotos/prontas/${nome}_`);
}
fs.writeFileSync(reg, JSON.stringify(db, null, 1));
const livres = Object.entries(db).filter(([, v]) => !v.usada);
console.log(JSON.stringify({ livres: livres.map(([k, v]) => ({ nome: k, ...v })), total: Object.keys(db).length }, null, 1));
