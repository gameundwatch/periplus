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
    '.periplus/log.md': [
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
    '.periplus/pre.md': [
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

test('the injected capture rule is lifted verbatim from the skill', () => {
  const delivered = buildContext(DEFAULT_CRITERIA, 3, 10);
  assert.ok(delivered.includes(alwaysSection()));
  assert.ok(readDiscipline().includes(alwaysSection()));
});

test('session start carries the capture rule only, not the filter machinery', () => {
  const delivered = buildContext(DEFAULT_CRITERIA, 0, 10);
  assert.ok(delivered.includes('.periplus/pre.md'), 'the capture rule is present');
  assert.ok(delivered.includes('invoke `/pp`'), 'phase 2 is pointed at, not inlined');
  assert.ok(!TABLE_RE.test(delivered), 'the criteria table is not injected');
  assert.ok(!delivered.includes('rejected-alternatives'), 'no criterion names leak in');
  assert.ok(
    delivered.length * 3 < readDiscipline().length,
    `injected ${delivered.length} chars against a ${readDiscipline().length} char skill`,
  );
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
