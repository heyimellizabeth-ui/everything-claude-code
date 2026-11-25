# Sources and licences

This skill distils ideas from the projects below. It does not vendor their
files. Rules are rewritten in our own words and each carries a source tag
in square brackets. Licences were checked against the `LICENSE` file in each
local clone on 2026-11-25. This is engineering guidance, not legal advice.

## Tag map

| Tag | Source | Repo | Licence |
|---|---|---|---|
| `[taste-skill]` | taste-skill (13 design skills) | github.com/Leonxlnx/taste-skill | MIT |
| `[uupm]` | ui-ux-pro-max | github.com/nextlevelbuilder/ui-ux-pro-max-skill | MIT |
| `[astryx]` | Astryx component system | github.com/meta/astryx | MIT |
| `[mwg]` | modern-web-guidance, including the agent-browser copy of its verification skill | github.com/GoogleChrome/modern-web-guidance; `skill-data/modern-web-guidance` in github.com/vercel-labs/agent-browser | Apache-2.0 code, CC-BY 4.0 guide text |
| `[dogfood]` | agent-browser dogfood skill and issue taxonomy | github.com/vercel-labs/agent-browser (`skill-data/dogfood`) | Apache-2.0 |
| `[agent-browser]` | agent-browser CLI and core guide | github.com/vercel-labs/agent-browser | Apache-2.0 |
| `[rea]` | REA, the MCP server behind RECC | github.com/morluto/rea | MIT |
| `[hallmark]` | Hallmark and its `sloplint` linter | external, referenced only | not checked, not vendored |
| `[ecc:<name>]` | An ECC skill, command or script named `<name>` | this repository | MIT |

## Per source

### taste-skill (MIT)

- Copyright (c) 2026 Leonxlnx.
- Used for: anti-slop rules, the dials (variance, motion, density), preset
  character (soft, minimal, brutalist), motion defaults and the visual QA
  widths.
- No files are copied. If text is ever copied, keep the copyright and
  licence notice from its `LICENSE`.

### ui-ux-pro-max (MIT)

- Copyright (c) 2024 Next Level Builder.
- Used for: style, palette, typography and UX-guideline data, reached by
  calling the `ui-ux-pro-max` skill in step 5. The skill's data stays in that
  skill.
- Its `CLAUDE.md` is repo-specific guidance for that project and is not
  applied here.

### Astryx (MIT)

- Copyright (c) 2026 Meta Platforms, Inc.
- Used for: the React component layer (step 4), its themes and its rules, via
  the `astryx-components` skill. Name the Astryx theme when passing a system
  to Hallmark; Hallmark does not infer it. [ecc:astryx-components]

### modern-web-guidance (Apache-2.0 code, CC-BY 4.0 guide text)

- Software code is Apache-2.0. Documentation and guide content under
  `guides/` is licensed under Creative Commons Attribution 4.0
  International (CC-BY 4.0). Portions of the guides derive from MDN Web
  Docs (Mozilla contributors), W3C, WHATWG and IETF specifications.
- Rules marked `[mwg]` derive from the guides (typography, colour, dark
  mode, natural interactions, form-factor adaptation) and from the
  verification protocol: baseline, apply, verify, report, with "unverified"
  when no check ran.
- Attribution wording, to keep wherever this material is published or
  redistributed:

> This work includes guidance adapted from "Modern Web Guidance" by the
> Chrome team and contributors (github.com/GoogleChrome/modern-web-guidance),
> licensed under CC BY 4.0 (creativecommons.org/licenses/by/4.0/). Changes
> were made: the text was summarised, reworded and combined with other rules.
> This adaptation is not endorsed by the original authors.

- CC-BY needs three things: credit, a link to the licence, and a statement
  that changes were made. The block above covers all three. Do not paste
  guide text at length; paraphrase and tag it `[mwg]`.

### agent-browser (Apache-2.0)

- Source: github.com/vercel-labs/agent-browser. Used for: the command forms
  in `visual-check.md`, the evidence table, the severity scale and the
  report habits from dogfood (`[dogfood]`).
- Apache-2.0 needs the licence and any NOTICE kept if files are copied. We
  copy none, only short command names.

### REA and RECC (MIT, ECC)

- REA is MIT, copyright (c) 2026 morluto. Its `THIRD_PARTY_NOTICES.md` says
  third-party tools it can call keep their own licences, and that its licence
  grants no rights to proprietary analysis tools.
- RECC is the ECC workflow around REA: `re-scope-and-legality`,
  `re-evidence-discipline`, `re-target-playbooks`, `reverse-engineer-anything`
  and the `/re-*` commands. Used by the research module for scope, the
  Observed / Derived / Inferred / Unknown claim types and the deeper
  investigation path.
- REA is called through MCP (`npx -y rea-agents@6.7.0 mcp`). It is not
  vendored.

### ECC skills (MIT)

- ECC is MIT, copyright (c) 2026 Affaan Mustafa. Tags `[ecc:...]` point to:
  `design-system` (research step), `accessibility`, `astryx-components`,
  `make-interfaces-feel-better`, `re-scope-and-legality`,
  `re-evidence-discipline`, `re-target-playbooks`, the `/chelp` family and
  `/design-gate`, and this repository's conventions
  (`everything-claude-code`).

### Hallmark (external)

- Hallmark is a separate design skill and linter (`sloplint`) that ECC never
  vendors. It is installed by the user (`npx skills add nutlope/hallmark -g`
  per the chelp docs) and called through `/hallmark` and `/design-gate`.
- This skill references its behaviour as read from ECC's own files
  (`commands/design-gate.md`, `scripts/lib/hallmark.js`,
  `skills/astryx-components/SKILL.md`). Hallmark's repo and licence were not
  available to check. Treat every `[hallmark]` statement as "as described by
  ECC", and do not copy Hallmark text or rules into this repository.
- Decision 7: this skill writes `design-system/MASTER.md` only, never a root
  `DESIGN.md`, because Hallmark treats that file as its project marker.
  Decision 8: MASTER.md wins over a theme Hallmark would deal.

## If you add a source

1. Check its `LICENSE` file, not its README.
2. Add a tag and a row to the table above.
3. For CC-BY or Apache-2.0 material, add the notice it requires.
4. Never copy long passages. Paraphrase, tag, and credit.
