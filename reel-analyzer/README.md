# Reel Analyzer

Analyze a downloaded Instagram Reel with the Claude API. It samples frames with FFmpeg, optionally transcribes the audio, and asks Claude for a structured report: summary, hook, key ideas, on-screen text, products and tools, actionable insights, and caveats.

Claude accepts images but not audio or video, so the pipeline sends frames as images and treats the transcript as a separate text input.

## Setup

```bash
cd reel-analyzer
pip install -r requirements.txt
pip install faster-whisper   # optional, for local transcription
export ANTHROPIC_API_KEY=...
```

FFmpeg and ffprobe must be on your `PATH`.

## Usage

```bash
# Frames + local transcription
python cli.py reel.mp4

# Frames only (no speech-to-text dependency)
python cli.py reel.mp4 --no-transcript

# Bring your own transcript, more frames, raw JSON out
python cli.py reel.mp4 --transcript transcript.txt --frames 20 --json

# Browser UI
streamlit run app.py
```

## Notes

- Default model is `claude-opus-5-5` with adaptive thinking; change it with `--model`.
- Frames are evenly spaced samples, so quick cuts and small text between samples can be missed. Raise `--frames` when that matters; cost grows with the frame count.
- Reels without an audio track skip transcription automatically.
- Only analyze videos you have permission to use.

## Tests

```bash
python -m pytest test_analyzer.py
```

The tests use a fake Claude client. The frame-extraction tests generate a sample video with FFmpeg and are skipped if it is unavailable.
