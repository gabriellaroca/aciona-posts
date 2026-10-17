import json, os, subprocess, sys, tempfile
import numpy as np
import soundfile as sf

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
aud = os.path.join(root, "content", "audio")
os.makedirs(aud, exist_ok=True)
force = "--force" in sys.argv
mdl = os.environ.get("KOKORO_DIR", ".")
voice = os.environ.get("VOZ", "pf_dora")
SR = 44100


def mp3(wav, out, af=None):
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", wav]
    if af:
        cmd += ["-af", af]
    subprocess.run(cmd + ["-ar", str(SR), "-b:a", "128k", out], check=True)


def fixed():
    t = os.path.join(aud, "_tick.mp3")
    if force or not os.path.exists(t):
        n = int(SR * 0.16)
        x = np.arange(n) / SR
        env = np.exp(-x * 38)
        y = (np.sin(2 * np.pi * 1318 * x) * 0.6 + np.sin(2 * np.pi * 659 * x) * 0.4) * env * 0.5
        w = tempfile.mktemp(suffix=".wav")
        sf.write(w, np.stack([y, y], 1), SR)
        mp3(w, t)
    b = os.path.join(aud, "_bed.mp3")
    if force or not os.path.exists(b):
        n = SR * 90
        x = np.arange(n) / SR
        notes = [110.0, 164.81, 220.0, 277.18, 329.63]
        y = np.zeros(n)
        for i, f in enumerate(notes):
            lfo = 0.6 + 0.4 * np.sin(2 * np.pi * (0.05 + 0.013 * i) * x + i)
            y += np.sin(2 * np.pi * f * x) * lfo * (0.5 if i < 2 else 0.28)
            y += np.sin(2 * np.pi * f * 1.004 * x) * lfo * 0.12
        y /= np.max(np.abs(y))
        y *= 0.6
        w = tempfile.mktemp(suffix=".wav")
        sf.write(w, np.stack([y, y * 0.95], 1), SR)
        mp3(w, b)


def falas():
    q = json.load(open(os.path.join(root, "content", "fila.json")))
    out = {"_fim": "Aciona. Portões automáticos. Chame a gente no WhatsApp."}
    for fila in q.values():
        for it in fila:
            for n, c in enumerate(it.get("cenas", [])):
                if c.get("fala"):
                    out[f"{it['id']}_{n}"] = c["fala"]
            if it.get("fala"):
                out[it["id"] + "_0"] = it["fala"]
    return out


def main():
    fixed()
    todo = {k: v for k, v in falas().items() if force or not os.path.exists(os.path.join(aud, k + ".mp3"))}
    if not todo:
        return
    from kokoro_onnx import Kokoro
    k = Kokoro(os.path.join(mdl, "kokoro-v1.0.onnx"), os.path.join(mdl, "voices-v1.0.bin"))
    for name, text in todo.items():
        s, sr = k.create(text, voice=voice, speed=0.97, lang="pt-br")
        w = tempfile.mktemp(suffix=".wav")
        sf.write(w, s, sr)
        mp3(w, os.path.join(aud, name + ".mp3"), "loudnorm=I=-16:TP=-1.5:LRA=11,apad=pad_dur=0.1")
        print(name, round(len(s) / sr, 1))


main()
