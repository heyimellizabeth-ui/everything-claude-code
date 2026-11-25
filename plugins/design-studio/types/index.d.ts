export type Mode = 'light' | 'dark'
export type Tab = 'prompt' | 'master' | 'css'
export type View = 'studio' | 'motion' | 'capabilities' | 'chains' | 'preferences' | 'health' | 'edit'
export type TextKey = 'read' | 'promptIntro' | 'promptClose' | 'chainRun'
/** The person's edits to the studio's defaults; anything missing uses the shipped default. */
export type Overrides = {
  texts?: Partial<Record<TextKey, string>>
  presets?: Record<string, { name?: string; blurb?: string; accent?: string; never?: string[] }>
  kinds?: Record<string, { name?: string; audience?: string }>
  chains?: Record<string, { name?: string; when?: string; steps?: string[] }>
  outputs?: Partial<Record<Tab, string>>
}
export type Rule = 'always' | 'never' | 'prefer'
export type StudioState = {
  project: string
  kind: string
  preset: string
  dials: [number, number, number]
  accent: string
  font: string
  mode: Mode
  tab: Tab
}

declare module 'claude-code' {
  interface PluginState {
    'design-studio': {
      studio: Shaped<StudioState>; isOpen: boolean; note: string
      view: View; query: string; designOnly: boolean; prefRule: Rule
      overrides: Overrides; editingOutput: boolean; editChain: string
    }
  }
}
