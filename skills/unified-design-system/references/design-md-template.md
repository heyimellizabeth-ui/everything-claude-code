# DESIGN.md template

Save as `design-system/MASTER.md`. Page-specific deviations go in
`design-system/pages/<page>.md` and list only what differs. A page file
overrides MASTER.md for that page only, and anything it does not mention
still comes from MASTER.md. Do not write a root `DESIGN.md`: Hallmark treats
that name as its project marker (Decision 7). [hallmark] [uupm]

```markdown
# Design System: <Project>

## 1. Design read
Reading this as: <page kind> for <audience>, with a <vibe> language.
Preset: <soft | minimal | brutalist | product-tool | trust-first | custom>
Dials: VARIANCE <n> / MOTION <n> / DENSITY <n>

## 2. Colour tokens
| Token | Light | Dark | Use |
|---|---|---|---|
| --color-bg | | | page background |
| --color-surface | | | cards, panels |
| --color-text | | | body text, 4.5:1 on bg and surface |
| --color-text-muted | | | secondary text, 4.5:1 |
| --color-accent | | | primary actions |
| --color-on-accent | | | text on accent, 4.5:1 |
| --color-border | | | dividers, 3:1 where it marks a control edge |
| --color-error | | | errors and destructive actions |
| --color-focus | | | focus ring, 3:1 |

Every colour needs both a Light and a Dark value. Dark is tonal, not
inverted. Add rows for secondary or status colours only if the design uses
them.

## 3. Typography
Display font, body font, mono font, and the size scale with line heights.
Body 16px or more on web (18px or more for trust-first). Give a fallback
stack for every family.

## 4. Spacing, radius, shadow
Spacing scale, radius tokens (control, card, hero, pill), shadow levels.

| Token | Value | Use |
|---|---|---|
| --radius-control | | buttons, inputs |
| --radius-card | | cards, panels |
| --radius-pill | | tags, only if the preset allows |

## 5. Components
Component library (or "native"), and rules for buttons, inputs, cards, nav.
For Astryx, also the theme file path and the commands used to build it.

## 6. Motion
Durations, easing, what animates and what never does.

| Token | Value | Use |
|---|---|---|
| --duration-fast | | hover, press, toggles (150 to 300ms) |
| --duration-medium | | panels, menus (at most 400ms) |
| --duration-slow | | deliberate sequences only (500ms at most) |
| --ease-enter | | entering |
| --ease-exit | | leaving, shorter than enter |

Animate transform and opacity only. Honour `prefers-reduced-motion`.

## 7. Never do
Project-specific anti-patterns.
```
