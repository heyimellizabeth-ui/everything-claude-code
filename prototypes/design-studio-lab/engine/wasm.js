'use strict';
// Wraps the compiled Rust engine so it has the same shape as jsEngine.
const { hexToInt, intToHex } = require('./color');

async function loadWasmEngine(bytes) {
  const { instance } = await WebAssembly.instantiate(bytes, {});
  const x = instance.exports;
  return {
    name: 'Rust (WASM)',
    contrast: (a, b) => x.contrast(hexToInt(a), hexToInt(b)),
    mix: (a, b, t) => intToHex(x.mix(hexToInt(a), hexToInt(b), t)),
    fixAccent: (a, bg) => intToHex(x.fix_accent(hexToInt(a), hexToInt(bg))),
    wheel: (bg, steps, sat) => {
      const ptr = x.wheel(hexToInt(bg), steps, sat);
      return Array.from(new Uint32Array(x.memory.buffer, ptr, steps), intToHex);
    },
    wheelChecksum: (bg, steps, sat) => x.wheel_checksum(hexToInt(bg), steps, sat) >>> 0
  };
}

module.exports = { loadWasmEngine };
