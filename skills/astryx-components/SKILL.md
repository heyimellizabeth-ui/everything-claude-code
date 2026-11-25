---
name: astryx-components
description: Use the Astryx design system (@astryxdesign/core) as the component directory for React web work in the chelp chains, with Hallmark's Floor as the design gate. Use when a c1 to c5 chain builds or changes a React app, an app screen, a dashboard, a form or a page that should use Astryx components.
origin: ECC
---

# Astryx Components

Astryx is a public React design system: 174 components, page and block
templates, semantic tokens and themes, all styled with StyleX. Its CLI prints
agent-ready docs for every component. In the chelp chains it is the component
directory: the place an agent looks up which component to use and how, instead
of writing raw HTML and CSS.

Hallmark stays the design gate. Astryx decides which component and which token.
Hallmark checks that the result does not look generated and does not break the
accessibility Floor.

Package versions this skill was checked against: `@astryxdesign/core` 0.7.16
and `@astryxdesign/cli` 0.7.16.

## When to Use

- A chain (`/c1`, `/c2`, `/c3`, `/c4`) builds or changes a React app or page.
- The work is an app screen: a dashboard, an admin, settings, a form, a chat, a
  list or a table.
- The project already has `@astryxdesign/core` in `package.json`.
- The user asks for Astryx, or for "a component library" in a new React project.

Do not use it for:

- Static HTML sites from `/studio-build`. They have no React and no build step.
- A project that already uses another component system (shadcn, MUI, Chakra),
  unless the user asks to migrate. Then read `npx astryx docs migration` first.

## How It Works

### 1. Set up once per project

Astryx needs React 19 or later, the StyleX runtime and a theme package:

```bash
npm install @astryxdesign/core @stylexjs/stylex @astryxdesign/theme-neutral @astryxdesign/cli
npx astryx init --agent claude
npx astryx theme add neutral
```

`init` writes a managed Astryx block into the project's `CLAUDE.md`. `theme add` writes
`src/astryx-themes.ts`. Then:

- Import `@astryxdesign/core/reset.css` and `@astryxdesign/core/astryx.css` in the global CSS. **Not when
  the project uses the Astryx build plugin** (`@astryxdesign/build`, which compiles Astryx from source);
  see the next section.
- Wrap the app: `<Theme theme={themes[defaultThemeSlug]}><App /></Theme>`, with `Theme` from
  `@astryxdesign/core/theme`.
- `npx astryx theme list` shows the other themes. Ask the user which look they want before building
  screens; neutral is the default.
- Some templates need extra packages (for example `@heroicons/react`, `recharts`). The scaffold
  command prints the exact install line.

Checked on a fresh Vite React 19 project with `@astryxdesign/core` 0.7.16: the `settings` template
builds and renders.

**Where the CSS comes from decides the import.** Check `package.json` and the bundler config first:

| Setup | Global CSS |
|-------|------------|
| Default: prebuilt packages, no Astryx build plugin | import `reset.css` and `astryx.css` |
| `@astryxdesign/build` in Vite (`astryxStylex`, with `@astryxdesign/core` aliased to its `src`) | import `reset.css` only. Do **not** import `astryx.css`: it does not exist under `core/src`, and the build fails with `ENOENT ... core/src/astryx.css`. The plugin emits the Astryx CSS itself (`astryx-stylex-*.css`, in `@layer astryx-base`). |
| `@astryxdesign/build` with Next.js and Turbopack | `reset.css`, the theme CSS and the line `@astryx;` in place of `astryx.css` (see the plugin's README) |
| Only a plain StyleX compiler for your own or swizzled code (`@stylexjs/*`) | keep `astryx.css`; the compiler builds only your own source |

Both the failing and the passing Vite build were run on 0.7.16. When in doubt, build once and read the
first error.

### 2. Bootstrap on every branch

The docs reflect the installed version, so read them before you write code:

```bash
npx astryx docs principles --dense   # rules and anti-patterns
npx astryx docs tokens --dense       # spacing, colour, radius, type, shadow
npx astryx docs theme --dense        # Theme provider, light and dark
npx astryx component --list          # every component
npx astryx template --list           # page and block templates
```

On demand:

```bash
npx astryx build "<what you are building>"   # the template to start from
npx astryx template <name> <path>            # scaffold a template
npx astryx component <Name> --dense          # props and usage, before you use or change a component
npx astryx search <query>                    # components, hooks, docs, templates, themes
```

### 3. Astryx rules that bind in the chains

- Start an app screen from a page template. Keep its frame, gap and padding.
  Replace its data, copy and sections.
- Use components for layout (`VStack`, `HStack`, `Grid`, `Card`), not raw
  `<div>` layout.
- Use semantic tokens only. No hard-coded colour or spacing, and no
  `style={{}}`.
- Dense data goes in rows (`Table`, `List`), not in a grid of cards.
- Navigation goes through `useLinkComponent()`, never a hard-coded `<a>`.
- Run `npx astryx component <Name> --dense` before you use a component you have
  not read on this branch.

### 4. How Astryx and Hallmark divide the work

| Question | Who decides |
|----------|-------------|
| Which component, which prop | Astryx (`astryx component`) |
| Layout of an app screen | Astryx page template, then Hallmark's app scope |
| Layout of a marketing or landing page | Hallmark (anatomy and the draw), built from Astryx components |
| Colour, type, radius, motion | The project's Astryx theme |
| Accessibility and "looks generated" | Hallmark's Floor, through `/design-gate` |

Hallmark deals a theme unless the user names one, asks for custom, or the project has a locked
`design.md`. For a landing page in an Astryx project, tell Hallmark in the prompt that the Astryx theme
is the system, and name it (for example "the project's Astryx neutral theme"), so it builds a page
inside that theme instead of dealing its own. Do not expect it to infer this from `package.json`. This landing-page flow has not been run end to end.
The settings-page flow (template, components, gate) has.

When they disagree, the order is: the user's own words and `design-system/PREFERENCES.md`, then
Hallmark's Floor, then `design-system/MASTER.md`, then the project's Astryx theme and rules, then
Hallmark's Reflex gates and the ECC design skills. When MASTER.md exists, tell Hallmark not to deal a
theme (see `unified-design-system`).

### 5. Close the known Floor gaps

Checked by building a Vite app from the `settings` template and by rendering Astryx's own `dashboard`
and `centered-hero` templates, then running Hallmark's linter on the source and on the running page.

**What Hallmark can and cannot see.** Its static tier reads CSS, HTML and component markup. It does
not read StyleX style objects: a hex colour, `transition: all` and `overflowX: hidden` inside
`stylex.create` were not flagged. In an Astryx app the running page is the real check, so always run
`--url` with the render tier. The source path still catches the global CSS and the markup.

**Fix in the app's global CSS.** This exact file was built and run (Vite app, `settings` template, `stone`
theme): `/design-gate src --url ... --scope app --require-render` printed `Floor 0 FAIL · Reflex 0
(3 waived) · render: ran` and PASS. Without the 39b waiver it blocks on one open Reflex.

```css
/* Hallmark · checked: <date> · genre: modern-minimal (inferred)
 * built: the project · v2.0.0 */
/* Hallmark · waive 26b · no :active or :disabled rule in this file, no aria-disabled in the markup · the Astryx components style their own pressed and disabled states from the library */
/* Hallmark · waive 39b · the 20px controls are the native inputs and icon buttons inside Astryx fields that stand 32px tall · the settings fields come from the Astryx library and the field wrapper is the control */
@import '@astryxdesign/core/reset.css';
@import '@astryxdesign/core/astryx.css'; /* omit this line with @astryxdesign/build */

html,
body {
  overflow-x: clip;
}

a:focus-visible {
  outline: var(--focus-outline-width) var(--focus-outline-style) var(--focus-outline-color);
  outline-offset: var(--focus-outline-offset);
}
```

- The stamp (gate 20) must be the first line of the CSS. Only `@charset` may come before it. Do not
  write `floor: 0 FAIL` in it unless the last gate run said so.
- `overflow-x: clip` on `html` and `body` (gate 34). Never `hidden`.
- Astryx draws its own focus ring from `node_modules`, so the linter sees none in the app's source
  (gate 26a). A rule that uses Astryx's focus tokens satisfies it. Keep it on `a`: a global
  `:focus-visible` rule also hits the bare `<input>` inside Astryx's field and draws a second,
  rectangular ring there. This was seen in a screenshot, in a layered rule as well.
- Reflex 26b ("no :active or :disabled styling") fires for the same reason. The waiver line above is
  the syntax Hallmark reads: `waive <gate> · <guard evidence> · <reason>`. The reason must be at least 24
  characters and share a word with the page. `summary.waived` rises to 2 when it works. Never add empty
  rules to silence a gate.

**Chart colours.** Astryx's chart templates already use CSS variables, written with a hex fallback:
`var(--color-data-categorical-blue, #0171E3)`. The hex fallbacks are what gate 48 flags. Remove the
fallback and keep the variable: `var(--color-data-categorical-blue)`. On the `dashboard` template this
took the failures from 18 to 5. `astryx.css` defines the variables, so no fallback is needed.

**Button height.** `size="lg"` is 36px (`--size-element-lg`), the default is 32px. Hallmark's range for
marketing controls is 44 to 52px (Reflex 39b), so `lg` alone does not satisfy it on a landing page.
Either raise `--size-element-lg` in the theme, or waive 39b with a reason. App screens are fine at 32px
(the app range is 32 to 52px).

**Known gaps in the library, not in the app:**

- Theme contrast (Floor, gate 40). Same `settings` template, each stock theme, `/design-gate --url`:

  | Theme | Result |
  |-------|--------|
  | `stone` | Floor 0 FAIL |
  | `neutral` | field edge 1.48:1 (needs 3:1) |
  | `butter` | field edge 1.29:1 |
  | `matcha` | field edge 1.87:1 |
  | `chocolate` | secondary text 3.13:1 (needs 4.5:1) |
  | `gothic` | 8 FAIL, mostly text on the page background (dark-only theme) |

  Start from `npx astryx theme add stone` when the gate must pass, and re-run the gate after any theme
  change. One page of one template was tested; another template can behave differently. A gate that
  blocks on a theme's colours means the theme is wrong, not the gate.
- Gate 48 on the placeholder colours in `astryx.css`, and the 10a "transitioning width" finding on a
  progress bar, come from library code. They show up when a rendered page includes those components.
  Record them in the hand-off. Do not patch `node_modules`.
- Reflex 39b on the `settings` page: native inputs measure 20px inside a 32px field. Waive it with that
  guard evidence, or leave it open and say so.

### 6. Run the design gate

```bash
# The source and the running app together, with the browser checks
/design-gate src --url http://localhost:3000/<route> --scope app --require-render
```

Use `--scope app` for app screens. Leave it off for marketing pages. Always pass the source path with
`--url`: a URL alone checks only the running page, and the token, overflow and stamp gates read source.
The stamp in the global CSS (section 5) is what makes the gate block; without it the gate only reports.
Expect the known library findings in section 5 on a real app, and list them in the hand-off.

## Where It Sits in the Chains

| Chain | Astryx step |
|-------|-------------|
| `/c1` new project | `npm install` and `astryx init` after `/prp-plan`. `/hallmark` builds landing pages from Astryx components; app screens start from `astryx build` and `astryx template`. |
| `/c2` feature | `astryx build "<feature>"`, then `astryx component <Name> --dense` for each component before `/feature-dev` writes code. |
| `/c3` design sprint | Theme changes go through `astryx experimental theme editor`, checked with `--png`. Hallmark redesigns keep Astryx components and change composition. |
| `/c4` shipping | `npx astryx doctor` next to `/quality-gate`, then `/design-gate src --url ... --require-render`. |
| `/c5` maintenance | `npx astryx upgrade --from <old version> --apply` after any `@astryxdesign/core` bump, then `/design-gate`. |

## Examples

Add a settings page to an existing Astryx app (`/c2`):

```bash
npx astryx build "account settings page"
npx astryx template settings src/app/settings
npx astryx component Switch --dense
npx astryx component Field --dense
# write the page, then
/design-gate src/app/settings --url http://localhost:3000/settings --scope app --render
```

A landing page in an Astryx project (`/c1`):

```text
/hallmark a landing page for <product>. The system is this project's Astryx neutral theme and
its components: do not deal a Hallmark theme.
```

Name the Astryx theme in the prompt. Hallmark does not infer it from `package.json`. It then lays out
the page from the visitor's job and builds it from Astryx components.
`/design-gate src --url ... --render` checks it. Expect Reflex 39b on call-to-action buttons (see
section 5) and decide whether to raise the theme's `--size-element-lg` or waive it.

## Notes

- The Astryx repository's own `AGENTS.md` is a contributor guide for changing
  Astryx itself: `pnpm specs:for`, knowledge records, review baselines and
  `/vibe-test`. None of that applies in a project that only uses Astryx. Its
  CLI bootstrap and StyleX capability list do apply.
- `astryx experimental render <page.tsx>` writes one self-contained HTML file.
  It is a quick way to lint a single page with Hallmark without starting a dev
  server. It needs the template's own dependencies installed.
