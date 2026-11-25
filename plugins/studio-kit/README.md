# studio-kit

Lizzy's own work from this repository, as one plugin:

- **Web chains**: `/c1` to `/c5`, `/chelp`, `/chelp-pipeline`, `/chelp-advisor`, `/design-gate`, `/studio-build`
- **Design system**: `unified-design-system`, `astryx-components`, `wireframe-solid`, `static-site-release`
- **RECC**: `reverse-engineer-anything`, the `re-*` skills and the five `re-*` agents
- **Scripts**: `scripts/design-gate.js`, `scripts/chelp-pipeline.js`, `scripts/lib/hallmark.js`, `scripts/site-template/`
- **Templates**: `templates/queer-nightclub`

## Install

```text
/plugin marketplace add heyimellizabeth-ui/everything-claude-code
/plugin install studio-kit@ecc
```

The chains call ECC skills such as `/prp-prd`, `/quality-gate` and `/santa-loop`, so install `ecc` as well
for those steps. The RECC evidence hooks (`post:recc-evidence-log`, `stop:recc-unknowns-reminder`) and the
REA MCP entry stay in ECC, because they run on ECC's hook runtime.

In a cloud session, `scripts/setup-chelp-cloud.sh` (in the repository root) copies this kit into `~/.claude`.
