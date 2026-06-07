# Deployment Guide — Design Studio Generated Sites

After running `/studio-build`, you'll have a production-ready static site in `projects/<your-site>/`.
This guide covers hosting options, domain setup, and going live.

## Site Type

Your generated site is **100% static HTML/CSS/JS** — no server, database, or backend required.
This means:
- PASS: **Fast** — pages load instantly, no compilation
- PASS: **Secure** — no server vulnerabilities, no database to hack
- PASS: **Cheap** — free or $1-5/month hosting
- PASS: **Scalable** — handles viral traffic without infrastructure

## Quick Start (5 minutes)

### Option 1: Vercel (Recommended)

1. Create account at [vercel.com](https://vercel.com)
2. In Vercel dashboard: **Import Project** → select your `projects/<your-site>` folder
3. Click **Deploy**
4. Site lives at `your-site.vercel.app` (custom domain optional)

**Cost:** Free tier includes 5 projects + 100GB bandwidth/month.

### Option 2: Netlify

1. Create account at [netlify.com](https://netlify.com)
2. Drag-and-drop your `projects/<your-site>` folder to Netlify
3. Site lives at `your-site.netlify.app`

**Cost:** Free tier includes 100GB bandwidth/month.

### Option 3: GitHub Pages

1. Push your `projects/<your-site>` to GitHub (create new repo)
2. Go to **Settings** → **Pages**
3. Select **main** branch as source
4. Site lives at `yourusername.github.io/your-site`

**Cost:** Free, no limits.

## Custom Domain

Once deployed, point your domain registrar to your hosting:

### Vercel
```
In Vercel project settings:
1. Go to "Domains"
2. Add your domain (e.g., clubname.nl)
3. Follow DNS setup instructions
4. Typically: add CNAME record → your-site.vercel.app
```

### Netlify
```
In Netlify site settings:
1. Go to "Domain management"
2. Add custom domain
3. Update registrar DNS:
   CNAME: your-site → your-site.netlify.app
```

### GitHub Pages
```
1. Create file: projects/<your-site>/CNAME
2. Content: yourdomain.com
3. Commit and push
4. Update registrar DNS:
   CNAME: www → yourusername.github.io
   A record: @ → 185.199.108.153
```

**DNS can take 24 hours to propagate.**

## Form Backend

### Formspree (No Server Needed)

If your `brand.config.json` has `"backend": "formspree"`:

1. Visit [formspree.io](https://formspree.io)
2. Sign up (free account)
3. Create two forms:
   - One for newsletter (use key in `forms.newsletterKey`)
   - One for contact (use key in `forms.contactKey`)
4. Copy the form keys into your `brand-config.json`
5. Re-run `/studio-build`

Emails go directly to `forms.recipientEmail`.

**Cost:** Free tier = 50 submissions/month. Pro = $25/month.

### PHP Backend (Server Required)

If your `brand.config.json` has `"backend": "php"`:

Your site includes `form-handler.php` which needs PHP 7.4+ with `mail()` enabled.

**Recommended hosts (all include PHP):**

| Host | Cost | Setup |
|------|------|-------|
| Hostinger | $3/mo | cPanel (easy) |
| Bluehost | $2.95/mo intro | cPanel, includes WordPress |
| DreamHost | $2.59/mo | cPanel, good support |
| SiteGround | $3/mo | cPanel, great support |

**Setup:**
1. Sign up and get FTP credentials
2. Upload `projects/<your-site>` folder via FTP
3. Update `form-handler.php` line 5: `$recipient = "your@email.com";`
4. Test the form on your site

## SSL/HTTPS

Modern hosting **automatically provides free SSL**:
- Vercel: PASS: Automatic
- Netlify: PASS: Automatic
- GitHub Pages: PASS: Automatic
- Traditional PHP hosting: Use Let's Encrypt (free, in control panel)

All generated sites redirect HTTP → HTTPS automatically.

## Performance

### Optimize images

Before deploying, compress images:

```bash
# macOS/Linux: install imagemagick
brew install imagemagick

# Compress all images in projects/<your-site>
find projects/<your-site> -name "*.jpg" -o -name "*.png" | \
  while read f; do
    convert "$f" -quality 80 -strip "$f"
  done
```

### Minify CSS/JS

Your site comes pre-minified. If you manually edit files:

```bash
# Install esbuild
npm install -D esbuild

# Minify
npx esbuild projects/<your-site>/style.css --minify --outfile=style.min.css
```

### CDN (optional)

For large image galleries, use a CDN:

- **Cloudflare** (free) — caches images globally, reduces bandwidth
- **Bunny CDN** ($0.01/GB) — very cheap, great speed
- **AWS CloudFront** — pay-per-use, can be expensive

Most don't need CDN for ~100MB of content.

## Monitoring

### Uptime

Your static site almost never goes down (no server = no outages).

To monitor anyway:
- **StatusCake** (free) — pings your site every 5 min
- **Uptime Robot** (free) — free tier, alerts via email

### Analytics

Track visitors without server-side tracking:

- **Plausible** ($9/mo) — privacy-first, GDPR compliant
- **Fathom** ($14/mo) — simple, fast
- **Umami** (self-hosted, free) — open-source

Add to your site's `<head>`:
```html
<script async defer data-domain="yourdomain.com" src="https://analytics.example.com/js/script.js"></script>
```

## Troubleshooting

### 404 errors on subpages

If you see 404s when refreshing `/events.html` or `/contact.html`:

**Vercel/Netlify:**
- Create `vercel.json` or `_redirects` file (both support static routing by default)
- Most sites work without config — if not, Vercel docs cover SPA routing

**GitHub Pages:**
- Add `jekyll.yml` to disable Jekyll processing:
  ```yaml
  # github.io sites process Jekyll by default; disable it
  ```

### CORS errors

If forms fail to submit:
- Formspree: No issues (their server handles CORS)
- PHP: Check `form-handler.php` line ~40 for `ALLOWED_ORIGINS` — add your domain

### Forms not sending

**PHP backend:**
1. Check if your host has `mail()` enabled (ask support)
2. Verify `form-handler.php` has correct email in `$recipient`
3. Check spam folder
4. Enable logging in `form-handler.php` for debugging

**Formspree:**
1. Log in to formspree.io
2. Check form submissions in dashboard
3. Verify form keys in your HTML match Formspree IDs

## Security Checklist

- [ ] Add `robots.txt` (included in scaffold)
- [ ] Add `sitemap.xml` (included in scaffold)
- [ ] Set up SSL/HTTPS (automatic on Vercel/Netlify)
- [ ] Use strong Formspree form keys (not predictable)
- [ ] Keep `form-handler.php` email private if using PHP
- [ ] Update DNS to point to hosting (not intermediate services)
- [ ] Check `Content-Security-Policy` headers (Vercel/Netlify auto-set safe defaults)

## Scaling

As your site grows:

- **Images:** Move to CDN (Cloudflare, Bunny)
- **Traffic:** No changes needed — static sites scale infinitely
- **Forms:** Upgrade Formspree tier if exceeding 50 submissions/month
- **Analytics:** Upgrade Plausible/Fathom as needed

Static sites **never need scaling for backend** — just bigger content and wider CDN.

## FAQ

**Q: Can I edit files after deploying?**
A: Yes. Edit locally, commit, and push. Hosting auto-updates (Vercel/Netlify/Pages).

**Q: How do I add SSL to a PHP host?**
A: Use Let's Encrypt (free, in cPanel). All modern hosts support it.

**Q: How much bandwidth do I get?**
A: Vercel/Netlify free tier = 100GB/month. GitHub Pages = unlimited. That's **millions** of page views.

**Q: Can I use a subdomain?**
A: Yes. Point `club.example.com` CNAME to your hosting. Vercel/Netlify support it directly.

**Q: What if I want to scale to 10 sites?**
A: Vercel free tier = 5 projects. Netlify free tier = unlimited. Upgrade Vercel to Pro ($20/mo) for unlimited.

---

**Questions?** Check your host's docs or ask Claude Code with `/help`.
