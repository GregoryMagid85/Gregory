// "The Invention of Glassblowing" — 16:9 history explainer narrated by Olga Rozin.
// Every scene starts on a word of the narration (src/glass/words.ts), so a new take re-syncs
// by regenerating that file (tools/glass_words.py). Studio footage: Olga's own reels.
import React from "react";
import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { WORDS, VO_LABEL } from "./words";
import {
  P, SERIF, HAND, MapBase, xy, CoreVessel, CoreForming, Blowpipe, IconStopwatch, IconFeather, IconVessels, IconFurnace, IconBreath,
  IconGravity, Colosseum, Laurel, InstaGlyph, SpeechIcon,
} from "./art";

export const GFPS = 30;
const LAST = WORDS[WORDS.length - 1].end;
export const GLASS_DURATION = Math.ceil((LAST + 3.2) * 10) / 10;

// ------------------------------------------------------------ narration cues
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9']/g, "");
const at = (w: string, n = 0) => {
  const hits = WORDS.filter((x) => norm(x.text) === norm(w));
  if (!hits[n]) throw new Error(`cue not in narration: ${w}#${n}`);
  return hits[n].start;
};
const endOfSentence = (t0: number) => {
  const w = WORDS.find((x) => x.start >= t0 - 0.01 && /[.!?]$/.test(x.text));
  return w ? w.end : t0 + 2;
};

// ------------------------------------------------------------ motion helpers
const spr = (t: number, t0: number, damping = 20, stiffness = 110) =>
  t < t0 ? 0 : spring({ frame: (t - t0) * GFPS, fps: GFPS, config: { damping, stiffness, mass: 0.9 } });
const ease = (t: number, a: number, b: number) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.33, 0, 0.2, 1) });
const rise = (t: number, t0: number, d = 30): React.CSSProperties => {
  const k = spr(t, t0);
  return { opacity: Math.min(1, k * 1.4), translate: `0px ${(1 - k) * d}px` };
};

// Text that reveals word by word, timed between t0 and the end of the spoken sentence.
const Say: React.FC<{ t: number; t0: number; t1?: number; text: string; style?: React.CSSProperties; em?: string[] }> = ({ t, t0, t1, text, style, em = [] }) => {
  const words = text.split(" ");
  const end = Math.max(t0 + 0.6, (t1 ?? endOfSentence(t0)) - 0.15);
  return (
    <div style={{ fontFamily: SERIF, color: P.ink, lineHeight: 1.08, ...style }}>
      {words.map((w, i) => {
        const wt = t0 + ((end - t0) * i) / words.length;
        const k = spr(t, wt - 0.05, 18, 140);
        return (
          <span key={i} style={{ display: "inline-block", marginRight: "0.24em", opacity: Math.min(1, k * 1.6), translate: `0px ${(1 - k) * 14}px`, color: em.includes(w.replace(/[^\w-]/g, "")) ? P.red : undefined, fontWeight: em.includes(w.replace(/[^\w-]/g, "")) ? 700 : undefined }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------ media
const Clip: React.FC<{ name: string; from: number; trim?: number; rate?: number; style?: React.CSSProperties }> = ({ name, from, trim = 0, rate = 1, style }) => (
  <Sequence from={Math.max(0, Math.round(from * GFPS))} layout="none">
    <OffthreadVideo src={staticFile(`glass/clips/${name}.mp4`)} muted trimBefore={Math.round(trim * GFPS)} playbackRate={rate}
      style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0, ...style }} />
  </Sequence>
);
// a framed print of a vertical clip, like a photo laid on the parchment
const Frame: React.FC<{ x: number; y: number; w: number; h: number; t: number; t0: number; children: React.ReactNode; rot?: number }> = ({ x, y, w, h, t, t0, children, rot = 0 }) => {
  const k = spr(t, t0, 22, 100);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, padding: 12, background: "#FBF6EC", boxShadow: "0 18px 40px rgba(60,40,20,.35), 0 2px 6px rgba(60,40,20,.25)", rotate: `${rot}deg`, opacity: Math.min(1, k * 1.5), translate: `0px ${(1 - k) * 40}px`, scale: `${0.96 + 0.04 * k}` }}>
      <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#000" }}>{children}</div>
    </div>
  );
};
// full-bleed cinematic shot: blurred, darkened copy fills the 16:9 frame behind the sharp vertical clip
const Cinema: React.FC<{ name: string; from: number; trim?: number; rate?: number; side?: "center" | "right" | "left" }> = ({ name, from, trim, rate, side = "center" }) => {
  const cw = 607, left = side === "center" ? (1920 - cw) / 2 : side === "right" ? 1920 - cw - 120 : 120;
  return (
    <>
      <div style={{ position: "absolute", inset: -60, filter: "blur(38px) brightness(.55) saturate(1.2)" }}><Clip name={name} from={from} trim={trim} rate={rate} /></div>
      <div style={{ position: "absolute", left, top: 0, width: cw, height: 1080, boxShadow: "0 0 80px rgba(0,0,0,.6)" }}><Clip name={name} from={from} trim={trim} rate={rate} /></div>
    </>
  );
};

// ------------------------------------------------------------ backgrounds
const Parchment: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(1300px 800px at 50% 45%, ${P.paper}, ${P.paper2})` }}>
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity: 0.5 }}>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="8" /><feColorMatrix values="0 0 0 0 0.4  0 0 0 0 0.3  0 0 0 0 0.15  0 0 0 0.22 0" /></filter>
      <rect width="1920" height="1080" filter="url(#grain)" />
    </svg>
    <AbsoluteFill style={{ boxShadow: "inset 0 0 220px rgba(110,80,40,.35)" }} />
  </AbsoluteFill>
);
const Dark: React.FC = () => <AbsoluteFill style={{ background: "radial-gradient(1200px 800px at 60% 50%, #2A1B10, #0E0805)" }} />;

// ------------------------------------------------------------ scene shell: cross-dissolve with a slow push
const Scene: React.FC<{ t: number; a: number; b: number; children: React.ReactNode; bg?: "paper" | "dark" | "none" }> = ({ t, a, b, children, bg = "paper" }) => {
  const FADE = 0.55;
  if (t < a - FADE || t > b + FADE) return null;
  const o = Math.min(ease(t, a - FADE, a + 0.15), 1 - ease(t, b - 0.1, b + FADE));
  const push = 1 + 0.025 * ease(t, a, b);
  return (
    <AbsoluteFill style={{ opacity: o, scale: `${push}` }}>
      {bg === "paper" ? <Parchment /> : bg === "dark" ? <Dark /> : null}
      {children}
    </AbsoluteFill>
  );
};
const H: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", fontFamily: SERIF, color: P.ink, ...style }}>{children}</div>
);
const Tag: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", fontFamily: SERIF, fontWeight: 600, fontSize: 30, letterSpacing: 3, textTransform: "uppercase", color: P.sepia, ...style }}>{children}</div>
);

// ================================================================== scenes
const C = () => ({
  intro: at("before"), earliest: at("earliest") - 0.55, problem: at("but", 0) - 0.2, making: at("making"), then: at("then", 0) - 0.2,
  invented: at("glassblowing", 0) - 0.15, changed: at("changed") - 0.75, origin: at("technique") - 0.7, core: at("you", 0) - 0.15,
  invention: at("but", 1) - 0.2, blow: at("blow") - 0.5, suddenly: at("suddenly") - 0.4, meant: at("think") - 0.5, romans: at("romans") - 0.3,
  adopted: at("adopted"), fascinating: at("but", 2) - 0.2, more: at("more", 0), heat: at("heat") - 0.3, air: at("introduce") - 0.3,
  control: at("controlling") - 0.9, ingredient: at("course", 1) - 0.6, hands: at("hands") - 0.3, olga: at("olga", 0) - 0.6, connected: at("connected") - 3.0,
  history: at("history") - 1.2, insta: at("follow") - 0.4, comments: at("comments") - 1.0, learn: at("learn"), hear: at("hear") - 0.8,
});

export const Glass: React.FC = () => {
  const t = useCurrentFrame() / GFPS;
  const c = C();
  const sc: [keyof ReturnType<typeof C>, number][] = Object.entries(c) as never;
  const nextAfter = (k: keyof ReturnType<typeof C>) => { const i = sc.findIndex(([n]) => n === k); return i + 1 < sc.length ? sc[i + 1][1] : GLASS_DURATION; };
  void nextAfter;
  const win = (a: number, b: number) => [a, b] as const;
  const S = {
    intro: win(0, c.earliest), map: win(c.earliest, c.problem), problem: win(c.problem, c.then), bce: win(c.then, c.invented),
    invented: win(c.invented, c.changed), changed: win(c.changed, c.origin), origin: win(c.origin, c.core), core: win(c.core, c.invention),
    gather: win(c.invention, c.blow), blow: win(c.blow, c.suddenly), hollow: win(c.suddenly, c.meant), meant: win(c.meant, c.romans),
    romans: win(c.romans, c.fascinating), principles: win(c.fascinating, c.ingredient), hands: win(c.ingredient, c.olga),
    olga: win(c.olga, c.insta), insta: win(c.insta, c.comments), comments: win(c.comments, c.hear), end: win(c.hear, GLASS_DURATION + 1),
  };

  return (
    <AbsoluteFill style={{ background: "#0E0805" }}>
      {/* 1 — intro: finished pieces + title */}
      <Scene t={t} a={S.intro[0]} b={S.intro[1]} bg="dark">
        <div style={{ position: "absolute", left: 120, top: 90, width: 520, height: 900, ...rise(t, 0.05, 20) }}>
          <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: 4, boxShadow: "0 30px 80px rgba(0,0,0,.6)" }}>
            <Clip name="tumbler" from={0} />
            <div style={{ position: "absolute", inset: 0, opacity: ease(t, 3.3, 3.8) }}><Clip name="goblets" from={3.3} /></div>
            <div style={{ position: "absolute", inset: 0, opacity: ease(t, 5.8, 6.3) }}><Clip name="candles" from={5.8} /></div>
          </div>
        </div>
        <H style={{ left: 760, top: 150, fontSize: 112, fontWeight: 700, color: "#F3E6CC", lineHeight: 1.0, ...rise(t, 0.1) }}>The Invention<br />of Glassblowing</H>
        <H style={{ left: 766, top: 400, fontSize: 40, fontStyle: "italic", fontWeight: 500, color: "#D9B98A", ...rise(t, 0.4) }}>A turning point in the history of glass</H>
        <div style={{ position: "absolute", left: 766, top: 480, width: 560, height: 2, background: "#D9B98A", opacity: 0.6, scale: `${ease(t, 0.4, 1.4)} 1`, transformOrigin: "left" }} />
        <Say t={t} t0={at("before")} text="Before glass became art, windows, or everyday objects, it was a rare luxury." em={["luxury"]}
          style={{ position: "absolute", left: 766, top: 560, width: 1000, fontSize: 60, fontWeight: 600, color: "#F3E6CC" }} />
      </Scene>

      {/* 2 — earliest glass: map of Egypt and the Middle East */}
      <Scene t={t} a={S.map[0]} b={S.map[1]} bg="none">
        <MapBase zoom={interpolate(ease(t, S.map[0], S.map[1]), [0, 1], [1.55, 1.75])} cx={xy(36, 30)[0]} cy={xy(36, 30)[1]}>
          {[["Egypt", 31, 27.5, at("egypt.")], ["Middle East", 42.5, 33.5, at("middle")]].map(([l, lon, lat, tt]) => {
            const [x, y] = xy(lon as number, lat as number); const k = spr(t, tt as number);
            return (
              <g key={l as string} opacity={Math.min(1, k * 1.5)}>
                <circle cx={x} cy={y} r={90 * k} fill={P.red} opacity={0.14} />
                <circle cx={x} cy={y} r={7} fill={P.red} />
                <text x={x + 14} y={y - 14} fontFamily={SERIF} fontWeight={700} fontSize={40} fill={P.ink}>{l as string}</text>
              </g>
            );
          })}
        </MapBase>
        <AbsoluteFill style={{ boxShadow: "inset 0 0 220px rgba(110,80,40,.45)" }} />
        <div style={{ position: "absolute", left: 90, top: 70, width: 1000, padding: "26px 40px", background: "rgba(239,228,206,.88)", borderRadius: 6 }}>
          <Say t={t} t0={at("earliest") - 0.3} text="The earliest glass objects appeared thousands of years ago, in the ancient Middle East and Egypt." style={{ fontSize: 50, fontWeight: 600 }} />
        </div>
        <div style={{ position: "absolute", right: 120, bottom: 120, display: "flex", gap: 30, alignItems: "flex-end" }}>
          <div style={rise(t, at("thousands"))}><CoreVessel w={150} /></div>
          <div style={rise(t, at("thousands") + 0.3)}><CoreVessel w={120} body={P.teal} trail="#F4F1E8" trail2="#E8B04B" /></div>
          <div style={rise(t, at("thousands") + 0.6)}><CoreVessel w={135} body="#4B2C5E" trail="#F1C232" trail2="#7FC6C0" /></div>
        </div>
        <Tag style={{ right: 120, bottom: 70, fontSize: 22, ...rise(t, at("thousands") + 0.8) }}>Core-formed vessels · c. 1500 BCE</Tag>
      </Scene>

      {/* 3 — the problem: slow, difficult */}
      <Scene t={t} a={S.problem[0]} b={S.problem[1]}>
        <Say t={t} t0={at("but", 0)} text="But there was a problem." style={{ position: "absolute", left: 140, top: 150, fontSize: 104, fontWeight: 700, fontStyle: "italic" }} />
        <Say t={t} t0={at("making")} text="Making a hollow glass vessel was an incredibly slow and difficult process." em={["slow", "difficult"]}
          style={{ position: "absolute", left: 140, top: 380, width: 880, fontSize: 58, fontWeight: 600 }} />
        <div style={{ position: "absolute", left: 1180, top: 210, ...rise(t, at("making")) }}><CoreVessel w={360} /></div>
        <div style={{ position: "absolute", left: 1560, top: 640, ...rise(t, at("slow")) }}>
          <div style={{ rotate: `${(t - at("slow")) * 40}deg` }}><IconStopwatch s={150} /></div>
        </div>
      </Scene>

      {/* 4 — first century BCE: timeline */}
      <Scene t={t} a={S.bce[0]} b={S.bce[1]}>
        <Say t={t} t0={at("then", 0)} text="Then, around the first century BCE, something remarkable happened." style={{ position: "absolute", left: 140, top: 140, width: 1600, fontSize: 70, fontWeight: 700 }} />
        {(() => {
          const x0 = 180, x1 = 1740, y = 640, p = ease(t, at("then", 0), at("then", 0) + 1.6);
          const ticks: [number, string, string][] = [[0.0, "c. 2500 BCE", "first glass objects"], [0.4, "c. 1500 BCE", "core-formed vessels"], [0.93, "1st century BCE", "glassblowing"]];
          return (
            <>
              <div style={{ position: "absolute", left: x0, top: y, width: (x1 - x0) * p, height: 4, background: P.ink }} />
              {ticks.map(([f, a, b], i) => {
                const hi = i === 2, k = spr(t, at("then", 0) + 0.3 + f * 1.4);
                return (
                  <div key={a} style={{ position: "absolute", left: x0 + (x1 - x0) * f - 110, top: y - (hi ? 30 : 12), width: 220, textAlign: "center", opacity: Math.min(1, k * 1.5) }}>
                    <div style={{ width: hi ? 60 : 28, height: hi ? 60 : 28, borderRadius: 40, margin: "0 auto", background: hi ? P.glow : P.ink, boxShadow: hi ? `0 0 ${40 * spr(t, at("century"))}px ${P.glow}` : undefined, scale: `${0.5 + 0.5 * k}` }} />
                    <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: hi ? 40 : 32, color: hi ? P.red : P.ink, marginTop: 18 }}>{a}</div>
                    <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 30, color: P.inkSoft }}>{b}</div>
                  </div>
                );
              })}
            </>
          );
        })()}
      </Scene>

      {/* 5 — glassblowing was invented */}
      <Scene t={t} a={S.invented[0]} b={S.invented[1]} bg="none">
        <Cinema name="glory_gather" from={S.invented[0] - 0.5} side="right" />
        <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(14,8,5,.85) 0%, rgba(14,8,5,.5) 55%, rgba(14,8,5,0) 75%)" }} />
        <Say t={t} t0={at("glassblowing", 0)} text="Glassblowing was invented." style={{ position: "absolute", left: 140, top: 380, width: 1000, fontSize: 130, fontWeight: 700, color: "#F8E9CF" }} />
      </Scene>

      {/* 6 — and that changed everything */}
      <Scene t={t} a={S.changed[0]} b={S.changed[1]} bg="none">
        <Cinema name="red_bubble" from={S.changed[0] - 0.3} side="left" />
        <AbsoluteFill style={{ background: "linear-gradient(270deg, rgba(14,8,5,.85) 0%, rgba(14,8,5,.45) 55%, rgba(14,8,5,0) 75%)" }} />
        <Say t={t} t0={at("changed") - 0.4} text="And that changed everything." style={{ position: "absolute", left: 900, top: 420, width: 900, fontSize: 110, fontWeight: 700, color: "#F8E9CF" }} />
      </Scene>

      {/* 7 — origin: Syro-Palestinian region */}
      <Scene t={t} a={S.origin[0]} b={S.origin[1]} bg="none">
        {(() => {
          const z = interpolate(ease(t, S.origin[0], S.origin[0] + 2.2), [0, 1], [1.6, 3.4]);
          const [lx, ly] = xy(35.6, 33.0), [jx, jy] = xy(35.23, 31.78);
          const k = spr(t, at("syropalestinian") - 0.3);
          return (
            <MapBase zoom={z} cx={xy(34.5, 32.5)[0]} cy={xy(34.5, 32.5)[1]}>
              <ellipse cx={lx} cy={ly + 10} rx={34 * k} ry={70 * k} fill={P.red} opacity={0.28} transform={`rotate(-12 ${lx} ${ly})`} />
              <text x={lx + 46} y={ly - 10} fontFamily={SERIF} fontWeight={700} fontSize={36 / z * 1.9} fill={P.ink} opacity={k}>Syro-Palestinian</text>
              <text x={lx + 46} y={ly + 50 / z * 1.9 - 10} fontFamily={SERIF} fontWeight={700} fontSize={36 / z * 1.9} fill={P.ink} opacity={k}>region</text>
              <circle cx={jx} cy={jy} r={4.5} fill={P.ink} opacity={spr(t, at("region.") + 0.2)} />
              <g opacity={spr(t, at("region.") + 0.2)}><rect x={jx + 10} y={jy + 4} width={250 / z * 1.9} height={34 / z * 1.9} rx={6} fill={P.paper} opacity={0.92} /><text x={jx + 10 + 10 / z * 1.9} y={jy + 4 + 24 / z * 1.9} fontFamily={SERIF} fontStyle="italic" fontSize={20 / z * 1.9} fill={P.ink}>Jerusalem · earliest evidence, c. 50 BCE</text></g>
            </MapBase>
          );
        })()}
        <AbsoluteFill style={{ boxShadow: "inset 0 0 220px rgba(110,80,40,.45)" }} />
        <div style={{ position: "absolute", left: 90, top: 70, width: 760, padding: "26px 40px", background: "rgba(239,228,206,.9)", borderRadius: 6 }}>
          <Say t={t} t0={at("technique") - 0.5} text="The technique most likely originated in the Syro-Palestinian region." em={["Syro-Palestinian"]} style={{ fontSize: 54, fontWeight: 600 }} />
        </div>
      </Scene>

      {/* 8 — before glassblowing: core forming */}
      <Scene t={t} a={S.core[0]} b={S.core[1]}>
        <Tag style={{ left: 140, top: 110, ...rise(t, S.core[0] + 0.1) }}>Before glassblowing</Tag>
        <Say t={t} t0={at("before", 1)} text="Molten glass was shaped around a clay core." em={["clay", "core."]} style={{ position: "absolute", left: 140, top: 170, width: 1500, fontSize: 70, fontWeight: 700 }} />
        <div style={{ position: "absolute", left: 220, top: 380 }}><CoreForming p={ease(t, at("shape"), at("laborious") + 1.6)} w={1000} /></div>
        {[["1", "A clay core on a metal rod", at("clay")], ["2", "Hot glass trailed around it", at("laborious") - 0.6], ["3", "The core scraped out", at("imagine.") - 0.3]].map(([n, l, tt], i) => (
          <div key={n as string} style={{ position: "absolute", left: 1300, top: 430 + i * 120, display: "flex", gap: 22, alignItems: "center", ...rise(t, tt as number) }}>
            <div style={{ width: 64, height: 64, borderRadius: 40, border: `3px solid ${P.ink}`, display: "grid", placeItems: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 36, color: P.ink }}>{n}</div>
            <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 38, color: P.ink }}>{l}</div>
          </div>
        ))}
        <Say t={t} t0={at("laborious") - 0.3} text="A laborious process." style={{ position: "absolute", left: 140, top: 900, fontSize: 52, fontStyle: "italic", fontWeight: 600, color: P.red }} />
      </Scene>

      {/* 9 — the blowpipe: gather */}
      <Scene t={t} a={S.gather[0]} b={S.gather[1]}>
        <Tag style={{ left: 140, top: 110, ...rise(t, S.gather[0] + 0.1) }}>With the blowpipe</Tag>
        <Say t={t} t0={at("glassmaker", 0) - 0.4} text="A glassmaker could simply gather molten glass onto the end of a pipe…" em={["gather"]} style={{ position: "absolute", left: 140, top: 170, width: 980, fontSize: 64, fontWeight: 700 }} />
        <div style={{ position: "absolute", left: 140, top: 640, ...rise(t, at("blowpipe,", 0)) }}><Blowpipe p={0.15} w={760} /></div>
        <Frame x={1250} y={70} w={520} h={920} t={t} t0={S.gather[0] + 0.2} rot={1.2}><Clip name="gather" from={at("gather") - 0.6} /></Frame>
      </Scene>

      {/* 10 — and blow air into it */}
      <Scene t={t} a={S.blow[0]} b={S.blow[1]} bg="none">
        <Cinema name="olga_blow" from={S.blow[0] - 0.2} trim={0.9} side="right" />
        <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(14,8,5,.85) 0%, rgba(14,8,5,.45) 55%, rgba(14,8,5,0) 75%)" }} />
        <Say t={t} t0={at("blow") - 0.3} text="…and blow air into it." style={{ position: "absolute", left: 140, top: 420, width: 1000, fontSize: 110, fontWeight: 700, fontStyle: "italic", color: "#F8E9CF" }} />
      </Scene>

      {/* 11 — a hollow glass form */}
      <Scene t={t} a={S.hollow[0]} b={S.hollow[1]} bg="none">
        <Cinema name="clear_bubble" from={S.hollow[0] - 0.2} side="left" />
        <AbsoluteFill style={{ background: "linear-gradient(270deg, rgba(14,8,5,.85) 0%, rgba(14,8,5,.45) 55%, rgba(14,8,5,0) 75%)" }} />
        <Say t={t} t0={at("suddenly") - 0.3} text="And suddenly, you have a hollow glass form!" em={["hollow"]} style={{ position: "absolute", left: 900, top: 360, width: 900, fontSize: 96, fontWeight: 700, color: "#F8E9CF" }} />
      </Scene>

      {/* 12 — what it meant: faster, thinner & lighter, variety */}
      <Scene t={t} a={S.meant[0]} b={S.meant[1]}>
        <Say t={t} t0={at("think")} text="Think about what that meant." style={{ position: "absolute", left: 0, width: 1920, textAlign: "center", top: 90, fontSize: 70, fontWeight: 700 }} />
        {[[<IconStopwatch key="s" s={130} />, "Faster", at("faster.")], [<IconFeather key="f" s={130} />, "Thinner & lighter", at("thinner,")], [<IconVessels key="v" s={170} />, "A greater variety of shapes", at("variety")]].map(([ic, l, tt], i) => (
          <div key={l as string} style={{ position: "absolute", left: 210 + i * 520, top: 230, width: 460, textAlign: "center", ...rise(t, (tt as number) - 0.2) }}>
            <div style={{ height: 140, display: "grid", placeItems: "center" }}>{ic as React.ReactNode}</div>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 46, color: P.ink }}>{l as string}</div>
          </div>
        ))}
        {[["tumbler", 0], ["blue_goblet", 0], ["goblets", 0.3], ["blue_vessel", 0], ["candles", 0]].map(([n, tr], i) => (
          <Frame key={n as string} x={160 + i * 330} y={540} w={280} h={440} t={t} t0={at("variety") + 0.15 * i} rot={[-2, 1.5, -1, 2, -1.5][i]}><Clip name={n as string} from={at("variety") - 0.3} trim={tr as number} /></Frame>
        ))}
      </Scene>

      {/* 13 — the Romans spread it */}
      <Scene t={t} a={S.romans[0]} b={S.romans[1]} bg="none">
        {(() => {
          const src = xy(35.4, 33.5);
          const cities: [string, number, number, number][] = [["Sidon", 35.37, 33.56, 0], ["Alexandria", 29.9, 31.2, 0.25], ["Rome", 12.5, 41.9, 0.5], ["Aquileia", 13.37, 45.77, 0.65], ["Cologne", 6.96, 50.94, 0.85]];
          const t0 = at("adopted"), spread = ease(t, at("spread") - 0.2, at("empire.") + 0.3);
          return (
            <MapBase zoom={interpolate(ease(t, S.romans[0], S.romans[1]), [0, 1], [1.0, 1.08])} cx={xy(20, 41)[0]} cy={xy(20, 41)[1]}>
              <circle cx={src[0]} cy={src[1]} r={1500 * spread} fill={P.glow} opacity={0.12 * (1 - spread * 0.4)} />
              {cities.map(([n, lo, la, d]) => {
                const [x, y] = xy(lo, la); const k = spr(t, t0 + 0.6 + d * 4.5);
                const mx = (x + src[0]) / 2, my = Math.min(y, src[1]) - 120;
                return (
                  <g key={n} opacity={Math.min(1, k * 1.5)}>
                    {n !== "Sidon" ? <path d={`M${src[0]} ${src[1]} Q${mx} ${my} ${x} ${y}`} fill="none" stroke={P.red} strokeWidth={3} strokeDasharray="10 10" opacity={0.7} /> : null}
                    <circle cx={x} cy={y} r={9 * (0.5 + 0.5 * k)} fill={P.red} />
                    <text x={x + 14} y={y - 12} fontFamily={SERIF} fontWeight={700} fontSize={34} fill={P.ink}>{n}</text>
                  </g>
                );
              })}
            </MapBase>
          );
        })()}
        <AbsoluteFill style={{ boxShadow: "inset 0 0 220px rgba(110,80,40,.45)" }} />
        <div style={{ position: "absolute", left: 90, bottom: 60, width: 860, padding: "26px 40px", background: "rgba(239,228,206,.92)", borderRadius: 6 }}>
          <Say t={t} t0={at("romans") - 0.2} text="The Romans were quick to recognize how useful this was." style={{ fontSize: 50, fontWeight: 700 }} />
          <Say t={t} t0={at("adopted")} text="They spread glassblowing throughout the Mediterranean and across the Roman Empire." em={["Mediterranean", "Roman", "Empire."]} style={{ fontSize: 38, fontWeight: 600, marginTop: 16 }} />
        </div>
        <div style={{ position: "absolute", right: 90, bottom: 60, display: "flex", alignItems: "flex-end", ...rise(t, at("roman", 0) - 0.4) }}>
          <Laurel s={150} /><Colosseum w={420} p={ease(t, at("roman", 0) - 0.4, at("roman", 0) + 1.6)} /><Laurel s={150} flip />
        </div>
      </Scene>

      {/* 14 — 2,000 years later: same principles */}
      <Scene t={t} a={S.principles[0]} b={S.principles[1]}>
        <Say t={t} t0={at("fascinating", 0) - 1.0} text="Here's something I find fascinating." style={{ position: "absolute", left: 140, top: 90, fontSize: 48, fontStyle: "italic", fontWeight: 600, color: P.inkSoft }} />
        <H style={{ left: 140, top: 160, fontSize: 82, fontWeight: 700, ...rise(t, at("more", 0)) }}>
          {Math.round(interpolate(ease(t, at("more", 0), at("later,") + 0.3), [0, 1], [0, 2000])).toLocaleString("en-US")}+ years later…
        </H>
        <Say t={t} t0={at("glassblowers")} text="we're still using the same principles." em={["same"]} style={{ position: "absolute", left: 140, top: 270, fontSize: 56, fontWeight: 600 }} />
        {[
          ["heat", "Heat the glass", "glory_hole", <IconFurnace key="f" s={90} />],
          ["introduce", "Introduce air", "olga_blow", <IconBreath key="b" s={90} />],
          ["controlling", "Control heat, movement & gravity", "swing", <IconGravity key="g" s={90} rot={Math.sin(t * 3) * 30} />],
        ].map(([cue, l, clip, ic], i) => {
          const t0 = at(cue as string) - 0.3;
          return (
            <React.Fragment key={cue as string}>
              <Frame x={140 + i * 570} y={400} w={500} h={520} t={t} t0={t0} rot={[-1.2, 0.8, -0.6][i]}><Clip name={clip as string} from={t0} trim={clip === "olga_blow" ? 1.2 : 0} style={{ objectPosition: "50% 45%" }} /></Frame>
              <div style={{ position: "absolute", left: 150 + i * 570, top: 945, display: "flex", alignItems: "center", gap: 14, ...rise(t, t0 + 0.2) }}>
                {ic as React.ReactNode}
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: i === 2 ? 34 : 42, color: P.ink, width: 400 }}>{l as string}</div>
              </div>
            </React.Fragment>
          );
        })}
      </Scene>

      {/* 15 — the hands of the glassmaker */}
      <Scene t={t} a={S.hands[0]} b={S.hands[1]} bg="none">
        <Cinema name="bench_hands" from={S.hands[0] - 0.3} side="right" />
        <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(14,8,5,.88) 0%, rgba(14,8,5,.5) 55%, rgba(14,8,5,0) 75%)" }} />
        <Say t={t} t0={at("one", 1) - 0.4} text="And of course, one other very important ingredient…" style={{ position: "absolute", left: 140, top: 260, width: 1000, fontSize: 56, fontWeight: 600, fontStyle: "italic", color: "#E6CFA8" }} />
        <Say t={t} t0={at("hands") - 0.3} text="The hands of the glassmaker!" em={["hands"]} style={{ position: "absolute", left: 140, top: 520, width: 1000, fontSize: 104, fontWeight: 700, color: "#F8E9CF" }} />
      </Scene>

      {/* 16 — I'm Olga Rozin */}
      <Scene t={t} a={S.olga[0]} b={S.olga[1]} bg="dark">
        <div style={{ position: "absolute", left: 1150, top: 0, width: 607, height: 1080 }}>
          <Clip name="olga_blow" from={S.olga[0] - 0.2} trim={1.8} rate={0.9} />
          <div style={{ position: "absolute", inset: 0, opacity: ease(t, c.connected, c.connected + 0.6) }}><Clip name="twist" from={c.connected} /></div>
          <div style={{ position: "absolute", inset: 0, opacity: ease(t, c.history, c.history + 0.6) }}><Clip name="rose_torch" from={c.history} /></div>
          <div style={{ position: "absolute", inset: 0, opacity: ease(t, c.history + 2.8, c.history + 3.4) }}><Clip name="roses" from={c.history + 2.8} /></div>
        </div>
        <AbsoluteFill style={{ background: "linear-gradient(90deg, #120A06 0%, #120A06 52%, rgba(18,10,6,0) 60%)" }} />
        <H style={{ left: 140, top: 230, fontSize: 120, fontWeight: 700, color: "#F8E9CF", ...rise(t, at("olga", 0) - 0.3) }}>Olga Rozin</H>
        <H style={{ left: 146, top: 380, fontSize: 48, fontStyle: "italic", fontWeight: 500, color: "#D9B98A", ...rise(t, at("artist.") - 0.3) }}>Glass artist</H>
        <div style={{ position: "absolute", left: 146, top: 460, width: 420, height: 2, background: "#D9B98A", opacity: 0.6, scale: `${ease(t, at("artist."), at("artist.") + 0.8)} 1`, transformOrigin: "left" }} />
        <Say t={t} t0={c.connected + 0.4} text="Still connected to a craft that goes back thousands of years." em={["thousands"]} style={{ position: "absolute", left: 146, top: 530, width: 900, fontSize: 54, fontWeight: 600, color: "#F3E6CC" }} />
        <Say t={t} t0={at("history") - 0.6} text="So much fascinating history to share with you." style={{ position: "absolute", left: 146, top: 760, width: 900, fontSize: 44, fontStyle: "italic", fontWeight: 500, color: "#D9B98A" }} />
      </Scene>

      {/* 17 — follow me on Instagram */}
      <Scene t={t} a={S.insta[0]} b={S.insta[1]}>
        <div style={{ position: "absolute", left: 160, top: 300, ...rise(t, S.insta[0] + 0.1) }}><InstaGlyph s={190} /></div>
        <H style={{ left: 400, top: 270, fontSize: 56, fontWeight: 600, ...rise(t, at("follow")) }}>Follow me on Instagram</H>
        <H style={{ left: 400, top: 350, fontSize: 112, fontWeight: 700, color: P.red, ...rise(t, at("underscore") - 0.6) }}>@olga_rozin</H>
        <Say t={t} t0={at("stories") - 0.4} text="for more stories about glassmaking." style={{ position: "absolute", left: 404, top: 500, fontSize: 50, fontStyle: "italic", fontWeight: 600, color: P.inkSoft }} />
        <div style={{ position: "absolute", left: 1330, top: 90, width: 430, height: 900, borderRadius: 60, background: "#111", padding: 16, boxShadow: "0 30px 70px rgba(60,40,20,.45)", ...rise(t, S.insta[0] + 0.3, 60) }}>
          <div style={{ width: "100%", height: "100%", borderRadius: 46, overflow: "hidden", background: "#FAF7F2", position: "relative" }}>
            <div style={{ padding: "50px 22px 14px", fontFamily: "Inter", fontWeight: 800, fontSize: 24, color: "#111" }}>olga_rozin</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3, padding: 3 }}>
              {["tumbler", "blue_goblet", "roses", "candles", "goblets", "blue_vessel", "red_bubble", "clear_bubble", "pink_form", "twist", "stems", "rose_torch"].map((n, i) => (
                <div key={n} style={{ position: "relative", aspectRatio: "9 / 16", overflow: "hidden", opacity: Math.min(1, spr(t, S.insta[0] + 0.5 + i * 0.08) * 1.5) }}><Clip name={n} from={S.insta[0]} /></div>
              ))}
            </div>
          </div>
        </div>
      </Scene>

      {/* 18 — comments */}
      <Scene t={t} a={S.comments[0]} b={S.comments[1]}>
        <div style={{ position: "absolute", left: 0, width: 1920, top: 250, display: "flex", justifyContent: "center", alignItems: "center", gap: 24, ...rise(t, S.comments[0] + 0.1) }}>
          <SpeechIcon s={90} /><span style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 60, color: P.ink }}>And do tell me in the comments…</span>
        </div>
        <div style={{ position: "absolute", left: 260, top: 430, width: 1400, height: 300, background: "#D9A75B", opacity: 0.55, borderRadius: "40% 8% 50% 10% / 20% 60% 20% 60%", scale: `${ease(t, at("learn") - 0.8, at("learn") - 0.1)} 1`, transformOrigin: "left", rotate: "-1.5deg" }} />
        <Say t={t} t0={at("would") - 0.2} text="Would you like to learn more about how glass is made?" style={{ position: "absolute", left: 300, top: 470, width: 1320, textAlign: "center", fontSize: 84, fontWeight: 700, fontStyle: "italic" }} />
      </Scene>

      {/* 19 — I'd love to hear what you think */}
      <Scene t={t} a={S.end[0]} b={S.end[1]} bg="dark">
        <div style={{ position: "absolute", left: 1150, top: 0, width: 607, height: 1080 }}><Clip name="tumbler" from={S.end[0] - 0.3} rate={0.8} /></div>
        <AbsoluteFill style={{ background: "linear-gradient(90deg, #0B0705 0%, #0B0705 52%, rgba(11,7,5,0) 60%)" }} />
        <div style={{ position: "absolute", left: 160, top: 360, fontFamily: HAND, fontWeight: 600, fontSize: 130, color: "#F3E6CC", rotate: "-4deg", clipPath: `inset(0 ${100 - 100 * ease(t, at("hear") - 0.6, at("think", 1) + 0.6)}% 0 0)` }}>
          I'd love to hear<br />what you think!
        </div>
        <H style={{ left: 166, top: 760, fontSize: 40, fontStyle: "italic", color: "#D9B98A", ...rise(t, LAST + 0.4) }}>@olga_rozin</H>
      </Scene>

      {/* draft watermark while the scratch voice is in use */}
      {VO_LABEL.startsWith("SCRATCH") ? (
        <div style={{ position: "absolute", right: 24, top: 18, fontFamily: "Inter", fontWeight: 700, fontSize: 20, color: "rgba(255,255,255,.75)", background: "rgba(160,30,30,.75)", padding: "6px 14px", borderRadius: 8 }}>DRAFT · scratch voice, not Olga</div>
      ) : null}
      <Audio src={staticFile("glass/vo.wav")} />
    </AbsoluteFill>
  );
};
