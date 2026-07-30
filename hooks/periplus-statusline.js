#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { countEntries, countPending, loadConfig } = require('./periplus-activate.js');

// Far enough from the 108 ponytail prints that the two tags stay apart side by side.
const SEA = '\u001b[38;5;110m';
const WARN = '\u001b[38;5;179m';
const RESET = '\u001b[0m';

// Only the log turns the tag amber. A non-empty .pre.md is the normal state while
// code is being written, and a colour that is on for most of a session says nothing.
function tag(log, pre, warnThreshold) {
  const counts = `${log > 0 ? `:${log}` : ''}${pre > 0 ? `!${pre}` : ''}`;
  return `${log > warnThreshold ? WARN : SEA}[PERIPLUS${counts}]${RESET}`;
}

const fallbackRoot = () => process.env.CLAUDE_PROJECT_DIR || process.cwd();

// The status line command is not guaranteed to run in the project directory; the
// JSON on stdin carries it. Read by hand from a terminal there is no stdin to wait
// for, and readFileSync(0) would block until EOF.
function projectRoot() {
  if (process.stdin.isTTY) return fallbackRoot();
  let input;
  try {
    input = JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch {
    return fallbackRoot();
  }
  if (!input || typeof input !== 'object') return fallbackRoot();
  return (input.workspace && input.workspace.project_dir) || input.cwd || fallbackRoot();
}

function main() {
  const root = projectRoot();
  // Silent where the hook has never run: a tag in a repository without the
  // discipline would claim it is live.
  if (!fs.existsSync(path.join(root, '.periplus'))) return;
  const { warnThreshold } = loadConfig(root);
  process.stdout.write(tag(countEntries(root), countPending(root), warnThreshold));
}

if (require.main === module) {
  try {
    main();
  } catch {
    // The status line is redrawn constantly, so a broken one would spew every frame.
  }
}

module.exports = { tag };
