# Plan: a stand-alone plugin for the chelp chains and RECC

The chelp web chains and the RECC reverse-engineering module live inside this fork of ECC. To use them
today you install all of ECC (255 skills, 66 agents, about 30 hooks). This plan lists what a separate
plugin would hold and what has to change first.

## Done in this branch

- The chain and RECC commands moved to skills (`skills/c1` to `skills/c5`, `skills/chelp`,
  `skills/chelp-pipeline`, `skills/design-gate`, `skills/studio-build`,
  `skills/re-*`), so the content is one kind of file.
- The `chain-tracker` mod (`plugins/chain-tracker`) is its own plugin and installs on its own:
  `/plugin install chain-tracker@ecc` after adding this repository as a marketplace.

## Done: plugins/studio-kit (2026-11-25)

The skills, agents, the `chelp-advisor` command, the chelp and design-gate scripts, `site-template/` and
`templates/queer-nightclub` now live in `plugins/studio-kit`, listed in this repository's marketplace as
`studio-kit`. ECC no longer ships them: they left the install modules, `package.json` files and
`agent.yaml`, and the `reverse-engineering` install module is gone (the `recc` profile keeps the ECC
modules the RECC skills build on).

- Root lookups: the skills find their scripts through `KIT_ROOT`, which checks `CLAUDE_PLUGIN_ROOT`,
  `plugins/studio-kit` in a checkout, `~/.claude`, then installed marketplace and cache copies.
- Cloud sessions: `scripts/setup-chelp-cloud.sh` copies the kit into `~/.claude` after the ECC install.
- Still in ECC: the RECC evidence hooks (they need ECC's hook runtime), the REA MCP entry and its
  contract test, and `setup-chelp-cloud.sh`.
- The chains still call ECC skills, so install `ecc` alongside the kit.

Moving the kit to a repository of its own remains possible later; this folder is that repository's content.
