"""
generate-assets.py
Generates og-image.png, favicon.ico, and apple-touch-icon.png for Club KUDT.

Requirements:
    pip install anthropic Pillow

Usage:
    ANTHROPIC_API_KEY=sk-... python generate-assets.py
"""

import io
import os
import re
import sys
import textwrap
from pathlib import Path

import anthropic
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).parent
API_KEY = os.environ.get("ANTHROPIC_API_KEY")
if not API_KEY:
    sys.exit("Error: ANTHROPIC_API_KEY environment variable is not set.")

client = anthropic.Anthropic(api_key=API_KEY)

BRAND = {
    "bg": "#0a0a0a",
    "text": "#F5F0E8",
    "accent": "#E8415A",
    "muted": "#888070",
}


def ask_claude_for_pillow_code(description: str) -> str:
    prompt = textwrap.dedent(f"""
        Write a Python function called `draw_image` that returns a `PIL.Image.Image` object.

        The function must:
        - Use only `PIL.Image`, `PIL.ImageDraw`, and `PIL.ImageFont` (already imported)
        - Draw: {description}
        - Return the finished Image object

        Brand colors: background {BRAND['bg']}, text/shapes {BRAND['text']}, accent {BRAND['accent']}.

        Output ONLY the raw Python function — no markdown fences, no imports, no example calls.
    """).strip()

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )
    code = message.content[0].text.strip()
    # Strip accidental markdown fences
    code = re.sub(r"^```[a-z]*\n?", "", code)
    code = re.sub(r"\n?```$", "", code)
    return code.strip()


def run_draw_code(code: str) -> Image.Image:
    import PIL
    import PIL.Image
    import PIL.ImageDraw
    import PIL.ImageFont
    namespace = {
        "PIL": PIL,
        "Image": Image,
        "ImageDraw": ImageDraw,
        "ImageFont": ImageFont,
    }
    exec(code, namespace)  # noqa: S102
    return namespace["draw_image"]()


# ── Step 1: og-image.png ──────────────────────────────────────────────────────
print("Asking Claude to draw og-image (1200×630) ...")
og_code = ask_claude_for_pillow_code(
    f"A 1200×630 px social media preview card for 'Club KUDT', a queer nightclub in Alkmaar. "
    f"Dark background ({BRAND['bg']}). "
    f"A thin rectangular border frame in accent red ({BRAND['accent']}, opacity ~40%) inset 60 px from each edge. "
    f"Small red dots at the four inner corners of the frame. "
    f"Centered text 'KUDT' in a large bold monospace font (~160 px), color {BRAND['text']}. "
    f"A horizontal red line ({BRAND['accent']}) below the wordmark. "
    f"Smaller text 'PARTY IN A QUEER SPACE' centered below the line (~18 px, {BRAND['text']}, letter-spaced). "
    f"Even smaller text 'ALKMAAR · EST. 2022 · CLUBKUDT.NL' centered below that (~13 px, opacity 35%). "
    f"Use ImageFont.load_default() if system fonts are unavailable."
)
(ROOT / "_og_image_code.py").write_text(og_code, encoding="utf-8")
og_img = run_draw_code(og_code)
og_img.save(ROOT / "og-image.png", format="PNG")
print("  OK og-image.png (1200×630)")


# ── Step 2: favicon.ico ───────────────────────────────────────────────────────
print("Asking Claude to draw favicon (32×32) ...")
fav_code = ask_claude_for_pillow_code(
    f"A 32×32 px favicon. Near-black background ({BRAND['bg']}). "
    f"A single bold letter 'K' centered, cream color ({BRAND['text']}), as large as fits. "
    f"A thin horizontal red line ({BRAND['accent']}) below the letter. "
    f"Use ImageFont.load_default() if system fonts are unavailable."
)
(ROOT / "_favicon_code.py").write_text(fav_code, encoding="utf-8")
fav_img = run_draw_code(fav_code).convert("RGBA")

# Pack multi-size ICO
sizes = [16, 32, 48]
ico_frames = [fav_img.resize((s, s), Image.LANCZOS) for s in sizes]
ico_frames[0].save(
    ROOT / "favicon.ico",
    format="ICO",
    sizes=[(s, s) for s in sizes],
    append_images=ico_frames[1:],
)
print(f"  OK favicon.ico ({', '.join(str(s) for s in sizes)} px)")


# ── Step 3: apple-touch-icon.png ─────────────────────────────────────────────
print("Asking Claude to draw apple-touch-icon (180×180) ...")
touch_code = ask_claude_for_pillow_code(
    f"A 180×180 px iOS home-screen icon. Near-black background ({BRAND['bg']}). "
    f"Centered bold text 'KUDT' in a large monospace font (~52 px), cream color ({BRAND['text']}). "
    f"A thin horizontal red line ({BRAND['accent']}) below the text. "
    f"Looks clean and bold at 60×60 display size. "
    f"Use ImageFont.load_default() if system fonts are unavailable."
)
(ROOT / "_touch_icon_code.py").write_text(touch_code, encoding="utf-8")
touch_img = run_draw_code(touch_code).convert("RGBA")
touch_img.save(ROOT / "apple-touch-icon.png", format="PNG")
print("  OK apple-touch-icon.png (180×180)")

print("\nDone — three image files written to project root.")
print("(Intermediate _*_code.py files saved for inspection — safe to delete.)")
