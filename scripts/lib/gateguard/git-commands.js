/**
 * Git command analysis for the GateGuard fact-forcing hook.
 * Extracted from scripts/hooks/gateguard-fact-force.js.
 */

'use strict';

/**
 * Strip a leading path and trailing `.exe` from a command token so
 * `/usr/bin/git`, `git.exe`, and `GIT` all normalize to `git`.
 *
 * @param {string} token
 * @returns {string}
 */
function commandBasename(token) {
  if (!token) return '';
  return token.replace(/^.*[\\/]/, '').replace(/\.exe$/i, '').toLowerCase();
}

/**
 * Locate the git subcommand within a token list, skipping over git's
 * global options like `-c key=value`, `-C <path>`, `--git-dir=...`,
 * `--work-tree=...`, `--namespace=...`, `--super-prefix=...`.
 *
 * @param {string[]} tokens
 * @returns {{ command: string, rest: string[] } | null}
 */
function findGitSubcommand(tokens) {
  if (tokens.length === 0 || commandBasename(tokens[0]) !== 'git') return null;
  const valueConsumingShort = new Set(['-c', '-C']);
  const valueConsumingLong = new Set(['--git-dir', '--work-tree', '--namespace', '--super-prefix']);
  let i = 1;
  while (i < tokens.length) {
    const t = tokens[i];
    if (valueConsumingShort.has(t) || valueConsumingLong.has(t)) {
      i += 2;
      continue;
    }
    if (t.startsWith('--git-dir=') || t.startsWith('--work-tree=') || t.startsWith('--namespace=') || t.startsWith('--super-prefix=')) {
      i += 1;
      continue;
    }
    if (t.startsWith('-')) {
      // Unknown global option — skip without consuming a value.
      i += 1;
      continue;
    }
    return { command: t.toLowerCase(), rest: tokens.slice(i + 1) };
  }
  return null;
}

/**
 * Detect destructive `git` invocations: `reset --hard`, `checkout --`,
 * `clean -f...`, `push --force` (but not `--force-with-lease`),
 * `commit --amend`, `rm -rf`.
 *
 * @param {string[]} tokens
 * @returns {boolean}
 */
function isDestructiveGit(tokens) {
  const sub = findGitSubcommand(tokens);
  if (!sub) return false;
  const { command, rest } = sub;

  if (command === 'reset') {
    return rest.includes('--hard');
  }

  if (command === 'checkout') {
    return rest.includes('--');
  }

  if (command === 'clean') {
    // `git clean -f`, `-fd`, `-fdx`, `-df`, `--force`
    return rest.some(t => {
      if (t === '--force') return true;
      if (!t.startsWith('-') || t.startsWith('--')) return false;
      return t.slice(1).includes('f');
    });
  }

  if (command === 'push') {
    // Only `--force-with-lease` qualifies as a safety-checked force.
    // `--force-if-includes` is a no-op when used WITHOUT
    // `--force-with-lease` (per git-scm.com/docs/git-push), and when
    // combined with a bare `--force` the bare force is still in effect.
    // So `--force --force-if-includes` must be treated as destructive.
    //
    // A `+` refspec prefix (e.g. `git push origin +main`,
    // `+refs/heads/main:refs/heads/main`) also forces a non-fast-forward
    // update of that ref and is destructive on its own.
    let withLease = false;
    let bareForce = false;
    let plusRefspecForce = false;
    for (const t of rest) {
      if (t === '--force-with-lease' || t.startsWith('--force-with-lease=')) {
        withLease = true;
        continue;
      }
      if (t === '--force' || t.startsWith('--force=')) {
        bareForce = true;
        continue;
      }
      if (t.startsWith('-') && !t.startsWith('--') && t.slice(1).includes('f')) {
        bareForce = true;
        continue;
      }
      // Refspec prefix: `+<src>[:<dst>]`. Match tokens like `+main`,
      // `+refs/heads/main`, `+HEAD:branch`, `+:branch`. Exclude bare
      // `+` and numeric-only `+123` which are not refspecs.
      if (t.startsWith('+') && t.length > 1 && /^\+(?:[a-zA-Z_/.:]|HEAD)/.test(t)) {
        plusRefspecForce = true;
      }
    }
    return bareForce || (plusRefspecForce && !withLease);
  }

  if (command === 'commit') {
    return rest.includes('--amend');
  }

  if (command === 'rm') {
    // `git rm -r` / `-rf` / `-r -f` — destructive within the index too.
    let hasR = false;
    for (const t of rest) {
      if (!t.startsWith('-') || t.startsWith('--')) continue;
      if (/[rR]/.test(t.slice(1))) hasR = true;
    }
    return hasR;
  }

  if (command === 'switch') {
    // `git switch` can discard local working-tree changes in three forms:
    //   --discard-changes           explicit discard
    //   --force / -f                ignore conflicts and overwrite
    //   -C <branch>                 force-create (overwrites existing branch)
    return rest.some(t => {
      if (t === '--discard-changes' || t === '--force') return true;
      if (!t.startsWith('-') || t.startsWith('--')) return false;
      // Short combined form: -f, -fC, -Cf, -C
      const body = t.slice(1);
      return /[fC]/.test(body);
    });
  }

  return false;
}

function isReadOnlyGitIntrospection(command) {
  const trimmed = String(command || '').trim();
  if (!trimmed || /[\r\n;&|><`$()]/.test(trimmed)) {
    return false;
  }

  const tokens = trimmed.split(/\s+/);
  if (tokens[0] !== 'git' || tokens.length < 2) {
    return false;
  }

  const subcommand = tokens[1].toLowerCase();
  const args = tokens.slice(2);

  if (subcommand === 'status') {
    return args.every(arg => ['--porcelain', '--short', '--branch'].includes(arg));
  }

  if (subcommand === 'diff') {
    return args.length <= 1 && args.every(arg => ['--name-only', '--name-status'].includes(arg));
  }

  if (subcommand === 'log') {
    return args.every(arg => arg === '--oneline' || /^--max-count=\d+$/.test(arg));
  }

  if (subcommand === 'show') {
    return args.length === 1 && !args[0].startsWith('--') && /^[a-zA-Z0-9._:/-]+$/.test(args[0]);
  }

  if (subcommand === 'branch') {
    return args.length === 1 && args[0] === '--show-current';
  }

  if (subcommand === 'rev-parse') {
    return args.length === 2 && args[0] === '--abbrev-ref' && /^head$/i.test(args[1]);
  }

  return false;
}

module.exports = {
  commandBasename,
  findGitSubcommand,
  isDestructiveGit,
  isReadOnlyGitIntrospection
};
