# Offline stand-in VO (Kokoro-82M) + phrase/word timings for captions.
import sys, json, re, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
TTS = sys.argv[1]; OUT = sys.argv[2]; VOICE = sys.argv[3] if len(sys.argv) > 3 else 'am_puck'
SR = 24000
# scenes: list of (scene_id, [phrases]); pause after phrase by punctuation
SCRIPT = json.load(open(sys.argv[4]))
k = Kokoro(f'{TTS}/kokoro-fp16.onnx', f'{TTS}/voices.bin')
out, words, t, sc_t, pid = [], [], 0.0, {}, 0
def trim(a, thr=0.01):
    idx = np.where(np.abs(a) > thr)[0]
    return a[max(0, idx[0]-240): idx[-1]+480] if len(idx) else a
def syl(w):
    w = re.sub(r'[^a-z]', '', w.lower()) or 'x'
    n = len(re.findall(r'[aeiouy]+', w)); n -= 1 if w.endswith('e') and n > 1 else 0
    return max(1, n) + 0.3
for sid, lead, phrases in SCRIPT:
    out.append(np.zeros(int(lead*SR), np.float32)); t += lead
    sc_t[sid] = t
    for ph in phrases:
        for sp in (1.08, 1.1, 1.05, 1.0, 1.03):
            a, _ = k.create(ph, voice=VOICE, speed=sp, lang='en-us')
            if len(a) > 2400: break
        assert len(a) > 2400, ph
        a = trim(a.astype(np.float32)); d = len(a)/SR
        ws = ph.split(); wt = np.array([syl(w) for w in ws]); edges = np.concatenate([[0], np.cumsum(wt)])/wt.sum()
        for i, w in enumerate(ws):
            words.append({'w': w, 's': round(t + 0.03 + edges[i]*(d-0.06), 3), 'e': round(t + 0.03 + edges[i+1]*(d-0.06), 3), 'scene': sid, 'p': pid})
        out.append(a); t += d; pid += 1
        gap = 0.42 if ph.rstrip()[-1] in '.!?' else 0.16
        out.append(np.zeros(int(gap*SR), np.float32)); t += gap
y = np.concatenate(out); y = y / (np.abs(y).max()+1e-9) * 0.89
sf.write(OUT + '/vo_raw.wav', y, SR)
json.dump({'duration': t, 'scenes': sc_t, 'words': words}, open(OUT + '/words.json', 'w'), indent=1)
print('dur', round(t,2), sc_t)
