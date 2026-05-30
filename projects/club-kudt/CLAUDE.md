# CLAUDE.md — Club KUDT Website

Sub-project within `everything-claude-code`. Static promotional site for Club KUDT — Alkmaar's queer night at Podium Victorie.

**Live:** clubkudt.nl · **Pipeline stage:** C5 complete

## Preview

```bash
# From this directory
npx http-server . -p 3456 --cors -c-1
# Open http://localhost:3456
```

## Stack

- Pure static HTML/CSS/JS — no build step
- GSAP 3.12 (CDN) — animations, ScrollTrigger
- Formspree (`xkokywzz`) — newsletter form
- Apache `.htaccess` — security headers, caching
- Deploy: upload folder contents to Hostinger `public_html/`

## Pages

| File | Route |
|------|-------|
| `index.html` | `/` — hero, events, testimonials, newsletter |
| `events.html` | `/events.html` — full listing + archive |
| `gallery.html` | `/gallery.html` — Flickr embed + edition history |
| `about.html` | `/about.html` — mission, stats, timeline, team |
| `contact.html` | `/contact.html` — booking/press form |
| `404.html` | custom error page |

## What's been done (C3–C5)

- **C3** — GSAP scroll animations, nav hide-on-scroll, hero parallax, animated stat counters, staggered reveals
- **C4** — `.htaccess` security headers (CSP, HSTS, X-Frame-Options), honeypot form, rate-limit guard
- **C5** — sitemap dates, caching headers, directory listing off, this RESUME.md

## Content swap cheatsheet

| What to change | Where |
|----------------|-------|
| Next event date | `index.html` event-card + `events.html` + JSON-LD |
| Ticket URL | `index.html` CTA + `events.html` event links |
| Newsletter endpoint | `action="https://formspree.io/f/..."` in `index.html` |
| Gallery photos | Flickr album linked in `gallery.html` |
| Instagram handle | `@clubkudt` across all pages |

## Known placeholders

- Team bios in `about.html` use org placeholders — add real names/roles when ready
- Gallery uses Flickr embed — no local photo uploads needed
- Ticket URLs point to Podium Victorie — update per event
