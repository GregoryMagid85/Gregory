"""60-second vertical cut: build the edit list from narration words, and cut the matching audio from the full mix.
usage: python3 tools/glass_short.py en|ru   -> src/glass/edl_<lang>.json + out/short_mix_<lang>.wav
Each segment is [src_start, src_end] on the full episode's timeline; the video composition (GlassShort.tsx)
plays the same frames, so picture, captions, music and SFX all stay in sync.
"""
import re, sys, json, subprocess
import numpy as np
LANG = sys.argv[1]; HOOK, SR = 7.4, 48000
f = "src/glass/words.ts" if LANG == "en" else "src/glass/words_ru.ts"
W = [(m[0], float(m[1]) + HOOK, float(m[2]) + HOOK) for m in re.findall(r'\["(.*?)",\s*([\d.]+),\s*([\d.]+)\]', open(f).read())]
norm = lambda s: re.sub(r"[^\w']", "", s.lower())
def seg(a, na, b, pre, post):
    s = [x for x in W if norm(x[0]) == norm(a)][na][1]
    e = next(x for x in W if norm(x[0]) == norm(b) and x[1] >= s)[2]
    return [round(s - pre, 3), round(e + post, 3)]
SEGS = {
  "en": [("before", 0, "luxury.", 0.6, 0.35), ("making", 0, "everything.", 0.2, 0.4), ("but", 1, "form.", 0.25, 0.4), ("more", 0, "principles.", 0.3, 0.35),
         ("hands", 0, "artist.", 0.45, 0.4), ("follow", 0, "glassmaking.", 0.85, 0.35), ("would", 0, "made?", 0.25, 0.45)],
  "ru": [("прежде", 0, "роскошью.", 0.6, 0.35), ("вот", 0, "всё.", 0.4, 0.4), ("но", 1, "форма.", 0.25, 0.4), ("прошло", 0, "принципы.", 0.3, 0.35),
         ("руки", 0, "стеклу.", 0.3, 0.4), ("поэтому", 0, "@olga_rozin,", 0.2, 0.45), ("хотели", 0, "стекло?", 0.25, 0.45)],
}[LANG]
outro = W[-1][2] + 1.0
edl = [[0.0, 4.4]] + [seg(*s) for s in SEGS] + [[round(outro, 3), round(outro + 5.3, 3)]]
json.dump(edl, open(f"src/glass/edl_{LANG}.json", "w"))
mixf = "out/glass_mix_v3.wav" if LANG == "en" else "out/glass_mix_ru.wav"
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", mixf, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
fade = int(0.06 * SR); out = np.zeros((0, 2)); cuts = []
for a, b in edl:
    s = x[int(a * SR):int(b * SR)].copy()
    s[:fade] *= np.linspace(0, 1, fade)[:, None]; s[-fade:] *= np.linspace(1, 0, fade)[:, None]
    cuts.append(len(out) / SR); out = np.concatenate([out, s])
rng = np.random.default_rng(5)
def whoosh(d=0.45):                                   # a soft whoosh on every cut
    n = int(d * SR); X = np.fft.rfft(rng.standard_normal(n)); fr = np.fft.rfftfreq(n, 1 / SR)
    X *= 1 / np.sqrt(1 + (fr / 1300) ** 4) / np.sqrt(1 + (200 / np.maximum(fr, 1)) ** 4)
    y = np.fft.irfft(X, n); y /= np.abs(y).max(); return y * np.sin(np.pi * np.linspace(0, 1, n)) ** 2
for c in cuts[1:]:
    w = whoosh(); i = max(0, int((c - 0.22) * SR)); j = min(len(out), i + len(w)); out[i:j] += 0.05 * w[: j - i, None]
out = np.clip(out, -0.99, 0.99)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "pcm_s24le", f"out/short_mix_{LANG}.wav"], input=out.astype(np.float32).tobytes(), check=True)
print(LANG, f"{sum(b - a for a, b in edl):.1f}s", edl)
