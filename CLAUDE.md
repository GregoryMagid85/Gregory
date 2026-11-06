# Project notes

## Video work: use HyperFrames
For any video work in this repo (new episodes, edits, captions, renders), use the HyperFrames skills in
`.claude/skills/` (HeyGen's open-source HTML-to-video toolkit, Apache-2.0, vendored from
github.com/heygen-com/hyperframes @ 410a516, CLI 0.9.19). Start with the `hyperframes` skill.

- Glass Stories Ep. 1 was built in Remotion (`report/`). Port it with `remotion-to-hyperframes` when it needs
  edits; new episodes go straight to HyperFrames, using `style-sampling` / the series look from Ep. 1.
- Glass Stories look is now "The Glassmaker's Codex" (aged papyrus, sepia ink, red rubric, era portraits as 3D leaves,
  molten wipes, embers) — template `glass-ep1/`, see `video-house-style`. Earlier series look: red ribbons, torn parchment cards, cream serif (Cormorant Garamond) with furnace glow, orange-on-black
  word-by-word captions, molten-glass chapter wipes, embers; era music + ambience + SFX under the voice
  (music ~23 dB below speech). Formats: 9:16 and 16:9, 60-second cuts, EN and RU.
- Review in the live preview first; render the final files only after approval.
