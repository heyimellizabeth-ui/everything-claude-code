'use strict';
// JavaScript colour engine. rust-engine/src/lib.rs implements the same functions
// with the same maths, so the two can be swapped and compared in the studio.

function hexToInt(hex) {
  let h = String(hex).replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  return parseInt(h, 16) >>> 0;
}
function intToHex(n) { return '#' + (n >>> 0).toString(16).padStart(6, '0'); }
function channels(n) { return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }

function luminance(n) {
  const w = [0.2126, 0.7152, 0.0722];
  return channels(n).reduce((acc, v, i) => {
    const c = v / 255;
    return acc + w[i] * (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  }, 0);
}
function contrastInt(a, b) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
function mixInt(a, b, t) {
  const ca = channels(a), cb = channels(b);
  const out = ca.map((v, i) => Math.round(v + (cb[i] - v) * t));
  return ((out[0] << 16) | (out[1] << 8) | out[2]) >>> 0;
}
function toHsl(n) {
  const [r, g, b] = channels(n).map(v => v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h;
  if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
}
function fromHsl(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s, hp = h / 60, x = c * (1 - Math.abs((hp % 2) - 1)), m = l - c / 2;
  let rgb;
  if (hp < 1) rgb = [c, x, 0]; else if (hp < 2) rgb = [x, c, 0]; else if (hp < 3) rgb = [0, c, x];
  else if (hp < 4) rgb = [0, x, c]; else if (hp < 5) rgb = [x, 0, c]; else rgb = [c, 0, x];
  const [r, g, b] = rgb.map(v => Math.round((v + m) * 255));
  return ((r << 16) | (g << 8) | b) >>> 0;
}

const WHITE = 0xffffff, INK = 0x111111;
function accentPasses(c, bg) {
  return contrastInt(c, bg) >= 4.5 && Math.max(contrastInt(WHITE, c), contrastInt(INK, c)) >= 4.5;
}
// Nearest accent (same hue and saturation, lightness moved as little as possible)
// that works as a link colour on bg and carries a readable button label.
function fixAccentInt(accent, bg) {
  const [h, s, l] = toHsl(accent);
  for (let k = 0; k <= 200; k++) {
    for (const sign of [-1, 1]) {
      const l2 = l + sign * k * 0.005;
      if (l2 < 0 || l2 > 1) continue;
      const c = fromHsl(h, s, l2);
      if (accentPasses(c, bg)) return c;
    }
  }
  return accent;
}
// One passing accent per hue step: the "accessible accent wheel".
function wheelInt(bg, steps, sat) {
  const out = new Array(steps);
  for (let i = 0; i < steps; i++) out[i] = fixAccentInt(fromHsl((i * 360) / steps, sat, 0.5), bg);
  return out;
}

const jsEngine = {
  name: 'JavaScript',
  contrast: (a, b) => contrastInt(hexToInt(a), hexToInt(b)),
  mix: (a, b, t) => intToHex(mixInt(hexToInt(a), hexToInt(b), t)),
  fixAccent: (a, bg) => intToHex(fixAccentInt(hexToInt(a), hexToInt(bg))),
  wheel: (bg, steps, sat) => wheelInt(hexToInt(bg), steps, sat).map(intToHex),
  wheelChecksum: (bg, steps, sat) => wheelInt(hexToInt(bg), steps, sat).reduce((a, v) => (a + v) >>> 0, 0)
};

function hue(hex) { const [h, s] = toHsl(hexToInt(hex)); return { h, s }; }
function validHex(v) { return /^#?[0-9a-f]{6}$/i.test(v); }

module.exports = { jsEngine, hexToInt, intToHex, hue, validHex };
