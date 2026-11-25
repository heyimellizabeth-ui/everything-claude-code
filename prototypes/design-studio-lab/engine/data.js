'use strict';
// Content and presets, copied unchanged from the live Unified Design Studio artifact.

const KINDS = [
  { id: 'landing', name: 'Landing page', dials: [7, 6, 4], preset: 'soft', audience: 'new visitors' },
  { id: 'portfolio', name: 'Portfolio', dials: [8, 7, 3], preset: 'minimal', audience: 'clients and recruiters' },
  { id: 'editorial', name: 'Editorial or blog', dials: [6, 4, 3], preset: 'minimal', audience: 'readers' },
  { id: 'dashboard', name: 'Dashboard or tool', dials: [3, 2, 7], preset: 'product', audience: 'daily users' },
  { id: 'app', name: 'App screen', dials: [4, 4, 6], preset: 'product', audience: 'signed-in users' },
  { id: 'public', name: 'Public service or health', dials: [3, 2, 5], preset: 'trust', audience: 'everyone, including assistive tech users' },
  { id: 'experimental', name: 'Experimental or agency', dials: [9, 8, 3], preset: 'brutalist', audience: 'design-literate visitors' }
];

const FONTS = [
  { id: 'fraunces', name: 'Fraunces + Manrope', display: '"Fraunces", Georgia, serif', body: '"Manrope", system-ui, sans-serif', dw: 600, gf: 'Fraunces:opsz,wght@9..144,500;9..144,700&family=Manrope:wght@400;600' },
  { id: 'newsreader', name: 'Newsreader + Inter Tight', display: '"Newsreader", Georgia, serif', body: '"Inter Tight", system-ui, sans-serif', dw: 500, gf: 'Newsreader:opsz,wght@6..72,500&family=Inter+Tight:wght@400;600' },
  { id: 'archivo', name: 'Archivo Black + Space Mono', display: '"Archivo Black", Impact, sans-serif', body: '"Space Mono", ui-monospace, monospace', dw: 400, gf: 'Archivo+Black&family=Space+Mono:wght@400;700' },
  { id: 'plex', name: 'IBM Plex Sans', display: '"IBM Plex Sans", system-ui, sans-serif', body: '"IBM Plex Sans", system-ui, sans-serif', dw: 600, gf: 'IBM+Plex+Sans:wght@400;600' },
  { id: 'atkinson', name: 'Atkinson Hyperlegible', display: '"Atkinson Hyperlegible", Verdana, sans-serif', body: '"Atkinson Hyperlegible", Verdana, sans-serif', dw: 700, gf: 'Atkinson+Hyperlegible:wght@400;700' }
];

const PRESETS = {
  soft: { name: 'Soft', blurb: 'Agency polish, airy, gentle depth', accent: '#c2577a', font: 'fraunces', radius: 20, bw: 1, shadow: '0 1px 2px rgba(30,20,40,.06), 0 12px 32px -12px rgba(30,20,40,.18)', shadowDark: '0 12px 32px -12px rgba(0,0,0,.6)', track: '-0.02em', upper: false,
    light: { bg: '#fbf9fb', surface: '#ffffff', text: '#231c24', muted: '#6b5f6c', border: '#ece4ec' },
    dark: { bg: '#161216', surface: '#201a21', text: '#f3ecf3', muted: '#b3a5b4', border: '#342b35' },
    never: ['Hard black borders', 'Neon accents', 'Dense data tables'] },
  minimal: { name: 'Minimal', blurb: 'Editorial calm, type contrast, flat', accent: '#2f6f5e', font: 'newsreader', radius: 4, bw: 1, shadow: 'none', shadowDark: 'none', track: '-0.01em', upper: false,
    light: { bg: '#f7f7f5', surface: '#ffffff', text: '#191a19', muted: '#5f625f', border: '#e2e3e0' },
    dark: { bg: '#111211', surface: '#181a18', text: '#ecedeb', muted: '#a0a49f', border: '#2a2d2a' },
    never: ['Gradients', 'Heavy shadows', 'More than one accent'] },
  brutalist: { name: 'Brutalist', blurb: 'Raw grid, extreme type, square', accent: '#ff4f00', font: 'archivo', radius: 0, bw: 2, shadow: '4px 4px 0 var(--p-text)', shadowDark: '4px 4px 0 var(--p-text)', track: '-0.03em', upper: true,
    light: { bg: '#f2f2ee', surface: '#ffffff', text: '#0a0a0a', muted: '#3a3a3a', border: '#0a0a0a' },
    dark: { bg: '#0a0a0a', surface: '#141414', text: '#f2f2ee', muted: '#c4c4c0', border: '#f2f2ee' },
    never: ['Soft shadows', 'Rounded pills', 'Pastel palettes'] },
  product: { name: 'Product tool', blurb: 'Quiet, compact, clear states', accent: '#2563c9', font: 'plex', radius: 8, bw: 1, shadow: '0 1px 2px rgba(15,23,42,.08)', shadowDark: '0 1px 2px rgba(0,0,0,.5)', track: '-0.01em', upper: false,
    light: { bg: '#f6f7f9', surface: '#ffffff', text: '#141922', muted: '#5a6372', border: '#e1e5eb' },
    dark: { bg: '#0f1217', surface: '#171b22', text: '#e7eaef', muted: '#9aa3b2', border: '#283040' },
    never: ['Decorative motion', 'Marketing hero on a tool', 'Cards inside cards'] },
  trust: { name: 'Trust-first', blurb: 'Plain, legible, high contrast', accent: '#1d4f91', font: 'atkinson', radius: 4, bw: 2, shadow: 'none', shadowDark: 'none', track: '0', upper: false,
    light: { bg: '#ffffff', surface: '#f3f5f8', text: '#0b0c0c', muted: '#3b4046', border: '#505a5f' },
    dark: { bg: '#0b0c0c', surface: '#16191b', text: '#ffffff', muted: '#c9ced2', border: '#8a9499' },
    never: ['Low-contrast grey text', 'Motion that carries meaning', 'Jargon'] }
};

const DIALS = [
  { id: 'variance', name: 'Variance', lo: 'Symmetric', hi: 'Expressive' },
  { id: 'motion', name: 'Motion', lo: 'Static', hi: 'Cinematic' },
  { id: 'density', name: 'Density', lo: 'Airy', hi: 'Packed' }
];

const COPY = {
  landing: ['Socks that keep up with you', 'Seamless knit, recycled yarn, and a fit that stays put from the morning run to the late train.', '4.8', 'average rating from 2,300 reviews', [['Fit', 'Heel lock', 'Ribbed arch support that stops slipping.'], ['Material', '78% recycled', 'Post-consumer nylon and organic cotton.'], ['Care', 'Machine wash', 'Holds its shape after 100 washes.']]],
  portfolio: ['Interfaces with a point of view', 'Independent product designer working with small teams on tools people open every day.', '12', 'products shipped since 2019', [['Case study', 'Studio booking', 'Cut no-shows by a third with one reminder flow.'], ['Case study', 'Club membership', 'Moved 400 members off spreadsheets.'], ['Writing', 'On density', 'Why tools should feel busy, not cluttered.']]],
  editorial: ['The quiet return of the serif', 'A short history of why reading on screens started to look like print again.', '9 min', 'read', [['Essay', 'Type on screens', 'From bitmap fonts to variable axes.'], ['Interview', 'A type designer', 'On drawing for small sizes.'], ['Notes', 'Further reading', 'Five books worth your time.']]],
  dashboard: ['Orders this week', 'Live view of orders, returns and stock across both warehouses.', '1,284', 'orders, up 6.2% on last week', [['Returns', '3.1%', 'Below the 4% target.'], ['Low stock', '7 items', 'Reorder before Friday.'], ['Fulfilment', '1.8 days', 'Average dispatch time.']]],
  app: ['Good morning, Lizzy', 'You have three bookings today and one message waiting.', '3', 'bookings today', [['Next', '10:30 Studio A', 'Portrait session, 90 minutes.'], ['Inbox', '1 new message', 'From the club committee.'], ['Tasks', '2 open', 'Invoice and gear check.']]],
  public: ['Book a vaccination appointment', 'It takes about 5 minutes. You will need your date of birth and postcode.', '5 min', 'to complete', [['Step 1', 'Check eligibility', 'Answer three questions.'], ['Step 2', 'Choose a location', 'Search by postcode.'], ['Step 3', 'Pick a time', 'Get a confirmation by text.']]],
  experimental: ['MAKE NOISE, SHIP LOUD', 'A studio for brands that would rather be remembered than liked.', '47', 'launches, zero templates', [['Index', '001 Identity', 'Systems that break on purpose.'], ['Index', '002 Motion', 'Type that moves like a machine.'], ['Index', '003 Sound', 'Brand audio and sonic logos.']]]
};

module.exports = { KINDS, FONTS, PRESETS, DIALS, COPY };
