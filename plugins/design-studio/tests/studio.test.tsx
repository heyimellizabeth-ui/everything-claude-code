import { expect, test } from 'claude-code/testing'

import { DEFAULT_STATE, checks, contrast, fixAccent, suggestedAccent, wheel } from '../hooks/engine'

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
