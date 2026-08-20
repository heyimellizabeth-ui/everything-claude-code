#!/usr/bin/env node
/**
 * Simple PreToolUse hook example.
 *
 * Reads the hook payload JSON from stdin, logs the tool being invoked,
 * and always exits 0 so tool execution is never blocked.
 *
 * Wire it up in settings.json:
 *
 *   {
 *     "hooks": {
 *       "PreToolUse": [
 *         {
 *           "matcher": "Bash",
 *           "hooks": [
 *             { "type": "command", "command": "node examples/simple-hook-example.js" }
 *           ]
 *         }
 *       ]
 *     }
 *   }
 */

let raw = '';

process.stdin.on('data', (chunk) => {
  raw += chunk;
});

process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(raw || '{}');
    const tool = payload.tool_name || 'unknown';
    process.stderr.write(`[SimpleHookExample] tool invoked: ${tool}\n`);
  } catch {
    process.stderr.write('[SimpleHookExample] could not parse hook payload\n');
  }
  process.exit(0);
});
