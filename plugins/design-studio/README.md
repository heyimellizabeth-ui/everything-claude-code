# design-studio

A Claude Code mod that puts the Unified Design Studio beside the chat, in every session where the
mod is installed. It is the React Lab version of the studio (`prototypes/design-studio-lab`, PR #64)
ported to the mod's own elements, so it runs in the terminal, the desktop app and VS Code.

## Open it

- Press **◐ Design Studio** in the row above the prompt. The button hides while the studio is open.
- Or type `/design-studio`.

## What the pane does

| Part | What it does |
|---|---|
| Brief | Project name, what you are building, preset and font pairing |
| Dials | Variance, motion and density, 1 to 10 |
| Accent and theme | Accent hex, light or dark palette, swatches of the tokens |
| Review gate | Six live checks (contrast, motion, AI-slop accent), with **Fix accent** when the accent fails |
| Accessible accents | Eight accents that pass on the preset; press one to use it |
| Output | Prompt, MASTER.md or CSS tokens, with **Build with Claude** (sends the prompt), **Copy**, **Save MASTER.md** (writes `design-system/MASTER.md` in the project) and **Reset** |

Your choices are kept across sessions.

## Install

```text
/plugin marketplace add heyimellizabeth-ui/everything-claude-code
/plugin install design-studio@ecc
```

## Develop

```bash
claude plugin validate plugins/design-studio
claude plugin test plugins/design-studio
claude --plugin-dir plugins/design-studio   # load it in one session while editing
```

The engine (`hooks/engine.ts`) is the React Lab's `engine/` code ported to TypeScript. Keep the two
in step until the lab is retired.
