---
name: pp
description: >
  Keep implementation-time notes out of the source until the code is finished.
  Comments are captured to `.periplus/.pre.md` while you work, then filtered once
  at the end into the source, into `.periplus/.log.md`, or nowhere. Invoke as /pp,
  which runs /pp-classify and then /pp-resolve. Use it on any coding task where
  you would otherwise be writing comments — and whenever the user says "periplus",
  "stop commenting everything", "the code is turning into documentation", "keep a
  logbook", or complains about tautological comments, back-references to ADRs, or
  design rationale buried in the source. The plugin's session hook normally
  applies this automatically; invoke it explicitly when the hook is not active, in
  a subagent that did not inherit it, or when the user asks for it by name.
---

# Periplus

Two phases. While the code is being written you only capture. When the code is
finished you filter, once, with the finished thing in front of you.

Deciding where a note belongs while still writing is deciding without the
evidence. Much of what seems to need saying mid-implementation is answered by the
code you have not written yet — a value gets a name, a branch gets extracted, a
shape settles — and the note that felt necessary an hour ago turns out to
restate something the finished code shows plainly. Capturing first and filtering
last is what lets the code answer for itself.

## Phase 1 — capture

<!-- always:start -->
ACTIVE EVERY RESPONSE, in every file, including tests and configuration. Still
active if you are unsure — an uncertain note is captured like any other and
decided at the end. Off only when the user says so.

The trigger is writing code, not the arrival of a sentence. Before you create or
edit a source file, this task's notes already have their destination: by the time
a comment is forming in the line you are typing, the decision has been made, and
made wrong.

Every time you are about to write a comment, append it to `.periplus/.pre.md`
instead, creating the file on the first note. The directory is already there and
already ignored — do not touch `.gitignore`.

```
- <created> → <updated> `<file>:<line>` [] <the note, as it occurred to you>
```

Both timestamps are ISO 8601 to the minute and identical at capture. `[]` is the
kind, which phase 2 fills in — leave it empty.

**One note per line, one thing per note.** A note joined by a contrast or a plain
"and" is two notes and goes on two lines: *it used to be synchronous, but
timeouts made it async* is *it used to be synchronous* and *timeouts made it
async*. A note joined by a cause is one note and stays whole: *it is async
because timeouts were frequent* says one thing.

Otherwise write it as it came to you. Do not shorten it, do not decide where it
belongs, and do not skip the ones that already look worthless — judging them
costs the attention you are meant to be spending on the code, and the filter will
catch them in a moment anyway. Docstrings count: they are comments with better
punctuation, and they go here too.

Nothing is written into the source in this phase. Not one line.

**The task is not finished while `.periplus/.pre.md` has rows in it.** Before
calling any piece of work done, invoke `/pp` and run phase 2 over what you
captured. Skipping it leaves the code with no comments at all, which is a worse
outcome than the noise this discipline exists to remove.

An empty `.pre.md` is not evidence the discipline ran. It is equally what a task
that never captured anything leaves behind, and that failure writes nothing into
the diff for anyone to catch later. So emptiness is not the report: when you call
a coding task done, say which of the two it was — `periplus: 3 filtered`, or
`periplus: nothing captured`. Saying the second is not a confession. Leaving it
indistinguishable from the first is how this discipline dies quietly.
<!-- always:end -->
<!-- A rule outside these markers reaches the model only when /pp is invoked,
     which is phase 2. Anything phase 1 has to obey belongs inside them. -->

## Phase 2 — filter

Two commands, in order:

1. **`/pp-classify`** — split what is not yet atomic, and give each row exactly
   one kind. Writes nothing outside `.pre.md`.
2. **`/pp-resolve`** — look the destination up from the kind, deliver each row,
   and drain `.pre.md`.

`/pp` is both, run back to back, and is what to reach for by default. The halves
exist for the case where the kinds are worth reviewing before anything is
written. Splitting the run and stopping after the first half leaves the source
with no comments at all, which is the outcome this discipline exists to prevent.

## Kinds

Exactly one per row. The set is closed: a note that seems to need a twelfth kind
is a note that has not been split far enough.

The destinations below are the shipped defaults, not the authority. A repository
can move any kind with `.periplus/config.json`, and `/pp-resolve` reads the
resolved table rather than this one.

<!-- criteria-table:start -->
| kind | which is | it goes to |
| --- | --- | --- |
| `external-facts` | a fact about the world outside the code that the code depends on — a browser quirk, the target device, the expected user, an external API limit | **code** |
| `contracts` | an obligation on the caller that the signature and the types do not express | **code** |
| `current-limits` | what this implementation does not do or cannot do yet, which reads as an oversight without it | **code** |
| `why` | the reasoning behind a design or an approach | **code** |
| `rejected-alternatives` | an option that was considered and turned down | **periplus** |
| `upgrade-triggers` | the condition under which this implementation should be revisited | **periplus** |
| `block-headings` | a heading that labels the block of code below it | **drop** |
| `tautology` | a restatement of what the code already shows — including a docstring summary naming what the function does | **drop** |
| `doc-references` | a pointer to an ADR or another document | **drop** |
| `history` | the story of how the code got here, or what it used to be | **drop** |
| `test-intent` | what a test is checking — describe/it already says it | **drop** |
<!-- criteria-table:end -->

**code** — write it into the source, as the shortest statement of the fact rather
than an account of how the code works. The reader can see the code; what they
cannot see is the world outside it.

**periplus** — move it to `.periplus/.log.md`. `/pp-discuss` works through what
is waiting there.

**drop** — write it nowhere. Everything routed here by default is recoverable
from the code, from `git log`, or from an existing ADR, so keeping it would
create a second source that can go out of date on its own.

`current-limits` and `upgrade-triggers` are the pair that most often arrive as
one note, and the split matters most there. A limit is a property of the code as
it stands and belongs beside it; the intention to lift that limit some day is a
plan, and belongs in the log. Read the source alone and you should learn what the
code does and does not handle. Read the log alone and you should learn what to do
about it one day. Sending the whole note to either destination costs you one of
those two readings.

## Keep the language it was captured in

A note reaches its destination in the language you wrote it in phase 1. Filtering
routes a note and shortens it; it does not translate it. The note was written in
whatever language you were thinking in at the moment the code raised the question,
and that is the wording that holds the distinction the note was made to hold —
translation is a rewrite performed with the original no longer in front of you,
and once it is written nothing marks it as second-hand.

This holds even when the surrounding file's comments are in another language. A
note that arrives in a different language from the code around it is a mismatch
worth naming to the user, who can then say which language the file should settle
on. It is not licence to translate quietly.

## The files share one format

```
- <created> → <updated> `<file>:<line>` [<kind>] <the note>
```

| file | what is in it | how a row leaves |
| --- | --- | --- |
| `.periplus/.pre.md` | rows that have not been delivered | `/pp-resolve` |
| `.periplus/.log.md` | rows whose kind sent them to periplus | docs, code, or trash |
| `.periplus/.all.md` | every row that was captured while writing code | it does not leave |
| `.periplus/.swept.md` | every row `/pp-refactor` cut out of existing code | it does not leave |

Which file a row is in is what says how far it has got, so the row itself does
not have to carry that. Neither does it carry its destination: that is the kind
and the config, and a copy of it here would be a second source able to disagree
with them. The same goes for where a row came from — the two archives are two
populations, and which file a row lands in is what tells them apart.

`.log.md` is a state, not an archive. It holds notes that have not reached their
destination. What lands here is document material — the two kinds that route here
are neither of them facts the code depends on — so `docs` is the main road out:

- **docs** — it goes into a document this repository already keeps
- **code** — part of it belongs in the source after all, which means it was not
  split far enough upstream
- **trash** — it is recoverable from somewhere else
- **here** — it belongs in a document and this repository keeps none that holds
  it. It stays, and that is its trigger: it leaves when such a document exists

A log that stays near-empty is working. A log that grows means entries are not
being resolved, which is why the pending count is reported at every session start.
An entry naming no condition under which it would leave is permanent inventory in
a place meant to be temporary; `/pp-discuss` does not let one pass unchanged.

The two archives are the exception to that rule, and it is deliberate: they are
the only record of which kinds are actually being written, and they are what makes
the discipline measurable rather than merely asserted. Nothing reads them during a
run. They are kept apart because they answer different questions — `.all.md` is
what this discipline produces, `.swept.md` is what was written without it.

## Commands

- `/pp-classify` — split and assign kinds. Writes only `.pre.md`.
- `/pp-resolve` — deliver each row and drain `.pre.md`.
- `/pp-discuss` — work through the pending log entries one at a time and send
  each to its destination.
- `/pp-refactor` — the same discipline pointed at comments that already exist. It
  cuts them out of the source first, so it is destructive where `/pp` is not.

## Configuration

Configure per repository in `.periplus/config.json`: any kind can be sent to
`code`, `periplus`, or `drop`, and `warnThreshold` sets the pending count that
triggers the session-start warning. The set of kinds is not configurable.
`.periplus/` is not tracked, so a shared config is copied in by hand.
