# Deploying Brasa y Mar to Hostinger

This is a static site (HTML/CSS/JS) plus one PHP file for the reservation form.
No build step, no database. You upload the folder and edit a few values.

---

## 1. Before you upload — edit these (5 minutes)

Search-and-replace is your friend. The defaults are clearly marked.

| What | Where | Change to |
|------|-------|-----------|
| **Recipient email** | `form-handler.php` → `RECIPIENT` | the restaurant's real inbox |
| **Site domain** | `form-handler.php` → `SITE_DOMAIN` | your live domain, e.g. `brasaymar.com` (no `https://`) |
| **Restaurant name** | every `.html` (`.brand`, `<title>`) + `form-handler.php` → `SITE_NAME` | your name. Default placeholder is **Brasa y Mar** |
| **Address & phone** | footer of each `.html`, `tel:` links | your address and number |
| **Domain in SEO files** | `robots.txt`, `sitemap.xml`, the JSON-LD block in `index.html` | your live domain |

> The JSON-LD `Restaurant` block in `index.html` ships **without a street address on
> purpose** — add your real `address` there once live so you don't publish placeholder
> data to search engines.

---

## 2. Upload — Option A: hPanel File Manager (easiest)

1. Log in to Hostinger → **hPanel** → **File Manager**.
2. Open `public_html/` (delete the default `default.php`/`index.html` if present).
3. Upload **everything inside this folder** (not the folder itself) into `public_html/`:
   - `index.html`, `menu.html`, `about.html`, `gallery.html`, `reservations.html`, `404.html`
   - `form-handler.php`
   - `assets/` (the whole folder)
   - `.htaccess`, `robots.txt`, `sitemap.xml`
4. Visit your domain. Done.

> The `.md` files (`README.md`, `SPEC.md`, etc.) are project docs — you do **not** need
> to upload them.

## 2. Upload — Option B: SFTP (faster for repeat deploys)

Hostinger gives you SFTP credentials under **hPanel → Files → FTP Accounts**.

```bash
# one-off, with lftp installed locally
lftp -u "$FTP_USER","$FTP_PASS" sftp://"$FTP_HOST":65002 <<'EOF'
set sftp:auto-confirm yes
mirror --reverse --delete --verbose \
  --exclude '*.md' \
  ./ /public_html/
bye
EOF
```

Hostinger's SFTP port is usually **65002** (not 22). The `--exclude '*.md'` keeps the
project docs off the live server.

---

## 3. Verify the reservation form

1. Submit a test reservation on `reservations.html`.
2. Check the `RECIPIENT` inbox (and spam folder the first time).
3. **If email doesn't arrive:** PHP `mail()` on shared hosting can land in spam or be
   throttled. The handler writes every booking to `mail-fallback.log` next to
   `form-handler.php` as a safety net — check there. For reliable delivery, point your
   domain's DNS at Hostinger's mail (SPF/DKIM), or set `RECIPIENT` to a mailbox **on your
   own domain** rather than a free Gmail/Outlook address.

The origin/CORS check is intentionally **fail-open**: even if you forget to set
`SITE_DOMAIN`, the form still accepts real submissions — it will never 403 your guests.

---

## 4. Swapping the CSS art for real food photos (optional, recommended later)

The site ships with hand-built **CSS dish art** (no photos), so it works with zero image
assets. When you have real photography, it's a clean swap:

- **Gallery** (`gallery.html`): replace each
  `<div class="dish" …>…</div>` inside a `.flavour` figure with
  `<img src="assets/img/your-photo.jpg" alt="…">` and add `object-fit:cover;width:100%;height:100%`.
- **Hero / cards**: same idea — drop an `<img>` where the `.dish` element sits.
- Put images in `assets/img/`, keep them under ~300 KB each, and always set descriptive
  `alt` text.

No CSS or JS changes are required — the layout containers already size correctly.

---

## 5. HTTPS

Once your Hostinger SSL certificate is active (hPanel → **SSL**), uncomment the
"Force HTTPS" block in `.htaccess` to redirect all traffic to `https://`.
