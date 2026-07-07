# Portfolio Template

A multi-page portfolio/personal site template: type-driven, editorial, asymmetric.
Light-first with a designed (not inverted) dark mode, zero third-party JavaScript,
and every brand fact expressed as a `{{TOKEN}}` placeholder driven by
`brand.config.json`.

All demo content (the persona "Noor Visser", projects, studios, timeline) is
**fictional** — replace it with your own before deploying.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Hero (animated name), selected work grid, about teaser, contact CTA |
| `work.html` | Full project index with client-side discipline filter |
| `about.html` | Bio, services, experience timeline |
| `contact.html` | Validated contact form (Formspree or self-hosted PHP), availability, socials |
| `404.html` | On-brand error page (wired via `.htaccess` `ErrorDocument`) |

## Quick start

1. Edit `brand.config.json` — every value there maps to a token below.
2. Replace each `{{TOKEN}}` in the HTML/support files with its config value
   (search-and-replace, or your own build step; tokens are plain strings).
3. Replace the demo copy: bio, services, timeline, and the project blocks
   (see "Projects" below).
4. Run `python generate-assets.py` (needs Pillow) to regenerate `og-image.png`,
   `favicon.ico`, and `apple-touch-icon.png` from your config, or supply your own.
5. Upload everything except `generate-assets.py` and this README to your host's
   web root. `.htaccess` assumes Apache (Hostinger-style shared hosting).

## Token reference

| Token | Config path | Demo value |
|-------|-------------|------------|
| `{{SITE_NAME}}` | `site.name` | Noor Visser |
| `{{SITE_DOMAIN}}` | `site.domain` | noorvisser.example |
| `{{SITE_TAGLINE}}` | `site.tagline` | Editorial systems, built to ship |
| `{{SITE_DESCRIPTION}}` | `site.description` | (one-sentence practice description) |
| `{{SITE_LANG}}` / `{{SITE_LOCALE}}` | `site.lang` / `site.locale` | en / en_US |
| `{{OWNER_NAME}}` / `{{OWNER_FIRST}}` | `owner.name` / `owner.first` | Noor Visser / Noor |
| `{{OWNER_ROLE}}` | `owner.role` | Digital designer & creative developer |
| `{{OWNER_CITY}}` / `{{OWNER_COUNTRY}}` | `owner.city` / `owner.country` | Amsterdam / NL |
| `{{OWNER_EMAIL}}` | `owner.email` | hello@noorvisser.example |
| `{{AVAILABILITY}}` | `owner.availability` | Booking projects for autumn 2026 |
| `{{COLOR_PAPER}}` `{{COLOR_INK}}` `{{COLOR_SURFACE}}` `{{COLOR_MUTED}}` `{{COLOR_ACCENT}}` | `colors.light.*` | see config |
| `{{COLOR_PAPER_DARK}}` ... `{{COLOR_ACCENT_DARK}}` | `colors.dark.*` | see config |
| `{{FONT_HEADING}}` / `{{FONT_BODY}}` | `fonts.heading` / `fonts.body` | Fraunces / Inter |
| `{{FONT_GOOGLE_LINK}}` | `fonts.googleLink` | full `<link>` tags for Google Fonts |
| `{{NAV_WORK}}` `{{NAV_ABOUT}}` `{{NAV_CONTACT}}` | `nav.*` | Work / About / Contact |
| `{{SOCIAL_INSTAGRAM}}` `{{SOCIAL_LINKEDIN}}` `{{SOCIAL_GITHUB}}` `{{SOCIAL_DRIBBBLE}}` | `social.*` | placeholder URLs |
| `{{FORMSPREE_CONTACT}}` | `forms.contactKey` | YOUR_FORMSPREE_ID |
| `{{FORMS_RECIPIENT_EMAIL}}` | `forms.recipientEmail` | used by `form-handler.php` only |

## Projects

Project cards (`index.html`) and rows (`work.html`) live directly in the HTML as
commented blocks — duplicate a block to add a project. On `work.html`, the
space-separated `data-tags` attribute on each `<li class="project-row">` drives
the filter buttons; add a matching `data-filter` button if you introduce a new
discipline. To link a project to a case study, wrap its `.p-link` div in an
anchor as noted in the inline comment. Without JavaScript the filter bar hides
and all projects show.

## Images

The template ships with inline SVG placeholders so it renders standalone with a
clean console. Swap each placeholder for a real image per the inline comments —
always with `width`/`height` attributes (prevents layout shift), `alt` text, and
`loading="lazy"` below the fold. Prefer WebP/AVIF.

## Contact form backends

- **Formspree (default):** create a form at formspree.io and set
  `{{FORMSPREE_CONTACT}}` to its ID. Works on any static host.
- **Self-hosted PHP:** change the form's `action` to `form-handler.php` and fill
  `{{FORMS_RECIPIENT_EMAIL}}`. The handler validates, rate-limits per IP, and
  uses PHP `mail()` — verify deliverability with your host (SPF/DKIM) before
  relying on it.

The client-side validation (blur + submit, errors with cause and fix) works with
either backend; server-side validation still applies regardless.

## Design system notes

- **Colors** are semantic tokens (`--paper`, `--ink`, `--surface`, `--muted`,
  `--accent`) — never hardcode a hex in a component. Dark mode is a tonal warm
  derivation, not an inversion. All shipped pairs compute >= 4.5:1 contrast
  (ratios recorded in `brand.config.json`); recompute if you change values.
- **Theme** follows `prefers-color-scheme` by default; the header toggle
  persists an override in `localStorage`.
- **Motion** is transform/opacity only, 150-300 ms, fully disabled under
  `prefers-reduced-motion`, with a `<noscript>` fallback that shows all content.
- **Type scale:** 12/14/16/18/24/32 plus fluid display sizes via `clamp()`.
  Body is >= 16 px on mobile, line-height 1.6.
- **No third-party JS.** The only external requests are Google Fonts and (on
  submit) Formspree — both reflected in the `.htaccess` CSP. If you self-host
  fonts, tighten the CSP accordingly.
