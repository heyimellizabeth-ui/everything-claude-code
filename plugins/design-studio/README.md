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

Six views sit at the top of the pane:

| View | What it shows |
|---|---|
| Studio | Everything above |
| Capabilities | Every command and skill loaded in this session, design ones first and marked ◆, with a search box and a Design only / Everything switch |
| Chains | The chelp chains c1 to c5 and studio-build, step by step as they run through the unified design system, each with a **Run** button |
| Preferences | `design-system/PREFERENCES.md`: what you liked or rejected, with a form to add a rule (always, never, prefer). It says when rules look settled enough to move into MASTER.md |
| Health | What needs attention: commands the chains call that aren't installed, Hallmark missing (the gate then runs the checklist only), retired skills still installed, no MASTER.md in the project, and preferences ready to become rules |
| Edit | Change any default: the design read, the prompt's opening and closing, the Run-a-chain text, the current preset's name, description, accent and Never list, the current kind's name and audience, and each chain's name, use and steps. Clear a box to go back to the default, or **Reset every edit** |

The output box in the Studio view is editable too: press **Edit this text** to change the prompt, MASTER.md or
CSS before you build, copy or save. **Use the generated text** goes back. Every edit is kept across sessions.

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
