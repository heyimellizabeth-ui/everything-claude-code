export type Mode = 'light' | 'dark'
export type Tab = 'prompt' | 'master' | 'css'
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
    'design-studio': { studio: Shaped<StudioState>; isOpen: boolean; note: string }
  }
}
