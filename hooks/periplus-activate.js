#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');

const DEFAULT_CRITERIA = {
  'external-facts': 'code',
  'contracts': 'code',
  'current-limits': 'code',
  'block-headings': 'code',
  'undocumented-design': 'periplus',
  'unspecified-choices': 'periplus',
  'why': 'periplus',
  'rejected-alternatives': 'periplus',
  'upgrade-triggers': 'periplus',
  'tautology': 'drop',
  'doc-restatement': 'drop',
  'history': 'drop',
  'test-intent': 'drop',
};

const DESTINATIONS = ['code', 'periplus', 'drop'];
const KEY_IGNORED = ' — that key alone was ignored, the rest of the file was applied';
const LOG_REL = '.periplus/log.csv';
const PRE_REL = '.periplus/pre.csv';
const CONFIG_REL = '.periplus/config.json';
const IGNORE_LINE = '/.periplus/';
const IGNORE_RE = /^\/?\.periplus\/?$/;
const TS = String.raw`\d{4}-\d{2}-\d{2}T\d{2}:\d{2}`;
// Quoting is not checked: a miswritten row drops out of the count unseen.
const ROW_RE = new RegExp(String.raw`^${TS},[^,]*,\d*,([^,]*),`);
const SKILL_PATH = path.join(__dirname, '..', 'skills', 'pp', 'SKILL.md');
const KINDS_PATH = path.join(__dirname, '..', 'skills', 'pp-classify', 'SKILL.md');
const CAPTURE_PATH = path.join(__dirname, '..', 'skills', 'pp-capture', 'SKILL.md');
const TABLE_RE = /<!-- criteria-table:start -->[\s\S]*?<!-- criteria-table:end -->/;
// The shipped table has two columns, and the destination is not one of them.
const TABLE_ROW_RE = /^\| `([^`]+)` \|(.*)\|$/;

// Runs once, when the directory is first made: an ignore line deleted by hand
// stays deleted.
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

  // A .gitignore not ending in a newline would absorb the first line added.
  const gap = body === '' ? '' : body.endsWith('\n') ? '\n' : '\n\n';
  fs.appendFileSync(ignoreFile, `${gap}# periplus working files\n${IGNORE_LINE}\n`);
}

function ensureConfig(root) {
  const file = path.join(root, CONFIG_REL);
  fs.mkdirSync(path.dirname(file), { recursive: true });

  let parsed = null;
  if (fs.existsSync(file)) {
    // A config nobody can parse is left as it is: what the user wrote is not ours to overwrite.
    try {
      parsed = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
    } catch {
      return;
    }
    if (!parsed || typeof parsed !== 'object') return;
  }

  const criteria = parsed && typeof parsed.criteria === 'object' && parsed.criteria !== null
    ? parsed.criteria
    : {};
  const missing = Object.keys(DEFAULT_CRITERIA).filter((name) => !(name in criteria));
  if (missing.length === 0) return;

  for (const name of missing) criteria[name] = DEFAULT_CRITERIA[name];
  fs.writeFileSync(file, `${JSON.stringify({ ...parsed, criteria }, null, 2)}\n`);
}

function projectRoot() {
  return process.env.CLAUDE_PROJECT_DIR || process.cwd();
}

// Config is user input: every field falls back to its default rather than throwing.
function loadConfig(root) {
  const criteria = { ...DEFAULT_CRITERIA };
  const problems = [];
  const fallback = { criteria, problems };

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
    problems.push('the file is not valid JSON, so none of it was applied');
    return fallback;
  }

  const given = parsed && typeof parsed.criteria === 'object' && parsed.criteria !== null
    ? parsed.criteria
    : {};
  for (const [name, to] of Object.entries(given)) {
    if (!(name in criteria)) problems.push(`unknown kind "${name}"${KEY_IGNORED}`);
    else if (!DESTINATIONS.includes(to)) problems.push(`"${name}": ${JSON.stringify(to)} is not code, periplus or drop${KEY_IGNORED}`);
    else criteria[name] = to;
  }

  return { criteria, problems };
}

function rows(root, rel) {
  let raw;
  try {
    raw = fs.readFileSync(path.join(root, rel), 'utf8');
  } catch {
    return [];
  }
  return raw.split('\n').map((line) => line.match(ROW_RE)).filter(Boolean);
}

const countEntries = (root) => rows(root, LOG_REL).length;

const countPending = (root) => rows(root, PRE_REL).length;

const countUnclassified = (root) => rows(root, PRE_REL).filter((m) => m[1] === '').length;

function criteriaTable(root) {
  const { criteria, problems } = loadConfig(root);
  const found = readKinds().match(TABLE_RE);
  const table = (found ? found[0] : '')
    .split('\n')
    .filter((line) => !line.startsWith('<!--'))
    .map((line) => {
      // A test holds SKILL.md and DEFAULT_CRITERIA to the same set of kinds.
      const m = line.match(TABLE_ROW_RE);
      if (m) return `${line} **${criteria[m[1]]}** |`;
      if (line.startsWith('| ---')) return `${line} --- |`;
      if (line.startsWith('|')) return `${line} it goes to |`;
      return line;
    });
  return [...table, ...problems.map((p) => `config.json: ${p}`)].join('\n');
}

const body = (file) => fs.readFileSync(file, 'utf8').replace(/^---[\s\S]*?---\s*/, '');

const readDiscipline = () => body(SKILL_PATH);

const readKinds = () => body(KINDS_PATH);

// The whole file is the rule: nothing else is injected, and nothing restates it.
const captureRule = () => body(CAPTURE_PATH).trimEnd();

// Only `agent` and `subagentStatusLine` are read out of a plugin's own
// settings.json, so a plugin cannot install this itself.
const STATUSLINE_CMD =
  'node "$(ls -t ~/.claude/plugins/cache/*/periplus/*/hooks/periplus-statusline.js | head -1)"';

const settingsPath = () =>
  path.join(process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude'), 'settings.json');

// A missing or half-edited file is not an error here: install has to create one from nothing.
function readSettings(file) {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8').trim());
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

const currentCommand = (settings) =>
  (settings.statusLine && typeof settings.statusLine.command === 'string')
    ? settings.statusLine.command
    : '';

// Most users of this plugin already have a status line from somewhere else.
const isWired = (command) => command.includes('periplus-statusline');

// This file is the user's global configuration.
// Formatting and key order do not survive the round trip.
function installStatusline(file = settingsPath()) {
  const settings = readSettings(file);
  const command = currentCommand(settings);
  if (isWired(command)) return 'already';

  // A command in front that ignores stdin leaves it unread.
  settings.statusLine = {
    type: 'command',
    command: command ? `${command}; printf ' '; ${STATUSLINE_CMD}` : STATUSLINE_CMD,
  };

  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file)) fs.copyFileSync(file, `${file}.periplus-bak`);
  fs.writeFileSync(file, `${JSON.stringify(settings, null, 2)}\n`);
  return command ? 'appended' : 'wired';
}

// The install path is not ours.
// Anything outside this set would need escaping for a shell we cannot identify here.
const SHELL_SAFE = /^[A-Za-z0-9 _.\-:/\\~]+$/;

function statuslineNudge(file = settingsPath()) {
  if (isWired(currentCommand(readSettings(file)))) return '';

  // Nothing to install on Windows: the glob in STATUSLINE_CMD is POSIX only.
  const installable = process.platform !== 'win32' && SHELL_SAFE.test(__filename);
  const how = installable
    ? `run \`node "${__filename}" install\` — it adds the statusLine to your `
      + 'settings.json, keeping any status line already there and appending periplus '
      + 'after it, and it backs the file up first. Nothing else is changed. The tag appears on '
      + 'the next session'
    : 'add to ~/.claude/settings.json a statusLine of "type": "command" running '
      + 'periplus-statusline.js from the plugin\'s hooks directory, newest cached version first. '
      + 'If a statusLine is already configured, append to its command with `; printf \' \'; ` '
      + 'instead of replacing it, and put periplus last — it reads the project directory from '
      + 'the status line JSON on stdin';

  return '\nSTATUSLINE SETUP NEEDED: periplus can keep both counts on the status line '
    + '([PERIPLUS:3!2] for three log entries and two unfiltered pre-comments), and it is not '
    + `wired up yet. To set it up, ${how}. Offer this to the user once.`;
}

function buildContext(count, pending = 0, unclassified = 0) {
  let header = `PERIPLUS ACTIVE — ${count} in the log`;

  if (pending > 0) {
    header += `\n${pending} row(s) in .periplus/pre.csv were never delivered — `
      + `${unclassified} not yet classified, ${pending - unclassified} classified but left in place. `
      + 'Run /pp on them before writing new code, or that work shipped with no comments at all.';
  }

  return `${header}

# Periplus — phase 1

Comments do not go straight into the source. While the code is being written you
only capture; when it is finished you filter, once, with \`/pp\`.

${captureRule()}`;
}

const INSTALL_RESULT = {
  already: 'The status line was already wired up. Nothing changed.',
  appended: 'Added periplus after the status line that was already there.',
  wired: 'Status line wired up.',
};

function main(event) {
  if (event === 'install') {
    const file = settingsPath();
    process.stdout.write(`${INSTALL_RESULT[installStatusline(file)]} ${file}\n`);
    return;
  }

  const root = projectRoot();

  if (event === 'criteria') {
    process.stdout.write(`${criteriaTable(root)}\n`);
    return;
  }

  try {
    ensureWorkspace(root);
    ensureConfig(root);
  } catch {
    // A read-only checkout still gets the discipline, just no place to put it.
  }

  // SessionStart takes raw stdout; SubagentStart drops anything that is not the
  // hookSpecificOutput envelope.
  if (event === 'SubagentStart') {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: event,
        additionalContext: buildContext(countEntries(root)),
      },
    }));
    return;
  }

  // A subagent has no status line to configure.
  const context = buildContext(countEntries(root), countPending(root), countUnclassified(root));
  process.stdout.write(context + statuslineNudge());
}

if (require.main === module) {
  try {
    main(process.argv[2] || 'SessionStart');
  } catch {
    // A broken hook must never block session start.
  }
}

module.exports = {
  loadConfig, countEntries, countPending, countUnclassified, criteriaTable,
  buildContext, readDiscipline, readKinds, captureRule, ensureWorkspace,
  ensureConfig, statuslineNudge, installStatusline, DEFAULT_CRITERIA, ROW_RE,
  CAPTURE_PATH,
};
