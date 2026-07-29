#!/usr/bin/env node

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
const LOG_REL = '.periplus/.log.md';
const PRE_REL = '.periplus/.pre.md';
const CONFIG_REL = '.periplus/config.json';
const IGNORE_LINE = '/.periplus/';
const IGNORE_RE = /^\/?\.periplus\/?$/;
const ENTRY_RE = /^- \d{4}-\d{2}-\d{2}/;
const PRE_RE = /^- \S+:\d+ /;
// Read at runtime, never restated here: /pp and the hook must not drift apart.
const SKILL_PATH = path.join(__dirname, '..', 'skills', 'pp', 'SKILL.md');
const TABLE_RE = /<!-- criteria-table:start -->[\s\S]*?<!-- criteria-table:end -->/;
const ALWAYS_RE = /<!-- always:start -->\n([\s\S]*?)<!-- always:end -->/;

const hasConfig = (root) => fs.existsSync(path.join(root, CONFIG_REL));

// The directory is the only visible sign the hook ran at all, so it is made
// before anything has been captured. Runs once, when the directory is first
// made: an ignore line deleted by hand stays deleted.
function ensureWorkspace(root) {
  const dir = path.join(root, '.periplus');
  if (fs.existsSync(dir)) return;
  fs.mkdirSync(dir, { recursive: true });

  if (!fs.existsSync(path.join(root, '.git'))) return;
  const ignoreFile = path.join(root, '.gitignore');
  let body = '';
  try {
    body = fs.readFileSync(ignoreFile, 'utf8');
  } catch {
    body = '';
  }
  if (body.split('\n').some((l) => IGNORE_RE.test(l.trim()))) return;

  // A .gitignore not ending in a newline would otherwise absorb the first line added.
  const gap = body === '' ? '' : body.endsWith('\n') ? '\n' : '\n\n';
  fs.appendFileSync(ignoreFile, `${gap}# periplus working files\n${IGNORE_LINE}\n`);
}

function projectRoot() {
  return process.env.CLAUDE_PROJECT_DIR || process.cwd();
}

// Config is user input: every field falls back to its default rather than throwing.
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

// A .pre.md still holding entries means that work shipped with no comments at all.
const countPending = (root) => countMatching(root, PRE_REL, PRE_RE);

function readDiscipline() {
  return fs.readFileSync(SKILL_PATH, 'utf8').replace(/^---[\s\S]*?---\s*/, '');
}

// Only the capture rule. Phase 2 needs the table, and /pp carries the whole file.
function alwaysSection() {
  const m = readDiscipline().match(ALWAYS_RE);
  return m ? m[1].trimEnd() : readDiscipline();
}

function buildContext(criteria, count, warnThreshold, pending = 0, configured = false) {
  // `.periplus/` is hidden, so these counts are the only sign it has stopped draining.
  let header = count > warnThreshold
    ? `PERIPLUS ACTIVE — ${count} entries pending, over the threshold of ${warnThreshold}. `
      + 'The log has stopped draining. Offer to run /pp-discussion before starting new work.'
    : `PERIPLUS ACTIVE — ${count} entries pending`;

  if (pending > 0) {
    header += `\n${pending} pre-comment(s) in .periplus/.pre.md were never filtered. `
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
  try {
    ensureWorkspace(root);
  } catch {
    // A read-only checkout still gets the discipline, just no place to put it.
  }
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
  alwaysSection, ensureWorkspace, DEFAULT_CRITERIA, DEFAULT_THRESHOLD,
};
