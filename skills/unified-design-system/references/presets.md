# Style presets

Pick one per project at step 3. Each preset is a starting point; the project's MASTER.md and the user's PREFERENCES override it. Dials are VARIANCE / MOTION / DENSITY. Every value below becomes a token in MASTER.md, with light and dark defined together, and every preset must pass `rules.md`.

The ui-ux-pro-max search output (see `knowledge-uupm.md`) can supply candidates for palette, font pairing and style within a preset. Treat them as options to adapt, not as the answer: drop its raw CSS blocks and hover lifts, derive dark values yourself, and treat an Inter/Inter fallback as "no match".

Decisions shown here: Decision 1 (serif only in soft), Decision 2 (warm off-white only in minimal, by explicit choice), Decision 4 (Inter never a default), Decision 5 (loops only for live state), Decision 6 (brutalist motion dial 2).

Shared defaults for all presets: one accent, saturation under 80 percent; tinted neutrals, no pure black or white; body 16px or more; controls 44px on touch, 24px floor elsewhere; motion tokens fast 150, medium 300, slow 500 ms; `prefers-reduced-motion` removes movement.

## soft

Premium, agency feel. Generous whitespace, soft layered shadows, large radii, one warm accent.

- Dials: 7 / 6 / 3.
- Palette, light: tinted near-white surface (not a beige-brass-espresso default), soft ink text (not pure black), one warm accent such as terracotta or amber. Dark: deep tinted charcoal, surfaces step up 4 to 6 percent lightness, accent desaturated 10 percent.
- Type: humanist or geometric sans for body. A serif display face is allowed here only with a stated reason (for example editorial warmth) and picked from a rotated pool, never on product UI. Decision 1.
  - Pairs (rotate between projects, never reuse the last one): Newsreader plus Figtree; Gloock plus Manrope; DM Serif Display plus DM Sans. Sans-only option: Plus Jakarta Sans plus Instrument Sans.
- Radius: 16 to 24px on cards, 12px on controls, concentric inner radius. Pill buttons allowed if used everywhere.
- Border: 1px hairline at 6 to 10 percent ink, or none.
- Shadow: two layers, tinted to the surface, blur 24 to 48px, opacity 0.06 to 0.12.
- Motion: ease `cubic-bezier(0.32, 0.72, 0, 1)`; fade and lift of 12 to 16px, 300 to 500ms; stagger 60 to 80ms; one-shot entrances, no idle loops. Decision 5.
- Density and spacing: base 8px, section padding 96 to 160px, cards 32px padding.
- Double-Bezel nested cards only on hero or feature cards, never around nested content.
- Avoid: hard black borders, neon, dense tables, an eyebrow pill above every heading (eyebrows capped at one per three sections), perpetual card animation.

## minimal

Editorial and calm. Strong type contrast, flat surfaces, thin rules, bento grids with hairlines.

- Dials: 5 / 3 / 3.
- Palette, light: neutral white or near-white. A warm off-white such as `#F7F6F3` is allowed only when the user or brief picks it explicitly, never as a default reach on a premium-consumer brief. Decision 2. Text `#111`-range (not pure black), muted text at 4.5:1. Dark: near-black tinted surface, text at 90 percent, borders at 12 percent.
- Accent: none or one muted pastel pair (tint background plus darker text) for tags.
- Type: large display against small body. Sans-led pairs: Geist plus Geist Mono; Instrument Sans plus JetBrains Mono; Public Sans plus IBM Plex Mono. A serif display is not part of this preset; if the user wants one, switch to soft.
- Radius: 6 to 10px on cards, 4 to 6px on buttons. No pill containers; pill tags are fine.
- Border: 1px at 8 to 12 percent ink on every card.
- Shadow: none, or at most `0 2px 8px` at 0.04 opacity on hover.
- Motion: entrance `translateY(12px)` over 500 to 600ms with `cubic-bezier(0.16, 1, 0.3, 1)`; stagger 80ms; state changes 150 to 200ms; no loops.
- Density and spacing: base 8px, card padding 24 to 40px, section padding 80 to 128px.
- Avoid: gradients, heavy shadows, "ambient depth" blobs, emoji icons, any decorative loop.

## brutalist

Raw and mechanical. Rigid visible grid, extreme type scale jumps, high contrast, square corners, utilitarian labels.

- Dials: 8 / 2 / 6. Motion 2 means hard cuts and near-zero animation. Decision 6.
- Palette, light (Swiss print): paper `#F4F4F0`, ink `#111`, one hazard red. Dark (telemetry): `#0A0A0A` surface, `#EAEAEA` text, one signal colour used on a single element. Pick one mode per project and do not mix.
- Type: grotesk or monospace. Pairs: Space Grotesk plus Space Mono; Archivo Black plus IBM Plex Mono; Familjen Grotesk plus JetBrains Mono. Inter Black is not used unless the user asks. Decision 4.
- Display `clamp(4rem, 10vw, 15rem)`, tracking -0.03 to -0.06em, leading 0.85 to 0.95, uppercase. Micro labels 11 to 14px mono, tracking 0.05 to 0.1em.
- Radius: 0 everywhere.
- Border: 1 to 2px solid dividers; hairline grids via `gap: 1px` on a contrasting parent.
- Shadow: none, or a hard offset shadow with no blur.
- Motion: instant state changes (0 to 100ms), no easing flourishes, no entrance animation, no loops except a real live indicator. Decision 5.
- Density and spacing: base 4px, tight grid gaps, content packed in blocks.
- Avoid: soft shadows, pill shapes, pastel palettes, fake unit IDs and crosshair decoration beyond one deliberate motif.

## product-tool

For dashboards, admin and daily-use apps. Quiet neutral surfaces, one brand accent for primary actions, clear states.

- Dials: 3 / 2 / 7. Follow the Astryx theme when the project uses Astryx; this preset then only fills gaps.
- Palette, light: neutral gray ramp with a 3:1 field edge, one brand accent on the primary action, status colours (success, warning, error) always paired with an icon or text. Dark: tonal surface steps, not an inversion; recheck contrast.
- Type: Inter is fine here. Decision 4. Pairs: Inter plus JetBrains Mono; Geist plus Geist Mono; IBM Plex Sans plus IBM Plex Mono. Base 16px (set `typography.scale.base` to 16 if Astryx defaults to 14); `tabular-nums` on all figures.
- Radius: 6 to 8px on controls and cards, one scale.
- Border: 1px at 10 to 14 percent ink, borders over shadows.
- Shadow: only on floating layers (menus, dialogs), low opacity.
- Motion: 100 to 200ms on state changes, 150 to 300ms on panels, no entrance choreography; skeletons after about 300ms; loops only for live state. Decision 5.
- Density and spacing: base 4px with 8px rhythm, rows 36 to 44px, controls 32 to 36px on pointer devices and 44px on coarse pointers, `--size-element-lg` at 44px.
- States: default, hover, focus, active, disabled, loading, empty, error on every data view.
- Avoid: marketing hero patterns, cards around list items, decorative gradients, scroll-triggered effects, hover lift.

## trust-first

Public sector, health, finance, kids. Plain language, large readable text, strong contrast, obvious controls.

- Dials: 3 / 2 / 5. Prefer an official system (GOV.UK, USWDS) when the brief matches, and then follow it instead of this preset.
- Palette, light: white surface, near-black text (7:1 where possible), one accessible brand accent, links underlined. Dark: optional; offer it only if the audience expects it, and keep 7:1 text.
- Type: Inter is fine here. Decision 4. Pairs: Inter plus IBM Plex Sans; Public Sans plus Source Sans 3; Atkinson Hyperlegible alone for low-vision audiences. Body 18px or more, line-height 1.6 to 1.75, 60 to 65ch.
- Radius: 4 to 8px, one scale.
- Border: 2px visible borders on form fields, 3px focus ring with offset.
- Shadow: none or minimal.
- Motion: 0 to 150ms fades only; no auto-play, no parallax, no loops; honour reduced motion strictly.
- Density and spacing: base 8px, generous gaps, controls 44 to 52px, one column on mobile, short pages with one task each.
- Avoid: clever copy, icon-only buttons, placeholder labels, low-contrast greys, time-limited UI, colour-only status, decorative motion.
