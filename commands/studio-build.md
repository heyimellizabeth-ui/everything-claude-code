---
description: Build a site from a brand-config.json downloaded from the Design Studio
argument-hint: "[path/to/brand-config.json]"
---

# /studio-build — Build Site from Design Studio Config

Takes a `brand-config.json` produced by `projects/design-studio/index.html` and
scaffolds a complete static website into `projects/<site-name>/`.

## When to Use

- After downloading a config from the Design Studio
- Re-building / updating an existing project after changing brand values
- Automating the design → site pipeline end-to-end

## Steps

### 1 — Locate brand-config.json

If the user passed a path argument, use it. Otherwise look in these locations (first match wins):

1. `./brand-config.json`
2. `~/Downloads/brand-config.json`
3. Ask the user for the path

Read and parse the file. Validate it has at minimum: `site.name`, `site.short`, `colors`, `venue`.

### 2 — Derive project name

```js
const projectName = config.site.name
  .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
```

Confirm the output directory with the user: `projects/<projectName>/`

### 3 — Write brand.config.json to project dir

```bash
mkdir -p projects/<projectName>
cp <config-path> projects/<projectName>/brand.config.json
```

### 4 — Scaffold the site

```bash
node scripts/site-template/scaffold.js \
  --config projects/<projectName>/brand.config.json \
  --out projects/<projectName>
```

### 5 — Font tokens (handled automatically by scaffold)

The Design Studio config includes a `fonts` object (`{ heading, body }`).
`scaffold.js` maps these to `{{FONT_HEADING}}`, `{{FONT_BODY}}`, and
`{{FONT_GOOGLE_LINK}}` — the Google Fonts `<link>` tag is injected into every
page automatically. No extra step needed.

If `cfg.fonts` is absent (legacy configs), the tokens fall back to
`system-ui, sans-serif` and the Google Fonts link is omitted.

### 6 — Apply section flags

The Design Studio config includes a `sections` map. Pages whose flag is `false` should be
removed from the output directory and their nav links cleaned up:

```js
const pages = { index:'index.html', events:'events.html', about:'about.html', gallery:'gallery.html', contact:'contact.html' };
for (const [key, file] of Object.entries(pages)) {
  if (!config.sections?.[key]) {
    // remove file, remove its <a> from nav in remaining pages
  }
}
```

### 7 — Validate output

```bash
node scripts/site-template/validate.js --dir projects/<projectName>
```

Fix any remaining `{{TOKEN}}` placeholders before continuing.

### 8 — Generate brand assets

```bash
cd projects/<projectName> && python generate-assets.py
```

Produces `og-image.png`, `favicon.ico`, and `apple-touch-icon.png` from brand colors.

### 9 — Report

Tell the user:

- Output directory: `projects/<projectName>/`
- Pages generated (list)
- Any manual content slots still needed:
  - Event names, dates, ticket URLs (`index.html`, `events.html`)
  - Team bios (`about.html`)
  - Gallery / Flickr URL (`gallery.html`)
  - Google Maps iframe (`contact.html`)
  - Formspree keys if placeholders remain
- Next step: open `projects/<projectName>/index.html` in a browser to review

### 10 — Offer session handoff

After the report, ask the user:

> "Want me to save session state so you can pick this up in a new session?
> Just say yes and I'll run `/save-session` with everything pre-filled."

If the user agrees, invoke `/save-session` with context pre-populated:

- **What's being built**: `projects/<projectName>/` — static site scaffolded from Design Studio config
- **Current state**: Scaffold complete. Pages: [list generated pages]. Brand assets: generated or pending.
- **What not to retry**: Do not re-run scaffold without editing `brand-config.json` first — it overwrites output.
- **What still needs manual content**: [same list from Step 9 — events, bios, gallery URL, map embed, form keys]
- **Exact next step**: Open `projects/<projectName>/index.html` and fill in [first empty slot].
- **Environment notes**: Config lives at `projects/<projectName>/brand.config.json`. Re-run `/studio-build projects/<projectName>/brand.config.json` to rebuild after any config edits.

In a future session, `/resume-session` will load this state and Claude will brief the project before the user types anything.

## Usage Examples

```
/studio-build
/studio-build ~/Downloads/brand-config.json
/studio-build projects/my-club/brand-config.json
```
