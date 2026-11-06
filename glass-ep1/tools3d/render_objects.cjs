// Render each 3D object as a 48-frame turntable sprite sheet (8 x 6, transparent WebP) into assets/obj/.
//   python3 -m http.server 8765 (in glass-ep1) &  node tools3d/render_objects.cjs [names...]
const { chromium } = require("playwright");
const fs = require("fs");
const names = process.argv.slice(2).length ? process.argv.slice(2) : ["amphoriskos", "claycore", "beads", "blowpipe", "flask", "hourglass", "vessels"];
(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  fs.mkdirSync("tools3d/frames", { recursive: true });
  for (const name of names) {
    const page = await browser.newPage({ viewport: { width: 640, height: 640 } });
    page.on("pageerror", (e) => console.log(name, "ERR", e.message));
    await page.goto("http://localhost:8765/tools3d/objects.html");
    await page.waitForFunction(() => window.ready === true);
    await page.evaluate((n) => window.setup(n), name);
    const N = 48;
    for (let k = 0; k < N; k++) {
      const url = await page.evaluate(([k, N]) => window.frame(k, N), [k, N]);
      fs.writeFileSync(`tools3d/frames/${name}_${String(k).padStart(2, "0")}.png`, Buffer.from(url.split(",")[1], "base64"));
    }
    console.log(name, "done"); await page.close();
  }
  await browser.close();
})();
