---
description: Build a site from a Design Studio selection.json (scaffold + layered component snippets)
argument-hint: "<selection.json> <output-dir>"
---

# /studio-build — Generate a Site from Studio Selection

Bridges a `selection.json` exported from the Design Studio UI into a fully
scaffolded site. Reads the embedded brand config, runs the existing
`scripts/site-template/scaffold.js`, then layers the selected component
snippets in as `studio-additions.css`, `studio-additions.js`, and
`studio-components.html`, and injects the link/script tags into `index.html`.

## When to Use

Run this after you've selected components in `projects/design-studio/index.html`
and clicked **DOWNLOAD FILES ↓** to save `selection.json` (and `brand.config.json`).

## Usage

```bash
node scripts/studio/build.js --selection <path-to-selection.json> --out <output-dir>
```

Or via the slash command:

```
/studio-build path/to/selection.json projects/my-new-site
```

## What It Does

1. Reads `selection.json` (must contain a `brand` block and a `components` array)
2. Writes the embedded `brand` to a temp `brand.config.json`
3. Runs `scaffold.js` with the template named in `selection.baseTemplate` (defaults
   to `queer-nightclub`) — produces a full working site in `<output-dir>`
4. Classifies each selected component snippet as CSS, JS, or HTML by content shape
5. Writes `studio-additions.css`, `studio-additions.js`, `studio-components.html`
   in the output directory
6. Injects `<link>` and `<script>` tags into the scaffolded `index.html`
   (idempotent — safe to re-run)
7. Copies `selection.json` into the output as `studio-selection.json` so the
   site remembers its lineage
8. Runs `scripts/site-template/validate.js` to flag any unsubstituted tokens

## Output Layout

```
<output-dir>/
├── index.html                  ← scaffolded, with studio-additions tags injected
├── about.html / contact.html   ← from the base template
├── studio-additions.css        ← concatenated CSS from selected components
├── studio-additions.js         ← concatenated JS from selected components
├── studio-components.html      ← HTML snippets (review and paste manually)
├── studio-selection.json       ← copy of the source selection
└── brand.config.json           ← the brand config that drove the scaffold
```

## After Build

- Open `index.html` in a browser to verify
- Edit `studio-components.html` and copy any HTML chunks into the pages where
  you want them (e.g. paste the cursor div near `<body>`)
- Customize `brand.config.json` to refine the palette/fonts further, then
  re-run the scaffold step alone with `node scripts/site-template/scaffold.js`

## Notes

- The CSS/JS layering is **additive** — it doesn't modify the base template
  files, so re-scaffolding cleanly overwrites without losing your customizations
  to the additions files.
- HTML snippets are written to a sidecar file (not injected) because they need
  to land in specific page positions, which varies by snippet.
