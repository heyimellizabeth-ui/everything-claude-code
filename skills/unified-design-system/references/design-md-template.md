# DESIGN.md template

Save as `design-system/MASTER.md`. Page-specific deviations go in
`design-system/pages/<page>.md` and list only what differs.

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
| --color-text | | | body text |
| --color-text-muted | | | secondary text |
| --color-accent | | | primary actions |
| --color-border | | | dividers |

## 3. Typography
Display font, body font, mono font, and the size scale with line heights.

## 4. Spacing, radius, shadow
Spacing scale, radius values, shadow levels.

## 5. Components
Component library (or "native"), and rules for buttons, inputs, cards, nav.

## 6. Motion
Durations, easing, what animates and what never does.

## 7. Never do
Project-specific anti-patterns.
```
