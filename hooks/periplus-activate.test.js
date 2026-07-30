#!/usr/bin/env node

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  loadConfig,
  countEntries,
  countPending,
  buildContext,
  readDiscipline,
  alwaysSection,
  ensureWorkspace,
  statuslineNudge,
  installStatusline,
  DEFAULT_CRITERIA,
  DEFAULT_THRESHOLD,
} = require('./periplus-activate.js');

const TABLE_RE = /<!-- criteria-table:start -->[\s\S]*?<!-- criteria-table:end -->/;

function repo(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'periplus-'));
  for (const [rel, body] of Object.entries(files)) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, body);
  }
  return root;
}

test('no config falls back to the shipped defaults', () => {
  const { criteria, warnThreshold } = loadConfig(repo({}));
  assert.deepStrictEqual(criteria, DEFAULT_CRITERIA);
  assert.strictEqual(warnThreshold, DEFAULT_THRESHOLD);
});

test('a valid destination overrides the default', () => {
  const root = repo({
    '.periplus/config.json': JSON.stringify({ criteria: { why: 'periplus' }, warnThreshold: 3 }),
  });
  const { criteria, warnThreshold } = loadConfig(root);
  assert.strictEqual(criteria.why, 'periplus');
  assert.strictEqual(criteria.contracts, 'code', 'untouched criteria keep their default');
  assert.strictEqual(warnThreshold, 3);
});

test('invalid values fall back instead of poisoning the discipline', () => {
  const root = repo({
    '.periplus/config.json': JSON.stringify({
      criteria: { why: 'wherever', tautology: null, 'made-up-key': 'code' },
      warnThreshold: -1,
    }),
  });
  const { criteria, warnThreshold } = loadConfig(root);
  assert.strictEqual(criteria.why, 'code');
  assert.strictEqual(criteria.tautology, 'drop');
  assert.ok(!('made-up-key' in criteria), 'unknown criteria are not admitted');
  assert.strictEqual(warnThreshold, DEFAULT_THRESHOLD);
});

test('malformed JSON degrades to defaults rather than throwing', () => {
  const root = repo({ '.periplus/config.json': '{ not json' });
  assert.deepStrictEqual(loadConfig(root).criteria, DEFAULT_CRITERIA);
});

test('only entry lines are counted', () => {
  const root = repo({
    '.periplus/.log.md': [
      '# periplus',
      '',
      '- 2026-07-29T11:03 `src/a.py:1` [why] first',
      '  continuation line that is not its own entry',
      '- 2026-07-30T09:00 `src/b.py:2` [upgrade-triggers] second',
      '- not an entry, no date',
      '',
    ].join('\n'),
  });
  assert.strictEqual(countEntries(root), 2);
});

test('a missing log counts as zero, not an error', () => {
  assert.strictEqual(countEntries(repo({})), 0);
});

test('unfiltered pre-comments are counted and warned about', () => {
  const root = repo({
    '.periplus/.pre.md': [
      '# pre',
      '- src/payments.py:38 Retry-After only handles seconds, and we should parse dates one day',
      '- src/ledger.py:4 the dict is per process, move to Redis later',
      'a stray line that is not an entry',
    ].join('\n'),
  });
  assert.strictEqual(countPending(root), 2);

  const context = buildContext(DEFAULT_CRITERIA, 0, 10, countPending(root));
  assert.ok(context.includes('2 pre-comment(s)'), 'the count is surfaced');
  assert.ok(context.includes('never filtered'));
});

test('no warning when nothing is parked', () => {
  const context = buildContext(DEFAULT_CRITERIA, 0, 10, 0);
  assert.ok(!context.includes('pre-comment(s)'));
});

test('the threshold warning appears only above the threshold', () => {
  const quiet = buildContext(DEFAULT_CRITERIA, 10, 10);
  assert.ok(quiet.startsWith('PERIPLUS ACTIVE — 10 entries pending\n'));
  assert.ok(!quiet.includes('stopped draining'));

  const loud = buildContext(DEFAULT_CRITERIA, 11, 10);
  assert.ok(loud.includes('over the threshold of 10'));
  assert.ok(loud.includes('stopped draining'));
});

test('a repository with a config is told to read it', () => {
  const plain = buildContext(DEFAULT_CRITERIA, 0, 10, 0, false);
  assert.ok(!plain.includes('customises the criteria'));

  const configured = buildContext(DEFAULT_CRITERIA, 0, 10, 0, true);
  assert.ok(configured.includes('.periplus/config.json'));
  assert.ok(configured.includes('read it in phase 2'));
});

test('phase 2 is told to consult the config before routing', () => {
  assert.ok(readDiscipline().includes('If `.periplus/config.json` exists, read it first'));
});

test('phase 2 is told not to translate on the way out', () => {
  assert.ok(readDiscipline().includes('Keep the language it was captured in'));
});

test('the injected capture rule is lifted verbatim from the skill', () => {
  const delivered = buildContext(DEFAULT_CRITERIA, 3, 10);
  assert.ok(delivered.includes(alwaysSection()));
  assert.ok(readDiscipline().includes(alwaysSection()));
});

test('session start carries the capture rule only, not the filter machinery', () => {
  const delivered = buildContext(DEFAULT_CRITERIA, 0, 10);
  assert.ok(delivered.includes('.periplus/.pre.md'), 'the capture rule is present');
  assert.ok(delivered.includes('invoke `/pp`'), 'phase 2 is pointed at, not inlined');
  assert.ok(!TABLE_RE.test(delivered), 'the criteria table is not injected');
  assert.ok(!delivered.includes('rejected-alternatives'), 'no criterion names leak in');
  assert.ok(
    delivered.length * 3 < readDiscipline().length,
    `injected ${delivered.length} chars against a ${readDiscipline().length} char skill`,
  );
});

const ignoreOf = (root) => fs.readFileSync(path.join(root, '.gitignore'), 'utf8');

test('the workspace exists before anything has been captured into it', () => {
  const root = repo({ '.git/HEAD': 'ref: refs/heads/main\n', '.gitignore': 'node_modules/' });
  ensureWorkspace(root);

  assert.ok(fs.existsSync(path.join(root, '.periplus')), 'the only visible sign the hook ran');
  const ignored = ignoreOf(root);
  assert.ok(ignored.includes('\n/.periplus/\n'));
  assert.ok(ignored.startsWith('node_modules/\n'), 'a file with no trailing newline is not joined onto');
});

test('an existing workspace is left alone, whatever the .gitignore says', () => {
  const root = repo({ '.git/HEAD': 'x', '.gitignore': 'node_modules/\n', '.periplus/.log.md': '' });
  ensureWorkspace(root);
  assert.strictEqual(ignoreOf(root), 'node_modules/\n', 'a deleted ignore line stays deleted');
});

for (const existing of ['/.periplus/', '.periplus/', '.periplus']) {
  test(`\`${existing}\` already in .gitignore is not added twice`, () => {
    const root = repo({ '.git/HEAD': 'x', '.gitignore': `${existing}\n` });
    ensureWorkspace(root);
    assert.strictEqual(ignoreOf(root), `${existing}\n`);
  });
}

test('a directory that is not a repository gets the workspace but no .gitignore', () => {
  const root = repo({});
  ensureWorkspace(root);
  assert.ok(fs.existsSync(path.join(root, '.periplus')));
  assert.ok(!fs.existsSync(path.join(root, '.gitignore')));
});

test('the shipped table in SKILL.md matches the defaults the hook falls back to', () => {
  const table = readDiscipline().match(TABLE_RE)[0];
  for (const [name, dest] of Object.entries(DEFAULT_CRITERIA)) {
    assert.ok(
      new RegExp(`\\| \`${name}\` \\|[^|]*\\| \\*\\*${dest}\\*\\* \\|`).test(table),
      `${name} should be documented as ${dest}`,
    );
  }
});

function settings(body) {
  const root = repo({ 'settings.json': body });
  return path.join(root, 'settings.json');
}

test('no settings file at all asks for the status line', () => {
  assert.match(statuslineNudge(path.join(os.tmpdir(), 'periplus-absent.json')), /STATUSLINE SETUP NEEDED/);
});

test('a statusLine belonging to something else still asks', () => {
  const file = settings(JSON.stringify({
    statusLine: { type: 'command', command: 'bash /x/ponytail-statusline.sh' },
  }));
  assert.match(statuslineNudge(file), /STATUSLINE SETUP NEEDED/);
});

test('a statusLine already running periplus stays quiet', () => {
  const file = settings(JSON.stringify({
    statusLine: { type: 'command', command: 'bash /x/ponytail-statusline.sh; node /y/periplus-statusline.js' },
  }));
  assert.strictEqual(statuslineNudge(file), '');
});

test('unreadable settings ask rather than throw', () => {
  assert.match(statuslineNudge(settings('{ not json')), /STATUSLINE SETUP NEEDED/);
});

test('a byte order mark does not hide an existing periplus status line', () => {
  const file = settings('﻿' + JSON.stringify({
    statusLine: { type: 'command', command: 'node /y/periplus-statusline.js' },
  }));
  assert.strictEqual(statuslineNudge(file), '');
});

test('installing into a machine with no settings file at all creates one', () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'periplus-')), 'nested', 'settings.json');
  assert.strictEqual(installStatusline(file), 'wired');
  assert.match(JSON.parse(fs.readFileSync(file, 'utf8')).statusLine.command, /periplus-statusline/);
  assert.strictEqual(statuslineNudge(file), '', 'and the nudge stops');
});

test('a status line that is already there is kept, with periplus after it', () => {
  const file = settings(JSON.stringify({
    model: 'opus',
    statusLine: { type: 'command', command: 'bash /x/ponytail-statusline.sh' },
  }));
  assert.strictEqual(installStatusline(file), 'appended');

  const written = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.strictEqual(written.model, 'opus', 'unrelated settings survive the rewrite');
  assert.match(written.statusLine.command, /^bash \/x\/ponytail-statusline\.sh; printf ' '; node /);
  assert.ok(
    written.statusLine.command.indexOf('ponytail') < written.statusLine.command.indexOf('periplus'),
    'periplus goes last, it is the one that reads stdin',
  );
});

test('the file it replaces is kept', () => {
  const before = JSON.stringify({ model: 'opus' });
  const file = settings(before);
  installStatusline(file);
  assert.strictEqual(fs.readFileSync(`${file}.periplus-bak`, 'utf8'), before);
});

test('installing twice does not stack the command', () => {
  const file = settings(JSON.stringify({ statusLine: { type: 'command', command: 'bash /x/y.sh' } }));
  installStatusline(file);
  const once = fs.readFileSync(file, 'utf8');
  assert.strictEqual(installStatusline(file), 'already');
  assert.strictEqual(fs.readFileSync(file, 'utf8'), once);
});

test('malformed settings are backed up rather than parsed into the void', () => {
  const file = settings('{ not json');
  assert.strictEqual(installStatusline(file), 'wired');
  assert.strictEqual(fs.readFileSync(`${file}.periplus-bak`, 'utf8'), '{ not json');
});
