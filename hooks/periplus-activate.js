#!/usr/bin/env node
// periplus — SessionStart / SubagentStart activation hook.
//
// The discipline itself lives in skills/pp/SKILL.md so that /pp and the hook
// cannot drift apart. Only the capture rule is injected at session start — the
// criteria table and the filter steps are read when /pp is invoked for phase 2,
// which is the only moment they are needed. The pending counts are prepended:
// `.periplus/` is hidden, so nothing else would show that a log has stopped
// draining or that captured notes were never filtered.

const fs = require('fs');
const path = require('path');

const DEFAULT_CRITERIA = {
  'external-facts': 'code',
  'contracts': 'code',
  'current-limits': 'code',
  'why': 'code',
  'rejected-alternatives': 'periplus',
  'upgrade-triggers': 'periplus',
  'block-headings': 'drop',
  'tautology': 'drop',
  'doc-references': 'drop',
  'history': 'drop',
  'test-intent': 'drop',
};

const DESTINATIONS = ['code', 'periplus', 'drop'];
const DEFAULT_THRESHOLD = 10;
const LOG_REL = '.periplus/log.md';
const PRE_REL = '.periplus/pre.md';
const CONFIG_REL = '.periplus/config.json';
const ENTRY_RE = /^- \d{4}-\d{2}-\d{2}/;
const PRE_RE = /^- \S+:\d+ /;
const SKILL_PATH = path.join(__dirname, '..', 'skills', 'pp', 'SKILL.md');
const TABLE_RE = /<!-- criteria-table:start -->[\s\S]*?<!-- criteria-table:end -->/;
const ALWAYS_RE = /<!-- always:start -->\n([\s\S]*?)<!-- always:end -->/;

const hasConfig = (root) => fs.existsSync(path.join(root, CONFIG_REL));

function projectRoot() {
  return process.env.CLAUDE_PROJECT_DIR || process.cwd();
}

// Config is user input: every field falls back to its default rather than
// throwing, so a malformed file degrades to the shipped discipline instead of
// killing session start.
function loadConfig(root) {
  const criteria = { ...DEFAULT_CRITERIA };
  let warnThreshold = DEFAULT_THRESHOLD;
  const fallback = { criteria, warnThreshold };

  let raw;
  try {
    raw = fs.readFileSync(path.join(root, CONFIG_REL), 'utf8');
  } catch {
    return fallback;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw.replace(/^\uFEFF/, ''));
  } catch {
    return fallback;
  }

  const given = parsed && typeof parsed.criteria === 'object' && parsed.criteria !== null
    ? parsed.criteria
    : {};
  for (const name of Object.keys(criteria)) {
    if (DESTINATIONS.includes(given[name])) criteria[name] = given[name];
  }

  const t = parsed && parsed.warnThreshold;
  if (Number.isInteger(t) && t > 0) warnThreshold = t;

  return { criteria, warnThreshold };
}

function countMatching(root, rel, re) {
  let raw;
  try {
    raw = fs.readFileSync(path.join(root, rel), 'utf8');
  } catch {
    return 0;
  }
  return raw.split('\n').filter((line) => re.test(line)).length;
}

const countEntries = (root) => countMatching(root, LOG_REL, ENTRY_RE);

// Unfiltered pre-comments are the worse failure: they mean a task was called
// done with every note still parked, so the source got no comments at all.
const countPending = (root) => countMatching(root, PRE_REL, PRE_RE);

function readDiscipline() {
  return fs.readFileSync(SKILL_PATH, 'utf8').replace(/^---[\s\S]*?---\s*/, '');
}

// Only the capture rule goes in. Phase 2 needs the criteria table, but phase 2
// happens once, at the end, and /pp carries the whole file when it is invoked.
function alwaysSection() {
  const m = readDiscipline().match(ALWAYS_RE);
  return m ? m[1].trimEnd() : readDiscipline();
}

function buildContext(criteria, count, warnThreshold, pending = 0, configured = false) {
  let header = count > warnThreshold
    ? `PERIPLUS ACTIVE — ${count} entries pending, over the threshold of ${warnThreshold}. `
      + 'The log has stopped draining. Offer to run /pp-discussion before starting new work.'
    : `PERIPLUS ACTIVE — ${count} entries pending`;

  if (pending > 0) {
    header += `\n${pending} pre-comment(s) in .periplus/pre.md were never filtered. `
      + 'Run phase 2 on them before writing new code, or that work shipped with no comments at all.';
  }

  if (configured) {
    header += '\nThis repository customises the criteria in .periplus/config.json — read it in phase 2.';
  }

  return `${header}

# Periplus — phase 1

Comments do not go straight into the source. While the code is being written you
only capture; when it is finished you filter, once, with \`/pp\`.

${alwaysSection()}`;
}

function main(event) {
  const root = projectRoot();
  const { criteria, warnThreshold } = loadConfig(root);
  const context = buildContext(
    criteria, countEntries(root), warnThreshold, countPending(root), hasConfig(root),
  );

  // SessionStart takes raw stdout; SubagentStart drops anything that is not the
  // hookSpecificOutput envelope.
  if (event === 'SubagentStart') {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: { hookEventName: event, additionalContext: context },
    }));
    return;
  }
  process.stdout.write(context);
}

if (require.main === module) {
  try {
    main(process.argv[2] || 'SessionStart');
  } catch {
    // A broken hook must never block session start.
  }
}

module.exports = {
  loadConfig, countEntries, countPending, buildContext, readDiscipline, hasConfig,
  alwaysSection, DEFAULT_CRITERIA, DEFAULT_THRESHOLD,
};
