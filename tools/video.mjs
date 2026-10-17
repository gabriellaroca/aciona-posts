import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { outline, render, sharp } from "./lib.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const audDir = path.join(here, "..", "content", "audio");
const FPS = 24, W = 1080, H = 1920, LEAD = 0.5, TAIL = 0.7;
const FIM = { layout: "cta", theme: "dark", lines: ["Fale com"], accent: ["a aciona."], format: "story" };

const TINT = { "#0B1F3A": ["#0F2848", "#13315A"], "#F1F3F7": ["#E8ECF3", "#E1E6EF"], "#FFFFFF": ["#F2F4F8", "#ECEFF5"], "#EE3E1E": ["#F2492B", "#E43818"] };
const inOut = (p) => { p = Math.min(1, Math.max(0, p)); return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
const num = (s, n) => { const m = new RegExp("(?:^|\\s)" + n + '="(-?[\\d.]+)"').exec(s); return m ? +m[1] : 0; };

function endOfG(s, from) {
  let d = 0;
  const re = /<g[\s>]|<\/g>/g;
  re.lastIndex = from;
  let m;
  while ((m = re.exec(s))) {
    d += m[0] === "</g>" ? -1 : 1;
    if (d === 0) return m.index + m[0].length;
  }
  return s.length;
}

function leafY(tok, oy) {
  const open = /^<(\w+)([^>]*)>/.exec(tok);
  const t = open[1], a = open[2];
  if (t === "text") return oy + num(a, "y");
  if (t === "rect") return oy + num(a, "y") + num(a, "height") / 2;
  if (t === "circle") return oy + num(a, "cy");
  if (t === "line") return oy + num(a, "y1");
  if (t === "svg") return oy + num(a, "y") + num(a, "height") / 2;
  if (t === "path") { const m = /d="M\s*(-?[\d.]+)[ ,](-?[\d.]+)/.exec(a); return oy + (m ? +m[2] : 0); }
  return oy;
}

function leaves(str, ox, oy, out) {
  const re = /<g transform="translate\((-?[\d.]+),(-?[\d.]+)\)">|<\/g>|<svg[\s\S]*?<\/svg>|<text[\s\S]*?<\/text>|<(?:rect|circle|line|path)\b[^>]*\/>/g;
  const st = [[ox, oy]];
  let m;
  while ((m = re.exec(str))) {
    const tok = m[0];
    if (tok.startsWith("<g")) {
      const x = +m[1], y = +m[2], cur = st[st.length - 1];
      if (x !== 0) {
        const end = endOfG(str, m.index);
        out.push({ s: str.slice(m.index, end), ox: cur[0], oy: cur[1], y: cur[1] + y + 220 });
        re.lastIndex = end;
      } else st.push([cur[0] + x, cur[1] + y]);
    } else if (tok === "</g>") st.pop();
    else {
      const cur = st[st.length - 1];
      out.push({ s: tok, ox: cur[0], oy: cur[1], y: leafY(tok, cur[1]) });
    }
  }
}

function prepare(spec, label) {
  const raw = render({ ...spec, format: "story" });
  const gi = raw.indexOf('<g transform="translate(0,');
  const ge = endOfG(raw, gi);
  const head = /^<svg[^>]*>/.exec(raw)[0];
  const pre = raw.slice(head.length, gi);
  let post = raw.slice(ge, raw.lastIndexOf("</svg>"));
  const barM = /<rect y="\d+" width="1080" height="14" fill="(#\w+)"\/>/.exec(post);
  post = post.replace(/<rect y="\d+" width="1080" height="14" fill="#\w+"\/>/, "");
  const g0 = /^<g transform="translate\(0,(-?[\d.]+)\)">/.exec(raw.slice(gi));
  const inner = raw.slice(gi + g0[0].length, ge - 4);
  const ls = [];
  leaves(inner, 0, +g0[1], ls);
  const groups = [];
  for (const l of ls) {
    const g = groups[groups.length - 1];
    if (g && Math.abs(l.y - g.y0) <= 50) { g.items.push(l); g.y0 = Math.min(g.y0, l.y) }
    else groups.push({ items: [l], y0: l.y });
  }
  groups.sort((a, b) => a.y0 - b.y0);
  const sprites = groups.map((g) => g.items.map((l) => `<g transform="translate(${l.ox},${l.oy})">${l.s}</g>`).join(""));
  return {
    pre: outline(pre, label + ":pre"),
    post: outline(post, label + ":post"),
    sprites: sprites.map((s, i) => outline(s, label + ":" + i)),
    bar: barM ? barM[1] : "#EE3E1E",
    bg: (/^<rect[^>]*fill="(#\w+)"/.exec(pre) || [])[1] || "#0B1F3A",
  };
}

function dur(f) {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8" });
  return parseFloat(r.stdout);
}

const ease = (p) => 1 - Math.pow(1 - Math.min(1, Math.max(0, p)), 3);

export async function makeVideo({ id, cenas, out, fim = true, label = id }) {
  const list = cenas.map((c, n) => ({ spec: c.spec, audio: c.fala ? path.join(audDir, `${id}_${n}.mp3`) : null, dur: c.dur }));
  if (fim) list.push({ spec: FIM, audio: path.join(audDir, "_fim.mp3"), last: true });
  let t0 = 0;
  const scenes = list.map((c, i) => {
    const p = prepare(c.spec, label + "#" + i);
    const ad = c.audio && fs.existsSync(c.audio) ? dur(c.audio) : 0;
    const body = ad || c.dur || 3;
    const total = LEAD + body + (i === list.length - 1 ? TAIL + 0.6 : TAIL);
    const n = p.sprites.length;
    const span = Math.max(0.3, Math.min(body * 0.75, 0.9 * (n - 1)));
    const base = i === 0 ? 0.25 : 0.5;
    const times = p.sprites.map((_, k) => base + (n > 1 ? (span * k) / (n - 1) : 0));
    const s = { ...p, audio: ad ? c.audio : null, start: t0, total, times, ad };
    t0 += total;
    return s;
  });
  const T = t0, frames = Math.ceil(T * FPS);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "aciona-v-"));
  const head = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
  const frame = (fi) => {
    const t = fi / FPS;
    let si = scenes.findIndex((s) => t < s.start + s.total);
    if (si < 0) si = scenes.length - 1;
    const sc = scenes[si], lt = t - sc.start, fade = 1;
    const tn = TINT[sc.bg] || TINT["#0B1F3A"], B_ = globalThis.BRAND_DATA;
    const wm = `<svg x="${(430 + Math.sin(t * 0.6) * 16).toFixed(1)}" y="${(990 + Math.cos(t * 0.5) * 20).toFixed(1)}" width="${(900 * (1 + 0.03 * Math.sin(t * 0.4))).toFixed(1)}" height="${(900 * (1 + 0.03 * Math.sin(t * 0.4))).toFixed(1)}" viewBox="12 12 96 96"><path d="${B_.L}" fill="${tn[0]}"/><path d="${B_.R}" fill="${tn[1]}"/></svg>`;
    let o = head + sc.pre.replace(/^<rect[^>]*\/>/, (m) => m + wm);
    sc.sprites.forEach((sp, k) => {
      const e = ease((lt - sc.times[k]) / 0.55);
      if (e <= 0) return;
      o += `<g opacity="${(e * fade).toFixed(3)}" transform="translate(0,${((1 - e) * 46).toFixed(1)})">${sp}</g>`;
    });
    o += sc.post;
    for (let k = 0; k < scenes.length - 1; k++) {
      const b = scenes[k].start + scenes[k].total, WD = 0.32;
      let x = null;
      if (t >= b - WD && t < b) x = W * (1 - inOut((t - (b - WD)) / WD));
      else if (t >= b && t < b + WD) x = -W * inOut((t - b) / WD);
      if (x !== null) o += `<rect x="${x.toFixed(1)}" y="0" width="${W}" height="${H}" fill="#EE3E1E"/>`;
    }
    o += `<rect y="${H - 14}" width="${(W * Math.min(1, t / (T - 0.6))).toFixed(1)}" height="14" fill="${sc.bar}"/></svg>`;
    return o;
  };
  const B = 6;
  for (let a = 0; a < frames; a += B) {
    await Promise.all(Array.from({ length: Math.min(B, frames - a) }, (_, j) =>
      sharp(Buffer.from(frame(a + j))).jpeg({ quality: 90 }).toFile(path.join(tmp, String(a + j + 1).padStart(5, "0") + ".jpg"))));
  }
  const inputs = ["-i", path.join(audDir, "_bed.mp3"), "-i", path.join(audDir, "_tick.mp3")];
  const fc = [];
  const mix = [];
  fc.push(`[2:a]aformat=sample_rates=44100:channel_layouts=stereo[tk]`);
  const ticks = scenes.flatMap((s) => s.times.map((x) => Math.round((s.start + x) * 1000)));
  fc.push(`[tk]asplit=${ticks.length}${ticks.map((_, i) => `[t${i}]`).join("")}`);
  ticks.forEach((ms, i) => { fc.push(`[t${i}]adelay=${ms}|${ms},volume=0.5[x${i}]`); mix.push(`[x${i}]`); });
  let ai = 3;
  scenes.forEach((s) => {
    if (!s.audio) return;
    inputs.push("-i", s.audio);
    const ms = Math.round((s.start + LEAD) * 1000);
    fc.push(`[${ai}:a]aformat=sample_rates=44100:channel_layouts=stereo,adelay=${ms}|${ms}[n${ai}]`);
    mix.push(`[n${ai}]`);
    ai++;
  });
  fc.push(`[1:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=0.11,afade=t=in:d=0.6[bd]`);
  fc.push(`[bd]${mix.join("")}amix=inputs=${mix.length + 1}:normalize=0:dropout_transition=0,atrim=0:${T.toFixed(2)},afade=t=out:st=${(T - 1).toFixed(2)}:d=1,alimiter=limit=0.95[aout]`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const args = ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(tmp, "%05d.jpg"), ...inputs,
    "-filter_complex", fc.join(";"), "-map", "0:v", "-map", "[aout]", "-c:v", "libx264", "-preset", "medium", "-crf", "21",
    "-pix_fmt", "yuv420p", "-r", String(FPS), "-movflags", "+faststart", "-c:a", "aac", "-b:a", "128k", "-t", T.toFixed(2), out];
  const r = spawnSync("ffmpeg", args, { stdio: ["ignore", "inherit", "inherit"] });
  if (r.status !== 0) throw new Error("ffmpeg falhou");
  fs.copyFileSync(path.join(tmp, String(frames).padStart(5, "0") + ".jpg"), path.join(path.dirname(out), "poster.jpg"));
  fs.rmSync(tmp, { recursive: true, force: true });
  return { duracao: +T.toFixed(1), quadros: frames };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [, , specFile, out] = process.argv;
  const it = JSON.parse(fs.readFileSync(specFile, "utf8"));
  const r = await makeVideo({ id: it.id, cenas: it.cenas, out, fim: it.fim !== false });
  console.log(JSON.stringify(r));
}
