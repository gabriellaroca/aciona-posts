import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
globalThis.BRAND_DATA = JSON.parse(fs.readFileSync(path.join(here, "brand_data.json"), "utf8"));
require("./layout.js");

const load = (f) => {
  const b = fs.readFileSync(path.join(here, "fonts", f));
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};
const F = {
  "Outfit": load("Outfit-400.ttf"),
  "Outfit Medium": load("Outfit-500.ttf"),
  "Outfit SemiBold": load("Outfit-600.ttf"),
};
const adv = (fam, size, t) => {
  const o = F[fam];
  let w = 0;
  for (const c of t) w += o.charToGlyph(c).advanceWidth;
  return (w * size) / o.unitsPerEm;
};
Aciona.E.measure = adv;

export const warns = [];
export function outline(svg, label) {
  const vb = /viewBox="0 0 (\d+) (\d+)"/.exec(svg);
  const W = vb ? +vb[1] : 1080;
  return svg.replace(/<text ([^>]*)>([^<]*)<\/text>/g, (m, attrs, raw) => {
    const g = (n) => {
      const r = new RegExp("(?:^|\\s)" + n + '="([^"]*)"').exec(attrs);
      return r ? r[1] : null;
    };
    const x = +g("x"), y = +g("y"), fs = +g("font-size");
    const fam = g("font-family"), fill = g("fill");
    const an = g("text-anchor") || "start";
    const ls = +(g("letter-spacing") || 0);
    const t = raw.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    const o = F[fam];
    const sc = fs / o.unitsPerEm;
    const steps = [];
    let w = 0;
    for (const c of t) {
      const a = o.charToGlyph(c).advanceWidth * sc + ls;
      steps.push(a);
      w += a;
    }
    let cx = an === "middle" ? x - w / 2 : an === "end" ? x - w : x;
    if (cx < 60 || cx + w > W - 60) warns.push(`${label}: texto fora da margem: "${t.slice(0, 40)}"`);
    let d = "";
    let i = 0;
    for (const c of t) {
      d += o.charToGlyph(c).getPath(cx, y, fs).toPathData(2);
      cx += steps[i++];
    }
    return `<path d="${d}" fill="${fill}"/>`;
  });
}

export const render = (s) => Aciona.render(s);
export { sharp };
