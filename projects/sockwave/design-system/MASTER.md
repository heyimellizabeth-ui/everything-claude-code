# Design System: Sockwave

Written from `src/styles/tokens.css` (Phase 4 test). This file is the only source
of brand tokens: every chain reads it first (unified-design-system step 1).

## 1. Design read

Reading this as: launch page for Sockwave, with a dark, loud editorial language.
Dials: VARIANCE 7 / MOTION 5 / DENSITY 4. Change them here if the brand calls for it.

## 2. Colour tokens

The site is dark only; there is no light theme.

| Token | Value | Use |
|---|---|---|
| --color-bg | #0a0a0b | page background |
| --color-surface | #18181b | cards, panels |
| --color-text | #fafafa | body text (19.0:1 on bg) |
| --color-text-muted | #8a8a93 | secondary text (5.8:1 on bg) |
| --color-accent | #ec4899 | fills, borders, primary actions |
| --color-accent-ink | #0a0a0b | text on an accent fill |
| --color-accent-text | #ec4899 | accent used as text (5.6:1 on bg) |

## 3. Typography

Display: Syncopate
Body: Space Mono

## 4. Spacing, radius, shadow

Taken from `src/styles/tokens.css`. Record changes here before making them.

## 5. Components

Astro components with CSS variables.

## 6. Motion

Animate state changes only. Always respect prefers-reduced-motion.

## 7. Never do

- Raw hex values in components; use the tokens above.
- Accent colour as body text; use `--color-accent-text`.
- Darkening `--fg-dim` below #8a8a93 (5.8:1 on bg, 5.2:1 on surface). The old #71717a was 4.1:1 and failed body text.
