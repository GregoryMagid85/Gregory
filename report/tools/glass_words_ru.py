"""Russian take: Whisper words -> src/glass/words_ru.ts (with caption fix-ups).
usage: python3 tools/glass_words_ru.py glass_vo/ru_words.json
"""
import json, sys
w = json.load(open(sys.argv[1])); out = []
FIX = {"Стекло": "стекло", "сиропалестинском": "сиро-палестинском", "средиземноморью": "Средиземноморью", "римской": "Римской", "стеклодели.": "стеклоделия.", "все.": "всё.", "Инстаграм": "Instagram"}
i = 0
while i < len(w):
    t, s, e = w[i]
    t = FIX.get(t, t)
    if t == "–" and out: out[-1][0] += " –"; i += 1; continue            # dash joins the word before it
    if t.startswith("-") and out: out[-1][0] += t; out[-1][2] = e; i += 1; continue   # "по -настоящему"
    if t == "Собака":                                                       # "Собака Ольга – нижнее подчеркивание Розин" = @olga_rozin
        j = i
        while j < len(w) and not w[j][0].startswith("Розин"): j += 1
        out.append(["@olga_rozin" + ("," if w[j][0].endswith(",") else ""), s, w[j][2]]); i = j + 1; continue
    out.append([t, s, e]); i += 1
rows = ",\n".join(json.dumps(x, ensure_ascii=False) for x in out)
open("src/glass/words_ru.ts", "w").write(f"""// Russian narration word timings (Whisper). Regenerate with tools/glass_words_ru.py.
const raw: [string, number, number][] = [
{rows}
];
export const WORDS_RU = raw.map(([text, start, end]) => ({{ text, start, end }}));
""")
print(len(out), "words")
