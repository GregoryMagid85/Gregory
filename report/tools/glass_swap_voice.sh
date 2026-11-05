#!/usr/bin/env bash
# Swap in Olga's real narration and re-sync the whole glassblowing video to it.
# usage (from report/): tools/glass_swap_voice.sh path/to/olga_take.(mp3|wav|m4a)
# Needs a faster-whisper venv + the Whisper "small" CTranslate2 model (WHISPER_PY, WHISPER_MODEL).
set -euo pipefail
IN=${1:?audio file}
WHISPER_PY=${WHISPER_PY:?set to the faster-whisper venv python}
WHISPER_MODEL=${WHISPER_MODEL:?set to the whisper model dir}
TX=${TX:-tools/whisper_tx.py}
mkdir -p glass_vo
ffmpeg -v error -y -i "$IN" -af "highpass=f=80,acompressor=threshold=-22dB:ratio=3:attack=8:release=120:makeup=2,loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 public/glass/vo.wav
ffmpeg -v error -y -i public/glass/vo.wav -ac 1 -ar 16000 -f f32le glass_vo/olga16k.f32
"$WHISPER_PY" -I "$TX" "$WHISPER_MODEL" glass_vo/olga16k.f32 glass_vo/olga_words.json "Glassblowing, Syro-Palestinian, BCE, blowpipe, Olga Rozin, olga_rozin."
python3 tools/glass_words.py glass_vo/olga_words.json "Olga Rozin narration"
npx tsc --noEmit
npx remotion render GlassHistory out/glass_video_muted.mp4 --muted --concurrency=4 --log=error
ffmpeg -v error -y -i out/glass_video_muted.mp4 -i public/glass/vo.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out/GlassHistory.mp4
ffprobe -v error -show_entries format=duration:stream=codec_name -of compact out/GlassHistory.mp4
