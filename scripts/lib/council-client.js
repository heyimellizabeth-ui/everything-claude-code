'use strict';

/**
 * HTTP client for the LLM Council service.
 *
 * Default base URL: http://localhost:8001
 * Override with COUNCIL_BASE_URL env var.
 *
 * Usage:
 *   node scripts/lib/council-client.js --check
 *   node scripts/lib/council-client.js --review "$(git diff HEAD)"
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const DEFAULT_BASE_URL = 'http://localhost:8001';
const DEFAULT_TIMEOUT_MS = 120000;

const KARPATHY_PROMPT_PREFIX = `Evaluate the following code change against the Andrej Karpathy behavioral guidelines for LLM-assisted coding.

GUIDELINES:
1. Think Before Coding — State assumptions explicitly. If multiple interpretations exist, name them. Push back when warranted. Ask rather than guess. Silently picking one interpretation is a violation.
2. Simplicity First — Minimum code that solves the problem. No speculative features, abstractions, or impossible-scenario error handling. No configurability that wasn't requested. If 200 lines could be 50, that is a violation.
3. Surgical Changes — Touch only what you must. Match existing style. Clean up only your own mess. Changing adjacent code, comments, formatting, or style that the task didn't require is a violation.
4. Goal-Driven Execution — Define verifiable success criteria before implementing. Loop until verified. A bug fix without a reproducing test, or a multi-step change with no explicit plan, is a violation.

CODE CHANGE (git diff):
`;

const KARPATHY_PROMPT_SUFFIX = `

For EACH of the 4 guidelines, respond with:
- Status: PASS or FAIL
- If FAIL: quote the specific lines that violate it and state the concrete fix.

End your response with an OVERALL verdict on its own line:
OVERALL: PASS
or
OVERALL: NEEDS WORK`;

function getBaseUrl() {
  return (process.env.COUNCIL_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
}

function request(method, urlStr, body, timeoutMs) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const lib = parsed.protocol === 'https:' ? https : http;
    const data = body ? JSON.stringify(body) : null;

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + (parsed.search || ''),
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: timeoutMs || DEFAULT_TIMEOUT_MS,
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = lib.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, body: raw });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    req.on('error', reject);

    if (data) req.write(data);
    req.end();
  });
}

async function isCouncilRunning(baseUrl) {
  try {
    const res = await request('GET', `${baseUrl}/`, null, 5000);
    return res.status >= 200 && res.status < 500;
  } catch {
    return false;
  }
}

async function createConversation(baseUrl) {
  const res = await request('POST', `${baseUrl}/api/conversations`, {});
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Failed to create conversation: HTTP ${res.status}`);
  }
  return res.body;
}

async function sendMessage(baseUrl, conversationId, content) {
  const res = await request(
    'POST',
    `${baseUrl}/api/conversations/${conversationId}/message`,
    { content }
  );
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Council message failed: HTTP ${res.status}`);
  }
  return res.body;
}

async function runKarpathyReview(diff, baseUrl) {
  const prompt = KARPATHY_PROMPT_PREFIX + diff + KARPATHY_PROMPT_SUFFIX;
  const conv = await createConversation(baseUrl);
  return sendMessage(baseUrl, conv.id, prompt);
}

async function main() {
  const args = process.argv.slice(2);
  const baseUrl = getBaseUrl();

  if (args[0] === '--check') {
    const running = await isCouncilRunning(baseUrl);
    process.stdout.write(running ? 'Council is running\n' : 'Council not reachable\n');
    process.exit(running ? 0 : 1);
  }

  if (args[0] === '--review') {
    const diff = args[1];
    if (!diff || !diff.trim()) {
      process.stderr.write('[council-client] No diff provided to --review\n');
      process.exit(1);
    }

    const running = await isCouncilRunning(baseUrl);
    if (!running) {
      process.stderr.write(`[council-client] Council not reachable at ${baseUrl}\n`);
      process.exit(2);
    }

    try {
      const result = await runKarpathyReview(diff, baseUrl);
      process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    } catch (err) {
      process.stderr.write(`[council-client] Review failed: ${err.message}\n`);
      process.exit(1);
    }
    return;
  }

  process.stderr.write('Usage:\n  council-client.js --check\n  council-client.js --review "<diff>"\n');
  process.exit(1);
}

if (require.main === module) {
  main().catch(err => {
    process.stderr.write(`[council-client] ${err.message}\n`);
    process.exit(1);
  });
}

module.exports = { isCouncilRunning, createConversation, sendMessage, runKarpathyReview, getBaseUrl };
