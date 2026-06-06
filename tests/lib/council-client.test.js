'use strict';

/**
 * Tests for scripts/lib/council-client.js
 *
 * Run with: node tests/lib/council-client.test.js
 */

const assert = require('assert');
const http = require('http');

const client = require('../../scripts/lib/council-client');

// ── Test runner ───────────────────────────────────────────────────────────────

function test(name, fn) {
  try {
    const result = fn();
    if (result && typeof result.then === 'function') {
      return result.then(
        () => { console.log(`  ✓ ${name}`); return true; },
        (err) => { console.log(`  ✗ ${name}\n    Error: ${err.message}`); return false; }
      );
    }
    console.log(`  ✓ ${name}`);
    return Promise.resolve(true);
  } catch (err) {
    console.log(`  ✗ ${name}\n    Error: ${err.message}`);
    return Promise.resolve(false);
  }
}

// ── Mock server ───────────────────────────────────────────────────────────────

function createMockServer(responses) {
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const key = `${req.method} ${req.url}`;
      const handler = responses[key] || responses['*'];
      if (handler) {
        const { status, json } = handler(req, body);
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(json));
      } else {
        res.writeHead(404);
        res.end('{}');
      }
    });
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

function closeServer(server) {
  return new Promise(resolve => server.close(resolve));
}

// ── Tests ─────────────────────────────────────────────────────────────────────

async function runTests() {
  console.log('\n=== Testing council-client.js ===\n');
  const results = [];

  // getBaseUrl

  console.log('getBaseUrl:');
  results.push(await test('returns default when env unset', () => {
    const orig = process.env.COUNCIL_BASE_URL;
    delete process.env.COUNCIL_BASE_URL;
    const url = client.getBaseUrl();
    if (orig !== undefined) process.env.COUNCIL_BASE_URL = orig;
    assert.strictEqual(url, 'http://localhost:8001');
  }));

  results.push(await test('respects COUNCIL_BASE_URL env var', () => {
    const orig = process.env.COUNCIL_BASE_URL;
    process.env.COUNCIL_BASE_URL = 'http://example.com:9000/';
    const url = client.getBaseUrl();
    process.env.COUNCIL_BASE_URL = orig || '';
    if (!orig) delete process.env.COUNCIL_BASE_URL;
    assert.strictEqual(url, 'http://example.com:9000');
  }));

  // isCouncilRunning

  console.log('\nisCouncilRunning:');
  results.push(await test('returns true when server responds 200', async () => {
    const { server, baseUrl } = await createMockServer({
      'GET /': () => ({ status: 200, json: { status: 'ok' } }),
    });
    const running = await client.isCouncilRunning(baseUrl);
    await closeServer(server);
    assert.strictEqual(running, true);
  }));

  results.push(await test('returns false when connection refused', async () => {
    const running = await client.isCouncilRunning('http://127.0.0.1:1');
    assert.strictEqual(running, false);
  }));

  results.push(await test('returns false on timeout (very short port 2)', async () => {
    const running = await client.isCouncilRunning('http://192.0.2.1:9999');
    assert.strictEqual(running, false);
  }));

  // createConversation

  console.log('\ncreateConversation:');
  results.push(await test('returns body with id on 200', async () => {
    const { server, baseUrl } = await createMockServer({
      'POST /api/conversations': () => ({ status: 200, json: { id: 'test-conv-123' } }),
    });
    const conv = await client.createConversation(baseUrl);
    await closeServer(server);
    assert.strictEqual(conv.id, 'test-conv-123');
  }));

  results.push(await test('throws on non-200 response', async () => {
    const { server, baseUrl } = await createMockServer({
      'POST /api/conversations': () => ({ status: 500, json: { error: 'server error' } }),
    });
    let threw = false;
    try {
      await client.createConversation(baseUrl);
    } catch {
      threw = true;
    }
    await closeServer(server);
    assert.strictEqual(threw, true);
  }));

  // sendMessage

  console.log('\nsendMessage:');
  results.push(await test('returns stage1/stage2/stage3 structure on 200', async () => {
    const mockResponse = {
      stage1: [{ model: 'gpt-5.1', response: 'review text' }],
      stage2: [{ model: 'gpt-5.1', response: 'ranking text', parsed_ranking: [] }],
      stage3: { model: 'gemini', response: 'final answer' },
      metadata: { label_to_model: {}, aggregate_rankings: [] },
    };
    const { server, baseUrl } = await createMockServer({
      'POST /api/conversations/conv-1/message': () => ({ status: 200, json: mockResponse }),
    });
    const result = await client.sendMessage(baseUrl, 'conv-1', 'hello');
    await closeServer(server);
    assert.ok(Array.isArray(result.stage1));
    assert.ok(Array.isArray(result.stage2));
    assert.strictEqual(typeof result.stage3, 'object');
  }));

  results.push(await test('throws on non-200 response', async () => {
    const { server, baseUrl } = await createMockServer({
      'POST /api/conversations/conv-x/message': () => ({ status: 503, json: {} }),
    });
    let threw = false;
    try {
      await client.sendMessage(baseUrl, 'conv-x', 'test');
    } catch {
      threw = true;
    }
    await closeServer(server);
    assert.strictEqual(threw, true);
  }));

  // runKarpathyReview

  console.log('\nrunKarpathyReview:');
  results.push(await test('creates conversation then sends Karpathy-prefixed message', async () => {
    let capturedContent = null;
    const { server, baseUrl } = await createMockServer({
      'POST /api/conversations': () => ({ status: 200, json: { id: 'karp-conv' } }),
      'POST /api/conversations/karp-conv/message': (req, body) => {
        capturedContent = JSON.parse(body).content;
        return {
          status: 200,
          json: {
            stage1: [], stage2: [], stage3: { model: 'm', response: 'r' }, metadata: {},
          },
        };
      },
    });
    await client.runKarpathyReview('diff --git a/foo.js', baseUrl);
    await closeServer(server);
    assert.ok(capturedContent.includes('Think Before Coding'), 'prompt includes principle 1');
    assert.ok(capturedContent.includes('Simplicity First'), 'prompt includes principle 2');
    assert.ok(capturedContent.includes('Surgical Changes'), 'prompt includes principle 3');
    assert.ok(capturedContent.includes('Goal-Driven Execution'), 'prompt includes principle 4');
    assert.ok(capturedContent.includes('diff --git a/foo.js'), 'prompt includes the diff');
  }));

  // Summary

  const passed = results.filter(Boolean).length;
  const failed = results.length - passed;
  console.log(`\n${passed}/${results.length} passed${failed > 0 ? `, ${failed} failed` : ''}`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
