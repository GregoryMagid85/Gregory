// Glass Stories · Ep.1 — vertical 1080x1920 (TikTok / Reels / Shorts), narrated by Olga Rozin.
// One look throughout (src/glass/look.tsx): full-frame footage, series art or parchment map,
// with only three overlay types — red Ribbon, torn ParchCard, Kinetic words — plus the captions.
// Safe area: content between y≈170 and y≈1200, captions at y≈1236, nothing key below y≈1500
// (platform UI) except in the hook and the outro, which have no captions.
import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { VO_LABEL } from "./words";
import { SERIF, HAND, MapBase, xy, CoreForming, IconStopwatch, IconFeather, IconVessels, IconFurnace, IconBreath, IconGravity, Colosseum, Laurel, InstaGlyph, SpeechIcon } from "./art";
import { Embers, ChapterWipe, LightSweep, Slam, EPISODE } from "./fx";
import { GFPS, HOOK, DURATION, spr, ease, rise, Clip, FullClip, Scene, Captions, makeTiming, Lang } from "./core";
import { TXT } from "./i18n";
import { L, Ribbon, ParchCard, CardTitle, Kinetic, ArtPan, Studio } from "./look";

export const GLASS_V2_DURATION = DURATION;
const TIMING = { en: makeTiming("en"), ru: makeTiming("ru") };
export const GLASS_V2_RU_DURATION = TIMING.ru.DURATION;
// Drop a real clip of Olga waving goodbye at public/glass/clips/olga_wave.mp4 and set this to true.
const WAVE_CLIP = false;
const shade = "linear-gradient(180deg, rgba(10,6,3,.72) 0%, rgba(10,6,3,.1) 30%, rgba(10,6,3,.1) 58%, rgba(10,6,3,.8) 100%)";

export const GlassV2: React.FC<{ lang?: Lang }> = ({ lang = "en" }) => {
  const t = useCurrentFrame() / GFPS;
  const tm = TIMING[lang], tx = TXT[lang];
  const at = tm.at, LAST = tm.LAST, DURATION = tm.DURATION;
  const { width: VW, height: VH } = useVideoConfig();
  const land = VW > VH;                                    // 16:9: map the vertical layout's y positions into 1080 px
  const Y = (v: number) => (land ? Math.round(90 + (v - 170) * 0.69) : v);
  const F = (v: number) => (land ? Math.round(v * 0.8) : v);
  // scene starts, all on narration words (mirrored in tools/glass_audio.py)
  const c = {
    intro: HOOK - 0.5, meso: at("earliest") - 0.55, egypt: at("egypt.") - 0.35, then: at("then", 0) - 0.2, invented: at("glassblowing", 0) - 0.15,
    origin: at("technique") - 0.7, core: at("you", 0) - 0.15, gather: at("but", 1) - 0.2, blow: at("blow") - 0.35, hollow: at("suddenly") - 0.3,
    meant: at("think") - 0.4, rome: at("romans") - 0.3, romemap: at("adopted") - 0.3, modern: at("but", 2) - 0.2, steps: at("heat") - 0.35,
    hands: at("course", 1) - 0.6, olga: at("olga", 0) - 0.5, montage: at("connected") - 0.6, history: at("history") - 0.8, insta: at("follow") - 0.4,
    comments: at("comments") - 0.9, end: at("hear") - 0.8, outro: LAST + 1.0,
  };
  const keys = Object.keys(c) as (keyof typeof c)[];
  const win = (k: keyof typeof c): [number, number] => { const i = keys.indexOf(k); return [c[k], i + 1 < keys.length ? c[keys[i + 1]] : DURATION + 1]; };

  return (
    <AbsoluteFill style={{ background: "#0E0805" }}>
      {/* HOOK — Olga at work, fast cuts, ending on the series art */}
      {t < HOOK - 2.6 ? (() => {
        const cuts: [string, number, number][] = [["glory_hole", 0, 0.4], ["olga_blow", 0.8, 1.6], ["red_bubble", 1.6, 0.2], ["torch", 2.45, 0.9], ["montage", 3.3, 0]];
        const i = cuts.reduce((acc, cc, k) => (t >= cc[1] ? k : acc), 0);
        const [name, start, trim] = cuts[i];
        return (
          <AbsoluteFill>
            <AbsoluteFill style={{ scale: `${1.16 - 0.16 * spr(t, start, 14, 220)}` }}>
              {name === "montage" ? <ArtPan name="montage" t0={3.3} t1={5.2} hold={0} endFocus={1000} endScale={1.6} /> : <FullClip name={name} from={start} trim={trim} rate={1.25} />}
            </AbsoluteFill>
            <AbsoluteFill style={{ background: "radial-gradient(900px 1300px at 50% 45%, rgba(0,0,0,0) 35%, rgba(0,0,0,.65))" }} />
            <LightSweep t={t} t0={0.75} dur={0.6} /><LightSweep t={t} t0={3.2} dur={0.6} />
            <Slam t={t} t0={0.15} t1={1.45} text={tx.hook1} size={F(150)} y={Y(820)} />
            <Slam t={t} t0={1.6} t1={2.95} text={tx.hook2} size={F(150)} y={Y(820)} />
            <Slam t={t} t0={3.1} t1={4.5} text={tx.hook3} size={F(128)} y={Y(760)} />
          </AbsoluteFill>
        );
      })() : null}

      {/* TITLE STING */}
      <Scene t={t} a={HOOK - 2.9} b={HOOK - 0.35} bg="none">
        <Studio from={HOOK - 3} />
        <Embers t={t} n={70} seed="sting" strength={1.2} />
        <Ribbon t={t} t0={HOOK - 2.6} top={Y(520)} size={38}>{tx.series}</Ribbon>
        <div style={{ position: "absolute", left: 60, width: VW - 120, top: Y(640), textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 124, lineHeight: 1.0, color: L.cream, textShadow: "0 0 50px rgba(255,140,40,.55)",
          clipPath: `inset(${50 - 50 * ease(t, HOOK - 2.3, HOOK - 1.3)}% 0 ${50 - 50 * ease(t, HOOK - 2.3, HOOK - 1.3)}% 0)` }}>{tx.epTitle}</div>
        <div style={{ position: "absolute", left: 0, width: VW, top: Y(940), textAlign: "center", ...rise(t, HOOK - 1.3) }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, letterSpacing: 8, color: L.gold }}>{tx.episode} {EPISODE}</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 44, color: L.cream, marginTop: 14 }}>{tx.withOlga}</div>
        </div>
      </Scene>

      {/* CH.1 — a rare luxury: Olga's finished pieces */}
      <Scene t={t} a={win("intro")[0]} b={win("intro")[1]} bg="none">
        <FullClip name="tumbler" from={HOOK - 0.6} />
        <AbsoluteFill style={{ opacity: ease(t, at("everyday") - 0.3, at("everyday") + 0.2) }}><FullClip name="goblets" from={at("everyday") - 0.3} /></AbsoluteFill>
        <AbsoluteFill style={{ opacity: ease(t, at("rare") - 0.4, at("rare") + 0.1) }}><FullClip name="candles" from={at("rare") - 0.4} /></AbsoluteFill>
        <AbsoluteFill style={{ background: shade }} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,6,3,.78) 0%, rgba(10,6,3,.55) 32%, rgba(10,6,3,0) 52%)" }} />
        {[[tx.art, at("art,")], [tx.windows, at("windows,")], [tx.everyday, at("everyday")]].map(([l, tt], i) => (
          <div key={l as string} style={{ position: "absolute", left: 0, width: VW, top: Y(250 + i * 92), textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 72, color: L.gold, textShadow: "0 3px 14px rgba(0,0,0,.8)", ...rise(t, (tt as number) - 0.1) }}>
            <span style={{ position: "relative" }}>{l as string}
              <span style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 6, background: L.ribbon, borderRadius: 3, scale: `${ease(t, at("rare") - 0.4 + i * 0.12, at("rare") + i * 0.12)} 1`, transformOrigin: "left" }} />
            </span>
          </div>
        ))}
        <Kinetic t={t} t0={at("rare") - 0.1} top={Y(650)} size={F(150)}>{tx.rare1}<br />{tx.rare2}</Kinetic>
        <LightSweep t={t} t0={at("luxury.")} />
      </Scene>

      {/* the first glass — Mesopotamia, then Egypt (art pans from portrait to card) */}
      <Scene t={t} a={win("meso")[0]} b={win("meso")[1]} bg="none"><ArtPan name="mesopotamia" t0={win("meso")[0]} t1={win("meso")[1]} hold={0.25} /></Scene>
      <Scene t={t} a={win("egypt")[0]} b={win("egypt")[1]} bg="none"><ArtPan name="egypt" t0={win("egypt")[0]} t1={win("egypt")[1] - 0.4} hold={0.2} /></Scene>

      {/* CH.2 — timeline card */}
      <Scene t={t} a={win("then")[0]} b={win("then")[1]} bg="none">
        <Studio from={win("then")[0]} />
        <Ribbon t={t} t0={at("then", 0)}>{tx.then}</Ribbon>
        <ParchCard t={t} t0={at("then", 0) + 0.1} y={Y(380)} h={760} seed="tl">
          {(() => {
            const x = 70, y0 = 30, y1 = 600, p = ease(t, at("then", 0) + 0.2, at("century") + 0.4);
            const ticks = tx.ticks;
            return (
              <div style={{ position: "relative", height: 650 }}>
                <div style={{ position: "absolute", left: x - 2, top: y0, width: 5, height: (y1 - y0) * p, background: L.ink }} />
                {ticks.map(([f, a, b], i) => {
                  const hi = i === 2, k = spr(t, at("then", 0) + 0.3 + f * 1.2);
                  return (
                    <div key={a} style={{ position: "absolute", left: x - (hi ? 30 : 16), top: y0 + (y1 - y0) * f - (hi ? 30 : 16), display: "flex", alignItems: "center", gap: 36, opacity: Math.min(1, k * 1.5) }}>
                      <div style={{ width: hi ? 60 : 32, height: hi ? 60 : 32, borderRadius: 40, background: hi ? L.ember : L.ink, boxShadow: hi ? `0 0 ${40 * spr(t, at("century"))}px ${L.ember}` : undefined, scale: `${0.5 + 0.5 * k}` }} />
                      <div>
                        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: hi ? 64 : 52, color: hi ? L.ribbon : L.ink }}>{a}</div>
                        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 38, color: L.inkSoft }}>{b}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </ParchCard>
      </Scene>

      {/* glassblowing was invented — Olga's furnace footage */}
      <Scene t={t} a={win("invented")[0]} b={win("invented")[1]} bg="none">
        <FullClip name="glory_gather" from={win("invented")[0] - 0.4} />
        <AbsoluteFill style={{ opacity: ease(t, at("changed") - 0.5, at("changed") - 0.1) }}><FullClip name="red_bubble" from={at("changed") - 0.5} /></AbsoluteFill>
        <AbsoluteFill style={{ background: shade }} /><Embers t={t} n={40} seed="inv" />
        <Kinetic t={t} t0={at("glassblowing", 0) - 0.1} top={Y(300)} size={F(lang === "ru" ? 120 : 136)}>{tx.glassblowing}</Kinetic>
        <Kinetic t={t} t0={at("invented.") - 0.15} top={Y(450)} size={F(80)} italic color={L.gold}>{tx.invented}</Kinetic>
        <Kinetic t={t} t0={at("changed") - 0.2} top={Y(560)} size={F(92)}>{tx.changed}</Kinetic>
      </Scene>

      {/* where it began — parchment map */}
      <Scene t={t} a={win("origin")[0]} b={win("origin")[1]} bg="none">
        {(() => {
          const z = interpolate(ease(t, win("origin")[0], win("origin")[0] + 2.4), [0, 1], [1.4, 3.6]);
          const [lx, ly] = xy(35.6, 33.0), [jx, jy] = xy(35.23, 31.78);
          const k = spr(t, at("syro-palestinian") - 0.3), kj = spr(t, at("region.") + 0.1);
          return (
            <MapBase w={VW} h={VH} zoom={z} cx={xy(35.2, 32.0)[0]} cy={xy(35.2, 32.0)[1]}>
              <ellipse cx={lx} cy={ly + 10} rx={30 * k} ry={68 * k} fill={L.ribbon} opacity={0.32} transform={`rotate(-12 ${lx} ${ly})`} />
              <circle cx={jx} cy={jy} r={4} fill={L.ink} opacity={kj} />
              <g opacity={kj}><rect x={jx - 128} y={jy + 12} width={256} height={30} rx={6} fill={L.parch} opacity={0.95} />
                <text x={jx} y={jy + 33} textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize={17} fill={L.ink}>{tx.jerusalem}</text></g>
            </MapBase>
          );
        })()}
        <AbsoluteFill style={{ boxShadow: "inset 0 0 200px rgba(110,70,30,.55)" }} />
        <Ribbon t={t} t0={win("origin")[0] + 0.1}>{tx.whereBegan}</Ribbon>
        <ParchCard t={t} t0={at("syro-palestinian") - 0.4} y={Y(360)} w={800} seed="or"><CardTitle size={70}>{tx.region}</CardTitle></ParchCard>
      </Scene>

      {/* before glassblowing — the clay-core method */}
      <Scene t={t} a={win("core")[0]} b={win("core")[1]} bg="none">
        <Studio from={win("core")[0]} clip="pink_form" />
        <Ribbon t={t} t0={win("core")[0] + 0.1}>{tx.before}</Ribbon>
        <ParchCard t={t} t0={win("core")[0] + 0.3} y={Y(370)} h={810} seed="core">
          <CardTitle size={72}>{tx.clayCore}</CardTitle>
          <div style={{ marginTop: 10, marginLeft: -40 }}><CoreForming p={ease(t, at("shape"), at("laborious") + 1.4)} w={880} /></div>
          {[["1", tx.step1, at("clay")], ["2", tx.step2, at("laborious") - 0.5], ["3", tx.step3, at("imagine.") - 0.3]].map(([n, l, tt]) => (
            <div key={n as string} style={{ display: "flex", gap: 20, alignItems: "center", marginTop: 14, marginLeft: 60, ...rise(t, tt as number) }}>
              <div style={{ width: 54, height: 54, borderRadius: 40, background: L.ribbon, color: L.cream, display: "grid", placeItems: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 32 }}>{n}</div>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 46, color: L.ink }}>{l}</div>
            </div>
          ))}
        </ParchCard>
      </Scene>

      {/* with the blowpipe — the Levant glassblower: gather, blow, early vessel */}
      <Scene t={t} a={win("gather")[0]} b={win("gather")[1]} bg="none"><ArtPan name="levant" t0={win("gather")[0]} t1={win("gather")[1] - 0.2} hold={0.3} /></Scene>

      {/* …and blow — Olga today */}
      <Scene t={t} a={win("blow")[0]} b={win("blow")[1]} bg="none">
        <FullClip name="olga_blow" from={win("blow")[0] - 0.2} trim={0.9} focusY="35%" />
        <AbsoluteFill style={{ background: shade }} />
        <Kinetic t={t} t0={at("blow") - 0.15} top={Y(320)} size={F(150)} italic>{tx.andBlow}</Kinetic>
      </Scene>
      <Scene t={t} a={win("hollow")[0]} b={win("hollow")[1]} bg="none">
        <FullClip name="clear_bubble" from={win("hollow")[0] - 0.2} />
        <AbsoluteFill style={{ background: shade }} />
        <Kinetic t={t} t0={at("hollow", 2) - 0.2} top={Y(300)} size={F(136)}>{tx.hollow1}<br />{tx.hollow2}</Kinetic>
      </Scene>

      {/* what it meant — Olga's pieces behind one card */}
      <Scene t={t} a={win("meant")[0]} b={win("meant")[1]} bg="none">
        <FullClip name="blue_goblet" from={win("meant")[0] - 0.2} />
        <AbsoluteFill style={{ opacity: ease(t, at("thinner,") - 0.3, at("thinner,") + 0.2) }}><FullClip name="goblets" from={at("thinner,") - 0.3} /></AbsoluteFill>
        <AbsoluteFill style={{ opacity: ease(t, at("variety") - 0.3, at("variety") + 0.2) }}><FullClip name="blue_vessel" from={at("variety") - 0.3} /></AbsoluteFill>
        <AbsoluteFill style={{ background: "rgba(10,6,3,.35)" }} />
        <Ribbon t={t} t0={win("meant")[0] + 0.1}>{tx.meant}</Ribbon>
        <ParchCard t={t} t0={at("faster,") - 0.5} y={Y(380)} w={860} seed="meant">
          {[[<IconStopwatch key="s" s={110} />, tx.faster, at("faster,")], [<IconFeather key="f" s={110} />, tx.thinner, at("thinner,")], [<IconVessels key="v" s={140} />, tx.shapes, at("variety")]].map(([ic, l, tt], i) => (
            <div key={l as string} style={{ display: "flex", alignItems: "center", gap: 34, marginTop: i ? 26 : 0, ...rise(t, (tt as number) - 0.2) }}>
              <div style={{ width: 150, display: "grid", placeItems: "center" }}>{ic as React.ReactNode}</div>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 70, color: L.ink }}>{l as string}</div>
            </div>
          ))}
        </ParchCard>
      </Scene>

      {/* CH.3 — the Roman glassblower, then the routes across the empire */}
      <Scene t={t} a={win("rome")[0]} b={win("rome")[1]} bg="none"><ArtPan name="rome" t0={win("rome")[0]} t1={win("rome")[1] + 0.3} hold={0.15} /></Scene>
      <Scene t={t} a={win("romemap")[0]} b={win("romemap")[1]} bg="none">
        {(() => {
          const src = xy(35.4, 33.5);
          const cities: [string, number, number, number][] = [["Sidon", 35.37, 33.56, 0], ["Alexandria", 29.9, 31.2, 0.2], ["Rome", 12.5, 41.9, 0.45], ["Aquileia", 13.37, 45.77, 0.6], ["Cologne", 6.96, 50.94, 0.8]];
          const t0 = at("adopted"), spread = ease(t, at("spread") - 0.2, at("empire.") + 0.3);
          return (
            <MapBase w={VW} h={VH} zoom={interpolate(ease(t, win("romemap")[0], win("romemap")[1]), [0, 1], [1.0, 1.06])} cx={xy(21, 40)[0]} cy={xy(21, 40)[1]}>
              <circle cx={src[0]} cy={src[1]} r={1500 * spread} fill={L.ember} opacity={0.12 * (1 - spread * 0.4)} />
              {cities.map(([n, lo, la, d]) => {
                const [x, y] = xy(lo, la); const k = spr(t, t0 + 0.4 + d * 4.0);
                const mx = (x + src[0]) / 2, my = Math.min(y, src[1]) - 120;
                return (
                  <g key={n} opacity={Math.min(1, k * 1.5)}>
                    {n !== "Sidon" ? <path d={`M${src[0]} ${src[1]} Q${mx} ${my} ${x} ${y}`} fill="none" stroke={L.ribbon} strokeWidth={3} strokeDasharray="10 10" opacity={0.8} strokeDashoffset={-t * 30} /> : null}
                    <circle cx={x} cy={y} r={9 * (0.5 + 0.5 * k)} fill={L.ribbon} />
                    <text x={x} y={y - 16} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={32} fill={L.ink}>{tx.city[n] ?? n}</text>
                  </g>
                );
              })}
            </MapBase>
          );
        })()}
        <AbsoluteFill style={{ boxShadow: "inset 0 0 200px rgba(110,70,30,.55)" }} />
        <Ribbon t={t} t0={win("romemap")[0] + 0.1}>{tx.empire}</Ribbon>
        <div style={{ position: "absolute", left: 0, width: VW, top: Y(930), display: "flex", justifyContent: "center", alignItems: "flex-end", ...rise(t, at("roman", 0) - 0.5) }}>
          <Laurel s={120} /><Colosseum w={380} p={ease(t, at("roman", 0) - 0.5, at("roman", 0) + 1.5)} /><Laurel s={120} flip />
        </div>
      </Scene>

      {/* CH.4 — the craft today: the modern glassblower card */}
      <Scene t={t} a={win("modern")[0]} b={win("modern")[1]} bg="none"><ArtPan name="modern" t0={win("modern")[0]} t1={win("modern")[1] - 0.6} hold={0.3} /></Scene>

      {/* heat / air / control — Olga working */}
      <Scene t={t} a={win("steps")[0]} b={win("steps")[1]} bg="none">
        {(() => {
          const steps: [string, string, string, React.ReactNode, number][] = [
            ["heat", tx.heat, "glory_hole", <IconFurnace key="f" s={70} />, 0], ["introduce", tx.air, "olga_blow", <IconBreath key="b" s={70} />, 1.2],
            ["controlling", tx.control, "swing", <IconGravity key="g" s={70} rot={Math.sin(t * 3) * 30} />, 0]];
          const idx = steps.reduce((acc, s2, k) => (t >= at(s2[0]) - 0.35 ? k : acc), 0);
          return (
            <>
              {steps.map(([cue, , clip, , trim]) => (
                <AbsoluteFill key={cue} style={{ opacity: ease(t, at(cue) - 0.45, at(cue) - 0.1) }}><FullClip name={clip} from={at(cue) - 0.45} trim={trim} focusY={clip === "olga_blow" ? "35%" : "50%"} /></AbsoluteFill>
              ))}
              <AbsoluteFill style={{ background: shade }} />
              <Ribbon t={t} t0={win("steps")[0] + 0.1}>{tx.principles}</Ribbon>
              <div style={{ position: "absolute", left: 0, width: VW, top: land ? 220 : 380, display: "flex", justifyContent: "center", gap: 18 }}>
                {steps.map(([cue, l, , ic], k) => {
                  const on = k === idx, done = k < idx, kk = spr(t, at(cue) - 0.35, 12, 200);
                  return (
                    <div key={cue} style={{ width: 290, padding: "16px 10px 12px", textAlign: "center", background: on ? L.parch : "rgba(234,214,174,.25)", border: `3px solid ${on || done ? L.parch : "rgba(234,214,174,.4)"}`, borderRadius: 8, opacity: Math.min(1, kk * 2), scale: `${0.7 + 0.3 * kk}` }}>
                      <div style={{ display: "grid", placeItems: "center" }}>{ic}</div>
                      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 52, color: on ? L.ink : L.cream }}>{k + 1}. {l}</div>
                    </div>
                  );
                })}
              </div>
            </>
          );
        })()}
      </Scene>

      {/* the hands */}
      <Scene t={t} a={win("hands")[0]} b={win("hands")[1]} bg="none">
        <FullClip name="bench_hands" from={win("hands")[0] - 0.3} />
        <AbsoluteFill style={{ background: shade }} />
        <Kinetic t={t} t0={at("ingredient.") - 0.4} top={Y(300)} size={F(72)} italic color={L.gold}>{tx.ingredient}</Kinetic>
        <Kinetic t={t} t0={at("hands") - 0.2} top={Y(420)} size={F(lang === "ru" ? 130 : 150)}>{tx.hands}</Kinetic>
      </Scene>

      {/* Olga Rozin */}
      <Scene t={t} a={win("olga")[0]} b={win("olga")[1]} bg="none">
        <FullClip name="olga_blow" from={win("olga")[0] - 0.2} trim={1.8} rate={0.9} focusY="35%" />
        <AbsoluteFill style={{ background: shade }} />
        <Kinetic t={t} t0={at("olga", 0) - 0.2} top={Y(290)} size={F(130)}>{tx.olga}</Kinetic>
        <Ribbon t={t} t0={at("artist.") - 0.3} top={Y(440)} size={36}>{tx.artist}</Ribbon>
      </Scene>
      <Scene t={t} a={win("montage")[0]} b={win("montage")[1]} bg="none">
        <ArtPan name="montage" t0={win("montage")[0]} t1={win("montage")[1] + 0.3} hold={0} endFocus={land ? undefined : 1250} endScale={land ? undefined : 1.25} />
        <Ribbon t={t} t0={at("thousands", 1) - 0.4} top={Y(1100)}>{tx.thousands}</Ribbon>
      </Scene>
      <Scene t={t} a={win("history")[0]} b={win("history")[1]} bg="none">
        <FullClip name="rose_torch" from={win("history")[0] - 0.2} />
        <AbsoluteFill style={{ opacity: ease(t, at("share") - 0.6, at("share") - 0.1) }}><FullClip name="roses" from={at("share") - 0.6} /></AbsoluteFill>
        <AbsoluteFill style={{ background: shade }} />
      </Scene>

      {/* follow on Instagram */}
      <Scene t={t} a={win("insta")[0]} b={win("insta")[1]} bg="none">
        <Studio from={win("insta")[0]} clip="twist" />
        <div style={{ position: "absolute", left: land ? 150 : 60, right: land ? 150 : 60, top: land ? 50 : 180, display: "grid", gridTemplateColumns: land ? "repeat(6, 1fr)" : "1fr 1fr 1fr", gap: 10, opacity: 0.85 }}>
          {["tumbler", "blue_goblet", "roses", "candles", "goblets", "blue_vessel"].map((n, i) => (
            <div key={n} style={{ position: "relative", aspectRatio: "9 / 16", overflow: "hidden", borderRadius: 6, boxShadow: "0 10px 24px rgba(0,0,0,.5)", ...rise(t, win("insta")[0] + 0.1 + i * 0.07) }}><Clip name={n} from={win("insta")[0]} /></div>
          ))}
        </div>
        <ParchCard t={t} t0={at("follow") - 0.1} y={land ? 600 : 760} w={880} seed="ig">
          <div style={{ display: "flex", alignItems: "center", gap: 26, justifyContent: "center" }}>
            <InstaGlyph s={110} />
            <div>
              <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 44, color: L.inkSoft }}>{tx.followIG}</div>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 84, color: L.ribbon, lineHeight: 1.0, ...rise(t, at("@olga_rozin") - 0.3) }}>@olga_rozin</div>
            </div>
          </div>
        </ParchCard>
      </Scene>

      {/* comments */}
      <Scene t={t} a={win("comments")[0]} b={win("comments")[1]} bg="none">
        <FullClip name="pink_form" from={win("comments")[0] - 0.2} />
        <AbsoluteFill style={{ background: "rgba(10,6,3,.4)" }} />
        <Ribbon t={t} t0={win("comments")[0] + 0.1}>{tx.tellMe}</Ribbon>
        <ParchCard t={t} t0={at("would") - 0.3} y={Y(400)} w={880} seed="cm">
          <div style={{ display: "grid", placeItems: "center", marginBottom: 10 }}><SpeechIcon s={90} /></div>
          <CardTitle size={lang === "ru" ? 80 : 88}><i>{tx.wantLearn}</i></CardTitle>
        </ParchCard>
      </Scene>

      {/* I'd love to hear what you think */}
      <Scene t={t} a={win("end")[0]} b={win("end")[1]} bg="none">
        <FullClip name="tumbler" from={win("end")[0] - 0.3} rate={0.8} />
        <AbsoluteFill style={{ background: shade }} />
        <div style={{ position: "absolute", left: 80, top: Y(330), fontFamily: HAND, fontWeight: 600, fontSize: 132, lineHeight: 1.05, color: L.cream, rotate: "-4deg", textShadow: "0 4px 18px rgba(0,0,0,.7)", clipPath: `inset(0 ${100 - 100 * ease(t, at("hear") - 0.6, at("think", 1) + 0.6)}% 0 0)` }}>
          {tx.love1}<br />{tx.love2}
        </div>
      </Scene>

      {/* OUTRO — Olga says goodbye in her glass-artist outfit, series card */}
      <Scene t={t} a={win("outro")[0]} b={win("outro")[1]} bg="none">
        {WAVE_CLIP ? <FullClip name="olga_wave" from={win("outro")[0]} /> : <ArtPan name="modern" t0={win("outro")[0]} t1={win("outro")[0] + 7} hold={0} endFocus={560} endScale={2.2} />}
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,6,3,.55) 0%, rgba(10,6,3,0) 25%, rgba(10,6,3,0) 45%, rgba(10,6,3,.9) 72%)" }} />
        <Embers t={t} n={50} seed="out" strength={1.0} />
        <div style={{ position: "absolute", left: 90, top: Y(250), fontFamily: HAND, fontWeight: 600, fontSize: 120, color: L.cream, rotate: "-6deg", textShadow: "0 4px 18px rgba(0,0,0,.75)", clipPath: `inset(0 ${100 - 100 * ease(t, win("outro")[0] + 0.3, win("outro")[0] + 1.3)}% 0 0)` }}>{tx.bye}</div>
        <ParchCard t={t} t0={win("outro")[0] + 0.9} y={Y(1020)} w={900} seed="out">
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 30, letterSpacing: 8, color: L.ribbon, textTransform: "uppercase" }}>{tx.seriesEp}</div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 40, color: L.inkSoft, marginTop: 10 }}>{tx.nextTime}</div>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 64, color: L.ink, lineHeight: 1.05 }}>{tx.howMade}</div>
          </div>
        </ParchCard>
        <div style={{ position: "absolute", left: 0, width: VW, top: Y(1420), textAlign: "center", ...rise(t, win("outro")[0] + 1.6) }}>
          {(() => {
            const o0 = win("outro")[0];
            const press = spr(t, o0 + 2.9, 10, 260), tap = Math.min(1, spr(t, o0 + 2.7) * 1.5);
            const sc = 1 - 0.08 * Math.max(0, Math.sin(Math.min(1, Math.max(0, t - (o0 + 2.7)) / 0.35) * Math.PI));
            return (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 20, padding: "18px 40px 18px 22px", borderRadius: 80, background: press > 0.5 ? "rgba(20,12,6,.85)" : L.ribbon, border: `3px solid ${L.parch}`, scale: `${sc}`, boxShadow: `0 0 ${36 * tap}px rgba(255,140,40,.45)` }}>
                <InstaGlyph s={72} />
                <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 56, color: L.cream }}>{press > 0.5 ? tx.following : tx.followBtn}</span>
              </div>
            );
          })()}
        </div>
      </Scene>

      {/* chapter stings */}
      <ChapterWipe t={t} t0={HOOK - 0.7} n={1} title={tx.ch1} label={tx.chapter} />
      <ChapterWipe t={t} t0={c.then - 0.85} n={2} title={tx.ch2} label={tx.chapter} oy={0.4} />
      <ChapterWipe t={t} t0={c.rome - 0.85} n={3} title={tx.ch3} label={tx.chapter} oy={0.45} />
      <ChapterWipe t={t} t0={c.modern - 0.85} n={4} title={tx.ch4} label={tx.chapter} oy={0.55} />

      <Captions t={t} lines={tm.lines} />

      {VO_LABEL.startsWith("SCRATCH") ? (
        <div style={{ position: "absolute", left: 0, width: VW, top: Y(1560), textAlign: "center" }}>
          <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 24, color: "rgba(255,255,255,.85)", background: "rgba(160,30,30,.8)", padding: "6px 14px", borderRadius: 8 }}>DRAFT · scratch voice, not Olga</span>
        </div>
      ) : null}
      <Sequence from={Math.round(HOOK * GFPS)} layout="none"><Audio src={staticFile(tm.vo)} /></Sequence>
    </AbsoluteFill>
  );
};
