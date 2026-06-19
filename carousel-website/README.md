# Carousel — Official Band Website

Promo site for **Carousel** (@carouseldeband). Built with Next.js 16 App Router, Tailwind CSS v4, and Cormorant Garamond.

## Running locally

```bash
cd carousel-website
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero, latest release, member grid, next-show callout |
| `/music` | Discography with track player |
| `/shows` | Upcoming dates with ticket links |
| `/video` | YouTube embed grid with category filter |
| `/about` | Band story and member cards |
| `/contact` | Booking and press enquiry form |

## Swapping in real content

All placeholders are clearly marked — no layout changes needed when real assets arrive.

### Photos

Every `<ImageSlot src={null} ... />` is a spotlight-gradient placeholder. Replace `null` with a path:

```jsx
// Before
<ImageSlot src={null} alt="Marta" ratio="4/3" label="M" />

// After — drop the file in public/photos/
<ImageSlot src="/photos/marta.jpg" alt="Marta" ratio="4/3" label="M" />
```

Key locations:
- `app/page.js` — band strip (21:9) and member grid (3:4)
- `app/about/page.js` — member portrait cards (4:3)
- `app/music/page.js` — album art (1:1)

### Audio

Track `src` fields are empty strings in `app/components/PlayerContext.js`. Add the file path or URL for each track:

```js
{ id: 1, title: "Velvet Hours", album: "Golden Hours", duration: "4:12", src: "/audio/velvet-hours.mp3" },
```

### Ticket and streaming links

All `href="#"` links are labelled in the code and ready to swap:

- `app/shows/page.js` — ticket links per show (search `href="#"`)
- `app/music/page.js` — Spotify / Apple Music / Bandcamp per album (search `href="#"`)

### Videos

Update the `videos` array in `app/video/page.js`. Each entry needs a real YouTube `id` (the 11-character code after `?v=`):

```js
{ id: "dQw4w9WgXcQ", title: "...", category: "live", ... }
```

### Newsletter

`app/components/NewsletterSignup.js` currently marks the form as done without sending anything. Replace the `// TODO` block with a real API call (Mailchimp, Resend, ConvertKit, etc.).

## Tech stack

- **Framework**: Next.js 16 App Router
- **Styles**: Tailwind CSS v4 + custom CSS variables in `app/globals.css`
- **Font**: Cormorant Garamond via `next/font/google`
- **Player**: React Context (`app/components/PlayerContext.js`)
- **Animations**: CSS `IntersectionObserver` scroll reveals, CSS `@keyframes`, parallax via `ParallaxBg`

## Build

```bash
npm run build   # production build — must exit 0
npm run lint    # ESLint check
```
