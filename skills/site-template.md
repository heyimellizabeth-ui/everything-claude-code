---
name: site-template
description: Queer nightclub static site template — brand config, token substitution, scaffold workflow, and PHP/Formspree form backends
triggers:
  - templates/queer-nightclub/
  - brand.config.json
  - scripts/site-template/
---

# Site Template — Queer Nightclub

## When to Use

Auto-activates when working on files in `templates/queer-nightclub/`, `brand.config.json`,
or `scripts/site-template/`. Use when:

- Creating a new site from the template
- Adding a new brand token to the template
- Debugging scaffold or validate output
- Switching form backend (Formspree ↔ PHP)

## How It Works

```
brand.config.json
      │
      ▼
scaffold.js  ──reads──▶  templates/queer-nightclub/*.html
      │                  (token placeholders: {{TOKEN}})
      ▼
projects/<name>/         ← fully substituted, production-ready
      │
      ├── validate.js    ← confirms no {{TOKEN}} left
      └── generate-assets.py ← produces og-image.png, favicon.ico
```

## Token Reference

| Token | Config path | Example |
|-------|-------------|---------|
| `{{SITE_NAME}}` | `site.name` | Club KUDT |
| `{{SITE_SHORT}}` | `site.short` | KUDT |
| `{{SITE_DOMAIN}}` | `site.domain` | clubkudt.nl |
| `{{SITE_TAGLINE}}` | `site.tagline` | Party in a Queer Space |
| `{{SITE_DESCRIPTION}}` | `site.description` | Meta description |
| `{{SITE_LANG}}` | `site.lang` | nl |
| `{{SITE_LOCALE}}` | `site.locale` | nl_NL |
| `{{SITE_EST}}` | `site.estYear` | 2022 |
| `{{SITE_BPM}}` | `site.bpm` | 140 BPM |
| `{{COLOR_VOID}}` | `colors.void` | #0D0D0D |
| `{{COLOR_CREAM}}` | `colors.cream` | #F5F0E8 |
| `{{COLOR_ACCENT}}` | `colors.accent` | #E8415A |
| `{{COLOR_SURFACE}}` | `colors.surface` | #1A1A1A |
| `{{COLOR_MUTED}}` | `colors.muted` | #888070 |
| `{{VENUE_NAME}}` | `venue.name` | Podium Victorie |
| `{{VENUE_CITY}}` | `venue.city` | Alkmaar |
| `{{VENUE_REGION}}` | `venue.region` | Noord-Holland |
| `{{VENUE_COUNTRY}}` | `venue.country` | NL |
| `{{SOCIAL_INSTAGRAM}}` | `social.instagram` | https://instagram.com/… |
| `{{SOCIAL_RA}}` | `social.ra` | https://ra.co/clubs/… |
| `{{FORMS_BACKEND}}` | `forms.backend` | php \| formspree |
| `{{FORMSPREE_NEWSLETTER}}` | `forms.newsletterKey` | xkokywzz |
| `{{FORMSPREE_CONTACT}}` | `forms.contactKey` | xrerjzlo |
| `{{FORMS_RECIPIENT_EMAIL}}` | `forms.recipientEmail` | hello@… |
| `{{TICKET_URL}}` | `ticketUrl` | https://… |

## Adding a New Token

1. Add the value to `brand.config.json` schema
2. Add the `{{TOKEN}}` → config mapping to `buildTokenMap()` in `scripts/site-template/scaffold.js`
3. Place `{{TOKEN}}` in the relevant template file(s) under `templates/queer-nightclub/`
4. Run `node scripts/site-template/scaffold.js` and `validate.js` to confirm

## Form Backends

### Formspree (default)
- Set `"backend": "formspree"` in config
- Forms POST to `https://formspree.io/f/<key>`
- No server required — works on any static host

### PHP
- Set `"backend": "php"` and provide `recipientEmail`
- Forms POST to `form-handler.php` (included in scaffold output)
- Requires PHP with `mail()` enabled (Hostinger, most shared hosts)
- Includes: honeypot check, per-IP rate limiting (30 s), input sanitization, CORS origin lock

## Quick Commands

```bash
# Scaffold a new site
node scripts/site-template/scaffold.js --config projects/my-club/brand.config.json --out projects/my-club

# Validate no tokens missed
node scripts/site-template/validate.js --dir projects/my-club

# Run tests
node tests/site-template/scaffold.test.js
```

## Files

| Path | Purpose |
|------|---------|
| `templates/queer-nightclub/brand.config.json` | Example config (Club KUDT values) |
| `templates/queer-nightclub/*.html` | Token-substituted HTML pages |
| `templates/queer-nightclub/form-handler.php` | PHP form backend |
| `scripts/site-template/scaffold.js` | Scaffold engine |
| `scripts/site-template/validate.js` | Token completeness checker |
| `tests/site-template/scaffold.test.js` | Test suite |
| `commands/site-init.md` | `/site-init` slash command |
