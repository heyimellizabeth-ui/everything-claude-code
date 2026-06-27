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
# i18n Patterns

> This file extends [common/patterns.md](../common/patterns.md) with language-specific internationalisation patterns.

## English (en) — Base Locale

English is the source of truth. All other locale files are derived from it.

- Use natural English phrasing for keys, not telegraphic labels (`"save_changes"` → value `"Save changes"`)
- Provide explicit plural forms even in English (ICU `one`/`other`) so translators have a complete template
- Date format for NL context: `DD-MM-YYYY` (Dutch users read English UI in regional date format)

```json
{
  "schedule.week_of": "Week of {startDate}",
  "requests.pending_count": "{count, plural, one {# pending request} other {# pending requests}}"
}
```

## French (fr / fr-FR)

- All accented characters stored as raw UTF-8: `é è à ç ù î ô û œ æ` — never `é`
- French typographic rules: space before `:`, `!`, `?`, `;` → use a non-breaking thin space (` `) or a regular space (frameworks handle this differently; be consistent)
- Pluralisation: French uses `one` for 0 and 1, `other` for 2+ — supply both ICU forms
- Gender: French has grammatical gender; provide variant keys where gender changes the translation

```json
{
  "nav.schedule": "Planning",
  "nav.time_off": "Congés",
  "schedule.week_of": "Semaine du {startDate}",
  "requests.pending_count": "{count, plural, one {# demande en attente} other {# demandes en attente}}"
}
```

## Greek (el / el-GR)

- Greek alphabet: Basic Greek U+0370–U+03FF; polytonic extended U+1F00–U+1FFF
- Store text in NFC normalisation (`String.prototype.normalize('NFC')`)
- Monotonic orthography is standard for modern Greek UI text (single acute accent, no smooth/rough breathing marks)
- Pluralisation: Greek has `one` (1) / `other` (everything else including 0)
- Formal register (`εσείς` address) is appropriate for professional software

```json
{
  "nav.schedule": "Πρόγραμμα",
  "nav.time_off": "Άδεια",
  "schedule.week_of": "Εβδομάδα {startDate}",
  "requests.pending_count": "{count, plural, one {# αίτηση σε εκκρεμότητα} other {# αιτήσεις σε εκκρεμότητα}}"
}
```

## Arabic (ar) — Modern Standard Arabic

- Script direction: RTL. Set `dir="rtl"` at container level; do not set per-element.
- Arabic has six plural forms in CLDR: `zero`, `one`, `two`, `few`, `many`, `other` — ICU MessageFormat supports all six
- Use Arabic-Indic numerals by default (`Intl.NumberFormat('ar')` handles this automatically)
- Do not mix Arabic and Latin text in the same string; use separate spans with explicit `dir` attributes
- Tashkeel (vowel diacritics) are optional in UI but aid readability for non-native readers; omit in dense tables

```json
{
  "nav.schedule": "الجدول الزمني",
  "nav.time_off": "إجازة",
  "schedule.week_of": "أسبوع {startDate}",
  "requests.pending_count": "{count, plural, zero {لا طلبات معلّقة} one {طلب معلّق واحد} two {طلبان معلّقان} few {# طلبات معلّقة} many {# طلباً معلّقاً} other {# طلب معلّق}}"
}
```

## Persian / Iranian (fa / fa-IR)

- Script: Perso-Arabic, RTL. Shares direction rules with `ar`.
- Additional Persian letters not in Arabic: `پ` (U+067E), `چ` (U+0686), `ژ` (U+0698), `گ` (U+06AF)
- Calendar: Jalali (Solar Hijri) by default for `fa-IR`. Use a Jalali library (e.g., `date-fns-jalali`) or `Intl.DateTimeFormat('fa-IR', { calendar: 'persian' })`
- Numerals: Extended Arabic-Indic (`۰۱۲۳۴۵۶۷۸۹`) — `Intl.NumberFormat('fa-IR')` applies these automatically
- Pluralisation: Persian has only `one` and `other` forms

```json
{
  "nav.schedule": "برنامه‌ریزی",
  "nav.time_off": "مرخصی",
  "schedule.week_of": "هفته {startDate}",
  "requests.pending_count": "{count, plural, one {# درخواست در انتظار} other {# درخواست در انتظار}}"
}
```

Note: `‌` (U+200C, zero-width non-joiner) is used in Persian between morphemes that should not ligate — preserve it in strings like `برنامه‌ریزی`.

## Syrian Arabic (ar-SY) — Levantine Dialect

- Script and direction: same as `ar` (RTL, Arabic script)
- `ar-SY` is a locale tag, not a separate script — it shares MSA orthography in formal/professional contexts
- For professional software (e.g., scheduling apps), use formal Modern Standard Arabic strings; colloquial Syrian dialect is acceptable only in notification copy or conversational UI
- Pluralisation: same CLDR six-form system as `ar`; `ar-SY` may be rendered with `ar` fallback if a full `ar-SY` translation is not provided

```json
{
  "nav.schedule": "الجدول",
  "nav.time_off": "إجازة",
  "requests.pending_count": "{count, plural, zero {لا طلبات} one {طلب واحد} two {طلبان} few {# طلبات} many {# طلباً} other {# طلب}}"
}
```

## Fallback Chain

```
ar-SY → ar → en
fa-IR → fa → en
fr-FR → fr → en
el-GR → el → en
```

Never fall back from RTL to LTR silently — log a warning when a fallback crosses a direction boundary, as layout assumptions may break.
