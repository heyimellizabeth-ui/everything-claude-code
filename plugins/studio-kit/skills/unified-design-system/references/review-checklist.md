# Review gate

Run at step 6. Fix every Must item, and report each Should item you chose not to fix with the reason. Each Must item ends with a `check:` hint; `visual-check.md` explains how to run them in a browser. Any waiver needs a written reason and goes in the report. [hallmark]

Thresholds used below:

| Item | Limit |
|---|---|
| Viewports | 360, 390, 768, 1024, 1440; add 320 for text-heavy pages |
| Hero | fits first viewport; headline 2 lines max; subtext 20 words max; 4 text elements max; top padding `pt-24` max |
| Words per screen | about 95 or fewer on a landing screen |
| Web vitals | LCP under 2.5s, INP under 200ms, CLS under 0.1 |
| Touch targets | 44px design target under `pointer: coarse`, 24px hard floor elsewhere (Decision 3) |
| Control height | marketing 44 to 52px; dense app screens 32px minimum on pointer devices, 44px on touch |
| Motion | feedback 150 to 300ms, transitions 400ms max, over 500ms only for deliberate sequences; exits about 150ms; stagger 0.1s per child max |
| Contrast | 4.5:1 body, 3:1 large text, UI parts and field edges |

## Must (fix before done)

- Text contrast meets WCAG 2.2 AA in light and dark. check: run an automated contrast pass (axe or the browser a11y panel) in both modes, and inspect button labels, placeholders and helper text separately.
- Every interactive element has visible focus, hover and disabled states. check: Tab through the page and screenshot the focus ring; read computed `outline` on `:focus-visible`; confirm hover styles sit behind `@media (hover: hover)`.
- Target size: 44px on touch layouts, never under 24px anywhere; marketing controls 44 to 52px. check: emulate `pointer: coarse` and read `getBoundingClientRect()` height and width of each control; list any under 44 (touch) or 24 (any).
- Respects `prefers-reduced-motion`. check: emulate `prefers-reduced-motion: reduce`, reload, and confirm nothing moves except opacity fades of 0.2s or less.
- No raw colour, size, shadow or duration values in components, including hex fallbacks inside `var()`; tokens only. check: grep component files for `#[0-9a-f]{3,8}`, `rgb(`, and literal `ms` values outside the token file.
- Light and dark are both complete if the project supports both. check: emulate `prefers-color-scheme: dark`, screenshot each page, and compare against light for lost borders and low contrast.
- Layout holds at 360px and at desktop with no horizontal scroll and no text overflow. check: at 360px compare `document.documentElement.scrollWidth` with `innerWidth`, and take a 360px screenshot; repeat at 1440px. Use `overflow-x: clip` on html and body only as a guard, never `hidden`.
- Loading, empty and error states exist for anything that fetches data. check: throttle or block the request and screenshot each state; confirm no layout shift when content arrives.
- The first screen shows the actual product, tool or content. check: screenshot the first viewport at 1440 and 390 and name the real content in it.
- Hero limits hold on marketing pages: fits first viewport, headline 2 lines max, subtext 20 words max, 4 text elements max. check: screenshot at 1440 and 390 and count lines, words and text elements.
- Words per screen stay at about 95 or fewer on a landing screen. check: count visible words in the first viewport at 1440.
- Colour is never the only carrier of state or meaning; icon-only buttons have a text label. check: grayscale screenshot and read each icon-only button's accessible name.
- Modals trap focus, close on Escape and return focus to the trigger. check: open each dialog with the keyboard, Tab through it, press Escape and confirm focus returns.
- Animation uses only `transform` and `opacity`, and no `transition: all`. check: grep for `transition: all`, `will-change: all` and transitions on width, height, top, left or margin; read computed `transition-property`.
- Core Web Vitals meet LCP under 2.5s, INP under 200ms, CLS under 0.1. check: run the browser vitals or Lighthouse pass on the built page, not on dev mode only.
- Restyling or redesign keeps every link, form field, handler, test hook, slug and nav label. check: diff the before and after lists of links, form field names and handlers; list anything missing.
- The project's MASTER.md and PREFERENCES are applied. check: confirm tokens in code match MASTER.md and that no `never` entry in PREFERENCES is violated. When MASTER.md exists it wins over any dealt theme. (Decision 8) [hallmark]

## Should (fix or explain)

- One clear type hierarchy (display, heading, body, caption) used everywhere, with body at 16px or more (18px for trust-first).
- Spacing follows one scale (for example 4, 8, 12, 16, 24, 32, 48), and z-index follows one documented scale.
- Similar elements look the same across pages.
- Motion clarifies state changes rather than decorating; durations and easings come from tokens (fast 150, medium 300, slow 500).
- Exit animations are shorter and quieter than entries; press feedback uses one value (`scale(0.96)`).
- Perpetual loops appear only for real live state (recording dot, live feed). (Decision 5)
- Images and assets carry real subject matter, not filler; placeholders are labelled TODO slots.
- Concentric radius (outer equals inner plus padding) and one radius system.
- `text-wrap: balance` on headings, `pretty` on short body text, `tabular-nums` on changing numbers.
- Body line length 60 to 65ch.
- Stable dimensions for grids, toolbars and counters so hover and labels do not shift layout.
- Eyebrows number at most one per three sections; tracked uppercase labels stay short.
- Forms have a visible label above the field, error below with cause and fix, and no placeholder-as-label.
- Skip-to-content link, custom 404, legal links, favicon and meta tags exist on public sites.
- No `alert()` and no dead `#` links; the current nav item is marked.
- Section layouts vary: a layout family appears once, and zigzag runs at most 2 in a row.
- Hover reveals also work on focus and on `hover: none` devices.
- Every waiver or exception has a written reason of real substance.
- Verified at 360, 390, 768, 1024 and 1440 widths (plus 320 for text-heavy pages), with console errors read per page.

## AI-slop check (any hit is a Should)

- Purple-to-blue gradients or glowing blobs by default.
- Centred hero text over a dark mesh background at variance above 4.
- Three identical feature cards in a row.
- Glassmorphism on everything; more than one decorative effect per page.
- Cards nested inside cards, or list items wrapped in cards.
- Inter chosen as a default with slate-900 and no other typographic choice. (Decision 4)
- Beige, brass and espresso family as a default on a premium-consumer brief. (Decision 2)
- A serif display face outside the soft preset or in product UI. (Decision 1)
- UI text that describes features the controls already show.
- Filler copy: Elevate, Seamless, Unleash, "Oops!", Acme, Jane Doe, fake-precise numbers.
- Em-dash or en-dash used as a separator in UI copy.
- Section-number eyebrows, scroll cues, version labels in the hero, decorative status dots, middle-dot spam.
- Fake screenshots built from divs, hand-rolled decorative SVG, or invented logos in a logo wall.

`/design-gate` is the executable half of this checklist when Hallmark is installed; this file stays the human-readable spec and runs with or without it.
