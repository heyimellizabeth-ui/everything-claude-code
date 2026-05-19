# Design Studio — Usage Guide

A browser-based brand builder that generates a `brand-config.json` you can feed
directly into the site scaffolder via `/studio-build`.

## Quick Start

```
open projects/design-studio/index.html   # macOS
xdg-open projects/design-studio/index.html  # Linux
start projects/design-studio/index.html  # Windows
```

Or open the file in any browser — no server needed.

## Workflow

```
1. Open projects/design-studio/index.html
        ↓
2. Fill in Brand tab  (name, tagline, venue, social links)
        ↓
3. Pick Colors tab    (use a preset or dial in custom hex values)
        ↓
4. Choose Type tab    (heading font + body font)
        ↓
5. Toggle Sections    (choose which pages and home sections to include)
        ↓
6. Click "⬇ Download Config"
        ↓   saves brand-config.json to ~/Downloads/
7. In Claude Code, run:  /studio-build
        ↓
8. Site lands in  projects/<your-site-name>/
```

## Panel Tabs

### Brand

| Field | Notes |
|-------|-------|
| Site Name | Full name — used in `<title>` and footer |
| Short Name | Wordmark / logo text (e.g. `KUDT`) |
| Tagline | Hero subtitle and meta description fallback |
| Meta Description | SEO one-liner for search and social |
| Domain | Used in canonical URLs and JSON-LD |
| Language Code | `en`, `nl`, `de`, `fr`, `es` |
| Est. Year | Displayed in hero and footer |
| BPM | Flavor text in footer — any string works |
| Venue fields | Structured data for Google rich results |
| Social URLs | Instagram and Resident Advisor links |
| Ticket URL | CTA button in hero section |
| Form Backend | `formspree` (recommended) or `php` |
| Formspree Keys | Sign up at formspree.io for free keys |

### Colors

Five semantic color tokens:

| Token | Role |
|-------|------|
| Background (Void) | Page background |
| Text / Cream | Body text and headings |
| Accent | Buttons, links, highlights |
| Surface | Nav, cards, footer bg |
| Muted | Subtitles, borders, metadata |

Six built-in presets: **Void Dark**, **Dusk Purple**, **Deep Ocean**,
**Ember**, **Jade Night**, **Quartz** (light mode).

You can also type any hex value directly — the color picker and hex field
stay in sync.

### Type

Choose independent heading and body fonts from six Google Fonts options:

- **Syne** — geometric, editorial
- **Unbounded** — wide, bold, techno
- **Playfair Display** — elegant serif
- **Space Grotesk** — clean, modern
- **Inter** — neutral, readable
- **DM Sans** — friendly grotesque

### Sections

Toggle which pages and home sections to generate. Pages that are off are
removed from the scaffold output and their nav links are cleaned up automatically.

## brand-config.json Format

```json
{
  "site": {
    "name": "Club Nacht",
    "short": "NACHT",
    "domain": "clubnacht.nl",
    "tagline": "Underground · Electronic · Queer",
    "description": "...",
    "lang": "nl",
    "locale": "nl_NL",
    "estYear": "2024",
    "bpm": "128 BPM"
  },
  "colors": {
    "void": "#0A0714",
    "cream": "#EDE8F5",
    "accent": "#9B5CF6",
    "surface": "#160D24",
    "muted": "#8070A0"
  },
  "fonts": {
    "heading": "Syne",
    "body": "Inter"
  },
  "venue": {
    "name": "Shelter Amsterdam",
    "city": "Amsterdam",
    "region": "Noord-Holland",
    "country": "NL"
  },
  "social": {
    "instagram": "https://instagram.com/yourclub",
    "ra": "https://ra.co/clubs/yourclub"
  },
  "forms": {
    "backend": "formspree",
    "newsletterKey": "...",
    "contactKey": "...",
    "recipientEmail": ""
  },
  "ticketUrl": "https://...",
  "sections": {
    "index": true,
    "events": true,
    "about": true,
    "gallery": true,
    "contact": true,
    "hero": true,
    "next-event": true,
    "newsletter": true,
    "instagram": true,
    "manifesto": false,
    "footer-social": true,
    "footer-nav": true,
    "footer-bpm": true
  }
}
```

## After `/studio-build`

The command will tell you which content slots still need manual editing:

- **Event data** — names, dates, ticket links in `index.html` and `events.html`
- **Team bios** — names and roles in `about.html`
- **Gallery** — Flickr album URL in `gallery.html`
- **Map embed** — Google Maps iframe in `contact.html`
- **Formspree keys** — replace placeholder keys with real account keys

Run `/c3` after filling content to polish animations, spacing, and responsiveness.

## Tips

- Use **Reset** to start over without refreshing the page
- The live preview updates instantly — no save needed
- The preview uses the same fonts and colors your generated site will use
- Font choices are injected as Google Fonts `<link>` tags at scaffold time
- You can re-run `/studio-build` after editing `brand-config.json` directly
