import React from "react";
import { Composition, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import { Report, DURATION_S } from "./Report";
import { FPS } from "./ui";
import { Glass, GLASS_DURATION, GFPS } from "./glass/Glass";
import { GlassV2, GLASS_V2_DURATION, GLASS_V2_RU_DURATION } from "./glass/GlassV2";
import { GlassShort, shortDuration } from "./glass/GlassShort";

const fonts = Promise.all([
  ...[500, 600, 700, 800, 900].map((w) => loadFont({ family: "Inter", url: staticFile(`fonts/inter-latin-${w}-normal.woff2`), weight: String(w) })),
  ...[500, 600, 700].map((w) => loadFont({ family: "Cormorant Garamond", url: staticFile(`fonts/cormorant-garamond-latin-${w}-normal.woff2`), weight: String(w) })),
  loadFont({ family: "Cormorant Garamond", url: staticFile("fonts/cormorant-garamond-latin-500-italic.woff2"), weight: "500", style: "italic" }),
  loadFont({ family: "Caveat", url: staticFile("fonts/caveat-latin-600-normal.woff2"), weight: "600" }),
  loadFont({ family: "Inter Cyr", url: staticFile("fonts/inter-cyrillic-800-normal.woff2"), weight: "800" }),
  ...[500, 600, 700].map((w) => loadFont({ family: "Cormorant Cyr", url: staticFile(`fonts/cormorant-garamond-cyrillic-${w}-normal.woff2`), weight: String(w) })),
  loadFont({ family: "Cormorant Cyr", url: staticFile("fonts/cormorant-garamond-cyrillic-500-italic.woff2"), weight: "500", style: "italic" }),
  loadFont({ family: "Caveat Cyr", url: staticFile("fonts/caveat-cyrillic-600-normal.woff2"), weight: "600" }),
  loadFont({ family: "JetBrains Mono", url: staticFile("fonts/jetbrains-mono-latin-600-normal.woff2"), weight: "600" }),
]);

export const RemotionRoot: React.FC = () => (
  <>
  <Composition
    id="GlassStoriesVertical"
    component={GlassV2}
    durationInFrames={Math.round(GLASS_V2_DURATION * GFPS)}
    fps={GFPS}
    width={1080}
    height={1920}
    calculateMetadata={async () => { await fonts; return {}; }}
  />
  <Composition
    id="GlassStoriesVerticalRU"
    component={GlassV2}
    defaultProps={{ lang: "ru" as const }}
    durationInFrames={Math.round(GLASS_V2_RU_DURATION * GFPS)}
    fps={GFPS}
    width={1080}
    height={1920}
    calculateMetadata={async () => { await fonts; return {}; }}
  />
  <Composition
    id="GlassStoriesHorizontal"
    component={GlassV2}
    defaultProps={{ lang: "en" as const }}
    durationInFrames={Math.round(GLASS_V2_DURATION * GFPS)}
    fps={GFPS}
    width={1920}
    height={1080}
    calculateMetadata={async () => { await fonts; return {}; }}
  />
  <Composition
    id="GlassStoriesHorizontalRU"
    component={GlassV2}
    defaultProps={{ lang: "ru" as const }}
    durationInFrames={Math.round(GLASS_V2_RU_DURATION * GFPS)}
    fps={GFPS}
    width={1920}
    height={1080}
    calculateMetadata={async () => { await fonts; return {}; }}
  />
  <Composition
    id="GlassStoriesShortEN"
    component={GlassShort}
    defaultProps={{ lang: "en" as const }}
    durationInFrames={shortDuration("en")}
    fps={GFPS}
    width={1080}
    height={1920}
    calculateMetadata={async () => { await fonts; return {}; }}
  />
  <Composition
    id="GlassStoriesShortRU"
    component={GlassShort}
    defaultProps={{ lang: "ru" as const }}
    durationInFrames={shortDuration("ru")}
    fps={GFPS}
    width={1080}
    height={1920}
    calculateMetadata={async () => { await fonts; return {}; }}
  />
  <Composition
    id="GlassHistory"
    component={Glass}
    durationInFrames={Math.round(GLASS_DURATION * GFPS)}
    fps={GFPS}
    width={1920}
    height={1080}
    calculateMetadata={async () => { await fonts; return {}; }}
  />
  <Composition
    id="WeeklyReport"
    component={Report}
    durationInFrames={Math.round(DURATION_S * FPS)}
    fps={FPS}
    width={1920}
    height={1080}
    calculateMetadata={async () => { await fonts; return {}; }}
  />
  </>
);
