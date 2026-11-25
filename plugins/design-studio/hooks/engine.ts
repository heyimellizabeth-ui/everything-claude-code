// The Design Studio engine, ported from the React Lab (prototypes/design-studio-lab/engine):
// presets and copy, the colour maths, and the studio outputs. Pure functions, no `$`.
import type { StudioState } from '../types'

export type Palette = { bg: string; surface: string; text: string; muted: string; border: string }
export type Preset = {
  name: string
  blurb: string
  accent: string
  font: string
  radius: number
  bw: number
  shadow: string
  shadowDark: string
  upper: boolean
  light: Palette
  dark: Palette
  never: string[]
}
export type Kind = { id: string; name: string; dials: [number, number, number]; preset: string; audience: string }
export type Font = { id: string; name: string; display: string; body: string; dw: number; gf: string }
export type CheckState = 'ok' | 'warn' | 'bad'
export type Check = { id: string; name: string; state: CheckState; detail: string }

export const KINDS: Kind[] = [
  { id: 'landing', name: 'Landing page', dials: [7, 6, 4], preset: 'soft', audience: 'new visitors' },
  { id: 'portfolio', name: 'Portfolio', dials: [8, 7, 3], preset: 'minimal', audience: 'clients and recruiters' },
  { id: 'editorial', name: 'Editorial or blog', dials: [6, 4, 3], preset: 'minimal', audience: 'readers' },
  { id: 'dashboard', name: 'Dashboard or tool', dials: [3, 2, 7], preset: 'product', audience: 'daily users' },
  { id: 'app', name: 'App screen', dials: [4, 4, 6], preset: 'product', audience: 'signed-in users' },
  { id: 'public', name: 'Public service or health', dials: [3, 2, 5], preset: 'trust', audience: 'everyone, including assistive tech users' },
  { id: 'experimental', name: 'Experimental or agency', dials: [9, 2, 3], preset: 'brutalist', audience: 'design-literate visitors' },
]

export const FONTS: Font[] = [
  { id: 'fraunces', name: 'Fraunces + Manrope', display: '"Fraunces", Georgia, serif', body: '"Manrope", system-ui, sans-serif', dw: 600, gf: 'Fraunces:opsz,wght@9..144,500;9..144,700&family=Manrope:wght@400;600' },
  { id: 'newsreader', name: 'Newsreader + Inter Tight', display: '"Newsreader", Georgia, serif', body: '"Inter Tight", system-ui, sans-serif', dw: 500, gf: 'Newsreader:opsz,wght@6..72,500&family=Inter+Tight:wght@400;600' },
  { id: 'archivo', name: 'Archivo Black + Space Mono', display: '"Archivo Black", Impact, sans-serif', body: '"Space Mono", ui-monospace, monospace', dw: 400, gf: 'Archivo+Black&family=Space+Mono:wght@400;700' },
  { id: 'plex', name: 'IBM Plex Sans', display: '"IBM Plex Sans", system-ui, sans-serif', body: '"IBM Plex Sans", system-ui, sans-serif', dw: 600, gf: 'IBM+Plex+Sans:wght@400;600' },
  { id: 'atkinson', name: 'Atkinson Hyperlegible', display: '"Atkinson Hyperlegible", Verdana, sans-serif', body: '"Atkinson Hyperlegible", Verdana, sans-serif', dw: 700, gf: 'Atkinson+Hyperlegible:wght@400;700' },
]

export const PRESETS: Record<string, Preset> = {
  soft: { name: 'Soft', blurb: 'Agency polish, airy, gentle depth', accent: '#c2577a', font: 'fraunces', radius: 20, bw: 1, shadow: '0 1px 2px rgba(30,20,40,.06), 0 12px 32px -12px rgba(30,20,40,.18)', shadowDark: '0 12px 32px -12px rgba(0,0,0,.6)', upper: false,
    light: { bg: '#fbf9fb', surface: '#ffffff', text: '#231c24', muted: '#6b5f6c', border: '#ece4ec' },
    dark: { bg: '#161216', surface: '#201a21', text: '#f3ecf3', muted: '#b3a5b4', border: '#342b35' },
    never: ['Hard black borders', 'Neon accents', 'Dense data tables'] },
  minimal: { name: 'Minimal', blurb: 'Editorial calm, type contrast, flat', accent: '#2f6f5e', font: 'newsreader', radius: 4, bw: 1, shadow: 'none', shadowDark: 'none', upper: false,
    light: { bg: '#f7f7f5', surface: '#ffffff', text: '#191a19', muted: '#5f625f', border: '#e2e3e0' },
    dark: { bg: '#111211', surface: '#181a18', text: '#ecedeb', muted: '#a0a49f', border: '#2a2d2a' },
    never: ['Gradients', 'Heavy shadows', 'More than one accent'] },
  brutalist: { name: 'Brutalist', blurb: 'Raw grid, extreme type, square', accent: '#ff4f00', font: 'archivo', radius: 0, bw: 2, shadow: '4px 4px 0 var(--color-text)', shadowDark: '4px 4px 0 var(--color-text)', upper: true,
    light: { bg: '#f2f2ee', surface: '#ffffff', text: '#0a0a0a', muted: '#3a3a3a', border: '#0a0a0a' },
    dark: { bg: '#0a0a0a', surface: '#141414', text: '#f2f2ee', muted: '#c4c4c0', border: '#f2f2ee' },
    never: ['Soft shadows', 'Rounded pills', 'Pastel palettes'] },
  product: { name: 'Product tool', blurb: 'Quiet, compact, clear states', accent: '#2563c9', font: 'plex', radius: 8, bw: 1, shadow: '0 1px 2px rgba(15,23,42,.08)', shadowDark: '0 1px 2px rgba(0,0,0,.5)', upper: false,
    light: { bg: '#f6f7f9', surface: '#ffffff', text: '#141922', muted: '#5a6372', border: '#e1e5eb' },
    dark: { bg: '#0f1217', surface: '#171b22', text: '#e7eaef', muted: '#9aa3b2', border: '#283040' },
    never: ['Decorative motion', 'Marketing hero on a tool', 'Cards inside cards'] },
  trust: { name: 'Trust-first', blurb: 'Plain, legible, high contrast', accent: '#1d4f91', font: 'atkinson', radius: 4, bw: 2, shadow: 'none', shadowDark: 'none', upper: false,
    light: { bg: '#ffffff', surface: '#f3f5f8', text: '#0b0c0c', muted: '#3b4046', border: '#505a5f' },
    dark: { bg: '#0b0c0c', surface: '#16191b', text: '#ffffff', muted: '#c9ced2', border: '#8a9499' },
    never: ['Low-contrast grey text', 'Motion that carries meaning', 'Jargon'] },
}

export const DIALS = [
  { id: 'variance', name: 'Variance', lo: 'Symmetric', hi: 'Expressive' },
  { id: 'motion', name: 'Motion', lo: 'Static', hi: 'Cinematic' },
  { id: 'density', name: 'Density', lo: 'Airy', hi: 'Packed' },
] as const

export const DEFAULT_STATE: StudioState = {
  project: 'My project', kind: 'landing', preset: 'soft', dials: [7, 6, 4], accent: '#c2577a', font: 'fraunces', mode: 'light', tab: 'prompt',
}

// ---- colour maths -------------------------------------------------------

type Rgb = [number, number, number]

export const validHex = (v: string) => /^#?[0-9a-f]{6}$/i.test(v.trim())
export const normHex = (v: string) => {
  const t = v.trim().toLowerCase()
  return t.startsWith('#') ? t : '#' + t
}
const toRgb = (hex: string): Rgb => {
  const n = parseInt(hex.replace('#', ''), 16) >>> 0
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const toHex = ([r, g, b]: Rgb) => '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')

const luminance = (hex: string) => {
  const w = [0.2126, 0.7152, 0.0722]
  return toRgb(hex).reduce((acc, v, i) => {
    const c = v / 255
    return acc + (w[i] ?? 0) * (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  }, 0)
}
export const contrast = (a: string, b: string) => {
  const x = luminance(a)
  const y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}
export const mix = (a: string, b: string, t: number) => {
  const ca = toRgb(a)
  const cb = toRgb(b)
  return toHex([0, 1, 2].map(i => Math.round(ca[i]! + (cb[i]! - ca[i]!) * t)) as Rgb)
}
const toHsl = (hex: string): Rgb => {
  const [r, g, b] = toRgb(hex).map(v => v / 255) as Rgb
  const mx = Math.max(r, g, b)
  const mn = Math.min(r, g, b)
  const d = mx - mn
  const l = (mx + mn) / 2
  if (d === 0) return [0, 0, l]
  const s = d / (1 - Math.abs(2 * l - 1))
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [(h * 60 + 360) % 360, s, l]
}
const fromHsl = (h: number, s: number, l: number) => {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const hp = h / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  const m = l - c / 2
  const rgb: Rgb = hp < 1 ? [c, x, 0] : hp < 2 ? [x, c, 0] : hp < 3 ? [0, c, x] : hp < 4 ? [0, x, c] : hp < 5 ? [x, 0, c] : [c, 0, x]
  return toHex(rgb.map(v => Math.round((v + m) * 255)) as Rgb)
}

const accentPasses = (c: string, bg: string) =>
  contrast(c, bg) >= 4.5 && Math.max(contrast('#ffffff', c), contrast('#111111', c)) >= 4.5

// Nearest accent (same hue and saturation, lightness moved as little as possible)
// that works as a link colour on bg and carries a readable button label.
export const fixAccent = (accent: string, bg: string) => {
  const [h, s, l] = toHsl(accent)
  for (let k = 0; k <= 200; k++) {
    for (const sign of [-1, 1]) {
      const l2 = l + sign * k * 0.005
      if (l2 < 0 || l2 > 1) continue
      const c = fromHsl(h, s, l2)
      if (accentPasses(c, bg)) return c
    }
  }
  return accent
}

// One passing accent per hue step: the accessible accent wheel.
export const wheel = (bg: string, steps = 8, sat = 0.65) =>
  Array.from({ length: steps }, (_, i) => fixAccent(fromHsl((i * 360) / steps, sat, 0.5), bg))

// ---- studio outputs -----------------------------------------------------

export const presetOf = (S: StudioState): Preset => PRESETS[S.preset] ?? PRESETS.soft!
export const kindOf = (S: StudioState): Kind => KINDS.find(k => k.id === S.kind) ?? KINDS[0]!
export const fontOf = (S: StudioState): Font => FONTS.find(f => f.id === S.font) ?? FONTS[0]!

const darkAccent = (accent: string, darkBg: string) =>
  contrast(accent, darkBg) < 4.5 ? mix(accent, '#ffffff', 0.35) : accent

export function tokens(S: StudioState) {
  const p = presetOf(S)
  const pal = p[S.mode]
  const accent = S.mode === 'dark' ? darkAccent(S.accent, pal.bg) : S.accent
  const onAccent = contrast('#ffffff', accent) >= contrast('#111111', accent) ? '#ffffff' : '#111111'
  const [, m, d] = S.dials
  return { p, pal, accent, onAccent, space: Math.round(22 - d * 1.4), radius: p.radius, dur: m <= 2 ? 0 : Math.round(60 + m * 40) }
}

const VIBE: Record<string, string> = { soft: 'soft, premium', minimal: 'calm editorial', brutalist: 'raw brutalist', product: 'quiet product-tool', trust: 'plain trust-first' }

export function readText(S: StudioState) {
  const kind = kindOf(S)
  const p = presetOf(S)
  return `Reading this as: ${kind.name.toLowerCase()} for ${kind.audience}, with a ${VIBE[S.preset] ?? p.name} language, leaning toward the ${p.name} preset. Dials ${S.dials.join('/')}.`
}

export function checks(S: StudioState): Check[] {
  const t = tokens(S)
  const kind = kindOf(S)
  const body = contrast(t.pal.text, t.pal.bg)
  const muted = contrast(t.pal.muted, t.pal.bg)
  const btn = contrast(t.onAccent, t.accent)
  const acc = contrast(t.accent, t.pal.bg)
  const [h, s] = toHsl(S.accent)
  const busy = (S.kind === 'dashboard' || S.kind === 'public') && S.dials[1] > 4
  const slop = s > 0.45 && h >= 230 && h <= 290
  const grade = (x: number): CheckState => (x >= 4.5 ? 'ok' : x >= 3 ? 'warn' : 'bad')
  return [
    { id: 'body', name: 'Body text contrast', state: body >= 4.5 ? 'ok' : 'bad', detail: body.toFixed(1) + ':1, needs 4.5:1' },
    { id: 'muted', name: 'Muted text contrast', state: grade(muted), detail: muted.toFixed(1) + ':1, needs 4.5:1' },
    { id: 'button', name: 'Button label on accent', state: grade(btn), detail: btn.toFixed(1) + ':1, needs 4.5:1' },
    { id: 'link', name: 'Accent as link colour', state: grade(acc), detail: acc.toFixed(1) + ':1 on background' },
    { id: 'motion', name: 'Motion fits the job', state: busy ? 'warn' : 'ok', detail: busy ? 'High motion on a ' + kind.name.toLowerCase() : 'Reduced motion respected' },
    { id: 'slop', name: 'AI-slop default', state: slop ? 'warn' : 'ok', detail: slop ? 'Purple-blue accent is the generic default' : 'Accent avoids the stock purple' },
  ]
}

// The accent the review gate suggests, or undefined when the accent already passes.
export function suggestedAccent(S: StudioState) {
  const issue = checks(S).some(c => (c.id === 'button' || c.id === 'link') && c.state !== 'ok')
  if (!issue) return undefined
  const fix = fixAccent(S.accent, presetOf(S).light.bg)
  return fix === S.accent ? undefined : fix
}

const fontName = (stack: string) => (stack.split(',')[0] ?? stack).replace(/"/g, '')

export function cssTokens(S: StudioState) {
  const t = tokens(S)
  const f = fontOf(S)
  const { light: L, dark: D } = t.p
  const sp = t.space
  return [
    ':root {',
    `  --color-bg: ${L.bg};`, `  --color-surface: ${L.surface};`, `  --color-text: ${L.text};`,
    `  --color-text-muted: ${L.muted};`, `  --color-border: ${L.border};`, `  --color-accent: ${S.accent};`,
    `  --font-display: ${f.display};`, `  --font-body: ${f.body};`,
    `  --space-1: ${Math.round(sp / 2)}px;`, `  --space-2: ${sp}px;`, `  --space-3: ${sp * 2}px;`, `  --space-4: ${sp * 3}px;`,
    `  --radius: ${t.radius}px;`, `  --border-width: ${t.p.bw}px;`, `  --shadow: ${t.p.shadow};`,
    `  --duration: ${t.dur}ms;`,
    '}', '',
    '@media (prefers-color-scheme: dark) {', '  :root {',
    `    --color-bg: ${D.bg};`, `    --color-surface: ${D.surface};`, `    --color-text: ${D.text};`,
    `    --color-text-muted: ${D.muted};`, `    --color-border: ${D.border};`, `    --color-accent: ${darkAccent(S.accent, D.bg)};`,
    '  }', '}', '',
    '@media (prefers-reduced-motion: reduce) {', '  :root { --duration: 0ms; }', '}', '',
  ].join('\n')
}

export function masterMd(S: StudioState) {
  const t = tokens(S)
  const f = fontOf(S)
  const p = t.p
  const row = (token: string, l: string, d: string, use: string) => `| ${token} | ${l} | ${d} | ${use} |`
  return [
    `# Design System: ${S.project || 'Project'}`, '',
    '## 1. Design read', readText(S), `Preset: ${p.name}`,
    `Dials: VARIANCE ${S.dials[0]} / MOTION ${S.dials[1]} / DENSITY ${S.dials[2]}`, '',
    '## 2. Colour tokens', '| Token | Light | Dark | Use |', '|---|---|---|---|',
    row('--color-bg', p.light.bg, p.dark.bg, 'page background'),
    row('--color-surface', p.light.surface, p.dark.surface, 'cards, panels'),
    row('--color-text', p.light.text, p.dark.text, 'body text'),
    row('--color-text-muted', p.light.muted, p.dark.muted, 'secondary text'),
    row('--color-accent', S.accent, darkAccent(S.accent, p.dark.bg), 'primary actions'),
    row('--color-border', p.light.border, p.dark.border, 'dividers'), '',
    '## 3. Typography',
    `Display: ${fontName(f.display)} (weight ${f.dw}${p.upper ? ', uppercase' : ''})`,
    `Body: ${fontName(f.body)}`,
    `Google Fonts: https://fonts.googleapis.com/css2?family=${f.gf}&display=swap`, '',
    '## 4. Spacing, radius, shadow',
    `Spacing scale: ${[Math.round(t.space / 2), t.space, t.space * 2, t.space * 3].join(' / ')}px`,
    `Radius: ${t.radius}px`, `Border: ${p.bw}px`, `Shadow: ${p.shadow === 'none' ? 'none' : 'one level, see tokens'}`, '',
    '## 5. Components',
    S.kind === 'dashboard' || S.kind === 'app'
      ? 'Astryx (React) via astryx-components, theme matched to these tokens.'
      : 'Native HTML and CSS variables unless the project already has a component library.', '',
    '## 6. Motion',
    `Duration: ${t.dur}ms${t.dur === 0 ? ' (static)' : ''}. Animate state changes only. Always respect prefers-reduced-motion.`, '',
    '## 7. Never do', ...p.never.map(x => '- ' + x), '- Purple-to-blue gradient defaults', '- Cards inside cards', '',
  ].join('\n')
}

export function promptText(S: StudioState) {
  const p = presetOf(S)
  const f = fontOf(S)
  return [
    `Use the unified-design-system skill for ${S.project || 'this project'}.`, '',
    readText(S), '',
    `Preset: ${p.name}`, `Accent: ${S.accent}`, `Fonts: ${f.name}`,
    `Dials: VARIANCE ${S.dials[0]} / MOTION ${S.dials[1]} / DENSITY ${S.dials[2]}`, '',
    'If design-system/MASTER.md does not exist yet, create it from these choices before building. Run the review gate before calling it done. Log what I like or reject to design-system/PREFERENCES.md so the next build remembers it.',
  ].join('\n')
}

export function output(S: StudioState) {
  if (S.tab === 'css') return cssTokens(S)
  if (S.tab === 'master') return masterMd(S)
  return promptText(S)
}
