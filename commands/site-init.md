---
description: Scaffold a new site from the queer-nightclub template using a brand config
argument-hint: "[project-name] [--config path/to/brand.config.json]"
---

# site-init — Scaffold a New Site from Template

Generates a complete static website by applying a `brand.config.json` to the
`templates/queer-nightclub/` template. All brand tokens are substituted; the result
is a production-ready site in `projects/<name>/`.

## When to Use

- Starting a new nightlife / venue / event brand site
- Re-skinning the Club KUDT template for a different identity
- Quickly spinning up a site scaffold before design iteration (then run /c3)

## Steps

### 1 — Gather brand config values

If the user hasn't provided a `brand.config.json`, ask them interactively for:

| Field | Example |
|-------|---------|
| Site name | Club Nacht |
| Short name (used as logo wordmark) | NACHT |
| Domain | clubnacht.nl |
| Tagline | Underground · Electronic · Queer |
| Description (meta) | One-liner for SEO and social previews |
| Language code | nl / en / de |
| Locale | nl_NL / en_GB |
| Est. year | 2024 |
| BPM (footer flavor text) | 128 BPM |
| Background color | #0A0A0A |
| Text/cream color | #F0EDE6 |
| Accent color | #7B2FBE |
| Surface color | #181818 |
| Muted color | #7A7070 |
| Venue name | Shelter Amsterdam |
| Venue city | Amsterdam |
| Venue region | Noord-Holland |
| Venue country code | NL |
| Instagram URL | https://www.instagram.com/clubnacht/ |
| RA profile URL | https://ra.co/clubs/clubnacht |
| Form backend | `php` or `formspree` |
| Formspree newsletter key | (if formspree) |
| Formspree contact key | (if formspree) |
| Recipient email | (if php) hello@clubnacht.nl |
| Ticket URL | https://… |

### 2 — Write brand.config.json

Write the collected values to `projects/<name>/brand.config.json`.
Use `templates/queer-nightclub/brand.config.json` as the schema reference.

### 3 — Scaffold

```bash
node scripts/site-template/scaffold.js \
  --config projects/<name>/brand.config.json \
  --out projects/<name>
```

### 4 — Validate

```bash
node scripts/site-template/validate.js --dir projects/<name>
```

Fix any remaining `{{TOKEN}}` errors before proceeding.

### 5 — Generate brand assets

```bash
cd projects/<name> && python generate-assets.py
```

This produces `og-image.png`, `favicon.ico`, and `apple-touch-icon.png` using the
brand colors from `brand.config.json`.

### 6 — Remind user of manual content slots

After scaffolding, tell the user which content they still need to fill in:

- **Event data**: event names, dates, ticket URLs in `index.html` and `events.html`
- **Team bios**: real names and roles in `about.html` — Team section
- **Gallery**: Flickr album URL in `gallery.html`
- **Map embed**: Google Maps iframe in `contact.html`
- **Formspree keys** (if using Formspree): replace placeholder keys with real account keys
- **PHP recipient email** (if using PHP backend): confirm `brand.config.json` recipientEmail

### 7 — Optional: Run /c3 for design polish

Once content is in place, run `/c3` to tune animations, responsive layout, and visual hierarchy.

## Form Backend Notes

### Formspree (default, easiest)
Set `"backend": "formspree"` in brand.config.json.
Sign up at formspree.io, create two forms (newsletter + contact), paste the keys.
No server-side code needed.

### PHP (self-hosted, no third-party)
Set `"backend": "php"` in brand.config.json and provide `recipientEmail`.
`form-handler.php` is included in the scaffold output.
Works on Hostinger and any host with PHP mail() enabled.
Upload alongside the HTML files — no extra config needed.

## Usage Examples

```
/site-init clubnacht
/site-init my-new-venue --config /tmp/my-brand.json
```
