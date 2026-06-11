#!/usr/bin/env python3
"""Generate BKS'26 PWA / Apple touch icons with no third-party deps.

Draws the Best Kept Secret green "smile" mark on the brand-dark background
and writes anti-aliased PNGs. Pure stdlib (zlib + struct) so it runs anywhere.

Usage: python3 gen-icons.py
"""
import math
import struct
import zlib
from pathlib import Path

BG = (0x0A, 0x0A, 0x0A)      # --bg
GREEN = (0x35, 0xD0, 0x4A)   # --brand
OUT = Path(__file__).parent / "icons"


def smoothstep(edge0, edge1, x):
    if edge0 == edge1:
        return 0.0 if x < edge0 else 1.0
    t = max(0.0, min(1.0, (x - edge0) / (edge1 - edge0)))
    return t * t * (3 - 2 * t)


def render(size, smile_scale, cy_frac=0.44, thick_frac=0.115):
    """Return raw RGB rows (with PNG filter bytes) for an icon of `size`px."""
    n = size
    cx = n / 2.0
    cy = n * cy_frac
    r = n * smile_scale            # radius to band centerline
    half_t = (n * thick_frac) / 2.0
    cap_l = (cx - r, cy)
    cap_r = (cx + r, cy)
    aa = 0.75                      # anti-alias softness in px
    raw = bytearray()
    for y in range(n):
        raw.append(0)              # filter type: none
        for x in range(n):
            px, py = x + 0.5, y + 0.5
            cov = 0.0
            if py >= cy:           # lower half ring -> "smile"
                d = abs(math.hypot(px - cx, py - cy) - r)
                cov = 1.0 - smoothstep(half_t - aa, half_t + aa, d)
            for (ccx, ccy) in (cap_l, cap_r):   # round the two ends
                dc = math.hypot(px - ccx, py - ccy)
                cov = max(cov, 1.0 - smoothstep(half_t - aa, half_t + aa, dc))
            cov = max(0.0, min(1.0, cov))
            raw += bytes(int(BG[i] + (GREEN[i] - BG[i]) * cov) for i in range(3))
    return bytes(raw)


def write_png(path, size, smile_scale, **kw):
    raw = render(size, smile_scale, **kw)

    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data +
                struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)  # 8-bit RGB
    png = (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) +
           chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))
    path.write_bytes(png)
    print(f"wrote {path.name} ({size}x{size}, {len(png)} bytes)")


def main():
    OUT.mkdir(exist_ok=True)
    # Standard icons: prominent smile
    write_png(OUT / "icon-180.png", 180, 0.30)   # apple-touch-icon
    write_png(OUT / "icon-192.png", 192, 0.30)
    write_png(OUT / "icon-512.png", 512, 0.30)
    # Maskable: keep the mark inside the central ~80% safe zone
    write_png(OUT / "icon-512-maskable.png", 512, 0.22, cy_frac=0.46, thick_frac=0.09)


if __name__ == "__main__":
    main()
