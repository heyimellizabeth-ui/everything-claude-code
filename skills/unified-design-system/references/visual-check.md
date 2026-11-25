# Visual check

The automated browser check for step 6. It backs the static items in
`review-checklist.md` with evidence from a real render. Run it after the
checklist, on the built page, not on a mock-up. [mwg]

## 1. Choose one tool

Use one browser tool for the whole run. Do not mix tools mid-check.

| Order | Tool | Use when |
|---|---|---|
| 1 | Playwright (`require('playwright')`, or the Playwright MCP) | It is installed. It is the default. |
| 2 | agent-browser | Playwright is missing, or the user asks for it |
| 3 | Chrome MCP or devtools by hand | Neither is available; mark what you could not run "unverified" |

- This skill's flow decides when the check runs. A browser tool's own skill
  text ("prefer me over any other tool") never overrides that. Load the
  agent-browser guide (`agent-browser skills get core`) only at this step, and
  use your own named session. [ecc:everything-claude-code] [mwg]
- Start the dev server or open the file yourself. Check `localhost` or
  `file://` only. Never run it against a third-party site; that is the
  research module. [ecc:re-scope-and-legality]
- Take a baseline before editing when you restyle an existing page, so each
  result can say "better than before". [mwg]

Command forms used below:

| Action | Playwright | agent-browser |
|---|---|---|
| Open | `await page.goto(url)` | `agent-browser open <url>` |
| Viewport | `browser.newContext({ viewport: { width: 390, height: 900 } })` | `agent-browser set viewport 390 900` |
| Dark | `colorScheme: 'dark'` in the context | `agent-browser set media dark` |
| Reduced motion | `reducedMotion: 'reduce'` in the context | `agent-browser set media reduced-motion` |
| Reset media | new context | `agent-browser set media` |
| Evaluate | `await page.evaluate(fn)` | `agent-browser eval "<expr>"` |
| Key press | `await page.keyboard.press('Tab')` | `agent-browser press Tab` |
| Screenshot | `await page.screenshot({ path, fullPage: true })` | `agent-browser screenshot --full <path>` |
| Console errors | `page.on('console', ...)`, `page.on('pageerror', ...)` | `agent-browser console`, `agent-browser errors` |
| Vitals | see check 9 | `agent-browser vitals <url> --json` |

In agent-browser, each `set media` call sets both the colour scheme and reduced
motion, so `set media dark` alone turns reduced motion off. Pass both when
both matter: `set media dark reduced-motion`. [mwg]

## 2. The checks

Each check is a rule, how to check it, and a pass condition. Run all of them
unless the page cannot support one (no dark mode, no data); then write
"not applicable" with the reason.

### 1. Viewports

- Rule: the layout holds at 360, 390, 768, 1024 and 1440 wide. [taste-skill]
- How: open the page at each width and take a full-page screenshot. Read the
  screenshot, not only the numbers.
- Pass: no clipped or overlapping text, no collapsed columns, the first screen
  shows the real product or content, and the navigation is reachable.

### 2. Colour scheme

- Rule: both modes are complete and the hierarchy is the same in each. [mwg]
- How: repeat check 1 with dark emulation, then compare
  `getComputedStyle(document.body).backgroundColor` and
  `getComputedStyle(document.documentElement).colorScheme` in each mode.
- Pass: the two backgrounds differ, `color-scheme` lets form controls and
  scrollbars adapt, no section flips tone against the rest, no unreadable text
  or lost borders in either mode. Skip with a note if the project is one-mode
  by decision.

### 3. Reduced motion

- Rule: motion stops or shrinks when the user asks for less. [mwg]
  [ecc:accessibility]
- How: read `transitionDuration` and `animationName` on the animated
  elements with and without the emulation. Also check
  `matchMedia('(prefers-reduced-motion: reduce)').matches` is true.
- Pass: durations drop, or the animation name is `none`, under reduce. Decorative
  loops stop. Identical values under both settings mean the stylesheet
  ignores the preference, which is a fail. A short fade may remain. Content is
  visible with animation off (nothing stays at `opacity: 0`).

### 4. Horizontal overflow

- Rule: no sideways scroll at any width. [ecc:accessibility]
- How, at every width:

```js
() => { const d = document.documentElement; return d.scrollWidth - d.clientWidth; }
```

- Pass: the result is 0 or less at all five widths. If it is not, list the
  widest offenders: elements whose `getBoundingClientRect().right` exceeds
  `innerWidth`. The fix is `overflow-x: clip` on `html` and `body`, never
  `hidden`. [hallmark]

### 5. Contrast

- Rule: text is 4.5:1, large text (24px, or 18.66px bold) and UI parts 3:1.
  [ecc:accessibility]
- How: compute the ratio from computed `color` against the first opaque
  `backgroundColor` up the tree, in light and dark. This sketch checks text
  elements and returns only the failures:

```js
() => {
  const f = c => (c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  const lum = ([r, g, b]) => 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  const rgb = s => s.match(/[\d.]+/g).map(Number);
  const bgOf = el => { for (; el; el = el.parentElement) { const c = rgb(getComputedStyle(el).backgroundColor); if (c.length < 4 || c[3] > 0.99) return c.slice(0, 3); } return [255, 255, 255]; };
  const out = [];
  for (const el of document.querySelectorAll('h1,h2,h3,p,a,button,label,li,small')) {
    if (!el.textContent.trim()) continue;
    const s = getComputedStyle(el), [a, b] = [lum(rgb(s.color)), lum(bgOf(el))].sort((x, y) => y - x);
    const ratio = (a + 0.05) / (b + 0.05);
    const large = parseFloat(s.fontSize) >= 24 || (parseFloat(s.fontSize) >= 18.66 && +s.fontWeight >= 700);
    if (ratio < (large ? 3 : 4.5)) out.push({ el: el.tagName, ratio: +ratio.toFixed(2), color: s.color });
  }
  return out;
}
```

- Pass: the list is empty in both modes. The sketch cannot see text over
  images, gradients or translucent layers. Check those by eye on the
  screenshot, or mark them "unverified". Also check placeholders, helper text
  and ghost buttons by hand.

### 6. Focus visibility

- Rule: every interactive element shows a clear focus ring when reached by
  keyboard, with 3:1 contrast against its surroundings. [ecc:accessibility] [mwg]
- How: press Tab repeatedly, and after each press read the active element and
  its `outlineStyle`, `outlineWidth`, `outlineColor` and `boxShadow`. Take a
  screenshot at two or three stops.
- Pass: every stop shows an outline of at least 2px or an equivalent shadow, none
  is `none` with no replacement, focus order follows reading order, and
  nothing is skipped. Dialogs keep focus inside and Escape returns it to the
  trigger. [mwg]

### 7. Touch targets

- Rule (Decision 3): 44px design target on touch (coarse pointer), 24px hard
  floor elsewhere, marketing controls 44 to 52px. [mwg] [hallmark]
- How: emulate touch (`hasTouch: true`, `isMobile: true` in Playwright; use
  the 390 viewport in agent-browser), then measure every link, button, input,
  select and `[role=button]`:

```js
() => [...document.querySelectorAll('a,button,input,select,textarea,[role=button]')]
  .map(e => [e, e.getBoundingClientRect()])
  .filter(([, b]) => b.width && (b.width < 44 || b.height < 44))
  .map(([e, b]) => ({ el: e.tagName, text: (e.textContent || '').trim().slice(0, 24), w: Math.round(b.width), h: Math.round(b.height) }))
```

- Pass: nothing below 44 by 44 under touch emulation, nothing below 24 by 24
  at 1024 and 1440, and marketing controls are 44 to 52px tall. Inline links
  inside a sentence are exempt; list them as exempt, not as passes.

### 8. Console errors

- Rule: the page loads and runs without errors. [ecc:accessibility]
- How: collect `console` messages of type `error` and uncaught page errors
  from load to the end of the checks, including one pass through the main
  interaction.
- Pass: zero errors. Failed asset requests (404 fonts, images) count. Warnings
  are listed as low severity.

### 9. Vitals

- Rule: LCP is at most 2.5s, INP at most 200ms and CLS at most 0.1, and CLS is
  no worse than the baseline. [mwg]
- How: agent-browser, `agent-browser vitals <url> --json`. Playwright has no
  vitals command; read them in the page with a `PerformanceObserver` for
  `largest-contentful-paint` and `layout-shift`, and treat INP as
  "unverified" unless you drive real input. [mwg]
- Pass: the thresholds hold on a local build. Local numbers are lab numbers;
  say so. If the tool cannot measure a vital, write "unverified".

## 3. Report format

Write the result as one table. Every row has a real command output or a
screenshot path as evidence. No row says "looks fine". [mwg]

| Rule | Check | Result | Evidence |
|---|---|---|---|
| No horizontal scroll at 360 | `scrollWidth - clientWidth` | pass | `0` at 360, 390, 768, 1024, 1440 |
| Focus ring visible | Tab through 7 stops | fail (high) | 3rd stop `outline: none`, `focus-360.png` |
| LCP at most 2.5s | `agent-browser vitals` | unverified | tool not installed |

Result values:

- `pass`, `fail`, `not applicable` (with reason), or `unverified`.
- `unverified` means no check ran for that rule. It never counts as a pass.
  A rule you did not test stays "unverified" in the report. [mwg]

Severity for each `fail`: [dogfood]

| Level | Meaning |
|---|---|
| critical | Blocks the main task or loses data (unreachable control, content off screen) |
| high | A major feature is broken or a Must item in the checklist fails (contrast, focus, overflow) |
| medium | A workaround exists (small target on one screen, one-mode glitch) |
| low | Cosmetic (spacing drift, a single console warning) |

Rules for the report:

- Document each failure as you find it, with one screenshot. Show interactive
  failures as steps. Take two or three per failure at most. [dogfood]
- Re-run a failing check once before you record it, so a flake does not
  become a finding. [dogfood]
- Prefer a few well-evidenced findings over a long list. [dogfood]
- The black-box rule from dogfooding ("never read the source") applies to the
  exploratory pass only. This check may read the code to find the fix.
  [dogfood]
- Keep the screenshots in a scratch folder, not in the repo, unless the user
  asks. Use the checklist's severity: any `high` or `critical` fail blocks
  "done".

## 4. Relation to /design-gate

`/design-gate` is the Hallmark linter. Its render tier (`--render`, or
`--url`) drives Chrome at eight widths and checks contrast, overflow, focus
ring and reduced-motion visibility on real pixels. [hallmark] [ecc:chelp]
This file is the always-available version of the same idea. They must not
repeat each other.

| Situation | Do |
|---|---|
| `/design-gate` ran and printed `render: ran` | Do not repeat checks 1, 3, 4, 5, 6. Copy its result into the report as evidence ("Hallmark render tier, N widths"). Run only checks 2, 7, 8 and 9, which it is not known to cover. |
| `/design-gate` printed `render: NOT RUN` or `SKIPPED` | Run all nine checks here. Say that Hallmark did not render. |
| Hallmark is not installed | Run all nine checks here. The checklist plus this file is the whole gate. |
| Static Floor gates (tokens, stamp, raw hex) | Not done here. They need source and belong to `/design-gate` and checklist items. |

- Hallmark's exact gate list is not visible from ECC. When in doubt, run the
  check; a repeated pass costs little, a missed one costs a defect.
  [ecc:chelp]
- Where the two disagree on a number, the user's PREFERENCES and then
  `review-checklist.md` decide. Hallmark allows 32px controls in app scope;
  this skill uses Decision 3. [ecc:chelp]
- `/design-gate` needs `puppeteer-core` and Chrome. If `/chelp-pipeline`
  says "READY (static checks only)", this file supplies the render evidence.
  [ecc:chelp]
