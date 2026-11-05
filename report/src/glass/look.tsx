// The Glass Stories look: one set of overlays used everywhere, styled after the series art
// (parchment cards, red ribbons, cream serif with a furnace glow).
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { SERIF } from "./art";
import { Embers } from "./fx";
import { Clip, GFPS, spr } from "./core";

export const L = {
  ink: "#3B2414", inkSoft: "#6B4A2E", parch: "#EAD6AE", parch2: "#D9BE8C", ribbon: "#8E2B1E", ribbonDark: "#5E1A12",
  cream: "#FFF1D6", gold: "#F2C27B", ember: "#F28A1E",
};
const ez = Easing.bezier(0.45, 0, 0.2, 1);

// ------------------------------------------------------------ red ribbon label (notched ends)
export const Ribbon: React.FC<{ t: number; t0: number; children: React.ReactNode; top?: number; size?: number }> = ({ t, t0, children, top: topIn, size = 40 }) => {
  const { width, height } = useVideoConfig();
  const top = topIn ?? (width > height ? 110 : 250);
  const k = spr(t, t0, 16, 170);
  if (k <= 0.001) return null;
  return (
    <div style={{ position: "absolute", left: 0, width, top, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ position: "relative", clipPath: `inset(0 ${50 - 50 * Math.min(1, k)}% 0 ${50 - 50 * Math.min(1, k)}%)` }}>
        <svg width="100%" height="100%" viewBox="0 0 100 20" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 6px 10px rgba(0,0,0,.45))" }}>
          <path d="M0 0 H100 L96 10 L100 20 H0 L4 10 Z" fill={L.ribbon} />
          <path d="M3 2.2 H97" stroke="#C9614C" strokeWidth=".5" opacity=".6" />
        </svg>
        <div style={{ position: "relative", padding: `${size * 0.32}px ${size * 1.3}px`, fontFamily: SERIF, fontWeight: 700, fontSize: size, letterSpacing: size * 0.12, textTransform: "uppercase", color: L.cream, whiteSpace: "nowrap" }}>{children}</div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------ torn parchment card
const torn = (seed: string, n = 40) => {
  const pts: string[] = [];
  const j = (i: number) => (random(`${seed}${i}`) - 0.5) * 1.6;
  for (let i = 0; i <= n; i++) pts.push(`${(i / n) * 100}% ${1 + j(i)}%`);
  for (let i = 0; i <= n; i++) pts.push(`${99 + j(100 + i) * 0.6}% ${(i / n) * 100}%`);
  for (let i = n; i >= 0; i--) pts.push(`${(i / n) * 100}% ${99 + j(200 + i)}%`);
  for (let i = n; i >= 0; i--) pts.push(`${1 + j(300 + i) * 0.6}% ${(i / n) * 100}%`);
  return `polygon(${pts.join(",")})`;
};
export const ParchCard: React.FC<{ t: number; t0: number; x?: number; y: number; w?: number; h?: number; children: React.ReactNode; seed?: string; rot?: number }> = ({ t, t0, x, y, w = 920, h, children, seed = "pc", rot = -0.6 }) => {
  const { width, height } = useVideoConfig();
  const k = spr(t, t0, 18, 130);
  if (k <= 0.001) return null;
  const sc = width > height ? 0.72 : 1;
  return (
    <div style={{ position: "absolute", left: x ?? (width - w) / 2, top: y, width: w, height: h, opacity: Math.min(1, k * 1.5), translate: `0px ${(1 - k) * 60}px`, rotate: `${rot}deg`, scale: `${sc}`, transformOrigin: "50% 0%", filter: "drop-shadow(0 22px 40px rgba(0,0,0,.55))" }}>
      <div style={{ position: "relative", clipPath: torn(seed), background: `radial-gradient(120% 90% at 40% 35%, ${L.parch}, ${L.parch2})`, padding: "54px 58px", height: h ? "100%" : undefined, boxSizing: "border-box" }}>
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.55, pointerEvents: "none" }}>
          <filter id={`pg${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" seed="4" /><feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0 0.12  0 0 0 0.25 0" /></filter>
          <rect width="100%" height="100%" filter={`url(#pg${seed})`} />
        </svg>
        <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 70px rgba(120,70,20,.45)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>{children}</div>
      </div>
    </div>
  );
};
export const CardTitle: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 76 }) => (
  <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: size, lineHeight: 1.0, color: L.ink, textAlign: "center" }}>{children}</div>
);

// ------------------------------------------------------------ big kinetic words (punch moments only)
export const Kinetic: React.FC<{ t: number; t0: number; children: React.ReactNode; top?: number; size?: number; color?: string; italic?: boolean }> = ({ t, t0, children, top = 330, size = 128, color = L.cream, italic }) => {
  const { width } = useVideoConfig();
  const k = spr(t, t0, 14, 200);
  if (k <= 0.001) return null;
  return (
    <div style={{ position: "absolute", left: 60, width: width - 120, top, textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontStyle: italic ? "italic" : undefined, fontSize: size, lineHeight: 1.0, color,
      opacity: Math.min(1, k * 1.8), scale: `${interpolate(k, [0, 1], [1.3, 1])}`, filter: `blur(${Math.max(0, 1 - k) * 10}px)`, textShadow: "0 4px 22px rgba(0,0,0,.85), 0 0 40px rgba(255,140,40,.4)" }}>
      {children}
    </div>
  );
};

// ------------------------------------------------------------ the series art: pan left -> right and pull back to reveal the text card
// Images are 1672x941: the portrait on the left, the parchment card on the right (x ≈ 1000-1672).
export const ART: Record<string, { face: number; card: number | null }> = {
  mesopotamia: { face: 470, card: 1345 }, egypt: { face: 420, card: 1320 }, levant: { face: 460, card: 1345 },
  rome: { face: 440, card: 1340 }, modern: { face: 470, card: 1345 }, montage: { face: 330, card: null },
};
export const ArtPan: React.FC<{ name: string; t0: number; t1: number; hold?: number; endFocus?: number; endScale?: number }> = ({ name, t0, t1, hold = 0.3, endFocus, endScale }) => {
  const t = useCurrentFrame() / GFPS;
  const { width: VW, height: VH } = useVideoConfig();
  const land = VW > VH;
  const IW = 1672, IH = 941, a = ART[name];
  const p = interpolate(t, [t0, t1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const m = ez(Math.max(0, (p - hold) / (1 - hold)));             // hold on the face, then travel
  // vertical: fill the height on the face, end with the card between y 170-1200 (above the captions)
  // horizontal: start ~1.9x on the face, end on the whole image (it is already 16:9)
  const sA = land ? (VH / IH) * 1.9 : 1920 / IH;
  const sB = land ? (endScale ? (VH / IH) * (endScale / 1.6) : Math.min(VW / IW, VH / IH) * 0.94) : endScale ?? (a.card ? 1030 / IH : 1.55);
  const s = sA * Math.pow(sB / sA, m) * (1 + 0.04 * (1 - m) * p);  // log-space zoom out (+ a slow push during the hold)
  const fx = interpolate(m, [0, 1], [a.face, land && !endFocus ? IW / 2 : endFocus ?? a.card ?? 1250]);
  const sy = land ? interpolate(m, [0, 1], [VH * 0.5, VH * 0.47]) : interpolate(m, [0, 1], [960, a.card ? 685 : 820]);
  const left = VW / 2 - fx * s, top = sy - (IH / 2) * s;
  const src = staticFile(`glass/art/${name}.png`);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#120A05" }}>
      <Img src={src} style={{ position: "absolute", left: -200, top: -200, width: VW + 400, height: VH + 400, objectFit: "cover", filter: "blur(40px) brightness(.45) saturate(1.2)" }} />
      <Img src={src} style={{ position: "absolute", left, top, width: IW * s, height: IH * s, boxShadow: m > 0.4 ? "0 0 60px rgba(0,0,0,.6)" : undefined }} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------ dark studio base for cards (dimmed furnace footage + embers)
export const Studio: React.FC<{ clip?: string; from: number }> = ({ clip = "glory_gather", from }) => {
  const t = useCurrentFrame() / GFPS;
  return (
    <AbsoluteFill style={{ background: "#120A05" }}>
      <AbsoluteFill style={{ filter: "blur(14px) brightness(.38) saturate(1.2)", scale: "1.15" }}><Clip name={clip} from={from} rate={0.6} /></AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(900px 1300px at 50% 40%, rgba(80,40,10,.25), rgba(10,5,2,.7))" }} />
      <Embers t={t} n={36} seed={`st${clip}`} strength={0.8} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------ guided camera over one infographic (1672x941)
// keys: [time, focusX, focusY, zoom]; zoom 1 = the whole image fitted to the frame width.
// Each move eases in during the 0.9 s before its key, then holds (zoom travels in log space).
export const GuidedArt: React.FC<{ name: string; keys: [number, number, number, number][] }> = ({ name, keys }) => {
  const t = useCurrentFrame() / GFPS;
  const { width: VW, height: VH } = useVideoConfig();
  const IW = 1672, IH = 941, fit = VW / IW;
  let k = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const [ti] = keys[i];
    if (t >= ti) { k = keys[i]; continue; }
    const m = ez(Math.min(1, Math.max(0, (t - (ti - 0.9)) / 0.9)));
    const [, x0, y0, z0] = keys[i - 1], [, x1, y1, z1] = keys[i];
    k = [t, x0 + (x1 - x0) * m, y0 + (y1 - y0) * m, z0 * Math.pow(z1 / z0, m)];
    break;
  }
  const [, fx, fy, z] = k;
  const s = fit * z * (1 + 0.012 * Math.sin(t * 0.6));
  const cy = VH > VW ? 760 : VH / 2;
  const src = staticFile(`glass/art/${name}.png`);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#120A05" }}>
      <Img src={src} style={{ position: "absolute", left: -200, top: -200, width: VW + 400, height: VH + 400, objectFit: "cover", filter: "blur(40px) brightness(.45) saturate(1.2)" }} />
      <Img src={src} style={{ position: "absolute", left: VW / 2 - fx * s, top: cy - fy * s, width: IW * s, height: IH * s, boxShadow: "0 0 60px rgba(0,0,0,.6)" }} />
    </AbsoluteFill>
  );
};
