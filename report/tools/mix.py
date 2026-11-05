"""Broadcast-style mix: narration on top, music bed ducked under the voice.

    python3 tools/mix.py public/audio/vo.mp3 public/audio/music.mp3 80 out/mix.wav [out/sfx.wav]

1. Voice: high-pass 90 Hz, gentle compression, set to -16 LUFS (the reference level).
2. Music: set so that in pauses it sits ~15 LU under the voice (-31 LUFS) and while the
   narrator speaks it drops a further 12 dB (~27 LU under the voice). It is also softened
   (6.5 kHz low-pass, light compression) so its transients don't pull attention. Ducking is driven by
   the voice's own envelope with a 0.25 s look-ahead, 0.15 s attack, 0.7 s release, and
   only lifts in pauses longer than 0.9 s, so it never pumps between words.
   A deep 2.5 kHz dip in the music leaves room for speech intelligibility.
3. Optional SFX bus (4th input): effects peak ~20 dB under the voice peaks and dip 4 dB
   more while the narrator speaks, band-limited 180 Hz-7 kHz so nothing is sharp.
4. Fade music in/out, sum, true-peak limit to -1 dBTP.
"""
import subprocess, sys, re
import numpy as np

VO, MUSIC, DUR, OUT = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]
SFX = sys.argv[5] if len(sys.argv) > 5 else None
SFX_PEAK_DB, SFX_DUCK_DB = -22.0, -4.0   # each effect peaks ~20 dB under the voice peaks; -4 dB more while speaking
SR = 48000
VOICE_LUFS, BED_GAP_LU, DUCK_DB = -16.0, -15.0, -12.0


def ff(args, inp=None):
    return subprocess.run(["ffmpeg", "-hide_banner", "-v", "error", "-y", *args], input=inp, capture_output=True, check=True).stdout


def decode(path, af):
    raw = ff(["-i", path, "-t", str(DUR), "-af", af, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"])
    x = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
    n = int(DUR * SR)
    return np.pad(x, ((0, max(0, n - len(x))), (0, 0)))[:n]


def lufs(x):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-af", "ebur128", "-f", "null", "-"],
                       input=x.astype(np.float32).tobytes(), capture_output=True)
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr.decode())[-1])


# --- voice
vo = decode(VO, "highpass=f=90,acompressor=threshold=-22dB:ratio=3:attack=8:release=120:makeup=2")
vo *= 10 ** ((VOICE_LUFS - lufs(vo)) / 20)

# --- music bed (with a presence dip so consonants cut through)
mu = decode(MUSIC, "equalizer=f=2500:t=q:w=1.4:g=-7,equalizer=f=250:t=q:w=1:g=-3,lowpass=f=6500,acompressor=threshold=-24dB:ratio=3:attack=20:release=250")
mu *= 10 ** ((VOICE_LUFS + BED_GAP_LU - lufs(mu)) / 20)

# --- speech mask from the voice envelope (10 ms hops)
hop = SR // 100
env = np.sqrt(np.mean(vo[: len(vo) // hop * hop].reshape(-1, hop, 2) ** 2, axis=(1, 2)) + 1e-12)
speech = 20 * np.log10(env) > -42
# bridge pauses shorter than 0.9 s so the bed doesn't pump between words
idx = np.flatnonzero(speech)
for a, b in zip(idx[:-1], idx[1:]):
    if 1 < b - a <= 90:
        speech[a:b] = True
# look-ahead: start ducking 0.25 s before speech
speech = np.maximum(speech, np.r_[speech[25:], np.zeros(25, bool)])

# --- smooth gain (dB) with attack/release, then upsample
target = np.where(speech, DUCK_DB, 0.0)
g = np.zeros_like(target)
cur = 0.0
a_att, a_rel = np.exp(-1 / 15), np.exp(-1 / 70)  # 0.15 s down, 0.7 s up (in 10 ms steps)
for i, tg in enumerate(target):
    k = a_att if tg < cur else a_rel
    cur = tg + (cur - tg) * k
    g[i] = cur
gain = 10 ** (np.interp(np.arange(len(mu)) / hop, np.arange(len(g)), g) / 20)
# fades
t = np.arange(len(mu)) / SR
gain *= np.clip(t / 1.0, 0, 1) * np.clip((DUR - t) / 3.0, 0, 1)
mu *= gain[:, None]

# --- sound effects: soft, placed on screen events (tools/sfx.py), dipped a little under speech
fx = np.zeros_like(vo)
if SFX:
    fx = decode(SFX, "highpass=f=180,lowpass=f=7000") * 10 ** (SFX_PEAK_DB / 20)
    fxg = 10 ** (np.interp(np.arange(len(fx)) / hop, np.arange(len(g)), g * (SFX_DUCK_DB / DUCK_DB)) / 20)
    fx *= fxg[:, None]

# --- sum + true-peak limit
mix = vo + mu + fx
raw = ff(["-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
          "-af", "aresample=192000,alimiter=limit=0.89:attack=2:release=80:level=0,aresample=48000",
          "-c:a", "pcm_s24le", OUT], inp=mix.astype(np.float32).tobytes())

# --- report
sp = np.repeat(speech, hop)[: len(mu)]
sp = np.pad(sp, (0, len(mu) - len(sp)))
rms = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
print(f"voice {lufs(vo):.1f} LUFS | music under speech {rms(mu[sp]) - rms(vo[sp]):.1f} dB vs voice | "
      f"music in pauses {rms(mu[~sp & (t > 1) & (t < DUR - 3)]):.1f} dBFS rms | mix {lufs(mix):.1f} LUFS")
