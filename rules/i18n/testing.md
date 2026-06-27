---
paths:
  - "**/locales/**/*.json"
  - "**/i18n/**/*"
  - "**/lang/**/*"
  - "**/translations/**/*"
  - "**/*.po"
  - "**/*.pot"
  - "**/*.arb"
---
# i18n Testing

> This file extends [common/testing.md](../common/testing.md) with internationalisation and localisation testing requirements.

## Translation Parity Tests

Verify all locale files have identical keys to the base `en` locale:

```js
const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../locales');
const BASE = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, 'en.json'), 'utf8'));

function flatKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' ? flatKeys(v, `${prefix}${k}.`) : [`${prefix}${k}`]
  );
}

const baseKeys = new Set(flatKeys(BASE));

for (const file of fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json') && f !== 'en.json')) {
  const locale = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, file), 'utf8'));
  const localeKeys = new Set(flatKeys(locale));
  const missing = [...baseKeys].filter(k => !localeKeys.has(k));
  const extra = [...localeKeys].filter(k => !baseKeys.has(k));
  if (missing.length) throw new Error(`${file}: missing keys: ${missing.join(', ')}`);
  if (extra.length) throw new Error(`${file}: unexpected extra keys: ${extra.join(', ')}`);
}
```

## RTL Layout Tests (Playwright)

Test RTL locales in a real browser — CSS logical properties and `dir="rtl"` can only be verified visually or via computed styles.

```js
const { test, expect } = require('@playwright/test');

test('Arabic layout is RTL', async ({ page }) => {
  await page.goto('/?locale=ar');
  const dir = await page.locator('html').getAttribute('dir');
  expect(dir).toBe('rtl');

  const sidebar = page.locator('.sidebar');
  const box = await sidebar.boundingBox();
  const viewport = page.viewportSize();
  // Sidebar should be on the RIGHT in RTL (mirrored from LTR left)
  expect(box.x + box.width).toBeCloseTo(viewport.width, 5);
});

test('Persian layout is RTL', async ({ page }) => {
  await page.goto('/?locale=fa');
  const dir = await page.locator('html').getAttribute('dir');
  expect(dir).toBe('rtl');
});
```

## Date and Number Format Tests

```js
test.each([
  ['en',    '15/01/2025', '1,234.56'],
  ['fr',    '15/01/2025', '1 234,56'],  // thin-space thousands separator
  ['el',    '15/1/2025',  '1.234,56'],
  ['ar',    '١٥‏/١‏/٢٠٢٥', '١٬٢٣٤٫٥٦'],
  ['fa-IR', '۲۵ دی ۱۴۰۳', '۱٬۲۳۴٫۵۶'],
])('date and number format for %s', (locale, expectedDate, expectedNumber) => {
  const date = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'numeric', year: 'numeric' }).format(new Date('2025-01-15'));
  const num  = new Intl.NumberFormat(locale).format(1234.56);
  expect(date).toBe(expectedDate);
  expect(num).toBe(expectedNumber);
});
```

## Plural Form Tests

Every plural form must be tested, especially for Arabic (6 forms) and French (0 = singular):

```js
test('Arabic plural forms', () => {
  // Arabic CLDR: zero/one/two/few/many/other
  expect(t('requests.pending_count', { count: 0 })).toMatch(/لا طلبات/);
  expect(t('requests.pending_count', { count: 1 })).toMatch(/طلب واحد/);
  expect(t('requests.pending_count', { count: 2 })).toMatch(/طلبان/);
  expect(t('requests.pending_count', { count: 5 })).toMatch(/طلبات/);
  expect(t('requests.pending_count', { count: 11 })).toMatch(/طلباً/);
  expect(t('requests.pending_count', { count: 100 })).toMatch(/طلب/);
});

test('French 0 is singular', () => {
  expect(t('requests.pending_count', { count: 0, locale: 'fr' }))
    .toMatch(/0 demande en attente/);
});
```

## Bidi Injection Tests

```js
const BIDI_CONTROLS = /[‪-‮⁦-⁩]/;

test('sanitizeBidi strips bidi control characters', () => {
  expect(() => sanitizeBidi('hello‮world')).toThrow();
  expect(sanitizeBidi('مرحبا')).toBe('مرحبا');  // clean Arabic passes
  expect(sanitizeBidi('Bonjour')).toBe('Bonjour');
});
```

## Homoglyph Tests

```js
test('Greek Ο (U+039F) does not equal Latin O (U+004F)', () => {
  const greek = 'Ο';
  const latin = 'O';
  expect(greek).not.toBe(latin);
  // Your validation must reject mixed-script identifiers
  expect(isMixedScript('Αdmin')).toBe(true); // Greek Α + Latin dmin
});
```

## Snapshot Tests per Locale

For each critical screen (login, schedule, dashboard), maintain one screenshot snapshot per RTL locale. Run these against any PR that touches translation files or layout CSS.

```bash
playwright test --update-snapshots --project=ar
playwright test --update-snapshots --project=fa
playwright test --update-snapshots --project=ar-SY
```

## Accessibility Tests

- RTL pages must pass axe-core checks (screen readers depend on correct `dir` and `lang`)
- Font-size must remain >= 14px for Arabic/Persian (smaller sizes are illegible at standard screen densities)
- Test tab order in RTL: logical tab sequence should follow visual reading order (right to left)

```js
test('RTL page has no axe violations', async ({ page }) => {
  await page.goto('/?locale=ar');
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations).toHaveLength(0);
});
```

## Checklist Before Shipping a New Locale

- [ ] All keys present in new locale file (parity test passes)
- [ ] Plural forms implemented for all CLDR plural categories of the locale
- [ ] Date, time, and number formats verified with `Intl` APIs
- [ ] RTL layout verified in Playwright (direction, sidebar, button order)
- [ ] Font loaded and renders correctly at 16px on Android Chrome and iOS Safari
- [ ] Bidi sanitisation tested for user-controlled inputs
- [ ] Axe accessibility check passes
- [ ] Screenshot snapshots approved
