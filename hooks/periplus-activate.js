#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');

const DEFAULT_CRITERIA = {
  'external-facts': 'code',
  'contracts': 'code',
  'current-limits': 'code',
  'why': 'code',
  'unspecified-choices': 'periplus',
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
const TS = String.raw`\d{4}-\d{2}-\d{2}T\d{2}:\d{2}`;
const ROW_RE = new RegExp(String.raw`^- ${TS} → ${TS} \`\S+:\d+\` \[([^\]]*)\]`);
// Read at runtime, never restated here: /pp and the hook must not drift apart.
const SKILL_PATH = path.join(__dirname, '..', 'skills', 'pp', 'SKILL.md');
const TABLE_RE = /<!-- criteria-table:start -->[\s\S]*?<!-- criteria-table:end -->/;
const TABLE_ROW_RE = /^\| `([^`]+)` \|(.*)\| \*\*(\w+)\*\* \|$/;
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
  const problems = [];
  const fallback = { criteria, warnThreshold, problems };

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
    problems.push('the file is not valid JSON');
    return fallback;
  }

  const given = parsed && typeof parsed.criteria === 'object' && parsed.criteria !== null
    ? parsed.criteria
    : {};
  for (const [name, to] of Object.entries(given)) {
    if (!(name in criteria)) problems.push(`unknown kind "${name}"`);
    else if (!DESTINATIONS.includes(to)) problems.push(`"${name}": ${JSON.stringify(to)} is not code, periplus or drop`);
    else criteria[name] = to;
  }

  const t = parsed && parsed.warnThreshold;
  if (Number.isInteger(t) && t > 0) warnThreshold = t;
  else if (t !== undefined) problems.push(`warnThreshold: ${JSON.stringify(t)} is not a positive integer`);

  return { criteria, warnThreshold, problems };
}

// One shape for all three files, so which file a row is in is what says how far it
// has got, and one pattern counts any of them.
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

// A .pre.md still holding rows means that work shipped with no comments at all.
const countPending = (root) => rows(root, PRE_REL).length;

// The rest carry a kind: classified, and then not delivered.
const countUnclassified = (root) => rows(root, PRE_REL).filter((m) => m[1] === '').length;

// Substituted into the shipped table rather than restated, so the wording of a kind
// has one home.
function criteriaTable(root) {
  const { criteria, problems } = loadConfig(root);
  const found = readDiscipline().match(TABLE_RE);
  const table = (found ? found[0] : '')
    .split('\n')
    .filter((line) => !line.startsWith('<!--'))
    .map((line) => {
      const m = line.match(TABLE_ROW_RE);
      return m ? `| \`${m[1]}\` |${m[2]}| **${criteria[m[1]] || m[3]}** |` : line;
    });
  return [...table, ...problems.map((p) => `config.json ignored \u2014 ${p}`)].join('\n');
}

function readDiscipline() {
  return fs.readFileSync(SKILL_PATH, 'utf8').replace(/^---[\s\S]*?---\s*/, '');
}

// Only the capture rule. Phase 2 needs the table, and /pp carries the whole file.
function alwaysSection() {
  const m = readDiscipline().match(ALWAYS_RE);
  return m ? m[1].trimEnd() : readDiscipline();
}

// A plugin cannot install this itself: only `agent` and `subagentStatusLine` are
// read out of a plugin's own settings.json, so the hook has to ask for it.
// The glob and not a pinned path — the cache is versioned, so a path pinned to
// this release stops resolving on the next update, and the check below would go
// on reporting it as wired.
const STATUSLINE_CMD =
  'node "$(ls -t ~/.claude/plugins/cache/*/periplus/*/hooks/periplus-statusline.js | head -1)"';

const settingsPath = () =>
  path.join(process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude'), 'settings.json');

// A missing or half-edited file is not an error here: install has to be able to
// create one from nothing.
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

// The command string, not whether a statusLine exists: most users of this plugin
// already have one from somewhere else.
const isWired = (command) => command.includes('periplus-statusline');

// Adding one key rewrites the whole file, so everything else in it is carried
// over — this is the user's global configuration. Formatting and key order do not
// survive the round trip; the previous file is kept beside it.
function installStatusline(file = settingsPath()) {
  const settings = readSettings(file);
  const command = currentCommand(settings);
  if (isWired(command)) return 'already';

  // periplus goes last: it is the one that takes the project directory from the
  // status line JSON on stdin, and a command in front that ignores stdin leaves it.
  settings.statusLine = {
    type: 'command',
    command: command ? `${command}; printf ' '; ${STATUSLINE_CMD}` : STATUSLINE_CMD,
  };

  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file)) fs.copyFileSync(file, `${file}.periplus-bak`);
  fs.writeFileSync(file, `${JSON.stringify(settings, null, 2)}\n`);
  return command ? 'appended' : 'wired';
}

// The nudge quotes __filename into a command, and the install path is not ours.
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

function buildContext(count, warnThreshold, pending = 0, unclassified = 0, configured = false) {
  // `.periplus/` is hidden, so these counts are the only sign it has stopped draining.
  let header = count > warnThreshold
    ? `PERIPLUS ACTIVE — ${count} entries pending, over the threshold of ${warnThreshold}. `
      + 'The log has stopped draining. Offer to run /pp-discuss before starting new work.'
    : `PERIPLUS ACTIVE — ${count} entries pending`;

  if (pending > 0) {
    header += `\n${pending} row(s) in .periplus/.pre.md were never delivered — `
      + `${unclassified} not yet classified, ${pending - unclassified} classified but left in place. `
      + 'Run /pp on them before writing new code, or that work shipped with no comments at all.';
  }

  if (configured) {
    header += '\nThis repository customises the destinations in .periplus/config.json '
      + '— /pp-resolve reads the resolved table.';
  }

  return `${header}

# Periplus — phase 1

Comments do not go straight into the source. While the code is being written you
only capture; when it is finished you filter, once, with \`/pp\`.

${alwaysSection()}`;
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

  // Ahead of ensureWorkspace: a read-only query should not make `.periplus/` appear.
  if (event === 'criteria') {
    process.stdout.write(`${criteriaTable(root)}\n`);
    return;
  }

  try {
    ensureWorkspace(root);
  } catch {
    // A read-only checkout still gets the discipline, just no place to put it.
  }
  const { warnThreshold } = loadConfig(root);
  const context = buildContext(
    countEntries(root), warnThreshold, countPending(root), countUnclassified(root), hasConfig(root),
  );

  // SessionStart takes raw stdout; SubagentStart drops anything that is not the
  // hookSpecificOutput envelope.
  if (event === 'SubagentStart') {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: { hookEventName: event, additionalContext: context },
    }));
    return;
  }
  // The nudge is on this branch only: a subagent has no status line to configure.
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
  buildContext, readDiscipline, hasConfig, alwaysSection, ensureWorkspace,
  statuslineNudge, installStatusline, DEFAULT_CRITERIA, DEFAULT_THRESHOLD,
};
