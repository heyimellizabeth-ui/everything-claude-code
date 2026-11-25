# Design System: Club KUDT

Written from the `:root` tokens in `index.html` (Phase 4 test). This file is the only source
of brand tokens: every chain reads it first (unified-design-system step 1).

## 1. Design read

Reading this as: venue and events site for Club KUDT, with a dark, atmospheric language.
Dials: VARIANCE 7 / MOTION 5 / DENSITY 4. Change them here if the brand calls for it.

## 2. Colour tokens

The site is dark only; there is no light theme.

| Token | Value | Use |
|---|---|---|
| --color-bg | #0D0D0D | page background |
| --color-surface | #1A1A1A | cards, panels |
| --color-text | #F5F0E8 | body text (17.1:1 on bg) |
| --color-text-muted | #888070 | secondary text (5.0:1 on bg) |
| --color-accent | #E8415A | fills, borders, primary actions |
| --color-accent-ink | #0D0D0D | text on an accent fill |
| --color-accent-text | #E94A61 | accent used as text (5.2:1 on bg) |

## 3. Typography

Display: system-ui, sans-serif
Body: system-ui, sans-serif

## 4. Spacing, radius, shadow

Taken from the site's own CSS. Record changes here before making them.

## 5. Components

Native HTML and CSS variables (static site, no build step).

## 6. Motion

Animate state changes only. Always respect prefers-reduced-motion.

## 7. Never do

- Raw hex values in components; use the tokens above.
- Accent colour as body text; use `--color-accent-text`.
- Cream text on a red fill (3.5:1). Text on `--color-accent` uses `--color-accent-ink` (#0D0D0D, 4.9:1).
