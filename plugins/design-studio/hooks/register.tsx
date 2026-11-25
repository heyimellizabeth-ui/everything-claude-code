import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Mode, Overrides, Rule, StudioState, Tab, TextKey, View } from '../types'
import {
  CHAINS, DEFAULT_STATE, DIALS, FONTS, KINDS, PRESETS, TEXT_DEFAULTS, TEXT_LABELS, VIEWS,
  addPreference, applyOverrides, capabilityList, chainPrompt, checks, editCount, generated, isDesign, kindOf, lines, setOverride, textOf, parsePreferences, promotionHint, normHex, output, presetOf, readText, suggestedAccent, tokens, validHex, wheel,
} from './engine'

const PANE = 'design-studio'
const TITLE = 'Design Studio'
const STORE_KEY = 'studio'

// Bump the shape tag when StudioState's fields change: an older stored value is then declined.
const studio = atom({ plugin: 'design-studio', key: 'studio' } as const, DEFAULT_STATE, { shape: 'studio-1' })
const isOpen = atom({ plugin: 'design-studio', key: 'isOpen' } as const, false)
const note = atom({ plugin: 'design-studio', key: 'note' } as const, '')
const viewAtom = atom({ plugin: 'design-studio', key: 'view' } as const, 'studio' as View)
const query = atom({ plugin: 'design-studio', key: 'query' } as const, '')
const designOnly = atom({ plugin: 'design-studio', key: 'designOnly' } as const, true)
const prefRule = atom({ plugin: 'design-studio', key: 'prefRule' } as const, 'prefer' as Rule)
const overridesAtom = atom({ plugin: 'design-studio', key: 'overrides' } as const, {} as Overrides)
const editingOutput = atom({ plugin: 'design-studio', key: 'editingOutput' } as const, false)
const editChain = atom({ plugin: 'design-studio', key: 'editChain' } as const, 'c1')
const OVERRIDES_KEY = 'overrides'

const isOverrides = (v: unknown): v is Overrides => typeof v === 'object' && v !== null && !Array.isArray(v)

async function saveOverrides($: EngineInterface, change: (o: Overrides) => Overrides, message: string) {
  const next = change(await read($, overridesAtom))
  applyOverrides(next)
  await update($, overridesAtom, () => next)
  await $.store.set(OVERRIDES_KEY, next)
  await say($, message)
}

const PREFS_PATH = 'design-system/PREFERENCES.md'
const MAX_ROWS = 40
const RULE_COLOR = { always: 'success', never: 'error', prefer: 'warning' } as const

async function readPrefs($: EngineInterface) {
  try {
    return (await $.fs.exists(PREFS_PATH)) ? await $.fs.read(PREFS_PATH) : ''
  } catch {
    return ''
  }
}

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
    const edits = await $.store.get(OVERRIDES_KEY)
    if (isOverrides(edits)) await update($, overridesAtom, () => edits)
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
    const O = await read($, overridesAtom)
    applyOverrides(O)
    const S = await read($, studio)
    const message = await read($, note)
    const t = tokens(S)
    const p = presetOf(S)
    const gate = checks(S)
    const fix = suggestedAccent(S)
    const passed = gate.filter(c => c.state === 'ok').length
    const view = await read($, viewAtom)

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

    const viewTabs = (
      <Box flexDirection="row" flexWrap="wrap" gap={1}>
        {VIEWS.map(([id, name]) => (
          <Button key={`view-${id}`} variant={view === id ? 'primary' : 'secondary'} label={name}
            onPress={() => update($, viewAtom, () => id)} />
        ))}
      </Box>
    )

    if (view === 'capabilities') {
      const all = (await $.command.list()).map(c => ({ name: c.name, description: c.description, source: c.source, plugin: c.plugin }))
      const q = await read($, query)
      const only = await read($, designOnly)
      const list = capabilityList(all, q, only)
      const designCount = all.filter(isDesign).length
      return (
        <Box flexDirection="column" gap={1}>
          {viewTabs}
          <Text dimColor>{all.length} commands and skills in this session, {designCount} of them design. Design ones are marked ◆.</Text>
          <Box flexDirection="row" gap={1}>
            <Input key="cap-search" label="Search" value={q} onSubmit={v => update($, query, () => v)} />
            <Button key="cap-design-only" variant={only ? 'primary' : 'secondary'}
              label={only ? 'Design only' : 'Everything'} onPress={() => update($, designOnly, x => !x)} />
          </Box>
          <Box flexDirection="column">
            {list.slice(0, MAX_ROWS).map(c => (
              <Box flexDirection="row" gap={1}>
                <Text color={isDesign(c) ? S.accent : undefined}>{isDesign(c) ? '◆' : '·'}</Text>
                <Text bold>/{c.name}</Text>
                <Text dimColor>{c.description.length > 90 ? `${c.description.slice(0, 89)}…` : c.description}</Text>
              </Box>
            ))}
            {list.length > MAX_ROWS && <Text dimColor>and {list.length - MAX_ROWS} more; search to narrow.</Text>}
            {list.length === 0 && <Text dimColor>Nothing matches.</Text>}
          </Box>
        </Box>
      )
    }

    if (view === 'chains') {
      return (
        <Box flexDirection="column" gap={1}>
          {viewTabs}
          <Text dimColor>Every chain reads MASTER.md and PREFERENCES.md first and ends with the review gate.</Text>
          {CHAINS.map(c => (
            <Box flexDirection="column">
              <Box flexDirection="row" gap={1}>
                <Text bold>/{c.id}</Text>
                <Text>{c.name}</Text>
                <Text dimColor>{c.when}</Text>
              </Box>
              <Text dimColor>{c.steps.join(' → ')}</Text>
              <Button key={`chain-${c.id}`} onPress={async () => {
                await $.prompt.submit({ text: chainPrompt(S, c.id), asUser: true })
                await say($, `Asked Claude to run /${c.id}.`)
              }}>Run /{c.id}</Button>
            </Box>
          ))}
          {message !== '' && <Text dimColor>{message}</Text>}
        </Box>
      )
    }

    if (view === 'preferences') {
      const md = await readPrefs($)
      const prefs = parsePreferences(md)
      const hint = promotionHint(prefs)
      const rule = await read($, prefRule)
      return (
        <Box flexDirection="column" gap={1}>
          {viewTabs}
          <Text dimColor>{PREFS_PATH}: what you liked or rejected. Every build reads it first.</Text>
          {prefs.length === 0 && <Text dimColor>No preferences logged in this project yet.</Text>}
          <Box flexDirection="column">
            {prefs.map(p => (
              <Box flexDirection="row" gap={1}>
                <Text color={RULE_COLOR[p.rule]} bold>{p.rule}</Text>
                <Text>{p.means}</Text>
                <Text dimColor>{p.date}</Text>
              </Box>
            ))}
          </Box>
          {hint !== undefined && <Text color="warning">{hint}</Text>}
          <Box flexDirection="column" gap={1}>
            <Text bold>Add one</Text>
            <Select key="pref-rule" label="Rule" value={rule}
              options={[{ value: 'always', label: 'Always' }, { value: 'never', label: 'Never' }, { value: 'prefer', label: 'Prefer' }]}
              onSelect={v => update($, prefRule, () => v as Rule)} />
            <Input key="pref-text" label="What it means" value=""
              onSubmit={async v => {
                const text = v.trim()
                if (text === '') return
                const date = new Date(await $.clock.now()).toISOString().slice(0, 10)
                await $.fs.write(PREFS_PATH, addPreference(await readPrefs($), { date, rule, means: text, words: 'added in Design Studio' }))
                await say($, `Logged: ${rule} ${text}`)
              }} />
          </Box>
          {message !== '' && <Text dimColor>{message}</Text>}
        </Box>
      )
    }

    if (view === 'edit') {
      const p = presetOf(S)
      const k = kindOf(S)
      const chainId = await read($, editChain)
      const chain = CHAINS.find(c => c.id === chainId) ?? CHAINS[0]!
      const edits = editCount(O)
      return (
        <Box flexDirection="column" gap={1}>
          {viewTabs}
          <Text dimColor>Change any default here. Edits are kept across sessions; clear a box and press Enter to go back to the default. {edits} edit{edits === 1 ? '' : 's'} in use.</Text>

          <Box flexDirection="column" gap={1}>
            <Text bold>Texts</Text>
            <Text dimColor>Fill-ins: {'{project} {kind} {audience} {vibe} {preset} {dials} {accent} {chain}'}</Text>
            {(Object.keys(TEXT_DEFAULTS) as TextKey[]).map(key => (
              <Input key={`edit-text-${key}`} label={TEXT_LABELS[key]} value={textOf(key)} rows={3}
                onSubmit={v => saveOverrides($, o => setOverride(o, 'texts', key, null, v.trim() === TEXT_DEFAULTS[key] ? '' : v.trim()),
                  v.trim() === '' ? `${TEXT_LABELS[key]} is back to the default.` : `Saved ${TEXT_LABELS[key].toLowerCase()}.`)} />
            ))}
          </Box>

          <Box flexDirection="column" gap={1}>
            <Text bold>Preset: {p.name}</Text>
            <Text dimColor>Pick another preset in the Studio view to edit that one.</Text>
            <Input key="edit-preset-name" label="Name" value={p.name}
              onSubmit={v => saveOverrides($, o => setOverride(o, 'presets', S.preset, 'name', v.trim()), 'Saved the preset name.')} />
            <Input key="edit-preset-blurb" label="Description" value={p.blurb}
              onSubmit={v => saveOverrides($, o => setOverride(o, 'presets', S.preset, 'blurb', v.trim()), 'Saved the preset description.')} />
            <Input key="edit-preset-accent" label="Default accent" value={p.accent}
              onSubmit={v => (v.trim() === '' || validHex(v)
                ? saveOverrides($, o => setOverride(o, 'presets', S.preset, 'accent', v.trim() === '' ? '' : normHex(v)), 'Saved the default accent.')
                : say($, `${v} is not a hex colour like #2f6f5e.`))} />
            <Input key="edit-preset-never" label="Never do (one per line)" value={p.never.join('\n')} rows={4}
              onSubmit={v => saveOverrides($, o => setOverride(o, 'presets', S.preset, 'never', lines(v)), 'Saved the Never list.')} />
          </Box>

          <Box flexDirection="column" gap={1}>
            <Text bold>Building: {k.name}</Text>
            <Input key="edit-kind-name" label="Name" value={k.name}
              onSubmit={v => saveOverrides($, o => setOverride(o, 'kinds', S.kind, 'name', v.trim()), 'Saved the name.')} />
            <Input key="edit-kind-audience" label="Audience" value={k.audience}
              onSubmit={v => saveOverrides($, o => setOverride(o, 'kinds', S.kind, 'audience', v.trim()), 'Saved the audience.')} />
          </Box>

          <Box flexDirection="column" gap={1}>
            <Text bold>Chain</Text>
            <Select key="edit-chain" label="Chain" value={chain.id}
              options={CHAINS.map(c => ({ value: c.id, label: `/${c.id} ${c.name}` }))}
              onSelect={v => update($, editChain, () => v)} />
            <Input key="edit-chain-name" label="Name" value={chain.name}
              onSubmit={v => saveOverrides($, o => setOverride(o, 'chains', chain.id, 'name', v.trim()), 'Saved the chain name.')} />
            <Input key="edit-chain-when" label="When to use" value={chain.when}
              onSubmit={v => saveOverrides($, o => setOverride(o, 'chains', chain.id, 'when', v.trim()), 'Saved when to use it.')} />
            <Input key="edit-chain-steps" label="Steps (one per line)" value={chain.steps.join('\n')} rows={8}
              onSubmit={v => saveOverrides($, o => setOverride(o, 'chains', chain.id, 'steps', lines(v)), 'Saved the steps.')} />
          </Box>

          <Button key="edit-reset" dimColor onPress={() => saveOverrides($, () => ({}), 'Every default is back.')}>Reset every edit</Button>
          {message !== '' && <Text dimColor>{message}</Text>}
        </Box>
      )
    }

    const editing = await read($, editingOutput)
    const shown = output(S, O)
    const isEdited = shown !== generated(S)

    return (
      <Box flexDirection="column" gap={1}>
        {viewTabs}
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
          {editing
            ? <Input key="edit-output" label={`Edit ${TABS.find(([id]) => id === S.tab)?.[1] ?? ''}`} value={shown} rows={14}
                onSubmit={async v => {
                  await saveOverrides($, o => setOverride(o, 'outputs', S.tab, null, v === generated(S) ? '' : v), 'Saved your edit. Build, Copy and Save use it.')
                  await update($, editingOutput, () => false)
                }} />
            : <Code source={shown} language={S.tab === 'css' ? 'css' : S.tab === 'master' ? 'markdown' : 'text'} />}
          <Box flexDirection="row" flexWrap="wrap" gap={1}>
            <Button key="edit-output-toggle" onPress={() => update($, editingOutput, x => !x)}>{editing ? 'Stop editing' : 'Edit this text'}</Button>
            {isEdited && (
              <Button key="edit-output-reset" dimColor onPress={() => saveOverrides($, o => setOverride(o, 'outputs', S.tab, null, ''), 'Back to the generated text.')}>
                Use the generated text
              </Button>
            )}
            {isEdited && <Text dimColor>Edited by you</Text>}
          </Box>
          <Box flexDirection="row" flexWrap="wrap" gap={1}>
            <Button key="send" variant="primary" onPress={async () => {
              await $.prompt.submit({ text: output({ ...S, tab: 'prompt' }, O), asUser: true })
              await say($, 'Sent the prompt to Claude.')
            }}>Build with Claude</Button>
            <Button key="copy" onPress={async press => {
              const copied = await $.ui.copy({ text: shown, surface: press.surface })
              await say($, copied.isCopied ? 'Copied.' : `Could not copy: ${copied.reason}`)
            }}>Copy</Button>
            <Button key="save" onPress={async () => {
              await $.fs.write('design-system/MASTER.md', output({ ...S, tab: 'master' }, O))
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
