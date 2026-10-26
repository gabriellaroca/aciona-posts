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
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const CAP_Y = 1450, CAP_SZ = 56, VBOT = 640;

function legendas(frases, off, bg) {
  const escuro = bg === "#0B1F3A" || bg === "#EE3E1E";
  const box = escuro ? "#FFFFFF" : "#0B1F3A", cor = escuro ? "#0B1F3A" : "#FFFFFF";
  const out = [];
  for (const f of frases) {
    const ws = f.texto.split(/\s+/), ch = [];
    let cur = [];
    for (const w of ws) {
      if (cur.length && (cur.join(" ").length + w.length > 20 || cur.length >= 4)) { ch.push(cur.join(" ")); cur = []; }
      cur.push(w);
    }
    if (cur.length) ch.push(cur.join(" "));
    const tot = ch.reduce((a, c) => a + c.length + 2, 0);
    let t = f.t0;
    for (const c of ch) {
      const d = ((f.t1 - f.t0) * (c.length + 2)) / tot;
      const w = globalThis.Aciona.E.measure("Outfit SemiBold", CAP_SZ, c) + 64;
      const svg = outline(`<rect x="${(540 - w / 2).toFixed(1)}" y="${CAP_Y - 48}" width="${w.toFixed(1)}" height="92" rx="24" fill="${box}"/><text x="540" y="${CAP_Y + 19}" font-family="Outfit SemiBold" font-size="${CAP_SZ}" fill="${cor}" text-anchor="middle">${c.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>`, "legenda");
      out.push({ t0: off + t, t1: off + t + d, svg });
      t += d;
    }
    out[out.length - 1].t1 += 0.25;
  }
  return out;
}

export async function makeVideo({ id, cenas, out, fim = false, label = id }) {
  const list = cenas.map((c, n) => ({ spec: c.spec, audio: c.fala ? path.join(audDir, `${id}_${n}.mp3`) : null, tm: c.fala ? path.join(audDir, `${id}_${n}.json`) : null, dur: c.dur }));
  if (fim) list.push({ spec: FIM, audio: path.join(audDir, "_fim.mp3"), tm: path.join(audDir, "_fim.json") });
  let t0 = 0;
  const caps = [];
  const scenes = list.map((c, i) => {
    const p = prepare({ ...c.spec, bot: c.spec.bot || VBOT }, label + "#" + i);
    const ad = c.audio && fs.existsSync(c.audio) ? dur(c.audio) : 0;
    const fr = c.tm && fs.existsSync(c.tm) ? JSON.parse(fs.readFileSync(c.tm, "utf8")).frases : [];
    const lead = i === 0 ? 0.12 : 0.38;
    const body = ad || c.dur || 3;
    const total = lead + body + (i === list.length - 1 ? 1.1 : 0.45);
    const n = p.sprites.length;
    const starts = fr.length ? fr.map((f) => lead + f.t0) : [lead];
    const balde = (k) => Math.min(starts.length - 1, Math.floor((k * starts.length) / n));
    const times = p.sprites.map((_, k) => {
      if (i === 0 && k < 4) return -1;
      let j = k;
      while (j > 0 && balde(j - 1) === balde(k)) j--;
      return starts[balde(k)] + 0.12 * (k - j);
    });
    caps.push(...legendas(fr, t0 + lead, p.bg));
    const s = { ...p, audio: ad ? c.audio : null, start: t0, total, times, lead };
    t0 += total;
    return s;
  });
  const T = t0, frames = Math.ceil(T * FPS);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "aciona-v-"));
  const head = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
  const frame = (fi, comLegenda = true) => {
    const t = fi / FPS;
    let si = scenes.findIndex((s) => t < s.start + s.total);
    if (si < 0) si = scenes.length - 1;
    const sc = scenes[si], lt = t - sc.start;
    const tn = TINT[sc.bg] || TINT["#0B1F3A"], B_ = globalThis.BRAND_DATA;
    const wm = `<svg x="${(430 + Math.sin(t * 0.6) * 16).toFixed(1)}" y="${(990 + Math.cos(t * 0.5) * 20).toFixed(1)}" width="${(900 * (1 + 0.03 * Math.sin(t * 0.4))).toFixed(1)}" height="${(900 * (1 + 0.03 * Math.sin(t * 0.4))).toFixed(1)}" viewBox="12 12 96 96"><path d="${B_.L}" fill="${tn[0]}"/><path d="${B_.R}" fill="${tn[1]}"/></svg>`;
    let o = head + sc.pre.replace(/^<rect[^>]*\/>/, (m) => m + wm);
    sc.sprites.forEach((sp, k) => {
      const e = ease((lt - sc.times[k]) / 0.45);
      if (e <= 0) return;
      o += `<g opacity="${e.toFixed(3)}" transform="translate(0,${((1 - e) * 40).toFixed(1)})">${sp}</g>`;
    });
    o += sc.post;
    if (comLegenda) {
      const c = caps.find((x) => t >= x.t0 && t < x.t1);
      if (c) {
        const k = Math.min(1, (t - c.t0) / 0.1), sc2 = 0.9 + 0.1 * k;
        o += `<g opacity="${(0.4 + 0.6 * k).toFixed(2)}" transform="translate(540,${CAP_Y}) scale(${sc2.toFixed(3)}) translate(-540,-${CAP_Y})">${c.svg}</g>`;
      }
    }
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
  const camas = [1, 2, 3, 4].map((k) => path.join(audDir, `_bed${k}.mp3`)).filter((f) => fs.existsSync(f));
  const cama = camas.length ? camas[hash(id) % camas.length] : path.join(audDir, "_bed.mp3");
  const whoosh = path.join(audDir, "_whoosh.mp3");
  const inputs = ["-i", cama];
  const fc = [], vozes = [];
  let ai = 2;
  scenes.forEach((s) => {
    if (!s.audio) return;
    inputs.push("-i", s.audio);
    const ms = Math.round((s.start + s.lead) * 1000);
    fc.push(`[${ai}:a]aformat=sample_rates=44100:channel_layouts=stereo,adelay=${ms}|${ms}[n${ai}]`);
    vozes.push(`[n${ai}]`);
    ai++;
  });
  const sfx = [];
  if (fs.existsSync(whoosh) && scenes.length > 1) {
    inputs.push("-i", whoosh);
    const wi = ai++;
    const bs = scenes.slice(0, -1).map((s) => Math.round((s.start + s.total - 0.34) * 1000));
    fc.push(`[${wi}:a]aformat=sample_rates=44100:channel_layouts=stereo,asplit=${bs.length}${bs.map((_, i) => `[w${i}]`).join("")}`);
    bs.forEach((ms, i) => { fc.push(`[w${i}]adelay=${ms}|${ms},volume=0.35[ww${i}]`); sfx.push(`[ww${i}]`); });
  }
  if (vozes.length) {
    fc.push(vozes.length === 1 ? `${vozes[0]}asplit=2[voz][chave]` : `${vozes.join("")}amix=inputs=${vozes.length}:normalize=0:dropout_transition=0,asplit=2[voz][chave]`);
    fc.push(`[1:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=0.32,afade=t=in:d=0.4[cm]`);
    fc.push(`[cm][chave]sidechaincompress=threshold=0.02:ratio=10:attack=15:release=350[bd]`);
    fc.push(`[bd][voz]${sfx.join("")}amix=inputs=${2 + sfx.length}:normalize=0:dropout_transition=0,atrim=0:${T.toFixed(2)},afade=t=out:st=${(T - 1).toFixed(2)}:d=1,loudnorm=I=-14:TP=-1.5:LRA=9[aout]`);
  } else {
    fc.push(`[1:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=0.4${sfx.length ? "[cm];[cm]" + sfx.join("") + "amix=inputs=" + (1 + sfx.length) + ":normalize=0" : ""},atrim=0:${T.toFixed(2)},afade=t=out:st=${(T - 1).toFixed(2)}:d=1[aout]`);
  }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const args = ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(tmp, "%05d.jpg"), ...inputs,
    "-filter_complex", fc.join(";"), "-map", "0:v", "-map", "[aout]", "-c:v", "libx264", "-preset", "medium", "-crf", "20",
    "-pix_fmt", "yuv420p", "-r", String(FPS), "-movflags", "+faststart", "-c:a", "aac", "-b:a", "160k", "-ar", "44100", "-t", T.toFixed(2), out];
  const r = spawnSync("ffmpeg", args, { stdio: ["ignore", "inherit", "inherit"] });
  if (r.status !== 0) throw new Error("ffmpeg falhou");
  const pf = Math.max(0, Math.round((scenes[0].start + scenes[0].total - 0.4) * FPS));
  await sharp(Buffer.from(frame(pf, false))).jpeg({ quality: 92 }).toFile(path.join(path.dirname(out), "poster.jpg"));
  fs.rmSync(tmp, { recursive: true, force: true });
  return { duracao: +T.toFixed(1), quadros: frames, legendas: caps.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [, , specFile, out] = process.argv;
  const it = JSON.parse(fs.readFileSync(specFile, "utf8"));
  const r = await makeVideo({ id: it.id, cenas: it.cenas, out, fim: !!it.fim });
  console.log(JSON.stringify(r));
}
