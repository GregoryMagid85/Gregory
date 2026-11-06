---
name: video-house-style
description: Gregory's house rules for every video, explainer, reel, short or animation he asks for - which tool to use (HyperFrames), the motion-graphics explainer style he likes, captions, sound mix, formats, language versions and how to review before rendering. Use together with the hyperframes skill whenever a video is requested.
---

# Video house style

Apply these on every video request unless the person says otherwise in that chat.

## Tool
- Build videos with **HyperFrames** (HeyGen, HTML rendered to video): read the `hyperframes` skill first,
  then `hyperframes-registry` before hand-building any effect, `media-use` for music/SFX/voice/transcripts,
  `style-sampling` for a new episode of an existing series. Remotion only if explicitly asked.

## Style he likes
- **Motion-graphics explainer hybrid:** real footage of the person/product + illustrated or generated art +
  animated diagrams, maps and icons. Something new on screen every 2-4 seconds; every visual matches the word
  being spoken.
- **Explain visually:** turn each idea into a picture (step-by-step diagram, map with routes, timeline,
  counter, before/after), not text on a slide. Prefer a real image or infographic he supplies over a drawing.
- **Static images always move:** slow pan left-to-right while zooming out over time, so more of the image is
  revealed and any text card ends fully readable. Infographics get a guided camera that moves to each part
  on the word that names it.
- **One consistent design system per series:** few overlay types used everywhere (e.g. ribbon label, card,
  big kinetic word), one palette, one display face + one UI face. No mixed styles between scenes.
- Strong **hook** in the first 3-5 s (fast cuts + kinetic words), a **title sting**, chapter transitions,
  and a branded **outro** (goodbye from the presenter, follow CTA, "next episode" tease).

## Signature techniques (use all of them, every video - "go all out")
- **Kinetic typography** (טיפוגרפיה קינטית): key words animate in on the spoken word - slams, per-letter
  reveals, scale/blur pops, words that move with the camera. Not just static titles.
- **Technical sketch** (שרטוט טכני): ink drawings that draw themselves line by line on the series' own paper
  (aged papyrus / manuscript for history - never a flat blue "PowerPoint" blueprint unless asked) -
  measurements, arrows, labels, exploded views - for any process or tool being explained.
- **3D elements** (אלמנטים בתלת ממד): real 3D objects or 2.5D parallax layers with depth, lighting and
  shadows (registry 3D blocks / three.js); rotate or orbit the object while explaining it.
- **Continuous camera movement** (תנועת מצלמה רציפה): a "one-shot" feel - the camera travels from one
  idea to the next on one big canvas instead of hard cutting; scenes connect through the move.
- **Cinematic finish** (גימור קולנועי): grade, light wraps, vignette, film grain, depth of field, atmospheric
  particles, rich backgrounds - never a flat empty background (apply through `media-treatment`).
- **Match cuts**: a shape, motion or composition carries across the cut (e.g. ancient glassblower's breath
  -> Olga blowing today; a circle -> a bubble).
- **Beat-synced**: cuts, pops and kinetic words land on the music's beat grid (and on narration words).
- **Go all out**: full effort on every scene - no placeholder visuals, no repeated layouts, something new
  every 2-4 seconds.

## How to brief and start a video
When he asks for a video, make sure these five are set (ask once for what's missing, offer defaults):
1. **Style** (motion graphics / cinematic / explainer hybrid).
2. **Message, goal and audience**.
3. **Techniques** above (default: all of them).
4. **Audio**: narration (his ElevenLabs voice or a supplied recording; Azure Speech is an alternative TTS),
   music, SFX.
5. **Script first**: write the script (and storyboard) for his approval before building or rendering.

## Captions
- Every spoken word captioned, appearing **word by word**, **orange text on a black rounded box**, timed from
  the narration's word timestamps. Never cover faces or the key visual; keep inside title-safe and clear of
  platform buttons on vertical.

## Sound
- Narration always clear and on top (about -16 LUFS). Music is a bed **~20-25 dB under the voice while
  speaking**, lifting a little in pauses (ducking, like a sound engineer). Music matches the era/mood of each
  section. Ambience under scenes. **SFX on every on-screen move** (pans, cards, wipes, pops), kept well under
  the voice. Remove original audio from supplied clips unless asked.

## Voice
- Use his ElevenLabs voices when asked (e.g. his clone "Gregory .1"); for someone else speaking in first
  person, use their own recording or a consented clone - never pass off a library voice as them.
- Language versions: same visuals and sound design, re-timed to the new voice-over, captions and on-screen
  text translated. Tighten slow reads (cap long pauses, up to ~6% faster, pitch kept).

## Series: Glass Stories (Olga Rozin, @olga_rozin)
A web series: each episode takes one topic from the glass world (history, how glass is made, techniques...),
always with the same opener and end card so episodes read as one show. Template: `glass-ep1/` (`build.py`,
`EP = dict(n=..., title=...)` drives the sting and end card). Look - "The Glassmaker's Codex":
- Premium and historic, never a cheap slideshow: aged papyrus world (`assets/art/papyrus.jpg`) with burnt
  vignette, iron-gall sepia ink, red rubric for the key word, gold for series titles.
- Type: Suez One (display - Latin drawn like Hebrew block letters: ancient, Hebrew-like, still readable) +
  Frank Ruhl Libre (secondary lines, labels, ribbons); captions stay orange-on-black Inter.
- His GPT era portraits (Olga as Mesopotamian / Egyptian / Levantine / Roman / modern glassblower) are the
  heroes: mounted as cream-bordered leaves that flip in in 3D, red ribbon cartouche (place + date), pan +
  zoom-out, with relevant ink sketches around them (beads, vessels, maps, compass rose, wax-seal pins).
- Olga's footage in cream photo mounts; molten-glass chapter wipes; embers on the sting, furnace and end card.
- Opener: hook cut on the beat over her footage + kinetic words -> silver OR monogram on dark with embers ->
  "GLASS STORIES · EPISODE n" + title in cream with furnace glow. End card: Olga + OR + next-episode tease.
- English first; other languages only when he asks.

## Formats
- Deliver 9:16 (TikTok/Reels/Shorts) and 16:9 (YouTube) from one project; full episode plus a ~60 s cut
  (he asked for the 60 s cuts in 16:9). Name files by series, episode, format and language.

## Workflow
- Storyboard first (beat, narration line, on-screen, motion, sound) and get his OK.
- Review in the live preview or quick drafts; **render final files only after approval** - full renders are
  slow, so never use them as the review step. Patch changed scenes instead of re-rendering everything.
- Check facts and dates in supplied images/scripts and flag errors before publishing.
- Send finished files as soon as each is ready.
