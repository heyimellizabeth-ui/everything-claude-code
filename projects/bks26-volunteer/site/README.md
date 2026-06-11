# BKS&rsquo;26 Volunteer Guide — Website

A single-page, mobile-first volunteer information hub for **Best Kept Secret 2026**
(crew 11–15 June, festival 12–14 June · Beekse Bergen, Hilvarenbeek). It mirrors the
official *Volunteers Guidebook BKS26* so volunteers get one familiar, always-current
reference on their phone.

This is the volunteer-facing companion to the coordinator assistant in the parent
[`bks26-volunteer/`](../) project.

## Install it as an iPhone app (PWA)

This is an installable **Progressive Web App** — no App Store, no Xcode needed.

1. Open the site link in **Safari** on iPhone.
2. Tap **Share** → **Add to Home Screen**.
3. Launch it from the home-screen icon: it runs full-screen (no browser chrome)
   and **works offline** — once opened with signal, the whole guide is cached, so
   it keeps working on-site where reception is patchy.

On Android/desktop Chrome the browser shows a native "Install" prompt. iOS Safari
doesn't, so the page shows a one-time, dismissible "Add to Home Screen" hint.

> PWAs require the page to be served over **HTTPS** (or `localhost`) for the
> service worker to register. Plain `file://` won't enable offline mode.

## What's here

| File | Purpose |
|------|---------|
| `index.html` | The whole site — HTML, CSS and JS inline, **zero external dependencies** (fonts load from Google Fonts with system fallbacks). |
| `manifest.webmanifest` | PWA metadata — name, icons, standalone display, theme colors. |
| `service-worker.js` | Offline support — precaches the app shell, stale-while-revalidate for freshness. |
| `icons/` | App icons (180 Apple-touch, 192, 512, 512 maskable) — the BKS green-smile mark. |
| `gen-icons.py` | Regenerates the icons (pure stdlib, no deps): `python3 gen-icons.py`. |
| `og-image.svg` | Open Graph share image for link previews (e.g. the volunteer WhatsApp group). |
| `robots.txt` | Disallows indexing — this is an internal resource. |

## Sections

Before You Arrive (saved checklist) · Getting There (per-day travel tabs) ·
Arrival & Wristband · Your Shifts · Tasks & Meeting Points (all 20 tasks) ·
Food & Catering · Crew Campsite · Bar Volunteer Team · Rules of Engagement ·
Health & Safety · Contacts.

## Design

Sleek dark UI tuned for on-site night use, aligned to the Best Kept Secret brand:
signature **lime-green** section headers, **orange** accent, heavy condensed
display wordmark (Anton), Inter body. Amber is reserved for caution/warning callouts.

Built to the [ui-ux-pro-max](../../../skills/ui-ux-pro-max) pre-delivery checklist:
44px+ touch targets, visible focus states, `prefers-reduced-motion` honoured, smooth
scroll with a Safari fallback, responsive at 375 / 768 / 1024 / 1440.

## Run it

No build step. Open the file, or serve the folder:

```bash
python3 -m http.server -d projects/bks26-volunteer/site 8000
# then open http://localhost:8000
```

## Before going live

- Point `canonical` / `og:url` at the real host.
- Confirm the confidential-adviser contact (TBD in the guidebook) once published.
- Swap `og-image.svg` for a photographic OG image if richer previews are wanted.
