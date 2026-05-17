# Club KUDT — Site Resume

**Built:** May 2026 · **Pipeline:** C3 → C4 → C5 via `/chelp`
**Live:** [clubkudt.nl](https://clubkudt.nl) · **Venue:** Podium Victorie, Alkmaar

---

## What Was Built

Promotional website for **Club KUDT** — Alkmaar's first and only queer night, running since December 2022 at Podium Victorie. The site covers ticketing, past editions, gallery, and community info.

### Pages (5 public + 1 error)

| File | Route | Purpose |
|------|-------|---------|
| `index.html` | `/` | Homepage — hero, events, testimonials, newsletter |
| `events.html` | `/events.html` | Full events listing with upcoming + archive |
| `gallery.html` | `/gallery.html` | Edition history + Flickr embed |
| `about.html` | `/about.html` | Mission, stats, timeline, team |
| `contact.html` | `/contact.html` | Booking/press enquiry form |
| `404.html` | (error) | Custom 404 |

---

## Stack

- **Pure static HTML/CSS/JS** — no build step, no framework
- **GSAP 3.12** — animations, ScrollTrigger, ScrollToPlugin (CDN)
- **Formspree** (`xkokywzz`) — newsletter form backend
- **Hosting:** Hostinger shared hosting (or any static host)
- **Deploy:** Upload contents of this folder to `public_html/`

---

## C3 — Design Improvements Applied

- **Directional scroll reveals** — `.mil-left` / `.mil-right` / `.mil-scale` classes alongside existing `.mil-up`
- **Nav hide-on-scroll** — nav slides out on scroll down, returns on scroll up (all pages)
- **Hero parallax** — `hero-content` moves at 18% scroll rate via GSAP scrub
- **Section line animation** — `.section-line` scales in from left when scrolled into view
- **Animated stat counters** (`about.html`) — 2022 / 780+ / €15 / 100% count up on scroll
- **Staggered tag reveals** — tags animate in sequence (60ms apart)
- **Staggered testimonials** — 150ms stagger between quote cards
- **Value card hover** — red border + icon scale on hover (`about.html`)
- **Team card hover** — red border tint
- **Testimonial left-accent** — red left-border appears on hover
- **Footer link underline slide** — red underline slides in from left on hover
- **Tag hover** — red border highlight on hover

---

## C4 — Security Hardening Applied

### `.htaccess` (new file)

| Header | Value |
|--------|-------|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-XSS-Protection` | `1; mode=block` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | camera, mic, geolocation, payment all off |
| `Content-Security-Policy` | Allows self + GSAP CDN + Formspree; blocks frames |

### Form hardening (`index.html` newsletter)

- **Honeypot field** — hidden `_gotcha` input; bots fill it, form aborts silently
- **Rate-limit guard** — 30 s minimum between submissions (client-side)
- **`maxlength="254"`** on email input — caps input to RFC limit
- **Python scripts blocked** — `.py` files deny-all in `.htaccess`

---

## C5 — Cleanup Applied

- `sitemap.xml` lastmod dates updated to 2026-05-17
- `RESUME.md` (this file) created as handoff doc
- `.htaccess` caching headers added (1-year for images/icons, 1-month for CSS/JS)
- Directory listing disabled (`Options -Indexes`)

---

## Deploying to Hostinger

1. Upload all files in this folder to `public_html/` via FTP or File Manager
2. The `.htaccess` sets security headers automatically on Apache
3. No build step needed — files are ready to serve as-is

## Swapping Content

| What | Where |
|------|-------|
| Next event date | `index.html` (event-card) + `events.html` + JSON-LD |
| Ticket URL | `index.html` CTA button + `events.html` event links |
| Newsletter endpoint | `action="https://formspree.io/f/..."` in `index.html` |
| Gallery photos | Flickr album linked in `gallery.html` |
| Instagram handle | `@clubkudt` links across all pages |

---

## Known Placeholders / TODOs

- Gallery page embeds Flickr — no custom photo upload needed
- Team bios use organizational placeholders — add real names/roles when ready
- Ticket URLs point to Podium Victorie — update per event

---

*Club KUDT · Queer feesten in Alkmaar · Podium Victorie · Est. 2022*
