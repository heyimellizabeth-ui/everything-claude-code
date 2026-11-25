import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Mode, StudioState, Tab } from '../types'
import {
  DEFAULT_STATE, DIALS, FONTS, KINDS, PRESETS,
  checks, kindOf, masterMd, normHex, output, presetOf, promptText, readText, suggestedAccent, tokens, validHex, wheel,
} from './engine'

const PANE = 'design-studio'
const TITLE = 'Design Studio'
const STORE_KEY = 'studio'

// Bump the shape tag when StudioState's fields change: an older stored value is then declined.
const studio = atom({ plugin: 'design-studio', key: 'studio' } as const, DEFAULT_STATE, { shape: 'studio-1' })
const isOpen = atom({ plugin: 'design-studio', key: 'isOpen' } as const, false)
const note = atom({ plugin: 'design-studio', key: 'note' } as const, '')

const PILL = { ok: 'Pass', warn: 'Check', bad: 'Fail' } as const
const PILL_COLOR = { ok: 'success', warn: 'warning', bad: 'error' } as const
const TABS: [Tab, string][] = [['prompt', 'Prompt'], ['master', 'MASTER.md'], ['css', 'CSS tokens']]

const isStudioState = (v: unknown): v is StudioState =>
  typeof v === 'object' && v !== null && 'preset' in v && 'dials' in v && Array.isArray((v as StudioState).dials)

async function patch($: EngineInterface, change: Partial<StudioState>) {
  const next = { ...(await read($, studio)), ...change }
  await update($, studio, () => next)
  await $.store.set(STORE_KEY, next)
}

async function say($: EngineInterface, text: string) {
  await update($, note, () => text)
}

async function openPane($: EngineInterface) {
  const opened = await $.ui.open({ id: PANE, title: TITLE })
  await update($, isOpen, () => true)
  return opened
}

const pickKind = ($: EngineInterface, id: string) => {
  const k = KINDS.find(x => x.id === id) ?? KINDS[0]!
  const p = PRESETS[k.preset] ?? PRESETS.soft!
  return patch($, { kind: k.id, dials: [...k.dials], preset: k.preset, accent: p.accent, font: p.font })
}
const pickPreset = ($: EngineInterface, id: string) => {
  const p = PRESETS[id] ?? PRESETS.soft!
  return patch($, { preset: id, accent: p.accent, font: p.font })
}
const nudgeDial = async ($: EngineInterface, i: 0 | 1 | 2, by: number) => {
  const dials = [...(await read($, studio)).dials] as StudioState['dials']
  dials[i] = Math.min(10, Math.max(1, dials[i] + by))
  return patch($, { dials })
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'design-studio',
      description: 'Open the Design Studio pane: presets, dials, accent, review gate, prompt and MASTER.md',
    })
    const stored = await $.store.get(STORE_KEY)
    if (isStudioState(stored)) await update($, studio, () => ({ ...DEFAULT_STATE, ...stored }))
    const panes = await $.ui.panes()
    await update($, isOpen, () => panes.some(p => p.id === PANE))
    return next(e)
  })

  on('command.run', { command: 'design-studio' }, async $ => {
    await openPane($)
    return { text: 'Design Studio opened beside the chat.' }
  })

  on('ui.close', async ($, e, next) => {
    const done = await next(e)
    if (e.id === PANE) await update($, isOpen, () => false)
    return done
  }).catch(($, e, next) => next(e))

  // The button: one row above the prompt while the studio is closed.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || (await read($, isOpen))) return next(e)
    const { Box, Button } = $.ui.resolve(e)
    return (
      <Box>
        <Button key="open-studio" dimColor onPress={() => openPane($)}>
          ◐ Design Studio
        </Button>
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button, Input, Select, Code } = $.ui.resolve(e)
    const S = await read($, studio)
    const message = await read($, note)
    const t = tokens(S)
    const p = presetOf(S)
    const gate = checks(S)
    const fix = suggestedAccent(S)
    const passed = gate.filter(c => c.state === 'ok').length

    // Minimized on the desktop app: a glance and one button back in.
    if (e.props.placement === 'widget') {
      return (
        <Box flexDirection="column">
          <Text bold>{S.project}</Text>
          <Text dimColor>{p.name} · {passed}/{gate.length} checks pass</Text>
        </Box>
      )
    }

    const swatch = (color: string, label: string) => (
      <Box flexDirection="row" gap={1}>
        <Text color={color}>██</Text>
        <Text dimColor>{label} {color}</Text>
      </Box>
    )

    return (
      <Box flexDirection="column" gap={1}>
        <Text italic>{readText(S)}</Text>

        <Box flexDirection="column" gap={1}>
          <Text bold>Brief</Text>
          <Input key="project" label="Project" value={S.project}
            onSubmit={v => patch($, { project: v.trim() || DEFAULT_STATE.project })} />
          <Select key="kind" label="Building" value={S.kind}
            options={KINDS.map(k => ({ value: k.id, label: k.name }))}
            onSelect={v => pickKind($, v)} />
          <Select key="preset" label="Preset" value={S.preset}
            options={Object.entries(PRESETS).map(([id, x]) => ({ value: id, label: `${x.name}: ${x.blurb}` }))}
            onSelect={v => pickPreset($, v)} />
          <Select key="font" label="Fonts" value={S.font}
            options={FONTS.map(f => ({ value: f.id, label: f.name }))}
            onSelect={v => patch($, { font: v })} />
        </Box>

        <Box flexDirection="column">
          <Text bold>Dials</Text>
          {DIALS.map((d, i) => {
            const idx = i as 0 | 1 | 2
            return (
              <Box flexDirection="row" gap={1}>
                <Button key={`dial-${d.id}-down`} label="−" onPress={() => nudgeDial($, idx, -1)} />
                <Text tabular>{d.name} {S.dials[idx]}</Text>
                <Button key={`dial-${d.id}-up`} label="+" onPress={() => nudgeDial($, idx, 1)} />
                <Text dimColor>{d.lo} to {d.hi}</Text>
              </Box>
            )
          })}
        </Box>

        <Box flexDirection="column" gap={1}>
          <Text bold>Accent and theme</Text>
          <Box flexDirection="row" gap={1}>
            <Text color={S.accent}>██</Text>
            <Input key="accent" label="Accent" value={S.accent}
              onSubmit={v => (validHex(v) ? patch($, { accent: normHex(v) }) : say($, `${v} is not a hex colour like #2f6f5e.`))} />
          </Box>
          <Box flexDirection="row" gap={1}>
            {(['light', 'dark'] as Mode[]).map(m => (
              <Button key={`mode-${m}`} variant={S.mode === m ? 'primary' : 'secondary'}
                label={m === 'light' ? 'Light' : 'Dark'} onPress={() => patch($, { mode: m })} />
            ))}
          </Box>
          <Box flexDirection="column">
            {swatch(t.pal.bg, 'bg')}
            {swatch(t.pal.text, 'text')}
            {swatch(t.pal.muted, 'muted')}
            {swatch(t.accent, 'accent')}
          </Box>
        </Box>

        <Box flexDirection="column">
          <Box flexDirection="row" gap={1}>
            <Text bold>Review gate</Text>
            <Text dimColor>{passed} of {gate.length} pass</Text>
          </Box>
          {gate.map(c => (
            <Box flexDirection="row" gap={1}>
              <Text color={PILL_COLOR[c.state]} bold>{PILL[c.state]}</Text>
              <Text>{c.name}</Text>
              <Text dimColor>{c.detail}</Text>
            </Box>
          ))}
          {fix !== undefined && (
            <Button key="fix-accent" variant="primary" onPress={() => patch($, { accent: fix })}>
              Fix accent to {fix}
            </Button>
          )}
        </Box>

        <Box flexDirection="column">
          <Text bold>Accessible accents</Text>
          <Text dimColor>Each passes as a link and under a button label on this preset.</Text>
          <Box flexDirection="row" flexWrap="wrap" columnGap={1}>
            {wheel(p.light.bg).map(c => (
              <Button key={`wheel-${c}`} plain onPress={() => patch($, { accent: c })}>
                <Text color={c}>██</Text> {c}
              </Button>
            ))}
          </Box>
        </Box>

        <Box flexDirection="column" gap={1}>
          <Box flexDirection="row" gap={1}>
            {TABS.map(([id, name]) => (
              <Button key={`tab-${id}`} variant={S.tab === id ? 'primary' : 'secondary'} label={name}
                onPress={() => patch($, { tab: id })} />
            ))}
          </Box>
          <Code source={output(S)} language={S.tab === 'css' ? 'css' : S.tab === 'master' ? 'markdown' : 'text'} />
          <Box flexDirection="row" flexWrap="wrap" gap={1}>
            <Button key="send" variant="primary" onPress={async () => {
              await $.prompt.submit({ text: promptText(S), asUser: true })
              await say($, 'Sent the prompt to Claude.')
            }}>Build with Claude</Button>
            <Button key="copy" onPress={async press => {
              const copied = await $.ui.copy({ text: output(S), surface: press.surface })
              await say($, copied.isCopied ? 'Copied.' : `Could not copy: ${copied.reason}`)
            }}>Copy</Button>
            <Button key="save" onPress={async () => {
              await $.fs.write('design-system/MASTER.md', masterMd(S))
              await say($, `Saved design-system/MASTER.md for ${kindOf(S).name.toLowerCase()}.`)
            }}>Save MASTER.md</Button>
            <Button key="reset" dimColor onPress={async () => {
              await patch($, { ...DEFAULT_STATE })
              await say($, 'Back to the defaults.')
            }}>Reset</Button>
          </Box>
          {message !== '' && <Text dimColor>{message}</Text>}
        </Box>
      </Box>
    )
  })
}
