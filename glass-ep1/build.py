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

C = dict(ink="#1C1007", ink2="#4E331C", paper="#E6D3A8", land="#D6BC86", red="#8E2216", hot="#8E2216", gold="#B98A35", cream="#F4E8CC",
         molten="#FF7A12", molten2="#FFD27A", dark="#0E0703")
EP = dict(n=1, title="The Invention of Glassblowing")     # series opener + end card read from here
FONT = """@font-face{font-family:'Suez One';font-weight:400;src:url('assets/fonts/suez-one-latin-400-normal.woff2') format('woff2');}
@font-face{font-family:'Frank Ruhl Libre';font-weight:400;src:url('assets/fonts/frank-ruhl-libre-latin-400-normal.woff2') format('woff2');}
@font-face{font-family:'Frank Ruhl Libre';font-weight:500;src:url('assets/fonts/frank-ruhl-libre-latin-500-normal.woff2') format('woff2');}
@font-face{font-family:'Frank Ruhl Libre';font-weight:700;src:url('assets/fonts/frank-ruhl-libre-latin-700-normal.woff2') format('woff2');}
@font-face{font-family:'Cormorant Garamond';font-weight:700;src:url('assets/fonts/cormorant-garamond-latin-700-normal.woff2') format('woff2');}
@font-face{font-family:'Cormorant Garamond';font-weight:600;src:url('assets/fonts/cormorant-garamond-latin-600-normal.woff2') format('woff2');}
@font-face{font-family:'Cormorant Garamond';font-style:italic;font-weight:500;src:url('assets/fonts/cormorant-garamond-latin-500-italic.woff2') format('woff2');}
@font-face{font-family:'IM Fell English';font-weight:400;src:url('assets/fonts/im-fell-english-latin-400-normal.woff2') format('woff2');}
@font-face{font-family:'IM Fell English';font-style:italic;font-weight:400;src:url('assets/fonts/im-fell-english-latin-400-italic.woff2') format('woff2');}"""
PAPER = f"""background-color:{C['paper']};background-image:url('assets/art/papyrus.jpg');background-size:1024px 1024px;"""
BASE_CSS = f"""
#root{{position:absolute;inset:0;overflow:hidden;{PAPER}}}
#root .world{{position:absolute;left:0;top:0;transform-origin:0 0;will-change:transform}}
#root .paper{{position:absolute;{PAPER}}}
#root .vign{{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 46%,transparent 52%,rgba(92,48,14,.28) 78%,rgba(34,15,4,.78) 100%)}}
#root .noise{{position:absolute;inset:0;pointer-events:none;opacity:.10;mix-blend-mode:multiply;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' seed='4'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>")}}
#root .disp{{position:absolute;font-family:'Suez One',serif;font-weight:400;color:{C['ink']};line-height:1.08;letter-spacing:0;white-space:nowrap;text-shadow:0 2px 0 rgba(246,234,206,.6)}}
#root .lab{{position:absolute;font-family:'Frank Ruhl Libre',serif;font-weight:500;color:{C['ink']};font-size:34px;white-space:nowrap;text-shadow:0 0 6px rgba(246,234,206,.95),0 0 14px rgba(246,234,206,.7)}}
#root .hot{{color:{C['hot']}}}
#root .ondark .hot{{color:{C['molten']};text-shadow:0 0 24px rgba(255,122,18,.5)}}
#root .win{{position:absolute;overflow:hidden;background:#000;box-shadow:0 0 0 12px {C['cream']},0 0 0 14px #8A6A44,0 26px 50px rgba(50,24,6,.5)}}
#root .win video{{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover}}
#root .plate{{position:absolute;overflow:hidden;box-shadow:0 0 0 14px {C['cream']},0 0 0 16px #8A6A44,0 30px 60px rgba(50,24,6,.5)}}
#root .rib{{position:absolute;padding:14px 46px 16px 40px;background:linear-gradient(180deg,#B3301F,#8E2116);color:{C['cream']};font-family:'Suez One',serif;font-weight:400;font-size:48px;line-height:1;white-space:nowrap;
  clip-path:polygon(0 0,100% 0,calc(100% - 26px) 50%,100% 100%,0 100%);box-shadow:0 10px 24px rgba(50,20,5,.4)}}
#root .rib small{{display:block;font-family:'Frank Ruhl Libre',serif;font-weight:500;font-size:30px;margin-top:6px;color:#F6DFAF}}
#root .ember{{position:absolute;width:6px;height:6px;border-radius:50%;background:radial-gradient(circle,#FFE6A8,#FF8A1F 55%,rgba(255,90,0,0) 72%)}}
#root .wipe{{position:absolute;left:0;top:0;width:3000px;height:1080px;transform:translateX(1920px);
  background:linear-gradient(90deg,rgba(255,210,122,0) 0px,#FFD27A 120px,#FF7A12 220px,#9E2A05 300px,#2A0D03 420px,#140602 1500px,#2A0D03 2580px,#9E2A05 2700px,#FF7A12 2780px,#FFD27A 2880px,rgba(255,210,122,0) 3000px)}}
#root .plate .pi{{position:absolute;left:0;top:0;width:100%;height:100%;will-change:transform}}
#root .plate img{{width:100%;height:100%;object-fit:cover;display:block}}
#root svg{{position:absolute;overflow:visible}}
#root .stk{{fill:none;stroke:{C['ink']};stroke-width:6;stroke-linecap:round;stroke-linejoin:round}}
#root .stk2{{fill:none;stroke:{C['ink2']};stroke-width:4.5;stroke-linecap:round;stroke-dasharray:3 13}}
#root .obj{{position:absolute}}
#root .obj .osp{{position:absolute;inset:0;background-size:800% 600%;background-repeat:no-repeat}}
#root .obj .osh{{position:absolute;left:14%;right:14%;bottom:7%;height:10%;border-radius:50%;background:radial-gradient(ellipse,rgba(40,20,5,.55),rgba(40,20,5,0) 70%)}}
#root .obj .ohalo{{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(255,170,60,.75),rgba(255,110,20,.35) 38%,rgba(255,90,0,0) 70%)}}
#root .obj .otint{{position:absolute;border-radius:50%;mix-blend-mode:multiply;background:radial-gradient(circle,rgba(255,150,40,1) 0%,rgba(255,110,25,.95) 32%,rgba(255,110,25,0) 48%)}}
#root .cutw{{position:absolute;left:0;top:0;width:1920px;height:1080px;{PAPER}}}

#root .cutw .cw{{position:absolute;font-family:'Suez One',serif;font-weight:400;color:{C['ink']};line-height:1.05;white-space:nowrap}}
#root .hotf{{fill:{C['hot']}}}
#root .kt{{position:absolute;white-space:nowrap;line-height:1.12;color:{C['ink']}}}
#root .kt.D{{font-family:'Suez One',serif;font-weight:400;text-shadow:0 2px 0 rgba(246,234,206,.55)}}
#root .kt.F{{font-family:'Frank Ruhl Libre',serif;font-weight:500}}
#root .kt.K{{font-family:'Frank Ruhl Libre',serif;font-weight:700;text-transform:uppercase;letter-spacing:.3em;color:#5E3F12}}
#root .kt.K.gold{{color:{C['gold']}}}
#root .kt .kw{{display:inline-block;vertical-align:top;overflow:hidden;padding:.06em .02em .14em;margin:-.06em -.02em -.14em}}
#root .kt .kw.open{{overflow:visible}}
#root .kt .ki{{display:inline-block}}
#root .kt .ks{{display:inline-block;width:.26em}}
#root .kt .hot{{color:{C['hot']}}}
#root .kt.ondark{{color:{C['cream']};text-shadow:none}}
#root .kt.ondark .hot{{color:{C['molten']};text-shadow:0 0 24px rgba(255,122,18,.5)}}
#root .cart{{position:absolute;background:rgba(244,232,204,.92);box-shadow:0 0 0 2px {C['ink']},0 0 0 8px rgba(244,232,204,.92),0 0 0 10px {C['ink']},0 18px 40px rgba(50,24,6,.35)}}
"""

# ---------------------------------------------------------------- the grid every shot is laid out on (screen px)
#  margins 120 left/right, 100 top; text never enters the caption band (y > 840); footage windows share one size.
GRID = dict(m=120, right=1800, top=100, safe=840, mid=470, win_w=500, win_h=890, win_y=95, win_r=1300, col_b=760,
            colA=1060, full=1680)
TS = dict(D1=150, D2=96, D3=64, LAB=40, K=30)          # type scale: display / title / secondary / label / kicker
def sync_times(words, cue, t):
    """the time each display word appears: the narration word it names (searched forward from the cue), else a stagger"""
    if not cue: return [round(t + 0.09 * k, 3) for k in range(len(words))]
    i0 = [k for k, w in enumerate(W) if norm(w["text"]) == norm(cue[0])][cue[1]]
    out, j, last = [], i0, W[i0]["start"]
    for k, w in enumerate(words):
        if k == 0 and norm(w) != norm(W[i0]["text"]):
            out.append(round(max(t - 0.6, last - 0.04), 3)); continue
        hit = next((m for m in range(j, min(j + 6, len(W))) if norm(W[m]["text"]) == norm(w) and W[m]["start"] <= W[i0]["start"] + 2.5), None)
        if hit is not None: last = W[hit]["start"]; j = hit + 1
        else: last = last + (0.0 if k == 0 else 0.1)
        out.append(round(max(t - 0.6, last - 0.04), 3))
    return out
def layout_block(lines, yc=None):
    """stack lines (text, size, font, style, cue, hot, gap_after) and centre the block vertically in the safe area"""
    yc = GRID["mid"] if yc is None else yc
    h = sum(L[1] * 1.12 + (L[6] if len(L) > 6 else L[1] * 0.12) for L in lines)
    y = yc - h / 2; out = []
    assert y >= GRID["top"] - 1 and y + h <= GRID["safe"] + 1, f"block too tall: {[L[0] for L in lines]}"
    for L in lines:
        text, size, font, style, cue, hot = L[:6]
        est = len(text) * size * (0.6 if font == "D" else 0.5 if font == "F" else 0.75)
        if est > GRID["full"]: print("WARN wide line:", text, int(est))
        out.append((text, y, size, font, style, cue, hot)); y += size * 1.12 + (L[6] if len(L) > 6 else size * 0.12)
    return out

# ---------------------------------------------------------------- element helpers (world coordinates)
class Scene:
    def __init__(self, cid, a, b):
        self.cid, self.a, self.b = cid, a, b
        self.html, self.js, self.css, self.n = [], [], [], 0
        self.cam = []                         # (t_local, cx, cy, scale)
        self.over = []                        # full-frame cutaways drawn above the world
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
        size = round(size * (0.98 if italic else 0.86))
        style = f"left:{x}px;top:{y}px;font-size:{size}px;" + ("font-family:'Frank Ruhl Libre',serif;font-weight:500;" if italic else "") + (f"color:{color};" if color else "")
        if align == "center": style = style.replace(f"left:{x}px;", f"left:{x - 960}px;width:1920px;") + "text-align:center;"
        self.html.append(f'<div id="{i}" class="disp{" ondark" if color == C["cream"] else ""}" style="{style}">{spans}</div>')
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
            self.js.append(f'tl.fromTo("#{i} .p",{{strokeDashoffset:110,opacity:0}},{{strokeDashoffset:0,opacity:1,duration:{dur},ease:"power2.inOut",stagger:{stagger}}},{self.L(t)});')
        return i
    def video(self, name, x, y, w, h, t_in, t_out, media=0.0, rate=1.0, pos="50% 50%", appear=0.35, enter="iris"):
        """a footage window cut into the blueprint; the <video> itself is the timed clip"""
        i = self.id("v"); s = max(self.a, t_in - appear); EV.append((round(s, 3), "window"))
        self.html.append(f'<div id="{i}" class="win" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;clip-path:inset(50% 50% 50% 50%)">'
                         f'<video id="{i}m" class="clip" data-start="{self.L(s)}" data-duration="{round(t_out - s + 0.6, 3)}" data-media-start="{media}" '
                         f'data-playback-rate="{rate}" muted playsinline src="assets/clips/{name}.mp4" style="object-position:{pos}"></video></div>')
        self.js.append(f'tl.fromTo("#{i}",{{clipPath:"inset(50% 50% 50% 50%)"}},{{clipPath:"inset(0% 0% 0% 0%)",duration:{appear},ease:"expo.out"}},{self.L(s)});')
        return i
    def plate(self, name, x, y, w, h, t_in, t0, t1, fx0=0.3, fx1=0.7, z0=1.35, z1=1.0, rot=0, cap=None):
        """an era image pinned to the sheet; inside, the camera pans left->right and pulls back (t0..t1)"""
        i = self.id("p"); EV.append((round(t_in, 3), "paper")); self.last_rib = None
        self.html.append(f'<div id="{i}" class="plate" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;rotate:{rot}deg;opacity:0">'
                         f'<div class="pi"><img src="assets/art/{name}.png" alt=""></div></div>')
        self.js.append(f'tl.fromTo("#{i}",{{opacity:0,rotationY:-70,transformPerspective:1800,transformOrigin:"0% 50%"}},{{opacity:1,rotationY:0,duration:0.9,ease:"expo.out"}},{self.L(t_in)});')
        if cap:
            r = self.id("rib"); self.last_rib = r
            self.html.append(f'<div id="{r}" class="rib" style="left:{x - 40}px;top:{y - 50}px">{html.escape(cap[0])}<small>{html.escape(cap[1])}</small></div>')
            self.js.append(f'tl.fromTo("#{r}",{{clipPath:"polygon(0 0,0% 0,0% 50%,0% 100%,0 100%)"}},{{clipPath:"polygon(0 0,100% 0,calc(100% - 26px) 50%,100% 100%,0 100%)",duration:0.6,ease:"expo.out"}},{self.L(t_in + 0.35)});')
        # pan: xPercent from left-weighted to right-weighted, zoom out (scale z0 -> z1)
        dx0, dx1 = (0.5 - fx0) * 100 * (z0 - 1) * 1.4, (0.5 - fx1) * 100 * (z1 - 1) * 1.4
        self.js.append(f'tl.fromTo("#{i} .pi",{{scale:{z0},xPercent:{dx0:.1f}}},{{scale:{z1},xPercent:{dx1:.1f},duration:{round(t1 - t0, 3)},ease:"power1.inOut"}},{self.L(t0)});')
        return i
    def pin(self, x, y, t, color=None, k=1.0):
        i = self.id("pin"); col = color or C["red"]; EV.append((round(t, 3), "pin"))
        self.html.append(f'<svg id="{i}" style="left:{x - 40 * k}px;top:{y - 40 * k}px" width="{80 * k}" height="{80 * k}" viewBox="0 0 80 80"><path d="M40 8 C56 9 70 20 72 38 C74 56 60 72 40 72 C22 72 7 58 8 40 C9 22 24 8 40 8Z" fill="{col}" stroke="#5E140C" stroke-width="2"/>'
                         f'<circle cx="40" cy="40" r="17" fill="none" stroke="#6E1A10" stroke-width="3"/><circle cx="40" cy="40" r="5" fill="#6E1A10"/></svg>')
        self.js.append(f'tl.fromTo("#{i}",{{scale:0,transformOrigin:"50% 50%"}},{{scale:1,duration:0.5,ease:"back.out(2)"}},{self.L(t)});')
        return i
    def embers(self, t0, t1, n=40, seed=1, x0=0, x1=1920, y0=700, y1=1100):
        """deterministic rising embers (seeded LCG): no Math.random"""
        st = seed * 9301 + 49297
        def rnd():
            nonlocal st; st = (st * 1103515245 + 12345) % 2147483648; return st / 2147483648
        for k in range(n):
            i = self.id("em"); x = x0 + rnd() * (x1 - x0); y = y0 + rnd() * (y1 - y0); sz = 3 + rnd() * 7
            d = 1.8 + rnd() * 2.2; st0 = t0 + rnd() * max(0.1, (t1 - t0 - d)); rise = 300 + rnd() * 500; dx = (rnd() - 0.5) * 160
            self.html.append(f'<div id="{i}" class="ember" style="left:{x:.0f}px;top:{y:.0f}px;width:{sz:.1f}px;height:{sz:.1f}px;opacity:0"></div>')
            self.js.append(f'tl.fromTo("#{i}",{{opacity:0,x:0,y:0}},{{keyframes:[{{opacity:1,duration:{d*0.2:.2f}}},{{opacity:0.7,duration:{d*0.5:.2f}}},{{opacity:0,duration:{d*0.3:.2f}}}],x:{dx:.0f},y:{-rise:.0f},duration:{d:.2f},ease:"none"}},{self.L(st0) if st0 >= self.a else round(st0, 3)});')
    def compass(self, x, y, t, r=170):
        pts = []
        for k in range(8):
            import math
            a = k * math.pi / 4; L = r if k % 2 == 0 else r * 0.55
            ax, ay = math.cos(a) * L, math.sin(a) * L; bx, by = math.cos(a + 0.35) * r * 0.16, math.sin(a + 0.35) * r * 0.16
            cx_, cy_ = math.cos(a - 0.35) * r * 0.16, math.sin(a - 0.35) * r * 0.16
            pts.append(f"M{r + bx:.0f} {r + by:.0f} L{r + ax:.0f} {r + ay:.0f} L{r + cx_:.0f} {r + cy_:.0f}")
        ring = [f"M{r} {r} m-{r * 0.8:.0f} 0 a{r * 0.8:.0f} {r * 0.8:.0f} 0 1 0 {r * 1.6:.0f} 0 a{r * 0.8:.0f} {r * 0.8:.0f} 0 1 0 -{r * 1.6:.0f} 0"]
        self.sketch(ring + pts, t, dur=0.5, stagger=0.06, x=x - r, y=y - r, w=2 * r, h=2 * r)
        self.lab("N", x - 16, y - r - 80, t + 0.4, size=64)
    def obj(self, name, x, y, size, t, spin=1.0, glow=None):
        """a pre-rendered 3D object (48-frame turntable sprite) set on the page at world (x, y) = its centre"""
        i = self.id("o"); EV.append((round(t, 3), "window")); D = round(self.b - t + 0.5, 3)
        h = g = ""
        if glow:
            cx, cy, d = glow[0] + glow[2] / 2, glow[1] + glow[2] / 2, glow[2]
            h = f'<div class="ohalo" style="left:{cx - d}%;top:{cy - d}%;width:{2 * d}%;height:{2 * d}%"></div>'
            g = f'<div class="otint" style="left:{cx - d * 0.62}%;top:{cy - d * 0.62}%;width:{1.24 * d}%;height:{1.24 * d}%"></div>'
        self.html.append(f'<div id="{i}" class="obj" style="left:{x - size / 2:.0f}px;top:{y - size / 2:.0f}px;width:{size}px;height:{size}px;opacity:0">'
                         f'<div class="osh"></div>{h}<div class="osp" style="background-image:url(assets/obj/{name}.webp)"></div>{g}</div>')
        self.js.append(f'tl.fromTo("#{i}",{{opacity:0,scale:0.55,y:70}},{{opacity:1,scale:1,y:0,duration:0.7,ease:"back.out(1.5)"}},{self.L(t)});')
        self.js.append(f'(function(){{const o={{f:0}},el=document.querySelector("#{i} .osp");const set=()=>{{const k=Math.floor(o.f)%48;el.style.backgroundPosition=((k%8)*100/7).toFixed(3)+"% "+(Math.floor(k/8)*20)+"%";}};set();'
                       f'tl.fromTo(o,{{f:0}},{{f:{round(12 * spin * D, 2)},duration:{D},ease:"none",onUpdate:set}},{self.L(t)});}})();')
        return i
    def cutaway(self, name, t0, t1, media=0.0, lines=(), side="right", rate=1.0, pos="50% 40%"):
        """a clean full-frame cut to Olga's footage on a fresh sheet; her line set beside it on the grid, word by word"""
        i = self.id("cut"); EV.append((round(t0, 3), "cut")); EV.append((round(t1, 3), "cut"))
        wx, tx = (GRID["win_r"], GRID["m"]) if side == "right" else (GRID["m"], GRID["col_b"])
        buf = []
        for (text, y, size, font, style, cue, hot) in layout_block(lines):
            self.ktext(text, tx, y, size, t0 + 0.05, style=style, font=font, hot=hot, cue=cue, dest=buf)
        self.over.append(f'<div id="{i}" class="cutw" data-layout-allow-overlap style="opacity:0"><div class="win" style="left:{wx}px;top:{GRID['win_y']}px;width:{GRID['win_w']}px;height:{GRID['win_h']}px"><video id="{i}m" class="clip" data-start="{self.L(t0)}" data-duration="{round(t1 - t0, 3)}" '
                         f'data-media-start="{media}" data-playback-rate="{rate}" muted playsinline src="assets/clips/{name}.mp4" style="object-position:{pos}"></video></div>{"".join(buf)}</div>')
        self.js.append(f'tl.set("#{i}",{{opacity:1}},{self.L(t0)});tl.set("#{i}",{{opacity:0}},{self.L(t1)});'
                       f'tl.fromTo("#{i} .win",{{scale:1.06}},{{scale:1,duration:{round(t1 - t0, 3)},ease:"none"}},{self.L(t0)});')
        return i
    # ------------------------------------------------------------ kinetic typography
    def ktext(self, text, x, y, size, t, style="rise", font="D", color=None, hot=(), cue=None, align="left", width=None, dest=None, cls=""):
        """one line of type; each word lands on the narration word it names (cue = (word, n) of the first word),
        else words stagger from t. style: rise (mask reveal) | slam (scale + blur hit) | type (letters typed on).
        hot words are rubricated and get a hit when spoken."""
        i = self.id("k"); words = text.split(" ")
        times = sync_times(words, cue, t)
        def word(k, w):
            inner = "".join(f'<span class="ch">{html.escape(c)}</span>' for c in w) if style == "type" else html.escape(w)
            return (f'<span class="kw w{k}{" open" if style != "rise" else ""}"><span class="ki{" hot" if k in hot else ""}">{inner}</span></span>'
                    + ('<span class="ks"></span>' if k < len(words) - 1 else ""))
        st = f"left:{x:.1f}px;top:{y:.1f}px;font-size:{size:.1f}px;" + (f"color:{color};" if color else "")
        if align == "center": st = f"left:{x - width / 2:.1f}px;width:{width:.1f}px;text-align:center;top:{y:.1f}px;font-size:{size:.1f}px;" + (f"color:{color};" if color else "")
        if align == "right": st = f"left:{x - width:.1f}px;width:{width:.1f}px;text-align:right;top:{y:.1f}px;font-size:{size:.1f}px;" + (f"color:{color};" if color else "")
        (dest if dest is not None else self.html).append(f'<div id="{i}" class="kt {font} {cls}" style="{st}">{"".join(word(k, w) for k, w in enumerate(words))}</div>')
        self.js.append(f'tl.fromTo("#{i}",{{opacity:0}},{{opacity:1,duration:0.01}},{max(0.0, round(self.L(min(times)) - 0.01, 3))});')
        for k, tw in enumerate(times):
            sel = f'#{i} .w{k} .ki'
            L = self.L(tw)
            if style == "rise":
                self.js.append(f'tl.fromTo("{sel}",{{yPercent:112}},{{yPercent:0,duration:0.5,ease:"expo.out"}},{L});')
            elif style == "slam":
                self.js.append(f'tl.fromTo("{sel}",{{opacity:0,scale:1.9,filter:"blur(10px)",transformOrigin:"50% 60%"}},{{opacity:1,scale:1,filter:"blur(0px)",duration:0.3,ease:"expo.out"}},{L});')
            else:
                self.js.append(f'tl.fromTo("{sel} .ch",{{opacity:0}},{{opacity:1,duration:0.01,stagger:0.028}},{L});')
            if k in hot:
                self.js.append(f'tl.fromTo("{sel}",{{scale:1}},{{scale:1.1,duration:0.12,ease:"power2.out",yoyo:true,repeat:1,transformOrigin:"50% 70%"}},{round(L + 0.32, 3)});')
        return i
    def raw(self, h, js=""):
        self.html.append(h)
        if js: self.js.append(js)
    # ------------------------------------------------------------ output
    def file(self, world_w, world_h, bg=None, extra_css="", after_world="", head_js="", module="", wipe_in=False, wipe_out=False):
        cam = sorted(self.cam) or [(0, 960, 540, 1.0)]
        for k0, k1 in zip(cam[:-1], cam[1:]):
            if (k0[1], k0[2], k0[3]) != (k1[1], k1[2], k1[3]):
                if k1[3] / k0[3] > 4: EV.append((round(self.a + k1[0] - min(1.0, 0.5 * (k1[0] - k0[0])), 3), "dive"))
                else: EV.append((round(self.a + k1[0], 3), "cut"))
        after_world = "".join(self.over) + after_world
        dur = round(self.b - self.a, 3)
        if wipe_in:
            after_world += f'<div id="{self.cid}-wi" class="wipe" style="transform:translateX(-540px)"></div>'
            self.js.append(f'tl.fromTo("#{self.cid}-wi",{{x:-540}},{{x:-3000,duration:0.45,ease:"power2.in"}},0.02);')
        if wipe_out:
            after_world += f'<div id="{self.cid}-wo" class="wipe"></div>'
            self.js.append(f'tl.fromTo("#{self.cid}-wo",{{x:1920}},{{x:-540,duration:0.45,ease:"power2.out"}},{round(dur - 0.47, 3)});')
            EV.append((round(self.b - 0.45, 3), "wipe"))
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
    // clean cuts: every key is a hard cut to a new framing that then pushes in slowly (1.4%/s);
    // only a dive (zoom x4 or more) travels, so the camera flies into the drawing
    let k0 = K[0], k1 = K[0];
    for (let i = 0; i < K.length; i++) {{ if (t >= K[i][0]) {{ k0 = K[i]; k1 = K[i + 1] || K[i]; }} }}
    if (t < K[0][0]) {{ k0 = k1 = K[0]; }}
    if (!(k1[3] / k0[3] > 4)) return [k0[1], k0[2], k0[3] * Math.min(1 + 0.008 * Math.max(0, t - k0[0]), 1.035)];
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

I, F = True, False   # cutaway word flags: (text, y, size, hot, italic)
SCENES = []   # (cid, a, b, file text)
EV = []       # (absolute time, kind) for the sound design

class Shot:
    """one camera framing (a hard cut). Everything placed through a Shot is given in SCREEN pixels on the grid and
    converted to world coordinates, so every shot lines up on the same margins whatever the camera zoom."""
    def __init__(self, sc, t, cx, cy, s=1.0):
        self.sc, self.cx, self.cy, self.s = sc, cx, cy, s; self.ids = []
        sc.key(t, cx, cy, s)
    def keep(self, i):
        if i: self.ids.append(i)
        return i
    def end(self, t, keep=()):
        """clear this framing's own elements when the next framing on the same sheet takes over"""
        ids = [f"#{i}" for i in self.ids if i not in keep]
        if ids: self.sc.js.append(f'tl.set({json.dumps(ids)},{{opacity:0}},{self.sc.L(t)});')
    def X(self, sx): return self.cx + (sx - 960) / self.s
    def Y(self, sy): return self.cy + (sy - 540) / self.s
    def S(self, v): return v / self.s
    def text(self, text, sx, sy, size, t, **kw):
        if kw.get("width"): kw["width"] = self.S(kw["width"])
        return self.keep(self.sc.ktext(text, self.X(sx), self.Y(sy), self.S(size), t, **kw))
    def block(self, lines, sx, t, yc=None, align="left", width=None, ondark=False):
        for (text, y, size, font, style, cue, hot) in layout_block(lines, yc):
            self.text(text, sx, y, size, t, style=style, font=font, hot=hot, cue=cue, align=align, width=width, cls="ondark" if ondark else "")
    def video(self, name, t_in, t_out, side="right", media=0.0, rate=1.0, pos="50% 40%", rect=None):
        x, y, w, h = rect or ((GRID["win_r"] if side == "right" else GRID["m"]), GRID["win_y"], GRID["win_w"], GRID["win_h"])
        return self.keep(self.sc.video(name, self.X(x), self.Y(y), self.S(w), self.S(h), t_in, t_out, media=media, rate=rate, pos=pos, appear=0.05))
    def obj(self, name, sx, sy, size, t, **kw): return self.keep(self.sc.obj(name, self.X(sx), self.Y(sy), self.S(size), t, **kw))
    def plate(self, name, t_in, t1, cap=None, rect=(320, 140, 1280, 720), **kw):
        x, y, w, h = rect
        i = self.keep(self.sc.plate(name, self.X(x), self.Y(y), self.S(w), self.S(h), t_in, t_in, t1, cap=cap, **kw)); self.keep(self.sc.last_rib); return i
    def cart(self, sx, sy, w, h, t):
        """a map cartouche: a ruled paper label that keeps type legible over the map"""
        i = self.keep(self.sc.id("ct"))
        self.sc.html.append(f'<div id="{i}" class="cart" style="left:{self.X(sx):.1f}px;top:{self.Y(sy):.1f}px;width:{self.S(w):.1f}px;height:{self.S(h):.1f}px;opacity:0"></div>')
        self.sc.js.append(f'tl.fromTo("#{i}",{{opacity:0,scaleY:0.2,transformOrigin:"50% 0%"}},{{opacity:1,scaleY:1,duration:0.4,ease:"expo.out"}},{self.sc.L(t)});')
CELL = 2600                                   # stations sit 2,600 px apart in the world: a cut never shows a neighbour
def cell(k): return (k * CELL + 960, 540)

D1, D2, D3, LB, KK = TS["D1"], TS["D2"], TS["D3"], TS["LAB"], TS["K"]
M, RX_, COLB = GRID["m"], GRID["right"], GRID["col_b"]
P = MAP["pts"]
def mapsvg(sc, ox, draw_t=None, hatch=False):
    d = MAP["d"]; i = sc.id("map")
    defs = (f'<defs><pattern id="{i}h" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="14" stroke="{C["hot"]}" stroke-width="4"/></pattern></defs>' if hatch else "")
    cls = ' class="stk mp" pathLength="100" stroke-dasharray="100 120" stroke-dashoffset="110"' if draw_t is not None else ' class="stk"'
    sc.raw(f'<svg id="{i}" style="left:{ox}px;top:0px" width="{MAP["W"]}" height="{MAP["H"]}" viewBox="0 0 {MAP["W"]} {MAP["H"]}">{defs}<path{cls} d="{d}" style="stroke-width:3;fill:{C["land"]}"/></svg>',
           f'tl.fromTo("#{i} .mp",{{strokeDashoffset:110,fillOpacity:0}},{{strokeDashoffset:0,fillOpacity:1,duration:1.4,ease:"power2.inOut"}},{sc.L(draw_t)});' if draw_t is not None else "")
    return i
def clamp(v, lo, hi): return max(lo, min(hi, v))
def mapshot(sc, t, ox, cx, cy, s):
    """a framing on a map cell, clamped so the view never leaves the map"""
    hw, hh = 960 / s, 540 / s
    return Shot(sc, t, ox + clamp(cx, hw, MAP["W"] - hw), clamp(cy, hh, MAP["H"] - hh), s)

# ================================================================ 0. HOOK (0 - 4.45) + series sting (4.3 - 7.6)
s = Scene("hook", 0.0, 7.6)
sh = Shot(s, 0, 960, 540, 1.0)
cuts = [("glory_hole", 0.0, 0.4), ("olga_blow2", 0.6, 0.2), ("red_bubble", 1.2, 0.2), ("olga_glory", 1.6, 3.0), ("torch", 2.2, 0.9),
        ("olga_run", 2.8, 7.6), ("rose_torch", 3.3, 0.4), ("olga_dolphin", 3.85, 1.0)]
for k, (nm, t0, med) in enumerate(cuts):
    t1 = cuts[k + 1][1] if k + 1 < len(cuts) else 4.45
    i = s.id("hv")
    s.raw(f'<div id="{i}" class="win" style="left:{GRID["win_r"]}px;top:{GRID["win_y"]}px;width:{GRID["win_w"]}px;height:{GRID["win_h"]}px;background:transparent">'
          f'<video id="{i}m" class="clip" data-start="{t0}" data-duration="{round(t1 - t0, 3)}" data-media-start="{med}" data-playback-rate="1.25" muted playsinline src="assets/clips/{nm}.mp4"></video></div>',
          f'tl.fromTo("#{i} video",{{scale:1.14}},{{scale:1,duration:0.45,ease:"expo.out"}},{t0});')
for (txt, t0, t1) in [("ONE BREATH.", 0.15, 1.5), ("ONE IDEA.", 1.6, 2.95)]:
    i = s.ktext(txt, M, 250, D1, t0, style="slam"); s.js.append(f'tl.to("#{i}",{{opacity:0,duration:0.12}},{t1});')
i = s.ktext("2,000 YEARS", M, 190, D1, 3.05, style="slam"); s.js.append(f'tl.to("#{i}",{{opacity:0,duration:0.12}},4.4);')
i = s.ktext("OF GLASS.", M, 190 + D1 * 1.12, D1, 3.3, style="slam", hot=(1,)); s.js.append(f'tl.to("#{i}",{{opacity:0,duration:0.12}},4.4);')
s.obj("blowpipe", 580, 650, 560, 0.1, spin=1.5, glow=(62, 33, 22))
s.raw(f'<div id="hook-black" style="position:absolute;left:0;top:0;width:1920px;height:1080px;background:radial-gradient(ellipse at 50% 60%,#2A1206,{C["dark"]} 70%);opacity:0"></div>'
      f'<img id="hook-logo" src="assets/art/olga_logo_alpha.png" style="position:absolute;left:660px;top:120px;width:600px;height:418px;opacity:0" alt="">'
      f'<div id="hook-shine" style="position:absolute;left:660px;top:120px;width:600px;height:418px;opacity:0;mix-blend-mode:screen;'
      f'background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.9) 50%,transparent 65%) no-repeat;-webkit-mask:url(assets/art/olga_logo_alpha.png) center/100% 100% no-repeat;mask:url(assets/art/olga_logo_alpha.png) center/100% 100% no-repeat"></div>',
      'tl.fromTo("#hook-black",{opacity:0},{opacity:1,duration:0.25,ease:"power2.in"},4.3);'
      'tl.fromTo("#hook-logo",{opacity:0,scale:1.15,filter:"blur(10px)"},{opacity:1,scale:1,filter:"blur(0px)",duration:0.9,ease:"expo.out"},4.55);'
      'tl.fromTo("#hook-shine",{opacity:0,backgroundPosition:"-600px 0"},{opacity:1,backgroundPosition:"600px 0",duration:1.0,ease:"power2.inOut"},5.0);')
i1 = s.ktext(f"GLASS STORIES · EPISODE {EP['n']}", 960, 600, KK, 5.3, style="type", font="K", align="center", width=1680, cls="gold")
i2 = s.ktext(EP["title"], 960, 650, D2, 5.6, style="rise", align="center", width=1680, cls="ondark")
s.js.append(f'tl.to(["#hook-logo","#{i1}","#{i2}"],{{opacity:0,duration:0.3,ease:"power3.in"}},7.25);')
s.embers(4.5, 7.5, n=46, seed=3)
SCENES.append((s.cid, s.a, s.b, s.file(1920, 1080)))

# ================================================================ 1. SHEET 1 (7.25 - 33.2)
a, b = HOOK - 0.15, T("glassblowing") - 0.05
s = Scene("sheet1", a, b)
# A — layout A: Olga's glass right, the list left; then a punch-in on "a rare luxury."
cx, cy = cell(0); sh = Shot(s, HOOK, cx, cy)
sh.video("tumbler", T("before"), T("everyday"))
sh.video("goblets", T("everyday") - 0.05, T("rare"))
lines = [("Art", D2, "D", "rise", ("art,", 0), ()), ("Windows", D2, "D", "rise", ("windows,", 0), ()), ("Everyday objects", D2, "D", "rise", ("everyday", 0), ())]
blk = layout_block(lines)
sh.block(lines, M, 0)
for k in range(3):     # struck through as it turns out glass was a luxury
    y = blk[k][1] + D2 * 0.62; w = [190, 470, 900][k]
    s.sketch([f"M{M - 10} {y:.0f} L{M + w} {y - 6:.0f}"], T("actually") - 0.1 + k * 0.1, dur=0.22, w=1920, h=1080, x=cx - 960, y=cy - 540)
cx, cy = cell(5 + 1); sh = Shot(s, T("rare") - 0.1, cx, cy)             # cut: a rare luxury
sh.video("candles", T("rare") - 0.1, T("now") + 0.3)
sh.block([("A rare", D2, "D", "rise", ("rare", 0), ()), ("luxury.", D1 * 1.3, "D", "slam", ("luxury.", 0), (0,))], M, 0)
# B — layout D on a map cell: the first glass
ox = 1 * CELL
mapsvg(s, ox, draw_t=T("now") - 0.2)
w = mapshot(s, T("now") - 0.1, ox, 1500, 950, 0.64)
w.cart(M, GRID["top"], 760, 210, T("now"))
w.text("c. 2500 BCE", M + 40, GRID["top"] + 30, KK, 0, style="type", font="K", cue=("earliest", 0))
w.text("The first glass", M + 40, GRID["top"] + 80, D2, 0, cue=("glass", 1))
for k, (key, nm) in enumerate([("mideast", "Middle East"), ("egypt", "Egypt")]):     # both pinned on "thousands of years ago"
    x, y = P[key]; tp = T("thousands") + 0.45 * k
    w.keep(s.pin(ox + x, y, tp, k=1 / 0.64))
    w.keep(s.ktext(nm, ox + x + 70, y - 40, LB / 0.64, tp + 0.1, font="F", style="type"))
s.compass(ox + 260, 1650, T("now") + 0.3, r=160)
w.end(T("ancient") - 0.05)
m1 = mapshot(s, T("ancient") - 0.05, ox, 2040, 1300, 1.0)                # cut: Mesopotamia
m1.plate("mesopotamia", T("ancient"), T("but") + 0.3, cap=("Mesopotamia", "c. 2500 BCE · beads & inlays"), rect=(M, 170, 560, 560), fx0=0.25, fx1=0.75)
m1.obj("beads", 1110, 400, 460, T("ancient") + 0.35)
m1.text("glass beads", 1110, 650, LB, 0, font="F", cue=("east", 0), align="center", width=600)
m1.end(T("egypt.") - 0.15)
m2 = mapshot(s, T("egypt.") - 0.15, ox, 1700, 1360, 1.0)                 # cut: Egypt
m2.plate("egypt", T("egypt.") - 0.15, T("but") + 0.3, cap=("Egypt", "c. 1500 BCE · core-formed"), rect=(M, 170, 560, 560), fx0=0.25, fx1=0.75)
m2.obj("amphoriskos", 1110, 400, 460, T("egypt.") + 0.1)
m2.text("a core-formed flask", 1110, 650, LB, T("egypt.") + 0.4, font="F", style="type", align="center", width=600)
s.cutaway("olga_run", T("but") - 0.05, T("making") - 0.1, media=6.2,
          lines=[("But there was", D2, "F", "rise", ("but", 0), ()), ("a problem.", D1, "D", "slam", ("a", 1), (1,))])
# C — layout C: the clay core, centred, title above, note below
cx, cy = cell(3); sh = Shot(s, T("making") - 0.1, cx, cy)
sh.text("Making a hollow glass vessel", 960, GRID["top"], D2, 0, cue=("making", 0), align="center", width=GRID["full"])
sh.obj("claycore", 960, 470, 560, T("making") - 0.1, spin=0.7)
sh.text("molten glass wound around a clay core", 960, 740, LB, T("hollow") + 0.3, font="F", style="type", align="center", width=GRID["full"])
cx, cy = cell(4); sh = Shot(s, T("slow") - 0.25, cx, cy)                 # cut: slow & difficult
sh.obj("hourglass", 960, 330, 420, T("slow") - 0.25, spin=0.6)
sh.text("slow", 960, 560, D1, 0, style="slam", cue=("slow", 0), hot=(0,), align="center", width=GRID["full"])
sh.text("& difficult", 960, 560 + D1 * 1.12, D3, 0, font="F", cue=("difficult", 0), align="center", width=GRID["full"])
# D — the timeline; the camera dives into the 1st-century dot, which becomes the furnace
cx, cy = cell(5); ox, oy = cx - 960, cy - 540; sh = Shot(s, T("then") - 0.1, cx, cy)
sh.block([("Then, around the first century BCE,", D3, "F", "rise", ("then,", 0), ()), ("something remarkable", D2, "D", "rise", ("something", 0), ()),
          ("happened.", D2, "D", "rise", ("happened.", 0), (0,))], M, 0, yc=270)
TY = 560
s.sketch([f"M{M} {TY} L{RX_} {TY}"], T("then") - 0.1, dur=1.2, x=ox, y=oy, w=1920, h=1080)
for k, (fr, d1, d2) in enumerate([(0.0, "c. 2500 BCE", "first glass objects"), (0.42, "c. 1500 BCE", "core-formed vessels"), (0.94, "1st century BCE", "")]):
    x = M + int((RX_ - M) * fr); tk = T("then") + fr * 1.0
    s.sketch([f"M{x} {TY - 26} L{x} {TY + 26}"], tk, dur=0.2, x=ox, y=oy, w=1920, h=1080)
    kw = dict(align="right", width=700) if k == 2 else {}
    sh.text(d1, x, TY + 50, LB, tk, font="F", style="type", hot=(0, 1, 2) if k == 2 else (), **kw)
    if d2: sh.text(d2, x, TY + 50 + LB * 1.3, LB, tk + 0.1, font="F", style="type")
DXs = M + int((RX_ - M) * 0.94)
s.raw(f'<div id="sheet1-dot" style="position:absolute;left:{ox + DXs - 30}px;top:{oy + TY - 30}px;width:60px;height:60px;border-radius:50%;background:radial-gradient(circle,{C["molten2"]},{C["molten"]} 60%,#C24E0A);opacity:0"></div>',
      f'tl.fromTo("#sheet1-dot",{{opacity:0,scale:0.2}},{{opacity:1,scale:1,duration:0.4,ease:"back.out(2)"}},{s.L(T("century") - 0.1)});')
s.key(b - 0.05, ox + DXs, oy + TY, 24.0)
SCENES.append((s.cid, s.a, s.b, s.file(18200, 2000)))

# ================================================================ 2. FURNACE — layout A (33.2 - 36.5)
a, b = T("glassblowing") - 0.05, T("now", 1) - 0.25
s = Scene("furnace", a, b)
s.raw(f'<div id="furnace-flood" style="position:absolute;left:0;top:0;width:1920px;height:1080px;background:radial-gradient(circle at 50% 50%,{C["molten2"]},{C["molten"]} 55%,#B5450A)"></div>',
      f'tl.fromTo("#furnace-flood",{{opacity:1}},{{opacity:0,duration:0.45,ease:"power2.in"}},0.25);')
sh = Shot(s, a, 960, 540)
sh.video("glory_gather", a + 0.05, T("changed") - 0.2)
sh.video("olga_glory", T("changed") - 0.25, b, media=3.5)
sh.block([("Glassblowing", D1, "D", "slam", ("glassblowing", 0), (0,)), ("was invented.", D3, "F", "rise", ("was", 3), (), 60),
          ("And that changed", D2, "D", "rise", ("and", 2), ()), ("everything.", D1, "D", "slam", ("everything.", 0), (0,))], M, 0)
s.embers(a + 0.2, b, n=34, seed=5, x0=1100, x1=1920)
SCENES.append((s.cid, s.a, s.b, s.file(1920, 1080, wipe_out=True)))

# ================================================================ 3. SHEET 2 (36.5 - 56.5)
a, b = T("now", 1) - 0.25, T("blow") - 0.25
s = Scene("sheet2", a, b)
mid = mapsvg(s, 0, hatch=True)
lx, ly = P["levant"]
mapshot(s, a, 0, 1500, 950, 0.64)
z = mapshot(s, T("technique") + 0.4, 0, lx + 40, ly - 10, 3.0)           # cut: close on ancient Israel
s.raw(f'<svg id="sheet2-reg" style="left:{lx - 60}px;top:{ly - 140}px" width="120" height="300"><path d="M50 10 C80 40 90 120 80 170 C70 220 50 260 30 290 C20 250 15 200 22 150 C30 100 30 50 50 10 Z" fill="url(#{mid}h)" stroke="{C["hot"]}" stroke-width="3"/></svg>',
      f'tl.fromTo("#sheet2-reg",{{opacity:0,scale:0.4,transformOrigin:"50% 50%"}},{{opacity:1,scale:1,duration:0.6,ease:"expo.out"}},{s.L(T("israel") - 0.25)});')
jx, jy = P["jerusalem"]; s.pin(jx, jy, T("israel") + 0.3, k=0.3)
z.cart(M, GRID["top"], 720, 230, T("most"))
z.text("Where glassblowing began", M + 40, GRID["top"] + 30, KK, T("most"), font="K", style="type")
z.text("Ancient Israel", M + 40, GRID["top"] + 76, D2, 0, cue=("ancient", 1), hot=(1,))
s.ktext("Jerusalem · earliest evidence, c. 50 BCE", jx + 14, jy - 8, LB / 3.0, T("israel") + 0.4, font="F", style="type")
cx, cy = cell(2); ox, oy = cx - 960, cy - 540                            # the clay-core infographic, toured
s.raw(f'<div id="sheet2-cc" class="plate" style="left:{ox + 124}px;top:{oy + 70}px;width:1672px;height:941px;opacity:0"><img src="assets/art/claycore.png" alt="" style="width:100%;height:100%"></div>',
      f'tl.fromTo("#sheet2-cc",{{opacity:0,scale:0.96}},{{opacity:1,scale:1,duration:0.6,ease:"expo.out"}},{s.L(T("one", 0) - 0.1)});')
s.cutaway("olga_hytta", T("you") - 0.05, T("one", 0) - 0.05, media=2.5, side="left",
          lines=[("You see,", D2, "F", "rise", ("you", 0), ()), ("before glassblowing…", D2, "D", "rise", ("before", 1), (1,))])
Shot(s, T("one", 0) - 0.05, cx, cy, 1.0)                                 # the whole infographic, then two punch-ins
Shot(s, T("shape") - 0.05, clamp(ox + 124 + 1672 * 0.235, ox + 480, ox + 1440), cy, 2.0)
Shot(s, T("clay", 0) - 0.1, clamp(ox + 124 + 1672 * 0.51, ox + 480, ox + 1440), cy, 2.0)
s.cutaway("olga_glory", T("rather", 1) - 0.15, T("but", 1) - 0.1, media=5.5,
          lines=[("A rather", D2, "F", "rise", ("a", 5), ()), ("laborious", D1, "D", "slam", ("laborious", 0), (0,)), ("process.", D2, "D", "rise", ("process,", 1), ())])
# G — layout C: the blowpipe, then a punch-in on the gather
cx, cy = cell(3); sh = Shot(s, T("but", 1) - 0.1, cx, cy)
sh.text("With the invention of the blowpipe…", 960, GRID["top"], D2 * 0.84, 0, cue=("with", 0), align="center", width=GRID["full"])
bp = sh.obj("blowpipe", 960, 470, 1000, T("blowpipe,") - 0.3, spin=0.8, glow=(62, 33, 22))
sh.text("a hollow iron pipe", 520, 700, LB, T("blowpipe,") + 0.4, font="F", style="type")
sh.end(T("gather") - 0.05, keep=(bp,))
g = Shot(s, T("gather") - 0.05, cx + 260, cy - 40, 1.45)
g.text("gather", M, GRID["top"], D1, 0, style="slam", cue=("gather", 0), hot=(0,))
g.text("molten glass onto the end of a pipe", M, GRID["top"] + D1 * 1.15, D3, 0, font="F", cue=("molten", 1))
# H — layout D: the Levant plate (the ancient breath) before the match cut
cx, cy = cell(4); sh = Shot(s, T("glass", 4) - 0.6, cx, cy)
sh.plate("levant", T("glass", 4) - 0.6, b, cap=("Ancient Israel", "c. 50 BCE · the first blowpipe"), fx0=0.3, fx1=0.42, z0=1.5, z1=1.25)
SCENES.append((s.cid, s.a, s.b, s.file(13500, 2000, wipe_in=True)))

# ================================================================ 4. BREATH — layout A, then the 3D bubble full frame (56.5 - 61.0)
a, b = T("blow") - 0.25, T("now", 2) - 0.2
s = Scene("breath", a, b)
BUBBLE = f"""<script type="module">
import * as THREE from "./assets/vendor/three.module.js";
window.__hf = window.__hf || {{}}; window.__hf.buildReady = window.__hf.buildReady || {{}};
let done; window.__hf.buildReady["breath"] = new Promise((r) => (done = r));
const canvas = document.getElementById("breath-gl");
const r = new THREE.WebGLRenderer({{ canvas, antialias: true, preserveDrawingBuffer: true, alpha: false }});
r.setPixelRatio(1); r.setSize(1920, 1080, false); r.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
// the manuscript page itself is the backdrop, so the glass refracts the papyrus and its ink
const c = document.createElement("canvas"); c.width = 2048; c.height = 1152; const g = c.getContext("2d");
const pap = new Image(); pap.src = "assets/art/papyrus.jpg"; await pap.decode();
for (let x = 0; x < c.width; x += 1024) for (let y = 0; y < c.height; y += 1024) g.drawImage(pap, x, y);
// faint ink: a manuscript page of vessel studies behind the bubble
g.strokeStyle = "rgba(42,25,12,.55)"; g.lineWidth = 4; g.lineCap = "round";
const vase = (x, y, s) => {{ g.beginPath(); g.moveTo(x - 20 * s, y); g.lineTo(x - 20 * s, y + 40 * s); g.bezierCurveTo(x - 110 * s, y + 80 * s, x - 100 * s, y + 230 * s, x, y + 260 * s);
  g.bezierCurveTo(x + 100 * s, y + 230 * s, x + 110 * s, y + 80 * s, x + 20 * s, y + 40 * s); g.lineTo(x + 20 * s, y); g.stroke(); }};
[[260, 180, 1.6], [620, 640, 1.2], [1500, 200, 1.4], [1820, 620, 1.1], [1080, 760, 0.9], [980, 120, 0.8]].forEach(([x, y, s]) => vase(x, y, s));
g.strokeStyle = "rgba(42,25,12,.25)"; g.lineWidth = 2;
for (let y = 90; y < c.height; y += 64) {{ g.beginPath(); g.moveTo(80, y); g.lineTo(c.width - 80, y); g.stroke(); }}
const vg = g.createRadialGradient(1024, 560, 300, 1024, 576, 1250); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(40,18,4,.7)"); g.fillStyle = vg; g.fillRect(0, 0, c.width, c.height);
const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
const cam = new THREE.PerspectiveCamera(30, 1920 / 1080, 0.1, 100); cam.position.set(0, 0, 10);
const ph = 2 * Math.tan(THREE.MathUtils.degToRad(15)) * 14;
const back = new THREE.Mesh(new THREE.PlaneGeometry(ph * 16 / 9, ph), new THREE.MeshBasicMaterial({{ map: tex }})); back.position.z = -4; scene.add(back);
const pm = new THREE.PMREMGenerator(r); const studio = new THREE.Scene(); studio.background = new THREE.Color(0.09, 0.06, 0.04);
const box = (w, h, x, y, z, l) => {{ const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({{ color: new THREE.Color(l, l, l), side: THREE.DoubleSide }})); m.position.set(x, y, z); m.lookAt(0, 0, 0); studio.add(m); }};
box(8, 3, -2, 6, 3, 3); box(1.2, 9, -7, 0, -1, 4); box(1.2, 9, 7, 0, 1, 2); box(6, 1, 0, -5, 3, 1.5);
scene.environment = pm.fromScene(studio, 0.02).texture;
const glassMat = new THREE.MeshPhysicalMaterial({{ color: 0xffffff, transmission: 1, thickness: 0.25, ior: 1.5, roughness: 0.02, dispersion: 0.4,
  attenuationColor: new THREE.Color("#e6f4ea"), attenuationDistance: 3, clearcoat: 1, clearcoatRoughness: 0.03, specularIntensity: 1 }});
const bubble = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 96), glassMat); scene.add(bubble);
const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 9, 32), new THREE.MeshStandardMaterial({{ color: 0x8a8f96, metalness: 0.9, roughness: 0.3 }}));
pipe.rotation.z = Math.PI / 2; scene.add(pipe);
const neck = new THREE.Mesh(new THREE.SphereGeometry(0.32, 48, 32), new THREE.MeshStandardMaterial({{ color: 0xff7a14, emissive: 0xff6a00, emissiveIntensity: 1.6, roughness: 0.35 }})); scene.add(neck);
scene.add(new THREE.DirectionalLight(0xffffff, 2.2).translateX(-4).translateY(5).translateZ(6));
const T0 = {s.L(T("suddenly") - 0.1)}, T1 = {s.L(T("form.") + 0.2)};
const eo = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
window.__render_breath = (t) => {{
  const k = eo((t - T0) / (T1 - T0));
  const R = 0.25 + 1.4 * k;                       // the bubble inflates
  bubble.scale.set(R * 1.08, R, R);
  bubble.position.set(0.7 + 0.2 * k, -0.25, 0); bubble.rotation.y = t * 0.4;
  neck.position.set(0.7 - R * 1.05, -0.25, 0); neck.scale.setScalar(0.8 + 0.2 * (1 - k));
  pipe.position.set(0.7 - R * 1.05 - 4.5, -0.25, 0);
  cam.position.set(Math.sin(t * 0.3) * 0.4, 0.1, 10 - 0.8 * k); cam.lookAt(0.4, 0.2, 0);
  r.render(scene, cam);
}};
window.__render_breath(0);
done();
</script>"""
sh = Shot(s, a, 960, 540)
sh.video("olga_blow2", a + 0.02, T("suddenly") + 0.2, media=0.1)
sh.block([("…and blow", D1, "D", "slam", ("blow", 0), (1,)), ("air into it.", D2, "F", "rise", ("air", 0), ())], M, 0)
s.raw('<canvas id="breath-gl" width="1920" height="1080" style="position:absolute;left:0;top:0;width:1920px;height:1080px;opacity:0"></canvas>',
      f'tl.fromTo("#breath-gl",{{opacity:0}},{{opacity:1,duration:0.2,ease:"power2.out"}},{s.L(T("suddenly") - 0.1)});')
s.ktext("A hollow glass form.", 960, GRID["top"], D2, 0, cue=("hollow", 2), hot=(1,), align="center", width=GRID["full"])
SCENES.append((s.cid, s.a, s.b, s.file(1920, 1080, module=BUBBLE, wipe_out=True)))

# ================================================================ 5. SHEET 3 (61.0 - 87.4)
a, b = T("now", 2) - 0.2, T("heat") - 0.3
s = Scene("sheet3", a, b)
s.cutaway("olga_dolphin", a + 0.02, T("you", 3) - 0.05, media=0.0,
          lines=[("Think about", D2, "F", "rise", ("think", 0), ()), ("what that meant.", D1 * 0.84, "D", "rise", ("what", 0), (2,))])
for k, (nm, cue, word, sub, spin) in enumerate([("hourglass", "faster,", "faster", "You could make vessels", 2.2),
                                                ("flask", "thinner,", "thinner, lighter", "with thin, light, blown walls", 0.8),
                                                ("vessels", "variety", "endless shapes", "in a much greater variety of", 0.6)]):
    cx, cy = cell(k); t0 = (T("you", 3) - 0.05) if k == 0 else T(cue) - 0.3
    sh = Shot(s, t0, cx, cy)                                              # layout C, one object per cut
    sh.text(sub, 960, GRID["top"], D3, t0 + 0.05, font="F", style="type", align="center", width=GRID["full"])
    sh.obj(nm, 960, 400, 470 if k < 2 else 620, t0, spin=spin)
    sh.text(word, 960, 640, D1, 0, style="slam", cue=(cue, 0), hot=tuple(range(3)), align="center", width=GRID["full"])
cx, cy = cell(3); sh = Shot(s, T("romans") - 0.55, cx, cy)                # layout D: Rome
sh.plate("rome", T("romans") - 0.55, T("adopted") + 0.2, cap=("Rome", "1st century CE · glass for everyone"), fx0=0.25, fx1=0.75, z0=1.5, z1=1.05)
ox = 4 * CELL; mapsvg(s, ox)                                              # the routes across the empire
w = mapshot(s, T("adopted") - 0.3, ox, 1500, 950, 0.64)
src = P["sidon"]
for k, city in enumerate(["alexandria", "rome", "aquileia", "cologne"]):
    x, y = P[city]; mx, my = (x + src[0]) / 2, min(y, src[1]) - 260; t0 = T("spread") - 0.4 + k * 0.7
    s.sketch([f"M{src[0]} {src[1]} Q{mx} {my} {x} {y}"], t0, dur=0.9, x=ox, y=0, w=MAP["W"], h=MAP["H"])
    s.pin(ox + x, y, t0 + 0.8, k=1 / 0.64); s.ktext(city.capitalize(), ox + x + 60, y - 70, LB / 0.64, t0 + 0.8, font="F", style="type")
s.pin(ox + src[0], src[1], T("adopted"), k=1 / 0.64); s.ktext("Sidon", ox + src[0] + 60, src[1] - 70, LB / 0.64, T("adopted"), font="F", style="type")
CY = GRID["safe"] - 220
w.cart(M, CY, 900, 220, T("throughout"))
w.text("Throughout the Mediterranean", M + 40, CY + 30, KK, 0, font="K", style="type", cue=("throughout", 0))
w.text("the Roman Empire", M + 40, CY + 80, D2, 0, cue=("roman", 0), hot=(1,))
s.compass(ox + 2740, 1640, T("spread"), r=160)
s.cutaway("olga_rose", T("but", 2) - 0.05, T("more") - 0.1, media=0.2,
          lines=[("But here's something", D2, "F", "rise", ("but", 2), ()), ("I find particularly", D2, "F", "rise", ("i", 0), ()),
                 ("fascinating.", D1, "D", "slam", ("fascinating.", 0), (0,))])
cx, cy = cell(6); sh = Shot(s, T("more") - 0.1, cx, cy)                  # pure kinetic type: the 2,000-year counter
i = sh.text("0+", 960, 200, D1 * 1.6, T("more") - 0.1, style="slam", align="center", width=GRID["full"], hot=(0,))
s.js.append(f'(function(){{const o={{v:0}},el=document.querySelector("#{i} .ki");tl.fromTo(o,{{v:0}},{{v:2000,duration:1.2,ease:"power2.out",onUpdate:()=>{{el.textContent=Math.round(o.v).toLocaleString("en-US")+"+";}}}},{s.L(T("more"))});}})();')
sh.text("years later,", 960, 200 + D1 * 1.6 * 1.12, D2, 0, cue=("years", 1), align="center", width=GRID["full"])
sh.text("still using the same principles.", 960, 200 + D1 * 1.6 * 1.12 + D2 * 1.3, D3, 0, font="F", cue=("still", 0), hot=(3,), align="center", width=GRID["full"])
cx, cy = cell(7); sh = Shot(s, T("essentially") - 0.1 if False else T("same") + 0.6, cx, cy)   # layout D: Olga's craft today
sh.plate("modern", T("same") + 0.6, b, cap=("Today", "the same breath, 2,000 years on"), fx0=0.25, fx1=0.7, z0=1.5, z1=1.08)
SCENES.append((s.cid, s.a, s.b, s.file(22000, 2000, wipe_in=True, wipe_out=True)))

# ================================================================ 6. TODAY — three stations in layout A, the hands in layout B (87.4 - 103.8)
a, b = T("heat") - 0.3, T("i'm") - 0.3
s = Scene("today", a, b)
stations = [("olga_glory", "heat", "Heat", 1.0, "50% 40%", [("until it's soft enough to work", "soft")]),
            ("olga_blow2", "introduce", "Air", 4.6, "50% 35%", [("through the blowpipe", "through")]),
            ("swing", "controlling", "Control", 0.0, "50% 50%", [("temperature", "temperature,"), ("movement", "movement,"), ("gravity", "gravity,")])]
for k, (nm, cue, word, med, pos, notes) in enumerate(stations):
    t0 = T(cue) - 0.35
    t1 = T(stations[k + 1][1]) - 0.35 if k + 1 < len(stations) else T("course", 1) - 0.45
    cx, cy = cell(k); sh = Shot(s, t0, cx, cy)
    sh.video(nm, t0, t1, media=med, pos=pos)
    lines = [(f"0{k + 1}", KK * 1.4, "K", "type", None, ()), (word, D1, "D", "slam", (cue, 0), (0,), 40)] + \
            [(n, D3, "F", "rise", (c, 0), ()) for n, c in notes]
    sh.block(lines, M, t0 + 0.05)
s.cutaway("olga_dolphin", T("course", 1) - 0.45, T("hands") - 0.25, media=8.0, side="left",
          lines=[("One more", D2, "F", "rise", ("one", 1), ()), ("very important", D2, "F", "rise", ("very", 0), ()), ("ingredient…", D1 * 0.84, "D", "slam", ("ingredient.", 0), (0,))])
cx, cy = cell(3); sh = Shot(s, T("hands") - 0.25, cx, cy)               # layout B: the hands
sh.video("bench_hands", T("hands") - 0.25, b, side="left")
sh.block([("The hands", D1, "D", "slam", ("hands", 0), (1,)), ("of the glassmaker.", D2, "D", "rise", ("of", 8), ())], COLB, 0)
SCENES.append((s.cid, s.a, s.b, s.file(10000, 1080, wipe_in=True, wipe_out=True)))

# ================================================================ 7. OLGA (103.8 - 128.4)
a, b = T("i'm") - 0.3, T("i'd", 1) - 0.25
s = Scene("olga", a, b)
cx, cy = cell(0); sh = Shot(s, a, cx, cy)                                 # layout A: who she is
sh.video("olga_hytta", a + 0.02, T("connected") - 0.4, media=0.8, rate=0.9, pos="50% 30%")
LOGO_W, LOGO_H = 520, 362
s.raw(f'<div id="olga-plq" style="position:absolute;left:{sh.X(M)}px;top:{sh.Y(130)}px;width:{LOGO_W}px;height:{LOGO_H}px;opacity:0">'
      f'<img id="olga-logo" src="assets/art/olga_logo_alpha.png" alt="" style="position:absolute;left:0;top:0;width:{LOGO_W}px;height:{LOGO_H}px;filter:drop-shadow(6px 10px 10px rgba(50,24,6,.45))"></div>',
      f'tl.fromTo("#olga-plq",{{opacity:0,rotationY:80,transformPerspective:1600}},{{opacity:1,rotationY:0,duration:1.0,ease:"expo.out"}},{s.L(T("olga") - 0.3)});')
sh.text("Olga Rozin", M, 130 + LOGO_H + 40, D1, 0, style="slam", cue=("olga", 0))
sh.text("Glass artist", M, 130 + LOGO_H + 40 + D1 * 1.15, KK * 1.4, 0, font="K", style="type", cue=("glass", 13) if False else ("artist.", 0))
cx, cy = cell(1); sh = Shot(s, T("connected") - 0.5, cx, cy)             # layout D: the craft through the ages
sh.plate("montage", T("connected") - 0.5, T("there's", 1) - 0.1, cap=("Thousands of years", "one craft, still connected"), fx0=0.2, fx1=0.75, z0=1.6, z1=1.02)
cx, cy = cell(2); sh = Shot(s, T("there's", 1) - 0.1, cx, cy)            # layout A: her pieces
sh.video("olga_rose", T("there's", 1) - 0.1, T("and", 7) if False else T("i'd", 0) - 0.15, media=3.0)
sh.block([("So much fascinating", D2, "F", "rise", ("so", 0), ()), ("history", D1, "D", "slam", ("history", 0), (0,)), ("behind this material", D2, "F", "rise", ("behind", 0), ())], M, 0)
cx, cy = cell(3); sh = Shot(s, T("i'd", 0) - 0.15, cx, cy)               # layout B: …to share
sh.video("olga_dolphin", T("i'd", 0) - 0.15, T("follow") - 0.5, side="left", media=12.0)
sh.block([("I'd love to share", D2, "F", "rise", ("i'd", 0), ()), ("more of it", D1, "D", "slam", ("more", 1), (0,)), ("with you.", D2, "F", "rise", ("with", 2), ())], COLB, 0)
cx, cy = cell(4); sh = Shot(s, T("follow") - 0.5, cx, cy)                # centred: Instagram
s.raw(f'<svg id="olga-ig" style="left:{sh.X(960 - 90)}px;top:{sh.Y(GRID["top"])}px" width="180" height="180" viewBox="0 0 64 64"><rect class="stk p" pathLength="100" stroke-dasharray="100 120" stroke-dashoffset="110" x="6" y="6" width="52" height="52" rx="15"/><circle class="stk p" pathLength="100" stroke-dasharray="100 120" stroke-dashoffset="110" cx="32" cy="32" r="12"/><circle cx="46" cy="18" r="3" fill="{C["ink"]}"/></svg>',
      f'tl.fromTo("#olga-ig .p",{{strokeDashoffset:110}},{{strokeDashoffset:0,duration:0.6,stagger:0.1,ease:"power2.inOut"}},{s.L(T("follow") - 0.45)});')
sh.block([("Follow me on Instagram", D3, "F", "rise", ("follow", 0), ()), ("@olga_rozin", D1, "D", "slam", ("@olga_rozin", 0), (0,)), ("for more stories about glassmaking", LB, "F", "type", ("for", 3) if False else ("stories", 0), ())],
         960, 0, yc=540, align="center", width=GRID["full"])
cx, cy = cell(5); sh = Shot(s, T("comments,") - 0.6, cx, cy)             # centred: the question
sh.block([("Tell me in the comments", KK * 1.4, "K", "type", ("comments,", 0), (), 30), ("Would you like to learn", D2, "D", "rise", ("would", 0), ()),
          ("how glass is made?", D1 * 0.9, "D", "slam", ("how", 1), (1,))], 960, 0, align="center", width=GRID["full"])
SCENES.append((s.cid, s.a, s.b, s.file(16000, 1080, wipe_in=True)))

# ================================================================ 8. OUTRO — layout B on dark: the goodbye + end card (128.4 - end)
a, b = T("i'd", 1) - 0.25, DUR
s = Scene("outro", a, b)
sh = Shot(s, a, 960, 540)
sh.video("olga_fashion", a, b, side="left", media=1.7, pos="50% 35%", rect=(M, GRID["win_y"], 620, 880))
s.ktext("Olga in her glass costume · Glass Fashion Show", M, GRID["win_y"] + 880 + 14, 28, a + 0.6, font="F", style="type", color=C["gold"])
COLX = 860
s.ktext("I'd love to hear", COLX, 150, D2, 0, cue=("i'd", 1), cls="ondark")
s.ktext("what you think!", COLX, 150 + D2 * 1.12, D2, 0, cue=("what", 1) if False else ("think!", 1), hot=(1,), cls="ondark")
s.raw(f'<img id="outro-logo" src="assets/art/olga_logo_alpha.png" alt="" style="position:absolute;left:{COLX}px;top:420px;width:400px;height:279px;opacity:0">'
      f'<div id="outro-shine" style="position:absolute;left:{COLX}px;top:420px;width:400px;height:279px;opacity:0;mix-blend-mode:screen;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.9) 50%,transparent 65%) no-repeat;-webkit-mask:url(assets/art/olga_logo_alpha.png) center/100% 100% no-repeat;mask:url(assets/art/olga_logo_alpha.png) center/100% 100% no-repeat"></div>',
      f'tl.fromTo("#outro-logo",{{opacity:0,scale:1.1,filter:"blur(10px)"}},{{opacity:1,scale:1,filter:"blur(0px)",duration:0.9,ease:"expo.out"}},{s.L(LAST + 0.5)});'
      f'tl.fromTo("#outro-shine",{{opacity:0,backgroundPosition:"-400px 0"}},{{opacity:1,backgroundPosition:"400px 0",duration:1.0,ease:"power2.inOut"}},{s.L(LAST + 1.4)});'
      f'tl.fromTo("#outro-shine",{{backgroundPosition:"-400px 0"}},{{immediateRender:false,backgroundPosition:"400px 0",duration:1.2,ease:"power2.inOut"}},{s.L(LAST + 4.6)});')
s.ktext(f"Glass Stories · Episode {EP['n']}", COLX, 750, KK, LAST + 1.2, font="K", style="type", cls="gold")
s.ktext("Next time: how is glass made?", COLX, 800, D3 * 0.75, LAST + 2.4, font="F", cls="ondark")
s.ktext("Follow @olga_rozin", COLX, 880, D3 * 0.75, LAST + 3.6, font="D", hot=(1,), cls="ondark", style="slam")
s.embers(LAST + 0.3, DUR, n=40, seed=9, x0=760, x1=1920)
SCENES.append((s.cid, s.a, s.b, s.file(1920, 1080, bg=C["dark"])))

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
        cap_js.append(f'tl.fromTo("#cw{gi}_{k}",{{opacity:0,display:"none"}},{{opacity:1,display:"inline-block",duration:0.08}},{round(st if k == 0 else w["start"] - 0.04, 3)});')
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
