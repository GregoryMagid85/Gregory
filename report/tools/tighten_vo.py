"""Tighten a narration take: cap long pauses, then speed up (pitch preserved), and remap word times exactly.
usage: python3 tools/tighten_vo.py in.wav words.json out.wav out_words.json [max_pause=0.42] [tempo=1.05]
"""
import sys, json, subprocess
import numpy as np
inp, wj, out, owj = sys.argv[1:5]
MAXP = float(sys.argv[5]) if len(sys.argv) > 5 else 0.42
TEMPO = float(sys.argv[6]) if len(sys.argv) > 6 else 1.05
SR = 48000
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", inp, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32).astype(np.float64)
words = json.load(open(wj))
# pauses = gaps between consecutive words (word timings are the ground truth for speech)
cuts = []  # (start, end) of removed audio, seconds
for (_, s0, e0), (_, s1, e1) in zip(words[:-1], words[1:]):
    gap = s1 - e0
    if gap > MAXP:
        mid = (e0 + s1) / 2; rm = gap - MAXP
        cuts.append((mid - rm / 2, mid + rm / 2))
keep, pos, fade = [], 0, int(0.012 * SR)
for a, b in cuts:
    seg = x[int(pos * SR):int(a * SR)].copy(); keep.append(seg); pos = b
keep.append(x[int(pos * SR):])
y = keep[0]
for seg in keep[1:]:                                    # short crossfade at every splice
    if len(y) > fade and len(seg) > fade:
        r = np.linspace(0, 1, fade); y[-fade:] = y[-fade:] * (1 - r) + seg[:fade] * r; y = np.concatenate([y, seg[fade:]])
    else: y = np.concatenate([y, seg])
tmp = out + ".tmp.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f64le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "pcm_s24le", tmp], input=y.tobytes(), check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", f"atempo={TEMPO}", "-ar", str(SR), "-c:a", "pcm_s24le", out], check=True)
subprocess.run(["rm", "-f", tmp])
def remap(t):
    removed = sum(min(b, t) - a for a, b in cuts if t > a)
    return round((t - removed) / TEMPO, 3)
json.dump([[w, remap(s), remap(e)] for w, s, e in words], open(owj, "w"), ensure_ascii=False)
old = len(x) / SR; new = (len(y) / SR) / TEMPO
print(f"{len(cuts)} pauses shortened, tempo x{TEMPO}: {old:.1f}s -> {new:.1f}s")
