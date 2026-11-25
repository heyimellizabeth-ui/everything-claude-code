# Design rules

The skill reads this file at steps 2, 3 and 5 to set direction, tokens and build choices, and checks the finished work against it at step 6. Each rule is one line, testable, and ends with a source tag; MASTER.md and the user's PREFERENCES override any rule here.

Tags: [taste-skill] taste-skill v2 and its sibling skills, [uupm] ui-ux-pro-max, [astryx] Astryx docs, [mwg] modern-web-guidance (CC-BY 4.0), [ecc:name] an ECC skill, [hallmark] Hallmark gates, [agent-browser] agent-browser dogfood and core. Decision N marks one of the eight owner decisions.

## Owner decisions (confirmed 2026-11-25)

The owner confirmed all eight. They are settled rules, not defaults waiting for an answer; change one only when the owner asks.

1. Serif display: soft preset only, with a stated reason; never in product UI (T2).
2. Warm off-white: minimal preset only, by explicit choice (C3).
3. Touch targets: 44px on touch, 24px floor elsewhere, marketing controls 44 to 52px (S3).
4. Inter: never the default; fine when asked, for trust-first or product-tool, or when Astryx sets it (T1).
5. Perpetual loops: only for real live state (M7).
6. Brutalist motion dial: 2 (M10).
7. Only `design-system/MASTER.md`; never a root `DESIGN.md`.
8. MASTER.md wins over Hallmark's dealt theme or any stock theme (C9).

## Direction and copy

- **D1** State a one-line design read before any code: page kind, audience, vibe, preset. [taste-skill]
- **D2** Ask one question only when two readings would give clearly different results; otherwise proceed. [taste-skill]
- **D3** Quiet constraints (public sector, accessibility, regulated, kids) beat aesthetic taste. [taste-skill]
- **D4** Set VARIANCE, MOTION and DENSITY dials from 1 to 10 and say them. Preserve-redesign matches the existing look with motion +1; overhaul adds +2 variance and +2 motion. [taste-skill]
- **D5** If the brief names an official system (GOV.UK, USWDS, Material, Carbon, Fluent, Primer), install the official package and never recreate its CSS. One system per project. [taste-skill]
- **D6** Check `package.json` before importing a library; give the install command first; add no dependency for a flourish. [taste-skill] [ecc:frontend-design-direction]
- **D7** Search platform guidance before writing CSS or JS for a new feature, and record a browser-support policy; Baseline widely available features need no fallback. [mwg]
- **D8** The first screen shows the real product, tool or content, not a pitch about it. [ecc:frontend-design-direction]
- **D9** Dashboards and data tools take the Astryx or product-tool path; marketing-page taste rules (hero, eyebrow, section variety) do not apply to them. [taste-skill] [astryx]
- **D10** Re-read every visible string before finishing. Ban filler verbs (Elevate, Seamless, Unleash), placeholder names (Jane Doe, Acme), fake-precise numbers unless real or labelled mock. [taste-skill]
- **D11** No em-dash or en-dash as a separator in UI copy; use a hyphen, comma or full stop. [taste-skill]
- **D12** One CTA label per intent, at most 3 words, one line at desktop; one primary plus at most one visibly secondary action. [taste-skill]
- **D13** No UI text that describes what the controls already show. [ecc:frontend-design-direction]

## Typography

- **T1** Inter is never the default pick. It is fine when the user asks, for trust-first or product-tool work, or when Astryx sets the type. Decision 4. [taste-skill] [astryx]
- **T2** A serif display face is allowed only in the soft preset, with a stated reason, picked from a rotated pool, and never in product UI. Decision 1. [taste-skill]
- **T3** Base body size is 16px or more (18px or more for trust-first); never below 16px on mobile. [uupm] [astryx]
- **T4** Body line length is 60 to 65ch; line-height is unitless, 1.5 to 1.75 for body. [mwg] [uupm] [taste-skill]
- **T5** Use one type scale with display, heading, body and caption roles, and no more than two families per project (mono counts as a third only for code or data). [uupm] [taste-skill]
- **T6** `text-wrap: balance` on headings and `pretty` on short body text; never on `*`, long prose or code. [mwg] [ecc:make-interfaces-feel-better]
- **T7** `font-variant-numeric: tabular-nums` on changing or aligned numbers; mono numerals when density is above 7. [ecc:make-interfaces-feel-better] [taste-skill]

## Colour

- **C1** One accent colour, saturation under 80 percent, locked sitewide. [taste-skill]
- **C2** One neutral (gray) family per project; no pure `#000` or `#fff` as text or surface. [taste-skill]
- **C3** A warm off-white or beige-brass-espresso family is a deliberate choice only: allowed in the minimal preset when the user or brief picks it, never a default reach on premium-consumer briefs. Decision 2. [taste-skill]
- **C4** Purple-to-blue gradients and glowing blobs are not a default; at most one decorative effect (gradient, glass, glow) per page. [taste-skill] [uupm]
- **C5** Text contrast is 4.5:1 (3:1 for large text, UI parts and field edges), measured in light and dark separately. [ecc:accessibility] [uupm] [astryx]
- **C6** Never use colour alone to carry state or meaning; add an icon, text or shape. [ecc:accessibility] [uupm]
- **C7** Design light and dark together through tokens (`color-scheme`, `light-dark()`); presets may declare one mode in MASTER.md. [mwg] [taste-skill]
- **C8** Dark mode is tonal, not inverted: desaturate, re-check contrast, keep borders visible, keep hierarchy parity with light. [uupm] [mwg]
- **C9** When MASTER.md exists it wins over any dealt or stock theme (Hallmark, Astryx stock themes); re-run contrast after theming. Decision 8. [hallmark] [astryx]

## Layout and spacing

- **L1** Use `min-height: 100dvh`, never `100vh` or `h-screen`, for full-height sections. [taste-skill]
- **L2** Use CSS Grid for multi-column layouts, not flex percentage maths; container max width about 1400px. [taste-skill]
- **L3** Variance 4 to 10 layouts collapse to a single column under 768px; remove rotations and negative-margin overlaps there. [taste-skill]
- **L4** The hero fits the first viewport: headline at most 2 lines, subtext at most 20 words, at most 4 text elements, top padding at most `pt-24`. [taste-skill]
- **L5** A layout family appears once; an 8-section page uses at least 4 families; image-text zigzag runs at most 2 in a row. [taste-skill]
- **L6** A bento grid has exactly as many cells as items; a split header (big left headline, small right paragraph) is not a default. [taste-skill]
- **L7** Spacing comes from one 4/8 scale; z-index comes from one documented scale (no `z-[9999]`). [uupm] [taste-skill]
- **L8** Use one breakpoint list, verified at 360, 390, 768, 1024 and 1440 widths, plus 320 for text-heavy pages. [mwg] [agent-browser]
- **L9** No horizontal scroll at 360px; fix the cause first, then use `overflow-x: clip` on html and body, never `hidden`. [hallmark] [taste-skill]
- **L10** Grids, toolbars, counters and tiles have stable dimensions so labels and hover do not shift layout. [ecc:frontend-design-direction]
- **L11** Cards only where elevation communicates hierarchy; never a card inside a card, and never wrap list items in cards. Dense data goes in rows. [taste-skill] [astryx]
- **L12** Radius is concentric: outer radius equals inner radius plus padding; one radius system per project, with a written per-component rule for exceptions. [ecc:make-interfaces-feel-better] [taste-skill]
- **L13** One edge language per surface (border or soft elevation, not both at full strength); a surface that looks higher really sits above. [astryx]

## Components and states

- **S1** Every interactive element has default, hover, focus, active, disabled, loading and error states where they apply. Priority: disabled, loading, active, focus, hover. [uupm] [taste-skill]
- **S2** Visible `:focus-visible` ring, 2px with offset, 3:1 against the background; never `outline: none` without a replacement. [ecc:accessibility] [uupm] [mwg]
- **S3** Touch targets: 44px design target under `pointer: coarse`, 24px hard floor elsewhere, marketing controls 44 to 52px, 8px between targets. Decision 3. [ecc:accessibility] [mwg] [hallmark]
- **S4** Hover effects sit behind `@media (hover: hover)`, are never the only cue, and any hover reveal also works on focus. [uupm] [mwg]
- **S5** Hover changes colour or shadow, not position; no layout shift on hover. [uupm]
- **S6** Forms: visible label above the field, helper text, error below with cause and fix, validate on blur, focus the first invalid field, announce errors with `aria-live`; no placeholder-as-label. [uupm] [taste-skill]
- **S7** Every data view has loading, empty and error states. Skeletons are shaped like the final layout and appear after about 300ms; empty states are composed, errors are inline. [taste-skill] [uupm]
- **S8** One primary action per local group or screen; emphasis stays scarce. [uupm] [astryx]
- **S9** Icon-only buttons have an accessible text label; modals trap focus and close on Escape; menus return focus to the trigger. [ecc:accessibility]
- **S10** Navigation marks the current location; bottom nav has at most 5 top-level items; back preserves state; links go through the router component. [uupm] [astryx]
- **S11** Charts: type matches the data, no pie over 5 categories, accessible palette, table alternative, direct labels for small sets. [uupm]
- **S12** Use one icon family from the project's component library, one stroke width, SVG not emoji, sizes as tokens. [uupm] [taste-skill]

## Motion

- **M1** Every animation answers what it communicates (guide attention, show state, keep continuity); otherwise remove it. [ecc:motion-foundations] [taste-skill]
- **M2** Animate only `transform` and `opacity`; never width, height, top, left, margin or padding. [ecc:motion-foundations] [taste-skill] [hallmark]
- **M3** Never `transition: all` or `will-change: all`; list the properties. [ecc:make-interfaces-feel-better] [hallmark]
- **M4** Durations: 150 to 300ms for feedback, at most 400ms for transitions, over 500ms only for deliberate sequences; exits are shorter and quieter than entries (about 150ms). [uupm] [ecc:make-interfaces-feel-better]
- **M5** Durations and easings come from tokens (fast 150, medium 300, slow 500); no literals in components. [ecc:motion-foundations] [astryx]
- **M6** Honour `prefers-reduced-motion`: remove movement, keep opacity fades of 0.2s or less. [ecc:motion-foundations] [ecc:accessibility]
- **M7** Perpetual loops only for real live state (recording dot, live feed); not on idle cards or decoration. Decision 5. [taste-skill]
- **M8** Press feedback is `scale(0.96)` or `translateY(1px)`, switchable off, with 0.96 as the single press value. [ecc:make-interfaces-feel-better]
- **M9** No scroll listeners or rAF loops that write framework state; use IntersectionObserver, CSS `animation-timeline`, `useScroll` or ScrollTrigger. [taste-skill]
- **M10** Dial mapping: motion 2 or below means hard cuts and near-zero animation; 3 to 5 uses fast and medium; 6 and above allows slow. Brutalist uses 2. Decision 6. [ecc:motion-foundations] [taste-skill]
- **M11** Blur and backdrop filters go on fixed or sticky elements only, never on scrolling containers. [taste-skill]

## Imagery

- **I1** Order of preference: an image-generation tool, then seeded placeholders, then labelled TODO image slots with a note to the user. [taste-skill]
- **I2** No div-built fake screenshots and no hand-rolled decorative SVG or icon paths. [taste-skill]
- **I3** Logo walls contain real logos only (for example Simple Icons marks), never invented brands. [taste-skill]
- **I4** Images carry real subject matter, not filler; avatars and dates are varied, not duplicated. [taste-skill] [taste-skill:redesign]

## Performance

- **P1** LCP under 2.5s, INP under 200ms, CLS under 0.1. [taste-skill] [mwg]
- **P2** Hero and first-viewport images are sized, prioritised and not lazy-loaded; below-fold images are lazy. [mwg]
- **P3** In React, isolate any perpetual or looping animation in its own small memoised leaf component (`React.memo`) so it never re-renders the parent layout. [taste-skill]

## Redesign (never silently change)

- **R1** Classify the job first as preserve, overhaul or greenfield, and say which. [taste-skill]
- **R2** Audit tokens, information architecture and SEO before editing; capture a baseline (screenshots, links, fields). [taste-skill] [agent-browser]
- **R3** Never silently change slugs, nav labels, form field names, the logo, handlers or tracking events. [taste-skill] [hallmark]
- **R4** Compare before and after: no link, form field, handler or test hook goes missing. [hallmark]
- **R5** Lever order: typography, colour, states, spacing and layout, then component replacement; no framework migration. [taste-skill:redesign]
- **R6** Any exception or waiver gets a written reason and appears in the report. [hallmark]
- **R7** Record each finding with severity (critical, high, medium, low) and evidence; mark a rule "unverified" when no check was run. [agent-browser]
