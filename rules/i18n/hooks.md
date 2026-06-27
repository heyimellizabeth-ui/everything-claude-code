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
# i18n Hooks

> This file extends [common/hooks.md](../common/hooks.md) with internationalisation-specific hook guidance.

## PreToolUse — Hardcoded String Check

Before editing any UI source file, verify strings are externalised:

- Flag string literals that appear in JSX / HTML templates and are not wrapped in a translation call (`t()`, `i18n.t()`, `__()`, `gettext()`)
- Exempt: log messages, error codes, developer-facing identifiers, test fixtures
- RTL locales: flag any `margin-left`, `padding-left`, `text-align: left`, or `border-left` that are not inside an `[dir="ltr"]` scope

## PostToolUse — Translation Parity Check

After editing any locale file, check that all sibling locale files contain the same top-level keys:

```bash
# Quick structural diff (keys only, not values)
node -e "
const fs = require('fs'), path = require('path');
const dir = './locales';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
const keys = files.map(f => Object.keys(JSON.parse(fs.readFileSync(path.join(dir, f)))).sort().join('\n'));
const base = keys[0];
keys.forEach((k, i) => { if (k !== base) console.warn('Key mismatch in', files[i]); });
"
```

Emit a warning (do not block) if a locale file has keys the base `en.json` lacks, or is missing keys present in `en.json`.

## PostToolUse — RTL/Bidi Check

After editing any translation file for `ar`, `fa`, or `ar-SY` locales:

- Confirm the file is saved as UTF-8 (no BOM, no `\uXXXX` escapes for Arabic/Persian characters)
- Warn if the file contains Unicode bidirectional control characters outside of intentional markup (`‏`, `‫`, `‮`, `⁧`)
- Warn if any value contains an unmatched or orphaned bidi override sequence

## Recommended Claude Code Hook Configuration

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "node scripts/hooks/i18n-parity-check.js"
          }
        ]
      }
    ]
  }
}
```

## Greek Unicode Reminder

After editing `el.json`, verify text is in NFC normalisation form. Greek polytonic (U+1F00–U+1FFF) and Basic Greek (U+0370–U+03FF) must not be mixed with look-alike Latin characters (homoglyph risk — see security.md).
