#!/usr/bin/env bash
# Replace frames A..B of a finished video with a freshly rendered patch, and lay a new audio mix under it.
# usage: tools/splice.sh final.mp4 patch.mp4 A B mix.wav     (low memory: pieces are encoded separately, then joined)
set -euo pipefail
F=$1; P=$2; A=$3; B=$4; MIX=$5; T=$(mktemp -d)
enc="-c:v libx264 -crf 21 -preset medium -pix_fmt yuv420p -r 30 -an"
ffmpeg -v error -y -i "$F" -vf "trim=end_frame=$A,setpts=PTS-STARTPTS" $enc "$T/a.mp4"
ffmpeg -v error -y -i "$P" -vf "setpts=PTS-STARTPTS" $enc "$T/b.mp4"
ffmpeg -v error -y -i "$F" -vf "trim=start_frame=$((B+1)),setpts=PTS-STARTPTS" $enc "$T/c.mp4"
printf "file '%s'\nfile '%s'\nfile '%s'\n" "$T/a.mp4" "$T/b.mp4" "$T/c.mp4" > "$T/list.txt"
ffmpeg -v error -y -f concat -safe 0 -i "$T/list.txt" -i "$MIX" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$T/out.mp4"
mv "$T/out.mp4" "$F"; rm -rf "$T"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$F"
