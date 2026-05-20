# Design Studio Tutorial — Build a Real Site in 15 Minutes

This tutorial walks through the complete workflow: Design Studio → Download Config → /studio-build → Live Site.

We'll build a sample nightclub site called **"Neon"** to demonstrate all features.

---

## Step 1: Open Design Studio (1 min)

```bash
# macOS
open projects/design-studio/index.html

# Linux
xdg-open projects/design-studio/index.html

# Windows
start projects/design-studio/index.html
```

Or manually navigate to `projects/design-studio/index.html` in your browser.

---

## Step 2: Brand Tab — Define Your Venue (3 min)

Fill in the **Brand** tab:

| Field | Example (Neon) |
|-------|----------------|
| **Site Name** | Neon |
| **Short Name** | NEON |
| **Tagline** | Electric Nights, Queer Vibes |
| **Description** | Underground electronic & queer nightlife in the city. Book now. |
| **Domain** | neon-nightclub.com |
| **Language** | en |
| **Est. Year** | 2023 |
| **BPM** | 130 BPM |
| **Venue Name** | The Electric Hall |
| **City** | Berlin |
| **Region** | Berlin |
| **Country** | DE |
| **Ticket URL** | https://www.ticketmaster.com/neon-events |
| **Form Backend** | formspree |

**Social Links:**
- Instagram: `https://instagram.com/neonberlin`
- RA: `https://ra.co/clubs/neon`
- Facebook: `https://facebook.com/neonberlin`
- TikTok: `https://tiktok.com/@neonberlin`
- Spotify: `https://open.spotify.com/user/neonberlin`
- YouTube: `https://youtube.com/@neonberlin`

**Forms:**
- Formspree Newsletter Key: `xkokywzz` (example; get real key from formspree.io)
- Formspree Contact Key: `xrerjzlo` (example)
- Recipient Email: `hello@neon-nightclub.com`

---

## Step 3: Colors Tab — Pick Your Brand Colors (2 min)

Click **"Ember"** preset (red/orange), or customize:

| Token | Color | Role |
|-------|-------|------|
| Background (Void) | #0A0A0A | Dark background |
| Text (Cream) | #F5F5F5 | Light text |
| Accent | #FF3366 | Buttons, highlights |
| Surface | #1A1A1A | Nav, cards |
| Muted | #888888 | Subtitles, borders |

Watch the **live preview** on the right update in real-time.

---

## Step 4: Type Tab — Choose Fonts (1 min)

- **Heading Font:** Unbounded (bold, modern)
- **Body Font:** Inter (readable, neutral)

See the preview update with your font choices.

---

## Step 5: Sections Tab — Choose Pages (2 min)

Toggle which pages to generate:

✅ **Keep enabled:**
- Index (home)
- Events
- About
- Contact

❌ **Disable:**
- Gallery (we'll skip this)
- Manifesto (optional brand statement)

Toggle **Modules:**

✅ **Calendar** — RA event embed (enabled)
✅ **Gallery** — Flickr embed (enabled)
✅ **Newsletter** — Email signup (enabled)

❌ **Checkout** — Stripe button (disabled for now)
❌ **Planner** — Booking form (disabled for now)

---

## Step 6: Content Tab — Add Reviews & Images (4 min)

### Google Reviews

Paste sample reviews (raw text format):

```
Alex
5 stars
1 review
Best night out in Berlin! Amazing music and vibe. Will definitely be back.

Jordan
4 stars
2 reviews
Great venue, friendly crowd, good drinks. Only minor: a bit crowded on weekends.
```

Click **[Parse]** → reviews appear as cards.

Alternatively, paste JSON:
```json
[
  { "author": "Morgan", "text": "Electric energy all night!", "rating": 5, "source": "google" },
  { "author": "Casey", "text": "Perfect for dancing.", "rating": 5, "source": "google" }
]
```

### Images

- **Hero Image:** `https://images.unsplash.com/photo-nightclub-lights` (full-width background)
- **OG Image:** `https://images.unsplash.com/photo-neon-sign` (social share preview)
- **Gallery Images:** (one per line)
  ```
  https://images.unsplash.com/photo-dance-floor-1
  https://images.unsplash.com/photo-dj-booth
  https://images.unsplash.com/photo-crowd
  ```

---

## Step 7: Download Config (1 min)

Click **"⬇ Download Config"** button.

`brand-config.json` saves to `~/Downloads/`.

Open it to verify — you should see:
```json
{
  "site": {
    "name": "Neon",
    "domain": "neon-nightclub.com",
    ...
  },
  "colors": { ... },
  "fonts": { "heading": "Unbounded", "body": "Inter" },
  "sections": { "gallery": false, ... },
  "reviews": [ { "author": "Alex", ... }, ... ],
  "images": { "hero": "...", ... },
  "modules": { "calendar": { "enabled": true }, ... }
}
```

---

## Step 8: Build Site with /studio-build (2 min)

In Claude Code, run:

```
/studio-build ~/Downloads/brand-config.json
```

The command will:
1. ✅ Locate your config file
2. ✅ Derive project name: `neon`
3. ✅ Create `projects/neon/` directory
4. ✅ Scaffold all pages (events.html, about.html, contact.html — NOT gallery.html)
5. ✅ Inject fonts (Unbounded, Inter from Google Fonts)
6. ✅ Inject reviews (2 reviews visible on home page with star ratings)
7. ✅ Inject hero image (background-image on hero section)
8. ✅ Enable calendar module on events page
9. ✅ Hide checkout module (display:none)
10. ✅ Generate brand assets (favicon, og-image)
11. ✅ Validate — no unresolved {{TOKENS}}
12. ✅ Report: "Site ready at `projects/neon/index.html`"

Output:
```
[scaffold] Generating site from projects/neon/brand.config.json
[scaffold] 12 files written to projects/neon
[validate] ✓ 13 files checked — no unsubstituted tokens
[assets] Generated favicon.ico, og-image.svg
[report] Site ready! Pages: index, events, about, contact
[report] Manual slots: event dates, team bios, map embed, Formspree keys
```

---

## Step 9: Review Your Site (1 min)

Open in browser:

```bash
open projects/neon/index.html
```

You should see:
- ✅ **Hero section** with your background image
- ✅ **Reviews** visible with 5-star ratings (Alex 5★, Jordan 4★)
- ✅ **Next Event** block with your tagline
- ✅ **Newsletter signup** form
- ✅ **Social links** (Instagram, RA, Facebook, TikTok, Spotify, YouTube)
- ✅ **Fonts** — Unbounded headings, Inter body text
- ✅ **Colors** — Ember red accent on buttons, dark background
- ✅ **Responsive** — Works on mobile, tablet, desktop

Click **Events** → Calendar embed from RA (live event listings)
Click **About** → Team section (placeholder for bios)
Click **Contact** → Newsletter + contact form

---

## Step 10: Manual Content Slots (3-5 min)

The command reported which slots need manual filling:

### Event Data
Edit `projects/neon/index.html` around line ~200:

Find:
```html
<h3>Next Event</h3>
<p>Featured party coming soon...</p>
```

Replace with:
```html
<h3>Next Event: Pride After Party</h3>
<p>May 30, 2026 • 11:00 PM - 06:00 AM</p>
<a href="https://www.ticketmaster.com/neon-events" class="button">Get Tickets €25</a>
```

### Team Bios
Edit `projects/neon/about.html`:

Find:
```html
<div class="team-member">
  <h3>Team Member</h3>
  <p>Role and bio...</p>
</div>
```

Replace with:
```html
<div class="team-member">
  <h3>Maya (Founder/DJ)</h3>
  <p>Berlin-based electronic music producer. Started Neon to create a safe space for queer nightlife. Spins house & techno.</p>
</div>

<div class="team-member">
  <h3>Alex (Promoter)</h3>
  <p>5+ years booking queer artists and drag performers. Curates lineups that celebrate diversity.</p>
</div>
```

### Map Embed
Edit `projects/neon/contact.html`:

Find:
```html
<!-- Google Maps iframe placeholder -->
```

Replace with:
```html
<iframe width="100%" height="400" frameborder="0" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2428.5...&z=16" allowfullscreen="" loading="lazy"></iframe>
```

(Get embed URL from Google Maps → Share → Embed Map)

### Formspree Keys
Edit `projects/neon/index.html` and `projects/neon/contact.html`:

Find:
```html
<form action="https://formspree.io/f/xkokywzz" method="POST">
```

Replace `xkokywzz` with your actual Formspree newsletter key.

---

## Step 11: Polish with /c3 (Optional)

For design polish (animations, hover states, responsive tweaks):

```
/c3 projects/neon
```

This runs Claude's design polish chain:
- ✅ GSAP animations (entrance, scroll-triggered)
- ✅ Responsive breakpoints (mobile, tablet, desktop)
- ✅ Hover states (buttons, links)
- ✅ Accessibility audit (contrast, ARIA labels)

---

## Step 12: Deploy (1 min setup)

Push to GitHub:

```bash
cd projects/neon
git init
git add .
git commit -m "Initial site: Neon nightclub"
git branch -M main
git remote add origin https://github.com/yourname/neon-nightclub
git push -u origin main
```

Deploy to Vercel (free):

1. Visit [vercel.com](https://vercel.com)
2. Click **Import Project**
3. Select GitHub repo `neon-nightclub`
4. Click **Deploy**
5. Site lives at `neon-nightclub.vercel.app` (or add custom domain)

Done! Your site is live. Share the URL: `https://neon-nightclub.com`

---

## What You Built

In 15 minutes, you created a **production-ready static website**:

✅ Custom branding (colors, fonts, venue info)
✅ Live reviews from your guests
✅ Responsive design (mobile, tablet, desktop)
✅ Event calendar integration (RA)
✅ Newsletter signup (Formspree)
✅ Contact form
✅ Social media links (7 platforms)
✅ SEO-optimized (JSON-LD, OG tags, sitemap)
✅ 0 downtime, 0 server costs (static hosting)

---

## Next Steps

### Short term (1-2 hours):
- Add more event dates to `events.html`
- Fill in team bios in `about.html`
- Add photos to gallery
- Customize hero image with your own photo
- Set up real Formspree keys (free account)

### Medium term (1-2 days):
- Run `/c3` for design polish
- Run `/c4` for production security audit
- Custom domain setup (neon-nightclub.com)
- Add Google Analytics for visitor tracking

### Long term (ongoing):
- Run `/studio-build` again if you change colors/fonts
- Update social links as your accounts grow
- Add new reviews quarterly
- Monitor visitor traffic in analytics

---

## Troubleshooting

**Q: Reviews not showing?**
A: Make sure you clicked **[Parse]** button. Check browser console for errors.

**Q: Images not loading?**
A: Verify URLs are direct image links (end in `.jpg`, `.png`). Test in new tab.

**Q: Forms not sending?**
A: Sign up for [Formspree](https://formspree.io), get real form keys, replace placeholders.

**Q: Site doesn't look right on mobile?**
A: Open DevTools (F12) → responsive mode → test at 375px width.

**Q: How do I update colors later?**
A: Edit `projects/neon/brand.config.json`, run `/studio-build projects/neon/brand.config.json` again.

---

**Questions?** Ask in Claude Code with `/help` or check [docs/DEPLOYMENT.md](DEPLOYMENT.md) for detailed hosting options.
