---
name: frontend-design-direction
description: Set an ECC-specific frontend design direction for production UI work. Use when building or improving websites, dashboards, applications, components, landing pages, visual tools, or any web UI that needs stronger product-specific design judgment.
origin: community
---

# Frontend Design Direction

Use this skill when the work is not just making UI function, but making it feel
purposeful, polished, and appropriate to the product domain.

Source: salvaged from stale community PR #1659 by `linus707`, enriched with
principles distilled from `pbakaus/impeccable` v3.5.0 (Apache 2.0).

Note: ECC intentionally does not rebundle the canonical Anthropic
`frontend-design` skill or the `pbakaus/impeccable` plugin. Install either from
their upstream sources when you want runtime CLI detection or the full 23-command
suite. This skill is the ECC-native design-direction layer.

## When to Use

- The user asks to build a web page, app, dashboard, artifact, component, or UI.
- The user asks to make an interface more polished, distinctive, beautiful, or
  less generic.
- The implementation needs visual hierarchy, typography, color, motion, layout,
  and interaction choices.
- The current UI works but reads as flat, generic, templated, or mismatched to
  the audience.

## Step 0: Identify the Product Context

Before any design decision, establish:

1. **Purpose** — what job does this interface do?
2. **Audience** — who repeats this workflow, and what do they scan first?
3. **Tone** — utilitarian, editorial, playful, industrial, refined, technical,
   maximal, minimal, dense, calm, or another explicit direction.
4. **Memorable detail** — one design idea that makes the result feel intentional.
5. **Constraints** — framework, accessibility, performance, responsiveness, and
   existing design system.

Match the direction to the domain. A SaaS operations tool should be dense,
quiet, and scannable. A portfolio, launch page, or editorial piece can be more
expressive. Never force a landing-page composition onto a tool used daily.

## Implementation Guidance

- Build the actual usable experience as the first screen unless the user
  explicitly asks for marketing copy.
- Use existing project components, tokens, icon libraries, and routing patterns
  before introducing a new visual system.
- Use real or generated visual assets when the interface depends on images,
  products, places, people, gameplay, charts, or inspectable media.
- Prefer contextual typography and spacing over generic oversized hero text.
- Keep palettes multi-dimensional: avoid a UI dominated by one hue family.
- Use CSS variables or existing design tokens so the direction stays coherent
  across states.
- Design responsive constraints explicitly: grids, aspect ratios, min/max sizes,
  stable toolbars, and fixed-format controls should not shift on hover or resize.
- Use motion sparingly but deliberately. Prefer high-signal transitions that
  clarify state over decorative animation.
- Verify text fit on mobile and desktop. Long labels must wrap or resize cleanly
  rather than overflowing.

## Anti-Patterns

**Generated-UI defaults to avoid:**
- Purple-to-blue gradients, decorative blobs, oversized cards, vague hero copy,
  or stock-like atmospheric media.
- Cards nested inside other cards.
- A single decorative style applied everywhere when the domain calls for restraint.
- Hiding the primary product, tool, or workflow behind generic marketing sections.
- Adding a dependency for a design flourish unless it clearly pays for itself.
- Describing the UI's features inside the UI when the controls can speak
  for themselves.

**Color and contrast failures (most common in AI-generated UI):**
- Muted gray body text on a tinted near-white background. This is the single
  biggest readability failure in AI-designed interfaces. If contrast is even
  close to the limit, push the body color toward the ink end of the ramp.
- Body text must hit ≥4.5:1 contrast against its background. Large text
  (≥18 px or bold ≥14 px) requires ≥3:1. Placeholder text needs the same 4.5:1,
  not the muted-gray default.
- Gray text on a colored background looks washed out. Use a darker shade of the
  background's own hue, or a transparency of the text color — not a neutral gray.

## Review Checklist

- The first viewport immediately communicates the product, workflow, or object.
- The visual hierarchy supports scanning and repeated use.
- Typography fits the container and does not overlap adjacent content.
- Color choices have contrast and do not collapse into a one-note palette.
- Body and placeholder text meets ≥4.5:1 contrast ratio.
- Icons are used for familiar tool actions where available.
- Responsive layout has stable dimensions for boards, grids, toolbars, controls,
  tiles, and counters.
- Assets render and carry the subject matter instead of acting as filler.
- Motion improves orientation and does not mask sluggishness.
- The result matches the repo's existing frontend conventions unless there is a
  clear reason to depart.

## Named Invocation Modes

When the user or a command invokes a focused mode, apply only that discipline:

| Mode | Focus |
|------|-------|
| `audit` | Scan for anti-patterns; report concrete failures with line references |
| `polish` | Apply the full review checklist; fix without redesigning |
| `critique` | Adversarial design review; surface what is generic, weak, or wrong |
| `typeset` | Typography only: size ramp, weight, line-height, tracking, overflow |
| `colorize` | Color only: palette, contrast ratios, hue relationships |
| `layout` | Spacing, grid, responsive constraints, alignment |
| `animate` | Motion only: transitions, timing, AnimatePresence, reduced-motion |
| `bolder` | Increase visual weight, confidence, and decisiveness |
| `quieter` | Reduce visual noise; increase breathing room and restraint |

These modes correspond to sub-commands in `pbakaus/impeccable`. If that plugin
is installed, users can invoke them as `/impeccable audit` etc. for runtime
CLI detection and the full 23-command suite.

## See Also

- `design-system` skill — generate or audit design tokens; detect AI-slop patterns
- `motion-ui` / `motion-patterns` / `motion-advanced` — production motion system
- `pbakaus/impeccable` (external) — full 23-command suite + `npx impeccable detect` CLI
