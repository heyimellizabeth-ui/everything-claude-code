---
description: Scaffold a branded site from a brand-config.json downloaded from the Design Studio.
argument-hint: "[path/to/brand-config.json]"
---

# /studio-build — Build a Site from the Design Studio

Turns a `brand-config.json` (downloaded from `projects/design-studio/index.html`) into a
ready-to-use site at `projects/<slug>/index.html` by running the queer-nightclub scaffold.

## When to Use

- After downloading `brand-config.json` from the in-browser Design Studio form
- Re-scaffolding an existing brand with updated config values
- Quick spin-up before running `/c3` for design polish

## Steps

### 1 — Get the config path

If the user passed an argument, use that path directly.

Otherwise ask:

> Paste the path to your brand-config.json (e.g. ~/Downloads/brand-config.json):

Expand `~` to the user's home directory. Verify the file exists; if not, tell the user
and stop.

### 2 — Derive the project slug

Read the config and derive `slug` from `cfg.site.short`:

```js
slug = cfg.site.short.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
```

If `slug` is empty or collides with `design-studio`, fall back to asking the user for a name.

### 3 — Scaffold

```bash
node scripts/site-template/scaffold.js \
  --config "<config-path>" \
  --out "projects/<slug>"
```

### 4 — Validate

```bash
node scripts/site-template/validate.js --dir "projects/<slug>"
```

If validation reports unresolved `{{TOKEN}}` errors, show them to the user and stop.

### 5 — Report

Tell the user:

```
Site scaffolded → projects/<slug>/index.html

Next steps:
  • Open projects/<slug>/index.html in a browser to preview
  • Run /c3 for design polish and responsive tuning
  • Fill in real event dates, gallery URL, and map embed (see site-init for content slots)
```

## Notes

- The Design Studio form is at `projects/design-studio/index.html` — open it in any browser, no server needed.
- Running this command again on the same slug **overwrites** the previous scaffold — safe because the source of truth is `brand-config.json`.
- Binary assets (favicon, etc.) are copied from `templates/queer-nightclub/`; the scaffold does not regenerate `og-image.png` — run `/site-init` or `generate-assets.py` for that.

## Usage Examples

```
/studio-build
/studio-build ~/Downloads/brand-config.json
/studio-build /tmp/my-brand.json
```
