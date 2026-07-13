#!/usr/bin/env bash
#
# Convert a screen/browser recording (webm/mp4/mov/mkv) into an optimized GIF
# for embedding in README.md or docs.
#
# Requires: ffmpeg (https://ffmpeg.org)
#   macOS:  brew install ffmpeg
#   Ubuntu/Debian: sudo apt install ffmpeg
#
# Usage:
#   scripts/demo-recording/convert-to-gif.sh <input-video> [output.gif] [options]
#
# Options:
#   -w, --width <px>     Output width in pixels, height auto-scaled (default: 900)
#   -f, --fps <n>         Frames per second (default: 12)
#   -s, --start <time>    Start offset, ffmpeg time syntax e.g. 00:00:03 (default: 0)
#   -d, --duration <time> Duration to encode, ffmpeg time syntax e.g. 00:00:10 (default: full)
#   -h, --help            Show this help
#
# Example:
#   ./convert-to-gif.sh recordings/<the-file>.webm unicis-demo.gif -w 960 -f 12

set -euo pipefail

usage() {
  sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'
}

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "Error: ffmpeg is not installed. Install it first (e.g. 'brew install ffmpeg')." >&2
  exit 1
fi

if [[ $# -eq 0 || "$1" == "-h" || "$1" == "--help" ]]; then
  usage
  exit 0
fi

INPUT="$1"
shift

if [[ ! -f "$INPUT" ]]; then
  echo "Error: input file not found: $INPUT" >&2
  exit 1
fi

OUTPUT="${INPUT%.*}.gif"
if [[ $# -gt 0 && "$1" != -* ]]; then
  OUTPUT="$1"
  shift
fi

WIDTH=900
FPS=12
START=""
DURATION=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -w|--width) WIDTH="$2"; shift 2 ;;
    -f|--fps) FPS="$2"; shift 2 ;;
    -s|--start) START="$2"; shift 2 ;;
    -d|--duration) DURATION="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
  esac
done

PALETTE_DIR="$(mktemp -d)"
PALETTE="$PALETTE_DIR/palette.png"
trap 'rm -rf "$PALETTE_DIR"' EXIT

TIME_ARGS=()
[[ -n "$START" ]] && TIME_ARGS+=(-ss "$START")
[[ -n "$DURATION" ]] && TIME_ARGS+=(-t "$DURATION")

FILTERS="fps=${FPS},scale=${WIDTH}:-1:flags=lanczos"

echo "Generating palette..."
ffmpeg -y ${TIME_ARGS[@]+"${TIME_ARGS[@]}"} -i "$INPUT" -vf "${FILTERS},palettegen=stats_mode=diff" "$PALETTE"

echo "Encoding GIF -> $OUTPUT"
ffmpeg -y ${TIME_ARGS[@]+"${TIME_ARGS[@]}"} -i "$INPUT" -i "$PALETTE" \
  -lavfi "${FILTERS} [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle" \
  "$OUTPUT"

SIZE="$(du -h "$OUTPUT" | cut -f1)"
echo "Done: $OUTPUT ($SIZE)"
