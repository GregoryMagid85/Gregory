import React from "react";
import { Easing, interpolate, spring } from "remotion";

export const FPS = 30;
export const C = {
  bg: "#0D1224",
  bg2: "#131A33",
  card: "#18213F",
  cardHi: "#1F2A50",
  line: "rgba(255,255,255,0.09)",
  text: "#F4F6FB",
  dim: "#9AA4C4",
  accent: "#FF8A1F", // brand accent + captions
  done: "#38D996",
  todo: "#FFC145",
  bug: "#FF5D6C",
  rive: "#4FC3F7",
  art: "#B58CFF",
};
export const F = { ui: "Inter", mono: "JetBrains Mono" };

// ---------- time helpers (absolute seconds, so every cue sits on the narration)
export const spr = (t: number, t0: number, damping = 16, stiffness = 140) =>
  t < t0 ? 0 : spring({ frame: (t - t0) * FPS, fps: FPS, config: { damping, stiffness, mass: 0.7 } });
export const ease = (t: number, a: number, b: number) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
export const easeIn = (t: number, a: number, b: number) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.7, 0, 0.84, 0) });

// rises in with a spring: opacity + y
export const rise = (t: number, t0: number, dist = 36): React.CSSProperties => {
  const k = spr(t, t0, 18, 160);
  return { opacity: Math.min(1, k * 1.6), translate: `0px ${(1 - k) * dist}px` };
};
export const popIn = (t: number, t0: number): React.CSSProperties => {
  const k = spr(t, t0, 11, 180);
  return { opacity: Math.min(1, k * 2), scale: `${0.6 + 0.4 * k}` };
};

// ---------- scene shell: enter (slide+fade) at a, exit at b
export const Scene: React.FC<{ t: number; a: number; b: number; children: React.ReactNode }> = ({ t, a, b, children }) => {
  if (t < a - 0.02 || t > b + 0.45) return null;
  const k = spr(t, a, 20, 170);
  const x = easeIn(t, b, b + 0.4);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: Math.min(1, k * 1.5) * (1 - x), translate: `${(1 - k) * 90 - x * 120}px 0px` }}>
      {children}
    </div>
  );
};

// ---------- building blocks
export const Card: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode; glow?: string }> = ({ style, children, glow }) => (
  <div
    style={{
      background: `linear-gradient(180deg, ${C.cardHi}, ${C.card})`,
      border: `2px solid ${glow ?? C.line}`,
      borderRadius: 28,
      boxShadow: glow ? `0 0 0 6px ${glow}22, 0 24px 60px rgba(0,0,0,.45)` : "0 24px 60px rgba(0,0,0,.4)",
      position: "absolute",
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Pill: React.FC<{ color: string; children: React.ReactNode; solid?: boolean; style?: React.CSSProperties; size?: number }> = ({
  color, children, solid, style, size = 26,
}) => (
  <div
    style={{
      display: "inline-flex", alignItems: "center", gap: 12, padding: `${size * 0.35}px ${size * 0.8}px`, borderRadius: 999,
      background: solid ? color : `${color}1F`, color: solid ? "#0D1224" : color, border: `2px solid ${color}66`,
      fontFamily: F.ui, fontWeight: 800, fontSize: size, letterSpacing: 1.5, textTransform: "uppercase", whiteSpace: "nowrap", ...style,
    }}
  >
    {children}
  </div>
);

// status badge + title block used on every item scene (left column)
export const ItemHeader: React.FC<{
  t: number; a: number; kind: "done" | "todo" | "bug" | "next"; label: string; title: string; sub?: string; x?: number; y?: number; w?: number;
}> = ({ t, a, kind, label, title, sub, x = 120, y = 190, w = 680 }) => {
  const col = { done: C.done, todo: C.todo, bug: C.bug, next: C.accent }[kind];
  const icon = { done: <Check size={26} color="#0D1224" />, todo: <Dot color="#0D1224" />, bug: <Bug size={26} color="#0D1224" />, next: <Arrow size={26} color="#0D1224" /> }[kind];
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w }}>
      <div style={rise(t, a + 0.05)}>
        <Pill color={col} solid>{icon}{label}</Pill>
      </div>
      <div style={{ ...rise(t, a + 0.15, 50), fontFamily: F.ui, fontWeight: 800, fontSize: 68, lineHeight: 1.07, color: C.text, marginTop: 28, letterSpacing: -1.5 }}>
        {title}
      </div>
      {sub ? (
        <div style={{ ...rise(t, a + 0.3), fontFamily: F.ui, fontWeight: 500, fontSize: 32, lineHeight: 1.35, color: C.dim, marginTop: 22 }}>{sub}</div>
      ) : null}
    </div>
  );
};

// checklist row that ticks on a cue
export const Tick: React.FC<{ t: number; t0: number; label: string; color?: string; icon?: "check" | "q" | "x" }> = ({ t, t0, label, color = C.done, icon = "check" }) => {
  const k = spr(t, t0, 12, 200);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 22, ...rise(t, t0 - 0.15) }}>
      <div style={{ width: 52, height: 52, borderRadius: 16, background: k > 0.05 ? color : "transparent", border: `3px solid ${color}`, display: "grid", placeItems: "center", scale: `${0.8 + 0.2 * k}` }}>
        {k > 0.05 ? (icon === "check" ? <Check size={30} color="#0D1224" /> : icon === "x" ? <Cross size={28} color="#0D1224" /> : <Q size={30} color="#0D1224" />) : null}
      </div>
      <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 36, color: C.text }}>{label}</div>
    </div>
  );
};

// ---------- icons (drawn from scratch, SVG)
type IP = { size?: number; color?: string };
export const Check: React.FC<IP> = ({ size = 32, color = C.text }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d="M4.5 12.5l5 5L19.5 7" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const Cross: React.FC<IP> = ({ size = 32, color = C.text }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" /></svg>
);
export const Q: React.FC<IP> = ({ size = 32, color = C.text }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d="M8.5 9a3.5 3.5 0 1 1 5 3.2c-1 .5-1.5 1.2-1.5 2.3" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" /><circle cx="12" cy="19" r="1.7" fill={color} /></svg>
);
export const Dot: React.FC<IP> = ({ color = C.text }) => (
  <svg width={22} height={22} viewBox="0 0 24 24"><circle cx="12" cy="12" r="7" fill="none" stroke={color} strokeWidth={3.5} /></svg>
);
export const Arrow: React.FC<IP & { rot?: number }> = ({ size = 32, color = C.text, rot = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ rotate: `${rot}deg` }}><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const Bug: React.FC<IP> = ({ size = 32, color = C.text }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round">
    <rect x="7" y="8" width="10" height="12" rx="5" /><path d="M9 8a3 3 0 0 1 6 0M12 12v8M3 13h4M17 13h4M4 7l3 2M20 7l-3 2M4 19l3-2M20 19l-3-2" />
  </svg>
);
export const FileRiv: React.FC<IP & { label?: string }> = ({ size = 90, color = C.rive, label = ".riv" }) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 60 72">
    <path d="M6 4h32l16 16v44a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4z" fill={`${color}22`} stroke={color} strokeWidth={3} />
    <path d="M38 4v16h16" fill="none" stroke={color} strokeWidth={3} />
    <text x="28" y="52" textAnchor="middle" fontFamily={F.mono} fontWeight={600} fontSize={14} fill={color}>{label}</text>
  </svg>
);
export const Artboard: React.FC<IP> = ({ size = 90, color = C.text }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none" stroke={color} strokeWidth={3}>
    <path d="M14 4v52M46 4v52M4 14h52M4 46h52" strokeOpacity={0.45} /><rect x="14" y="14" width="32" height="32" rx="3" fill={`${color}14`} />
  </svg>
);
export const Gear: React.FC<IP> = ({ size = 80, color = C.text }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" strokeLinecap="round" />
    <circle cx="12" cy="12" r="6.6" />
  </svg>
);
export const Link: React.FC<IP> = ({ size = 80, color = C.text }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2" />
  </svg>
);
export const Eye: React.FC<IP> = ({ size = 80, color = C.text }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
export const Lens: React.FC<IP> = ({ size = 80, color = C.text }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L21 21" /></svg>
);
export const Lock: React.FC<IP & { open?: number }> = ({ size = 80, color = C.text, open = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round">
    <rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5" fill={`${color}22`} />
    <path d={`M8 10.5V7.5a4 4 0 0 1 8 0${open > 0.5 ? "" : "v3"}`} style={{ translate: `0px ${-open * 2}px` }} />
  </svg>
);
export const Flask: React.FC<IP> = ({ size = 80, color = C.text }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round">
    <path d="M9 3h6M10 3v6l-5.5 9.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.5L14 9V3" /><path d="M7.5 15h9" />
  </svg>
);
export const Brush: React.FC<IP> = ({ size = 80, color = C.text }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 4l6 6-8.5 8.5-6-6z" /><path d="M5.5 12.5L3 21l8.5-2.5" />
  </svg>
);
export const Layers: React.FC<IP> = ({ size = 80, color = C.text }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round">
    <path d="M12 3l9 5-9 5-9-5z" /><path d="M3 13l9 5 9-5" />
  </svg>
);
export const Phone: React.FC<{ w: number; h: number; style?: React.CSSProperties; children?: React.ReactNode; glow?: string }> = ({ w, h, style, children, glow }) => (
  <div style={{ position: "absolute", width: w, height: h, borderRadius: w * 0.12, background: "#05070F", padding: w * 0.035, boxShadow: `0 0 0 3px ${glow ?? "#2B3560"}, 0 30px 70px rgba(0,0,0,.55)`, ...style }}>
    <div style={{ width: "100%", height: "100%", borderRadius: w * 0.09, overflow: "hidden", position: "relative", background: "#000" }}>{children}</div>
  </div>
);
// slot glyphs (hat / glasses / scarf / pants / shirt), simple flat shapes
export const Slot: React.FC<{ kind: string; size?: number; color?: string }> = ({ kind, size = 56, color = C.text }) => {
  const p: Record<string, React.ReactNode> = {
    hat: <><ellipse cx="12" cy="17" rx="10" ry="2.6" fill={color} /><path d="M5 17c0-8 14-8 14 0" fill={color} /></>,
    glasses: <><circle cx="7" cy="13" r="4" fill="none" stroke={color} strokeWidth="2.2" /><circle cx="17" cy="13" r="4" fill="none" stroke={color} strokeWidth="2.2" /><path d="M11 13h2" stroke={color} strokeWidth="2.2" /></>,
    scarf: <><rect x="3" y="7" width="18" height="5" rx="2.5" fill={color} /><rect x="13" y="10" width="4" height="10" rx="1.5" fill={color} /></>,
    pants: <path d="M6 4h12l1 16h-5l-2-9-2 9H5z" fill={color} />,
    shirt: <path d="M9 3l-6 3 2 5 2-1v11h10V10l2 1 2-5-6-3c-.5 1.6-1.6 2.5-3 2.5S9.5 4.6 9 3z" fill={color} />,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24">{p[kind]}</svg>;
};
export const SLOTS = ["hat", "glasses", "scarf", "pants", "shirt"];

// a straight connector that draws from 0..1 (absolute positioned svg line)
export const Wire: React.FC<{ x1: number; y1: number; x2: number; y2: number; p: number; color: string; dash?: boolean; width?: number }> = ({ x1, y1, x2, y2, p, color, dash, width = 5 }) => (
  <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }} width={1} height={1}>
    <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * p} y2={y1 + (y2 - y1) * p} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dash ? "2 14" : undefined} />
  </svg>
);
