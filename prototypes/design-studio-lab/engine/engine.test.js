'use strict';
// Run: node prototypes/design-studio-lab/engine/engine.test.js
const test = require('node:test');
const assert = require('node:assert');
const { jsEngine } = require('./color');
const studio = require('./studio');
const { PRESETS, KINDS } = require('./data');


test('contrast matches WCAG reference points', () => {
  assert.ok(Math.abs(jsEngine.contrast('#000000', '#ffffff') - 21) < 1e-9);
  assert.strictEqual(jsEngine.contrast('#777777', '#777777'), 1);
});

test('fixAccent returns a passing accent and leaves good ones alone', () => {
  const fixed = jsEngine.fixAccent('#ffd400', '#fbf9fb');
  assert.ok(jsEngine.contrast(fixed, '#fbf9fb') >= 4.5);
  assert.strictEqual(jsEngine.fixAccent('#1d4f91', '#ffffff'), '#1d4f91');
});

test('studio checks match the live artifact for the default state', () => {
  const S = studio.DEFAULT_STATE, t = studio.tokens(jsEngine, S);
  const states = studio.checks(jsEngine, S, t).map(c => c.state);
  // The live studio's default Soft accent #c2577a sits just under 4.5:1 for the label and as a link.
  assert.deepStrictEqual(states, ['ok', 'ok', 'warn', 'warn', 'ok', 'ok']);
  const fixed = Object.assign({}, S, { accent: jsEngine.fixAccent(S.accent, PRESETS.soft.light.bg) });
  assert.strictEqual(fixed.accent, '#bd4a70');
  assert.ok(studio.checks(jsEngine, fixed, studio.tokens(jsEngine, fixed)).every(c => c.state === 'ok'));
  assert.match(studio.output(jsEngine, Object.assign({}, S, { tab: 'master' })), /^# Design System: Sockwave/);
});

test('every kind and preset renders all three outputs', () => {
  for (const k of KINDS) for (const p of Object.keys(PRESETS)) for (const tab of ['prompt', 'master', 'css']) {
    const S = Object.assign({}, studio.DEFAULT_STATE, { kind: k.id, preset: p, tab, dials: k.dials });
    assert.ok(studio.output(jsEngine, S).length > 100);
  }
});

