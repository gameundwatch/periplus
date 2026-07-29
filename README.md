# periplus

A ship's log for implementation-time decisions.

Coding agents write comments faster than anyone reads them, and the codebase ends
up documenting itself: tautologies, back-references to ADRs, migration stories,
and plans for later all competing with the code. Periplus works in two phases —
while the code is being written every comment is captured to `.periplus/pre.md`
untouched, and once the code is finished they are filtered in one pass into the
source, into the log, or nowhere.

Deciding mid-implementation is deciding without the evidence: a note explaining
where `0.2` came from is obviously unnecessary once the constant ends up named,
but at the moment you wanted to write it the constant did not exist yet.

The effect is not fewer comments — measured against an undisciplined baseline the
count comes out about the same. The effect is that the source carries only what is
true of the code now, while what should happen later moves to a queue that has to
be drained.

The log is a **state**, not an archive. Entries leave it by being picked into the
source, promoted to an ADR, or discarded. A log that stays near-empty is working;
a log that grows is the signal that nothing is being resolved, which is why the
pending count is reported at every session start.

## Install

```
/plugin marketplace add gameundwatch/periplus
/plugin install periplus@periplus
```

Requires `node`. The discipline is injected at `SessionStart` and `SubagentStart`
in every repository, with no opt-in: writing code is the trigger, so there is no
flag to set and no per-repository enabling step. On first sight of a repository
the hook creates `.periplus/` and adds it to `.gitignore` — an empty directory is
how you can tell the discipline is live before anything has been captured into
it. The files inside are created lazily, on the first note and the first entry.

## Commands

- `/pp` — the discipline itself, applied on demand: capture while implementing,
  filter when the code is done. The session hook normally does this for you;
  invoke it when the hook is not active, in a subagent that did not inherit it,
  or to re-anchor mid-session.
- `/pp-list` — list pending entries with the exit each is heading for. Read-only.
- `/pp-discussion` — work through them one at a time and carry out the exits.
- `/pp-refactor` — the same two phases pointed at comments that already exist:
  collect them into `pre.md`, filter, write each file back with agreement.

`skills/pp/SKILL.md` is the single source of the discipline. The hook reads that
file, substitutes the repository's criteria, and injects it, so `/pp` and the
session hook cannot drift apart — a test asserts they stay identical.

## Configuration

Optional, per repository, at `.periplus/config.json`. Absent or malformed fields
fall back to the defaults below.

```json
{
  "criteria": {
    "external-facts": "code",
    "contracts": "code",
    "current-limits": "code",
    "why": "code",
    "rejected-alternatives": "periplus",
    "upgrade-triggers": "periplus",
    "block-headings": "drop",
    "tautology": "drop",
    "doc-references": "drop",
    "history": "drop",
    "test-intent": "drop"
  },
  "warnThreshold": 10
}
```

Each criterion takes `code`, `periplus`, or `drop`. `warnThreshold` is the
pending count above which the session-start line turns into a warning.

`.periplus/` is not tracked, `config.json` included: the directory holds working
state, and a comment convention a team has agreed on is shared by copying the
file in, the same way a local tool config is. The plugin never writes
`config.json` itself, so a repository that has not set one always tracks the
shipped defaults rather than a snapshot of them.

Only the phase 1 rule is injected at session start, about 300 tokens. The
criteria table and the filter steps are read when `/pp` is invoked for phase 2.

Everything routed to `drop` is recoverable from the code, from `git log`, or from
an existing ADR, so writing it anywhere would create a second source that can go
out of date on its own.

## Files

- `CONTEXT.md` — the vocabulary: pre-comment, pick, promote, discard, and the
  criteria they operate on.
- `docs/motivation.md` — the problem this was written for, as originally stated.
- `docs/adr/` — why the plugin is shaped this way, including two decisions that
  were measured and reversed.
- `evals/` — how the numbers above were measured, and what to re-run.

## Cost

Measured across two coding tasks, against the same tasks run without it:
**1.17x and 1.37x the tokens**. About 300 of that is the session-start injection;
the rest is the capture-and-filter work itself, which is what the discipline is.

A cheaper variant was tried and removed — writing comments inline and sweeping
them into `pre.md` before phase 2. It measured *more* expensive (1.35x and 1.62x),
because reading comments back out of the source adds a round trip rather than
removing one, and it produced fewer log entries: a sweep only finds what someone
was willing to commit to the source.

## Tests

```
node --test hooks/periplus-activate.test.js
```
