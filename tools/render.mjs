import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { outline, render, warns } from "./lib.mjs";

const [, , specFile, outDir] = process.argv;
if (!specFile || !outDir) {
  console.error("uso: node render.mjs spec.json pasta_de_saida");
  process.exit(2);
}
const spec = JSON.parse(fs.readFileSync(specFile, "utf8"));
const slides = Array.isArray(spec) ? spec : spec.slides;
fs.mkdirSync(outDir, { recursive: true });
const n = slides.length;
for (let i = 0; i < n; i++) {
  const s = { ...slides[i] };
  if (n > 1) { s.i = i + 1; s.n = n; }
  const out = path.join(outDir, n > 1 ? `slide_${String(i + 1).padStart(2, "0")}.jpg` : "imagem.jpg");
  const svg = outline(render(s), path.basename(out));
  await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile(out);
  console.log(out);
}
for (const w of warns) console.error("AVISO " + w);
