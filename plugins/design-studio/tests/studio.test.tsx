import { expect, test } from 'claude-code/testing'

import {
  DEFAULT_STATE, PRESETS, addPreference, applyOverrides, capabilityList, readText, setOverride, checks, contrast, fixAccent, parsePreferences, promotionHint, suggestedAccent, wheel,
} from '../hooks/engine'

const PANE = {
  plugin: 'design-studio',
  component: 'Pane',
  requestId: 'design-studio',
  props: {
    title: 'Design Studio',
    isFocused: false,
    bodyColumns: 80,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 60 },
    view: {},
  },
} as const

const BAND = {
  plugin: 'design-studio',
  component: 'AbovePrompt',
  props: { hasSurvey: false, isCollapsed: false, isWorking: false, maxRows: 10, bodyColumns: 80, scroll: { offset: 0, bodyRows: 10 }, view: {} },
} as const

test('the engine keeps the React Lab findings', () => {
  // The Soft default fails the gate as a link, and fix-accent finds the lab's #bd4a70.
  const gate = checks(DEFAULT_STATE)
  expect(gate.find(c => c.id === 'link')?.state).toBe('warn')
  expect(fixAccent('#c2577a', '#fbf9fb')).toBe('#bd4a70')
  expect(suggestedAccent(DEFAULT_STATE)).toBe('#bd4a70')
  for (const c of wheel('#fbf9fb')) expect(contrast(c, '#fbf9fb')).toBeGreaterThanOrEqual(4.5)
})

test('the band shows a button that opens the studio', async ($, on) => {
  on('ui.open', () => ({ value: { isPlaced: true } }))
  for (const surface of ['terminal', 'desktop'] as const) {
    const band = await $.ui.mount({ ...BAND, surface })
    expect((await band.find({ key: 'open-studio' }))?.text).toMatch(/Design Studio/)
    await band.unmount()
  }
  const band = await $.ui.mount({ ...BAND, surface: 'desktop' })
  await band.press({ key: 'open-studio' })
  await band.unmount()
  const after = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect(await after.find({ key: 'open-studio' })).toBeUndefined()
  await after.unmount()
})

test('fixing the accent turns the gate green and is stored for the next session', async ($, on) => {
  const stored: Record<string, unknown> = {}
  on('store.set', (_, e) => { stored[e.key] = e.value; return { value: undefined } })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect(await ui.find({ type: 'Text', text: /Reading this as/ })).toBeDefined()
    expect(await ui.find({ key: 'fix-accent' })).toBeDefined()
    await ui.unmount()
  }

  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.press({ key: 'fix-accent' })
  await ui.unmount()

  const again = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await again.find({ key: 'fix-accent' })).toBeUndefined()
  expect((await again.find({ type: 'Text', text: /of 6 pass/ }))?.text).toBe('6 of 6 pass')
  await again.unmount()
  expect((stored.studio as { accent: string }).accent).toBe('#bd4a70')
})

test('Build with Claude sends the prompt as the person', async ($, on) => {
  const sent: string[] = []
  on('prompt.submit', (_, e) => { sent.push(e.text); return { text: e.text } })
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.press({ key: 'send' })
  await ui.unmount()
  expect(sent[0]).toMatch(/^Use the unified-design-system skill/)
})

test('dials stay between 1 and 10', async ($, on) => {
  on('store.set', () => ({ value: undefined }))
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  for (let i = 0; i < 6; i++) await ui.press({ key: 'dial-variance-up' })
  expect((await ui.find({ type: 'Text', text: /^Variance/ }))?.text).toBe('Variance 10')
  await ui.unmount()
})

test('preferences parse, append above the Promoted section, and flag settled rules', () => {
  const md = [
    '| Date | Rule | What it means | User\'s words |', '|---|---|---|---|',
    '| 2026-11-25 | always | keep the purple accent | "keep the purple accent" |', '',
    '## Promoted to MASTER.md', '', '| Date | Rule | What it means | User\'s words |', '|---|---|---|---|', '',
  ].join('\n')
  expect(parsePreferences(md).length).toBe(1)
  const added = addPreference(md, { date: '2026-11-26', rule: 'never', means: 'pill | buttons', words: 'no pills' })
  const rows = parsePreferences(added)
  expect(rows.map(r => r.rule)).toEqual(['always', 'never'])
  expect(rows[1]?.means).toBe('pill / buttons')
  expect(added.indexOf('2026-11-26') < added.indexOf('## Promoted')).toBe(true)
  expect(parsePreferences(addPreference('', { date: '2026-11-26', rule: 'prefer', means: 'x', words: 'y' })).length).toBe(1)
  const same = { date: '2026-11-26', rule: 'never' as const, means: 'pills', words: '' }
  expect(promotionHint([same, same])).toBeUndefined()
  expect(promotionHint([same, same, same])).toMatch(/MASTER\.md/)
})

test('capabilities put design first and filter by search', () => {
  const all = [
    { name: 'tdd', description: 'Test-driven development', source: 'plugin' },
    { name: 'unified-design-system', description: 'One entry point for UI work', source: 'plugin' },
    { name: 'c3', description: 'Design iteration chain', source: 'plugin' },
  ]
  expect(capabilityList(all, '', false).map(c => c.name)).toEqual(['c3', 'unified-design-system', 'tdd'])
  expect(capabilityList(all, '', true).map(c => c.name)).toEqual(['c3', 'unified-design-system'])
  expect(capabilityList(all, 'test', false).map(c => c.name)).toEqual(['tdd'])
})

test('the Chains and Capabilities views draw and a chain runs as the person', async ($, on) => {
  const sent: string[] = []
  on('prompt.submit', (_, e) => { sent.push(e.text); return { text: e.text } })
  on('command.list', () => ({ value: [
    { name: 'unified-design-system', description: 'Design front door', source: 'plugin' },
    { name: 'tdd', description: 'Tests first', source: 'plugin' },
  ] }))
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.press({ key: 'view-chains' })
  await ui.press({ key: 'chain-c3' })
  expect(sent[0]).toMatch(/^Run the \/c3 chain/)
  await ui.press({ key: 'view-capabilities' })
  expect(await ui.find({ type: 'Text', text: /2 commands and skills in this session, 1 of them design/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: '/unified-design-system' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: '/tdd' })).toBeUndefined()
  await ui.unmount()
})

test('the Preferences view lists the log and adds a row to the file', async ($, on) => {
  let file = '| Date | Rule | What it means | User\'s words |\n|---|---|---|---|\n| 2026-11-25 | always | keep the purple accent | "keep it" |\n'
  on('fs.exists', () => ({ value: true }))
  on('fs.read', () => ({ value: file }))
  on('fs.write', (_, e) => { file = e.text; return { value: undefined } })
  on('clock.now', () => ({ value: Date.UTC(2026, 10, 26) }))
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.press({ key: 'view-preferences' })
  expect(await ui.find({ type: 'Text', text: 'keep the purple accent' })).toBeDefined()
  await ui.select({ key: 'pref-rule', value: 'never' })
  await ui.input({ key: 'pref-text', text: 'pill-shaped buttons', kind: 'submit' })
  expect(parsePreferences(file).map(r => `${r.rule} ${r.means}`)).toEqual(['always keep the purple accent', 'never pill-shaped buttons'])
  await ui.unmount()
})

test('edits override the defaults and clearing one brings the default back', () => {
  let o = setOverride({}, 'texts', 'read', null, 'Building {kind} for {project}.')
  o = setOverride(o, 'presets', 'soft', 'never', ['Pill buttons'])
  applyOverrides(o)
  expect(readText(DEFAULT_STATE)).toBe('Building landing page for My project.')
  expect(PRESETS.soft?.never).toEqual(['Pill buttons'])
  o = setOverride(setOverride(o, 'texts', 'read', null, ''), 'presets', 'soft', 'never', [])
  expect(o).toEqual({})
  applyOverrides(o)
  expect(readText(DEFAULT_STATE)).toMatch(/^Reading this as: landing page/)
  expect(PRESETS.soft?.never).toEqual(['Hard black borders', 'Neon accents', 'Dense data tables'])
})

test('the Edit view changes the design read, and an edited prompt is what Build sends', async ($, on) => {
  const stored: Record<string, unknown> = {}
  const sent: string[] = []
  on('store.set', (_, e) => { stored[e.key] = e.value; return { value: undefined } })
  on('prompt.submit', (_, e) => { sent.push(e.text); return { text: e.text } })
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.press({ key: 'view-edit' })
  await ui.input({ key: 'edit-text-read', text: 'My own read for {project}.', kind: 'submit' })
  await ui.press({ key: 'view-studio' })
  expect(await ui.find({ type: 'Text', text: 'My own read for My project.' })).toBeDefined()
  await ui.press({ key: 'edit-output-toggle' })
  await ui.input({ key: 'edit-output', text: 'Build me something bold.', kind: 'submit' })
  await ui.press({ key: 'send' })
  expect(sent[0]).toBe('Build me something bold.')
  expect((stored.overrides as { texts: { read: string } }).texts.read).toBe('My own read for {project}.')
  await ui.press({ key: 'edit-output-reset' })
  await ui.press({ key: 'send' })
  expect(sent[1]).toMatch(/^Use the unified-design-system skill/)
  await ui.unmount()
  applyOverrides({})
})
