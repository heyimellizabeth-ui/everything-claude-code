# Design System — Brasa y Mar

Tokens sourced from **ui-ux-pro-max** (`src/ui-ux-pro-max/scripts/search.py`) for a warm,
rustic Mediterranean restaurant, then tuned against the two reference photos (saffron paella
on rustic wood; terracotta plates + woven textures).

## Palette

| Token | Hex | Use |
|-------|-----|-----|
| `--cream` | `#FBF6EC` | page background |
| `--cream-2` | `#F3E9D6` | alternating section background |
| `--ink` | `#2A1A12` | body text (AA on cream) |
| `--ink-soft` | `#5A4636` | secondary text |
| `--terracotta` | `#9A3412` | primary brand, large headings |
| `--burnt` | `#C2410C` | hover / secondary accent |
| `--saffron` | `#E08A1E` | highlight accents, dish art |
| `--paprika` | `#B3471F` | gradient mid-tone |
| `--herb` | `#4E6B3B` | fresh accent (herbs, success) |
| `--wood` | `#6B4A2E` | rustic borders, footer |
| `--shell` | `#E9D6B8` | dish-art rim / scallop |

Contrast: body text is `--ink` on `--cream` (≈ 11:1, AA+). Terracotta/saffron are used only at
large sizes or as non-text accents to satisfy WCAG AA.

## Typography

- **Display:** Playfair Display (serif) — headings, wordmark.
- **Body:** Karla (humanist sans) — copy, nav, UI.
- Loaded via Google Fonts with `display=swap` and a system-font fallback stack.

```
@import url('https://fonts.googleapis.com/css2?family=Karla:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
```

## Motion (visual scroll)

- GSAP + ScrollTrigger from CDN drive: reveal-on-scroll (`.reveal`), a top scroll-progress bar,
  hero parallax, a slow saffron-glow drift, and a steam shimmer.
- All motion is gated behind `prefers-reduced-motion`; reveals **force-visible** if GSAP fails
  (noscript rule + JS watchdog) so content is never hidden.
- Easing: `power2.out` for reveals, `none` (linear, scrubbed) for parallax. Natural, unhurried.

## Texture

- Full-page SVG grain overlay at ~0.05 opacity (rustic paper/wood feel).
- Soft, warm shadows (`0 18px 40px rgba(42,26,18,.14)`); generous radii (14–22px) for a
  hand-thrown, organic feel ("Nature Distilled" style from ui-ux-pro-max).

## Dish art (CSS-only, no photos)

Each "dish" is a layered CSS composition: a dark pan ring (radial gradient), a saffron-rice
field (conic + radial gradients), and shellfish/garnish accents (small gradient blobs). Built
as a reusable `.dish` component with modifier classes (`--paella`, `--gambas`, `--clams`, etc.).
