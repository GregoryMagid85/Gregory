"""Synthesized, subtle UI sound effects placed on the on-screen events of Report.tsx.

    python3 tools/sfx.py 80 out/sfx.wav

Event times come from the same narration cues the animation uses (src/data/words.ts),
so every sound lands on the frame where its visual happens. All sounds are short, soft and
rounded (no harsh clicks); mix.py sets the bus level and dips it under the voice.
"""
import re, sys, subprocess
import numpy as np

DUR, OUT = float(sys.argv[1]), sys.argv[2]
SR = 48000
rng = np.random.default_rng(7)

# ---------------------------------------------------------------- narration cues (mirrors Report.tsx `at`)
src = open("src/data/words.ts").read()
WORDS = [(m[0], float(m[1])) for m in re.findall(r'\["(.*?)",\s*([\d.]+),\s*[\d.]+\]', src)]
norm = lambda s: re.sub(r"[^a-z0-9.]", "", s.lower())
def at(w, n=0):
    hits = [s for t, s in WORDS if norm(t) == norm(w)]
    return hits[n]

# scene starts — keep in sync with `S` in src/Report.tsx
S = dict(intro=0, d1=3.1, d2=7.4, d3=11.75, todo=15.55, t1=18.35, t2=24.95, t3=31.35, t4=37.4, t5=43.2,
         t6=47.8, t7=54.25, next=65.8, end=77.2)

# ---------------------------------------------------------------- synths
def env_exp(n, tau): return np.exp(-np.arange(n) / (tau * SR))
def tone(f0, f1, dur, tau, harm=0.0):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f0 * (f1 / f0) ** (t / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) + harm * np.sin(2 * ph)
    att = np.clip(t / 0.004, 0, 1)
    return y * env_exp(n, tau) * att
def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); s = 0.0
    for i, v in enumerate(x): s = (1 - a) * v + a * s; y[i] = s
    return y
def pop(f=760):   return tone(f, f * 0.62, 0.12, 0.035, 0.15)
def tick(f=1500): return tone(f, f * 0.9, 0.05, 0.010)
def chime(base=1046.5):
    n = int(0.9 * SR)
    hi = np.pad(tone(base * 1.26, base * 1.26, 0.8, 0.22), (int(0.07 * SR), n))[:n]
    return 0.6 * tone(base, base, 0.9, 0.25) + 0.45 * hi
def buzz():
    a = tone(233, 220, 0.11, 0.05, 0.3); b = tone(196, 185, 0.14, 0.06, 0.3)
    return np.concatenate([a, np.zeros(int(0.03 * SR)), b])
def whoosh(dur=0.42):
    n = int(dur * SR); t = np.arange(n) / n
    noise = rng.standard_normal(n)
    sweep = lp(noise, 900) - lp(noise, 180)            # band-limited air
    return sweep * np.sin(np.pi * t) ** 2 * 3.0
def puff():
    n = int(0.45 * SR); noise = rng.standard_normal(n)
    return lp(noise, 700) * env_exp(n, 0.12) * 2.5

# ---------------------------------------------------------------- event list: (time, sound, gain dB)
E = []
add = lambda t, snd, db=0.0, peak_at=0.0: E.append((t - peak_at, snd, db))
for k in ["d1", "d2", "d3", "todo", "t1", "t2", "t3", "t4", "t5", "t6", "t7", "next", "end"]:
    add(S[k], whoosh(), -4, peak_at=0.21)                       # scene slide
# intro
for i, d in enumerate([0.9, 1.05, 1.2]): add(d, pop(620 + 90 * i), -2)
add(at("week,") - 0.1, tick(1320), -3)
# done 1-3
add(at("implemented"), tick(), 0); add(at("basic"), tick(1650), 0)
add(at("verified"), tick(), 0)
poof = S["d2"] + 0.3 + 0.36; add(poof, puff(), -3); add(poof + 0.55, chime(1174.7), -4)
add(at("slot", 1) - 0.3, tick(1250), -2); add(at("binding", 0) - 0.2, tick(1400), -2)
# to-do overview
for i in range(7): add(S["todo"] + 0.35 + i * 0.12, tick(1100 + 40 * i), -7)
# t1 slots
add(at("load"), whoosh(0.3), -9, 0.15); add(at("bound"), whoosh(0.3), -9, 0.15)
add(at("bound") + 0.5, chime(), -6)
for i in range(4): add(at("artboards.") - 0.1 + i * 0.07, pop(520 - 25 * i), -7)
# t2 APKs
add(at("lab") - 0.25, pop(700), -3); add(at("regular") - 0.2, pop(700), -3); add(at("difference") - 0.1, pop(560), -2)
# t3 pipeline
for i in range(4): add(S["t3"] + 0.45 + i * 0.22, pop(600 + 60 * i), -5)
add(at("caused") - 0.1, buzz(), -8)
# t4 gate + slots
add(S["t4"] + 0.25, pop(520), -4)
for i in range(4): add(at("remaining") + (i + 1) * 0.12, tick(1200 + 60 * i), -4)
# t5 artwork
for i in range(5): add(S["t5"] + 0.4 + i * 0.1, pop(640 + 40 * i), -7)
for i in range(5): add(at("test", 0) + i * 0.28, tick(1500), -5)
# t6 render order
add(at("issue."), buzz(), -5); add(at("correctly", 0) - 0.1, whoosh(0.5), -7, 0.25); add(at("correctly", 0) + 0.65, chime(), -6)
# t7 rattle
add(at("rig", 0), buzz(), -6); add(at("rig", 1), pop(480), -4)
add(at("editor,") - 0.1, chime(), -5); add(at("apk.", 1) - 0.2, buzz(), -5)
# next step
add(at("resolve") - 0.1, pop(660), -3); add(at("art") - 0.1, pop(740), -3); add(at("ready") - 0.1, pop(820), -3)
add(at("pipeline"), chime(1318.5), -4)
# end
for i in range(3): add(S["end"] + 0.1 + i * 0.12, pop(700 + 80 * i), -4)
add(S["end"] + 0.5, chime(1567.98), -3)

# ---------------------------------------------------------------- render bus
bus = np.zeros(int(DUR * SR) + SR)
for t0, snd, db in E:
    i = int(max(0, t0) * SR)
    s = snd / (np.abs(snd).max() + 1e-9) * 10 ** (db / 20)
    bus[i:i + len(s)] += s[: len(bus) - i]
bus = bus[: int(DUR * SR)]
st = np.stack([bus, bus], 1).astype(np.float32)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "pcm_f32le", OUT],
               input=st.tobytes(), check=True)
print(f"{len(E)} sound effects -> {OUT}")
