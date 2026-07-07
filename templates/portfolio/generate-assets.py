"""
generate-assets.py
Generates og-image.png, favicon.ico, and apple-touch-icon.png for {{SITE_NAME}}.

Deterministic Pillow renders of the brand mark - no network, no API keys.
Re-run after changing brand colors or the owner name in brand.config.json.

Requirements:
    pip install Pillow

Usage:
    python generate-assets.py
"""

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).parent


def load_brand() -> dict:
    with open(ROOT / "brand.config.json", encoding="utf-8") as f:
        return json.load(f)


def load_font(size: int, serif: bool = True) -> ImageFont.FreeTypeFont:
    """Best-effort system font lookup; falls back to Pillow's default."""
    candidates = (
        ["Georgia.ttf", "georgia.ttf", "DejaVuSerif.ttf", "Times New Roman.ttf"]
        if serif
        else ["Helvetica.ttf", "Arial.ttf", "DejaVuSans.ttf"]
    )
    for name in candidates:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default(size)


def draw_og_image(brand: dict) -> Image.Image:
    light = brand["colors"]["light"]
    img = Image.new("RGB", (1200, 630), light["paper"])
    d = ImageDraw.Draw(img)

    # editorial frame + accent rule (mirrors og-image.svg)
    d.rectangle([48, 48, 1152, 582], outline=light["muted"], width=2)
    d.rectangle([96, 144, 360, 152], fill=light["accent"])

    name_font = load_font(104)
    role_font = load_font(34)
    meta_font = load_font(20, serif=False)

    d.text((92, 220), brand["owner"]["name"], font=name_font, fill=light["ink"])
    d.text((96, 360), brand["owner"]["role"], font=role_font, fill=light["accent"])
    d.text((96, 500), brand["site"]["domain"], font=meta_font, fill=light["muted"])

    city = brand["owner"]["city"]
    city_w = d.textlength(city, font=meta_font)
    d.text((1104 - city_w, 500), city, font=meta_font, fill=light["muted"])
    return img


def draw_mark(size: int, brand: dict) -> Image.Image:
    """Square brand mark: accent field, paper initial."""
    light = brand["colors"]["light"]
    img = Image.new("RGB", (size, size), light["accent"])
    d = ImageDraw.Draw(img)
    initial = brand["owner"]["first"][:1].upper()
    font = load_font(int(size * 0.62))
    bbox = d.textbbox((0, 0), initial, font=font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text(((size - w) / 2 - bbox[0], (size - h) / 2 - bbox[1]), initial,
           font=font, fill=light["paper"])
    return img


def main() -> None:
    brand = load_brand()

    og = draw_og_image(brand)
    og.save(ROOT / "og-image.png", "PNG")
    print("wrote og-image.png (1200x630)")

    touch = draw_mark(180, brand)
    touch.save(ROOT / "apple-touch-icon.png", "PNG")
    print("wrote apple-touch-icon.png (180x180)")

    fav = draw_mark(32, brand)
    fav.save(ROOT / "favicon.ico", sizes=[(16, 16), (32, 32)])
    print("wrote favicon.ico (16+32)")


if __name__ == "__main__":
    main()
