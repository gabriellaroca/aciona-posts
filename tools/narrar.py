import glob, hashlib, json, os, re, subprocess, sys, tempfile
import numpy as np
import soundfile as sf

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
aud = os.path.join(root, "content", "audio")
vozes = os.path.join(root, "content", "vozes")
os.makedirs(aud, exist_ok=True)
force = "--force" in sys.argv
mdl = os.environ.get("KOKORO_DIR", ".")
VOZ = os.environ.get("VOZ", "pf_dora")
SR = 44100
VERSAO = "3"
CADEIA = "highpass=f=70,equalizer=f=220:t=q:w=1:g=-1.5,equalizer=f=3400:t=q:w=1.2:g=2.5,acompressor=threshold=-20dB:ratio=3:attack=5:release=90,loudnorm=I=-16:TP=-1.5:LRA=7"
PAUSA = {".": 0.30, "!": 0.27, "?": 0.42, "…": 0.55}


def ffmpeg(*a):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *a], check=True)


def wav(y, sr=SR):
    f = tempfile.mktemp(suffix=".wav")
    sf.write(f, y, sr)
    return f


def semente(*s):
    return int(hashlib.md5("|".join(s).encode()).hexdigest()[:8], 16)


def frases(t):
    return [x.strip() for x in re.split(r"(?<=[.!?…])\s+", t.strip()) if x.strip()]


def aparar(y, lim=0.012):
    i = np.where(np.abs(y) > lim)[0]
    if not len(i):
        return y
    return y[max(0, i[0] - 600): min(len(y), i[-1] + 900)]


def pluck(f, n, sr):
    t = np.arange(n) / sr
    y = sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (4 + h * 1.8)) / h for h in range(1, 7))
    return y * np.minimum(1, t / 0.004)


def beds():
    progs = [([57, 52, 54, 50], 100), ([60, 55, 57, 53], 104), ([55, 50, 52, 48], 96), ([62, 57, 59, 55], 108)]
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    for k, (raiz, bpm) in enumerate(progs, 1):
        out = os.path.join(aud, f"_bed{k}.mp3")
        if os.path.exists(out) and not force:
            continue
        rng = np.random.default_rng(k)
        dur, beat = 75, 60 / bpm
        y = np.zeros(int(SR * dur))
        tri = lambda r, maior: [r, r + (4 if maior else 3), r + 7, r + 12]
        maiores = [True, True, False, True]
        bar = 4 * beat
        nb = int(dur / bar)
        for b in range(nb):
            ci = b % 4
            notas = tri(raiz[ci], maiores[ci])
            t0 = b * bar
            for e in range(8):
                f = hz(notas[[0, 2, 1, 3, 2, 1, 3, 2][e]])
                i = int((t0 + e * beat / 2) * SR)
                n = int(0.9 * SR)
                seg = pluck(f, n, SR) * (0.16 if e % 2 == 0 else 0.11)
                y[i:i + n] += seg[: len(y) - i]
            for half in (0, 2):
                i = int((t0 + half * beat) * SR)
                n = int(1.6 * beat * SR)
                t = np.arange(n) / SR
                bs = np.sin(2 * np.pi * hz(raiz[ci] - 12) * t) * np.exp(-t * 2.2) * np.minimum(1, t / 0.02) * 0.22
                y[i:i + n] += bs[: len(y) - i]
            for q in range(4):
                i = int((t0 + q * beat) * SR)
                if q in (0, 2):
                    n = int(0.25 * SR)
                    t = np.arange(n) / SR
                    kk = np.sin(2 * np.pi * (45 + 60 * np.exp(-t * 30)) * t) * np.exp(-t * 14) * 0.28
                    y[i:i + n] += kk[: len(y) - i]
                j = int((t0 + q * beat + beat / 2) * SR)
                n = int(0.05 * SR)
                hh = np.diff(rng.standard_normal(n + 1)) * np.exp(-np.arange(n) / SR * 90) * 0.025
                y[j:j + n] += hh[: len(y) - j]
        y /= np.max(np.abs(y)) + 1e-9
        fade = int(SR * 1.5)
        y[:fade] *= np.linspace(0, 1, fade)
        y[-fade:] *= np.linspace(1, 0, fade)
        ffmpeg("-i", wav(np.stack([y, y * 0.96], 1)), "-af", "lowpass=f=9000,loudnorm=I=-20:TP=-2", "-ar", str(SR), "-b:a", "160k", out)
    w = os.path.join(aud, "_whoosh.mp3")
    if force or not os.path.exists(w):
        n = int(SR * 0.45)
        t = np.arange(n) / SR
        env = np.where(t < 0.3, (t / 0.3) ** 2, np.exp(-(t - 0.3) * 30))
        y = np.random.default_rng(7).standard_normal(n) * env * 0.5
        ffmpeg("-i", wav(np.stack([y, y], 1)), "-af", "highpass=f=500,lowpass=f=5000,volume=0.8", "-ar", str(SR), "-b:a", "128k", w)


def cenas():
    out = {"_fim": "Fala com a aciona."}
    fontes = []
    q = json.load(open(os.path.join(root, "content", "fila.json")))
    for l in q.values():
        fontes += l
    pf = os.path.join(root, "content", "pautas.json")
    if os.path.exists(pf):
        for p in json.load(open(pf)):
            fontes += list(p.get("itens", {}).values())
    vozes_item = {}
    for it in fontes:
        for n, c in enumerate(it.get("cenas", [])):
            if c.get("fala"):
                out[f"{it['id']}_{n}"] = c["fala"]
                vozes_item[f"{it['id']}_{n}"] = it.get("voz", VOZ)
    return out, vozes_item


def humano(nome, fala):
    achados = [f for f in glob.glob(os.path.join(vozes, nome + ".*"))]
    if not achados:
        return None
    src = achados[0]
    mp3 = os.path.join(aud, nome + ".mp3")
    ffmpeg("-i", src, "-af", "afftdn=nf=-25," + CADEIA + ",silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=-1:stop_threshold=-45dB:stop_duration=0.6", "-ac", "1", "-ar", str(SR), "-b:a", "160k", mp3)
    r = subprocess.run(["ffmpeg", "-i", mp3, "-af", "silencedetect=n=-38dB:d=0.18", "-f", "null", "-"], capture_output=True, text=True)
    total = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp3], capture_output=True, text=True).stdout)
    fr = frases(fala)
    pesos = [len(x) + 8 for x in fr]
    acc, tm = 0, []
    for x, p in zip(fr, pesos):
        a = acc / sum(pesos) * total
        acc += p
        tm.append({"t0": round(a, 3), "t1": round(acc / sum(pesos) * total, 3), "texto": x})
    return {"frases": tm, "humano": True}


def main():
    beds()
    todo, vz = cenas()
    k = None
    for nome, fala in todo.items():
        voz = vz.get(nome, VOZ)
        h = hashlib.md5((VERSAO + voz + fala).encode()).hexdigest()
        js = os.path.join(aud, nome + ".json")
        hv = glob.glob(os.path.join(vozes, nome + ".*"))
        if not force and os.path.exists(js) and os.path.exists(os.path.join(aud, nome + ".mp3")):
            old = json.load(open(js))
            if old.get("hash") == h and old.get("humano", False) == bool(hv):
                continue
        hum = humano(nome, fala)
        if hum:
            hum["hash"] = h
            json.dump(hum, open(js, "w"), ensure_ascii=False, indent=1)
            print(nome, "voz humana")
            continue
        if k is None:
            from kokoro_onnx import Kokoro
            k = Kokoro(os.path.join(mdl, "kokoro-v1.0.onnx"), os.path.join(mdl, "voices-v1.0.bin"))
        partes, tm, t = [], [], 0.06
        partes.append(np.zeros(int(0.06 * 24000)))
        fr = frases(fala)
        for i, x in enumerate(fr):
            rng = np.random.default_rng(semente(nome, str(i)))
            vel = 1.04 if i == 0 else float(rng.uniform(0.97, 1.05))
            if x.endswith("?"):
                vel = min(vel + 0.02, 1.07)
            s, sr = k.create(x, voice=voz, speed=vel, lang="pt-br")
            s = aparar(np.asarray(s, dtype=np.float32))
            d = len(s) / sr
            tm.append({"t0": round(t, 3), "t1": round(t + d, 3), "texto": x})
            partes.append(s)
            t += d
            if i < len(fr) - 1:
                p = PAUSA.get(x[-1], 0.25) + float(rng.uniform(-0.04, 0.05))
                partes.append(np.zeros(int(p * sr)))
                t += p
        partes.append(np.zeros(int(0.12 * 24000)))
        y = np.concatenate(partes)
        ffmpeg("-i", wav(y, 24000), "-af", CADEIA, "-ac", "1", "-ar", str(SR), "-b:a", "160k", os.path.join(aud, nome + ".mp3"))
        json.dump({"hash": h, "voz": voz, "frases": tm}, open(js, "w"), ensure_ascii=False, indent=1)
        print(nome, round(t, 1), "s")


main()
