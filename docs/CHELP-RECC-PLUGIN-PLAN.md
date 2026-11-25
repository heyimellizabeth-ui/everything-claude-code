# Plan: a stand-alone plugin for the chelp chains and RECC

The chelp web chains and the RECC reverse-engineering module live inside this fork of ECC. To use them
today you install all of ECC (255 skills, 66 agents, about 30 hooks). This plan lists what a separate
plugin would hold and what has to change first.

## Done in this branch

- The chain and RECC commands moved to skills (`skills/c1` to `skills/c5`, `skills/chelp`,
  `skills/chelp-pipeline`, `skills/design-gate`, `skills/site-init`, `skills/studio-build`,
  `skills/re-*`), so the content is one kind of file.
- The `chain-tracker` mod (`plugins/chain-tracker`) is its own plugin and installs on its own:
  `/plugin install chain-tracker@ecc` after adding this repository as a marketplace.

## What the plugin would hold

| Kind | Items |
|---|---|
| Skills | c1 to c5, chelp, chelp-pipeline, chelp-advisor, design-gate, site-init, studio-build, astryx-components, wireframe-solid, static-site-release, re-compare, re-doctor, re-investigate, re-pipeline, re-rebuild, re-verify, re-evidence-discipline, re-scope-and-legality, re-target-playbooks, re-feature-to-implementation, reverse-engineer-anything |
| Agents | chelp-advisor, re-investigator, re-parity-verifier, re-planner, re-reconstructor, re-security-analyst |
| Commands | chelp-advisor |
| Scripts | design-gate.js, chelp-pipeline.js, lib/hallmark.js, setup-chelp-cloud.sh, site-template/ |
| Hooks | recc-evidence.js (post:recc-evidence-log, stop:recc-unknowns-reminder) |
| Templates | templates/queer-nightclub |
| MCP | the REA entry from mcp-configs/rea-tool-catalog.json |

## What blocks a clean split

1. **Plugin root lookups.** `skills/design-gate/SKILL.md` and the RECC hooks find their scripts by
   looking for an installed plugin named `ecc` or `everything-claude-code`. A plugin with another
   name needs those lookups to use `CLAUDE_PLUGIN_ROOT` alone.
2. **Shared hook runtime.** The RECC hooks run through `scripts/hooks/run-with-flags.js` and
   `scripts/lib/utils.js`. The new plugin either copies that runtime or calls `recc-evidence.js`
   directly from its own `hooks/hooks.json`.
3. **Steps that call other ECC skills.** The chains call ECC skills such as `/prp-prd`,
   `/quality-gate`, `/santa-loop` and `/multi-frontend`. The plugin should declare ECC as a
   dependency, or the chains should say which steps need ECC.
4. **One source of truth.** Copying files into a second folder would drift. Either move the files
   into the new plugin and have ECC depend on it, or generate the plugin folder from a list with a
   check in CI.

## Suggested order

1. Make the root lookups in the design gate and RECC hooks use `CLAUDE_PLUGIN_ROOT` only.
2. Create a separate repository for the plugin and move the files listed above into it.
3. Add it to this repository's marketplace and list it as a dependency where ECC skills call it.
