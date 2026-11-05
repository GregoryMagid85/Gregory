import React from "react";
import { Composition, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import { Report, DURATION_S } from "./Report";
import { FPS } from "./ui";
import { Glass, GLASS_DURATION, GFPS } from "./glass/Glass";
import { GlassV2, GLASS_V2_DURATION } from "./glass/GlassV2";

const fonts = Promise.all([
  ...[500, 600, 700, 800, 900].map((w) => loadFont({ family: "Inter", url: staticFile(`fonts/inter-latin-${w}-normal.woff2`), weight: String(w) })),
  ...[500, 600, 700].map((w) => loadFont({ family: "Cormorant Garamond", url: staticFile(`fonts/cormorant-garamond-latin-${w}-normal.woff2`), weight: String(w) })),
  loadFont({ family: "Cormorant Garamond", url: staticFile("fonts/cormorant-garamond-latin-500-italic.woff2"), weight: "500", style: "italic" }),
  loadFont({ family: "Caveat", url: staticFile("fonts/caveat-latin-600-normal.woff2"), weight: "600" }),
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
