import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, interpolate } from "remotion";
import { Audio } from "@remotion/media";
import { LINES, WORDS } from "./data/words";
import {
  C, F, FPS, spr, ease, rise, popIn, Scene, Card, Pill, ItemHeader, Tick, Check, Cross, Q, FileRiv, Artboard, Gear, Link, Lens,
  Lock, Flask, Brush, Layers, Phone, Slot, SLOTS, Wire, Arrow, Bug, Eye,
} from "./ui";

// ------------------------------------------------------------------ cue lookup on the narration
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9.]/g, "");
const at = (w: string, n = 0) => {
  const hits = WORDS.filter((x) => norm(x.text) === norm(w));
  if (!hits[n]) throw new Error(`cue not in narration: ${w}#${n}`);
  return hits[n].start;
};

// scene windows (seconds) — each starts on the sentence that introduces it
const S = {
  intro: [0, 3.1], d1: [3.1, 7.4], d2: [7.4, 11.75], d3: [11.75, 15.55], todo: [15.55, 18.35],
  t1: [18.35, 24.95], t2: [24.95, 31.35], t3: [31.35, 37.4], t4: [37.4, 43.2], t5: [43.2, 47.8],
  t6: [47.8, 54.25], t7: [54.25, 65.8], next: [65.8, 77.2], end: [77.2, 81],
} as const;
export const DURATION_S = 80;

// ------------------------------------------------------------------ helpers
const Clip: React.FC<{ src: string; from: number; trim?: number; rate?: number; style?: React.CSSProperties; dur?: number }> = ({ src, from, trim = 0, rate = 1, style, dur }) => (
  <Sequence from={Math.round(from * FPS)} durationInFrames={dur ? Math.round(dur * FPS) : undefined} layout="none">
    <OffthreadVideo src={staticFile(src)} muted trimBefore={Math.round(trim * FPS)} playbackRate={rate} style={{ position: "absolute", ...style }} />
  </Sequence>
);
const Label: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; size?: number; color?: string; weight?: number }> = ({ children, style, size = 30, color = C.text, weight = 700 }) => (
  <div style={{ position: "absolute", fontFamily: F.ui, fontWeight: weight, fontSize: size, color, whiteSpace: "nowrap", ...style }}>{children}</div>
);
const WindowBar: React.FC<{ title: string; color?: string }> = ({ title, color = C.rive }) => (
  <div style={{ height: 52, background: "#0A0F1E", display: "flex", alignItems: "center", gap: 10, padding: "0 20px", borderBottom: `1px solid ${C.line}` }}>
    {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />)}
    <div style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 20, color, marginLeft: 14 }}>{title}</div>
  </div>
);

// ================================================================== INTRO
const Intro: React.FC<{ t: number }> = ({ t }) => {
  const tDone = at("week,");
  const stats: [string, string, string, number][] = [
    ["3", "Completed", C.done, 0.9], ["7", "Still to do", C.todo, 1.05], ["1", "Next step", C.accent, 1.2],
  ];
  return (
    <>
      <div style={{ position: "absolute", left: 120, top: 210, ...rise(t, 0.1) }}>
        <Pill color={C.accent}>Gregory · Rive character rigs</Pill>
      </div>
      <Label size={150} weight={900} style={{ left: 112, top: 280, letterSpacing: -5, ...rise(t, 0.0, 60) }}>Daily Update</Label>
      <Label size={40} weight={500} color={C.dim} style={{ left: 120, top: 475, ...rise(t, 0.4) }}>Week of Nov 5, 2026 · Hatched rig, wardrobe slots & bindings</Label>
      {stats.map(([n, l, col, d], i) => {
        const hi = i === 0 ? spr(t, tDone - 0.1, 14, 160) : 0;
        return (
          <Card key={l} glow={hi > 0.05 ? col : undefined} style={{ left: 120 + i * 430, top: 590, width: 390, height: 220, ...popIn(t, d), scale: `${(0.6 + 0.4 * spr(t, d, 11, 180)) * (1 + 0.05 * hi)}` }}>
            <div style={{ position: "absolute", left: 36, top: 26, fontFamily: F.ui, fontWeight: 900, fontSize: 110, color: col }}>{n}</div>
            <div style={{ position: "absolute", left: 40, top: 152, fontFamily: F.ui, fontWeight: 700, fontSize: 34, color: C.text }}>{l}</div>
          </Card>
        );
      })}
    </>
  );
};

// ================================================================== DONE 1 — Hatched rig
const Done1: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.d1;
  return (
    <>
      <ItemHeader t={t} a={a} kind="done" label="Done · 1 / 3" title="Hatched character rig" />
      <div style={{ position: "absolute", left: 120, top: 470 }}>
        <Tick t={t} t0={at("implemented")} label="Implemented" />
        <Tick t={t} t0={at("basic")} label="Basic testing" />
      </div>
      <Card style={{ left: 840, top: 170, width: 960, height: 640, ...popIn(t, a + 0.15) }}>
        <WindowBar title="Rive · mogu_stage2 · MoguSM" />
        <div style={{ position: "absolute", top: 52, left: 0, right: 0, bottom: 0, overflow: "hidden", background: "#262626" }}>
          <Clip src="clips/hatched_editor.mp4" from={a} trim={5.4} rate={1.45} style={{ width: 1920 * 1.15, height: 1080 * 1.15, left: -490, top: -380 }} />
        </div>
      </Card>
      <div style={{ position: "absolute", left: 870, top: 740, ...rise(t, a + 0.8) }}>
        <Pill color={C.rive} size={22}>Feed · clean · play reactions</Pill>
      </div>
    </>
  );
};

// ================================================================== DONE 2 — hat slot across rigs
const Done2: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.d2;
  const poof = a + 0.3 + 0.36; // evo clip starts a+0.3, the puff lands ~0.36s in
  const after = spr(t, poof + 0.55, 14, 160);
  return (
    <>
      <ItemHeader t={t} a={a} kind="done" label="Done · 2 / 3" title="Hat wardrobe slot works across rigs" />
      <div style={{ position: "absolute", left: 120, top: 520 }}>
        <Tick t={t} t0={at("verified")} label="Verified in the app" />
      </div>
      <Phone w={360} h={760} style={{ left: 1000, top: 140, ...popIn(t, a + 0.1) }} glow={after > 0.1 ? C.done : undefined}>
        <Clip src="clips/evo_app.mp4" from={a + 0.3} style={{ width: "100%", height: "100%", objectFit: "cover", left: 0, top: 0 }} />
      </Phone>
      {/* rig labels: before / after the evolution — same hat slot */}
      <div style={{ position: "absolute", left: 1420, top: 260, ...rise(t, a + 0.4) }}>
        <Pill color={C.dim} size={24}><Slot kind="hat" size={30} color={C.dim} /> Rig 4 + hat</Pill>
      </div>
      <div style={{ position: "absolute", left: 1450, top: 330, opacity: ease(t, poof, poof + 0.4) }}><Arrow size={54} color={C.dim} rot={90} /></div>
      <div style={{ position: "absolute", left: 1420, top: 410, opacity: Math.min(1, after * 1.5), scale: `${0.7 + 0.3 * after}` }}>
        <Pill color={C.done} solid size={24}><Check size={26} color="#0D1224" /> Rig 5 + hat</Pill>
      </div>
      <Label size={26} weight={600} color={C.dim} style={{ left: 1422, top: 500, opacity: after }}>Same slot, new rig — it carries over</Label>
    </>
  );
};

// ================================================================== DONE 3 — slot & binding setup investigated
const Done3: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.d3;
  const tSlots = at("slot", 1), tBind = at("binding", 0);
  // rows in rig3_inputs.png (395x320 src, shown x2): wear* rows y≈72..190, *Fit rows 196..320
  const hiSlots = ease(t, tSlots - 0.3, tSlots + 0.2), hiBind = ease(t, tBind - 0.2, tBind + 0.3);
  const sc = 2;
  return (
    <>
      <ItemHeader t={t} a={a} kind="done" label="Done · 3 / 3" title="Investigated wardrobe slots & bindings" />
      <Card style={{ left: 840, top: 170, width: 830, height: 700, ...popIn(t, a + 0.1) }}>
        <WindowBar title="Rive · MoguSM · View-model inputs" />
        <div style={{ position: "absolute", top: 70, left: 20 }}>
          <Img src={staticFile("img/rig3_inputs.png")} style={{ width: 395 * sc, height: 320 * sc, imageRendering: "auto", borderRadius: 10 }} />
          <div style={{ position: "absolute", left: 0, top: 70 * sc, width: 395 * sc, height: 124 * sc, border: `4px solid ${C.accent}`, borderRadius: 12, opacity: hiSlots, boxShadow: `0 0 0 9999px rgba(10,14,30,${0.45 * hiSlots * (1 - hiBind)})` }} />
          <div style={{ position: "absolute", left: 0, top: 196 * sc, width: 395 * sc, height: 122 * sc, border: `4px solid ${C.rive}`, borderRadius: 12, opacity: hiBind }} />
        </div>
      </Card>
      <div style={{ position: "absolute", left: 120, top: 520 }}>
        <div style={rise(t, tSlots - 0.3)}><Pill color={C.accent} size={24}>Slots · wear* toggles (5)</Pill></div>
        <div style={{ marginTop: 22, ...rise(t, tBind - 0.2) }}><Pill color={C.rive} size={24}>Bindings · *Fit scale / X / Y</Pill></div>
      </div>
    </>
  );
};

// ================================================================== STILL TO DO — overview
const TODO_ITEMS: [string, "todo" | "bug"][] = [
  ["Some slots don't load their .riv", "todo"], ["Rive Lab APK vs regular APK", "todo"], ["Is runtime load / bind the cause?", "todo"],
  ["Add remaining slots & bindings", "todo"], ["Test new wardrobe artwork", "todo"], ["T-shirt shadow render order", "bug"], ["Rattle-hand animation, Rig 3 (2?)", "bug"],
];
const TodoOverview: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.todo;
  return (
    <>
      <div style={{ position: "absolute", left: 120, top: 190, ...rise(t, a) }}><Pill color={C.todo} solid><Q size={26} color="#0D1224" />Still to do · 7</Pill></div>
      <Label size={96} weight={900} style={{ left: 116, top: 270, letterSpacing: -3, ...rise(t, a + 0.1, 50) }}>Still to resolve</Label>
      {TODO_ITEMS.map(([s, k], i) => {
        const col = k === "bug" ? C.bug : C.todo;
        const x = i < 4 ? 120 : 980, y = 440 + (i % 4) * 105;
        return (
          <div key={s} style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: 22, ...rise(t, a + 0.35 + i * 0.12) }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: `${col}22`, border: `2px solid ${col}`, color: col, fontFamily: F.ui, fontWeight: 900, fontSize: 30, display: "grid", placeItems: "center" }}>{i + 1}</div>
            <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 36, color: C.text }}>{s}</div>
          </div>
        );
      })}
    </>
  );
};

// ================================================================== T1 — slots don't load .riv into bound artboards
const T1: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.t1;
  const tLoad = at("load"), tBound = at("bound"), tWhy = at("artboards.") + 0.5;
  const X0 = 880, Y0 = 230, ROW = 120;
  return (
    <>
      <ItemHeader t={t} a={a} kind="todo" label="To do · 1 / 7" title="Some slots don't load their .riv files" sub="The slot is bound to an artboard, but the .riv never shows up in it. Find out why." />
      <Label size={24} weight={800} color={C.dim} style={{ left: X0, top: Y0 - 70, letterSpacing: 2, opacity: ease(t, a + 0.3, a + 0.8) }}>SLOT</Label>
      <Label size={24} weight={800} color={C.dim} style={{ left: X0 + 330, top: Y0 - 70, letterSpacing: 2, opacity: ease(t, tLoad - 0.2, tLoad + 0.3) }}>.RIV FILE</Label>
      <Label size={24} weight={800} color={C.dim} style={{ left: X0 + 640, top: Y0 - 70, letterSpacing: 2, opacity: ease(t, tBound - 0.2, tBound + 0.3) }}>BOUND ARTBOARD</Label>
      {SLOTS.map((s, i) => {
        const y = Y0 + i * ROW;
        const ok = i === 0; // hat — verified this week
        const p1 = ease(t, tLoad + i * 0.08, tLoad + 0.5 + i * 0.08);
        const p2 = ease(t, tBound + i * 0.08, tBound + 0.5 + i * 0.08);
        const fail = !ok && t > tBound + 0.5;
        const q = spr(t, tWhy - 0.6 + i * 0.07, 10, 200);
        return (
          <React.Fragment key={s}>
            <div style={{ position: "absolute", left: X0, top: y, width: 220, height: 90, borderRadius: 20, background: C.card, border: `2px solid ${C.line}`, display: "flex", alignItems: "center", gap: 16, padding: "0 18px", ...rise(t, a + 0.3 + i * 0.07) }}>
              <Slot kind={s} size={46} color={ok ? C.done : C.text} />
              <span style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 30, color: C.text }}>{s}</span>
            </div>
            <Wire x1={X0 + 232} y1={y + 45} x2={X0 + 330} y2={y + 45} p={p1} color={C.rive} />
            <div style={{ position: "absolute", left: X0 + 335, top: y - 6, opacity: p1, scale: `${0.7 + 0.3 * p1}` }}><FileRiv size={78} /></div>
            <Wire x1={X0 + 430} y1={y + 45} x2={X0 + 640} y2={y + 45} p={p2} color={ok ? C.done : C.bug} dash={!ok} />
            <div style={{ position: "absolute", left: X0 + 645, top: y - 2, opacity: p2 }}>
              <Artboard size={94} color={ok ? C.done : `${C.text}`} />
              {ok ? <div style={{ position: "absolute", left: 30, top: 28 }}><Slot kind="hat" size={36} color={C.done} /></div> : null}
            </div>
            <div style={{ position: "absolute", left: X0 + 760, top: y + 16, width: 60, height: 60, borderRadius: 30, display: "grid", placeItems: "center", background: ok ? C.done : C.todo, opacity: ok ? p2 : fail ? Math.min(1, q * 1.5) : 0, scale: `${ok ? 0.6 + 0.4 * p2 : 0.6 + 0.4 * q}` }}>
              {ok ? <Check size={34} color="#0D1224" /> : <Q size={36} color="#0D1224" />}
            </div>
          </React.Fragment>
        );
      })}
      <Label size={26} weight={600} color={C.dim} style={{ left: X0, top: Y0 + 5 * ROW + 6, opacity: ease(t, tWhy - 0.4, tWhy + 0.2) }}>
        Hat loads ✓ · the other slots still need to be traced
      </Label>
    </>
  );
};

// ================================================================== T2 — Rive Lab APK vs regular APK
const T2: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.t2;
  const tLab = at("lab"), tReg = at("regular"), tDiff = at("difference");
  const scan = ((t - tDiff) % 1.6) / 1.6;
  return (
    <>
      <ItemHeader t={t} a={a} kind="todo" label="To do · 2 / 7" title="Rive Lab APK vs. regular APK" sub="Pin down the exact difference between the two builds." w={640} />
      <div style={{ ...popIn(t, tLab - 0.25) }}>
        <Phone w={330} h={700} style={{ left: 860, top: 150 }} glow={C.rive}>
          <Clip src="clips/riveLab.mp4" from={a} trim={0} style={{ width: "100%", height: "100%", objectFit: "cover", left: 0, top: 0 }} />
        </Phone>
        <div style={{ position: "absolute", left: 860, top: 868, width: 330, textAlign: "center" }}><Pill color={C.rive} size={22}>Rive Lab testing APK</Pill></div>
      </div>
      <div style={{ ...popIn(t, tReg - 0.2) }}>
        <Phone w={330} h={700} style={{ left: 1460, top: 150 }}>
          <Clip src="clips/evo_app.mp4" from={a} trim={2.4} rate={0.6} style={{ width: "100%", height: "100%", objectFit: "cover", left: 0, top: 0 }} />
        </Phone>
        <div style={{ position: "absolute", left: 1460, top: 868, width: 330, textAlign: "center" }}><Pill color={C.dim} size={22}>Regular APK</Pill></div>
      </div>
      {/* diff marker */}
      <div style={{ position: "absolute", left: 1235, top: 400, width: 180, height: 180, borderRadius: 90, background: C.card, border: `3px solid ${C.todo}`, display: "grid", placeItems: "center", ...popIn(t, tDiff - 0.1) }}>
        <span style={{ fontFamily: F.ui, fontWeight: 900, fontSize: 96, color: C.todo, marginTop: -8 }}>≠</span>
      </div>
      <Label size={26} weight={700} color={C.todo} style={{ left: 1205, top: 600, width: 240, textAlign: "center", opacity: ease(t, tDiff, tDiff + 0.4) }}>exact difference?</Label>
      {t > tDiff ? <div style={{ position: "absolute", left: 860, top: 150 + scan * 700, width: 930, height: 4, background: `linear-gradient(90deg, transparent, ${C.todo}, transparent)`, opacity: 0.8 }} /> : null}
    </>
  );
};

// ================================================================== T3 — runtime loading/binding the cause?
const T3: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.t3;
  const tRun = at("runtime"), tBind = at("binding", 1), tCaused = at("caused");
  const nodes: [string, React.ReactNode, string][] = [
    [".riv asset", <FileRiv key="f" size={70} />, C.rive],
    ["Runtime load", <Gear key="g" size={84} color={C.text} />, C.todo],
    ["Bind to artboard", <Link key="l" size={84} color={C.text} />, C.todo],
    ["Slot renders", <Eye key="e" size={84} color={C.text} />, C.done],
  ];
  const Y = 500, X0 = 170, GAP = 420;
  const sus = ease(t, tRun - 0.2, tBind + 0.4);
  return (
    <>
      <ItemHeader t={t} a={a} kind="todo" label="To do · 3 / 7" title="Is the runtime loading / binding the cause?" w={1500} y={170} />
      {nodes.map(([l, ic, col], i) => {
        const x = X0 + i * GAP;
        const t0 = a + 0.45 + i * 0.22;
        const suspect = i === 1 || i === 2;
        return (
          <React.Fragment key={l}>
            {i > 0 ? <Wire x1={x - GAP + 300} y1={Y + 100} x2={x - 20} y2={Y + 100} p={ease(t, t0 - 0.1, t0 + 0.3)} color={C.dim} width={4} /> : null}
            <Card glow={suspect && sus > 0.05 ? C.todo : undefined} style={{ left: x, top: Y, width: 290, height: 200, ...popIn(t, t0) }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 26, display: "grid", placeItems: "center" }}>{ic}</div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 138, textAlign: "center", fontFamily: F.ui, fontWeight: 700, fontSize: 28, color: C.text }}>{l}</div>
            </Card>
          </React.Fragment>
        );
      })}
      {/* suspected zone */}
      <div style={{ position: "absolute", left: X0 + GAP - 26, top: Y - 34, width: GAP + 342, height: 268, border: `4px dashed ${C.todo}`, borderRadius: 34, opacity: sus }} />
      <div style={{ position: "absolute", left: X0 + GAP + 160, top: Y - 116, display: "flex", alignItems: "center", gap: 14, ...popIn(t, tCaused - 0.1) }}>
        <Lens size={56} color={C.todo} /><Pill color={C.todo} solid size={26}>Suspected cause — confirm</Pill>
      </div>
    </>
  );
};

// ================================================================== T4 — add remaining slots after loading is understood
const T4: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.t4;
  const tUnd = at("understand"), tAdd = at("add"), tRem = at("remaining");
  const gate = spr(t, tUnd - 0.1, 14, 160);
  return (
    <>
      <ItemHeader t={t} a={a} kind="todo" label="To do · 4 / 7" title="Add the remaining slots & bindings" sub="Only after I understand how the loading process works." w={700} />
      <Card glow={gate > 0.1 ? C.todo : undefined} style={{ left: 900, top: 200, width: 360, height: 300, ...popIn(t, a + 0.25) }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 40, display: "grid", placeItems: "center" }}><Lock size={110} color={C.todo} open={0} /></div>
        <div style={{ position: "absolute", left: 20, right: 20, top: 180, textAlign: "center", fontFamily: F.ui, fontWeight: 700, fontSize: 30, color: C.text, lineHeight: 1.25 }}>Gate: loading process understood</div>
      </Card>
      <Wire x1={1280} y1={350} x2={1420} y2={350} p={ease(t, tAdd - 0.3, tAdd)} color={C.todo} dash />
      <Card style={{ left: 1440, top: 200, width: 360, height: 640, ...popIn(t, tAdd - 0.2) }}>
        <div style={{ position: "absolute", left: 30, top: 26, fontFamily: F.ui, fontWeight: 800, fontSize: 24, color: C.dim, letterSpacing: 2 }}>SLOTS + BINDINGS</div>
        {SLOTS.map((s, i) => {
          const done = i === 0;
          const k = done ? 1 : spr(t, tRem + i * 0.12, 13, 170);
          return (
            <div key={s} style={{ position: "absolute", left: 30, top: 84 + i * 108, width: 300, height: 88, borderRadius: 18, border: `2px ${done ? "solid" : "dashed"} ${done ? C.done : C.todo}`, background: done ? `${C.done}18` : `${C.todo}10`, display: "flex", alignItems: "center", gap: 16, padding: "0 18px", opacity: done ? ease(t, a + 0.4, a + 0.8) : Math.min(1, k * 1.5), translate: `${(1 - k) * 60}px 0px` }}>
              <Slot kind={s} size={42} color={done ? C.done : C.text} />
              <span style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 28, color: C.text, flex: 1 }}>{s}</span>
              <span style={{ fontFamily: F.ui, fontWeight: 800, fontSize: 20, color: done ? C.done : C.todo }}>{done ? "LIVE" : "+ ADD"}</span>
            </div>
          );
        })}
      </Card>
    </>
  );
};

// ================================================================== T5 — test new wardrobe artwork
const T5: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.t5;
  const tConf = at("confirmed,"), tTest = at("test", 0);
  const sweep = ease(t, tTest, tTest + 1.4);
  return (
    <>
      <ItemHeader t={t} a={a} kind="todo" label="To do · 5 / 7" title="Test the new wardrobe artwork" sub="Once the slot system is confirmed." w={1200} y={170} />
      <div style={{ position: "absolute", left: 120, top: 470, display: "flex", alignItems: "center", gap: 16, ...rise(t, tConf - 0.2) }}>
        <Pill color={C.todo} size={24}><Lock size={30} color={C.todo} /> Slot system confirmed</Pill>
        <Arrow size={44} color={C.dim} />
        <Pill color={C.accent} solid size={24}><Flask size={30} color="#0D1224" /> Test artwork</Pill>
      </div>
      {SLOTS.map((s, i) => {
        const x = 120 + i * 340, y = 580, w = 310, h = 250;
        const lit = sweep * 5 > i + 0.5;
        return (
          <Card key={s} glow={lit ? C.accent : undefined} style={{ left: x, top: y, width: w, height: h, ...popIn(t, a + 0.4 + i * 0.1) }}>
            <Img src={staticFile(`img/outfit_${s}.png`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", left: 14, bottom: 14 }}><Pill color={lit ? C.accent : C.dim} solid={lit} size={18}>{s}</Pill></div>
          </Card>
        );
      })}
    </>
  );
};

// ================================================================== T6 — T-shirt upper shadow render order
const T6: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.t6;
  const tShirt = at("shadow"), tWrong = at("issue."), tFix = at("correctly", 0);
  const swap = ease(t, tFix - 0.1, tFix + 0.7);
  const layers: [string, string][] = [["Upper shadow", C.bug], ["T-shirt", C.rive], ["Body", C.dim]];
  // current (wrong) order: shirt on top of shadow? -> show index slots; swap shadow/shirt on "fix"
  const pos = (i: number) => {
    if (i === 0) return interpolate(swap, [0, 1], [1, 0]);
    if (i === 1) return interpolate(swap, [0, 1], [0, 1]);
    return 2;
  };
  return (
    <>
      <ItemHeader t={t} a={a} kind="bug" label="Bug · 6 / 7" title="Upper shadow render order" sub="A minor visual issue: the shadow must render correctly when the T-shirt is worn." w={660} />
      <Card style={{ left: 820, top: 170, width: 420, height: 680, ...popIn(t, Math.min(tShirt - 0.2, a + 0.3)) }}>
        <Img src={staticFile("img/outfit_shirt.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 40%" }} />
        <div style={{ position: "absolute", left: 16, top: 16 }}><Pill color={C.rive} solid size={20}>T-shirt worn</Pill></div>
              </Card>
      <Label size={24} weight={800} color={C.dim} style={{ left: 1320, top: 180, letterSpacing: 2, opacity: ease(t, a + 0.5, a + 0.9) }}>{swap > 0.5 ? "TARGET RENDER ORDER" : "CURRENT RENDER ORDER"}</Label>
      {layers.map(([l, col], i) => {
        const y = 240 + pos(i) * 170;
        const wrong = (i === 0 || i === 1) && t > tWrong - 0.2 && swap < 0.5;
        return (
          <div key={l} style={{ position: "absolute", left: 1320, top: y, width: 480, height: 140, borderRadius: 24, background: `linear-gradient(135deg, ${col}33, ${C.card})`, border: `3px solid ${wrong ? C.bug : swap > 0.95 && i < 2 ? C.done : col}`, display: "flex", alignItems: "center", gap: 22, padding: "0 28px", transform: "skewX(-8deg)", ...rise(t, a + 0.6 + i * 0.15) }}>
            <Layers size={56} color={col} />
            <span style={{ fontFamily: F.ui, fontWeight: 800, fontSize: 36, color: C.text }}>{l}</span>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 1320, top: 760, ...popIn(t, tWrong) }}>
        {swap < 0.5 ? <Pill color={C.bug} solid size={24}><Cross size={26} color="#0D1224" /> Wrong order</Pill> : <Pill color={C.done} solid size={24}><Arrow size={26} color="#0D1224" /> Fix: reorder layers</Pill>}
      </div>
    </>
  );
};

// ================================================================== T7 — rattle-hand animation broken in APK
const T7: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.t7;
  const tR3 = at("rig", 0), tR2 = at("rig", 1), tEd = at("editor,"), tApk = at("apk.", 1);
  return (
    <>
      <ItemHeader t={t} a={a} kind="bug" label="Bug · 7 / 7" title="Rattle-hand animation" w={900} y={160} />
      <div style={{ position: "absolute", left: 1040, top: 175, display: "flex", gap: 18 }}>
        <div style={popIn(t, tR3)}><Pill color={C.bug} solid size={26}><Bug size={28} color="#0D1224" /> Rig 3 · broken</Pill></div>
        <div style={popIn(t, tR2)}><Pill color={C.todo} size={26}><Q size={28} color={C.todo} /> Rig 2 · maybe</Pill></div>
      </div>
      {/* editor works */}
      <Card glow={t > tEd - 0.2 ? C.done : undefined} style={{ left: 120, top: 330, width: 820, height: 500, ...popIn(t, a + 0.3) }}>
        <WindowBar title="Rive editor · mogu_stage3 · rattle state machine" />
        <div style={{ position: "absolute", top: 52, left: 0, right: 0, bottom: 0, overflow: "hidden", background: "#262626" }}>
          <Clip src="clips/rig3_editor.mp4" from={a} trim={0.3} style={{ width: 1920 * 1.25, height: 864 * 1.25, left: -720, top: -150 }} />
        </div>
      </Card>
      <div style={{ position: "absolute", left: 140, top: 850, ...popIn(t, tEd - 0.1) }}><Pill color={C.done} solid size={24}><Check size={26} color="#0D1224" /> Works in the Rive editor</Pill></div>
      {/* APK broken */}
      <Card glow={t > tApk - 0.3 ? C.bug : undefined} style={{ left: 980, top: 330, width: 820, height: 500, ...popIn(t, a + 0.45) }}>
        <WindowBar title="APK · Rig 3" color={C.bug} />
        <div style={{ position: "absolute", top: 52, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
          <Clip src="clips/riveLab.mp4" from={a} trim={4.4} style={{ width: 720, height: 1550, left: 50, top: -330, objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: `rgba(255,93,108,${0.16 * ease(t, tApk - 0.3, tApk + 0.2)})` }} />
        </div>
      </Card>
      <div style={{ position: "absolute", left: 1000, top: 850, ...popIn(t, tApk - 0.2) }}><Pill color={C.bug} solid size={24}><Cross size={26} color="#0D1224" /> Broken in the APK</Pill></div>
    </>
  );
};

// ================================================================== NEXT STEP — two lanes
const Next: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.next;
  const tRes = at("resolve"), tFirst = at("first."), tPar = at("parallel,"), tArt = at("art"), tReady = at("ready"), tPipe = at("pipeline");
  const lane = (y: number, col: string, who: string, t0: number) => (
    <div style={{ position: "absolute", left: 120, top: y, ...rise(t, t0) }}>
      <div style={{ width: 150, fontFamily: F.ui, fontWeight: 800, fontSize: 24, color: col, letterSpacing: 2 }}>{who}</div>
    </div>
  );
  const conv = ease(t, tPipe - 0.4, tPipe + 0.4);
  return (
    <>
      <div style={{ position: "absolute", left: 120, top: 160, ...rise(t, a) }}><Pill color={C.accent} solid><Arrow size={26} color="#0D1224" />Next step</Pill></div>
      <Label size={84} weight={900} style={{ left: 116, top: 230, letterSpacing: -2.5, ...rise(t, a + 0.1, 50) }}>Fix the pipeline, prep the art</Label>
      {lane(470, C.accent, "DEV", tRes - 0.2)}
      {lane(690, C.art, "ART TEAM", tArt - 0.3)}
      {/* dev lane */}
      <Card glow={C.accent} style={{ left: 300, top: 420, width: 760, height: 150, ...popIn(t, tRes - 0.1) }}>
        <div style={{ position: "absolute", left: 30, top: 38 }}><FileRiv size={62} /></div>
        <div style={{ position: "absolute", left: 120, top: 30, fontFamily: F.ui, fontWeight: 800, fontSize: 38, color: C.text }}>Resolve .riv wardrobe loading</div>
        <div style={{ position: "absolute", left: 120, top: 88 }}><Pill color={C.accent} size={18} style={{ opacity: ease(t, tFirst - 0.1, tFirst + 0.3) }}>Priority 1 · first</Pill></div>
      </Card>
      {/* art lane */}
      <Card glow={C.art} style={{ left: 300, top: 640, width: 760, height: 150, ...popIn(t, tArt - 0.1) }}>
        <div style={{ position: "absolute", left: 34, top: 36 }}><Brush size={72} color={C.art} /></div>
        <div style={{ position: "absolute", left: 120, top: 30, fontFamily: F.ui, fontWeight: 800, fontSize: 38, color: C.text }}>Prepare wardrobe assets</div>
        <div style={{ position: "absolute", left: 120, top: 88 }}><Pill color={C.art} size={18} style={{ opacity: ease(t, tPar - 0.1, tPar + 0.3) }}>In parallel</Pill></div>
      </Card>
      {/* converge to testing */}
      <Wire x1={1070} y1={495} x2={1290} y2={605} p={ease(t, tReady - 0.3, tReady + 0.4)} color={C.accent} width={6} />
      <Wire x1={1070} y1={715} x2={1290} y2={625} p={ease(t, tReady - 0.3, tReady + 0.4)} color={C.art} width={6} />
      <Card glow={conv > 0.5 ? C.done : undefined} style={{ left: 1300, top: 520, width: 560, height: 200, ...popIn(t, tReady - 0.1) }}>
        <div style={{ position: "absolute", left: 30, top: 50 }}><Flask size={92} color={conv > 0.5 ? C.done : C.text} /></div>
        <div style={{ position: "absolute", left: 140, top: 46, fontFamily: F.ui, fontWeight: 800, fontSize: 40, color: C.text }}>Ready for testing</div>
        <div style={{ position: "absolute", left: 142, top: 108, fontFamily: F.ui, fontWeight: 600, fontSize: 26, color: C.dim }}>as soon as the pipeline works</div>
      </Card>
    </>
  );
};

// ================================================================== END
const End: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.end;
  const tThanks = a + 0.4;
  return (
    <>
      <Label size={130} weight={900} style={{ left: 0, width: 1920, textAlign: "center", top: 250, letterSpacing: -4, ...rise(t, tThanks - 0.4, 60) }}>Thanks, team!</Label>
      {[["3", "completed", C.done], ["7", "still to do", C.todo], ["→", "resolve .riv loading first", C.accent]].map(([n, l, col], i) => (
        <Card key={l} style={{ left: 300 + i * 450, top: 490, width: 420, height: 200, ...popIn(t, a + 0.1 + i * 0.12) }}>
          <div style={{ position: "absolute", left: 32, top: 28, fontFamily: F.ui, fontWeight: 900, fontSize: 84, color: col }}>{n}</div>
          <div style={{ position: "absolute", left: 36, top: 132, fontFamily: F.ui, fontWeight: 700, fontSize: 28, color: C.text }}>{l}</div>
        </Card>
      ))}
    </>
  );
};

// ================================================================== chrome: top tracker + progress + captions
const SECTIONS: [string, number, number, string][] = [["Completed", S.intro[0], S.todo[0], C.done], ["Still to do", S.todo[0], S.next[0], C.todo], ["Next step", S.next[0], 99, C.accent]];
const TopBar: React.FC<{ t: number }> = ({ t }) => {
  const k = spr(t, 0.05, 20, 160);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 110, display: "flex", alignItems: "center", padding: "0 120px", gap: 18, opacity: k, translate: `0px ${(1 - k) * -30}px` }}>
      <div style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 22, color: C.dim, letterSpacing: 2, flex: 1 }}>DAILY UPDATE · NOV 5, 2026</div>
      {SECTIONS.map(([l, s0, s1, col]) => {
        const on = t >= s0 + (s0 === 0 ? 2.2 : 0) && t < s1;
        return (
          <div key={l} style={{ padding: "10px 22px", borderRadius: 999, fontFamily: F.ui, fontWeight: 800, fontSize: 22, letterSpacing: 1, color: on ? "#0D1224" : C.dim, background: on ? col : "transparent", border: `2px solid ${on ? col : C.line}` }}>{l}</div>
        );
      })}
    </div>
  );
};
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const line = LINES.find((L, i) => {
    const nx = LINES[i + 1];
    const a = L[0].start - 0.1, b = nx ? Math.min(nx[0].start - 0.1, L[L.length - 1].end + 1.0) : L[L.length - 1].end + 1.2;
    return t >= a && t < b;
  });
  if (!line) return null;
  const k = spr(t, line[0].start - 0.1, 22, 220);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 64, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ display: "flex", flexWrap: "nowrap", gap: 14, padding: "16px 32px", borderRadius: 22, background: "rgba(0,0,0,0.88)", opacity: Math.min(1, k * 1.6), translate: `0px ${(1 - k) * 16}px`, boxShadow: "0 10px 30px rgba(0,0,0,.4)" }}>
        {line.map((w, i) => {
          const wk = spr(t, w.start - 0.04, 16, 260);
          if (wk <= 0.001) return null;
          const live = t >= w.start - 0.04 && t < w.end + 0.06;
          return (
            <span key={i} style={{ fontFamily: F.ui, fontWeight: 800, fontSize: 46, color: live ? "#FFB060" : C.accent, opacity: Math.min(1, wk * 2), scale: `${0.85 + 0.15 * Math.min(1, wk) + (live ? 0.04 : 0)}`, display: "inline-block" }}>
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ================================================================== composition
export const Report: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const bgShift = t * 6;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(1200px 700px at 78% 30%, ${C.bg2}, ${C.bg})`, overflow: "hidden" }}>
      {/* subtle drifting grid */}
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`, backgroundSize: "80px 80px", backgroundPosition: `${bgShift}px ${bgShift}px`, opacity: 0.35 }} />
      <TopBar t={t} />
      <Scene t={t} a={S.intro[0]} b={S.intro[1]}><Intro t={t} /></Scene>
      <Scene t={t} a={S.d1[0]} b={S.d1[1]}><Done1 t={t} /></Scene>
      <Scene t={t} a={S.d2[0]} b={S.d2[1]}><Done2 t={t} /></Scene>
      <Scene t={t} a={S.d3[0]} b={S.d3[1]}><Done3 t={t} /></Scene>
      <Scene t={t} a={S.todo[0]} b={S.todo[1]}><TodoOverview t={t} /></Scene>
      <Scene t={t} a={S.t1[0]} b={S.t1[1]}><T1 t={t} /></Scene>
      <Scene t={t} a={S.t2[0]} b={S.t2[1]}><T2 t={t} /></Scene>
      <Scene t={t} a={S.t3[0]} b={S.t3[1]}><T3 t={t} /></Scene>
      <Scene t={t} a={S.t4[0]} b={S.t4[1]}><T4 t={t} /></Scene>
      <Scene t={t} a={S.t5[0]} b={S.t5[1]}><T5 t={t} /></Scene>
      <Scene t={t} a={S.t6[0]} b={S.t6[1]}><T6 t={t} /></Scene>
      <Scene t={t} a={S.t7[0]} b={S.t7[1]}><T7 t={t} /></Scene>
      <Scene t={t} a={S.next[0]} b={S.next[1]}><Next t={t} /></Scene>
      <Scene t={t} a={S.end[0]} b={S.end[1]}><End t={t} /></Scene>
      {/* progress bar */}
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 8, width: `${(t / DURATION_S) * 100}%`, background: C.accent }} />
      <Captions t={t} />
      {/* audio: your narration on top, your track underneath */}
      <Audio src={staticFile("audio/vo.mp3")} />
      <Audio src={staticFile("audio/music.mp3")} volume={(f) => interpolate(f / FPS, [0, 1.0, DURATION_S - 3, DURATION_S], [0, 0.11, 0.11, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    </AbsoluteFill>
  );
};
