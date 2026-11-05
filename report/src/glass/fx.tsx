// Motion-graphics layer for the "Glass Stories" series: embers, molten wipes, chapter cards,
// hook, title sting and outro. Everything is a pure function of time t (seconds).
import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring } from "remotion";
import { P, SERIF } from "./art";

export const FX_FPS = 30;
const spr = (t: number, t0: number, damping = 18, stiffness = 120) =>
  t < t0 ? 0 : spring({ frame: (t - t0) * FX_FPS, fps: FX_FPS, config: { damping, stiffness, mass: 0.8 } });
const ease = (t: number, a: number, b: number, e = Easing.bezier(0.33, 0, 0.2, 1)) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });

export const SERIES = "Glass Stories";
export const EPISODE = 1;
export const EP_TITLE = "The Invention of Glassblowing";

// ------------------------------------------------------------ rising embers (seeded, additive)
export const Embers: React.FC<{ t: number; n?: number; seed?: string; strength?: number }> = ({ t, n = 46, seed = "e", strength = 1 }) => (
  <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
    {Array.from({ length: n }).map((_, i) => {
      const life = 4 + random(`${seed}l${i}`) * 5, ph = random(`${seed}p${i}`) * life;
      const k = ((t + ph) % life) / life;
      const x = random(`${seed}x${i}`) * 1920 + Math.sin((t + i) * (0.6 + random(`${seed}w${i}`))) * 40;
      const y = 1120 - k * (900 + random(`${seed}h${i}`) * 500);
      const r = 1.5 + random(`${seed}r${i}`) * 3.5;
      const a = Math.sin(Math.PI * k) * (0.5 + 0.5 * random(`${seed}a${i}`)) * strength;
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: r * 2, height: r * 2, borderRadius: r, background: "#FFB04A", opacity: a, boxShadow: `0 0 ${r * 5}px ${r * 2}px rgba(255,140,40,.55)` }} />;
    })}
  </AbsoluteFill>
);

// ------------------------------------------------------------ molten-glass wipe (gooey blobs cover, then reveal)
export const MoltenWipe: React.FC<{ t: number; t0: number; dur?: number; ox?: number; oy?: number }> = ({ t, t0, dur = 1.1, ox = 0.5, oy = 0.55 }) => {
  if (t < t0 || t > t0 + dur) return null;
  const p = (t - t0) / dur;
  const grow = ease(p, 0, 0.5, Easing.bezier(0.6, 0, 0.4, 1)), shrink = ease(p, 0.5, 1, Easing.bezier(0.6, 0, 0.4, 1));
  const R = 2300 * grow;
  const cx = 1920 * ox, cy = 1080 * oy;
  const blobs = Array.from({ length: 9 }).map((_, i) => {
    const a = (i / 9) * Math.PI * 2 + p * 2;
    const d = R * 0.35 * (0.6 + 0.4 * Math.sin(i * 1.7 + p * 6));
    return { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, r: R * (0.42 + 0.12 * Math.sin(i + p * 5)) * (1 - shrink) };
  });
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <filter id="goo"><feGaussianBlur in="SourceGraphic" stdDeviation="28" /><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -12" /></filter>
        <radialGradient id="molten" cx="50%" cy="50%" r="60%"><stop offset="0" stopColor="#FFE9A8" /><stop offset=".35" stopColor="#FFB347" /><stop offset=".75" stopColor="#F27A1A" /><stop offset="1" stopColor="#B8410E" /></radialGradient>
      </defs>
      <g filter="url(#goo)">
        <circle cx={cx} cy={cy} r={R * (1 - shrink) * 0.55} fill="url(#molten)" />
        {blobs.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r={Math.max(0, b.r)} fill="url(#molten)" />)}
      </g>
    </svg>
  );
};

// ------------------------------------------------------------ warm light sweep (a lens-flare-like band)
export const LightSweep: React.FC<{ t: number; t0: number; dur?: number }> = ({ t, t0, dur = 1.4 }) => {
  if (t < t0 || t > t0 + dur) return null;
  const p = (t - t0) / dur;
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: -300, left: -800 + p * 3600, width: 520, height: 1700, rotate: "18deg", background: "linear-gradient(90deg, rgba(255,170,80,0), rgba(255,190,110,.42), rgba(255,170,80,0))", filter: "blur(30px)" }} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------ chapter card: big entrance, then docks top-left
export const Chapter: React.FC<{ t: number; t0: number; t1: number; n: number; title: string; dark?: boolean }> = ({ t, t0, t1, n, title, dark }) => {
  if (t < t0 || t > t1 + 0.6) return null;
  const inK = spr(t, t0, 16, 140), dock = ease(t, t0 + 2.2, t0 + 2.9), out = ease(t, t1, t1 + 0.5);
  const col = dark ? "#F3E6CC" : P.ink;
  const big = 1 - dock;
  return (
    <div style={{ position: "absolute", left: interpolate(dock, [0, 1], [140, 60]), top: interpolate(dock, [0, 1], [880, 36]), opacity: Math.min(1, inK * 1.6) * (1 - out), transformOrigin: "left top", scale: `${interpolate(dock, [0, 1], [1, 0.42])}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: P.glow, textTransform: "uppercase" }}>Chapter {n}</div>
        <div style={{ height: 2, width: 140 * inK, background: P.glow }} />
      </div>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 64, color: col, marginTop: 4, letterSpacing: -0.5, clipPath: `inset(0 ${100 - 100 * ease(t, t0 + 0.15, t0 + 0.9)}% 0 0)`, textShadow: dark ? "0 0 24px rgba(0,0,0,.6)" : undefined, opacity: 0.6 + 0.4 * big }}>{title}</div>
    </div>
  );
};

// ------------------------------------------------------------ series bug (top-right), always on after the sting
export const SeriesBug: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  const k = ease(t, t0, t0 + 0.8) * (1 - ease(t, t1, t1 + 0.6));
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", right: 56, top: 40, display: "flex", alignItems: "center", gap: 12, opacity: 0.85 * k, fontFamily: SERIF, fontWeight: 700, fontSize: 24, letterSpacing: 4, textTransform: "uppercase", color: "#F3E6CC", textShadow: "0 1px 8px rgba(0,0,0,.7)" }}>
      <div style={{ width: 12, height: 12, borderRadius: 6, background: P.glow, boxShadow: `0 0 12px ${P.glow}` }} />
      {SERIES} · Ep. {EPISODE}
    </div>
  );
};

// ------------------------------------------------------------ kinetic hook word: slams in with blur, glows
export const Slam: React.FC<{ t: number; t0: number; t1: number; text: string; size?: number; y?: number; color?: string }> = ({ t, t0, t1, text, size = 150, y = 760, color = "#FFF4DC" }) => {
  if (t < t0 - 0.05 || t > t1 + 0.25) return null;
  const k = spr(t, t0, 13, 260), out = ease(t, t1, t1 + 0.22);
  return (
    <div style={{ position: "absolute", left: 0, width: 1920, top: y, textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: size, lineHeight: 1, letterSpacing: -2, color,
      scale: `${interpolate(k, [0, 1], [1.6, 1]) * (1 + 0.04 * (t - t0))}`, opacity: Math.min(1, k * 2) * (1 - out), filter: `blur(${(1 - Math.min(1, k)) * 14 + out * 10}px)`,
      textShadow: `0 4px 18px rgba(0,0,0,.85), 0 0 40px rgba(255,140,40,.55)` }}>
      {text}
    </div>
  );
};

export const fxEase = ease;
export const fxSpr = spr;

// ------------------------------------------------------------ chapter sting: molten glass floods the frame, chapter title, reveal
export const ChapterWipe: React.FC<{ t: number; t0: number; n: number; title: string; dur?: number; ox?: number; oy?: number }> = ({ t, t0, n, title, dur = 1.9, ox = 0.5, oy = 0.5 }) => {
  if (t < t0 || t > t0 + dur) return null;
  const p = (t - t0) / dur;
  const grow = ease(p, 0, 0.32, Easing.bezier(0.6, 0, 0.3, 1)), shrink = ease(p, 0.7, 1, Easing.bezier(0.6, 0, 0.4, 1));
  const R = 2400 * grow * (1 - shrink);
  const cx = 1920 * ox, cy = 1080 * oy;
  const blobs = Array.from({ length: 10 }).map((_, i) => {
    const a = (i / 10) * Math.PI * 2 + p * 2.4;
    const d = R * 0.33 * (0.6 + 0.4 * Math.sin(i * 1.7 + p * 7));
    return { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, r: R * (0.4 + 0.12 * Math.sin(i + p * 6)) };
  });
  const tk = ease(p, 0.26, 0.42) * (1 - ease(p, 0.66, 0.74));
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id={`goo${n}`}><feGaussianBlur in="SourceGraphic" stdDeviation="28" /><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -12" /></filter>
          <radialGradient id={`molten${n}`} cx="50%" cy="50%" r="60%"><stop offset="0" stopColor="#FFE9A8" /><stop offset=".35" stopColor="#FFB347" /><stop offset=".75" stopColor="#F27A1A" /><stop offset="1" stopColor="#B8410E" /></radialGradient>
        </defs>
        <g filter={`url(#goo${n})`}>
          <circle cx={cx} cy={cy} r={R * 0.55} fill={`url(#molten${n})`} />
          {blobs.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r={Math.max(0, b.r)} fill={`url(#molten${n})`} />)}
        </g>
      </svg>
      <div style={{ position: "absolute", left: 0, width: 1920, top: 400, textAlign: "center", opacity: tk, scale: `${0.94 + 0.06 * tk + 0.03 * p}` }}>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 34, letterSpacing: 10, color: "#5A2008", textTransform: "uppercase" }}>Chapter {n}</div>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 120, color: "#3A1404", letterSpacing: -1, marginTop: 6 }}>{title}</div>
      </div>
    </AbsoluteFill>
  );
};
