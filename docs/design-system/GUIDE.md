# Design system guide

One page on how to use the unified design system day to day.

## The parts

| Part | Where | What it does |
|---|---|---|
| Skill | `skills/unified-design-system/` | The 7 steps every design task follows, with the rules, presets and review checklist in `references/` |
| Project files | `design-system/` in each project | `MASTER.md` (tokens and Never list), `pages/<page>.md` (per-page overrides) and `PREFERENCES.md` (what you liked or rejected) |
| Chains | `/c1` to `/c5`, `/studio-build` | Build a site or app. Every chain reads MASTER.md and PREFERENCES.md first and ends with `/design-gate` |
| Design Studio mod | `plugins/design-studio/` | The pane beside the chat: Studio, Capabilities, Chains, Preferences, Health and Edit |
| Capabilities file | `docs/capabilities.json` | Everything across the 7 repos, with design fields |

## Start a project

1. Open Design Studio, pick a preset, kind and accent, and press **Save MASTER.md**. For a Design Studio brand config, `/studio-build` writes it for you.
2. Check the **Health** view. Fix anything marked Fail before running a chain.
3. Pick a chain in the **Chains** view: `/c1` for a new site, `/c2` for a page, `/c3` to polish, `/c4` to ship, `/c5` for upkeep.

## Change something

- **A token or rule for one project:** edit that project's `design-system/MASTER.md`. Chains read it on the next run.
- **A default in the studio** (preset text, chain steps, prompt wording): use the **Edit** view. Clear a box to go back to the default.
- **A rule for every project:** edit `skills/unified-design-system/references/rules.md`, and note the source under the rule.

## Teach it your taste

Say what you like or reject while you work, or add it in the **Preferences** view. Each entry goes into `design-system/PREFERENCES.md` as `always`, `never` or `prefer`. When the same rule shows up three times, Health and Preferences say it is ready, and Claude moves it into MASTER.md.

## Keep it current

- `npm run capabilities:write` rebuilds `docs/capabilities.json` from the repos.
- `npm run capabilities:check` fails when the file is stale. It runs in `npm test`, so CI catches drift.
- `node scripts/design-gate.js --json` reports `skipped: true` when Hallmark isn't installed. The checklist gate still runs.

## Retired

`design-system`, `motion-ui`, `site-init`, `taste-skill-v1`, `gpt-tasteskill`, `slides` and `create-theme` are replaced by this system. Health warns if an old copy is still installed.
