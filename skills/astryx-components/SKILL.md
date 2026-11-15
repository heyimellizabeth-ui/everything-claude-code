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

```bash
npm install @astryxdesign/core @astryxdesign/cli
npx astryx init --agent claude
```

`init` writes a managed Astryx block into the project's `CLAUDE.md`. Wrap the
app in `<Theme theme={...}>` from `@astryxdesign/core/theme`, and import
`@astryxdesign/core/reset.css` and `@astryxdesign/core/astryx.css`.

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
| Colour, type, radius, motion | The project's Astryx theme. Hallmark does not deal a theme; the Astryx theme is the locked system, like a `design.md` |
| Accessibility and "looks generated" | Hallmark's Floor, through `/design-gate` |

When the two disagree, the order is: the user's own words, then Hallmark's
Floor, then the project's Astryx theme and rules, then Hallmark's Reflex gates
and the ECC design skills.

### 5. Close the known Floor gaps

Astryx's own templates were linted with Hallmark (rendered with
`astryx experimental render`, then `sloplint --render`). Most of the Floor
passed. These are the gaps to close in the app's own code:

| Gap | Fix in the app |
|-----|----------------|
| No `overflow-x: clip` on `html` and `body` (gate 34) | Add it to the app's global CSS. Never `hidden`. |
| No Hallmark stamp (gate 20) | Put the Hallmark stamp on line 1 of the app's own global CSS. |
| Chart colours appear as hex values in inline SVG (gate 48) | Give the chart library the `dataVars` CSS variables from `@astryxdesign/core/theme/dataTokens.stylex`, not resolved hex values from `useTheme()`. |
| Buttons are 32px tall on a marketing page (Reflex 39b) | Use `size="lg"` for marketing calls to action. App screens keep the default size. |

Two findings come from Astryx's own stylesheet, not from the app, and are not
the app's to fix:

- Gate 48 on the input placeholder colours in `astryx.css`.
- Reflex 37 "18 font families". This is a misread of the token stylesheet.

That is why the design gate lints the app's source and the running app, not
the bundled library CSS.

### 6. Run the design gate

```bash
# The app's own files
/design-gate src --scope app
# The running app, with the browser checks
/design-gate --url http://localhost:3000/<route> --scope app --render
```

Use `--scope app` for app screens. Leave it off for marketing pages.

## Where It Sits in the Chains

| Chain | Astryx step |
|-------|-------------|
| `/c1` new project | `npm install` and `astryx init` after `/prp-plan`. `/hallmark` builds landing pages from Astryx components; app screens start from `astryx build` and `astryx template`. |
| `/c2` feature | `astryx build "<feature>"`, then `astryx component <Name> --dense` for each component before `/feature-dev` writes code. |
| `/c3` design sprint | Theme changes go through `astryx experimental theme editor`, checked with `--png`. Hallmark redesigns keep Astryx components and change composition. |
| `/c4` shipping | `npx astryx doctor` next to `/quality-gate`, then `/design-gate --url ... --require-render`. |
| `/c5` maintenance | `npx astryx upgrade --from <old version> --apply` after any `@astryxdesign/core` bump, then `/design-gate`. |

## Examples

Add a settings page to an existing Astryx app (`/c2`):

```bash
npx astryx build "account settings page"
npx astryx template settings src/app/settings
npx astryx component Switch --dense
npx astryx component Field --dense
# write the page, then
/design-gate src/app/settings --scope app
/design-gate --url http://localhost:3000/settings --scope app --render
```

A landing page in an Astryx project (`/c1`):

```text
/hallmark a landing page for <product>, built with the project's Astryx components and theme
```

Hallmark reads the Astryx theme in its pre-flight, skips its own theme deal,
lays out the page from the visitor's job, and builds it from Astryx components.
`/design-gate --url ... --render` then checks it.

## Notes

- The Astryx repository's own `AGENTS.md` is a contributor guide for changing
  Astryx itself: `pnpm specs:for`, knowledge records, review baselines and
  `/vibe-test`. None of that applies in a project that only uses Astryx. Its
  CLI bootstrap and StyleX capability list do apply.
- `astryx experimental render <page.tsx>` writes one self-contained HTML file.
  It is a quick way to lint a single page with Hallmark without starting a dev
  server.
