---
description: Activate the chelp pipeline: check that Hallmark, the browser checks and the advisor are ready, prove them with a smoke test, and print the exact fix for anything missing.
argument-hint: "[--install] [--no-smoke] [--json]"
---

# chelp Pipeline

One command to get the chelp web chains (`/c1` to `/c5`, `/studio-build`) ready to use. It checks what they
need, proves the browser checks work, and tells you the exact fix for anything missing. It changes nothing
unless you pass `--install`.

## Usage

```
/chelp-pipeline
/chelp-pipeline --install
/chelp-pipeline --no-smoke
```

## Process

1. Run the check:

   ```bash
   ECC_ROOT="${CLAUDE_PLUGIN_ROOT:-$(node -e "var r=(()=>{var e=process.env.CLAUDE_PLUGIN_ROOT;if(e&&e.trim())return e.trim();var p=require('path'),f=require('fs'),h=require('os').homedir(),d=p.join(h,'.claude'),q=p.join('scripts','lib','utils.js');if(f.existsSync(p.join(d,q)))return d;for(var s of [['ecc'],['ecc@ecc'],['marketplaces','ecc'],['everything-claude-code'],['everything-claude-code@everything-claude-code'],['marketplaces','everything-claude-code']]){var l=p.join(d,'plugins',...s);if(f.existsSync(p.join(l,q)))return l}try{for(var g of ['ecc','everything-claude-code']){var b=p.join(d,'plugins','cache',g);for(var o of f.readdirSync(b,{withFileTypes:true})){if(!o.isDirectory())continue;for(var v of f.readdirSync(p.join(b,o.name),{withFileTypes:true})){if(!v.isDirectory())continue;var c=p.join(b,o.name,v.name);if(f.existsSync(p.join(c,q)))return c}}}}catch(x){}return d})();console.log(r)")}"
   node "$ECC_ROOT/scripts/chelp-pipeline.js" $ARGUMENTS
   ```

2. Read the verdict line at the end and report it to the user as printed:

   | Verdict | Meaning |
   |---------|---------|
   | `READY` | Hallmark, puppeteer-core and Chrome are present and the browser-tier smoke test printed `render: ran`. Every chain works, including `/c4`'s `--require-render`. |
   | `READY (static checks only)` | Hallmark works but the browser checks do not. `/design-gate` runs the static checks; `--render` and `--require-render` will not pass until puppeteer-core and Chrome work. |
   | `READY (browser checks not smoke tested)` | Everything is present; `--no-smoke` skipped the proof. |
   | `NOT READY` | Node, Hallmark or the ECC chelp files are missing. |

3. For each `MISSING` line, give the user the printed `fix:` command. Do not install anything yourself
   unless the user asks. `--install` runs the two install commands for them
   (`npx skills add nutlope/hallmark -g` and `npm i -g puppeteer-core`) and then checks again. Chrome is never
   installed for you.

4. Then tell the user the two things the script cannot do:
   - Run `/advisor opus` so Claude Code's advisor tool uses Opus, and read `skills/chelp-advisor/SKILL.md`
     before consulting it. `/chelp-advisor` works without it.
   - For a React project, set up Astryx with the `stone` theme and the global CSS in the `astryx-components`
     skill.

5. Offer `/chelp` to pick the chain.

## What it checks

| Check | Needed for |
|-------|------------|
| Node 18 or later | everything |
| Hallmark design skill (found at its install location or `HALLMARK_SKILL_DIR`) | `/hallmark`, `/design-gate` |
| ECC chelp files: the gate script, the advisor agent, command and playbook | the chains |
| puppeteer-core (local, global or `HALLMARK_PUPPETEER`) | `--render`, `--require-render` |
| Chrome or Chromium (`CHROME_PATH` or a usual location) | `--render`, `--require-render` |
| Smoke test: lint a tiny page with `--render` and read `render: ran` | proves the two lines above work together |

It also reads the current folder: whether it is an Astryx project, and whether `/design-gate` would block
here (a Hallmark stamp, `design.md` or `.hallmark` record) or only report.

## Cloud sessions

Installs do not survive between cloud sessions, so put the setup in the environment's setup script (the
cloud environment menu in the session's title bar, then Edit, then Setup script). This version works in
any session, with or without the ECC repository attached: it uses the checkout when there is one and
otherwise fetches ECC from GitHub.

```bash
ECC="$PWD/everything-claude-code"
if [ ! -f "$ECC/scripts/setup-chelp-cloud.sh" ]; then
  ECC="${ECC_BOOT_DIR:-/opt/ecc}"
  rm -rf "$ECC"
  git clone --depth 1 https://github.com/heyimellizabeth-ui/everything-claude-code "$ECC" >/dev/null 2>&1 \
    || echo "[chelp-setup] could not fetch everything-claude-code from GitHub"
fi
if [ -f "$ECC/scripts/setup-chelp-cloud.sh" ]; then
  bash "$ECC/scripts/setup-chelp-cloud.sh" "$ECC" || true
else
  echo "[chelp-setup] chelp setup script not found: attach everything-claude-code to the session or check the network"
fi
```

Paste it into every environment you want the pipeline in. It runs only when a container is built fresh,
not when a session is resumed, and only in environments that have it.

`scripts/setup-chelp-cloud.sh` installs the ECC commands, agents, skills and scripts into `~/.claude`, so
`/chelp`, `/c1` to `/c5`, `/design-gate`, `/chelp-pipeline` and `/chelp-advisor` exist; puppeteer-core
globally; and the Hallmark skill, from a `hallmark` checkout on the session or else a clone. It is best
effort: a failed step is reported and never stops the session from starting. `--dry-run` shows what it
would do. Run it by hand in a session to do the same, then `/chelp-pipeline` to confirm.

Chrome is already at `/usr/bin/google-chrome` in a cloud session (a wrapper that adds `--no-sandbox` for
root); `CHROME_PATH` points there. Pointing straight at a Chromium binary fails as root.

## Arguments

$ARGUMENTS:

- `--install`: install the missing Hallmark and puppeteer-core, then check again
- `--no-smoke`: skip the browser-tier smoke test
- `--json`: print the full result as JSON
