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
# i18n Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with internationalisation and localisation conventions.

## Supported Locales

| Locale | Language | Script | Direction |
|--------|----------|--------|-----------|
| `en` | English | Latin | LTR |
| `fr` / `fr-FR` | French | Latin | LTR |
| `el` / `el-GR` | Greek | Greek | LTR |
| `ar` | Arabic (MSA) | Arabic | RTL |
| `fa` / `fa-IR` | Persian (Farsi) | Arabic-Perso | RTL |
| `ar-SY` | Syrian Arabic | Arabic | RTL |

## Translation Key Conventions

- Use dot-notation namespaced keys: `page.section.element`
- Keys must be in English (base locale), lowercase, hyphen-separated within segments
- Never embed HTML in translation values — use slots/interpolation instead
- Pluralisation keys must use ICU MessageFormat or the framework's native plural syntax

```json
{
  "dashboard.greeting": "Hello, {name}",
  "schedule.row_count": "{count, plural, one {# row} other {# rows}}",
  "nav.time_off": "Time Off"
}
```

## File Naming

- One file per locale: `en.json`, `fr.json`, `el.json`, `ar.json`, `fa.json`, `ar-SY.json`
- Or one namespace per locale directory: `locales/fr/schedule.json`
- Keep all locale files structurally identical (same keys, no extras or gaps)

## RTL Layouts

Declare text direction at the document/component root — never per-element:

```html
<!-- HTML root -->
<html lang="ar" dir="rtl">

<!-- React component root -->
<div dir={locale === 'ar' || locale === 'fa' || locale === 'ar-SY' ? 'rtl' : 'ltr'}>
```

- Use CSS logical properties (`margin-inline-start`, `padding-inline-end`) instead of `margin-left` / `padding-right` so layout mirrors automatically for RTL
- Use `text-align: start` instead of `text-align: left`
- Icon order, flex direction, and chevron orientation must be RTL-aware

## Numbers and Dates

- Always use `Intl.NumberFormat` and `Intl.DateTimeFormat` with the active locale — never hard-code decimal separators or date patterns
- Persian (`fa-IR`) uses the Jalali calendar by default; supply `calendar: 'persian'` option or use a dedicated Jalali library
- Arabic-Indic numerals are used in `ar` and `ar-SY`; Extended Persian numerals (`۰–۹`) in `fa-IR`

```js
new Intl.NumberFormat('fa-IR').format(1234);     // ۱٬۲۳۴
new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date());
```

## Font Stacks

- Latin (en, fr): `Inter, system-ui, sans-serif`
- Greek (el): `Inter, 'GFS Artemisia', serif` or `Inter` (covers Basic Greek U+0370–U+03FF)
- Arabic / Persian / Syrian (ar, fa, ar-SY): `'Noto Sans Arabic', 'Segoe UI', sans-serif`
- Load only the Unicode ranges needed to avoid payload bloat

## Encoding

- All source files: **UTF-8 without BOM**
- All JSON translation files: UTF-8 with no escape sequences for non-ASCII characters (store raw Unicode)
