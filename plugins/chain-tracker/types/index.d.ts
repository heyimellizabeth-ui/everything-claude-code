export type ChainId = 'c1' | 'c2' | 'c3' | 'c4' | 'c5'
export type ChainRun = { chain: ChainId; done: string[]; startedAt: string } | null

declare module 'claude-code' {
  interface PluginState {
    'chain-tracker': { run: Shaped<ChainRun>; reaCalls: number }
  }
}
