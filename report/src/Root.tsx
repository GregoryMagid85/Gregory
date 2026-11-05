import React from "react";
import { Composition, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import { Report, DURATION_S } from "./Report";
import { FPS } from "./ui";

const fonts = Promise.all([
  ...[500, 600, 700, 800, 900].map((w) => loadFont({ family: "Inter", url: staticFile(`fonts/inter-latin-${w}-normal.woff2`), weight: String(w) })),
  loadFont({ family: "JetBrains Mono", url: staticFile("fonts/jetbrains-mono-latin-600-normal.woff2"), weight: "600" }),
]);

export const RemotionRoot: React.FC = () => (
  <Composition
    id="WeeklyReport"
    component={Report}
    durationInFrames={Math.round(DURATION_S * FPS)}
    fps={FPS}
    width={1920}
    height={1080}
    calculateMetadata={async () => { await fonts; return {}; }}
  />
);
