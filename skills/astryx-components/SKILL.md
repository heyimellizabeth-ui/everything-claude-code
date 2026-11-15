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

- Import `@astryxdesign/core/reset.css` and `@astryxdesign/core/astryx.css` in the global CSS.
- Wrap the app: `<Theme theme={themes[defaultThemeSlug]}><App /></Theme>`, with `Theme` from
  `@astryxdesign/core/theme`.
- `npx astryx theme list` shows the other themes. Ask the user which look they want before building
  screens; neutral is the default.
- Some templates need extra packages (for example `@heroicons/react`, `recharts`). The scaffold
  command prints the exact install line.

Checked on a fresh Vite React 19 project with `@astryxdesign/core` 0.7.16: the `settings` template
builds and renders.

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
inside that theme instead of dealing its own. Do not expect it to infer this from `package.json`.

When the two disagree, the order is: the user's own words, then Hallmark's Floor, then the project's
Astryx theme and rules, then Hallmark's Reflex gates and the ECC design skills.

### 5. Close the known Floor gaps

Checked by building a Vite app from the `settings` template and by rendering Astryx's own `dashboard`
and `centered-hero` templates, then running Hallmark's linter on the source and on the running page.

**What Hallmark can and cannot see.** Its static tier reads CSS, HTML and component markup. It does
not read StyleX style objects: a hex colour, `transition: all` and `overflowX: hidden` inside
`stylex.create` were not flagged. In an Astryx app the running page is the real check, so always run
`--url` with the render tier. The source path still catches the global CSS and the markup.

**Fix in the app's global CSS** (all three removed the source-level FAILs in the test app):

```css
/* Hallmark · checked: <date> · genre: modern-minimal (inferred)
 * floor: 0 FAIL · fixed: 0 · structural: 0 printed
 * built: the project · v2.0.0 */
@import '@astryxdesign/core/reset.css';
@import '@astryxdesign/core/astryx.css';

html,
body {
  overflow-x: clip;
}

:focus-visible {
  outline: var(--focus-outline-width) var(--focus-outline-style) var(--focus-outline-color);
  outline-offset: var(--focus-outline-offset);
}
```

- The stamp (gate 20) must be the first line of the CSS. Only `@charset` may come before it.
- `overflow-x: clip` (gate 34). Never `hidden`.
- Astryx draws its own focus ring from `node_modules`, so the linter sees none in the app's source
  (gate 26a). A `:focus-visible` rule that uses Astryx's focus tokens satisfies it and matches the
  library's ring.
- Reflex 26b "no :active / :disabled styling" fires for the same reason. Waive it in the stamp with
  the reason "Astryx components style their own states". Do not add empty rules to silence it.

**Chart colours.** Astryx's chart templates already use CSS variables, written with a hex fallback:
`var(--color-data-categorical-blue, #0171E3)`. The hex fallbacks are what gate 48 flags. Remove the
fallback and keep the variable: `var(--color-data-categorical-blue)`. On the `dashboard` template this
took the failures from 18 to 5. `astryx.css` defines the variables, so no fallback is needed.

**Button height.** `size="lg"` is 36px (`--size-element-lg`), the default is 32px. Hallmark's range for
marketing controls is 44 to 52px (Reflex 39b), so `lg` alone does not satisfy it on a landing page.
Either raise `--size-element-lg` in the theme, or waive 39b with a reason. App screens are fine at 32px
(the app range is 32 to 52px).

**Known gaps in the library, not in the app:**

- Field edge contrast (Floor, gate 40): on the neutral theme, text fields measure 1.48:1 against what
  surrounds them, under the 3:1 minimum. This is a theme colour. Try another theme with
  `npx astryx theme list`, or raise the field border token in a custom theme, and re-run the gate.
- Gate 48 on the placeholder colours in `astryx.css`, and the 10a "transitioning width" finding on a
  progress bar, come from library code. The gate on a real app will show them; record them in the
  hand-off instead of patching `node_modules`.

### 6. Run the design gate

```bash
# The source and the running app together, with the browser checks
/design-gate src --url http://localhost:3000/<route> --scope app --require-render
```

Use `--scope app` for app screens. Leave it off for marketing pages. Always pass the source path with
`--url`: a URL alone checks only the running page, and the token, overflow and stamp gates read source.
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
