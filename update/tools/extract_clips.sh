#!/usr/bin/env bash
# Re-create the muted frame sequences used by film.js from the original recordings.
# usage: tools/extract_clips.sh <dir with the 4 source mp4s>   (run from update/)
set -euo pipefail
S=${1:?source dir}
mkdir -p assets/clips/{evo,lab,hatch,rive}
ffmpeg -v error -y -i "$S"/*Screenrecorder*.mp4 -an -vf "crop=1220:1240:0:110,scale=640:-2,fps=24" -q:v 3 assets/clips/evo/%04d.jpg      # Stage 4 -> 5 evolution (in app)
ffmpeg -v error -y -i "$S"/*VID_20261105_081535*.mp4 -an -vf "crop=864:1780:0:60,scale=480:-2,fps=24" -q:v 3 assets/clips/lab/%04d.jpg  # Rive Lab
ffmpeg -v error -y -ss 29 -t 21 -i "$S"/*hatttched*.mp4 -an -vf "fps=24,crop=760:680:456:136,scale=720:-2" -q:v 3 assets/clips/hatch/%04d.jpg  # Stage 2 care loop
ffmpeg -v error -y -ss 44 -t 6 -i "$S"/*hatttched*.mp4 -an -vf "fps=24,scale=1440:-2" -q:v 3 assets/clips/rive/%04d.jpg               # Rive editor
