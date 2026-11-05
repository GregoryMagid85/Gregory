"""words.json (Whisper [[word,start,end],...]) -> src/glass/words.ts
usage: python3 tools/glass_words.py glass_vo/<take>_words.json "<label>"
"""
import json, sys
w = json.load(open(sys.argv[1])); label = sys.argv[2]
out = []
for t, s, e in w:
    if out and t.startswith(("-", ",")):  # whisper splits "Syro -Palestinian", "2 ,000"
        out[-1][0] += t if t.startswith(",") else t; out[-1][2] = e; continue
    if out and out[-1][0] == "Syro" and t.startswith("Palestinian"):
        out[-1][0] += "-" + t; out[-1][2] = e; continue
    out.append([t, s, e])
rows = ",\n".join(json.dumps(x) for x in out)
open("src/glass/words.ts", "w").write(f"""// Narration word timings ({label}), transcribed with Whisper. Regenerate with tools/glass_words.py.
export type Word = {{ text: string; start: number; end: number }};
const raw: [string, number, number][] = [
{rows}
];
export const WORDS: Word[] = raw.map(([text, start, end]) => ({{ text, start, end }}));
export const VO_LABEL = {json.dumps(label)};
""")
print(len(out), "words")
