"""Generate the HyperFrames scenes for Glass Stories Ep.1 ("The Blueprint of a Breath") from the narration timings.

    python3 build.py            -> index.html + compositions/*.html

Every cue is a narration word (assets/words.json, absolute seconds incl. the 7.4 s cold open), so a new take
re-times the whole film by regenerating words.json. Each chapter is one composition: a large blueprint "world"
the camera travels across without cutting (continuous take); reveals are seek-safe GSAP tweens; the camera is a
pure function of time driven by one linear clock.
"""
import json, re, html

W = json.load(open("assets/words.json"))
MAP = json.load(open("assets/map.json"))
HOOK, FPS = 7.4, 30
LAST = W[-1]["end"]
DUR = round(LAST + 8.8, 2)                       # outro ~8 s after the last word
norm = lambda s: re.sub(r"[^\w@']", "", s.lower())
def T(word, n=0):
    hits = [w["start"] for w in W if norm(w["text"]) == norm(word)]
    if n >= len(hits): raise SystemExit(f"cue not in narration: {word}#{n}")
    return hits[n]

C = dict(ink="#EAF2FA", ink2="#9CC3E6", paper="#16395C", grid="#2A5B86", grid2="#3B6E9C", hot="#FF8A1F", hot2="#FFD27A")
FONT = """@font-face{font-family:'Cormorant Garamond';font-weight:700;src:url('assets/fonts/cormorant-garamond-latin-700-normal.woff2') format('woff2');}
@font-face{font-family:'Cormorant Garamond';font-weight:600;src:url('assets/fonts/cormorant-garamond-latin-600-normal.woff2') format('woff2');}
@font-face{font-family:'Cormorant Garamond';font-style:italic;font-weight:500;src:url('assets/fonts/cormorant-garamond-latin-500-italic.woff2') format('woff2');}"""
PAPER = f"""background-color:{C['paper']};
background-image:linear-gradient({C['grid2']}66 1.5px,transparent 1.5px),linear-gradient(90deg,{C['grid2']}66 1.5px,transparent 1.5px),
linear-gradient({C['grid']}55 1px,transparent 1px),linear-gradient(90deg,{C['grid']}55 1px,transparent 1px);
background-size:200px 200px,200px 200px,40px 40px,40px 40px;"""
BASE_CSS = f"""
#root{{position:absolute;inset:0;overflow:hidden;{PAPER}}}
#root .world{{position:absolute;left:0;top:0;transform-origin:0 0;will-change:transform}}
#root .paper{{position:absolute;{PAPER}}}
#root .vign{{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 45%,transparent 55%,rgba(6,18,32,.55) 100%)}}
#root .noise{{position:absolute;inset:0;pointer-events:none;opacity:.05;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' seed='4'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>")}}
#root .disp{{position:absolute;font-family:'Cormorant Garamond',serif;font-weight:700;color:{C['ink']};line-height:1.0;letter-spacing:-0.01em;white-space:nowrap}}
#root .lab{{position:absolute;font-family:Inter,sans-serif;font-weight:700;color:{C['ink']};font-size:34px;white-space:nowrap}}
#root .hot{{color:{C['hot']}}}
#root .win{{position:absolute;overflow:hidden;background:#000;box-shadow:0 0 0 3px {C['ink']},0 24px 60px rgba(4,12,22,.6)}}
#root .win video{{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover}}
#root .plate{{position:absolute;overflow:hidden;box-shadow:0 0 0 3px {C['ink']},0 26px 60px rgba(4,12,22,.55)}}
#root .plate .pi{{position:absolute;left:0;top:0;width:100%;height:100%;will-change:transform}}
#root .plate img{{width:100%;height:100%;object-fit:cover;display:block}}
#root svg{{position:absolute;overflow:visible}}
#root .stk{{fill:none;stroke:{C['ink']};stroke-width:4;stroke-linecap:round;stroke-linejoin:round}}
#root .stk2{{fill:none;stroke:{C['ink2']};stroke-width:3;stroke-linecap:round;stroke-dasharray:2 12}}
#root .hotf{{fill:{C['hot']}}}
"""

# ---------------------------------------------------------------- element helpers (world coordinates)
class Scene:
    def __init__(self, cid, a, b):
        self.cid, self.a, self.b = cid, a, b
        self.html, self.js, self.css, self.n = [], [], [], 0
        self.cam = []                         # (t_local, cx, cy, scale)
    def L(self, t):                                  # absolute -> local; a cue far outside the scene is a wrong word match
        if t < self.a - 0.6 or t > self.b + 0.6: raise SystemExit(f"{self.cid}: cue at {t:.2f}s is outside {self.a:.2f}-{self.b:.2f}")
        return max(0.0, round(t - self.a, 3))
    def id(self, p): self.n += 1; return f"{self.cid}-{p}{self.n}"
    # camera keys (absolute times): camera looks at (cx, cy) in world px with zoom s
    def key(self, t, cx, cy, s=1.0): self.cam.append((self.L(t), cx, cy, s))
    # ------------------------------------------------------------ content
    def disp(self, text, x, y, size, t, hot=(), italic=False, align="left", color=None, per_word=True, out=None):
        i = self.id("d"); words = text.split(" ")
        spans = "".join(f'<span class="w{(" hot" if k in hot else "")}" style="display:inline-block;margin-right:.24em">{html.escape(w)}</span>' for k, w in enumerate(words))
        style = f"left:{x}px;top:{y}px;font-size:{size}px;" + ("font-style:italic;font-weight:500;" if italic else "") + (f"color:{color};" if color else "")
        if align == "center": style = style.replace(f"left:{x}px;", f"left:{x - 960}px;width:1920px;") + "text-align:center;"
        self.html.append(f'<div id="{i}" class="disp" style="{style}">{spans}</div>')
        self.js.append(f'tl.fromTo("#{i} .w",{{opacity:0,filter:"blur(8px)"}},{{opacity:1,filter:"blur(0px)",duration:0.2,ease:"expo.out",stagger:0.08}},{self.L(t)});')
        if out: self.js.append(f'tl.to("#{i} .w",{{opacity:0,filter:"blur(6px)",duration:0.15,ease:"power3.in",stagger:0.03}},{self.L(out)});')
        return i
    def lab(self, text, x, y, t, size=34, color=None, out=None):
        i = self.id("l")
        self.html.append(f'<div id="{i}" class="lab" style="left:{x}px;top:{y}px;font-size:{size}px;{("color:"+color+";") if color else ""}">{html.escape(text)}</div>')
        self.js.append(f'tl.fromTo("#{i}",{{opacity:0,filter:"blur(6px)"}},{{opacity:1,filter:"blur(0px)",duration:0.18,ease:"power2.out"}},{self.L(t)});')
        if out: self.js.append(f'tl.to("#{i}",{{opacity:0,duration:0.15}},{self.L(out)});')
        return i
    def sketch(self, paths, t, dur=0.6, stagger=0.12, x=0, y=0, w=2000, h=1200, cls="stk", extra=""):
        """paths: list of d strings (world coords relative to x,y), drawn on in order"""
        i = self.id("s"); EV.append((round(t, 3), "pencil"))
        body = "".join(f'<path class="{cls} p" pathLength="100" stroke-dasharray="100 120" stroke-dashoffset="110" d="{d}"/>' for d in paths)
        self.html.append(f'<svg id="{i}" style="left:{x}px;top:{y}px" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{body}{extra}</svg>')
        if cls == "stk2":
            self.html[-1] = self.html[-1].replace(' pathLength="100" stroke-dasharray="100 120" stroke-dashoffset="110"', '')
            self.js.append(f'tl.fromTo("#{i} .p",{{opacity:0}},{{opacity:1,duration:{dur},ease:"power2.out",stagger:{stagger}}},{self.L(t)});')
        else:
            self.js.append(f'tl.fromTo("#{i} .p",{{strokeDashoffset:110}},{{strokeDashoffset:0,duration:{dur},ease:"power2.inOut",stagger:{stagger}}},{self.L(t)});')
        return i
    def video(self, name, x, y, w, h, t_in, t_out, media=0.0, rate=1.0, pos="50% 50%", appear=0.35, enter="iris"):
        """a footage window cut into the blueprint; the <video> itself is the timed clip"""
        i = self.id("v"); s = max(self.a, t_in - appear); EV.append((round(s, 3), "window"))
        self.html.append(f'<div id="{i}" class="win" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;clip-path:inset(50% 50% 50% 50%)">'
                         f'<video id="{i}m" class="clip" data-start="{self.L(s)}" data-duration="{round(t_out - s + 0.6, 3)}" data-media-start="{media}" '
                         f'data-playback-rate="{rate}" muted playsinline src="assets/clips/{name}.mp4" style="object-position:{pos}"></video></div>')
        self.js.append(f'tl.fromTo("#{i}",{{clipPath:"inset(50% 50% 50% 50%)"}},{{clipPath:"inset(0% 0% 0% 0%)",duration:{appear},ease:"expo.out"}},{self.L(s)});')
        return i
    def plate(self, name, x, y, w, h, t_in, t0, t1, fx0=0.3, fx1=0.7, z0=1.35, z1=1.0, rot=0):
        """an era image pinned to the sheet; inside, the camera pans left->right and pulls back (t0..t1)"""
        i = self.id("p"); EV.append((round(t_in, 3), "paper"))
        self.html.append(f'<div id="{i}" class="plate" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;rotate:{rot}deg;opacity:0">'
                         f'<div class="pi"><img src="assets/art/{name}.png" alt=""></div></div>')
        self.js.append(f'tl.fromTo("#{i}",{{opacity:0,scale:0.92}},{{opacity:1,scale:1,duration:0.6,ease:"expo.out"}},{self.L(t_in)});')
        # pan: xPercent from left-weighted to right-weighted, zoom out (scale z0 -> z1)
        dx0, dx1 = (0.5 - fx0) * 100 * (z0 - 1) * 1.4, (0.5 - fx1) * 100 * (z1 - 1) * 1.4
        self.js.append(f'tl.fromTo("#{i} .pi",{{scale:{z0},xPercent:{dx0:.1f}}},{{scale:{z1},xPercent:{dx1:.1f},duration:{round(t1 - t0, 3)},ease:"power1.inOut"}},{self.L(t0)});')
        return i
    def pin(self, x, y, t, color=None):
        i = self.id("pin"); col = color or C["hot"]; EV.append((round(t, 3), "pin"))
        self.html.append(f'<svg id="{i}" style="left:{x - 40}px;top:{y - 40}px" width="80" height="80"><circle cx="40" cy="40" r="30" fill="none" stroke="{col}" stroke-width="4" class="ring"/><circle cx="40" cy="40" r="10" fill="{col}"/></svg>')
        self.js.append(f'tl.fromTo("#{i}",{{scale:0,transformOrigin:"50% 50%"}},{{scale:1,duration:0.5,ease:"back.out(2)"}},{self.L(t)});')
        return i
    def raw(self, h, js=""):
        self.html.append(h)
        if js: self.js.append(js)
    # ------------------------------------------------------------ output
    def file(self, world_w, world_h, bg=None, extra_css="", after_world="", head_js="", module=""):
        cam = sorted(self.cam) or [(0, 960, 540, 1.0)]
        for k0, k1 in zip(cam[:-1], cam[1:]):
            if (k0[1], k0[2], k0[3]) != (k1[1], k1[2], k1[3]):
                travel = min(1.0, max(0.01, 0.5 * (k1[0] - k0[0])))
                EV.append((round(self.a + k1[0] - travel, 3), "dive" if k1[3] / k0[3] > 4 else "whoosh"))
        dur = round(self.b - self.a, 3)
        return f"""<template>
<style>{FONT}{BASE_CSS}{extra_css}
#{self.cid}-world{{width:{world_w}px;height:{world_h}px}}
</style>
<div id="root" data-composition-id="{self.cid}" data-width="1920" data-height="1080" data-duration="{dur}" style="{('background:' + bg) if bg else ''}">
  <div id="{self.cid}-world" class="world">
{chr(10).join('    ' + h for h in self.html)}
  </div>
  {after_world}
  <div class="vign"></div><div class="noise"></div>
</div>
<script>
(function(){{
  const tl = gsap.timeline({{ paused: true }});
  const world = document.getElementById("{self.cid}-world");
  const K = {json.dumps(cam)};
  const ease = (x) => x < 0.5 ? 2*x*x : 1 - Math.pow(-2*x + 2, 2) / 2;   // power2.inOut
  function camAt(t) {{
    // continuous take: between keys the camera travels; while holding it keeps a slow 1%/s push
    let k0 = K[0], k1 = K[0];
    for (let i = 0; i < K.length; i++) {{ if (t >= K[i][0]) {{ k0 = K[i]; k1 = K[i + 1] || K[i]; }} }}
    if (t < K[0][0]) {{ k0 = k1 = K[0]; }}
    const travel = Math.min(1.0, Math.max(0.01, 0.5 * (k1[0] - k0[0])));
    const m = k1 === k0 ? 0 : ease(Math.min(1, Math.max(0, (t - (k1[0] - travel)) / travel)));
    const drift = 1 + 0.010 * Math.max(0, t - k0[0]) * (1 - m);
    const cx = k0[1] + (k1[1] - k0[1]) * m, cy = k0[2] + (k1[2] - k0[2]) * m;
    const s = k0[3] * Math.pow(k1[3] / k0[3], m) * Math.min(drift, 1.06);
    return [cx, cy, s];
  }}
  const clock = {{ t: 0 }};
  function render(t) {{
    const [cx, cy, s] = camAt(t);
    world.style.transform = "translate(" + (960 - cx * s).toFixed(2) + "px," + (540 - cy * s).toFixed(2) + "px) scale(" + s.toFixed(5) + ")";
    if (window.__render_{self.cid.replace('-', '_')}) window.__render_{self.cid.replace('-', '_')}(t);
  }}
  tl.to(clock, {{ t: {dur}, duration: {dur}, ease: "none", onUpdate: () => render(clock.t) }}, 0);
  render(0);
  {head_js}
  {chr(10).join('  ' + j for j in self.js)}
  window.__timelines = window.__timelines || {{}};
  window.__timelines["{self.cid}"] = tl;
}})();
</script>
{module}
</template>
"""

SCENES = []   # (cid, a, b, file text)
EV = []       # (absolute time, kind) for the sound design

# ================================================================ 0. HOOK (0 - 4.6) + OR sting (4.4 - 7.6)
s = Scene("hook", 0.0, 7.6)
cuts = [("glory_hole", 0.0, 0.4), ("olga_blow", 0.8, 1.6), ("red_bubble", 1.6, 0.2), ("torch", 2.45, 0.9), ("rose_torch", 3.3, 0.4)]
for k, (nm, t0, med) in enumerate(cuts):
    t1 = cuts[k + 1][1] if k + 1 < len(cuts) else 4.45
    i = s.id("hv")
    s.raw(f'<div id="{i}" class="win" style="left:1140px;top:0px;width:608px;height:1080px;box-shadow:none;background:transparent">'
          f'<video id="{i}m" class="clip" data-start="{t0}" data-duration="{round(t1 - t0, 3)}" data-media-start="{med}" data-playback-rate="1.25" muted playsinline src="assets/clips/{nm}.mp4"></video></div>',
          f'tl.fromTo("#{i}",{{scale:1.12}},{{scale:1,duration:0.45,ease:"expo.out"}},{t0});')
# a chalk bubble sketch draws beside the footage while the words slam
s.sketch(["M180 760 L700 760", "M700 760 C760 600 1000 560 1060 700 C1110 820 960 900 820 860 C760 840 720 800 700 760",
          "M150 742 L150 778", "M980 640 C1000 660 1010 690 1005 720"], 0.1, dur=0.9, stagger=0.25)
for (txt, t0, t1, y) in [("ONE BREATH.", 0.15, 1.5, 300), ("ONE IDEA.", 1.6, 2.95, 300), ("2,000 YEARS", 3.05, 4.45, 250)]:
    i = s.disp(txt, 120, y, 150, t0, out=t1)
s.disp("OF GLASS.", 120, 420, 150, 3.25, hot=(1,), out=4.45)
s.key(0, 960, 540, 1.0)
# the OR monogram on black, chrome shine pass, then the episode title
s.raw(f'<div id="hook-black" style="position:absolute;left:0;top:0;width:1920px;height:1080px;background:#050505;opacity:0"></div>'
      f'<img id="hook-logo" src="assets/art/olga_logo_cut.png" style="position:absolute;left:660px;top:120px;width:600px;opacity:0" alt="">'
      f'<div id="hook-shine" style="position:absolute;left:660px;top:120px;width:600px;height:400px;opacity:0;mix-blend-mode:screen;'
      f'background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.9) 50%,transparent 65%);-webkit-mask:url(assets/art/olga_logo_cut.png) center/contain no-repeat;mask:url(assets/art/olga_logo_cut.png) center/contain no-repeat"></div>'
      f'<div id="hook-t1" class="lab" style="left:0;width:1920px;text-align:center;top:620px;font-size:30px;letter-spacing:.32em;color:#BFC6CE;opacity:0">GLASS STORIES · EPISODE 1</div>'
      f'<div id="hook-t2" class="disp" style="left:0;width:1920px;text-align:center;top:680px;font-size:112px;color:#F2F4F6;opacity:0">The Invention of Glassblowing</div>',
      'tl.fromTo("#hook-black",{opacity:0},{opacity:1,duration:0.25,ease:"power2.in"},4.3);'
      'tl.fromTo("#hook-logo",{opacity:0,scale:1.15,filter:"blur(10px)"},{opacity:1,scale:1,filter:"blur(0px)",duration:0.9,ease:"expo.out"},4.55);'
      'tl.fromTo("#hook-shine",{opacity:0,backgroundPosition:"-600px 0"},{opacity:1,backgroundPosition:"600px 0",duration:1.0,ease:"power2.inOut"},5.0);'
      'tl.fromTo("#hook-t1",{opacity:0,scale:1.08},{opacity:1,scale:1,duration:0.8,ease:"expo.out"},5.3);'
      'tl.fromTo("#hook-t2",{opacity:0,filter:"blur(8px)"},{opacity:1,filter:"blur(0px)",duration:0.5,ease:"expo.out"},5.6);'
      'tl.to(["#hook-logo","#hook-t1","#hook-t2"],{opacity:0,duration:0.3,ease:"power3.in"},7.25);')
SCENES.append((s.cid, s.a, s.b, s.file(1920, 1080)))

# ================================================================ 1. SHEET 1 — luxury, first glass, the problem, the timeline (7.4 - 33.0)
a, b = HOOK - 0.15, T("glassblowing") - 0.05
s = Scene("sheet1", a, b)
# station A (0..1920, 0..1080): a rare luxury
s.video("tumbler", 1180, 90, 540, 900, T("before"), T("everyday"), media=0.0)
s.video("goblets", 1180, 90, 540, 900, T("everyday") - 0.05, T("rare"))
s.video("candles", 1180, 90, 540, 900, T("rare") - 0.1, T("now") + 0.5)
for k, (w, cue) in enumerate([("Art", "art,"), ("Windows", "windows,"), ("Everyday objects", "everyday")]):
    s.disp(w, 160, 170 + k * 110, 84, T(cue) - 0.05)
    s.sketch([f"M150 {225 + k * 110} L{150 + (130 if k == 0 else 330 if k == 1 else 600)} {215 + k * 110}"], T("rare") - 0.25 + k * 0.1, dur=0.25, cls="stk", w=900, h=600)
s.disp("A rare", 160, 560, 150, T("rare") - 0.1)
s.disp("luxury.", 160, 710, 190, T("luxury."), hot=(0,))
s.key(HOOK, 960, 540, 1.0)
# station B (2200..5200, 0..1900): the map of the first glass
MX, MY = 2200, 0
s.raw(f'<svg id="sheet1-map" style="left:{MX}px;top:{MY}px" width="{MAP["W"]}" height="{MAP["H"]}" viewBox="0 0 {MAP["W"]} {MAP["H"]}">'
      f'<path class="stk mp" pathLength="100" stroke-dasharray="100 120" stroke-dashoffset="110" d="{MAP["d"]}" style="stroke-width:3;fill:#1D4670"/></svg>',
      f'tl.fromTo("#sheet1-map .mp",{{strokeDashoffset:110,fillOpacity:0}},{{strokeDashoffset:0,fillOpacity:1,duration:1.6,ease:"power2.inOut"}},{s.L(T("now") - 0.2)});')
P = MAP["pts"]
s.pin(MX + P["mideast"][0], MY + P["mideast"][1], T("middle"))
s.lab("Middle East", MX + P["mideast"][0] + 40, MY + P["mideast"][1] - 80, T("middle"), size=40)
s.pin(MX + P["egypt"][0], MY + P["egypt"][1], T("egypt."))
s.lab("Egypt", MX + P["egypt"][0] + 40, MY + P["egypt"][1] - 20, T("egypt."), size=40)
s.disp("The first glass", MX + 1350, MY + 700, 96, T("earliest") - 0.1)
s.lab("thousands of years ago", MX + 1355, MY + 820, T("earliest") + 0.3, size=52, color=C["ink2"])
s.plate("mesopotamia", MX + 2480, MY + 860, 520, 520, T("ancient"), T("ancient"), T("but") + 0.3, fx0=0.25, fx1=0.75, rot=2)
s.plate("egypt", MX + 1600, MY + 1080, 520, 520, T("egypt.") - 0.2, T("egypt.") - 0.2, T("but") + 0.3, fx0=0.25, fx1=0.75, rot=-2)
s.key(T("now") + 0.6, MX + 2100, MY + 1150, 0.62)
s.key(T("egypt.") - 0.2, MX + 2150, MY + 1250, 0.72)
# station C (5600..7500, 0..1300): the problem — a core-formed vessel drafted, a stopwatch
PX, PY = 5600, 300
vessel = ["M300 120 L380 120", "M310 120 L310 180 C180 230 150 420 200 560 C240 660 300 700 340 720 C380 700 440 660 480 560 C530 420 500 230 370 180 L370 120",
          "M250 260 C330 230 420 260 440 300", "M230 360 C330 330 430 360 455 400", "M225 460 C330 430 430 460 455 500", "M240 560 C320 530 400 560 440 590"]
s.sketch(vessel, T("making") - 0.1, dur=0.7, stagger=0.18, x=PX, y=PY, w=900, h=900)
s.sketch(["M340 250 C270 300 260 520 340 620 C420 520 410 300 340 250"], T("hollow") + 0.1, dur=0.6, x=PX, y=PY, w=900, h=900, cls="stk2")
s.lab("clay core", PX + 520, PY + 380, T("hollow") + 0.4, color=C["ink2"])
s.lab("hollow vessel", PX + 520, PY + 200, T("vessel"), color=C["ink2"])
s.sketch(["M1080 300 m-120 0 a120 120 0 1 0 240 0 a120 120 0 1 0 -240 0", "M1080 180 L1080 150", "M1050 150 L1110 150", "M1080 300 L1080 220", "M1080 300 L1150 330"],
         T("slow") - 0.2, dur=0.4, stagger=0.08, x=PX, y=PY, w=1500, h=900)
s.disp("slow", PX + 950, PY + 520, 130, T("slow"), hot=(0,))
s.disp("& difficult", PX + 950, PY + 660, 96, T("difficult"))
s.disp("But there was a problem.", PX + 60, PY - 60, 96, T("but"), italic=True)
s.key(T("but") + 0.5, PX + 760, PY + 380, 0.95)
# station D (8000..11000, 0..1080): the timeline — 1st century BCE ignites, the camera dives into the dot
TX, TY = 8000, 600
s.sketch([f"M0 0 L2600 0"], T("then") - 0.2, dur=1.4, x=TX, y=TY, w=2800, h=400)
for k, (fr, d1, d2) in enumerate([(0.0, "c. 2500 BCE", "first glass objects"), (0.42, "c. 1500 BCE", "core-formed vessels"), (0.94, "1st century BCE", "")]):
    x = TX + int(2600 * fr)
    s.sketch([f"M{x - TX} -30 L{x - TX} 30"], T("then") + fr * 1.2, dur=0.2, x=TX, y=TY, w=2800, h=400)
    s.lab(d1, x - 20, TY + 50, T("then") + fr * 1.2, size=64, color=C["hot"] if k == 2 else None)
    if d2: s.lab(d2, x - 20, TY + 135, T("then") + fr * 1.2 + 0.1, size=50, color=C["ink2"])
DX = TX + int(2600 * 0.94)
s.raw(f'<div id="sheet1-dot" style="position:absolute;left:{DX - 30}px;top:{TY - 30}px;width:60px;height:60px;border-radius:50%;background:radial-gradient(circle,{C["hot2"]},{C["hot"]} 60%,#C24E0A);opacity:0"></div>',
      f'tl.fromTo("#sheet1-dot",{{opacity:0,scale:0.2}},{{opacity:1,scale:1,duration:0.4,ease:"back.out(2)"}},{s.L(T("century") - 0.1)});')
s.disp("something remarkable happened.", TX + 300, TY - 260, 96, T("something"), italic=True)
s.key(T("then") + 0.2, TX + 1450, TY + 60, 0.62)
s.key(b - 0.05, DX, TY, 24.0)          # dive into the glowing dot: it becomes the furnace
SCENES.append((s.cid, s.a, s.b, s.file(11200, 2200)))

# ================================================================ 2. FURNACE — glassblowing was invented (33.0 - 36.8)
a, b = T("glassblowing") - 0.05, T("now", 1) - 0.25
s = Scene("furnace", a, b)
s.raw(f'<div id="furnace-flood" style="position:absolute;left:0;top:0;width:1920px;height:1080px;background:radial-gradient(circle at 50% 50%,{C["hot2"]},{C["hot"]} 55%,#B5450A)"></div>',
      f'tl.fromTo("#furnace-flood",{{opacity:1}},{{opacity:0,duration:0.45,ease:"power2.in"}},0.25);')
s.video("glory_gather", 1160, 0, 608, 1080, a + 0.05, T("changed") - 0.2, media=0.0, appear=0.4)
s.video("red_bubble", 1160, 0, 608, 1080, T("changed") - 0.25, b)
s.disp("Glassblowing", 120, 330, 170, T("glassblowing"), hot=(0,))
s.disp("was invented.", 130, 520, 96, T("invented."), italic=True)
s.disp("And that changed", 130, 700, 84, T("changed") - 0.5)
s.disp("everything.", 130, 800, 120, T("everything.", 0))
s.key(a, 960, 540, 1.0)
SCENES.append((s.cid, s.a, s.b, s.file(1920, 1080)))

# ================================================================ 3. SHEET 2 — where it began, the clay core, the blowpipe (36.8 - 56.2)
a, b = T("now", 1) - 0.25, T("blow") - 0.25
s = Scene("sheet2", a, b)
# station E: Levant zoom on the same map
s.raw(f'<svg id="sheet2-map" style="left:0px;top:0px" width="{MAP["W"]}" height="{MAP["H"]}" viewBox="0 0 {MAP["W"]} {MAP["H"]}">'
      f'<defs><pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="14" stroke="{C["hot"]}" stroke-width="4"/></pattern></defs>'
      f'<path class="stk" d="{MAP["d"]}" style="stroke-width:2;fill:#1D4670"/></svg>')
lx, ly = P["levant"]
s.raw(f'<svg id="sheet2-reg" style="left:{lx - 60}px;top:{ly - 140}px" width="120" height="300"><path d="M50 10 C80 40 90 120 80 170 C70 220 50 260 30 290 C20 250 15 200 22 150 C30 100 30 50 50 10 Z" fill="url(#hatch)" stroke="{C["hot"]}" stroke-width="3" class="reg"/></svg>',
      f'tl.fromTo("#sheet2-reg",{{opacity:0,scale:0.4,transformOrigin:"50% 50%"}},{{opacity:1,scale:1,duration:0.6,ease:"expo.out"}},{s.L(T("syro-palestinian") - 0.2)});')
jx, jy = P["jerusalem"]
s.pin(jx, jy, T("region.") + 0.1, color=C["ink"])
s.lab("Jerusalem · earliest evidence, c. 50 BCE", jx + 40, jy + 10, T("region.") + 0.2, size=15, color=C["ink"])
s.lab("Syro-Palestinian region", lx + 45, ly - 120, T("most"), size=13, color=C["hot"])
s.key(a, 1500, 950, 0.5)
s.key(T("technique") + 0.6, lx - 40, ly - 30, 3.2)
# station F (3600..): the clay-core infographic, toured part by part
FX, FY = 3600, 200
s.raw(f'<div id="sheet2-cc" class="plate" style="left:{FX}px;top:{FY}px;width:1672px;height:941px;opacity:0"><img src="assets/art/claycore.png" alt="" style="width:100%;height:100%"></div>',
      f'tl.fromTo("#sheet2-cc",{{opacity:0,scale:0.94}},{{opacity:1,scale:1,duration:0.7,ease:"expo.out"}},{s.L(T("you") - 0.3)});')
s.key(T("you") - 0.4, FX + 836, FY + 470, 1.08)
s.key(T("shape"), FX + 390, FY + 480, 2.0)
s.key(T("laborious") - 0.3, FX + 855, FY + 480, 2.0)
s.key(T("imagine.") - 0.6, FX + 1330, FY + 470, 2.0)
# station G (6000..): the blowpipe, drafted as an exploded technical sketch, then the Levant glassblower
GX, GY = 6000, 300
pipe = ["M0 290 L1500 290", "M0 340 L1500 340", "M0 290 C-40 290 -40 340 0 340", "M1500 290 L1500 340"]
s.sketch(pipe, T("blowpipe,") - 0.2, dur=0.7, stagger=0.1, x=GX + 100, y=GY, w=2200, h=800)
s.sketch(["M100 380 L100 420 L800 420 L800 380", "M1200 250 L1260 180 L1500 180"], T("blowpipe,") + 0.5, dur=0.4, x=GX + 100, y=GY, w=2200, h=800, cls="stk2")
s.lab("hollow steel blowpipe", GX + 330, GY + 440, T("blowpipe,") + 0.6, color=C["ink2"])
s.raw(f'<div id="sheet2-gather" style="position:absolute;left:{GX + 1560}px;top:{GY + 220}px;width:200px;height:180px;border-radius:48% 52% 50% 50%;background:radial-gradient(circle at 40% 40%,{C["hot2"]},{C["hot"]} 55%,#C24E0A);box-shadow:0 0 50px {C["hot"]}88;opacity:0"></div>',
      f'tl.fromTo("#sheet2-gather",{{opacity:0,scale:0.2,transformOrigin:"0% 50%"}},{{opacity:1,scale:1,duration:0.7,ease:"expo.out"}},{s.L(T("gather") - 0.1)});')
s.lab("a gather of molten glass", GX + 1370, GY + 140, T("gather") + 0.2, color=C["hot"])
s.disp("gather…", GX + 300, GY - 140, 130, T("gather"), italic=True)
s.plate("levant", GX + 2100, GY - 60, 1150, 647, T("glass", 4) - 0.6, T("glass", 4) - 0.6, b, fx0=0.3, fx1=0.42, z0=1.5, z1=1.25)
s.key(T("blowpipe,") - 0.2, GX + 1000, GY + 300, 1.0)
s.key(b - 0.1, GX + 2600, GY + 260, 1.35)    # the camera arrives on the ancient breath
SCENES.append((s.cid, s.a, s.b, s.file(9600, 2000)))

# ================================================================ 4. BREATH — Olga blows, a hollow 3-D bubble (56.2 - 60.5)
a, b = T("blow") - 0.25, T("now", 2) - 0.2
s = Scene("breath", a, b)
s.video("olga_blow", 656, 0, 608, 1080, a + 0.02, T("suddenly") + 0.2, media=0.9, appear=0.2)     # match cut from the ancient breath
s.disp("…and blow.", 120, 420, 150, T("blow"), italic=True)
s.raw('<canvas id="breath-gl" width="1920" height="1080" style="position:absolute;left:0;top:0;width:1920px;height:1080px;opacity:0"></canvas>',
      f'tl.fromTo("#breath-gl",{{opacity:0}},{{opacity:1,duration:0.35,ease:"power2.out"}},{s.L(T("suddenly") - 0.1)});')
s.disp("A hollow glass form.", 960, 90, 120, T("hollow", 2) - 0.3, hot=(1,), align="center")
s.key(a, 960, 540, 1.0)
BUBBLE = f"""<script type="module">
import * as THREE from "./assets/vendor/three.module.js";
window.__hf = window.__hf || {{}}; window.__hf.buildReady = window.__hf.buildReady || {{}};
let done; window.__hf.buildReady["breath"] = new Promise((r) => (done = r));
const canvas = document.getElementById("breath-gl");
const r = new THREE.WebGLRenderer({{ canvas, antialias: true, preserveDrawingBuffer: true, alpha: false }});
r.setPixelRatio(1); r.setSize(1920, 1080, false); r.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
// the blueprint sheet itself is the backdrop, so the glass refracts the drafting grid
const c = document.createElement("canvas"); c.width = 2048; c.height = 1152; const g = c.getContext("2d");
g.fillStyle = "{C['paper']}"; g.fillRect(0, 0, c.width, c.height);
for (let x = 0; x <= c.width; x += 43) {{ g.strokeStyle = x % 215 < 1 ? "{C['grid2']}" : "{C['grid']}"; g.lineWidth = x % 215 < 1 ? 2 : 1; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, c.height); g.stroke(); }}
for (let y = 0; y <= c.height; y += 43) {{ g.strokeStyle = y % 215 < 1 ? "{C['grid2']}" : "{C['grid']}"; g.lineWidth = y % 215 < 1 ? 2 : 1; g.beginPath(); g.moveTo(0, y); g.lineTo(c.width, y); g.stroke(); }}
const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
const cam = new THREE.PerspectiveCamera(30, 1920 / 1080, 0.1, 100); cam.position.set(0, 0, 10);
const ph = 2 * Math.tan(THREE.MathUtils.degToRad(15)) * 14;
const back = new THREE.Mesh(new THREE.PlaneGeometry(ph * 16 / 9, ph), new THREE.MeshBasicMaterial({{ map: tex }})); back.position.z = -4; scene.add(back);
const pm = new THREE.PMREMGenerator(r); const studio = new THREE.Scene(); studio.background = new THREE.Color(0.05, 0.07, 0.1);
const box = (w, h, x, y, z, l) => {{ const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({{ color: new THREE.Color(l, l, l), side: THREE.DoubleSide }})); m.position.set(x, y, z); m.lookAt(0, 0, 0); studio.add(m); }};
box(8, 3, -2, 6, 3, 3); box(1.2, 9, -7, 0, -1, 4); box(1.2, 9, 7, 0, 1, 2); box(6, 1, 0, -5, 3, 1.5);
scene.environment = pm.fromScene(studio, 0.02).texture;
const glassMat = new THREE.MeshPhysicalMaterial({{ color: 0xffffff, transmission: 1, thickness: 0.25, ior: 1.5, roughness: 0.02, dispersion: 0.4,
  attenuationColor: new THREE.Color("#d8ecff"), attenuationDistance: 3, clearcoat: 1, clearcoatRoughness: 0.03, specularIntensity: 1 }});
const bubble = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 96), glassMat); scene.add(bubble);
const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 9, 32), new THREE.MeshStandardMaterial({{ color: 0x8a8f96, metalness: 0.9, roughness: 0.3 }}));
pipe.rotation.z = Math.PI / 2; scene.add(pipe);
const neck = new THREE.Mesh(new THREE.SphereGeometry(0.32, 48, 32), new THREE.MeshStandardMaterial({{ color: 0xff7a14, emissive: 0xff6a00, emissiveIntensity: 1.6, roughness: 0.35 }})); scene.add(neck);
scene.add(new THREE.DirectionalLight(0xffffff, 2.2).translateX(-4).translateY(5).translateZ(6));
const T0 = {s.L(T("suddenly") - 0.1)}, T1 = {s.L(T("form.") + 0.2)};
const eo = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
window.__render_breath = (t) => {{
  const k = eo((t - T0) / (T1 - T0));
  const R = 0.25 + 1.55 * k;                       // the bubble inflates
  bubble.scale.set(R * 1.08, R, R);
  bubble.position.set(0.7 + 0.2 * k, 0.35, 0); bubble.rotation.y = t * 0.4;
  neck.position.set(0.7 - R * 1.05, 0.35, 0); neck.scale.setScalar(0.8 + 0.2 * (1 - k));
  pipe.position.set(0.7 - R * 1.05 - 4.5, 0.35, 0);
  cam.position.set(Math.sin(t * 0.3) * 0.4, 0.1, 10 - 0.8 * k); cam.lookAt(0.4, 0.2, 0);
  r.render(scene, cam);
}};
window.__render_breath(0);
done();
</script>"""
SCENES.append((s.cid, s.a, s.b, s.file(1920, 1080, module=BUBBLE)))

# ================================================================ 5. SHEET 3 — what it meant, Rome, 2,000 years later (60.5 - 87.0)
a, b = T("now", 2) - 0.2, T("heat") - 0.3
s = Scene("sheet3", a, b)
# station H (0..3000): one diagram that grows: faster / thinner & lighter / endless shapes
s.disp("Think about what that meant.", 120, 110, 96, T("think"), italic=True)
s.sketch(["M300 500 m-130 0 a130 130 0 1 0 260 0 a130 130 0 1 0 -260 0", "M300 370 L300 335", "M270 335 L330 335", "M300 500 L300 400", "M300 500 L390 540"],
         T("faster,") - 0.3, dur=0.35, stagger=0.06, x=0, y=0, w=800, h=900)
s.disp("faster", 180, 680, 110, T("faster,"), hot=(0,))
# wall cross-sections: thick (core-formed) -> thin (blown)
s.sketch(["M800 330 L800 670", "M860 330 L860 670"], T("thinner,") - 0.25, dur=0.3, x=0, y=0, w=1800, h=900)
s.sketch(["M1100 330 L1100 670", "M1112 330 L1112 670"], T("thinner,") + 0.1, dur=0.3, x=0, y=0, w=1800, h=900)
s.sketch(["M780 300 L880 300", "M1080 300 L1130 300"], T("lighter,") - 0.1, dur=0.3, x=0, y=0, w=1800, h=900, cls="stk2")
s.lab("then", 785, 700, T("thinner,"), color=C["ink2"]); s.lab("now", 1075, 700, T("thinner,") + 0.15, color=C["ink2"])
s.disp("thinner, lighter", 760, 790, 96, T("thinner,"))
shapes = ["M1500 640 C1440 560 1450 430 1520 380 L1520 320 L1560 320 L1560 380 C1630 430 1640 560 1580 640 Z",
          "M1700 640 C1690 560 1680 440 1700 330 L1760 330 C1780 440 1770 560 1760 640 Z",
          "M1880 640 L1930 520 C1880 470 1880 360 1940 330 C2000 360 2000 470 1950 520 L2000 640 Z",
          "M2080 640 C2060 600 2060 520 2120 500 C2180 520 2180 600 2160 640 Z",
          "M2260 640 L2240 330 L2340 330 L2320 640 Z"]
s.sketch(shapes, T("variety") - 0.3, dur=0.45, stagger=0.1, x=0, y=0, w=2600, h=900)
s.disp("in endless shapes", 1500, 790, 96, T("variety"))
s.video("blue_goblet", 2500, 120, 400, 700, T("shapes.") - 0.3, T("romans") + 0.6)
s.key(a, 960, 540, 1.0)
s.key(T("thinner,") - 0.5, 1250, 540, 1.0)
s.key(T("variety") - 0.6, 2050, 520, 1.0)
# station I (3300..): the Roman glassblower, panning
s.plate("rome", 3300, 120, 1600, 900, T("romans") - 0.5, T("romans") - 0.5, T("adopted") + 0.2, fx0=0.25, fx1=0.75, z0=1.5, z1=1.05)
s.disp("The Romans", 3360, 1060, 110, T("romans"))
s.key(T("romans") - 0.6, 4100, 640, 0.95)
# station J (5200..): the routes across the empire on the map
RX, RY = 5200, 0
s.raw(f'<svg id="sheet3-map" style="left:{RX}px;top:{RY}px" width="{MAP["W"]}" height="{MAP["H"]}" viewBox="0 0 {MAP["W"]} {MAP["H"]}"><path class="stk" d="{MAP["d"]}" style="stroke-width:3;fill:#1D4670"/></svg>')
src = P["sidon"]
for k, city in enumerate(["alexandria", "rome", "aquileia", "cologne"]):
    cx, cy = P[city]; mx, my = (cx + src[0]) / 2, min(cy, src[1]) - 260
    t0 = T("spread") - 0.4 + k * 0.7
    s.sketch([f"M{src[0]} {src[1]} Q{mx} {my} {cx} {cy}"], t0, dur=0.9, x=RX, y=RY, w=MAP["W"], h=MAP["H"], cls="stk", extra="")
    s.pin(RX + cx, RY + cy, t0 + 0.8)
    s.lab(city.capitalize(), RX + cx + 40, RY + cy - 90, t0 + 0.8, size=62)
s.pin(RX + src[0], RY + src[1], T("adopted"))
s.lab("Sidon", RX + src[0] + 40, RY + src[1] - 90, T("adopted"), size=62)
s.disp("across the Roman Empire", RX + 300, RY + 1500, 110, T("across"), hot=(2, 3))
s.key(T("adopted") - 0.4, RX + 1500, RY + 1000, 0.55)
# station K (8600..): the modern glassblower + the 2,000-year counter
s.plate("modern", 8600, 120, 1600, 900, T("but", 2) - 0.4, T("but", 2) - 0.4, b, fx0=0.25, fx1=0.7, z0=1.5, z1=1.08)
s.raw('<div id="sheet3-count" class="disp" style="left:8640px;top:1060px;font-size:150px"><span id="sheet3-num">0</span>+ years later</div>',
      f'tl.fromTo("#sheet3-count",{{opacity:0,filter:"blur(8px)"}},{{opacity:1,filter:"blur(0px)",duration:0.2}},{s.L(T("more") - 0.1)});'
      f'(function(){{const o={{v:0}};tl.fromTo(o,{{v:0}},{{v:2000,duration:1.3,ease:"power2.out",onUpdate:()=>{{document.getElementById("sheet3-num").textContent=Math.round(o.v).toLocaleString("en-US");}}}},{s.L(T("more"))});}})();')
s.disp("the same principles.", 8660, 1230, 96, T("same"), italic=True, hot=(1,))
s.key(T("but", 2) + 0.6, 9400, 640, 0.95)
s.key(T("more") - 0.2, 9400, 900, 0.8)
SCENES.append((s.cid, s.a, s.b, s.file(11000, 2200)))

# ================================================================ 6. TODAY — heat, air, control over Olga's footage; the hands (87.0 - 103.4)
a, b = T("heat") - 0.3, T("i'm") - 0.3
s = Scene("today", a, b)
stations = [("glory_hole", "heat", "Heat", 0, 0.0, "50% 50%"), ("olga_blow", "introduce", "Air", 2300, 1.2, "50% 35%"), ("swing", "controlling", "Control", 4600, 0.0, "50% 50%")]
for k, (nm, cue, word, X, med, pos) in enumerate(stations):
    t0 = T(cue) - 0.35
    t1 = T(stations[k + 1][1]) if k + 1 < len(stations) else T("course", 1) - 0.3
    s.video(nm, X + 1100, 60, 540, 960, t0, t1, media=med, pos=pos)
    s.disp(f"{k + 1}.", X + 140, 260, 110, t0, color=C["ink2"])
    s.disp(word, X + 280, 260, 150, T(cue), hot=(0,))
    s.key(t0 - 0.1, X + 960, 540, 1.0)
s.sketch(["M720 520 L1080 520", "M1040 490 L1080 520 L1040 550"], T("soft") - 0.2, dur=0.35, x=0, y=0, w=1200, h=800)
s.lab("until it's soft enough to work", 150, 480, T("soft"), color=C["ink2"])
s.sketch(["M2300 520 L2700 520", "M2300 560 L2760 560", "M2300 600 L2700 600", "M2720 490 L2760 560 L2720 630"], T("air", 1) - 0.1, dur=0.35, stagger=0.06, x=0, y=0, w=3000, h=800)
s.lab("through the blowpipe", 2450, 480, T("blowpipe", 1), color=C["ink2"])
for k, (w, cue) in enumerate([("temperature", "temperature,"), ("movement", "movement,"), ("gravity", "gravity,")]):
    s.lab(w, 4740, 470 + k * 90, T(cue), size=52, color=C["hot"] if k == 0 else C["ink"])
s.sketch(["M5500 360 A140 140 0 1 1 5620 520", "M5600 500 L5620 520 L5640 490", "M5560 640 L5560 820", "M5530 790 L5560 830 L5590 790"], T("movement,") - 0.1, dur=0.45, stagger=0.25, x=0, y=0, w=6000, h=1000)
# the hands
s.video("bench_hands", 7100, 0, 608, 1080, T("course", 1) - 0.3, b, media=0.0)
s.disp("One more ingredient…", 7800, 330, 84, T("ingredient.") - 0.4, italic=True)
s.disp("the hands", 7800, 450, 170, T("hands"), hot=(1,))
s.disp("of the glassmaker.", 7810, 640, 96, T("maker!", 1))
s.key(T("course", 1) - 0.5, 7100 + 860, 540, 1.0)
SCENES.append((s.cid, s.a, s.b, s.file(9000, 1080)))

# ================================================================ 7. OLGA — name + OR monogram, the craft, Instagram, the question (103.4 - 130.3)
a, b = T("i'm") - 0.3, T("i'd", 1) - 0.25
s = Scene("olga", a, b)
s.video("olga_blow", 1180, 0, 608, 1080, a + 0.02, T("connected") - 0.4, media=1.8, rate=0.9, pos="50% 35%")
s.raw('<img id="olga-logo" src="assets/art/olga_logo_cut.png" alt="" style="position:absolute;left:150px;top:170px;width:560px;opacity:0">',
      f'tl.fromTo("#olga-logo",{{opacity:0,scale:1.1,filter:"blur(8px)"}},{{opacity:1,scale:1,filter:"blur(0px)",duration:0.8,ease:"expo.out"}},{s.L(T("olga") - 0.2)});')
s.disp("Olga Rozin", 160, 600, 150, T("olga"))
s.lab("Glass artist", 168, 770, T("artist."), size=44, color=C["hot"])
s.key(a, 960, 540, 1.0)
# the montage plate: one craft, thousands of years
s.plate("montage", 2300, 90, 1600, 900, T("connected") - 0.5, T("connected") - 0.5, T("there's", 1) + 0.2, fx0=0.2, fx1=0.75, z0=1.6, z1=1.02)
s.disp("thousands of years", 2360, 1020, 110, T("thousands", 1), hot=(0,))
s.key(T("connected") - 0.6, 3100, 600, 0.95)
# the history: her pieces
for k, nm in enumerate(["rose_torch", "roses", "twist"]):
    s.video(nm, 4400 + k * 600, 120, 520, 860, T("history") - 0.4 + k * 0.5, T("follow") + 0.4)
s.disp("so much history to share", 4420, 1030, 96, T("share") - 0.3, italic=True)
s.key(T("history") - 0.6, 5180, 620, 0.9)
# Instagram
IX = 6600
s.raw(f'<svg id="olga-ig" style="left:{IX + 140}px;top:330px" width="220" height="220" viewBox="0 0 64 64"><rect class="stk p" pathLength="100" stroke-dasharray="100 120" stroke-dashoffset="110" x="6" y="6" width="52" height="52" rx="15"/><circle class="stk p" pathLength="100" stroke-dasharray="100 120" stroke-dashoffset="110" cx="32" cy="32" r="12"/><circle cx="46" cy="18" r="3" fill="{C["ink"]}"/></svg>',
      f'tl.fromTo("#olga-ig .p",{{strokeDashoffset:110}},{{strokeDashoffset:0,duration:0.6,stagger:0.1,ease:"power2.inOut"}},{s.L(T("follow") - 0.2)});')
s.disp("Follow me on Instagram", IX + 420, 360, 84, T("follow"))
s.disp("@olga_rozin", IX + 420, 470, 170, T("@olga_rozin"), hot=(0,))
s.lab("for more stories about glassmaking", IX + 430, 680, T("stories"), size=40, color=C["ink2"])
s.key(T("follow") - 0.4, IX + 960, 540, 1.0)
# the question
QX = 9000
s.raw(f'<svg id="olga-q" style="left:{QX + 120}px;top:260px" width="260" height="220" viewBox="0 0 64 54"><path class="stk p" pathLength="100" stroke-dasharray="100 120" stroke-dashoffset="110" d="M6 6 h52 v30 h-30 l-12 12 v-12 h-10 z"/></svg>',
      f'tl.fromTo("#olga-q .p",{{strokeDashoffset:110}},{{strokeDashoffset:0,duration:0.6,ease:"power2.inOut"}},{s.L(T("comments,") - 0.4)});')
s.disp("Tell me in the comments:", QX + 430, 300, 84, T("comments,") - 0.3, italic=True)
s.disp("Would you like to learn", QX + 160, 520, 120, T("would"))
s.disp("how glass is made?", QX + 160, 660, 150, T("how", 1), hot=(1,))
s.key(T("comments,") - 0.2, QX + 960, 540, 1.0)
SCENES.append((s.cid, s.a, s.b, s.file(11000, 1080)))

# ================================================================ 8. OUTRO — goodbye + OR end card (130.3 - end)
a, b = T("i'd", 1) - 0.25, DUR
s = Scene("outro", a, b)
s.plate("modern", 0, 0, 1920, 1080, a, a, a + 6.0, fx0=0.32, fx1=0.3, z0=2.1, z1=1.85)
s.raw('<div id="outro-shade" style="position:absolute;left:0;top:0;width:1920px;height:1080px;background:linear-gradient(90deg,rgba(5,5,5,0) 30%,rgba(5,5,5,.92) 62%)"></div>')
s.disp("I'd love to hear", 1080, 240, 110, T("i'd", 1), italic=True)
s.disp("what you think!", 1080, 360, 110, T("think!", 1), italic=True, hot=(1,))
s.raw('<img id="outro-logo" src="assets/art/olga_logo_cut.png" alt="" style="position:absolute;left:1240px;top:520px;width:420px;opacity:0">'
      '<div id="outro-shine" style="position:absolute;left:1240px;top:520px;width:420px;height:280px;opacity:0;mix-blend-mode:screen;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.9) 50%,transparent 65%);'
      '-webkit-mask:url(assets/art/olga_logo_cut.png) center/contain no-repeat;mask:url(assets/art/olga_logo_cut.png) center/contain no-repeat"></div>',
      f'tl.fromTo("#outro-logo",{{opacity:0,scale:1.1,filter:"blur(10px)"}},{{opacity:1,scale:1,filter:"blur(0px)",duration:0.9,ease:"expo.out"}},{s.L(LAST + 0.5)});'
      f'tl.fromTo("#outro-shine",{{opacity:0,backgroundPosition:"-420px 0"}},{{opacity:1,backgroundPosition:"420px 0",duration:1.0,ease:"power2.inOut"}},{s.L(LAST + 1.4)});'
      f'tl.fromTo("#outro-shine",{{backgroundPosition:"-420px 0"}},{{immediateRender:false,backgroundPosition:"420px 0",duration:1.2,ease:"power2.inOut"}},{s.L(LAST + 4.6)});')
s.lab("GLASS STORIES · EPISODE 1", 1170, 830, LAST + 1.2, size=30, color="#BFC6CE")
s.lab("Next time: how is glass made?", 1170, 880, LAST + 2.6, size=40)
s.lab("Follow @olga_rozin", 1170, 945, LAST + 3.8, size=44, color=C["hot"])
s.key(a, 960, 540, 1.0)
SCENES.append((s.cid, s.a, s.b, s.file(1920, 1080, bg="#050505")))

# ================================================================ captions: every word, orange on a black box, word by word
groups, cur = [], []
for i, w in enumerate(W):
    cur.append(w); nx = W[i + 1] if i + 1 < len(W) else None
    chars = sum(len(x["text"]) + 1 for x in cur)
    if not nx or re.search(r"[.!?]$", w["text"]) or (re.search(r"[,:;]$", w["text"]) and len(cur) >= 2) or (nx["start"] - w["end"] > 0.3 and len(cur) >= 2) or chars >= 26:
        groups.append(cur); cur = []
cap_html, cap_js = [], []
for gi, g in enumerate(groups):
    st = max(0.0, g[0]["start"] - 0.08)
    en = min(g[-1]["end"] + 0.6, groups[gi + 1][0]["start"] - 0.08) if gi + 1 < len(groups) else g[-1]["end"] + 0.8
    words = "".join(f'<span class="cw" id="cw{gi}_{k}">{html.escape(w["text"])}</span>' for k, w in enumerate(g))
    cap_html.append(f'<div class="cg" id="cg{gi}"><div class="box">{words}</div></div>')
    cap_js.append(f'tl.set("#cg{gi}",{{opacity:1,visibility:"visible"}},{st});')
    for k, w in enumerate(g):
        cap_js.append(f'tl.fromTo("#cw{gi}_{k}",{{opacity:0,display:"none"}},{{opacity:1,display:"inline-block",duration:0.08}},{round(w["start"] - 0.04, 3)});')
        cap_js.append(f'tl.to("#cw{gi}_{k}",{{color:"#FFB060",duration:0.05}},{round(w["start"] - 0.04, 3)});tl.to("#cw{gi}_{k}",{{color:"#FF8A1F",duration:0.08}},{round(w["end"] + 0.04, 3)});')
    cap_js.append(f'tl.to("#cg{gi}",{{opacity:0,duration:0.1,ease:"power2.in"}},{round(en - 0.1, 3)});tl.set("#cg{gi}",{{opacity:0,visibility:"hidden"}},{round(en, 3)});')
CAPTIONS = f"""<template>
<style>
#root{{position:absolute;inset:0;pointer-events:none}}
#root .cg{{position:absolute;left:0;right:0;bottom:70px;display:flex;justify-content:center;opacity:0;visibility:hidden}}
#root .box{{display:inline-flex;gap:0 16px;padding:14px 30px;border-radius:20px;background:rgba(0,0,0,.9);box-shadow:0 10px 30px rgba(0,0,0,.4)}}
#root .cw{{font-family:Inter,sans-serif;font-weight:900;font-size:50px;line-height:1.15;color:#FF8A1F;display:none}}
</style>
<div id="root" data-composition-id="captions" data-width="1920" data-height="1080" data-duration="{DUR}" data-layout-allow-caption-zone>
{chr(10).join(cap_html)}
</div>
<script>
(function(){{ const tl = gsap.timeline({{ paused: true }});
{chr(10).join(cap_js)}
window.__timelines = window.__timelines || {{}}; window.__timelines["captions"] = tl; }})();
</script>
</template>
"""

# ================================================================ write files
import os
os.makedirs("compositions", exist_ok=True)
hosts = []
for k, (cid, a, b, text) in enumerate(SCENES):
    open(f"compositions/{cid}.html", "w").write(text)
    hosts.append(f'      <div id="{cid}" data-composition-id="{cid}" data-composition-src="compositions/{cid}.html" data-start="{round(a, 3)}" data-duration="{round(b - a, 3)}" '
                 f'data-track-index="1" data-track-kind="graphics" data-width="1920" data-height="1080" style="z-index:{k + 1}"></div>')
open("compositions/captions.html", "w").write(CAPTIONS)
INDEX = f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: {C['paper']}; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{DUR}" data-width="1920" data-height="1080" data-fps="30">
{chr(10).join(hosts)}
      <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="{DUR}" data-track-index="5" data-track-kind="captions" data-width="1920" data-height="1080" style="z-index:50"></div>
      <audio id="mix" class="clip" data-start="0" data-duration="{DUR}" data-track-index="9" data-volume="1" src="assets/audio/mix.wav"></audio>
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      window.__timelines["main"] = gsap.timeline({{ paused: true }});
    </script>
  </body>
</html>
"""
open("index.html", "w").write(INDEX)
EV += [(4.55, "impact"), (5.0, "shine"), (T("gather"), "sizzle"), (T("glassblowing") - 0.05, "sizzle"), (T("blow"), "breath"),
       (T("suddenly"), "shimmer"), (round(LAST + 0.5, 3), "impact"), (round(LAST + 1.4, 3), "shine")]
json.dump({"duration": DUR, "events": sorted(EV)}, open("assets/sfx_cues.json", "w"))
print(f"{len(SCENES)} scenes + captions, {DUR}s:", ", ".join(f"{c} {a:.1f}-{b:.1f}" for c, a, b, _ in SCENES))
