import subprocess
from pathlib import Path
from types import SimpleNamespace
from unittest import mock

import pytest

import analyzer

REPORT = {"summary": "s", "hook": "h", "key_ideas": ["k"], "caveats": []}


def fake_client(text, stop_reason="end_turn"):
    client = mock.Mock()
    client.messages.create.return_value = SimpleNamespace(
        stop_reason=stop_reason, content=[SimpleNamespace(type="text", text=text)]
    )
    return client


def test_parse_report_plain_and_fenced():
    assert analyzer.parse_report('{"a": 1}') == {"a": 1}
    assert analyzer.parse_report('```json\n{"a": 1}\n```') == {"a": 1}


def test_parse_report_rejects_garbage():
    with pytest.raises(analyzer.AnalyzerError):
        analyzer.parse_report("not json")
    with pytest.raises(analyzer.AnalyzerError):
        analyzer.parse_report("[1]")


def test_build_content_orders_frames_then_transcript_then_prompt():
    frames = [analyzer.Frame(1.0, b"x"), analyzer.Frame(2.0, b"y")]
    content = analyzer.build_content(frames, "hello")
    assert [c["type"] for c in content] == ["text", "image", "text", "image", "text", "text"]
    assert "hello" in content[-2]["text"]
    assert content[-1]["text"] == analyzer.USER_PROMPT


def test_build_content_without_transcript():
    content = analyzer.build_content([analyzer.Frame(0.0, b"x")], "")
    assert "No transcript" in content[-2]["text"]


def test_analyze_returns_report_and_uses_defaults():
    client = fake_client('{"summary": "s"}')
    out = analyzer.analyze([analyzer.Frame(0.0, b"x")], "t", client=client)
    assert out == {"summary": "s"}
    kwargs = client.messages.create.call_args.kwargs
    assert kwargs["model"] == analyzer.DEFAULT_MODEL
    assert kwargs["thinking"] == {"type": "adaptive"}


def test_analyze_refusal_raises():
    with pytest.raises(analyzer.AnalyzerError):
        analyzer.analyze([], "", client=fake_client("", stop_reason="refusal"))


def test_render_markdown_handles_missing_sections():
    md = analyzer.render_markdown(analyzer.Analysis(report=REPORT))
    assert "## Summary\ns" in md
    assert "_None_" in md and "_No transcript_" in md


def test_missing_ffmpeg_is_friendly():
    with mock.patch("subprocess.run", side_effect=FileNotFoundError):
        with pytest.raises(analyzer.AnalyzerError, match="install FFmpeg"):
            analyzer.probe_duration(Path("x.mp4"))


@pytest.fixture
def sample_video(tmp_path):
    out = tmp_path / "v.mp4"
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-f", "lavfi", "-i", "testsrc=duration=3:size=320x240:rate=10",
             "-pix_fmt", "yuv420p", str(out)],
            check=True, capture_output=True,
        )
    except (FileNotFoundError, subprocess.CalledProcessError):
        pytest.skip("ffmpeg unavailable")
    return out


def test_extract_frames_real_video(sample_video):
    frames = analyzer.extract_frames(sample_video, 4)
    assert len(frames) == 4
    assert frames[0].jpeg[:2] == b"\xff\xd8"
    assert frames[0].timestamp < frames[-1].timestamp


def test_no_audio_means_empty_transcript(sample_video):
    assert analyzer.transcribe(sample_video) == ""


def test_analyze_video_end_to_end_with_fake_client(sample_video):
    result = analyzer.analyze_video(
        sample_video, max_frames=3, transcribe_audio=False,
        client=fake_client('{"summary": "ok"}'),
    )
    assert result.report == {"summary": "ok"} and len(result.frames) == 3
