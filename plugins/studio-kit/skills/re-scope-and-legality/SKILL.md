---
name: re-scope-and-legality
description: Scope and authorization checklist for RECC reverse-engineering work. Use before analyzing any third-party binary, app, firmware, or website to record the authorization basis, purpose, and hard limits, and to stop on requests for credential theft, DRM or licence circumvention, malware, or attacks on systems the user does not control.
origin: RECC
---

# RE Scope and Legality

This is engineering guidance, not legal advice. When the situation is unclear or high-stakes, tell the user to check with their legal or security team.

## When to Use

- Before the first REA call on any target the user did not build
- When a request mentions bypassing protection, licences, DRM, anti-cheat, or authentication
- When the purpose shifts mid-investigation (e.g. from "understand" to "extract" or "attack")

## How It Works

### 1. Record the basis

Write one line in `.recc/plan.md` under **Scope**:

| Basis | Typical examples |
|---|---|
| Own software | Your company's release builds, lost-source legacy tools |
| Interoperability | File formats or protocols you need to read/write compatibly |
| Authorized security work | Pentest or bug bounty with a written scope that includes the target |
| Education / CTF | Crackmes, CTF binaries, course material |
| Defensive analysis | Your own app's hardening review, patch diffing your dependencies |
| Feature understanding | Studying how a shipped product behaves to design your own, clean-room |

If none fits, ask the user before continuing.

### 2. Hard limits (stop and explain)

- Extracting credentials, keys, tokens, or personal data for use against others
- Circumventing DRM, licence checks, paywalls, or anti-cheat for use or distribution
- Building or improving malware, exploits for systems the user does not control, or detection evasion
- Attacking live third-party services (scanning, fuzzing, replaying captured traffic against them)

Defensive work on these topics is fine: analyzing a malware sample in an isolated lab for detection, reviewing your own licence check for weaknesses, or reporting a vulnerability responsibly.

### 3. Respect licences and terms

Some EULAs prohibit reverse engineering; some jurisdictions allow it for interoperability or security research regardless. Note any known restriction in the plan and let the user decide with that information.

### 4. Clean-room output

When the goal is building an equivalent feature, follow `re-reconstructor`: specify behavior in your own words and do not copy decompiled code, proprietary strings, or assets into the user's project.

### 5. Local and least-impact by default

- Analyze copies of artifacts, not installed production instances, when practical.
- Static before runtime; runtime only on machines the user controls.
- Keep findings local (`.recc/`), and redact secrets found in targets.

## Examples

- "Rebuild the way this note app's search ranks results" → Feature understanding; clean-room reconstruction. Proceed.
- "Find the API key in this app so I can use their backend for free" → Hard limit. Explain why, and offer to review the user's *own* app for embedded secrets instead.
- "Our vendor's SDK crashes; find out why" → Interoperability/defensive. Proceed with crash triage (`trace_crash`), and note any licence restrictions.
