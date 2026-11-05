import sys, json
from faster_whisper import WhisperModel
m = WhisperModel(sys.argv[1], device="cpu", compute_type="int8", cpu_threads=4)
import numpy as np
audio = np.fromfile(sys.argv[2], dtype=np.float32)
segs, info = m.transcribe(audio, language="en", word_timestamps=True, beam_size=5,
    initial_prompt=sys.argv[4] if len(sys.argv) > 4 else None)
words = []
for s in segs:
    for w in s.words: words.append([w.word.strip(), round(w.start, 3), round(w.end, 3)])
json.dump(words, open(sys.argv[3], "w"))
print(" ".join(w[0] for w in words))
