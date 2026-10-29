"""Command line entry point: python cli.py reel.mp4"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from analyzer import (
    DEFAULT_MAX_FRAMES,
    DEFAULT_MODEL,
    AnalyzerError,
    analyze_video,
    render_markdown,
)


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="Analyze a downloaded Instagram Reel with Claude.")
    p.add_argument("video", type=Path)
    p.add_argument("--frames", type=int, default=DEFAULT_MAX_FRAMES, help="frames to sample")
    p.add_argument("--model", default=DEFAULT_MODEL)
    p.add_argument("--whisper-model", default="base", help="faster-whisper model size")
    group = p.add_mutually_exclusive_group()
    group.add_argument("--transcript", type=Path, help="use this transcript file instead of transcribing")
    group.add_argument("--no-transcript", action="store_true", help="analyze frames only")
    p.add_argument("--json", action="store_true", help="print raw JSON instead of markdown")
    args = p.parse_args(argv)

    if not args.video.is_file():
        print(f"error: {args.video} not found", file=sys.stderr)
        return 2
    transcript = args.transcript.read_text(encoding="utf-8") if args.transcript else None
    try:
        result = analyze_video(
            args.video,
            max_frames=args.frames,
            transcript=transcript,
            transcribe_audio=not args.no_transcript,
            whisper_model=args.whisper_model,
            model=args.model,
        )
    except AnalyzerError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    print(json.dumps(result.report, indent=2) if args.json else render_markdown(result))
    return 0


if __name__ == "__main__":
    sys.exit(main())
