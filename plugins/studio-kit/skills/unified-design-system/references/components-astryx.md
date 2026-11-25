# Component layer: Astryx

Astryx (`@astryxdesign/core`) is the step 4 choice for React work. Setup,
bootstrap, binding rules and gate fixes are in the `astryx-components` skill.
This file covers only how MASTER.md drives an Astryx theme. [astryx]

## When to use it

Use Astryx when all of these hold:

- React 19 or later, with `@stylexjs/stylex` as a runtime peer.
- Node 22.13 or later for the `astryx` CLI.
- The project has no other component library, or the user asks to migrate.

Do not use it for static HTML, Vue, Svelte, Astro without React or SwiftUI.
Its components are React only. For those, borrow token names only: keep
MASTER.md names equal to Astryx names (`--color-background-body`,
`--color-text-primary`, `--radius-element`) so one MASTER.md can drive a plain
CSS file with `light-dark()` and `color-scheme`. Whether a built Astryx
theme.css works standalone in static HTML is untested, so do not promise it.
[astryx]

## Setup in short

```bash
npm install @astryxdesign/core @stylexjs/stylex @astryxdesign/theme-neutral @astryxdesign/cli
npx astryx init --agent claude
npx astryx theme add neutral
```

Install core and cli at the same version. Import `reset.css` and `astryx.css`
unless the project uses `@astryxdesign/build`. Before using any component run
`npx astryx component <Name> --dense`. Page work starts from
`npx astryx template <name> <path>`. See the `astryx-components` skill for the
rest. [astryx]

## Token mapping: MASTER.md to Astryx theme

| MASTER.md token | Astryx token or config | Note |
|---|---|---|
| --color-bg | `--color-background-body` | page canvas |
| --color-surface | `--color-background-surface`, `--color-background-card`, `--color-background-popover` | set all three together |
| --color-text | `--color-text-primary` and `--color-icon-primary` | keep icon colour in step |
| --color-text-muted | `--color-text-secondary` (disabled: `--color-text-disabled`) | 4.5:1 |
| --color-accent | `--color-accent` | Astryx has one accent. Pick the CTA colour |
| text on accent | `--color-on-accent` | must be set whenever accent changes |
| accent as text or icon | `--color-text-accent`, `--color-icon-accent`, `--color-accent-muted` | re-derive for dark |
| secondary colour | no slot. Use `localTokens` or a categorical hue | |
| --color-border | `--color-border`, strong edge `--color-border-emphasized` | emphasised edge 3:1 |
| error colour | `--color-error`, `--color-on-error`, `--color-error-muted` | success, warning, info follow the same pattern |
| focus ring | `--focus-outline-color`, `--focus-outline-width`, `--focus-outline-offset` | |
| Dark column | second item of a `[light, dark]` tuple | a plain string applies to both modes |
| Display, body, mono font | `typography.heading.family`, `.body.family`, `.code.family` plus `fallbacks` | load the font files yourself |
| Type scale | `typography.scale: {base, ratio}` | see defaults below |
| Spacing | `--spacing-0` to `--spacing-12`, 4px unit | density through `--size-element-sm/md/lg` |
| Radius | `radius: {base, multiplier}` or `--radius-element`, `--radius-container`, `--radius-page`, `--radius-full` | element is buttons and inputs, container is cards |
| Shadow | `--shadow-low`, `--shadow-med`, `--shadow-high` | one value for both modes. Use `light-dark()` inside |
| Motion | `motion: {fast, medium, slow}` or `{tempo, character}`; `--duration-*`, `--ease-*` | see defaults below |
| Dials | MOTION to `motion.tempo` and `character`; DENSITY to `--size-element-*` and `scale.base`; VARIANCE to the page template | |
| Never do | cannot be encoded | stays in MASTER.md section 7 and the gate |

Source: `packages/core/src/theme/tokens.stylex.ts` in the Astryx repo. Status
and chart hues are not derived from the accent. Leave them at defaults. [astryx]

## Recipe: custom theme from MASTER.md

The editor path is experimental. It may change in a patch release. [astryx]

1. Pick a base with `npx astryx theme list`. Minimal starts from neutral or
   stone. Soft starts from butter or chocolate. Brutalist has only y2k as a
   loose start and needs heavy overrides. Product-tool starts from neutral.
2. Generate light and dark from one seed (experimental):

   ```bash
   npx astryx experimental theme editor new <name> --like neutral \
     --accent "<hex>" --neutral "<hex>" --font "<family>" \
     --corners <square|small|medium|large|round|pill|6px> \
     --spacing <tight|compact|medium|roomy|spacious> [--vibrancy 0-100] --png
   ```

   It moves shades so text reaches 4.5:1 and the focus ring 3:1, reports
   contrast problems the theme caused, and writes `themes/<name>/preview.html`.
   This fills the dark column that uupm lacks.
3. Exact MASTER.md values win. Set them one token and one mode at a time:
   `npx astryx experimental theme editor set <name> --color-background-body
   "<hex>" --mode dark`. Dial commands: `set <name> headings semibold`,
   `buttons solid`, `type editorial`, `text-size 16`.
4. Or do it by hand. `npx astryx theme template` writes an annotated
   `theme.template.ts`. Fill `typography`, `radius`, `motion` and `tokens`
   from the table. For a full palette run
   `npx astryx theme palette generate palette.config.json --out palette.generated.ts`.
5. Build and wire: `npx astryx theme build src/theme.ts` (rerun after every
   edit and every Astryx upgrade; always for SSR, Next.js and Remix), then
   `npx astryx theme add <name>`. Wrap the app in
   `<Theme theme={myTheme} mode="system">` from `@astryxdesign/core/theme`.
   Add `<link>` or `@font-face` for the fonts, with fallbacks.
6. Check both modes. Resolve text and surface pairs in light and dark, then
   run the review gate. Stock themes fail somewhere, so re-run after every
   theme change. [astryx] [ecc:astryx-components]
7. Write the theme file path and the commands you ran into MASTER.md section 5
   so the next session reuses them.

I could not run the `astryx` CLI when this was written, so the command shapes
come from its doc source, not from a run. If a flag is rejected, run
`npx astryx experimental theme editor new --help`. [astryx]

## Defaults that clash with our rules

| Astryx default | Our rule | Override in the theme |
|---|---|---|
| Body base 14px | 16px body on web, 18px for trust-first | `typography.scale.base` to 16 (18 for trust-first) |
| Controls 28, 32, 36px (`sm`, `md`, `lg`) | Decision 3: 44px target on touch, 24px hard floor elsewhere, marketing controls 44 to 52px | Raise `--size-element-lg` to 44px and use the `adaptations` rule below. Only `lg` can reach 44px |
| Durations 175, 410, 975ms | Feedback 150 to 300ms, transitions at most 400ms, nothing over 500ms except a deliberate sequence | `motion: {fast: 150, medium: 300, slow: 500}`, or `tempo` 0.75 to 0.85 for product-tool and trust-first |
| Placeholder font size 16 in the template, 14 in tokens | one body size | set it explicitly, never rely on either |

Touch adaptation for Decision 3:

```ts
adaptations: {
  rules: [{
    when: { pointer: 'coarse' },
    value: { tokens: {
      '--size-element-sm': '36px',
      '--size-element-md': '40px',
      '--size-element-lg': '44px',
    } },
  }],
},
```

Decision 3 targets 44px on touch, so also leave 8px between targets and
extend the hit area rather than the icon. [astryx] [uupm] [ecc:accessibility]

Decision 4: if the theme sets the type, Inter is fine. Do not add Inter as a
fallback reach when the user did not ask. [taste-skill]

## Not for user projects

`/create-component` and `/create-theme` are commands inside the Astryx
repository. They are for contributing a component or a theme to the Astryx
monorepo (`packages/core`, `packages/themes`). Do not run them in a user
project. In a project, compose from `npx astryx component --list`, add a
reusable piece with `npx astryx integration add component <Name>`, or copy a
core component with `npx astryx swizzle <Name>`. [astryx]
