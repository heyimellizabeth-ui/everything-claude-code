# Brasa y Mar — Spanish Paella Restaurant Website

A warm, rustic, **wood-fired paella** restaurant website: static HTML/CSS/JS with a single
PHP reservation handler, built to upload straight onto **Hostinger shared hosting**. Themed
on two reference photos (saffron seafood paella on rustic wood; a terracotta-and-woven table
scene) using a terracotta/saffron/cream palette — with **GSAP-powered visual scroll** that
stays accessible and never hides content.

> **Sample branding.** The name *Brasa y Mar*, the menu, prices and address are placeholders.
> See [`DEPLOY.md`](./DEPLOY.md) for the short list of values to change before launch.

## What's inside

| Path | Purpose |
|------|---------|
| `index.html` | Home — hero, story teaser, signature paellas, reserve CTA |
| `menu.html` | Paellas, tapas, drinks |
| `about.html` | Story / how we cook |
| `gallery.html` | "Flavours" wall — illustrated CSS dish art (swap in photos later) |
| `reservations.html` | Reservation form + newsletter signup |
| `404.html` | Themed not-found page |
| `assets/site.css` | Shared theme, dish-art components, responsive layout |
| `assets/site.js` | Scroll progress, reveal-on-scroll, parallax, AJAX form — all progressive |
| `assets/favicon.svg` | Paella-pan favicon |
| `form-handler.php` | Reservation + newsletter handler (PHP `mail()`) |
| `.htaccess`, `robots.txt`, `sitemap.xml` | Hostinger static config + SEO |
| `DEPLOY.md` | Upload + configuration guide |
| `SPEC.md`, `design-system.md`, `council-verdict.md` | Process artifacts |

## How it was built

- **Design tokens** came from the **ui-ux-pro-max** skill (palette, Playfair Display + Karla
  pairing, scroll-storytelling patterns). See [`design-system.md`](./design-system.md).
- **One design fork** (warm daytime vs. dark cinematic theme) was settled by **the council** —
  four advisor voices run as isolated subagents, then the plan itself was reviewed by them.
  See [`council-verdict.md`](./council-verdict.md).
- The **visual-scroll engine and PHP form** were adapted from the repo's
  `templates/queer-nightclub` template and retuned to a warm Mediterranean theme.

## Accessibility & resilience (council-driven)

- **Content is never hidden.** Reveal animations are a pure enhancement: a `<noscript>` rule,
  an IntersectionObserver fallback, and a JS watchdog all force content visible if the GSAP
  CDN is slow, blocked, or JavaScript is off.
- **Reduced motion** disables parallax, reveals and the ticker for users who ask for it.
- **Contrast** meets WCAG AA — dark ink body text on cream; terracotta/saffron only for large
  text and accents.
- **The form fails safe** — origin check and rate limiter both fail open, and bookings are
  logged locally if `mail()` fails, so a reservation is never silently lost.

## Local preview

```bash
cd projects/paella-restaurant
python3 -m http.server 8000
# open http://localhost:8000
```

The reservation email only sends on a real PHP host; locally the form validates and returns
its JSON response. Lint the handler with `php -l form-handler.php`.

## Deploy

See [`DEPLOY.md`](./DEPLOY.md) — edit three values, upload to `public_html/`, done.
