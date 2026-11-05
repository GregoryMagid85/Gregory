#!/usr/bin/env bash
# Mix the Gregory .1 narration over the music bed (ducked) and mux onto the rendered video.
# usage (from report/): tools/mix_and_mux.sh [vo.mp3]   -> out/WeeklyReport.mp4
set -euo pipefail
VO=${1:-public/audio/vo.mp3}
DUR=80
ffmpeg -v error -y -i "$VO" -i public/audio/music.mp3 -filter_complex "
 [0:a]aresample=48000,aformat=channel_layouts=stereo,apad=whole_dur=$DUR,atrim=0:$DUR,volume=1.0[vo];
 [1:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:$DUR,volume=0.32,afade=t=in:st=0:d=1,afade=t=out:st=$(echo "$DUR-3" | bc):d=3[mu];
 [vo]asplit=2[v1][key];
 [mu][key]sidechaincompress=threshold=0.03:ratio=5:attack=15:release=350[mud];
 [v1][mud]amix=inputs=2:normalize=0,loudnorm=I=-15:TP=-1.5:LRA=11[out]" -map "[out]" -c:a aac -b:a 192k out/mix.m4a
ffmpeg -v error -y -i out/video_muted.mp4 -i out/mix.m4a -map 0:v -map 1:a -c:v copy -c:a copy -shortest out/WeeklyReport.mp4
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height -of compact out/WeeklyReport.mp4
