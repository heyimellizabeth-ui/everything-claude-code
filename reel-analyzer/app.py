"""Streamlit UI: streamlit run app.py"""

import tempfile
from pathlib import Path

import streamlit as st

from analyzer import DEFAULT_MAX_FRAMES, DEFAULT_MODEL, AnalyzerError, analyze_video, render_markdown

st.title("Instagram Reel Analyzer")

video = st.file_uploader("Upload a downloaded Reel", type=["mp4", "mov", "webm"])
max_frames = st.slider("Frames to sample", 4, 24, DEFAULT_MAX_FRAMES)
mode = st.radio(
    "Audio",
    ["Transcribe locally (faster-whisper)", "Paste transcript", "Frames only"],
)
pasted = st.text_area("Transcript") if mode == "Paste transcript" else None

if video and st.button("Analyze Reel"):
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / f"reel{Path(video.name).suffix or '.mp4'}"
        path.write_bytes(video.getvalue())
        try:
            with st.spinner("Analyzing..."):
                result = analyze_video(
                    path,
                    max_frames=max_frames,
                    transcript=pasted if mode == "Paste transcript" else None,
                    transcribe_audio=mode.startswith("Transcribe"),
                    model=DEFAULT_MODEL,
                )
        except AnalyzerError as exc:
            st.error(str(exc))
            st.stop()
    st.markdown(render_markdown(result))
    with st.expander("Sampled frames"):
        for f in result.frames:
            st.image(f.jpeg, caption=f"{f.timestamp:.1f}s")
