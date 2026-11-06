# REVIEW — Glass Stories Ep. 1, HyperFrames rebuild ("The Glassmaker's Codex")

1920×1080, 30 fps, 138.1 s. Olga's own English narration; her studio reels; the series era art and clay-core
infographic; the OR monogram.

## v4 (feedback: "nothing is aligned", best design practice, kinetic typography)
- Grid: 120 px side margins, 100 px top, nothing but captions below y 840; one footage-window size (500 x 890).
- Every shot is a Shot on its own 1920 x 1080 cell; elements are placed in screen px and converted to world, so
  all shots share margins and a cut can never show a neighbour. Framings clear their own elements on the next cut.
- Layouts: A footage right + text column, B mirror, C object centred with title above and note below, D plate
  (1280 x 720) or map with a cartouche, type-only (the 2,000+ counter).
- Type scale: display 150 / title 96 / secondary 64 / label 40 / kicker 30 (tracked caps, bronze on paper, gold on dark).
- Kinetic typography engine: every word lands on the narration word it names; rise (mask) for statements, slam for
  claims, typed-on for notes; the stressed word is rubricated and gets a hit.

## v3 (feedback: drawings too simple / not visible, more 3D, use Olga's own footage, many clean cuts)
- Editing is now cut-based: every station change is a hard cut on the spoken word, then a slow push-in
  (1.4 %/s); punch-in cuts inside stations (rare luxury, Mesopotamia, Egypt, slow, gather, faster, thinner,
  shapes); only the timeline dot still flies (the dive into the furnace).
- Seven full-frame cutaways to Olga herself between the graphics ("But there was a problem", "You see",
  "A rather laborious process", "Think about what that meant", "particularly fascinating", "one more
  ingredient"), each with its line in big type.
- Olga on camera everywhere: hook (8 cuts), furnace, her own breath (match cut), Heat/Air stations, her intro,
  her pieces, and the goodbye in her glass costume (Glass Fashion Show reel). New clips are cut from her reels
  in assets/clips/olga_*.mp4. One reel (olga_close) was left out: profanity on the T-shirt.
- Line sketches replaced by real 3D objects (three.js turntables, tools3d/): core-formed amphoriskos, clay core
  with a cobalt trail, glass beads, blowpipe with a glowing gather, Roman flask, hourglass, a family of blown
  vessels. Ink is darker and thicker; labels carry a paper halo so they read on the papyrus.

## Restyle (v2, after feedback "no blue PowerPoint look, make it historic and premium")
- The blueprint became an aged papyrus manuscript: sepia ink, red rubric, gold titles, burnt vignette, IM Fell
  annotations. Same timing, camera and narration cues.
- The GPT era portraits are the heroes: cream-mounted leaves flipping in in 3D with red ribbon cartouches
  (Mesopotamia c. 2500 BCE, Egypt c. 1500 BCE, The Levant c. 50 BCE, Rome 1st c. CE, Today), with ink sketches
  around them (beads, an amphoriskos, compass roses, wax-seal pins, an old-map style coastline).
- Molten-glass wipes between chapters, embers on the sting / furnace / end card; the 3D bubble now refracts a
  manuscript page of vessel studies; Olga's OR sits on a gold-rimmed dark plaque.
- Series template: the opener and end card read `EP = dict(n, title)` in build.py, so the next episode keeps
  the same sting.

## Creative calls (v1)
- **One continuous take across a cyanotype blueprint.** Each chapter is one huge drafting sheet, and the camera
  never cuts inside it. It travels between stations (eased power2.inOut, with a slow drift while you read), and the
  technical sketches draw themselves in time with the words.
- **The camera dives into the drawing and it becomes real.** The timeline's "1st c. BCE" dot dives into the
  furnace footage. The blowpipe sketch match-cuts to Olga blowing. Her breath becomes a 3D glass bubble
  inflating over the blueprint (three.js).
- **Kinetic type on the beat.** The cold open cuts Olga's footage on the music
  ("ONE BREATH. / ONE IDEA. / 2,000 YEARS OF GLASS.").
- **The OR logo appears only where it means something:**
  - the sting after the hook, with a chrome shine pass;
  - when Olga is introduced ("Olga Rozin / Glass artist");
  - the end card.
  It is never docked in a corner.
- **Olga's footage** appears in torn-edge iris "windows" cut into the sheet: the hook, the luxury objects, the
  furnace, the blowing, the Heat/Air/Control stations, the hands, her pieces, and her goodbye.
- **Captions:** every spoken word, orange on a black box, word by word.
- **Sound:**
  - ElevenLabs music in four eras, crossfaded at the chapter changes: hook riser → ancient oud/drone → Roman
    lyre → modern.
  - Furnace and wind ambience beds.
  - SFX on every visible action: whooshes on camera travel, pencil on sketches, paper on plates, pins,
    sizzle on hot glass, breath, shimmer on the logo.
  - Measured levels: voice −16 LUFS; music about 21 dB under speech; ambience about 33 dB under; SFX peaks
    −20 dBFS; final mix −16.2 LUFS.
- No Epidemic Sound connector exists in the MCP registry, so the sound was generated with ElevenLabs.

## The other storylines (not built)
- **B — Through the Bubble:** an endless zoom through glass bubbles from era to era.
- **C — Two Hands, 2,000 Years:** a split screen of ancient vs Olga that merges on "the hands of the glassmaker".

## Measured vs not heard
- `hyperframes check`: ok. Remaining warnings are the composition-size and escaped-container notes, plus one
  label held 0.99 s ("through the blowpipe").
- The frames were reviewed on contact sheets at every QA time in SPEC.md.
- The mix was measured numerically, not listened to by ear. Please judge the SFX density and the music level in
  the preview.

## Weakest shot
- The question station near 124 s: its speech-bubble icon is still drawing while the camera arrives.
- Second weakest: the 0.99 s "through the blowpipe" label.
