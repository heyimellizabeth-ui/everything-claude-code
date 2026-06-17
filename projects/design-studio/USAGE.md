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
6. Click " Download Config"
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

**Modules** — Optional features that can be toggled:
- **Calendar** — Event listing via RA embed or custom list
- **Gallery** — Flickr embed or image grid
- **Newsletter** — Email signup form
- **Checkout** — Stripe payment link or custom URL
- **Planner** — Booking request form

### Content (NEW)

Add user-generated content to your site:

| Section | Purpose |
|---------|---------|
| **Google Reviews** | Paste raw reviews from Google Maps or submit as JSON. The parser extracts author, rating, and text automatically. |
| **Images** | Hero background image URL (large, full-width), OG social share image, and gallery image URLs (one per line). |

Reviews appear on the home page with star ratings. Images are applied via background-image or `<img>` tags as appropriate.

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
    "ra": "https://ra.co/clubs/yourclub",
    "facebook": "https://facebook.com/yourclub",
    "tiktok": "https://tiktok.com/@yourclub",
    "spotify": "https://open.spotify.com/user/yourclub",
    "youtube": "https://youtube.com/@yourclub"
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
  },
  "reviews": [
    {
      "author": "Google User",
      "text": "Amazing night! Great music and vibe.",
      "rating": 5,
      "source": "google"
    }
  ],
  "images": {
    "hero": "https://...",
    "og": "https://...",
    "gallery": ["https://...", "https://..."]
  },
  "modules": {
    "calendar": {
      "enabled": true,
      "type": "ra-embed"
    },
    "checkout": {
      "enabled": false,
      "url": "https://buy.stripe.com/...",
      "provider": "stripe-link"
    },
    "planner": {
      "enabled": false
    },
    "gallery": {
      "enabled": true,
      "type": "flickr"
    },
    "newsletter": {
      "enabled": true
    }
  }
}
```

## After `/studio-build`

The `/studio-build` command scaffolds your site and reports which content slots still need manual editing:

### Automated slots (pre-filled from config)
- PASS: Reviews — injected from `reviews[]`
- PASS: Social links — drawn from `social.*`
- PASS: Hero image — applied from `images.hero`
- PASS: Modules — calendar, checkout, planner visibility based on `modules.*`

### Manual slots (still need editing)
- **Event data** — event names, dates, ticket links in `index.html` and `events.html`
- **Team bios** — names, roles, photos in `about.html`
- **Gallery** — Flickr album URL (if module enabled) in `gallery.html`
- **Map embed** — Google Maps iframe in `contact.html` (if contact form enabled)
- **Formspree keys** — replace placeholder keys with your real account keys from formspree.io

### Next steps

1. Open `projects/<your-site>/index.html` in a browser
2. Fill in any remaining manual content slots
3. Run `/c3` for design polish (animations, responsive layout, hover states)
4. Run `/c4` for production hardening (CSP headers, performance audit)
5. Deploy to your host (see **Deployment Guide** section below)

## Deployment Guide

### Static hosting (recommended)

Your generated site is a **static site** — just HTML, CSS, JS, and images. No server needed.

**Recommended hosts:**
- **Vercel** — free tier, automatic deploys from git
- **Netlify** — free tier, drag-and-drop or git
- **GitHub Pages** — free, built into GitHub
- **Render** — free tier, easy setup

**Steps:**
1. Create a git repo: `git init projects/<your-site>`
2. Connect to GitHub and push: `git add . && git commit && git push -u origin main`
3. Connect your repo to Vercel/Netlify in their dashboard
4. Site deploys automatically on each push

### With PHP form handling

If you chose `"backend": "php"` in the Design Studio, you'll need a host with PHP support:

- **Hostinger** — $3/mo, includes PHP + unlimited emails
- **Bluehost** — $2.95/mo intro, PHP + cPanel
- **DreamHost** — $2.59/mo, PHP + unlimited databases

Upload the entire `projects/<your-site>/` folder via FTP or their file manager.

### Custom domain

Point your domain registrar's DNS to your host:
- **Vercel**: Add CNAME record → vercel.com (see your project settings)
- **Netlify**: Add CNAME record → your-site.netlify.app
- **GitHub Pages**: Add CNAME file + DNS CNAME record
- **PHP host**: Add A record to host's IP address

### Form emails

If using **Formspree**, emails go directly to your configured `recipientEmail`. No server config needed.

If using **PHP**, emails are sent from your server. Make sure:
1. Replace `xkokywzz` and `xrerjzlo` with real Formspree keys, OR
2. Keep the PHP backend and update `recipientEmail` to your email address

### SSL/HTTPS

Modern hosts (Vercel, Netlify, GitHub Pages) include **free SSL certificates** by default.

For PHP hosts, enable free SSL via your control panel (Let's Encrypt).

## Tips

- Use **Reset** to start over without refreshing the page
- The live preview updates instantly — no save needed
- The preview uses the same fonts and colors your generated site will use
- Font choices are injected as Google Fonts `<link>` tags at scaffold time
- You can re-run `/studio-build` after editing `brand-config.json` directly
