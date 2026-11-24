/**
 * Destructive bash command detection for the GateGuard fact-forcing hook.
 * Extracted from scripts/hooks/gateguard-fact-force.js.
 */

'use strict';

const {
  extractCommandSubstitutions,
  extractSubshellGroups,
  extractBraceGroups
} = require('../shell-substitution');
const { commandBasename, isDestructiveGit } = require('./git-commands');

// SQL-keyword + dd patterns stay as a single regex — they are stable
// phrases without shell-flag ordering concerns. Quoted strings are
// stripped before this regex runs so a commit message mentioning
// "drop table" no longer triggers a false positive.
const DESTRUCTIVE_SQL_DD = /\b(drop\s+table|delete\s+from|truncate|dd\s+if=)\b/i;

/**
 * Strip the contents of single- and double-quoted strings so phrases
 * mentioned inside a commit message or echoed argument do not trigger
 * the destructive detector. Command substitutions are scanned separately
 * before this runs because they execute even inside double quotes.
 *
 * @param {string} input
 * @returns {string}
 */
function stripQuotedStrings(input) {
  return input
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""');
}

/**
 * Promote subshell delimiters to top-level segment separators so the
 * destructive check applies inside `$(...)` and backtick subshells.
 * Without this, `echo y | $(rm -rf /tmp)` and ``echo y | `rm -rf /tmp` ``
 * slip past the segment splitter because the destructive command lives
 * inside a sub-expression. Run iteratively to handle a layer of nesting.
 *
 * @param {string} input
 * @returns {string}
 */
function explodeSubshells(input) {
  let out = input;
  for (let i = 0; i < 4; i += 1) {
    const before = out;
    out = out.replace(/\$\(([^()`]*)\)/g, ';$1;');
    out = out.replace(/`([^`]*)`/g, ';$1;');
    if (out === before) break;
  }
  return out;
}

/**
 * Split a command line into top-level segments at unquoted shell
 * separators (`;`, `|`, `&`, `&&`, `||`) and across subshells
 * (`$(...)` / backticks). Quoted strings are stripped first so
 * separators inside quotes are not split on. Per-segment comments
 * are also stripped.
 *
 * @param {string} input
 * @returns {string[]}
 */
function splitCommandSegments(input) {
  const stripped = explodeSubshells(stripQuotedStrings(input));
  return stripped
    .split(/[;|&]+/)
    .map(segment => segment.replace(/(^|\s)#.*/, '$1').trim())
    .filter(Boolean);
}

/**
 * Tokenize a single command segment by whitespace. Quoted strings
 * are already collapsed to empty quotes by `stripQuotedStrings`, so
 * naive whitespace splitting is sufficient.
 *
 * @param {string} segment
 * @returns {string[]}
 */
function tokenize(segment) {
  return segment.split(/\s+/).filter(Boolean);
}

/**
 * Detect `rm` invocations that recursively force-delete files. Handles
 * combined (`-rf`, `-fr`, `-Rf`) and split (`-r -f`) flag forms.
 *
 * @param {string[]} tokens
 * @returns {boolean}
 */
function isDestructiveRm(tokens) {
  if (tokens.length === 0 || commandBasename(tokens[0]) !== 'rm') return false;
  let hasR = false;
  let hasF = false;
  for (const t of tokens.slice(1)) {
    if (t === '--recursive') {
      hasR = true;
      continue;
    }
    if (t === '--force') {
      hasF = true;
      continue;
    }
    if (!t.startsWith('-') || t.startsWith('--')) continue;
    const body = t.slice(1);
    if (/[rR]/.test(body)) hasR = true;
    if (/f/.test(body)) hasF = true;
  }
  return hasR && hasF;
}

/**
 * Walk every executable body reachable from a raw command line and
 * return them as a flat list. Bodies that bash will execute live in
 * three different syntactic constructs, each handled by a sibling
 * extractor in `scripts/lib/shell-substitution.js`:
 *   - `$(...)` and backticks via `extractCommandSubstitutions`
 *   - plain `(...)` subshells   via `extractSubshellGroups`
 *   - `{ ...; }` brace groups   via `extractBraceGroups`
 *
 * Each extractor recurses into its own syntax. The BFS here adds
 * cross-syntax discovery — e.g. a `(...)` inside a `$(...)` body, or
 * a `{ ...; }` inside a `(...)` body — by feeding every harvested
 * body back through all three extractors. A `seen` set bounds the
 * cost to O(unique bodies).
 *
 * @param {string} raw
 * @returns {string[]}
 */
function collectExecutableBodies(raw) {
  const bodies = [raw];
  const queue = [raw];
  const seen = new Set();

  while (queue.length) {
    const current = queue.shift();
    if (seen.has(current)) continue;
    seen.add(current);

    for (const body of extractCommandSubstitutions(current)) {
      if (seen.has(body)) continue;
      bodies.push(body);
      queue.push(body);
    }
    for (const body of extractSubshellGroups(current)) {
      if (seen.has(body)) continue;
      bodies.push(body);
      queue.push(body);
    }
    for (const body of extractBraceGroups(current)) {
      if (seen.has(body)) continue;
      bodies.push(body);
      queue.push(body);
    }
  }

  return bodies;
}

/**
 * Decide whether a bash command line contains a destructive action
 * the fact-forcing gate should challenge. Combines SQL-keyword
 * detection (regex on quote-stripped input) with per-segment shell
 * tokenization for shell commands.
 *
 * @param {string} command
 * @returns {boolean}
 */
function isDestructiveBash(command) {
  // The SQL/dd phrases live in command bodies, not as flag-bearing
  // arguments, so we still match them by regex — but on the input
  // after quoting AND subshell delimiters are normalized so phrases
  // inside `$(...)` or backticks are also caught.
  const raw = String(command || '');
  const flattened = explodeSubshells(stripQuotedStrings(raw));
  if (DESTRUCTIVE_SQL_DD.test(flattened)) return true;

  const segments = collectExecutableBodies(raw).flatMap(splitCommandSegments);
  for (const segment of segments) {
    if (DESTRUCTIVE_SQL_DD.test(stripQuotedStrings(segment))) return true;
    const tokens = tokenize(segment);
    if (isDestructiveRm(tokens)) return true;
    if (isDestructiveGit(tokens)) return true;
  }
  return false;
}

module.exports = {
  DESTRUCTIVE_SQL_DD,
  stripQuotedStrings,
  explodeSubshells,
  splitCommandSegments,
  tokenize,
  isDestructiveRm,
  collectExecutableBodies,
  isDestructiveBash
};
