import { expect, test } from 'claude-code/testing'

const PANE = {
  plugin: 'chain-tracker',
  component: 'Pane',
  requestId: 'chain-tracker',
  props: {
    title: 'Chain progress',
    isFocused: false,
    bodyColumns: 60,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 30 },
    view: {},
  },
} as const

test('typing /c1 starts the chain and a skill run ticks its step', async ($, on) => {
  on('command.register', () => ({ value: { command: 'chain' } }))
  on('store.get', () => ({ value: undefined }))
  on('store.set', () => ({ value: undefined }))
  on('session.cwd', () => ({ value: '/site' }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('prompt.submit', (_, e) => e)
  on('tool.call', () => ({ result: {} }))

  await $.session.start({ cwd: '/site', surface: 'desktop', isInteractive: true })
  await $.prompt.submit({ text: '/c1', command: { name: 'c1', args: '' }, wait: false, origin: { kind: 'composer' } })
  await $.tool.call({ tool: 'Skill', skill: 'ecc:prp-prd' })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect((await ui.find({ type: 'Text', text: /steps done/ }))?.text).toBe('1 of 11 steps done')
    expect((await ui.find({ type: 'Text', text: /→/ }))?.text).toBe('→ /unified-design-system')
    await ui.unmount()
  }
})

test('REA calls are counted', async ($, on) => {
  on('command.register', () => ({ value: { command: 'chain' } }))
  on('store.get', () => ({ value: undefined }))
  on('store.set', () => ({ value: undefined }))
  on('session.cwd', () => ({ value: '/site' }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('tool.call', () => ({ result: {} }))

  await $.session.start({ cwd: '/bin', surface: 'desktop', isInteractive: true })
  await $.tool.call({ tool: 'mcp__rea__list_unknowns' })
  await $.tool.call({ tool: 'mcp__rea__decompile' })

  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /REA/ }))?.text).toMatch(/2 calls/)
  await ui.unmount()
})

test('with nothing running the pane says how to start', async $ => {
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect((await ui.find({ type: 'Text' }))?.text).toMatch(/No chain running/)
  await ui.unmount()
})
