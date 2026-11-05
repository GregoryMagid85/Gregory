// Hand-built illustrations for the glassblowing story (SVG, drawn from scratch).
import React from "react";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import land50 from "world-atlas/land-50m.json";

export const P = {
  paper: "#EFE4CE", paper2: "#E6D6B8", ink: "#3A2A1A", inkSoft: "#6B5238", sepia: "#9C7A4E",
  glow: "#F28A1E", ember: "#FFB347", sea: "#D7DDCF", land: "#DCC79F", landEdge: "#8E6E46",
  blue: "#1F4E8C", teal: "#2F8F8A", red: "#A8402E",
};
export const SERIF = "Cormorant Garamond", HAND = "Caveat";

// ------------------------------------------------------------ map (Natural Earth 1:50m land)
const LAND = feature(land50 as never, (land50 as never as { objects: { land: never } }).objects.land) as never;
export const MAP_W = 1920, MAP_H = 1080;
export const proj = geoMercator().fitExtent([[0, 0], [MAP_W, MAP_H]], {
  type: "MultiPoint",
  coordinates: [[-9, 23], [50, 53]],
} as never);
const LAND_D = geoPath(proj)(LAND) ?? "";
export const xy = (lon: number, lat: number) => proj([lon, lat]) as [number, number];

export const MapBase: React.FC<{ children?: React.ReactNode; zoom?: number; cx?: number; cy?: number }> = ({ children, zoom = 1, cx = MAP_W / 2, cy = MAP_H / 2 }) => (
  <svg width={MAP_W} height={MAP_H} viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" /><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.12  0 0 0 0.18 0" /><feComposite in2="SourceGraphic" operator="in" /></filter>
    </defs>
    <g transform={`translate(${MAP_W / 2} ${MAP_H / 2}) scale(${zoom}) translate(${-cx} ${-cy})`}>
      <rect x={-4000} y={-4000} width={10000} height={10000} fill={P.sea} />
      <path d={LAND_D} fill={P.land} stroke={P.landEdge} strokeWidth={2.2 / zoom} />
      <path d={LAND_D} fill="#000" filter="url(#rough)" />
      {children}
    </g>
  </svg>
);

// ------------------------------------------------------------ core-formed vessel (amphoriskos with feathered trails)
export const CoreVessel: React.FC<{ w?: number; body?: string; trail?: string; trail2?: string; style?: React.CSSProperties }> = ({
  w = 180, body = P.blue, trail = "#F1C232", trail2 = "#F4F1E8", style,
}) => {
  const id = `cv${body.slice(1)}${trail.slice(1)}`;
  return (
    <svg width={w} height={w * 1.6} viewBox="0 0 100 160" style={style}>
      <defs>
        <clipPath id={id}><path d="M42 18 h16 v14 c22 10 28 40 22 70 c-4 22 -16 38 -30 46 c-14 -8 -26 -24 -30 -46 c-6 -30 0 -60 22 -70z" /></clipPath>
        <radialGradient id={`${id}g`} cx="35%" cy="40%" r="70%"><stop offset="0" stopColor="#fff" stopOpacity=".35" /><stop offset=".6" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <path d="M40 10 h20 v8 h-20z" fill={body} />
      <path d="M38 8 h24 v4 h-24z" fill={trail} />
      <path d="M44 30 c-14 2 -18 14 -12 22" fill="none" stroke={body} strokeWidth="4" />
      <path d="M56 30 c14 2 18 14 12 22" fill="none" stroke={body} strokeWidth="4" />
      <g clipPath={`url(#${id})`}>
        <rect x="0" y="0" width="100" height="160" fill={body} />
        {Array.from({ length: 9 }).map((_, i) => (
          <path key={i} d={`M10 ${46 + i * 11} ${Array.from({ length: 8 }).map((__, k) => `L${16 + k * 11} ${46 + i * 11 + (k % 2 ? -7 : 5)}`).join(" ")}`} fill="none" stroke={i % 2 ? trail2 : trail} strokeWidth="2.6" strokeLinejoin="round" />
        ))}
        <rect x="0" y="0" width="100" height="160" fill={`url(#${id}g)`} />
      </g>
      <path d="M42 18 h16 v14 c22 10 28 40 22 70 c-4 22 -16 38 -30 46 c-14 -8 -26 -24 -30 -46 c-6 -30 0 -60 22 -70z" fill="none" stroke={P.ink} strokeOpacity=".35" strokeWidth="1.2" />
    </svg>
  );
};

// ------------------------------------------------------------ core forming, step by step (p: 0..1)
export const CoreForming: React.FC<{ p: number; w?: number }> = ({ p, w = 760 }) => {
  const core = Math.min(1, p / 0.25);
  const wrap = Math.min(1, Math.max(0, (p - 0.25) / 0.45));
  const scrape = Math.min(1, Math.max(0, (p - 0.75) / 0.25));
  const spiral = Array.from({ length: 160 }).map((_, i) => {
    const k = i / 159, y = 52 + k * 116, rx = 46 * Math.sin(Math.PI * (0.12 + 0.82 * k)) + 6;
    return `${i ? "L" : "M"}${200 + rx * Math.sin(k * 44)} ${y}`;
  }).join(" ");
  return (
    <svg width={w} height={w * 0.5} viewBox="0 0 400 200">
      <line x1="10" y1="110" x2="390" y2="110" stroke="#5A5A5A" strokeWidth="5" strokeLinecap="round" />
      <g transform="rotate(-90 200 110)">
        <path d="M184 52 h32 c34 18 44 62 30 96 c-8 16 -26 22 -46 22 c-20 0 -38 -6 -46 -22 c-14 -34 -4 -78 30 -96z"
          fill="#B89B74" opacity={core * (1 - scrape)} transform={`scale(${0.6 + 0.4 * core})`} style={{ transformOrigin: "200px 110px" }} />
        <path d="M184 52 h32 c34 18 44 62 30 96 c-8 16 -26 22 -46 22 c-20 0 -38 -6 -46 -22 c-14 -34 -4 -78 30 -96z" fill={P.blue} opacity={wrap * 0.85} />
        <path d={spiral} fill="none" stroke="#F1C232" strokeWidth="3" strokeDasharray="2400" strokeDashoffset={2400 * (1 - wrap)} opacity={0.9} />
        <path d="M184 52 h32 c34 18 44 62 30 96 c-8 16 -26 22 -46 22 c-20 0 -38 -6 -46 -22 c-14 -34 -4 -78 30 -96z" fill="none" stroke={P.ink} strokeOpacity=".4" strokeWidth="1.4" />
      </g>
    </svg>
  );
};

// ------------------------------------------------------------ blowpipe with a growing bubble (p 0..1)
export const Blowpipe: React.FC<{ p: number; w?: number }> = ({ p, w = 620 }) => {
  const r = 14 + 46 * p;
  return (
    <svg width={w} height={w * 0.36} viewBox="0 0 400 145">
      <defs>
        <radialGradient id="hot" cx="40%" cy="40%" r="65%"><stop offset="0" stopColor="#FFE7A3" /><stop offset=".45" stopColor={P.ember} /><stop offset="1" stopColor={P.glow} /></radialGradient>
      </defs>
      <line x1="0" y1="72" x2={300 - r} y2="72" stroke="#4A4A4A" strokeWidth="7" strokeLinecap="round" />
      <ellipse cx={300} cy={72} rx={r * 1.25} ry={r} fill="url(#hot)" />
      <ellipse cx={300 - r * 0.35} cy={72 - r * 0.35} rx={r * 0.35} ry={r * 0.22} fill="#fff" opacity={0.35} />
    </svg>
  );
};

// ------------------------------------------------------------ small line icons (sepia)
const st = { fill: "none", stroke: P.ink, strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
export const IconStopwatch: React.FC<{ s?: number }> = ({ s = 110 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64"><circle cx="32" cy="36" r="20" {...st} /><path d="M32 36 L32 24 M28 10 h8 M32 10 v6 M47 20 l4 -4" {...st} /></svg>
);
export const IconFeather: React.FC<{ s?: number }> = ({ s = 110 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64"><path d="M14 52 C22 30 34 16 54 10 C52 30 40 44 18 48 M14 52 L36 30 M26 44 l-4 -8 M34 38 l-3 -9 M42 30 l-2 -9" {...st} /></svg>
);
export const IconVessels: React.FC<{ s?: number }> = ({ s = 150 }) => (
  <svg width={s} height={s * 0.7} viewBox="0 0 96 64">
    <path d="M10 58 c-6 -12 -4 -26 6 -32 v-12 h6 v12 c10 6 12 20 6 32z" {...st} />
    <path d="M40 58 c-10 -8 -10 -24 0 -32 c-2 -4 -2 -10 2 -14 h8 c4 4 4 10 2 14 c10 8 10 24 0 32z" {...st} />
    <path d="M72 58 c-6 -2 -10 -10 -8 -22 l4 -24 h8 l4 24 c2 12 -2 20 -8 22z" {...st} />
  </svg>
);
export const IconFurnace: React.FC<{ s?: number; glow?: number }> = ({ s = 130, glow = 1 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64">
    <path d="M8 58 V30 a24 24 0 0 1 48 0 V58 Z" {...st} />
    <path d="M20 58 V36 a12 12 0 0 1 24 0 V58 Z" fill={P.glow} opacity={0.4 + 0.6 * glow} />
    <path d="M26 58 c0 -8 6 -10 6 -18 c4 6 8 10 6 18" fill={P.ember} opacity={glow} />
  </svg>
);
export const IconBreath: React.FC<{ s?: number; p?: number }> = ({ s = 130, p = 1 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64">
    <path d="M4 34 H40" {...st} strokeWidth={4} />
    <path d="M10 26 q6 -6 12 0 M10 42 q6 6 12 0" {...st} strokeWidth={2} opacity={p} />
    <circle cx={48} cy={34} r={6 + 8 * p} fill={P.ember} stroke={P.glow} strokeWidth="2" />
  </svg>
);
export const IconGravity: React.FC<{ s?: number; rot?: number }> = ({ s = 130, rot = 0 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64">
    <g style={{ transformOrigin: "32px 26px", rotate: `${rot}deg` }}><path d="M14 26 a18 18 0 0 1 36 0" {...st} /><path d="M46 18 l4 8 l-8 0" {...st} /></g>
    <ellipse cx="32" cy="32" rx="9" ry="12" fill={P.ember} stroke={P.glow} strokeWidth="2" />
    <path d="M32 48 V60 M27 55 l5 5 l5 -5" {...st} />
  </svg>
);
export const Colosseum: React.FC<{ w?: number; p?: number }> = ({ w = 520, p = 1 }) => (
  <svg width={w} height={w * 0.55} viewBox="0 0 260 143">
    <path d="M10 140 V40 Q130 0 250 40 V140" fill="none" stroke={P.ink} strokeWidth="2.5" strokeDasharray="700" strokeDashoffset={700 * (1 - p)} />
    {[0, 1, 2].map((row) =>
      Array.from({ length: 9 }).map((_, i) => {
        const x = 22 + i * 26, y = 58 + row * 28;
        return <path key={`${row}-${i}`} d={`M${x} ${y + 24} v-14 a8 8 0 0 1 16 0 v14`} fill="none" stroke={P.ink} strokeWidth="1.8" opacity={Math.max(0, Math.min(1, p * 3 - row * 0.6 - i * 0.05))} />;
      }),
    )}
    <path d="M10 140 H250" stroke={P.ink} strokeWidth="2.5" />
  </svg>
);
export const Laurel: React.FC<{ s?: number; flip?: boolean }> = ({ s = 220, flip }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" style={{ scale: flip ? "-1 1" : undefined }}>
    <path d="M70 92 C40 80 26 54 34 12" fill="none" stroke="#B08A3E" strokeWidth="2.5" />
    {Array.from({ length: 8 }).map((_, i) => {
      const k = i / 7, x = 70 - 40 * Math.sin(k * 1.4) + 4, y = 90 - k * 76;
      return <ellipse key={i} cx={x} cy={y} rx="9" ry="4" fill="#C9A24D" transform={`rotate(${-50 + k * 30} ${x} ${y})`} />;
    })}
  </svg>
);
export const InstaGlyph: React.FC<{ s?: number }> = ({ s = 160 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64">
    <defs><linearGradient id="ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#F9C147" /><stop offset=".45" stopColor="#E1306C" /><stop offset="1" stopColor="#7B3FE4" /></linearGradient></defs>
    <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#ig)" />
    <rect x="15" y="15" width="34" height="34" rx="10" fill="none" stroke="#fff" strokeWidth="4" />
    <circle cx="32" cy="32" r="8" fill="none" stroke="#fff" strokeWidth="4" /><circle cx="43" cy="21" r="2.6" fill="#fff" />
  </svg>
);
export const SpeechIcon: React.FC<{ s?: number }> = ({ s = 90 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64"><path d="M8 12 h48 v30 h-30 l-10 10 v-10 h-8z" {...st} /></svg>
);
