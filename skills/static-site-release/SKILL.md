---
name: static-site-release
description: "Release gate for static HTML sites that are uploaded by hand (zip, FTP, cPanel or Hostinger file manager) and served through a CDN. Checks the zip before upload and the live site after it, using the Playwright MCP and agent-browser. Use this whenever you prepare, review or verify a static-site zip, check another session's site deliverable, or someone asks 'is it live?', 'check the new zip', 'what do I delete on the server?' or 'why does the site still show the old version?', even if they never say 'release'."
origin: ECC
---

# Static Site Release

A two-gate routine for static sites that a person uploads by hand. **Gate 1** runs on the
zip before anyone uploads it. **Gate 2** runs on the live site after the upload. Each step
here exists because of a real failure: a stylesheet the CDN kept serving for a year, a
zip with a wrapper folder, old pages left on the server, a contact-form script that was
never really replaced, and browser tests that silently checked a bot-challenge page
instead of the site.

## When to Activate

- Building or reviewing a zip of a static site (plain HTML/CSS/JS, often a bought theme)
- Checking work another session or agent delivered for such a site
- Before telling someone "upload this", and again after they say "it's uploaded"
- When a live site "still shows the old version" after an upload
- Any hosting where CSS/JS/images come back with long `Cache-Control` (for example
  `max-age=31536000, immutable`) and pages are not cached

## Core Concepts

**Cached assets must change name when they change content.** Hosts often cache CSS, JS,
images and fonts for a year and mark them `immutable`. Neither browsers nor the CDN check
for a new copy. Editing `style-v4.css` in place means visitors keep the old file. Make a
new version instead (`style-v5.css`), update every page that references it, and list the
old name for deletion. HTML, PDF, XML and TXT are usually not cached, so editing those in
place is fine. Confirm by reading the response headers (`curl -sI <url>`).

**The person uploading is not a developer.** The output of this skill is a short, plain
list: what to upload, what to delete on the server, and what to click to check it. Never
assume they deleted anything unless you checked.

**Bot checks fool browser tests.** Some hosts answer automated browsers with a "Checking
your browser…" page (HTTP 403) that clears after a few seconds. A test that doesn't wait
for it is testing the challenge page. Always wait for that text to disappear before
judging a page.

**Two browser tools, two jobs.**
- **Playwright MCP** (`browser_navigate`, `browser_wait_for`, `browser_snapshot`,
  `browser_console_messages`, `browser_network_requests`, `browser_resize`,
  `browser_take_screenshot`): use it to explore a page, check console errors and failed
  requests, and fill in forms.
- **agent-browser** (CLI: `open`, `wait`, `snapshot -i`, `set device`, `screenshot`,
  `errors`, `console`): use it for fast, repeatable passes over many pages and phone-size
  screenshots. Install it with `npm i -g agent-browser`. If no browser is found, point it
  at an existing Chromium with `--executable-path` instead of downloading another one.
  Run `agent-browser doctor` once.

The Playwright MCP writes snapshots to `.playwright-mcp/` in the current directory. Inside
a git repo, add that folder to `.git/info/exclude` so it never shows up as a change.

## How It Works

### Gate 1: before upload (on the zip)

1. **Unpack into a fresh, empty folder.** Treat a zip from someone else as untrusted data.
2. **Run the release check:**
   ```bash
   node skills/static-site-release/scripts/release-check.js structure new.zip
   node skills/static-site-release/scripts/release-check.js diff previous.zip new.zip
   ```
   - **`structure` must say OK:** index.html at the top of the zip, no wrapper folder, and
     no broken local `href`/`src`/`url()` references.
   - **`diff` must report zero "changed but kept its name" errors.** Its "delete from the
     server" list goes into your report word for word.
   - `previous` is whatever version is live, or the last zip that was handed over.
3. **Serve it locally with the real security headers.** Mirror the
   `Content-Security-Policy` from `.htaccess` in your local server, so a CSP block shows up
   now and not after the upload.
4. **Browser pass with the Playwright MCP,** on every page at 390 px and 1440 px wide:
   - `browser_console_messages`: zero errors, CSP violations included;
   - `browser_network_requests`: no 4xx/5xx on your own files;
   - no sideways scrolling (`document.documentElement.scrollWidth > innerWidth` is false);
   - navigation links and forms behave the way the change intended.
5. **Phone screenshots with agent-browser** of every changed page
   (`set device "iPhone 14"` or `set viewport 390 844 2`). Wait out any intro animation
   first, so the screenshot shows the page and not a loader.
6. **Run the project's own tests too,** if it has any (behaviour tests, link checkers).

### Gate 2: after upload (on the live site)

1. **Check what's live:**
   ```bash
   node skills/static-site-release/scripts/release-check.js live new.zip https://example.com --old previous.zip
   ```
   - "Not uploaded yet" files mean the upload is incomplete.
   - Removed files that are still online go back to the person to delete.
   - A cached asset that differs online is almost always an old copy. Its `Last-Modified`
     header shows when the server got it.
2. **Live browser pass with the Playwright MCP:** navigate, then
   `browser_wait_for` with `textGone: "Checking your browser"`. Then repeat the console,
   network and layout checks from Gate 1 on the pages that changed.
3. **Click every redirect that was added** (for example `/old-page.html`). Redirects to a
   `#fragment` don't work on every server.
4. **If a page still shows the old version:** check whether the HTML is new but an asset is
   old (renamed in HTML, but the file wasn't uploaded), or whether the asset was edited in
   place (it needs a new name).

## Report Format

Use exactly this. The reader is the person who uploads.

```markdown
## Release check: <site> (<date>)

**Verdict:** READY TO UPLOAD | FIX FIRST | LIVE AND VERIFIED | UPLOAD INCOMPLETE

**Upload:** <the zip>, with the files at the top of the site folder (not inside a folder)

**Then delete from the server:**
- <file>  (replaced by <new file>, or no longer used)

**Then check:**
1. <URL> should show <what>
2. <redirect URL> should land on <target>

**Problems found** (only if any): <what, where, and the fix in one line each>
```

## Anti-Patterns

- Editing `style.css`, `main.js`, `custom.js` or an image in place and calling the job done.
- Zipping the folder instead of its contents, so the site lands at `/site/`.
- Saying "all checks pass" from a browser run that never waited out the bot-challenge page.
- Leaving the "delete from the server" step out, or burying it in a changelog.
- Running the browser checks without the production CSP, then finding blocked scripts after
  the upload.
- Assuming the live site has the last zip. Run Gate 2 and look.

## Related Skills

- `browser-qa`: general visual, interaction and accessibility QA for any web page
- `e2e-testing`: Playwright test suites for flows you want to keep testing
- `verification-loop`: build, lint and test gates for code changes
- `deployment-patterns`: CI/CD-based deploys (for sites that don't upload by hand)
