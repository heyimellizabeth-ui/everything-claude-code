# SPEC — Brasa y Mar (paella restaurant website)

## Problem

A coastal Spanish seafood-paella restaurant needs a small, fast, self-hostable website that
captures the warmth of its food (rustic wood, saffron rice, terracotta) and turns visitors into
table reservations — deployable by a non-technical owner onto **Hostinger shared hosting**.

## Goals

1. Convey the warm, rustic, wood-fired paella identity within the first viewport.
2. Drive **reservations** via a working PHP form (no external SaaS dependency).
3. Feel alive through **visual scroll** (reveals, parallax) without harming accessibility or
   working offline-of-CDN.
4. Be **drop-in deployable**: copy files into `public_html/`, edit a handful of documented values.

## Non-goals

- No build step, framework, or bundler. No database. No real photography (CSS art by request).
- No online payment / POS integration.

## Audience

Locals and tourists looking for an authentic paella dinner; mostly mobile, often on slow
connections.

## Pages

| Page | Purpose | Primary CTA |
|------|---------|-------------|
| `index.html` | Identity + story hook + signature dishes teaser | Reserve a table |
| `menu.html` | Paellas, tapas, drinks | Reserve a table |
| `about.html` | Story, wood-fired tradition, sourcing | Reserve a table |
| `gallery.html` | Illustrated "Flavours" wall (CSS dish art) | View the menu |
| `reservations.html` | PHP reservation form + newsletter | Submit reservation |
| `404.html` | Themed fallback | Back home |

## Functional requirements

- Shared sticky nav + footer across all pages; mobile hamburger drawer.
- Reservation form fields: name, email, phone, date, time, party size, notes; honeypot;
  client-side guard + server-side validation in `form-handler.php`.
- Newsletter signup (email only) reusing the same handler (`_type=newsletter`).
- Scroll-progress bar; reveal-on-scroll; hero parallax; reduced-motion + no-JS safe.

## Success criteria

- Loads and is fully readable with JavaScript disabled and with the GSAP CDN blocked.
- `php -l form-handler.php` passes; form validates and (on a real host) emails the owner.
- No `{{TOKEN}}` placeholders remain; Lighthouse-style a11y basics (labels, contrast, focus) hold.
- Mirrors PR #28's auditable artifact-per-stage layout.
