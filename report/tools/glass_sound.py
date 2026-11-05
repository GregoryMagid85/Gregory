"""Full sound design for Glass Stories Ep.1 (vertical): era music, ambience, SFX on every move, final mix.

    python3 tools/glass_sound.py public/glass/vo.wav out/glass_mix.wav [en|ru]

Everything is synthesized here (no samples). Timings mirror src/glass/GlassV2.tsx: scene starts,
art pans, cards, ribbons, kinetic words — all keyed to the narration (src/glass/words.ts).
  Music:    hook tension -> ancient (Hijaz drone, oud-like plucks, frame drum) -> Roman (lyre, horn pad,
            processional drum) -> modern (electric-piano chords, soft beat, sub) -> outro lift.
  Ambience: desert wind (ancient art), crowd murmur (Rome), furnace roar + crackle (studio footage).
  SFX:      pans (air sweeps), cards (paper), ribbons (cloth), kinetic words (soft impacts), maps (pen),
            ticks, breath on "blow", glass shimmer on "hollow", wipes (molten sizzle), outro button.
Mix: voice -16 LUFS; music bed ~24 dB under speech; ambience and SFX kept further below.
"""
import re, sys, subprocess
import numpy as np

VO_IN, OUT = sys.argv[1], sys.argv[2]
SR = 48000
HOOK, OUTRO = 7.4, 7.5
rng = np.random.default_rng(23)

# ------------------------------------------------------------------ timing (mirror of GlassV2.tsx)
src = open("src/glass/words.ts").read()
WORDS = [(m[0], float(m[1]) + HOOK, float(m[2]) + HOOK) for m in re.findall(r'\["(.*?)",\s*([\d.]+),\s*([\d.]+)\]', src)]
norm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower())
def at(w, n=0): return [s for t, s, e in WORDS if norm(t) == norm(w)][n]
LAST = WORDS[-1][2]
LANG = sys.argv[3] if len(sys.argv) > 3 else "en"
if LANG == "ru":   # map English cue times onto the Russian take (same anchors as src/glass/core.tsx)
    import json
    ru = [(m[0], float(m[1]) + HOOK, float(m[2]) + HOOK) for m in re.findall(r'\["(.*?)",\s*([\d.]+),\s*([\d.]+)\]', open("src/glass/words_ru.ts").read())]
    nru = lambda s: re.sub(r"[^\w']", "", s.lower())
    pick = lambda WW, w, n: [s for t, s, e in WW if nru(t) == nru(w)][n]
    pairs = [(0, 0), (HOOK, HOOK)] + [(pick(WORDS, a, na), pick(ru, b, nb)) for a, na, b, nb in json.load(open("src/glass/ru_anchors.json"))] + [(LAST, ru[-1][2])]
    _at_en = at
    def at(w, n=0):
        x = _at_en(w, n); xs, ys = zip(*pairs)
        return float(np.interp(x, xs, ys)) if x <= xs[-1] else x - xs[-1] + ys[-1]
    LAST = ru[-1][2]
DUR = float(np.ceil((LAST + 1.2 + OUTRO) * 10) / 10)
c = dict(intro=HOOK - 0.5, meso=at("earliest") - 0.55, egypt=at("egypt.") - 0.35, then=at("then", 0) - 0.2, invented=at("glassblowing", 0) - 0.15,
         origin=at("technique") - 0.7, core=at("you", 0) - 0.15, gather=at("but", 1) - 0.2, blow=at("blow") - 0.35, hollow=at("suddenly") - 0.3,
         meant=at("think") - 0.4, rome=at("romans") - 0.3, romemap=at("adopted") - 0.3, modern=at("but", 2) - 0.2, steps=at("heat") - 0.35,
         hands=at("course", 1) - 0.6, olga=at("olga", 0) - 0.5, montage=at("connected") - 0.6, history=at("history") - 0.8, insta=at("follow") - 0.4,
         comments=at("comments") - 0.9, end=at("hear") - 0.8, outro=LAST + 1.0)
K = list(c); win = lambda k: (c[k], c[K[K.index(k) + 1]] if K.index(k) + 1 < len(K) else DUR)
PANS = [("meso", win("meso")[0], win("meso")[1], 0.25), ("egypt", win("egypt")[0], win("egypt")[1] - 0.4, 0.2), ("levant", win("gather")[0], win("gather")[1] - 0.2, 0.3),
        ("rome", win("rome")[0], win("rome")[1] + 0.3, 0.15), ("modern", win("modern")[0], win("modern")[1] - 0.6, 0.3), ("montage", win("montage")[0], win("montage")[1] + 0.3, 0.0),
        ("outro", c["outro"], c["outro"] + 7, 0.0)]
WIPES = [HOOK - 0.7, c["then"] - 0.85, c["rome"] - 0.85, c["modern"] - 0.85]
HOOK_CUTS = [0, 0.8, 1.6, 2.45, 3.3]
N = int(DUR * SR); T = np.arange(N) / SR

# ------------------------------------------------------------------ dsp helpers
def place(buf, t0, x, gain=1.0):
    i = int(max(0, t0) * SR); j = min(len(buf), i + len(x))
    if j > i: buf[i:j] += gain * x[: j - i]
def env_exp(n, tau): return np.exp(-np.arange(n) / (tau * SR))
def filt(x, lo=0, hi=None):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    if hi: X *= 1 / np.sqrt(1 + (f / hi) ** 4)
    if lo: X *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(X, len(x))
def norm1(x): return x / (np.abs(x).max() + 1e-9)
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def noise(n): return rng.standard_normal(n)
def adsr(n, a=0.01, r=0.3):
    t = np.arange(n) / SR; d = n / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.minimum(1, np.maximum(0, (d - t) / max(r, 1e-4)))

# instruments
def ks(f, dur=1.2, bright=0.5, decay=0.996):           # Karplus-Strong plucked string (oud / lyre)
    n = int(dur * SR); p = max(2, int(SR / f))
    buf = filt(rng.uniform(-1, 1, p * 4), 0, 2000 + 6000 * bright)[:p].tolist()
    out = np.zeros(n)
    for i in range(n):
        v = buf[i % p]; out[i] = v
        buf[i % p] = decay * 0.5 * (v + buf[(i + 1) % p])
    return out * adsr(n, 0.002, 0.2)
def pad(f, dur, harm=6, att=1.2, rel=1.6, det=0.003):
    n = int(dur * SR); t = np.arange(n) / SR
    y = sum(np.sin(2 * np.pi * f * h * (1 + d) * t) / h for h in range(1, harm + 1) for d in (-det, det)) / harm
    return y * np.minimum(1, t / att) * np.minimum(1, np.maximum(0, (dur - t) / rel))
def epiano(f, dur=1.6):                                   # 2-op FM electric piano
    n = int(dur * SR); t = np.arange(n) / SR
    idx = 1.8 * np.exp(-t * 3.5)
    return np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t)) * env_exp(n, 0.9) * adsr(n, 0.003, 0.3)
def thump(f0=90, f1=55, tau=0.22, n_s=0.5):
    n = int(n_s * SR); t = np.arange(n) / SR
    f = f0 * (f1 / f0) ** np.minimum(1, t / 0.12)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, tau)
def tek(n_s=0.08, lo=1800, hi=6000): n = int(n_s * SR); return filt(noise(n), lo, hi) * env_exp(n, 0.025)
def hat(): n = int(0.06 * SR); return filt(noise(n), 6000) * env_exp(n, 0.012)
def kick(): return thump(110, 45, 0.18, 0.4)

# sfx
def whoosh(dur=0.5, lo=180, hi=1300):
    n = int(dur * SR); return norm1(filt(noise(n), lo, hi)) * np.sin(np.pi * np.linspace(0, 1, n)) ** 2
def air_sweep(dur):                                         # slow pan: airy band sweeping upward
    n = int(dur * SR); x = noise(n); out = np.zeros(n); seg = int(0.25 * SR)
    for i in range(0, n, seg):
        p = i / n; out[i:i + seg] = filt(x[i:i + seg], 300 + 900 * p, 1200 + 3500 * p)[: min(seg, n - i)]
    return norm1(filt(out, 200, 6000)) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
def paper(dur=0.45):
    n = int(dur * SR); x = filt(noise(n), 1500, 9000)
    am = np.clip(filt(rng.standard_normal(n), 0, 40) * 6, 0, None)
    return norm1(x * am) * np.sin(np.pi * np.linspace(0, 1, n)) ** 0.7
def cloth(dur=0.5):
    n = int(dur * SR); x = filt(noise(n), 300, 3500)
    flutter = 0.5 + 0.5 * np.sin(2 * np.pi * np.linspace(18, 8, n) * np.linspace(0, dur, n))
    return norm1(x * flutter) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.2
def soft_hit():
    a = 0.8 * norm1(thump(70, 40, 0.25, 0.6)); w = whoosh(0.35, 200, 900); a[: len(w)] += 0.4 * w; return a
def pen(dur):
    n = int(dur * SR); x = filt(noise(n), 2500, 8000)
    strokes = (np.sin(2 * np.pi * 7 * np.arange(n) / SR + rng.uniform(0, 6)) > -0.2) * (0.6 + 0.4 * rng.random(n))
    return norm1(x * filt(strokes.astype(float), 0, 60))
def tick(f=1700): n = int(0.05 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * f * t) * env_exp(n, 0.01)
def pop(f=700):
    n = int(0.12 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(f * (0.62 ** (t / 0.12))) / SR) * env_exp(n, 0.035)
def chime(base=1046.5):
    n = int(1.2 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * base * t) + 0.5 * np.sin(2 * np.pi * base * 1.5 * t) + 0.25 * np.sin(2 * np.pi * base * 2.76 * t)) * env_exp(n, 0.35) * adsr(n, 0.004, 0.3)
def shimmer(dur=1.4):
    out = np.zeros(int(dur * SR))
    for i, m in enumerate([86, 90, 93, 98, 101]): place(out, i * 0.06, chime(hz(m)), 0.4)
    return out
def sizzle(dur=1.5):
    n = int(dur * SR); x = norm1(filt(noise(n), 2500, 7000))
    crack = filt((rng.random(n) > 0.9993) * rng.standard_normal(n) * 3, 1500, 6000)
    return (x + crack) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
def breath(dur=0.9): n = int(dur * SR); return norm1(filt(noise(n), 400, 2500)) * np.sin(np.pi * np.linspace(0, 1, n) ** 0.6) ** 2

# ------------------------------------------------------------------ MUSIC
mus = {k: np.zeros(N) for k in ("hook", "ancient", "rome", "modern")}
# hook: drone + hits + riser into the sting, shimmer chord
place(mus["hook"], 0, pad(hz(38), 4.6, att=0.2, rel=0.4), 0.9)
for h in HOOK_CUTS: place(mus["hook"], h, thump(75, 38, 0.32, 0.9), 1.0)
place(mus["hook"], 2.6, norm1(filt(noise(int(1.9 * SR)), 300, 2500)) * np.linspace(0, 1, int(1.9 * SR)) ** 2, 0.35)
place(mus["hook"], 4.5, thump(60, 30, 0.8, 1.5), 1.3)
for m in [62, 69, 74, 77, 81]: place(mus["hook"], 4.5, pad(hz(m), 3.2, att=0.15, rel=1.6), 0.45)

# ancient (D Hijaz): drone + oud phrases + maqsum frame drum, 96 bpm
A0, A1 = HOOK - 0.8, c["rome"] + 0.4
beat = 60 / 96
HIJAZ = [62, 63, 66, 67, 69, 70, 72, 74]
place(mus["ancient"], A0, pad(hz(38), A1 - A0, harm=5, att=2.0, rel=2.0) + 0.6 * pad(hz(45), A1 - A0, harm=4, att=2.5, rel=2.0), 0.7)
t0, deg = A0 + 2 * beat, 4
while t0 < A1 - 1:
    for k in range(8):                                           # one bar of eighth notes, with rests
        if rng.random() < 0.62:
            deg = int(np.clip(deg + rng.choice([-2, -1, -1, 1, 1, 2]), 0, len(HIJAZ) - 1))
            place(mus["ancient"], t0 + k * beat / 2, ks(hz(HIJAZ[deg] - 12), 0.9, 0.35, 0.995), 0.5)
    t0 += 4 * beat
t0 = A0 + 2 * beat
while t0 < A1 - 0.5:                                              # maqsum: D T . T D . T .
    for k, s in enumerate("DT.TD.T."):
        tt = t0 + k * beat / 2
        if s == "D": place(mus["ancient"], tt, thump(95, 60, 0.2, 0.5), 0.55)
        if s == "T": place(mus["ancient"], tt, tek(), 0.25)
    t0 += 4 * beat

# Roman (D Dorian): horn pad chords + lyre arpeggios + processional drum, 76 bpm
R0, R1 = c["rome"] - 1.2, c["modern"] + 0.4
beat = 60 / 76
CH = [[50, 57, 62, 65], [48, 55, 60, 64], [46, 53, 58, 62], [48, 55, 60, 64]]
t0, k = R0, 0
while t0 < R1:
    ch = CH[k % 4]
    for m in ch: place(mus["rome"], t0, pad(hz(m), 8 * beat + 1.2, harm=9, att=0.8, rel=1.2), 0.32)
    for i in range(8): place(mus["rome"], t0 + i * beat, ks(hz([ch[1], ch[2], ch[3], ch[2] + 12][i % 4] + 12), 1.4, 0.75, 0.997), 0.45)
    for i in (0, 4): place(mus["rome"], t0 + i * beat, thump(80, 50, 0.35, 0.8), 0.6)
    t0 += 8 * beat; k += 1

# modern: electric-piano chords + soft kick/hat + sub, 84 bpm; outro lift
M0 = c["modern"] - 1.2
beat = 60 / 84
CH = [[50, 57, 60, 64, 65], [46, 53, 57, 60, 62], [41, 53, 57, 60, 64], [48, 55, 57, 60, 64]]   # Dm9 Bbmaj9 Fmaj7 C6
t0, k = M0, 0
while t0 < DUR:
    ch = CH[k % 4]
    for hit in (0, 1.5, 3, 4, 5.5, 7):                                 # syncopated comping
        for m in ch[1:]: place(mus["modern"], t0 + hit * beat, epiano(hz(m + 12), 1.8), 0.2 if hit % 1 == 0 else 0.15)
    place(mus["modern"], t0, pad(hz(ch[0] - 12), 8 * beat + 0.5, harm=2, att=0.05, rel=0.6), 0.5)
    for i in range(8):
        if i % 4 == 0: place(mus["modern"], t0 + i * beat, kick(), 0.6)
        place(mus["modern"], t0 + i * beat + beat / 2, hat(), 0.18)
    t0 += 8 * beat; k += 1
for i, m in enumerate([74, 77, 81, 79, 77, 74, 76, 74]): place(mus["modern"], c["outro"] + 0.2 + i * 0.45, epiano(hz(m + 12), 1.2), 0.35)
place(mus["modern"], c["outro"] - 0.3, thump(55, 30, 0.9, 1.5), 0.9)

def xfade(a, b, fade=1.4):
    return np.clip((T - a) / fade, 0, 1) * np.clip((b - T) / fade, 0, 1)
music = mus["hook"] * xfade(-1, HOOK - 0.2, 0.6) + mus["ancient"] * xfade(A0, A1) + mus["rome"] * xfade(R0, R1) + mus["modern"] * xfade(M0, DUR + 2)
music = filt(music, 35, 9000)

# ------------------------------------------------------------------ AMBIENCE
amb = np.zeros(N)
def furnace(dur):
    n = int(dur * SR); x = filt(np.cumsum(noise(n)) * 0.02, 30, 380)
    x = norm1(x - filt(x, 0, 2)) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.17 * np.arange(n) / SR))
    cr = filt((rng.random(n) > 0.9996) * rng.standard_normal(n) * 4, 1200, 5000)
    return x + 0.35 * cr
def wind(dur):
    n = int(dur * SR); out = np.zeros(n); x = noise(n); seg = int(0.5 * SR)
    for i in range(0, n, seg):
        f = 500 + 400 * np.sin(i / SR * 0.4) + 200 * rng.random()
        out[i:i + seg] = filt(x[i:i + seg], f * 0.6, f * 1.6)[: min(seg, n - i)]
    return norm1(filt(out, 150, 3000)) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * np.arange(n) / SR))
def murmur(dur):
    n = int(dur * SR); out = np.zeros(n)
    for _ in range(int(dur * 9)):
        L = int(rng.uniform(0.12, 0.35) * SR); s = int(rng.uniform(0, max(1, n - L)))
        f = rng.uniform(250, 900)
        out[s:s + L] += filt(noise(L), f * 0.7, f * 1.5) * np.sin(np.pi * np.linspace(0, 1, L)) * rng.uniform(0.3, 1)
    return norm1(filt(out, 200, 2500))
AMB = [("studio", 0, c["meso"]), ("wind", c["meso"], c["then"]), ("studio", c["then"], c["origin"]), ("wind", c["origin"], c["core"]),
       ("studio", c["core"], c["gather"]), ("furnace_old", c["gather"], c["blow"]), ("studio", c["blow"], c["rome"]), ("murmur", c["rome"], c["modern"]),
       ("studio", c["modern"], c["montage"]), ("wind", c["montage"], c["history"]), ("studio", c["history"], DUR)]
for kind, a, b in AMB:
    d = b - a + 1.0
    x = furnace(d) if kind in ("studio", "furnace_old") else wind(d) if kind == "wind" else murmur(d) * 0.7 + 0.4 * wind(d)
    n = len(x); e = np.minimum(1, np.arange(n) / (0.5 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.5 * SR))
    place(amb, a - 0.5, x * e, 1.0 if kind != "furnace_old" else 0.8)

# ------------------------------------------------------------------ SFX on every move
fx = np.zeros(N)
for h in HOOK_CUTS[1:]: place(fx, h - 0.18, whoosh(0.35), 0.7)
for w in WIPES: place(fx, w, whoosh(0.9), 0.8); place(fx, w + 0.2, sizzle(1.4), 0.3); place(fx, w + 0.5, thump(70, 40, 0.4, 0.8), 0.5)
for name, a, b, hold in PANS:                                    # art pans: air sweep over the travel, paper as the card settles
    ts = a + hold * (b - a); dur = max(0.8, b - ts)
    place(fx, ts, air_sweep(dur), 0.55)
    if name not in ("montage", "outro"): place(fx, b - 0.5, paper(0.5), 0.5)
for k in K:                                                       # every scene change
    if k not in ("then", "rome", "modern", "outro") and c[k] > HOOK: place(fx, c[k] - 0.25, whoosh(0.5), 0.45)
CARDS = [at("then", 0) + 0.1, at("syro-palestinian") - 0.4, c["core"] + 0.3, at("faster,") - 0.5, at("follow") - 0.1, at("would") - 0.3, c["outro"] + 0.9]
for t0 in CARDS: place(fx, t0, paper(), 0.7)
RIBBONS = [HOOK - 2.6, at("then", 0), c["origin"] + 0.1, c["core"] + 0.1, c["meant"] + 0.1, c["romemap"] + 0.1, c["steps"] + 0.1, at("artist.") - 0.3, at("thousands", 1) - 0.4, c["comments"] + 0.1]
for t0 in RIBBONS: place(fx, t0, cloth(), 0.6)
KIN = [at("rare") - 0.1, at("glassblowing", 0) - 0.1, at("changed") - 0.2, at("hands") - 0.2, at("olga", 0) - 0.2]
for t0 in KIN: place(fx, t0, soft_hit(), 0.55)
for i, w in enumerate(("art,", "windows,", "everyday")): place(fx, at(w) - 0.1, pop(560 + 70 * i), 0.5)
for i in range(3): place(fx, at("rare") - 0.4 + i * 0.12, pen(0.25), 0.35)          # strike-throughs
for i, f in enumerate((0, 0.45, 1)): place(fx, at("then", 0) + 0.3 + f * 1.2, tick(1400 + 200 * i), 0.6)
place(fx, at("century"), whoosh(0.7, 300, 3000), 0.5)                                # the 1st-century dot ignites
place(fx, c["origin"], whoosh(1.6, 120, 700), 0.5)                                    # map zoom
for w, f in (("syro-palestinian", 560), ("region.", 640)): place(fx, at(w) - 0.05, pop(f), 0.5)
place(fx, at("clay"), thump(140, 90, 0.08, 0.3), 0.6); place(fx, at("laborious") - 0.5, sizzle(1.2), 0.35); place(fx, at("imagine.") - 0.3, paper(0.3), 0.4)
place(fx, at("blow") - 0.2, breath(1.0), 0.7)
place(fx, at("hollow", 2) - 0.2, shimmer(), 0.5)
for i, w in enumerate(("faster,", "thinner,", "variety")): place(fx, at(w) - 0.2, pop(660 + 80 * i), 0.55)
for i, d in enumerate([0.2, 0.45, 0.6, 0.8]):                                          # routes drawn, pins pop
    tt = at("adopted") + 0.4 + d * 4.0; place(fx, tt - 0.6, pen(0.6), 0.35); place(fx, tt, pop(600 + 40 * i), 0.5)
for w in ("heat", "introduce", "controlling"): place(fx, at(w) - 0.35, tick(1600), 0.6); place(fx, at(w) - 0.35, whoosh(0.4), 0.3)
place(fx, at("ingredient.") - 0.4, soft_hit(), 0.35)
place(fx, at("olga", 0) - 0.3, chime(880), 0.45)
for i in range(6): place(fx, c["insta"] + 0.1 + i * 0.07, tick(1200 + 60 * i), 0.4)
place(fx, at("hear") - 0.6, pen(at("think", 1) + 0.6 - (at("hear") - 0.6)), 0.4)        # handwriting
place(fx, c["outro"] + 0.3, pen(1.0), 0.4); place(fx, c["outro"] + 0.9, chime(1174.7), 0.5)
place(fx, c["outro"] + 2.7, pop(800), 0.8); place(fx, c["outro"] + 2.9, tick(2000), 0.8); place(fx, c["outro"] + 2.95, chime(1568), 0.5)

# ------------------------------------------------------------------ MIX
def ff_decode(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)
def lufs(x):
    st = np.stack([x, x], 1).astype(np.float32).tobytes()
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-af", "ebur128", "-f", "null", "-"], input=st, capture_output=True)
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr.decode())[-1])
rms_db = lambda x: 20 * np.log10(np.sqrt(np.mean(x[x != 0] ** 2)) + 1e-12)

vo = np.zeros(N); place(vo, HOOK, ff_decode(VO_IN))
vo *= 10 ** ((-16 - lufs(vo[int(HOOK * SR):int(LAST * SR)])) / 20)
body = slice(int(HOOK * SR), int(c["outro"] * SR))
music *= 10 ** ((-33 - lufs(music[body])) / 20)
amb *= 10 ** ((-42 - lufs(amb[body])) / 20)
fx *= 10 ** ((-36 - rms_db(fx)) / 20)

hop = SR // 100
e = np.sqrt(np.mean(vo[: N // hop * hop].reshape(-1, hop) ** 2, axis=1) + 1e-12)
speech = 20 * np.log10(e) > -42
idx = np.flatnonzero(speech)
for a, b in zip(idx[:-1], idx[1:]):
    if 1 < b - a <= 90: speech[a:b] = True
speech = np.maximum(speech, np.r_[speech[25:], np.zeros(25, bool)])
tt = np.arange(len(speech)) / 100
sect = np.interp(tt, [0, HOOK - 0.6, HOOK + 0.6, c["outro"] - 0.4, c["outro"] + 0.4, DUR], [13, 13, 0, 0, 11, 11])
def smooth(target):
    g = np.zeros_like(target); cur = target[0]
    for i, tg in enumerate(target):
        cur = tg + (cur - tg) * (np.exp(-1 / 15) if tg < cur else np.exp(-1 / 70)); g[i] = cur
    return 10 ** (np.interp(np.arange(N) / hop, np.arange(len(g)), g) / 20)
g_mus = smooth(sect + np.where(speech, -8.0, 0.0))
g_amb = smooth(np.where(speech, -4.0, 0.0) + np.interp(tt, [0, 4.6, 7.0, DUR], [-6, -6, 0, 0]))
g_fx = smooth(np.where(speech, -3.0, 0.0))
fade = np.clip(T / 0.05, 0, 1) * np.clip((DUR - T) / 3.0, 0, 1)
mix = vo + (music * g_mus + amb * g_amb) * fade + fx * g_fx
st = np.stack([mix, mix], 1).astype(np.float32).tobytes()
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                "-af", "aresample=192000,alimiter=limit=0.89:attack=2:release=80:level=0,aresample=48000", "-c:a", "pcm_s24le", OUT], input=st, check=True)
sp = np.repeat(speech, hop)[:N]; sp = np.pad(sp, (0, N - len(sp)))
r = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
print(f"dur {DUR:.1f}s | music under speech {r((music * g_mus)[sp]) - r(vo[sp]):.1f} dB | ambience under speech {r((amb * g_amb)[sp]) - r(vo[sp]):.1f} dB | "
      f"sfx peak {20*np.log10(np.abs(fx * g_fx).max()):.1f} dBFS | mix {lufs(mix):.1f} LUFS")
