// Glass Stories · Ep.1 — vertical 1080x1920 (TikTok, Instagram Reels, YouTube Shorts).
// Safe area: key content between y≈230 and y≈1180, captions at y≈1236, nothing important below
// y≈1500 or in the right-hand 140 px (platform buttons), except during the hook and outro.
import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { VO_LABEL } from "./words";
import { P, SERIF, HAND, MapBase, xy, CoreVessel, CoreForming, Blowpipe, IconStopwatch, IconFeather, IconVessels, IconFurnace, IconBreath, IconGravity, Colosseum, Laurel, InstaGlyph, SpeechIcon } from "./art";
import { Embers, ChapterWipe, LightSweep, Slam, SERIES, EPISODE, EP_TITLE } from "./fx";
import { GFPS, HOOK, DURATION, at, cues, spr, ease, rise, pop, Clip, FullClip, Frame, Scene, Captions } from "./core";

export const GLASS_V_DURATION = DURATION;
const VW = 1080;
const CREAM = "#FFF1D6";
const shade = "linear-gradient(180deg, rgba(10,6,3,.78) 0%, rgba(10,6,3,.15) 32%, rgba(10,6,3,.15) 55%, rgba(10,6,3,.82) 100%)";

const Big: React.FC<{ t: number; t0: number; children: React.ReactNode; top?: number; size?: number; color?: string; italic?: boolean; style?: React.CSSProperties }> = ({ t, t0, children, top = 300, size = 120, color = CREAM, italic, style }) => {
  const k = spr(t, t0, 14, 200);
  return (
    <div style={{ position: "absolute", left: 60, width: VW - 120, top, textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontStyle: italic ? "italic" : undefined, fontSize: size, lineHeight: 1.0, color,
      opacity: Math.min(1, k * 1.8), scale: `${interpolate(k, [0, 1], [1.3, 1])}`, filter: `blur(${Math.max(0, 1 - k) * 10}px)`, textShadow: "0 4px 22px rgba(0,0,0,.8), 0 0 40px rgba(255,140,40,.35)", ...style }}>
      {children}
    </div>
  );
};
const Tag: React.FC<{ t: number; t0: number; children: React.ReactNode; top?: number; dark?: boolean }> = ({ t, t0, children, top = 250, dark }) => (
  <div style={{ position: "absolute", left: 0, width: VW, top, textAlign: "center", ...rise(t, t0) }}>
    <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 34, letterSpacing: 8, textTransform: "uppercase", color: dark ? "#1A0F08" : P.glow, background: dark ? P.glow : "rgba(20,12,6,.55)", padding: "8px 24px", borderRadius: 40 }}>{children}</span>
  </div>
);
const Head: React.FC<{ t: number; t0: number; children: React.ReactNode; top?: number; size?: number; color?: string }> = ({ t, t0, children, top = 320, size = 84, color = P.ink }) => (
  <div style={{ position: "absolute", left: 70, width: VW - 140, top, textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: size, lineHeight: 1.04, color, ...rise(t, t0) }}>{children}</div>
);

export const GlassV: React.FC = () => {
  const t = useCurrentFrame() / GFPS;
  const c = cues();
  const S = {
    intro: [HOOK - 0.5, c.earliest], map: [c.earliest, c.problem], problem: [c.problem, c.then], bce: [c.then, c.invented],
    invented: [c.invented, c.changed], changed: [c.changed, c.origin], origin: [c.origin, c.core], core: [c.core, c.invention],
    gather: [c.invention, c.blow], blow: [c.blow, c.suddenly], hollow: [c.suddenly, c.meant], meant: [c.meant, c.romans],
    romans: [c.romans, c.fascinating], principles: [c.fascinating, c.ingredient], hands: [c.ingredient, c.olga],
    olga: [c.olga, c.insta], insta: [c.insta, c.comments], comments: [c.comments, c.hear], end: [c.hear, c.outro], outro: [c.outro, DURATION + 1],
  } as const;

  return (
    <AbsoluteFill style={{ background: "#0E0805" }}>
      {/* HOOK — fast cuts, kinetic words */}
      {t < HOOK - 2.6 ? (() => {
        const cuts: [string, number, number][] = [["glory_hole", 0, 0.4], ["red_bubble", 0.8, 0.2], ["torch", 1.6, 0.9], ["clear_bubble", 2.45, 0.4], ["rose_torch", 3.3, 0.9], ["twist", 4.1, 0.2]];
        const i = cuts.reduce((acc, cc, k) => (t >= cc[1] ? k : acc), 0);
        const [name, start, trim] = cuts[i];
        return (
          <AbsoluteFill>
            <AbsoluteFill style={{ scale: `${1.16 - 0.16 * spr(t, start, 14, 220)}` }}><FullClip name={name} from={start} trim={trim} rate={1.25} /></AbsoluteFill>
            <AbsoluteFill style={{ background: "radial-gradient(900px 1300px at 50% 45%, rgba(0,0,0,0) 35%, rgba(0,0,0,.65))" }} />
            <LightSweep t={t} t0={0.75} dur={0.6} /><LightSweep t={t} t0={2.4} dur={0.6} />
            <Slam t={t} t0={0.15} t1={1.45} text="One breath." size={150} y={820} />
            <Slam t={t} t0={1.6} t1={2.85} text="One idea." size={150} y={820} />
            <Slam t={t} t0={3.0} t1={4.5} text="2,000 years of glass." size={128} y={760} />
          </AbsoluteFill>
        );
      })() : null}

      {/* TITLE STING */}
      <Scene t={t} a={HOOK - 2.9} b={HOOK - 0.35} bg="dark">
        <Embers t={t} n={80} seed="st" strength={1.2} />
        <div style={{ position: "absolute", left: 0, width: VW, top: 560, textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 36, letterSpacing: interpolate(ease(t, HOOK - 2.6, HOOK - 1.2), [0, 1], [26, 12]), textTransform: "uppercase", color: P.glow, opacity: ease(t, HOOK - 2.6, HOOK - 2.1) }}>{SERIES}</div>
        <div style={{ position: "absolute", left: 60, width: VW - 120, top: 640, textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 124, lineHeight: 1.0, color: CREAM, textShadow: "0 0 50px rgba(255,140,40,.55)",
          clipPath: `inset(${50 - 50 * ease(t, HOOK - 2.3, HOOK - 1.3)}% 0 ${50 - 50 * ease(t, HOOK - 2.3, HOOK - 1.3)}% 0)` }}>{EP_TITLE}</div>
        <div style={{ position: "absolute", left: 190, top: 925, width: 700, height: 3, background: `linear-gradient(90deg, transparent, ${P.glow}, transparent)`, scale: `${ease(t, HOOK - 1.6, HOOK - 0.9)} 1`, boxShadow: `0 0 18px ${P.glow}` }} />
        <div style={{ position: "absolute", left: 0, width: VW, top: 970, textAlign: "center", ...rise(t, HOOK - 1.3) }}>
          <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: "#1A0F08", background: P.glow, padding: "8px 28px", borderRadius: 40, letterSpacing: 4 }}>EPISODE {EPISODE}</span>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 42, color: "#D9B98A", marginTop: 26 }}>with Olga Rozin</div>
        </div>
      </Scene>

      {/* 1 — a rare luxury */}
      <Scene t={t} a={S.intro[0]} b={S.intro[1]} bg="none">
        <FullClip name="tumbler" from={HOOK - 0.6} dim={0.15} />
        <AbsoluteFill style={{ opacity: ease(t, HOOK + 2.6, HOOK + 3.1) }}><FullClip name="goblets" from={HOOK + 2.6} dim={0.1} /></AbsoluteFill>
        <AbsoluteFill style={{ opacity: ease(t, HOOK + 5.0, HOOK + 5.5) }}><FullClip name="candles" from={HOOK + 5.0} dim={0.1} /></AbsoluteFill>
        <AbsoluteFill style={{ background: shade }} />
        {[["Art", at("art,")], ["Windows", at("windows,")], ["Everyday objects", at("everyday")]].map(([l, tt], i) => (
          <div key={l as string} style={{ position: "absolute", left: 0, width: VW, top: 260 + i * 90, textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 70, color: "#E8D3AE", textShadow: "0 3px 14px rgba(0,0,0,.8)", ...rise(t, (tt as number) - 0.1) }}>
            <span style={{ position: "relative" }}>{l as string}
              <span style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 6, background: P.glow, borderRadius: 3, scale: `${ease(t, at("rare") - 0.4 + i * 0.12, at("rare") + i * 0.12)} 1`, transformOrigin: "left" }} />
            </span>
          </div>
        ))}
        <Big t={t} t0={at("rare") - 0.1} top={640} size={150}>A rare<br />luxury</Big>
        <LightSweep t={t} t0={at("luxury.")} />
      </Scene>

      {/* 2 — the first glass: Egypt and the Middle East */}
      <Scene t={t} a={S.map[0]} b={S.map[1]} bg="none">
        <MapBase w={1080} h={1920} zoom={interpolate(ease(t, S.map[0], S.map[1]), [0, 1], [1.75, 1.95])} cx={xy(37, 31)[0]} cy={xy(37, 31)[1]}>
          {[["Egypt", 31, 27.5, at("egypt.")], ["Middle East", 42.5, 33.5, at("middle")]].map(([l, lon, lat, tt]) => {
            const [x, y] = xy(lon as number, lat as number); const k = spr(t, tt as number);
            return (
              <g key={l as string} opacity={Math.min(1, k * 1.5)}>
                <circle cx={x} cy={y} r={90 * k} fill={P.red} opacity={0.15} /><circle cx={x} cy={y} r={7} fill={P.red} />
                <text x={x} y={y - 22} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={30} fill={P.ink}>{l as string}</text>
              </g>
            );
          })}
        </MapBase>
        <AbsoluteFill style={{ boxShadow: "inset 0 0 200px rgba(110,80,40,.5)" }} />
        <Tag t={t} t0={S.map[0] + 0.1} top={250}>The first glass</Tag>
        <div style={{ position: "absolute", left: 120, width: 840, top: 880, display: "flex", justifyContent: "center", gap: 40, alignItems: "flex-end" }}>
          <div style={rise(t, at("thousands"))}><CoreVessel w={130} /></div>
          <div style={rise(t, at("thousands") + 0.3)}><CoreVessel w={110} body={P.teal} trail="#F4F1E8" trail2="#E8B04B" /></div>
          <div style={rise(t, at("thousands") + 0.6)}><CoreVessel w={120} body="#4B2C5E" trail="#F1C232" trail2="#7FC6C0" /></div>
        </div>
      </Scene>

      {/* 3 — the problem */}
      <Scene t={t} a={S.problem[0]} b={S.problem[1]}>
        <Tag t={t} t0={S.problem[0] + 0.1}>The problem</Tag>
        <div style={{ position: "absolute", left: 330, top: 360, ...rise(t, at("making") - 0.3) }}><CoreVessel w={420} /></div>
        <div style={{ position: "absolute", left: 770, top: 820, ...pop(t, at("slow")) }}><div style={{ rotate: `${Math.max(0, t - at("slow")) * 50}deg` }}><IconStopwatch s={170} /></div></div>
        <Head t={t} t0={at("slow") - 0.1} top={1060} size={88} color={P.red}><i>Slow &amp; difficult</i></Head>
      </Scene>

      {/* 4 — timeline to the first century BCE */}
      <Scene t={t} a={S.bce[0]} b={S.bce[1]}>
        <Tag t={t} t0={S.bce[0] + 0.1}>Then…</Tag>
        {(() => {
          const x = 250, y0 = 380, y1 = 1120, p = ease(t, at("then", 0), at("then", 0) + 1.6);
          const ticks: [number, string, string][] = [[0, "c. 2500 BCE", "first glass objects"], [0.42, "c. 1500 BCE", "core-formed vessels"], [1, "1st century BCE", "glassblowing!"]];
          return (
            <>
              <div style={{ position: "absolute", left: x - 2, top: y0, width: 5, height: (y1 - y0) * p, background: P.ink }} />
              {ticks.map(([f, a, b], i) => {
                const hi = i === 2, k = spr(t, at("then", 0) + 0.3 + f * 1.4);
                return (
                  <div key={a} style={{ position: "absolute", left: x - (hi ? 34 : 18), top: y0 + (y1 - y0) * f - (hi ? 34 : 18), display: "flex", alignItems: "center", gap: 40, opacity: Math.min(1, k * 1.5) }}>
                    <div style={{ width: hi ? 68 : 36, height: hi ? 68 : 36, borderRadius: 40, background: hi ? P.glow : P.ink, boxShadow: hi ? `0 0 ${50 * spr(t, at("century"))}px ${P.glow}` : undefined, scale: `${0.5 + 0.5 * k}` }} />
                    <div>
                      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: hi ? 70 : 54, color: hi ? P.red : P.ink }}>{a}</div>
                      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 40, color: P.inkSoft }}>{b}</div>
                    </div>
                  </div>
                );
              })}
            </>
          );
        })()}
      </Scene>

      {/* 5 — glassblowing was invented */}
      <Scene t={t} a={S.invented[0]} b={S.invented[1]} bg="none">
        <FullClip name="glory_gather" from={S.invented[0] - 0.5} />
        <AbsoluteFill style={{ background: shade }} /><Embers t={t} n={40} seed="inv" />
        <Big t={t} t0={at("glassblowing", 0) - 0.1} top={300} size={136}>Glassblowing</Big>
        <Big t={t} t0={at("invented.") - 0.15} top={450} size={84} italic color="#F2C27B">was invented</Big>
      </Scene>

      {/* 6 — that changed everything */}
      <Scene t={t} a={S.changed[0]} b={S.changed[1]} bg="none">
        <FullClip name="red_bubble" from={S.changed[0] - 0.3} />
        <AbsoluteFill style={{ background: shade }} />
        <Big t={t} t0={at("changed") - 0.2} top={300} size={124}>It changed<br />everything</Big>
      </Scene>

      {/* 7 — where: the Syro-Palestinian region */}
      <Scene t={t} a={S.origin[0]} b={S.origin[1]} bg="none">
        {(() => {
          const z = interpolate(ease(t, S.origin[0], S.origin[0] + 2.2), [0, 1], [1.5, 3.6]);
          const [lx, ly] = xy(35.6, 33.0), [jx, jy] = xy(35.23, 31.78);
          const k = spr(t, at("syro-palestinian") - 0.3), kj = spr(t, at("region.") + 0.2);
          return (
            <MapBase w={1080} h={1920} zoom={z} cx={xy(35.2, 32.4)[0]} cy={xy(35.2, 32.4)[1]}>
              <ellipse cx={lx} cy={ly + 10} rx={30 * k} ry={68 * k} fill={P.red} opacity={0.3} transform={`rotate(-12 ${lx} ${ly})`} />
              <circle cx={jx} cy={jy} r={4} fill={P.ink} opacity={kj} />
              <g opacity={kj}><rect x={jx - 118} y={jy + 12} width={236} height={30} rx={6} fill={P.paper} opacity={0.94} />
                <text x={jx} y={jy + 33} textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize={17} fill={P.ink}>Jerusalem · earliest evidence, c. 50 BCE</text></g>
            </MapBase>
          );
        })()}
        <AbsoluteFill style={{ boxShadow: "inset 0 0 200px rgba(110,80,40,.5)" }} />
        <Tag t={t} t0={S.origin[0] + 0.1}>Where it began</Tag>
        <Head t={t} t0={at("syro-palestinian") - 0.4} top={330} size={78}><span style={{ background: "rgba(239,228,206,.92)", padding: "4px 18px", borderRadius: 8, boxDecorationBreak: "clone" }}>The Syro-Palestinian region</span></Head>
      </Scene>

      {/* 8 — before: the clay-core method */}
      <Scene t={t} a={S.core[0]} b={S.core[1]}>
        <Tag t={t} t0={S.core[0] + 0.1}>Before glassblowing</Tag>
        <Head t={t} t0={at("clay") - 0.3} top={330} size={84}>The clay-core method</Head>
        <div style={{ position: "absolute", left: 40, top: 480 }}><CoreForming p={ease(t, at("shape"), at("laborious") + 1.6)} w={1000} /></div>
        {[["1", "Clay core on a rod", at("clay")], ["2", "Hot glass wrapped around", at("laborious") - 0.6], ["3", "Core scraped out", at("imagine.") - 0.3]].map(([n, l, tt], i) => (
          <div key={n as string} style={{ position: "absolute", left: 170, top: 960 + i * 78, display: "flex", gap: 22, alignItems: "center", ...rise(t, tt as number) }}>
            <div style={{ width: 58, height: 58, borderRadius: 40, border: `3px solid ${P.ink}`, display: "grid", placeItems: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 34, color: P.ink }}>{n}</div>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 46, color: P.ink }}>{l}</div>
          </div>
        ))}
      </Scene>

      {/* 9 — the blowpipe: gather */}
      <Scene t={t} a={S.gather[0]} b={S.gather[1]} bg="none">
        <FullClip name="gather" from={at("gather") - 0.9} />
        <AbsoluteFill style={{ background: shade }} />
        <Tag t={t} t0={S.gather[0] + 0.1} dark>The blowpipe</Tag>
        <div style={{ position: "absolute", left: 230, top: 340, ...rise(t, at("blowpipe,", 0)) }}><Blowpipe p={ease(t, at("gather"), at("pipe") + 0.5) * 0.4} w={620} /></div>
        <Big t={t} t0={at("gather") - 0.1} top={590} size={110}>Gather…</Big>
      </Scene>

      {/* 10 — and blow */}
      <Scene t={t} a={S.blow[0]} b={S.blow[1]} bg="none">
        <FullClip name="olga_blow" from={S.blow[0] - 0.2} trim={0.9} focusY="35%" />
        <AbsoluteFill style={{ background: shade }} />
        <Big t={t} t0={at("blow") - 0.2} top={320} size={150} italic>…and blow!</Big>
      </Scene>

      {/* 11 — a hollow form */}
      <Scene t={t} a={S.hollow[0]} b={S.hollow[1]} bg="none">
        <FullClip name="clear_bubble" from={S.hollow[0] - 0.2} />
        <AbsoluteFill style={{ background: shade }} />
        <Big t={t} t0={at("hollow", 2) - 0.2} top={300} size={140}>A hollow<br />glass form!</Big>
      </Scene>

      {/* 12 — what it meant */}
      <Scene t={t} a={S.meant[0]} b={S.meant[1]}>
        <Tag t={t} t0={S.meant[0] + 0.1}>What it meant</Tag>
        {[[<IconStopwatch key="s" s={120} />, "Faster", at("faster.")], [<IconFeather key="f" s={120} />, "Thinner & lighter", at("thinner,")], [<IconVessels key="v" s={150} />, "Endless shapes", at("variety")]].map(([ic, l, tt], i) => (
          <div key={l as string} style={{ position: "absolute", left: 150, top: 340 + i * 170, display: "flex", alignItems: "center", gap: 40, ...rise(t, (tt as number) - 0.2) }}>
            <div style={{ width: 150, display: "grid", placeItems: "center" }}>{ic as React.ReactNode}</div>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 74, color: P.ink }}>{l as string}</div>
          </div>
        ))}
        {[["blue_goblet", -2], ["goblets", 1.5], ["blue_vessel", -1]].map(([n, r], i) => (
          <Frame key={n as string} x={110 + i * 300} y={880} w={260} h={300} t={t} t0={at("variety") + 0.15 * i} rot={r as number}><Clip name={n as string} from={at("variety") - 0.3} /></Frame>
        ))}
      </Scene>

      {/* 13 — Rome spreads the craft */}
      <Scene t={t} a={S.romans[0]} b={S.romans[1]} bg="none">
        {(() => {
          const src = xy(35.4, 33.5);
          const cities: [string, number, number, number][] = [["Sidon", 35.37, 33.56, 0], ["Alexandria", 29.9, 31.2, 0.25], ["Rome", 12.5, 41.9, 0.5], ["Aquileia", 13.37, 45.77, 0.65], ["Cologne", 6.96, 50.94, 0.85]];
          const t0 = at("adopted"), spread = ease(t, at("spread") - 0.2, at("empire.") + 0.3);
          return (
            <MapBase w={1080} h={1920} zoom={interpolate(ease(t, S.romans[0], S.romans[1]), [0, 1], [1.0, 1.06])} cx={xy(21, 40)[0]} cy={xy(21, 40)[1]}>
              <circle cx={src[0]} cy={src[1]} r={1500 * spread} fill={P.glow} opacity={0.12 * (1 - spread * 0.4)} />
              {cities.map(([n, lo, la, d]) => {
                const [x, y] = xy(lo, la); const k = spr(t, t0 + 0.6 + d * 4.5);
                const mx = (x + src[0]) / 2, my = Math.min(y, src[1]) - 120;
                return (
                  <g key={n} opacity={Math.min(1, k * 1.5)}>
                    {n !== "Sidon" ? <path d={`M${src[0]} ${src[1]} Q${mx} ${my} ${x} ${y}`} fill="none" stroke={P.red} strokeWidth={3} strokeDasharray="10 10" opacity={0.75} strokeDashoffset={-t * 30} /> : null}
                    <circle cx={x} cy={y} r={9 * (0.5 + 0.5 * k)} fill={P.red} />
                    <text x={x} y={y - 16} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={32} fill={P.ink}>{n}</text>
                  </g>
                );
              })}
            </MapBase>
          );
        })()}
        <AbsoluteFill style={{ boxShadow: "inset 0 0 200px rgba(110,80,40,.5)" }} />
        <Tag t={t} t0={S.romans[0] + 0.1} dark>The Romans</Tag>
        <div style={{ position: "absolute", left: 0, width: VW, top: 900, display: "flex", justifyContent: "center", alignItems: "flex-end", ...rise(t, at("roman", 0) - 0.5) }}>
          <Laurel s={120} /><Colosseum w={380} p={ease(t, at("roman", 0) - 0.5, at("roman", 0) + 1.5)} /><Laurel s={120} flip />
        </div>
      </Scene>

      {/* 14 — 2,000 years later: the same principles */}
      <Scene t={t} a={S.principles[0]} b={S.principles[1]} bg="none">
        {(() => {
          const steps: [string, string, string, React.ReactNode, number][] = [
            ["heat", "Heat", "glory_hole", <IconFurnace key="f" s={84} />, 0], ["introduce", "Air", "olga_blow", <IconBreath key="b" s={84} />, 1.2],
            ["controlling", "Control", "swing", <IconGravity key="g" s={84} rot={Math.sin(t * 3) * 30} />, 0]];
          const tH = at("heat") - 0.3;
          const idx = steps.reduce((acc, s2, k) => (t >= at(s2[0]) - 0.3 ? k : acc), -1);
          return (
            <>
              <FullClip name="stems" from={S.principles[0] - 0.2} rate={0.8} />
              {steps.map(([cue, , clip, , trim], k) => (
                <AbsoluteFill key={cue} style={{ opacity: ease(t, at(cue) - 0.4, at(cue) - 0.1) }}><FullClip name={clip} from={at(cue) - 0.4} trim={trim} /></AbsoluteFill>
              ))}
              <AbsoluteFill style={{ background: shade }} />
              {t < tH ? (
                <>
                  <Big t={t} t0={at("more", 0) - 0.1} top={300} size={150}>{Math.round(interpolate(ease(t, at("more", 0), at("later,") + 0.3), [0, 1], [0, 2000])).toLocaleString("en-US")}+ years</Big>
                  <Big t={t} t0={at("same") - 0.2} top={470} size={80} italic color="#F2C27B">same principles</Big>
                </>
              ) : (
                <div style={{ position: "absolute", left: 0, width: VW, top: 280, display: "flex", justifyContent: "center", gap: 18 }}>
                  {steps.map(([cue, l, , ic], k) => {
                    const on = k === idx, done = k < idx;
                    return (
                      <div key={cue} style={{ width: 290, padding: "18px 10px", borderRadius: 26, textAlign: "center", background: on ? P.glow : "rgba(20,12,6,.7)", border: `3px solid ${on || done ? P.glow : "rgba(255,255,255,.2)"}`, ...pop(t, at(cue) - 0.3) }}>
                        <div style={{ display: "grid", placeItems: "center" }}>{ic}</div>
                        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 52, color: on ? "#1A0F08" : CREAM }}>{k + 1}. {l}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          );
        })()}
      </Scene>

      {/* 15 — the hands of the glassmaker */}
      <Scene t={t} a={S.hands[0]} b={S.hands[1]} bg="none">
        <FullClip name="bench_hands" from={S.hands[0] - 0.3} />
        <AbsoluteFill style={{ background: shade }} />
        <Big t={t} t0={at("ingredient.") - 0.4} top={300} size={74} italic color="#F2C27B">The secret ingredient…</Big>
        <Big t={t} t0={at("hands") - 0.2} top={420} size={150}>The hands</Big>
      </Scene>

      {/* 16 — Olga Rozin */}
      <Scene t={t} a={S.olga[0]} b={S.olga[1]} bg="none">
        <FullClip name="olga_blow" from={S.olga[0] - 0.2} trim={1.8} rate={0.9} focusY="35%" />
        <AbsoluteFill style={{ opacity: ease(t, at("connected") - 3.0, at("connected") - 2.4) }}><FullClip name="twist" from={at("connected") - 3.0} /></AbsoluteFill>
        <AbsoluteFill style={{ opacity: ease(t, at("history") - 1.2, at("history") - 0.6) }}><FullClip name="rose_torch" from={at("history") - 1.2} /></AbsoluteFill>
        <AbsoluteFill style={{ opacity: ease(t, at("history") + 1.6, at("history") + 2.2) }}><FullClip name="roses" from={at("history") + 1.6} /></AbsoluteFill>
        <AbsoluteFill style={{ background: shade }} />
        <Big t={t} t0={at("olga", 0) - 0.2} top={290} size={130}>Olga Rozin</Big>
        <div style={{ position: "absolute", left: 0, width: VW, top: 440, textAlign: "center", ...rise(t, at("artist.") - 0.3) }}>
          <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, letterSpacing: 8, textTransform: "uppercase", color: "#1A0F08", background: P.glow, padding: "8px 26px", borderRadius: 40 }}>Glass artist</span>
        </div>
      </Scene>

      {/* 17 — follow on Instagram */}
      <Scene t={t} a={S.insta[0]} b={S.insta[1]} bg="dark">
        <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, opacity: 0.35 }}>
          {["tumbler", "blue_goblet", "roses", "candles", "goblets", "blue_vessel", "red_bubble", "clear_bubble", "twist"].map((n, i) => (
            <div key={n} style={{ position: "relative", overflow: "hidden", opacity: Math.min(1, spr(t, S.insta[0] + 0.2 + i * 0.07) * 1.5) }}><Clip name={n} from={S.insta[0]} /></div>
          ))}
        </div>
        <div style={{ position: "absolute", left: 90, width: 900, top: 420, padding: "50px 40px", borderRadius: 40, background: "rgba(20,12,6,.88)", border: `3px solid ${P.glow}`, textAlign: "center", ...pop(t, at("follow") - 0.1) }}>
          <InstaGlyph s={150} />
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 52, color: "#D9B98A", marginTop: 16 }}>Follow me on Instagram</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 104, color: P.glow, ...rise(t, at("underscore") - 0.6) }}>@olga_rozin</div>
        </div>
      </Scene>

      {/* 18 — comments */}
      <Scene t={t} a={S.comments[0]} b={S.comments[1]}>
        <div style={{ position: "absolute", left: 0, width: VW, top: 300, display: "flex", justifyContent: "center", alignItems: "center", gap: 22, ...rise(t, S.comments[0] + 0.1) }}>
          <SpeechIcon s={90} /><span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 60, color: P.ink }}>Tell me in the comments</span>
        </div>
        <div style={{ position: "absolute", left: 80, top: 520, width: 920, height: 460, background: "#D9A75B", opacity: 0.55, borderRadius: "40% 8% 50% 10% / 20% 60% 20% 60%", scale: `${ease(t, at("learn") - 0.8, at("learn") - 0.1)} 1`, transformOrigin: "left", rotate: "-2deg" }} />
        <Head t={t} t0={at("would") - 0.2} top={580} size={104}><i>Want to learn how glass is made?</i></Head>
      </Scene>

      {/* 19 — I'd love to hear what you think */}
      <Scene t={t} a={S.end[0]} b={S.end[1]} bg="none">
        <FullClip name="tumbler" from={S.end[0] - 0.3} rate={0.8} />
        <AbsoluteFill style={{ background: shade }} />
        <div style={{ position: "absolute", left: 80, top: 330, fontFamily: HAND, fontWeight: 600, fontSize: 132, lineHeight: 1.05, color: CREAM, rotate: "-4deg", textShadow: "0 4px 18px rgba(0,0,0,.7)", clipPath: `inset(0 ${100 - 100 * ease(t, at("hear") - 0.6, at("think", 1) + 0.6)}% 0 0)` }}>
          I'd love to hear<br />what you think!
        </div>
      </Scene>

      {/* 20 — series outro */}
      <Scene t={t} a={S.outro[0]} b={S.outro[1]} bg="dark">
        <Embers t={t} n={70} seed="out" strength={1.1} />
        <div style={{ position: "absolute", left: 0, width: VW, top: 250, textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 36, letterSpacing: 14, textTransform: "uppercase", color: P.glow, ...rise(t, S.outro[0] + 0.1) }}>{SERIES}</div>
        <div style={{ position: "absolute", left: 60, width: VW - 120, top: 310, display: "flex", justifyContent: "center", alignItems: "center", gap: 26, ...rise(t, S.outro[0] + 0.25) }}>
          <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 64, color: CREAM, textAlign: "center", lineHeight: 1.05 }}>Episode {EPISODE}<br /><span style={{ fontSize: 50, fontStyle: "italic", color: "#D9B98A" }}>{EP_TITLE}</span></span>
          <div style={{ width: 92, height: 92, borderRadius: 60, border: `5px solid ${P.glow}`, display: "grid", placeItems: "center", rotate: "-12deg", flex: "none", opacity: Math.min(1, spr(t, S.outro[0] + 0.9) * 1.5), scale: `${2 - spr(t, S.outro[0] + 0.9, 12, 220)}` }}>
            <svg width="52" height="52" viewBox="0 0 24 24"><path d="M4.5 12.5l5 5L19.5 7" fill="none" stroke={P.glow} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
        <div style={{ position: "absolute", left: 160, top: 520, width: 760, height: 560, borderRadius: 22, overflow: "hidden", boxShadow: "0 30px 70px rgba(0,0,0,.6)", border: `2px solid ${P.glow}66`, ...rise(t, S.outro[0] + 1.0, 40) }}>
          <Clip name="red_bubble" from={S.outro[0] + 0.6} />
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,.88))" }} />
          <div style={{ position: "absolute", left: 34, bottom: 28, right: 34 }}>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 30, letterSpacing: 5, color: P.glow, textTransform: "uppercase" }}>Next time?</div>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 64, color: CREAM, lineHeight: 1.05 }}>How is glass made?</div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 36, color: "#D9B98A", marginTop: 6 }}>You decide — comment below</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, width: VW, top: 1150, textAlign: "center", ...rise(t, S.outro[0] + 1.6) }}>
          {(() => {
            const press = spr(t, S.outro[0] + 2.8, 10, 260), tap = Math.min(1, spr(t, S.outro[0] + 2.6) * 1.5);
            const sc = 1 - 0.08 * Math.max(0, Math.sin(Math.min(1, Math.max(0, t - (S.outro[0] + 2.6)) / 0.35) * Math.PI));
            return (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 22, padding: "22px 46px 22px 26px", borderRadius: 80, background: press > 0.5 ? "#2A1B10" : P.glow, border: `3px solid ${P.glow}`, scale: `${sc}`, boxShadow: `0 0 ${40 * tap}px rgba(255,140,40,.5)` }}>
                <InstaGlyph s={84} />
                <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 64, color: press > 0.5 ? P.glow : "#1A0F08" }}>{press > 0.5 ? "Following ✓" : "@olga_rozin"}</span>
              </div>
            );
          })()}
          <div style={{ marginTop: 26, fontFamily: SERIF, fontSize: 44, fontStyle: "italic", color: "#D9B98A" }}>Follow for more {SERIES}</div>
        </div>
      </Scene>

      {/* chapter stings */}
      <ChapterWipe t={t} t0={HOOK - 0.7} n={1} title="A Rare Luxury" />
      <ChapterWipe t={t} t0={c.then - 0.85} n={2} title="The Breakthrough" oy={0.4} />
      <ChapterWipe t={t} t0={c.romans - 0.85} n={3} title="Rome Spreads the Craft" oy={0.45} />
      <ChapterWipe t={t} t0={c.fascinating - 0.85} n={4} title="The Craft Today" oy={0.55} />

      <Captions t={t} />

      {VO_LABEL.startsWith("SCRATCH") ? (
        <div style={{ position: "absolute", left: 0, width: VW, top: 1560, textAlign: "center" }}>
          <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 24, color: "rgba(255,255,255,.85)", background: "rgba(160,30,30,.8)", padding: "6px 14px", borderRadius: 8 }}>DRAFT · scratch voice, not Olga</span>
        </div>
      ) : null}
      <Sequence from={Math.round(HOOK * GFPS)} layout="none"><Audio src={staticFile("glass/vo.wav")} /></Sequence>
    </AbsoluteFill>
  );
};
