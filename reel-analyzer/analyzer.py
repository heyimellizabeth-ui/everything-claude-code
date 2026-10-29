"""Core pipeline: video -> frames + transcript -> structured Claude analysis."""

from __future__ import annotations

import base64
import json
import subprocess
import tempfile
from dataclasses import dataclass, field
from pathlib import Path

import anthropic

DEFAULT_MODEL = "claude-opus-5-5"
DEFAULT_MAX_FRAMES = 12

SYSTEM_PROMPT = (
    "You analyze short-form videos (Instagram Reels). You receive sampled "
    "frames in chronological order, each labelled with its timestamp, and "
    "optionally a transcript of the spoken audio. Separate what is directly "
    "observable (speech, on-screen text, visuals) from your inferences. Do "
    "not invent details that are not in the frames or transcript; frames are "
    "samples, so quick cuts between them may be missed. If the transcript is "
    "missing or unclear, say so."
)

USER_PROMPT = (
    "Analyze this Reel. Reply with a single JSON object, no prose around it, "
    "with exactly these keys:\n"
    '  "summary": string - what the Reel is about\n'
    '  "hook": string - how the first seconds grab attention\n'
    '  "key_ideas": array of strings - main lessons or claims\n'
    '  "on_screen_text": array of strings - important text shown in frames\n'
    '  "products_tools": array of strings - anything mentioned or shown\n'
    '  "actionable_insights": array of strings - what a viewer could apply\n'
    '  "caveats": array of strings - unclear speech, uncertain claims, '
    "missing context, things the frames may have missed"
)


class AnalyzerError(RuntimeError):
    """Raised for user-fixable problems (missing ffmpeg, bad video, ...)."""


@dataclass
class Frame:
    timestamp: float
    jpeg: bytes


@dataclass
class Analysis:
    report: dict
    transcript: str = ""
    frames: list[Frame] = field(default_factory=list)


def _run(cmd: list[str]) -> subprocess.CompletedProcess:
    try:
        return subprocess.run(cmd, check=True, capture_output=True, text=True)
    except FileNotFoundError as exc:
        raise AnalyzerError(f"{cmd[0]} not found; install FFmpeg first") from exc
    except subprocess.CalledProcessError as exc:
        raise AnalyzerError(f"{cmd[0]} failed: {exc.stderr.strip()[-500:]}") from exc


def probe_duration(video: Path) -> float:
    out = _run(
        [
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1", str(video),
        ]
    ).stdout.strip()
    try:
        return float(out)
    except ValueError as exc:
        raise AnalyzerError(f"could not read duration of {video}") from exc


def extract_frames(video: Path, max_frames: int = DEFAULT_MAX_FRAMES) -> list[Frame]:
    """Sample up to max_frames evenly spaced frames (each at the middle of its slice)."""
    duration = probe_duration(video)
    if duration <= 0:
        raise AnalyzerError("video has no duration")
    count = max(1, max_frames)
    step = duration / count
    frames: list[Frame] = []
    with tempfile.TemporaryDirectory() as tmp:
        for i in range(count):
            ts = step * (i + 0.5)
            out = Path(tmp) / f"f{i:03d}.jpg"
            _run(
                [
                    "ffmpeg", "-y", "-ss", f"{ts:.3f}", "-i", str(video),
                    "-frames:v", "1", "-vf", "scale='min(768,iw)':-2",
                    "-q:v", "4", str(out),
                ]
            )
            if out.exists() and out.stat().st_size > 0:
                frames.append(Frame(timestamp=ts, jpeg=out.read_bytes()))
    if not frames:
        raise AnalyzerError("no frames could be extracted")
    return frames


def has_audio(video: Path) -> bool:
    out = _run(
        [
            "ffprobe", "-v", "error", "-select_streams", "a",
            "-show_entries", "stream=index", "-of", "csv=p=0", str(video),
        ]
    ).stdout.strip()
    return bool(out)


def transcribe(video: Path, whisper_model: str = "base") -> str:
    """Transcribe locally with faster-whisper (optional dependency).

    The Claude API does not accept audio, so speech-to-text is a separate step.
    Returns "" if the Reel has no audio track.
    """
    if not has_audio(video):
        return ""
    try:
        from faster_whisper import WhisperModel
    except ImportError as exc:
        raise AnalyzerError(
            "faster-whisper is not installed. Run `pip install faster-whisper`, "
            "or pass a transcript yourself (--transcript FILE / --no-transcript)."
        ) from exc
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "audio.wav"
        _run(
            [
                "ffmpeg", "-y", "-i", str(video), "-vn", "-ac", "1",
                "-ar", "16000", str(wav),
            ]
        )
        model = WhisperModel(whisper_model, compute_type="int8")
        segments, _ = model.transcribe(str(wav))
        return " ".join(s.text.strip() for s in segments).strip()


def build_content(frames: list[Frame], transcript: str) -> list[dict]:
    content: list[dict] = []
    for f in frames:
        content.append({"type": "text", "text": f"Frame at {f.timestamp:.1f}s:"})
        content.append(
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/jpeg",
                    "data": base64.standard_b64encode(f.jpeg).decode("ascii"),
                },
            }
        )
    if transcript:
        content.append({"type": "text", "text": f"Transcript of the audio:\n{transcript}"})
    else:
        content.append({"type": "text", "text": "No transcript is available."})
    content.append({"type": "text", "text": USER_PROMPT})
    return content


def parse_report(text: str) -> dict:
    """Parse the model's JSON reply, tolerating a ```json fence."""
    s = text.strip()
    if s.startswith("```"):
        s = s.split("\n", 1)[1] if "\n" in s else ""
        s = s.rsplit("```", 1)[0]
    try:
        report = json.loads(s)
    except json.JSONDecodeError as exc:
        raise AnalyzerError(f"model did not return valid JSON: {text[:200]!r}") from exc
    if not isinstance(report, dict):
        raise AnalyzerError("model returned JSON that is not an object")
    return report


def analyze(
    frames: list[Frame],
    transcript: str = "",
    *,
    client: anthropic.Anthropic | None = None,
    model: str = DEFAULT_MODEL,
) -> dict:
    client = client or anthropic.Anthropic()
    try:
        response = client.messages.create(
            model=model,
            max_tokens=16000,
            thinking={"type": "adaptive"},
            output_config={"effort": "medium"},
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": build_content(frames, transcript)}],
        )
    except TypeError as exc:
        if "authentication" in str(exc).lower():
            raise AnalyzerError(
                "no Claude credentials found; set ANTHROPIC_API_KEY or run `ant auth login`"
            ) from exc
        raise
    except anthropic.APIStatusError as exc:
        raise AnalyzerError(f"Claude API error ({exc.status_code}): {exc.message}") from exc
    except anthropic.APIConnectionError as exc:
        raise AnalyzerError("could not reach the Claude API") from exc
    if response.stop_reason == "refusal":
        raise AnalyzerError("the model declined to analyze this video")
    text = "".join(b.text for b in response.content if b.type == "text")
    return parse_report(text)


def analyze_video(
    video: Path,
    *,
    max_frames: int = DEFAULT_MAX_FRAMES,
    transcript: str | None = None,
    transcribe_audio: bool = True,
    whisper_model: str = "base",
    model: str = DEFAULT_MODEL,
    client: anthropic.Anthropic | None = None,
) -> Analysis:
    """Run the full pipeline. A provided transcript skips local transcription."""
    frames = extract_frames(video, max_frames)
    if transcript is None:
        transcript = transcribe(video, whisper_model) if transcribe_audio else ""
    report = analyze(frames, transcript, client=client, model=model)
    return Analysis(report=report, transcript=transcript, frames=frames)


def render_markdown(analysis: Analysis) -> str:
    r = analysis.report
    lines = ["# Reel analysis", "", "## Summary", str(r.get("summary", "")), "",
             "## Hook", str(r.get("hook", "")), ""]
    titles = {
        "key_ideas": "Key ideas",
        "on_screen_text": "On-screen text",
        "products_tools": "Products / tools",
        "actionable_insights": "Actionable insights",
        "caveats": "Caveats",
    }
    for key, title in titles.items():
        items = r.get(key) or []
        lines.append(f"## {title}")
        lines.extend(f"- {i}" for i in items) if items else lines.append("_None_")
        lines.append("")
    lines += ["## Transcript", analysis.transcript or "_No transcript_", ""]
    return "\n".join(lines)
