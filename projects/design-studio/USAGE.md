# Design Studio — Workflow

Complete pipeline: **catalog your sites → browse + select elements → generate a new site**.

## Files

| File | Role |
|------|------|
| `scripts/studio/analyze-styles.js` | Scans sites, writes `catalog.json` and `catalog.js` |
| `projects/design-studio/index.html` | Visual showcase (open in browser, no server needed) |
| `projects/design-studio/catalog.json` | Generated catalog (don't edit by hand) |
| `projects/design-studio/catalog.js` | Same data as `window.CATALOG` for file:// loading |
| `scripts/studio/build.js` | Reads `selection.json` and produces a working site |
| `commands/studio-build.md` | Slash command wrapper for `build.js` |

## End-to-End

### 1. Drop your site folders into `projects/source-sites/`

```
projects/source-sites/
  ashley-creative-portfolio/
  foodking-fast-food-restaurant/
  any-new-site/
```

### 2. Run the analyzer

```bash
node scripts/studio/analyze-styles.js
```

Writes a fresh `catalog.json` and `catalog.js`. Detects framework families
(`mil`, `bootstrap`, `custom`) and marks shared components (e.g. the cursor +
preloader that the Ashley template ships, which Club KUDT inherited).

### 3. Open the studio

Open `projects/design-studio/index.html` in a browser (double-click works —
no server needed).

- **Sidebar filters:** Categories · Sources · Frameworks
- **Search bar** in the header
- **Cards:** live iframe preview, source badge, framework badge, `🔗 SHARED`
  badge when a component is part of a multi-site framework
- **CODE button:** expands the raw snippet drawer
- **SELECT button:** adds to selection (persisted in localStorage)

### 4. Generate

Click **GENERATE SITE →** in the sticky selection bar. The modal opens with:

- A list of your selected components
- A **Brand details** form (site name, short name, domain, city, tagline)
- The **Resolved palette** swatches (auto-populated from any selected color
  element — defaults to Club KUDT's void palette)
- A fallback **Claude prompt** if you want to drive the build manually

Click **DOWNLOAD FILES ↓**. Your browser saves:

- `selection.json` — full payload (brand + components with snippets)
- `brand.config.json` — same schema as `scripts/site-template/scaffold.js`
  already consumes

### 5. Build the site

Move both files into the repo (e.g. into `projects/my-new-site/`) and run:

```bash
node scripts/studio/build.js --selection projects/my-new-site/selection.json --out projects/my-new-site/
```

Or use the slash command:

```
/studio-build projects/my-new-site/selection.json projects/my-new-site
```

This:
1. Runs `scaffold.js` with the embedded brand config → produces a full
   working site (queer-nightclub template by default)
2. Concatenates selected snippets into `studio-additions.css`,
   `studio-additions.js`, `studio-components.html`
3. Injects `<link>` and `<script>` tags into `index.html`
4. Validates the result (warns on unsubstituted tokens)

### 6. Open and customize

Open `projects/my-new-site/index.html` in a browser. Edit `brand.config.json`
or the additions files to refine.

## Reference Libraries

See `REFERENCES.md` for a curated list of 2026 React UI/UX repos
(shadcn, MagicUI, React Bits, neo-brutalist, R3F, etc.) that complement
the studio catalog. Run `./scripts/studio/setup-ui-libs.sh` to clone
them locally into `~/dev/_ref/ui-libs/` for offline browsing.

The **REFS ↗** link in the studio header opens the references file.

## Notes

- **`🔗 SHARED` badge:** components like the cursor and preloader are part of
  the `mil-` framework shared by Ashley and Club KUDT. Selecting once is
  enough — the studio doesn't need duplicates.
- **Re-running `build.js`** is idempotent — link/script tags are injected
  exactly once.
- **HTML snippets** land in `studio-components.html` for you to paste into
  the right pages by hand (each snippet's target location varies).
- **Only `queer-nightclub` template exists today.** Adding portfolio /
  restaurant templates is on the roadmap once you've built a few sites with
  the current setup.
