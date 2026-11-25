# Design System: Design Studio

The rules for the studio's own interface (the panel, tabs and header), not for
the club sites it generates. Created with the `unified-design-system` skill.

## 1. Design read

Reading this as: a brand-builder tool for club and venue organisers, with a
quiet dark product-tool language, leaning toward the product-tool preset.

Preset: product-tool, dark only
Dials: VARIANCE 3 / MOTION 3 / DENSITY 6

## 2. Colour tokens

| Token | Value | Use |
|---|---|---|
| --studio-bg | #0f0f0f | page background |
| --studio-surface | #1a1a1a | header, panel |
| --studio-border | #2a2a2a | dividers, secondary buttons |
| --studio-text | #e8e8e8 | body text |
| --studio-muted | #888 | labels, inactive tabs |
| --studio-accent | #7c3aed | filled primary button, toggles, borders |
| --studio-accent-hover | #6d28d9 | primary button hover |
| --studio-accent-text | #a78bfa | accent used as text or focus ring (6.4:1 on surface) |

Rule: `--studio-accent` is only for fills and borders. Text in the accent colour
uses `--studio-accent-text`, because #7c3aed on #1a1a1a is 3.0:1 and fails AA.

## 3. Typography

System sans (`-apple-system, Segoe UI, sans-serif`). Labels and tabs 11 to 12px
uppercase with letter-spacing; inputs and body 13px.

## 4. Spacing, radius, shadow

Spacing: 8 / 12 / 16 / 20px. Radius: 6px for controls, 8px for cards.
No shadows except preset-card hover.

## 5. Components

Native HTML and CSS variables. No component library.

## 6. Motion

Transitions 0.1 to 0.2s on colour and border only. Turned off under
`prefers-reduced-motion`.

## 7. Never do

- Accent colour as text without `--studio-accent-text`.
- Remove `:focus-visible` outlines.
- Literal `</script>` inside the inline script (write `<\/script>`): it ends the
  script early and blanks the whole studio.

## Open questions for Lizzy

- The purple accent (#7c3aed) is the most common AI-generated default. Keep it,
  or pick a colour that belongs to the studio?
- Controls are 35 to 40px tall. Fine on desktop, small for touch (44px).
