---
name: unified-design-system
description: One entry point for all UI and visual design work. Use when building, restyling, redesigning or reviewing any website, app screen, dashboard, component, landing page, brand asset or slide deck. It sets the design direction, picks a style preset, applies tokens and components, and runs one review gate, routing to the specialist design skills only when needed.
origin: ECC
---

# Unified Design System

This skill replaces the habit of picking between many overlapping design
skills. It is the single front door: it decides the direction, then pulls in
exactly one specialist module per need. The specialist skills stay installed,
but they are called from here instead of competing for the same request.

## When to Use

- Building a new page, app screen, dashboard, component or site.
- Making existing UI look less generic, more polished or more on-brand.
- Creating a DESIGN.md, design tokens or a theme for a project.
- Reviewing a PR or screen for visual consistency, accessibility or "AI slop".
- Brand, banner or slide work that must match the project's look.

Skip it for pure logic, API or data work with no visible UI.

## How It Works

Run the seven steps in order. Steps 1, 2, 6 and 7 always run; the others
scale with the size of the task.

### 1. Load what already exists

Check, in this order, and treat what you find as binding:

1. `design-system/pages/<page>.md` for the page being built (overrides MASTER).
2. `design-system/MASTER.md` or `DESIGN.md` at the project root.
3. `design-system/PREFERENCES.md` in the project, then
   `~/.claude/design-preferences.md` for preferences that apply everywhere.
   Follow every entry marked `always` or `never`.
4. Existing tokens, theme files and component library in the codebase.

If none exist and the task is bigger than one component, create
`design-system/MASTER.md` from `references/design-md-template.md` at the end of
step 3.

### 2. Write the design read and set the dials

Before any code, state one line:

> Reading this as: <page kind> for <audience>, with a <vibe> language, leaning toward <preset or system>.

Then set three dials from 1 to 10 and say them:

| Dial | 1 | 10 |
|---|---|---|
| VARIANCE | strict symmetry | expressive, asymmetric |
| MOTION | static | cinematic |
| DENSITY | airy, gallery | packed, cockpit |

Starting values: tools and dashboards 4/3/7, landing pages 7/6/4, portfolios
8/7/3, editorial 6/4/3, trust-first or public-sector 3/2/5. Ask one question
only if two readings would produce clearly different results; otherwise
proceed.

### 3. Pick one preset and the token spine

Choose exactly one preset from `references/presets.md` (soft, minimal,
brutalist, product-tool, trust-first) unless the project already has its own
look. Express every colour, size, radius, shadow and duration as a token:

- primitive tokens (raw values) → semantic tokens (`--color-surface`,
  `--color-text-muted`) → component tokens (`--button-bg`).
- Components use semantic or component tokens only, never raw hex values.
- Define light and dark values together.

### 4. Choose the component layer

| Project | Use |
|---|---|
| React app or app screen | Astryx via `astryx-components` |
| Existing shadcn, MUI or other library | keep it; do not mix libraries |
| Static HTML site, no build step | native HTML + CSS variables |
| SwiftUI / iOS 26 | `liquid-glass-design` |

### 5. Build, calling a specialist only when the task needs it

| Need | Module |
|---|---|
| Style, palette or font ideas, UX rules by product type | `ui-ux-pro-max` (search its data) |
| Upgrade an existing site | `redesign-skill` |
| Motion beyond simple transitions | `motion-ui` |
| Fine polish: spacing, hit areas, text wrap | `make-interfaces-feel-better` |
| Current CSS and web platform features | `modern-web-guidance` |
| Brand identity or brand kit | `brand` |
| Banners and social assets | `banner-design` |
| Slide decks | `frontend-slides` |
| Decorative 3D wireframe accent | `wireframe-solid` |

Load one module at a time and only the sections you need. Where a module
contradicts this skill, this skill and the project's MASTER.md win.

### 6. Review gate

Run `references/review-checklist.md` before calling the work done. Fix every
"must" item. Report the "should" items you chose not to fix and why.

### 7. Learn from the user's reaction

This is how the system gets better the longer it is used. Whenever the user
accepts, rejects or corrects a design choice, append one entry to
`design-system/PREFERENCES.md` (create it from
`references/preferences-template.md` if missing):

- Record what they reacted to, their words, and the rule it implies.
- Mark the rule `always`, `never` or `prefer`.
- If the user says it applies to all their projects, add it to
  `~/.claude/design-preferences.md` instead.
- Do not log your own guesses as preferences. Only log what the user said or
  clearly chose.

When the same rule appears three or more times, or the log passes 20 entries,
propose moving the settled rules into `MASTER.md` (or into this skill's
presets, if they hold across projects) and ask before changing either.

## Examples

**New landing page, no existing system**

> Reading this as: product landing for indie developers, with a calm editorial
> language, leaning toward the minimal preset. Dials 6/4/3.

Creates `design-system/MASTER.md`, defines tokens, builds with native CSS,
runs the review gate.

**React dashboard in a project that has Astryx**

> Reading this as: operations dashboard for daily users, with a quiet
> product-tool language, leaning toward Astryx neutral. Dials 3/2/7.

Skips presets (Astryx theme is the look), builds with Astryx components, runs
the review gate with focus on density and states.

**Review a PR that touches styling**

Runs step 1 to load the project's rules, then only step 6, reporting each
failed item with file and line.

**The user rejects a choice**

> "Too rounded, I hate pill buttons."

Fixes the buttons, then appends to `design-system/PREFERENCES.md`:
`2026-11-25 | never | pill-shaped buttons; max radius 8px on controls | "Too rounded, I hate pill buttons."`
The next build reads it in step 1 and starts square.
