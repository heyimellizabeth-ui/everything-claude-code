# chain-tracker

A Claude Code mod that keeps the ECC web chains (/c1 to /c5) and REA reverse-engineering work visible while you work.

- **Pane "Chain progress"**: the steps of the running chain, ticked off as you run each step's command or Claude runs its skill, with the next step highlighted, a button to mark it done, and a reset.
- **Status line**: `c1 4/10 · next /design-gate`, plus a reminder with the number of REA calls this session so evidence gets cited and unknowns listed.
- **/chain**: opens the pane. `/chain c3` starts a chain by hand, `/chain reset` clears it.

Typing `/c1` to `/c5` starts that chain. Progress is kept per project folder across sessions.
