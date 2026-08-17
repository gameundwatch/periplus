#!/usr/bin/env node

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const {
  loadConfig,
  countEntries,
  countPending,
  countUnclassified,
  criteriaTable,
  buildContext,
  readDiscipline,
  readKinds,
  captureRule,
  ensureWorkspace,
  ensureConfig,
  statuslineNudge,
  installStatusline,
  DEFAULT_CRITERIA,
  ROW_RE,
  CAPTURE_PATH,
} = require('./periplus-activate.js');

const TABLE_RE = /<!-- criteria-table:start -->[\s\S]*?<!-- criteria-table:end -->/;

const readClassifier = () =>
  fs.readFileSync(path.join(__dirname, '..', 'skills', 'pp-classify', 'SKILL.md'), 'utf8');

const readResolver = () =>
  fs.readFileSync(path.join(__dirname, '..', 'skills', 'pp-resolve', 'SKILL.md'), 'utf8');

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
  assert.deepStrictEqual(loadConfig(repo({})).criteria, DEFAULT_CRITERIA);
});

test('a valid destination overrides the default', () => {
  const root = repo({
    '.periplus/config.json': JSON.stringify({ criteria: { why: 'code' } }),
  });
  const { criteria } = loadConfig(root);
  assert.strictEqual(criteria.why, 'code');
  assert.strictEqual(criteria.contracts, 'code', 'untouched criteria keep their default');
});

test('invalid values fall back instead of poisoning the discipline', () => {
  const root = repo({
    '.periplus/config.json': JSON.stringify({
      criteria: { why: 'wherever', tautology: null, 'made-up-key': 'code' },
    }),
  });
  const { criteria } = loadConfig(root);
  assert.strictEqual(criteria.why, 'periplus');
  assert.strictEqual(criteria.tautology, 'drop');
  assert.ok(!('made-up-key' in criteria), 'unknown kinds are not admitted');
});

test('a setting that could not be used is named rather than dropped in silence', () => {
  const root = repo({
    '.periplus/config.json': JSON.stringify({
      criteria: { whys: 'code', tautology: 'somewhere' },
    }),
  });
  const { problems } = loadConfig(root);
  assert.ok(problems.some((p) => p.includes('"whys"')), 'a misspelled kind is reported');
  assert.ok(problems.some((p) => p.includes('tautology')), 'an impossible destination is reported');
});

test('criteria is the only key config.json has left', () => {
  const root = repo({
    '.periplus/config.json': JSON.stringify({ criteria: {}, warnThreshold: 3 }),
  });
  assert.deepStrictEqual(loadConfig(root).problems, [], 'a leftover key is ignored, not reported');
});

test('a config that is doing exactly what it says raises nothing', () => {
  const root = repo({ '.periplus/config.json': JSON.stringify({ criteria: { why: 'code' } }) });
  assert.deepStrictEqual(loadConfig(root).problems, []);
});

test('malformed JSON degrades to defaults rather than throwing', () => {
  const root = repo({ '.periplus/config.json': '{ not json' });
  const { criteria, problems } = loadConfig(root);
  assert.deepStrictEqual(criteria, DEFAULT_CRITERIA);
  assert.ok(problems.some((p) => p.includes('not valid JSON')), 'and says so');
});

test('a config missing entirely is repaired, not reported', () => {
  assert.deepStrictEqual(loadConfig(repo({})).problems, []);
});

const row = (created, at, kind, note) => {
  const [file, line] = at.split(':');
  return `${created},${file},${line},${kind},"${note.replace(/"/g, '""')}"`;
};

test('only rows in the shared format are counted', () => {
  const root = repo({
    '.periplus/log.csv': [
      'timestamp,file,line,kind,body',
      '',
      row('2026-07-29T11:03', 'src/a.py:1', 'why', 'first'),
      '  continuation line that is not its own row',
      row('2026-07-30T09:00', 'src/b.py:2', 'upgrade-triggers', 'second'),
      '- 2026-07-29T11:03 `src/c.py:3` [why] the shape before v0.4.0',
      'not a row at all',
      '',
    ].join('\n'),
  });
  assert.strictEqual(countEntries(root), 2);
});

test('a row whose body was quoted wrong is counted rather than hidden', () => {
  const root = repo({
    '.periplus/pre.csv': '2026-07-29T11:03,src/a.py,1,,body with no quotes at all',
  });
  assert.strictEqual(countPending(root), 1);
  assert.strictEqual(countUnclassified(root), 1);
});

test('a body holding commas and quotes does not split the row', () => {
  const root = repo({
    '.periplus/pre.csv': row('2026-07-29T11:03', 'src/a.py:1', '', 'a, b, and a "quoted" bit'),
  });
  assert.strictEqual(countUnclassified(root), 1);
});

test('a row with no line number is still a row', () => {
  const root = repo({ '.periplus/pre.csv': '2026-07-29T11:03,src/a.py,,why,"the line is unknown"' });
  assert.strictEqual(countPending(root), 1);
  assert.strictEqual(countUnclassified(root), 0);
});

test('a missing log counts as zero, not an error', () => {
  assert.strictEqual(countEntries(repo({})), 0);
});

test('undelivered rows are split into unclassified and classified', () => {
  const root = repo({
    '.periplus/pre.csv': [
      row('2026-07-31T10:00', 'src/payments.py:38', '', 'Retry-After は秒しか解釈しない'),
      row('2026-07-31T10:01', 'src/ledger.py:4', '', 'the dict is per process'),
      row('2026-07-31T10:02', 'src/ledger.py:9', 'why', 'classified, and then left here'),
      'a stray line that is not a row',
    ].join('\n'),
  });
  assert.strictEqual(countPending(root), 3);
  assert.strictEqual(countUnclassified(root), 2);

  const context = buildContext(0, countPending(root), countUnclassified(root));
  assert.ok(context.includes('3 row(s)'), 'the total is surfaced');
  assert.ok(context.includes('2 not yet classified'));
  assert.ok(context.includes('1 classified but left in place'), 'the state the split newly allows');
});

test('no warning when nothing is parked', () => {
  assert.ok(!buildContext(0, 0, 0).includes('row(s)'));
});

const hookOutput = (root, event) => execFileSync(
  process.execPath,
  [path.join(__dirname, 'periplus-activate.js'), event],
  { env: { ...process.env, CLAUDE_PROJECT_DIR: root }, encoding: 'utf8' },
);

test('the undelivered warning reaches the session, never a subagent', () => {
  const root = repo({ '.periplus/pre.csv': row('2026-08-02T09:00', 'src/a.py:1', '', 'a note') });
  const session = hookOutput(root, 'SessionStart');
  const subagent = hookOutput(root, 'SubagentStart');

  assert.ok(session.includes('never delivered'));
  assert.ok(!subagent.includes('never delivered'), 'a subagent did not write those rows');
  assert.ok(session.includes('0 in the log') && subagent.includes('0 in the log'), 'both carry the count');
});

test('a long log is reported, never warned about', () => {
  for (const count of [0, 10, 99]) {
    const context = buildContext(count);
    assert.ok(context.startsWith(`PERIPLUS ACTIVE — ${count} in the log\n`));
    assert.ok(!/threshold|stopped draining|pp-discuss/.test(context));
  }
});

test('a repository with a config is not told about it at session start', () => {
  const root = repo({ '.periplus/config.json': JSON.stringify({ criteria: { why: 'periplus' } }) });
  const context = buildContext(countEntries(root));
  assert.ok(!context.includes('config.json'), 'phase 1 never reads a destination');
});

test('the classifier holds the tree and never a destination', () => {
  const skill = readClassifier();
  assert.ok(!TABLE_RE.test(skill), 'the kind table is still in the classifier');
  for (const to of ['**code**', '**periplus**', '**drop**']) {
    assert.ok(!skill.includes(to), `the classifier still names ${to}`);
  }
});

test('the resolved table carries the repository\'s destinations, not the shipped ones', () => {
  const root = repo({
    '.periplus/config.json': JSON.stringify({ criteria: { why: 'code', tautology: 'code' } }),
  });
  const table = criteriaTable(root);
  assert.match(table, /\| `why` \|.*\| \*\*code\*\* \|/);
  assert.match(table, /\| `tautology` \|.*\| \*\*code\*\* \|/);
  assert.match(table, /\| `contracts` \|.*\| \*\*code\*\* \|/, 'untouched kinds keep the default');
  assert.ok(!/\*\*periplus\*\* \| \*\*/.test(table), 'the shipped column is replaced, not doubled');
  assert.ok(!table.includes('<!--'), 'the markers are not part of the output');
});

test('the resolved table is where a useless setting finally becomes visible', () => {
  const root = repo({ '.periplus/config.json': JSON.stringify({ criteria: { whys: 'code' } }) });
  assert.match(criteriaTable(root), /config\.json: unknown kind "whys"/);
});

test('one bad key says so, and says the rest of the file still ran', () => {
  const root = repo({ '.periplus/config.json': JSON.stringify({ criteria: { whys: 'code' } }) });
  assert.match(criteriaTable(root), /that key alone was ignored, the rest of the file was applied/);
});

test('a file that could not be parsed says the whole of it was ignored', () => {
  const root = repo({ '.periplus/config.json': '{ not json' });
  assert.match(criteriaTable(root), /none of it was applied/);
});

test('every kind is a leaf of the tree', () => {
  const tree = readClassifier().match(/```mermaid[\s\S]*?```/)[0];
  for (const name of Object.keys(DEFAULT_CRITERIA)) {
    assert.ok(tree.includes(`[${name}]`), `${name} is on no branch`);
  }
});

test('the descriptions of the kinds live in one place only', () => {
  const source = fs.readFileSync(path.join(__dirname, 'periplus-activate.js'), 'utf8');
  assert.ok(!source.includes('a browser quirk'), 'the wording is substituted into, never restated');
});

test('the README renders every kind, pointed where it ships pointed', () => {
  const readme = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8');
  for (const [kind, to] of Object.entries(DEFAULT_CRITERIA)) {
    assert.match(readme, new RegExp(`\\| \`${kind}\` \\|[^\\n]*\\| \\*\\*${to}\\*\\* \\|`),
      `README is missing ${kind} → ${to}`);
  }
  const rows = readme.match(/^\| `[a-z-]+` \|/gm) || [];
  assert.strictEqual(rows.length, Object.keys(DEFAULT_CRITERIA).length,
    'and renders nothing that is not a kind');
});

test('phase 2 is told not to translate on the way out', () => {
  assert.ok(readResolver().includes('do not translate it'));
});

test('/pp names phase 2 and nothing else', () => {
  const stages = readDiscipline()
    .split('\n')
    .filter((line) => /^\d+\.\s/.test(line))
    .map((line) => line.replace(/^\d+\.\s*/, '').trim());
  assert.deepStrictEqual(stages, ['`/pp-classify`', '`/pp-resolve`']);
});

test('the injected capture rule is the whole of the file it comes from', () => {
  const delivered = buildContext(3);
  const file = fs.readFileSync(CAPTURE_PATH, 'utf8').replace(/^---[\s\S]*?---\s*/, '');
  assert.ok(delivered.includes(captureRule()));
  assert.strictEqual(file.trimEnd(), captureRule(), 'nothing below the frontmatter goes uninjected');
});

test('no other file restates the capture rule', () => {
  const root = path.join(__dirname, '..');
  const opener = captureRule().split('\n')[0];
  for (const rel of NO_CAPTURE_COPY) {
    const text = fs.readFileSync(path.join(root, rel), 'utf8');
    assert.ok(!text.includes(opener), `${rel} carries a second copy of the capture rule`);
  }
});

test('session start carries the capture rule only, not the filter machinery', () => {
  const delivered = buildContext(0);
  assert.ok(delivered.includes('.periplus/pre.csv'), 'the capture rule is present');
  assert.ok(delivered.includes('invoke `/pp`'), 'phase 2 is pointed at, not inlined');
  assert.ok(!TABLE_RE.test(delivered), 'the kind table is not injected');
  assert.ok(!delivered.includes('rejected-alternatives'), 'no kind names leak in');
});

test('capture is told to split before writing the row, not after', () => {
  const rule = captureRule();
  assert.ok(rule.includes('One note per line, one thing per note'));
  assert.ok(rule.includes(',,"'), 'the kind is left empty at capture');
  assert.ok(!rule.includes('→'), 'one timestamp, not two');
});

const TEMPLATE_FILES = [
  'README.md',
  'skills/pp-classify/SKILL.md',
  'skills/pp-resolve/SKILL.md',
  'skills/pp-refactor/SKILL.md',
];

const NO_CAPTURE_COPY = [...TEMPLATE_FILES, 'skills/pp/SKILL.md'];

const fill = (template) => template
  .replace('<timestamp>', '2026-07-31T14:22')
  .replace('<file>', 'hooks/x.js')
  .replace('<line>', '88')
  .replace('<kind>', 'why')
  .replace(/<[^>]*>/g, 'a note about ""seconds"", and commas');

const templatesIn = (text) => text.split('\n').filter((line) => line.startsWith('<timestamp>,'));

test('every format template that ships is a row the hook counts as the template says', () => {
  const root = path.join(__dirname, '..');

  for (const rel of TEMPLATE_FILES) {
    const templates = templatesIn(fs.readFileSync(path.join(root, rel), 'utf8'));
    assert.ok(templates.length > 0, `${rel} states no row format`);

    for (const template of templates) {
      const filled = fill(template);
      assert.match(filled, ROW_RE, `${rel}: the hook does not count "${template}"`);
      assert.strictEqual(
        filled.match(ROW_RE)[1],
        template.includes('<kind>') ? 'why' : '',
        `${rel}: the hook reads a different field as the kind than "${template}" states`,
      );
    }
  }
});

test('the injected capture template leaves the kind for phase 2 to fill', () => {
  const [template, ...rest] = templatesIn(captureRule());
  assert.deepStrictEqual(rest, [], 'capture states the format once');
  assert.strictEqual(fill(template).match(ROW_RE)[1], '');
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
  const root = repo({ '.git/HEAD': 'x', '.gitignore': 'node_modules/\n', '.periplus/log.csv': '' });
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

test('the shipped table holds exactly the kinds the hook knows destinations for', () => {
  const table = readKinds().match(TABLE_RE)[0];
  for (const name of Object.keys(DEFAULT_CRITERIA)) {
    assert.ok(new RegExp(`\\| \`${name}\` \\|`).test(table), `${name} is missing from the table`);
  }
  const rows = table.match(/^\| `[a-z-]+` \|/gm) || [];
  assert.strictEqual(rows.length, Object.keys(DEFAULT_CRITERIA).length,
    'and nothing the hook cannot resolve');
});

test('the config is written when it is missing, whatever the workspace looks like', () => {
  const root = repo({ '.periplus/log.csv': '' });
  ensureConfig(root);
  const written = JSON.parse(fs.readFileSync(path.join(root, '.periplus/config.json'), 'utf8'));
  assert.deepStrictEqual(written.criteria, DEFAULT_CRITERIA, 'every kind, so it can be read alone');
});

test('a config that already answers for every kind is left byte for byte', () => {
  const mine = `${JSON.stringify({ criteria: { ...DEFAULT_CRITERIA, why: 'code' } })}`;
  const root = repo({ '.periplus/config.json': mine });
  ensureConfig(root);
  assert.strictEqual(fs.readFileSync(path.join(root, '.periplus/config.json'), 'utf8'), mine);
});

test('a kind the config has never heard of is added at its default', () => {
  const root = repo({
    '.periplus/config.json': JSON.stringify({ criteria: { why: 'code', 'doc-references': 'code' } }),
  });
  ensureConfig(root);
  const { criteria } = JSON.parse(fs.readFileSync(path.join(root, '.periplus/config.json'), 'utf8'));
  assert.strictEqual(criteria.why, 'code', 'a value the user chose is not touched');
  assert.strictEqual(criteria['doc-references'], 'code', 'and neither is one that is no longer a kind');
  assert.strictEqual(criteria['undocumented-design'], DEFAULT_CRITERIA['undocumented-design']);
  assert.strictEqual(criteria['doc-restatement'], DEFAULT_CRITERIA['doc-restatement']);
});

test('adding a kind at its default changes nothing about how the config reads', () => {
  const before = loadConfig(repo({
    '.periplus/config.json': JSON.stringify({ criteria: { why: 'code' } }),
  }));
  const root = repo({ '.periplus/config.json': JSON.stringify({ criteria: { why: 'code' } }) });
  ensureConfig(root);
  assert.deepStrictEqual(loadConfig(root).criteria, before.criteria);
});

test('a config nobody can parse is left for its owner rather than rewritten', () => {
  const mine = '{ not json';
  const root = repo({ '.periplus/config.json': mine });
  ensureConfig(root);
  assert.strictEqual(fs.readFileSync(path.join(root, '.periplus/config.json'), 'utf8'), mine);
});

test('keys that are not criteria survive the repair', () => {
  const root = repo({ '.periplus/config.json': JSON.stringify({ note: 'mine', criteria: {} }) });
  ensureConfig(root);
  const written = JSON.parse(fs.readFileSync(path.join(root, '.periplus/config.json'), 'utf8'));
  assert.strictEqual(written.note, 'mine');
  assert.deepStrictEqual(written.criteria, DEFAULT_CRITERIA);
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
