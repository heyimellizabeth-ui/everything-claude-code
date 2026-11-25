export type Mode = 'light' | 'dark'
export type Tab = 'prompt' | 'master' | 'css'
export type View = 'studio' | 'capabilities' | 'chains' | 'preferences'
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
    }
  }
}
