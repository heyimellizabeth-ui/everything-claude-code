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
- Switching form backend (Formspree <-> PHP)

## How It Works

```
projects/design-studio/index.html  ← paste reviews, images, social, pick modules
      │ (Download brand-config.json)
      ▼
brand.config.json
      │
      ▼
scaffold.js  ──reads──>  templates/queer-nightclub/*.html
      │                  (token placeholders: {{TOKEN}})
      ▼
projects/<name>/         ← fully substituted, production-ready
      │
      ├── validate.js    ← confirms no {{TOKEN}} left
      └── generate-assets.py ← produces og-image.png, favicon.ico
```

## Token Reference

### Core site tokens

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
| `{{SOCIAL_FACEBOOK}}` | `social.facebook` | https://facebook.com/… |
| `{{SOCIAL_TIKTOK}}` | `social.tiktok` | https://tiktok.com/… |
| `{{SOCIAL_SPOTIFY}}` | `social.spotify` | https://open.spotify.com/… |
| `{{SOCIAL_YOUTUBE}}` | `social.youtube` | https://youtube.com/… |
| `{{FORMS_BACKEND}}` | `forms.backend` | php \| formspree |
| `{{FORMSPREE_NEWSLETTER}}` | `forms.newsletterKey` | xkokywzz |
| `{{FORMSPREE_CONTACT}}` | `forms.contactKey` | xrerjzlo |
| `{{FORMS_RECIPIENT_EMAIL}}` | `forms.recipientEmail` | hello@… |
| `{{TICKET_URL}}` | `ticketUrl` | https://… |

### Font tokens

| Token | Config path | Fallback |
|-------|-------------|---------|
| `{{FONT_HEADING}}` | `fonts.heading` | `system-ui, sans-serif` |
| `{{FONT_BODY}}` | `fonts.body` | `system-ui, sans-serif` |
| `{{FONT_GOOGLE_LINK}}` | `fonts.heading` + `fonts.body` | `''` (omitted) |

`{{FONT_GOOGLE_LINK}}` expands to a `<link rel="stylesheet">` tag for Google Fonts, or empty string when no fonts are configured.

### Section display tokens

Section tokens resolve to `''` (visible) or `'display:none'` (hidden) for use in `style="{{TOKEN}}"`.

| Token | Controls |
|-------|---------|
| `{{SECTION_EVENTS}}` / `{{NAV_EVENTS}}` | Events page + nav link |
| `{{SECTION_ABOUT}}` / `{{NAV_ABOUT}}` | About page + nav link |
| `{{SECTION_GALLERY}}` / `{{NAV_GALLERY}}` | Gallery page + nav link |
| `{{SECTION_CONTACT}}` / `{{NAV_CONTACT}}` | Contact page + nav link |
| `{{SECTION_HERO}}` | Hero block on home page |
| `{{SECTION_NEXT_EVENT}}` | Next-event block on home page |
| `{{SECTION_NEWSLETTER}}` | Newsletter signup section |
| `{{SECTION_INSTAGRAM}}` | Instagram CTA section |
| `{{SECTION_MANIFESTO}}` | Manifesto section |
| `{{FOOTER_SOCIAL}}` | Footer social links block |
| `{{FOOTER_NAV}}` | Footer nav links block |
| `{{FOOTER_BPM}}` | Footer BPM badge |

Pages where `sections.<page> === false` are **not written** to the output directory at all.

### Content tokens

| Token | Config path | Notes |
|-------|-------------|-------|
| `{{REVIEWS_JSON}}` | `reviews[]` | JSON array — `[{author,text,rating,source}]` |
| `{{IMAGE_HERO}}` | `images.hero` | URL for hero background-image |
| `{{IMAGE_OG}}` | `images.og` | URL for OG share image |
| `{{IMAGE_GALLERY_LIST}}` | `images.gallery[]` | Comma-separated URLs |

### Module system

Modules toggle features on/off. Each module token resolves to `''` (visible) or `'display:none'` (hidden).

| Token | Config path | Notes |
|-------|-------------|-------|
| `{{MODULE_CALENDAR}}` | `modules.calendar.enabled` | RA embed block on events page |
| `{{MODULE_CALENDAR_TYPE}}` | `modules.calendar.type` | `ra-embed` \| `custom` |
| `{{MODULE_CHECKOUT}}` | `modules.checkout.enabled` | Buy-tickets button block |
| `{{MODULE_CHECKOUT_URL}}` | `modules.checkout.url` | Stripe link or custom URL |
| `{{MODULE_PLANNER}}` | `modules.planner.enabled` | Booking request form on contact page |
| `{{MODULE_GALLERY_TYPE}}` | `modules.gallery.type` | `flickr` \| `grid` |

Modules default to `display:none` when the `modules` key is absent (backwards-compatible).

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
| `commands/studio-build.md` | `/studio-build` slash command |
| `projects/design-studio/index.html` | Browser-based brand config builder |
| `projects/design-studio/USAGE.md` | Design Studio usage guide |

## Google Reviews Parser

The Design Studio browser app includes a heuristic parser for pasting raw Google Maps review text.

It handles two input formats:
1. **JSON array** — `[{"author":"…","text":"…","rating":5}]` → parsed directly
2. **Raw text** — multi-line blocks copied from Google Maps:
   ```
   Alice
   5 stars
   2 reviews
   Amazing night out!
   ```
   The parser extracts name, star count, and review body from each block.

Output format:
```json
[{ "author": "Alice", "text": "Amazing night out!", "rating": 5, "source": "google" }]
```

The parsed array is serialised as `{{REVIEWS_JSON}}` and injected into `index.html` via:
```html
<script>window.__reviews = {{REVIEWS_JSON}};</script>
```
