#!/usr/bin/env bash
# Mix the Gregory .1 narration over the ducked music bed (tools/mix.py) and mux onto the render.
# usage (from report/): tools/mix_and_mux.sh [vo.mp3]   -> out/WeeklyReport.mp4
set -euo pipefail
VO=${1:-public/audio/vo.mp3}
python3 tools/mix.py "$VO" public/audio/music.mp3 80 out/mix.wav
ffmpeg -v error -y -i out/video_muted.mp4 -i out/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out/WeeklyReport.mp4
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height -of compact out/WeeklyReport.mp4
