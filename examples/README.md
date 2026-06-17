# Design Studio Examples

Ready-to-use brand configs for common venue types. Download, customize, and build.

---

## Quick Start

1. Download a config from this directory
2. Edit the JSON with your own details (name, domain, social links, etc.)
3. Run: `/studio-build path/to/brand-config.json`
4. Open: `projects/<your-site>/index.html`
5. Deploy!

---

## 1. Nightclub — `brand-config-nightclub.json`

**Neon Nightclub** — Electronic music, queer nightlife, Berlin.

**Features enabled:**
- PASS: Calendar (RA events)
- PASS: Gallery (Flickr)
- PASS: Newsletter
- PASS: Reviews (3 sample)

**Colors:** Dark void background (#0A0A0A), hot pink accent (#FF3366)
**Fonts:** Unbounded (bold headings), Inter (body)
**Pages:** Index, Events, About, Contact, Gallery
**Content:** Sample reviews, dance floor images

**Use when:**
- Music venue (nightclub, club, bar)
- DJ events, live music
- Queer-focused or LGBTQ+ venue
- Want RA calendar integration

**Customize:**
```json
"site": {
  "name": "Your Club Name",
  "domain": "yourclub.com",
  "tagline": "Your tagline",
  ...
}
```

---

## 2. Restaurant — `brand-config-restaurant.json`

**Harvest Kitchen** — Farm-to-table Mediterranean, Portland.

**Features enabled:**
- PASS: Planner (booking request form)
- PASS: Gallery (image grid)
- PASS: Newsletter
- PASS: Reviews (3 sample)

**Colors:** Warm earth tones (brown/gold)
**Fonts:** Playfair Display (elegant), Inter (body)
**Pages:** Index, About, Contact
**Content:** Sample reviews, food photography

**Use when:**
- Restaurant, cafe, bistro
- Need reservation/booking system
- Want food photography gallery
- Fine dining or upscale casual

**Customize:**
```json
"site": {
  "name": "Your Restaurant Name",
  "venue": {
    "name": "Your Restaurant Address",
    "city": "Your City"
  },
  ...
}
```

---

## 3. Fitness Studio — `brand-config-fitness.json`

**Flux Fitness** — HIIT & strength training, Austin.

**Features enabled:**
- PASS: Calendar (custom class schedule)
- PASS: Checkout (membership link)
- PASS: Planner (class booking)
- PASS: Newsletter
- PASS: Manifesto (values statement)
- PASS: Reviews (3 sample)

**Colors:** Dark modern (black/orange accent)
**Fonts:** Space Grotesk (modern), DM Sans (friendly)
**Pages:** Index, Events (class schedule), About, Contact
**Content:** Sample reviews, workout images

**Use when:**
- Gym, fitness studio, yoga studio
- Offer group classes
- Need class scheduling + membership sales
- Community-focused brand

**Customize:**
```json
"site": {
  "name": "Your Studio Name",
  "modules": {
    "checkout": {
      "enabled": true,
      "url": "https://your-membership-link.com"
    }
  }
  ...
}
```

---

## How to Use

### Option A: Quick Copy-Paste

1. Open this file in your editor
2. Copy entire JSON
3. Create new file: `my-venue-config.json`
4. Paste and edit
5. Run: `/studio-build my-venue-config.json`

### Option B: Command-Line Copy

```bash
# Copy nightclub example
cp examples/brand-config-nightclub.json my-club.json

# Edit in your editor
nano my-club.json

# Build
/studio-build my-club.json
```

### Option C: Via Design Studio

Don't want to hand-edit JSON? Use the browser app:

1. Open `projects/design-studio/index.html`
2. Fill in all tabs (Brand, Colors, Type, Sections, Content)
3. Download config
4. Run `/studio-build`

---

## Editing Tips

### Change Site Name

```json
"site": {
  "name": "Your Name Here",
  "short": "SHORT",
  "domain": "yourdomain.com"
}
```

### Change Colors

Pick a preset or customize:

```json
"colors": {
  "void": "#BACKGROUND_HEX",
  "cream": "#TEXT_HEX",
  "accent": "#BUTTON_HEX",
  "surface": "#NAV_HEX",
  "muted": "#BORDER_HEX"
}
```

Use [colorhexa.com](https://www.colorhexa.com) to find hex codes.

### Change Fonts

Pick from: `Syne`, `Unbounded`, `Playfair Display`, `Space Grotesk`, `Inter`, `DM Sans`

```json
"fonts": {
  "heading": "Unbounded",
  "body": "Inter"
}
```

### Add Your Reviews

Replace sample reviews or add new ones:

```json
"reviews": [
  {
    "author": "Reviewer Name",
    "text": "Their review text here.",
    "rating": 5,
    "source": "google"
  }
]
```

### Add Your Images

Update image URLs (must be direct image links, e.g., `.jpg`, `.png`):

```json
"images": {
  "hero": "https://example.com/hero-1200x600.jpg",
  "og": "https://example.com/og-1200x630.jpg",
  "gallery": [
    "https://example.com/photo1.jpg",
    "https://example.com/photo2.jpg"
  ]
}
```

### Enable/Disable Modules

Toggle features on/off:

```json
"modules": {
  "calendar": { "enabled": true, "type": "ra-embed" },
  "checkout": { "enabled": true, "url": "https://your-link.com" },
  "planner": { "enabled": false },
  "gallery": { "enabled": true, "type": "flickr" },
  "newsletter": { "enabled": true }
}
```

### Change Social Links

```json
"social": {
  "instagram": "https://instagram.com/yourname",
  "ra": "https://ra.co/clubs/yourname",
  "facebook": "https://facebook.com/yourname",
  "tiktok": "https://tiktok.com/@yourname",
  "spotify": "https://open.spotify.com/user/yourname",
  "youtube": "https://youtube.com/@yourname"
}
```

Leave empty (`""`) to hide a platform.

---

## After `/studio-build`

Your site is generated at `projects/<your-site>/`.

**Next steps:**

1. Open in browser: `projects/<your-site>/index.html`
2. Fill in manual content slots (event dates, team bios, map)
3. Run `/c3` for design polish
4. Deploy to Vercel/Netlify/GitHub Pages
5. Add custom domain

See [docs/TUTORIAL.md](../docs/TUTORIAL.md) for step-by-step guide.

---

## Questions?

- **How do I customize colors?** Edit `"colors"` in JSON, re-run `/studio-build`
- **Can I add more reviews?** Yes, add to `"reviews"` array
- **How do I change fonts?** Edit `"fonts"`, re-run `/studio-build`
- **Which images should I use?** Hero = wide (1200x600), OG = square (1200x1200), gallery = any
- **How do I deploy?** See [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)

---

**Ready to build?** Pick a template, customize, and run `/studio-build`!
