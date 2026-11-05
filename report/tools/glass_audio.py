"""Score + SFX + final mix for the Glass Stories episode (all synthesized here, no samples).

    python3 tools/glass_audio.py public/glass/vo.wav out/glass_mix.wav

Reads the narration timings from src/glass/words.ts and mirrors the scene cues in
src/glass/Glass.tsx (HOOK offset, scene starts, chapter wipes) so sound lands on picture.
Mix: voice at -16 LUFS; music loud in the hook / title / outro, a soft bed under the voice
(about 22 dB below it while speaking, lifting in pauses); SFX kept ~20 dB under the voice.
"""
import re, sys, subprocess
import numpy as np

VO_IN, OUT = sys.argv[1], sys.argv[2]
SR = 48000
HOOK, OUTRO = 7.4, 7.5
rng = np.random.default_rng(11)

# ------------------------------------------------------------------ cues (mirror of Glass.tsx)
src = open("src/glass/words.ts").read()
WORDS = [(m[0], float(m[1]) + HOOK, float(m[2]) + HOOK) for m in re.findall(r'\["(.*?)",\s*([\d.]+),\s*([\d.]+)\]', src)]
norm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower())
def at(w, n=0): return [s for t, s, e in WORDS if norm(t) == norm(w)][n]
LAST = WORDS[-1][2]
DUR = np.ceil((LAST + 1.2 + OUTRO) * 10) / 10
OUTRO_T = LAST + 1.0
cues = dict(meso=at("earliest") - 0.55, egypt=at("egypt.") - 0.35, then=at("then", 0) - 0.2, invented=at("glassblowing", 0) - 0.15,
            origin=at("technique") - 0.7, core=at("you", 0) - 0.15, gather=at("but", 1) - 0.2, blow=at("blow") - 0.35, hollow=at("suddenly") - 0.3,
            meant=at("think") - 0.4, rome=at("romans") - 0.3, romemap=at("adopted") - 0.3, modern=at("but", 2) - 0.2, steps=at("heat") - 0.35,
            hands=at("course", 1) - 0.6, olga=at("olga", 0) - 0.5, montage=at("connected") - 0.6, history=at("history") - 0.8, insta=at("follow") - 0.4,
            comments=at("comments") - 0.9, end=at("hear") - 0.8)  # mirror of GlassV2.tsx scene starts
WIPES = [HOOK - 0.7, cues["then"] - 0.85, cues["rome"] - 0.85, cues["modern"] - 0.85]
HOOK_CUTS = [0, 0.8, 1.6, 2.45, 3.3, 4.1]
N = int(DUR * SR)
T = np.arange(N) / SR

def place(buf, t0, x, gain=1.0):
    i = int(max(0, t0) * SR); j = min(len(buf), i + len(x))
    if j > i: buf[i:j] += gain * x[: j - i]
def env_exp(n, tau): return np.exp(-np.arange(n) / (tau * SR))
def fft_lp(x, fc, fhp=0):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / fc) ** 4)
    if fhp: X *= 1 / np.sqrt(1 + (fhp / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(X, len(x))
def hz(midi): return 440 * 2 ** ((midi - 69) / 12)

# ------------------------------------------------------------------ score
pad = np.zeros(N); pluck = np.zeros(N); low = np.zeros(N); fx = np.zeros(N)
BEAT = 60 / 80
CHORDS = [[50, 53, 57, 62], [46, 50, 53, 58], [53, 57, 60, 65], [48, 52, 55, 60]]  # Dm  Bb  F  C
def pad_note(f, dur, att=1.4, rel=1.8):
    n = int(dur * SR); t = np.arange(n) / SR
    y = sum(np.sin(2 * np.pi * f * h * (1 + d) * t) / h for h in range(1, 7) for d in (-0.003, 0.003)) / 6
    e = np.minimum(1, t / att) * np.minimum(1, np.maximum(0, (dur - t) / rel))
    return y * e
def pluck_note(f, tau=0.45):
    n = int(1.4 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * env_exp(n, tau) * np.minimum(1, t / 0.004)
def thump(f0=75, f1=38, tau=0.32):
    n = int(0.9 * SR); t = np.arange(n) / SR
    f = f0 * (f1 / f0) ** np.minimum(1, t / 0.25)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, tau)
def noise_swell(dur, rise=True):
    n = int(dur * SR); x = fft_lp(rng.standard_normal(n), 2500, 300)
    e = np.linspace(0, 1, n) ** 2 if rise else np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    return x * e / (np.abs(x).max() + 1e-9)

# hook: drone + thumps on the cuts + riser into the title boom
place(low, 0, pad_note(hz(38), 4.6, att=0.3, rel=0.4), 0.9)
for c in HOOK_CUTS[:-1]: place(low, c, thump(), 1.0)
place(fx, 2.6, noise_swell(1.9), 0.35)
place(low, 4.5, thump(60, 30, 0.8), 1.3)
for m in [62, 69, 74, 77, 81]:  # title shimmer chord (D minor add9 colours)
    place(pad, 4.5, pad_note(hz(m), 3.2, att=0.15, rel=1.6), 0.5)

# body: chord bed every 2 bars + soft arpeggio
bar2 = 8 * BEAT
t0, k = HOOK - 0.6, 0
while t0 < OUTRO_T:
    ch = CHORDS[k % 4]
    for m in ch: place(pad, t0, pad_note(hz(m), bar2 + 1.6), 0.55)
    place(low, t0, pad_note(hz(ch[0] - 12), bar2 + 1.0, att=0.6, rel=1.2), 0.5)
    for i in range(8):
        place(pluck, t0 + i * BEAT, pluck_note(hz([ch[1], ch[2], ch[3], ch[2] + 12][i % 4] + 12)), 0.35 if i % 4 else 0.5)
    t0 += bar2; k += 1

# outro: fuller pad, rising pluck line, final chord
for m in [50, 57, 62, 65, 69]: place(pad, OUTRO_T - 0.3, pad_note(hz(m), DUR - OUTRO_T + 0.3, att=0.8, rel=2.5), 0.7)
for i, m in enumerate([74, 77, 81, 79, 77, 74, 76, 74]): place(pluck, OUTRO_T + 0.2 + i * BEAT * 0.75, pluck_note(hz(m), 0.6), 0.6)
place(low, OUTRO_T - 0.3, thump(55, 30, 0.9), 0.9)

pad = fft_lp(pad, 1800, 70); pluck = fft_lp(pluck, 5000, 200); low = fft_lp(low, 220)
music = 0.55 * pad + 0.5 * pluck + 0.7 * low + fx

# ------------------------------------------------------------------ SFX
def whoosh(dur=0.5):
    n = int(dur * SR); x = fft_lp(rng.standard_normal(n), 1200, 180)
    return x * np.sin(np.pi * np.linspace(0, 1, n)) ** 2 / (np.abs(x).max() + 1e-9)
def sizzle(dur=1.6):
    n = int(dur * SR); x = fft_lp(rng.standard_normal(n), 7000, 2500)
    crack = (rng.random(n) > 0.9993) * rng.standard_normal(n) * 3
    return (x / (np.abs(x).max() + 1e-9) + fft_lp(crack, 6000, 1500)) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
def pop(f=700):
    n = int(0.12 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(f * (0.62 ** (t / 0.12))) / SR) * env_exp(n, 0.035)
def chime(base=1046.5):
    n = int(1.0 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * base * t) + 0.5 * np.sin(2 * np.pi * base * 1.5 * t)) * env_exp(n, 0.3) * np.minimum(1, t / 0.005)
sfx = np.zeros(N)
for w in WIPES:                                                  # molten flood: whoosh + sizzle
    place(sfx, w, whoosh(0.9), 0.8); place(sfx, w + 0.2, sizzle(1.4), 0.25); place(low, w + 0.5, thump(70, 40, 0.4), 0.5)
for name, c in cues.items():
    if name not in ("then", "rome", "modern"): place(sfx, c - 0.25, whoosh(0.5), 0.5)
for w, f in (("syro-palestinian", 560), ("region.", 640)): place(sfx, at(w) - 0.05, pop(f), 0.6)
for i, w in enumerate(("faster,", "thinner,", "variety")): place(sfx, at(w) - 0.2, pop(660 + 80 * i), 0.6)
for i, d in enumerate([0, 0.2, 0.45, 0.6, 0.8]): place(sfx, at("adopted") + 0.4 + d * 4.0, pop(600 + 40 * i), 0.5)
for w in ("heat", "introduce", "controlling"): place(sfx, at(w) - 0.3, pop(560), 0.6)
place(sfx, at("olga", 0) - 0.3, chime(880), 0.5)
place(sfx, OUTRO_T + 0.9, chime(1174.7), 0.6); place(sfx, OUTRO_T + 2.9, pop(800), 0.8); place(sfx, OUTRO_T + 2.95, chime(1568), 0.5)
for c in HOOK_CUTS[1:-1]: place(sfx, c - 0.18, whoosh(0.35), 0.6)

# ------------------------------------------------------------------ mix
def ff_decode(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)
def lufs(x):
    st = np.stack([x, x], 1).astype(np.float32).tobytes()
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-af", "ebur128", "-f", "null", "-"], input=st, capture_output=True)
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr.decode())[-1])

vo = np.zeros(N); v = ff_decode(VO_IN); place(vo, HOOK, v)
vo *= 10 ** ((-16 - lufs(vo[int(HOOK * SR):int(LAST * SR)])) / 20)
body = slice(int(HOOK * SR), int(OUTRO_T * SR))
music *= 10 ** ((-33 - lufs(music[body])) / 20)                 # bed: ~17 LU under the voice
sfx *= 10 ** ((-34 - 20 * np.log10(np.sqrt(np.mean(sfx[sfx != 0] ** 2)) + 1e-12)) / 20) if np.any(sfx) else 1

# section gain: hook/title/outro up front, body as a bed; duck further under speech
hop = SR // 100
e = np.sqrt(np.mean(vo[: N // hop * hop].reshape(-1, hop) ** 2, axis=1) + 1e-12)
speech = 20 * np.log10(e) > -42
idx = np.flatnonzero(speech)
for a, b in zip(idx[:-1], idx[1:]):
    if 1 < b - a <= 90: speech[a:b] = True
speech = np.maximum(speech, np.r_[speech[25:], np.zeros(25, bool)])
tt = np.arange(len(speech)) / 100
sect = np.interp(tt, [0, HOOK - 0.6, HOOK + 0.6, OUTRO_T - 0.4, OUTRO_T + 0.4, DUR], [13, 13, 0, 0, 11, 11])
target = sect + np.where(speech, -8.0, 0.0)
g = np.zeros_like(target); cur = target[0]
for i, tg in enumerate(target):
    cur = tg + (cur - tg) * (np.exp(-1 / 15) if tg < cur else np.exp(-1 / 70)); g[i] = cur
gain = 10 ** (np.interp(np.arange(N) / hop, np.arange(len(g)), g) / 20)
fade = np.clip(T / 0.05, 0, 1) * np.clip((DUR - T) / 3.0, 0, 1)
mix = vo + music * gain * fade + sfx * (10 ** (np.interp(np.arange(N) / hop, np.arange(len(g)), np.where(speech, -4, 0)) / 20))
st = np.stack([mix, mix], 1).astype(np.float32).tobytes()
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                "-af", "aresample=192000,alimiter=limit=0.89:attack=2:release=80:level=0,aresample=48000", "-c:a", "pcm_s24le", OUT], input=st, check=True)
m_sp = music * gain
sp = np.repeat(speech, hop)[:N]; sp = np.pad(sp, (0, N - len(sp)))
rms = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
print(f"dur {DUR:.1f}s | voice -16 LUFS | music under speech {rms(m_sp[sp]) - rms(vo[sp]):.1f} dB vs voice | hook music {lufs(m_sp[: int(HOOK * SR)]):.1f} LUFS | mix {lufs(mix):.1f} LUFS")
