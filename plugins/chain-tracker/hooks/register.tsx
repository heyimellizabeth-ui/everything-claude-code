import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { ChainId, ChainRun } from '../types'

const PANE = 'chain-tracker'
const TITLE = 'Chain progress'

// Steps of each web chain, in order, from ECC's skills/c1/SKILL.md to skills/c5/SKILL.md.
export const CHAINS: Record<ChainId, { name: string; steps: string[] }> = {
  c1: { name: 'New site from scratch', steps: ['prp-prd', 'prp-plan', 'chelp-advisor', 'update-codemaps', 'hallmark', 'gan-design', 'multi-frontend', 'quality-gate', 'design-gate', 'santa-loop'] },
  c2: { name: 'Add a component or page', steps: ['plan', 'chelp-advisor', 'feature-dev', 'hallmark', 'gan-design', 'code-review', 'test-coverage', 'design-gate', 'checkpoint'] },
  c3: { name: 'Design polish sprint', steps: ['model-route', 'hallmark', 'gan-build', 'quality-gate', 'design-gate', 'chelp-advisor', 'code-review'] },
  c4: { name: 'Production ship', steps: ['multi-plan', 'multi-execute', 'multi-frontend', 'security-scan', 'test-coverage', 'design-gate', 'chelp-advisor', 'santa-loop', 'prp-pr'] },
  c5: { name: 'Post-launch cleanup', steps: ['refactor-clean', 'update-codemaps', 'update-docs', 'hallmark', 'quality-gate', 'design-gate', 'chelp-advisor', 'checkpoint'] },
}
const isChain = (name: string): name is ChainId => name in CHAINS

const run = atom({ plugin: 'chain-tracker', key: 'run' } as const, null as ChainRun, { shape: 'run-1' })
const reaCalls = atom({ plugin: 'chain-tracker', key: 'reaCalls' } as const, 0)

// Skill and command names arrive as "ecc:hallmark" or "hallmark".
const bare = (name: string) => name.replace(/^\//, '').split(':').pop() ?? name

export const nextStep = (r: ChainRun) =>
  r === null ? undefined : CHAINS[r.chain].steps.find(s => !r.done.includes(s))

export const statusLine = (r: ChainRun, rea: number) => {
  const parts: string[] = []
  if (r !== null) {
    const steps = CHAINS[r.chain].steps
    const left = nextStep(r)
    parts.push(`${r.chain} ${r.done.length}/${steps.length}` + (left ? ` · next /${left}` : ' · done'))
  }
  if (rea > 0) parts.push(`REA ${rea} calls · cite evidence, list unknowns`)
  return parts.length ? parts.join('  |  ') : undefined
}

const storeKey = (cwd: string) => `run:${cwd}`

async function save($: EngineInterface, value: ChainRun) {
  const cwd = await $.session.cwd()
  if (value === null) await $.store.delete(storeKey(cwd))
  else await $.store.set(storeKey(cwd), value)
}

async function refresh($: EngineInterface) {
  $.ui.status(statusLine(await read($, run), await read($, reaCalls)))
}

async function markDone($: EngineInterface, name: string) {
  const step = bare(name)
  const current = await read($, run)
  if (current === null || !CHAINS[current.chain].steps.includes(step) || current.done.includes(step)) return
  const value = { ...current, done: [...current.done, step] }
  await update($, run, () => value)
  await save($, value)
  await refresh($)
}

async function start($: EngineInterface, chain: ChainId) {
  const value: ChainRun = { chain, done: [], startedAt: new Date().toISOString() }
  await update($, run, () => value)
  await save($, value)
  await refresh($)
}

async function reset($: EngineInterface) {
  await update($, run, () => null)
  await save($, null)
  await refresh($)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'chain', description: 'Show web chain progress; /chain c1..c5 starts one, /chain reset clears it' })
    const stored = (await $.store.get(storeKey(e.cwd))) as ChainRun | undefined
    if (stored && isChain(stored.chain)) await update($, run, () => stored)
    await refresh($)
    return next(e)
  })

  on('command.run', { command: 'chain' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (isChain(arg)) await start($, arg)
    if (arg === 'reset') await reset($)
    await $.ui.open({ id: PANE, title: TITLE })
    const r = await read($, run)
    return { text: r === null ? 'No chain running here. Start one with /c1 to /c5.' : `${r.chain}: ${r.done.length}/${CHAINS[r.chain].steps.length} steps done, next /${nextStep(r) ?? 'nothing'}.` }
  })

  // Typing /c1 starts a chain; typing a step's command ticks it off.
  on('prompt.submit', async ($, e, next) => {
    const name = e.command?.name
    if (name !== undefined) {
      if (isChain(bare(name))) await start($, bare(name) as ChainId)
      else await markDone($, name)
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  // Claude running a step as a skill ticks it off too, and REA calls are counted.
  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    if (e.tool === 'Skill' && ran.deny === undefined) {
      const name = bare(e.skill)
      if (isChain(name)) await start($, name)
      else await markDone($, name)
    }
    if (e.tool.startsWith('mcp__rea__')) {
      await update($, reaCalls, n => (n ?? 0) + 1)
      await refresh($)
    }
    return ran
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const r = await read($, run)
    const rea = await read($, reaCalls)
    const left = nextStep(r)

    return (
      <Box flexDirection="column" gap={1}>
        {r === null ? (
          <Text dimColor>No chain running here. Type /c1 to /c5 to start one, or /chelp to pick.</Text>
        ) : (
          <Box flexDirection="column">
            <Text bold>{r.chain.toUpperCase()} · {CHAINS[r.chain].name}</Text>
            <Text dimColor>{r.done.length} of {CHAINS[r.chain].steps.length} steps done</Text>
            {CHAINS[r.chain].steps.map(step => (
              <Text dimColor={r.done.includes(step)} bold={step === left}>
                {r.done.includes(step) ? '✓' : step === left ? '→' : '·'} /{step}
              </Text>
            ))}
          </Box>
        )}
        {rea > 0 && (
          <Text>REA: {rea} calls this session. Cite Evidence IDs and list open unknowns before calling it done.</Text>
        )}
        {r !== null && (
          <Box flexDirection="row" gap={1}>
            {left !== undefined && <Button key="mark-done" onPress={() => markDone($, left)}>Mark /{left} done</Button>}
            <Button key="reset" onPress={() => reset($)}>Reset</Button>
          </Box>
        )}
      </Box>
    )
  })
}
