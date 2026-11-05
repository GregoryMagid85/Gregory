// Shared timing + building blocks for the Glass Stories episodes (any aspect ratio).
import React from "react";
import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { WORDS } from "./words";
import { WORDS_RU } from "./words_ru";
import RU_ANCHORS from "./ru_anchors.json";
import { P } from "./art";
import { Embers } from "./fx";

export const GFPS = 30;
export const HOOK = 7.4;   // cold-open hook + title sting before the narration
export const OUTRO = 7.5;
export const W = WORDS.map((w) => ({ ...w, start: w.start + HOOK, end: w.end + HOOK }));
export const LAST = W[W.length - 1].end;
export const DURATION = Math.ceil((LAST + 1.2 + OUTRO) * 10) / 10;

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}']/gu, "");
export const at = (w: string, n = 0) => {
  const hits = W.filter((x) => norm(x.text) === norm(w));
  if (!hits[n]) throw new Error(`cue not in narration: ${w}#${n}`);
  return hits[n].start;
};
// scene starts, all keyed to narration words (mirrored in tools/glass_audio.py)
export const cues = () => ({
  earliest: at("earliest") - 0.55, problem: at("but", 0) - 0.2, then: at("then", 0) - 0.2, invented: at("glassblowing", 0) - 0.15,
  changed: at("changed") - 0.75, origin: at("technique") - 0.7, core: at("you", 0) - 0.15, invention: at("but", 1) - 0.2,
  blow: at("blow") - 0.5, suddenly: at("suddenly") - 0.4, meant: at("think") - 0.5, romans: at("romans") - 0.3,
  fascinating: at("but", 2) - 0.2, ingredient: at("course", 1) - 0.6, olga: at("olga", 0) - 0.6, insta: at("follow") - 0.4,
  comments: at("comments") - 1.0, hear: at("hear") - 0.8, outro: LAST + 1.2,
});

// ------------------------------------------------------------ language versions
// English cue words drive every scene; for another language the English time is mapped onto that take
// with a piecewise-linear warp between anchor words spoken at the same point (ru_anchors.json).
type Wd = { text: string; start: number; end: number };
const buildLines = (WW: Wd[]) => {
  const out: Wd[][] = []; let cur: Wd[] = [];
  WW.forEach((w, i) => {
    cur.push(w);
    const nx = WW[i + 1];
    const chars = cur.reduce((s, x) => s + x.text.length + 1, 0);
    const gap = nx ? nx.start - w.end : 99;
    if (!nx || /[.!?]$/.test(w.text) || (/[,:;–]$/.test(w.text) && cur.length >= 2) || (gap > 0.35 && cur.length >= 2) || chars >= 20) { out.push(cur); cur = []; }
  });
  return out;
};
export type Lang = "en" | "ru";
export const makeTiming = (lang: Lang) => {
  const WL = lang === "ru" ? WORDS_RU.map((w) => ({ ...w, start: w.start + HOOK, end: w.end + HOOK })) : W;
  const lastL = WL[WL.length - 1].end;
  const pick = (WW: Wd[], w: string, n: number) => { const h = WW.filter((x) => norm(x.text) === norm(w)); if (!h[n]) throw new Error(`anchor not found: ${w}#${n}`); return h[n].start; };
  const pairs: [number, number][] = lang === "ru"
    ? [[0, 0], [HOOK, HOOK], ...(RU_ANCHORS as [string, number, string, number][]).map(([a, na, b, nb]) => [pick(W, a, na), pick(WL, b, nb)] as [number, number]), [LAST, lastL]]
    : [[0, 0], [LAST, LAST]];
  const warp = (x: number) => {
    if (x <= pairs[0][0]) return x;
    for (let i = 1; i < pairs.length; i++) if (x <= pairs[i][0]) { const [a0, b0] = pairs[i - 1], [a1, b1] = pairs[i]; return b0 + ((x - a0) * (b1 - b0)) / (a1 - a0); }
    return x - pairs[pairs.length - 1][0] + pairs[pairs.length - 1][1];
  };
  return {
    at: (w: string, n = 0) => warp(at(w, n)), LAST: lastL, DURATION: Math.ceil((lastL + 1.2 + OUTRO) * 10) / 10,
    lines: lang === "en" ? LINES : buildLines(WL), vo: lang === "ru" ? "glass/vo_ru.wav" : "glass/vo.wav",
  };
};

export const spr = (t: number, t0: number, damping = 20, stiffness = 110) =>
  t < t0 ? 0 : spring({ frame: (t - t0) * GFPS, fps: GFPS, config: { damping, stiffness, mass: 0.9 } });
export const ease = (t: number, a: number, b: number) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.33, 0, 0.2, 1) });
export const rise = (t: number, t0: number, d = 30): React.CSSProperties => {
  const k = spr(t, t0);
  return { opacity: Math.min(1, k * 1.4), translate: `0px ${(1 - k) * d}px` };
};
export const pop = (t: number, t0: number): React.CSSProperties => {
  const k = spr(t, t0, 12, 200);
  return { opacity: Math.min(1, k * 2), scale: `${0.6 + 0.4 * k}` };
};

// ------------------------------------------------------------ media
export const Clip: React.FC<{ name: string; from: number; trim?: number; rate?: number; style?: React.CSSProperties }> = ({ name, from, trim = 0, rate = 1, style }) => (
  <Sequence from={Math.max(0, Math.round(from * GFPS))} layout="none">
    <OffthreadVideo src={staticFile(`glass/clips/${name}.mp4`)} muted trimBefore={Math.round(trim * GFPS)} playbackRate={rate}
      style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0, ...style }} />
  </Sequence>
);
// full-frame clip with a slow push-in (Ken Burns)
export const FullClip: React.FC<{ name: string; from: number; trim?: number; rate?: number; dim?: number; focusY?: string }> = ({ name, from, trim, rate, dim = 0, focusY = "50%" }) => {
  const t = useCurrentFrame() / GFPS;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <AbsoluteFill style={{ scale: `${1 + 0.07 * Math.min(1, Math.max(0, (t - from) / 6))}` }}>
        <Clip name={name} from={from} trim={trim} rate={rate} style={{ objectPosition: `50% ${focusY}` }} />
      </AbsoluteFill>
      {dim ? <AbsoluteFill style={{ background: `rgba(10,6,3,${dim})` }} /> : null}
    </AbsoluteFill>
  );
};
export const Frame: React.FC<{ x: number; y: number; w: number; h: number; t: number; t0: number; children: React.ReactNode; rot?: number }> = ({ x, y, w, h, t, t0, children, rot = 0 }) => {
  const k = spr(t, t0, 22, 100);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, padding: 10, background: "#FBF6EC", boxShadow: "0 18px 40px rgba(60,40,20,.35)", rotate: `${rot + Math.sin(t * 0.7 + x) * 0.6}deg`, opacity: Math.min(1, k * 1.5), translate: `0px ${(1 - k) * 40 + Math.sin(t * 0.9 + y) * 4}px`, scale: `${0.96 + 0.04 * k}` }}>
      <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#000" }}>{children}</div>
    </div>
  );
};

// ------------------------------------------------------------ backgrounds + scene shell
export const Parchment: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(${width * 0.9}px ${height * 0.7}px at 50% 42%, ${P.paper}, ${P.paper2})` }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: 0.5 }}>
        <filter id="grainC"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="8" /><feColorMatrix values="0 0 0 0 0.4  0 0 0 0 0.3  0 0 0 0 0.15  0 0 0 0.22 0" /></filter>
        <rect width={width} height={height} filter="url(#grainC)" />
      </svg>
      <AbsoluteFill style={{ boxShadow: "inset 0 0 220px rgba(110,80,40,.35)" }} />
    </AbsoluteFill>
  );
};
export const Dark: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(1200px 1400px at 50% 45%, #2A1B10, #0E0805)" }}>
    <Embers t={useCurrentFrame() / GFPS} n={34} seed="dk" strength={0.7} />
  </AbsoluteFill>
);
export const Scene: React.FC<{ t: number; a: number; b: number; children: React.ReactNode; bg?: "paper" | "dark" | "none" }> = ({ t, a, b, children, bg = "paper" }) => {
  const FADE = 0.5;
  if (t < a - FADE || t > b + FADE) return null;
  const o = Math.min(ease(t, a - FADE, a + 0.15), 1 - ease(t, b - 0.1, b + FADE));
  return (
    <AbsoluteFill style={{ opacity: o, scale: `${1 + 0.025 * ease(t, a, b)}` }}>
      {bg === "paper" ? <Parchment /> : bg === "dark" ? <Dark /> : null}
      {children}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------ captions: every spoken word, orange on a black box
const LINES = (() => {
  const out: (typeof W)[] = []; let cur: typeof W = [];
  W.forEach((w, i) => {
    cur.push(w);
    const nx = W[i + 1];
    const chars = cur.reduce((s, x) => s + x.text.length + 1, 0);
    const gap = nx ? nx.start - w.end : 99;
    if (!nx || /[.!?]$/.test(w.text) || (/[,:;–]$/.test(w.text) && cur.length >= 2) || (gap > 0.35 && cur.length >= 2) || chars >= 20) { out.push(cur); cur = []; }
  });
  return out;
})();
export const Captions: React.FC<{ t: number; lines?: typeof LINES }> = ({ t, lines = LINES }) => {
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  const line = lines.find((L, i) => {
    const nx = lines[i + 1];
    const a = L[0].start - 0.08, b = nx ? Math.min(nx[0].start - 0.08, L[L.length - 1].end + 0.9) : L[L.length - 1].end + 1.0;
    return t >= a && t < b;
  });
  if (!line) return null;
  const k = spr(t, line[0].start - 0.08, 22, 240);
  const size = portrait ? 66 : 52;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: portrait ? 1236 : undefined, bottom: portrait ? undefined : 60, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: portrait ? 900 : 1500, gap: "4px 18px", padding: portrait ? "18px 34px" : "14px 30px", borderRadius: 22, background: "rgba(0,0,0,0.9)", opacity: Math.min(1, k * 1.6), translate: `0px ${(1 - k) * 16}px`, boxShadow: "0 10px 30px rgba(0,0,0,.45)" }}>
        {line.map((w, i) => {
          const wk = spr(t, w.start - 0.04, 16, 280);
          const live = t >= w.start - 0.04 && t < w.end + 0.06;
          if (wk <= 0.01) return null; // only words already spoken: the box grows with the speech
          return (
            <span key={i} style={{ fontFamily: "Inter, 'Inter Cyr'", fontWeight: 800, fontSize: size, lineHeight: 1.15, color: live ? "#FFB060" : "#FF8A1F", opacity: wk > 0.01 ? Math.min(1, wk * 2) : 0.0, scale: `${0.85 + 0.15 * Math.min(1, wk) + (live ? 0.05 : 0)}`, display: "inline-block" }}>
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
