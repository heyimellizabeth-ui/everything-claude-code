# Carousel — Band Website

**Generated:** 2026-05-17
**Status:** IN PROGRESS

## Problem Statement

Carousel is a real Dutch theatrical folk-rock band (`@carouseldeband`). The existing PR #2 website
has the right tech stack and aesthetic direction but is visually basic — initials-in-boxes instead
of photos, no Video or Contact pages, sparse layouts that would not impress a band or their audience.

## Proposed Solution

Full rebuild of `carousel-website/` in-place. Keep Next.js App Router + Tailwind CSS v4 + Cormorant
Garamond. Gut and replace all layouts with dark-first, spotlight-aesthetic, photo-ready equivalents
matching the band's actual visual identity. Add Video and Contact/Booking pages.

## Key Hypothesis

A site with cinematic dark layouts, spotlight vignette photo slots, scroll reveals, a persistent music
player with album art, and a real booking form will read as professionally commissioned.

## Band Details

- **Name**: Carousel / carouseldeband
- **Instagram**: @carouseldeband
- **Genre**: Theatrical folk-rock (Dutch)
- **Members**:
  - Marta — Lead vocals, guitar, bass guitar, chief songwriter
  - Phineas — Piano, guitar, backing vocals
  - Lars — Drums, backing vocals ("Trommel tovenaar")
  - Fiep — Bass guitar, guitar, vocals, lyrics
- **Upcoming**: HAL 25, Koningsdag (27 April)

## Visual Identity (from real Instagram photos)

- Pure black backgrounds with circular spotlight/vignette on subjects
- Oxblood red velvet curtain props
- Carousel figurine as recurring brand motif
- Dramatic chiaroscuro — moody, intimate, theatrical
- Colours: near-black #0D0B09, oxblood #6B1A1A, tarnished gold #9B8040, ivory #EDE8DC

## Implementation Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | globals.css + layout.js + Nav.js rebuild | in-progress |
| 2 | Home page rebuild | pending |
| 3 | About page rebuild (real members) | pending |
| 4 | Shows page rebuild (real show data) | pending |
| 5 | Music page rebuild | pending |
| 6 | NEW: Video page | pending |
| 7 | NEW: Contact/Booking page | pending |
| 8 | MusicPlayer + PlayerContext upgrade | pending |
