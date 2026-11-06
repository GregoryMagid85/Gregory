"""Mix Olga's narration, the ElevenLabs music cues, ambience beds and SFX into assets/audio/mix.wav.

    python3 mix_hf.py

Cues: assets/sfx_cues.json (written by build.py from the scenes' own events) + narration words.
Music: hook -> ancient (Hijaz/oud) -> Roman (lyre) -> modern (Rhodes), crossfaded at the chapter changes.
Levels: voice -16 LUFS; music bed ~ -33 LUFS in the body and ducked 8 dB more under speech;
hook/outro music up front; SFX peaks ~18-22 dB under the voice; ambience ~ -44 LUFS.
"""
import json, re, subprocess
import numpy as np

SR = 48000
CUE = json.load(open("assets/sfx_cues.json")); DUR = CUE["duration"]
W = json.load(open("assets/words.json")); LAST = W[-1]["end"]
norm = lambda s: re.sub(r"[^\w@']", "", s.lower())
def T(word, n=0): return [w["start"] for w in W if norm(w["text"]) == norm(word)][n]
N = int(DUR * SR); TT = np.arange(N) / SR
rng = np.random.default_rng(3)

def load(path, mono=True):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1" if mono else "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).astype(np.float64)
    return x if mono else x.reshape(-1, 2).mean(1)
def place(buf, t0, x, g=1.0):
    i = int(max(0, t0) * SR); j = min(len(buf), i + len(x))
    if j > i: buf[i:j] += g * x[: j - i]
def fade(x, fi=0.01, fo=0.05):
    n = len(x); e = np.ones(n)
    a, b = int(fi * SR), int(fo * SR)
    if a: e[:a] = np.linspace(0, 1, a)
    if b: e[-b:] = np.minimum(e[-b:], np.linspace(1, 0, b))
    return x * e
def rate(x, r):          # varispeed (pitch + speed) for take variation
    idx = np.arange(0, len(x) - 1, r); return np.interp(idx, np.arange(len(x)), x)
def lufs(x):
    st = np.stack([x, x], 1).astype(np.float32).tobytes()
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-af", "ebur128", "-f", "null", "-"], input=st, capture_output=True)
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr.decode())[-1])
def peak_db(x): return 20 * np.log10(np.abs(x).max() + 1e-12)
def loop_to(x, dur, xf=0.25):
    n, out, k = int(dur * SR), np.zeros(int(dur * SR)), int(xf * SR)
    pos = 0
    while pos < n:
        seg = x.copy(); seg[:k] *= np.linspace(0, 1, k); seg[-k:] *= np.linspace(1, 0, k)
        place(out, pos / SR, seg); pos += len(x) - k
    return out

S = {k: load(f"assets/sfx/{k}.mp3") for k in ["whoosh_a", "whoosh_b", "pencil", "shimmer", "impact", "paper", "pin", "sizzle", "breath", "wind", "furnace"]}
S = {k: v / (np.abs(v).max() + 1e-9) for k, v in S.items()}

# ---------------------------------------------------------------- music
M = {k: load(f"assets/sfx/music_{k}.mp3", mono=False) for k in ["hook", "ancient", "rome", "modern"]}
music = np.zeros(N)
hook = M["hook"]; hp = np.argmax(np.abs(hook[: int(8 * SR)]) * (np.arange(min(len(hook), int(8 * SR))) > int(2.5 * SR)))   # the big impact
place(music, max(0.0, 4.55 - hp / SR), fade(hook, 0.02, 1.5))                                            # impact lands on the OR monogram
ch_rome, ch_modern = T("romans") - 0.9, T("but", 2) - 0.6
anc = M["ancient"]; place(music, 6.9, fade(anc[: int((ch_rome - 6.9 + 1.5) * SR)], 1.2, 1.5), 1.0)
rom = M["rome"]; place(music, ch_rome - 0.3, fade(rom[: int((ch_modern - ch_rome + 1.8) * SR)], 0.8, 1.5), 1.0)
mod = M["modern"]; mod = mod[max(0, len(mod) - int((DUR - ch_modern + 0.4) * SR)):] if len(mod) > (DUR - ch_modern) * SR else mod
place(music, ch_modern - 0.4, fade(mod, 1.0, 2.5), 1.0)     # its resolved ending lands on the end card

# ---------------------------------------------------------------- ambience
amb = np.zeros(N)
fur = loop_to(S["furnace"], 40); wind = loop_to(S["wind"] * 0.8, 40, 0.3)
def bed(src, a, b, g=1.0):
    seg = src[: int((b - a) * SR)]; place(amb, a, fade(seg, 0.6, 0.6), g)
for a, b in [(0, 4.45), (T("glassblowing") - 0.1, T("now", 1) - 0.2), (T("blow") - 0.3, T("now", 2)), (T("heat") - 0.4, T("i'm") + 6)]:
    bed(np.tile(fur, 4), a, b, 1.0)
for a, b in [(T("now") - 0.3, T("but") + 0.5), (T("now", 1) - 0.3, T("you") + 0.5), (T("romans") - 0.6, T("but", 2) - 0.2), (T("connected") - 0.6, T("there's", 1) + 0.4)]:
    bed(np.tile(wind, 4), a, b, 0.8)

# ---------------------------------------------------------------- SFX on every event
fx = np.zeros(N); k_w = 0
for t, kind in CUE["events"]:
    if kind == "whoosh":
        src = S["whoosh_a"] if k_w % 2 == 0 else S["whoosh_b"][: int(1.1 * SR)]; k_w += 1
        place(fx, t - 0.05, fade(rate(src, rng.uniform(0.92, 1.08)), 0.01, 0.2), 0.55)
    elif kind == "dive":
        place(fx, t, fade(rate(S["whoosh_b"], 0.8), 0.02, 0.3), 0.8); place(fx, t + 0.9, fade(S["sizzle"]), 0.4)
    elif kind == "pencil":
        o = int(rng.uniform(0, 0.25) * SR); place(fx, t, fade(rate(S["pencil"][o:], rng.uniform(0.9, 1.15)), 0.01, 0.15), 0.32)
    elif kind == "window":
        place(fx, t, fade(rate(S["whoosh_a"], 1.25), 0.01, 0.15), 0.28)
    elif kind == "paper":
        place(fx, t, fade(S["paper"][: int(0.9 * SR)], 0.01, 0.3), 0.55)
    elif kind == "pin":
        place(fx, t + 0.03, fade(rate(S["pin"][: int(0.4 * SR)], rng.uniform(0.95, 1.1)), 0.002, 0.1), 0.55)
    elif kind == "impact":
        place(fx, t, fade(S["impact"], 0.002, 0.3), 1.0)
    elif kind == "shine":
        place(fx, t, fade(S["shimmer"], 0.01, 0.4), 0.45)
    elif kind == "sizzle":
        place(fx, t, fade(S["sizzle"], 0.005, 0.15), 0.6)
    elif kind == "breath":
        place(fx, t - 0.1, fade(S["breath"], 0.05, 0.4), 0.8)
    elif kind == "shimmer":
        place(fx, t, fade(S["shimmer"], 0.01, 0.4), 0.7)

# ---------------------------------------------------------------- mix
vo = np.zeros(N); place(vo, 7.4, load("assets/audio/vo.wav"))
body = slice(int(7.4 * SR), int(LAST * SR))
vo *= 10 ** ((-16 - lufs(vo[body])) / 20)
music *= 10 ** ((-31 - lufs(music[body])) / 20)
amb *= 10 ** ((-43 - lufs(amb[body])) / 20)
fx *= 10 ** ((-6 - peak_db(fx)) / 20) * 10 ** ((-16 + 6 - 4) / 20)        # loudest SFX peak ~ -20 dBFS
hop = SR // 100
e = np.sqrt(np.mean(vo[: N // hop * hop].reshape(-1, hop) ** 2, axis=1) + 1e-12)
speech = 20 * np.log10(e) > -42
idx = np.flatnonzero(speech)
for a, b in zip(idx[:-1], idx[1:]):
    if 1 < b - a <= 90: speech[a:b] = True
speech = np.maximum(speech, np.r_[speech[25:], np.zeros(25, bool)])
t100 = np.arange(len(speech)) / 100
section = np.interp(t100, [0, 6.8, 8.0, LAST + 0.3, LAST + 1.2, DUR], [12, 12, 0, 0, 9, 9])
def smooth(target):
    g = np.zeros_like(target); cur = target[0]
    for i, tg in enumerate(target):
        cur = tg + (cur - tg) * (np.exp(-1 / 15) if tg < cur else np.exp(-1 / 70)); g[i] = cur
    return 10 ** (np.interp(np.arange(N) / hop, np.arange(len(g)), g) / 20)
g_m = smooth(section + np.where(speech, -8.0, 0.0)); g_a = smooth(np.where(speech, -4.0, 0.0)); g_f = smooth(np.where(speech, -3.0, 0.0))
tail = np.clip((DUR - TT) / 2.5, 0, 1)
mix = vo + (music * g_m + amb * g_a) * tail + fx * g_f
st = np.stack([mix, mix], 1).astype(np.float32).tobytes()
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                "-af", "aresample=192000,alimiter=limit=0.89:attack=2:release=80:level=0,aresample=48000", "-c:a", "pcm_s24le", "assets/audio/mix.wav"], input=st, check=True)
sp = np.repeat(speech, hop)[:N]; sp = np.pad(sp, (0, N - len(sp)))
r = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
print(f"{DUR}s | music under speech {r((music * g_m)[sp]) - r(vo[sp]):.1f} dB | ambience {r((amb * g_a)[sp]) - r(vo[sp]):.1f} dB | "
      f"sfx peak {peak_db(fx * g_f):.1f} dBFS | mix {lufs(mix):.1f} LUFS")
