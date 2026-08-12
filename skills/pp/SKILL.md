---
name: pp
description: >
  Keep implementation-time notes out of the source until the code is finished.
  Comments are captured to `.periplus/pre.csv` while you work, then filtered once
  at the end into the source, into `.periplus/log.csv`, or nowhere. Invoke as /pp,
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

## Phase 1 — capture

<!-- always:start -->
ACTIVE EVERY RESPONSE, in every file, including tests and configuration. Still
active if you are unsure — an uncertain note is captured like any other and
decided at the end. Off only when the user says so.

The trigger is writing code, not the arrival of a sentence.

Every time you are about to write a comment, append it to `.periplus/pre.csv`
instead, creating the file on the first note. No header row. The directory is
already there and already ignored — do not touch `.gitignore`.

```
<timestamp>,<file>,<line>,,"<the note, as it occurred to you>"
```

The timestamp is ISO 8601 to the minute. The fourth field is the kind, which
phase 2 fills in — leave it empty. The note is always quoted, whatever is in it,
and a `"` inside it is doubled to `""`.

**One note per line, one thing per note.** A note joined by a contrast or a plain
"and" is two notes and goes on two lines: *it used to be synchronous, but
timeouts made it async* is *it used to be synchronous* and *timeouts made it
async*. A note joined by a cause is one note and stays whole: *it is async
because timeouts were frequent* says one thing.

Otherwise write it as it came to you. Do not shorten it, do not decide where it
belongs, and do not skip the ones that already look worthless. Docstrings go
here too.

Nothing is written into the source in this phase. Not one line.

**The task is not finished while `.periplus/pre.csv` has rows in it.** Before
calling any piece of work done, invoke `/pp` and run phase 2 over what you
captured.

When you call a coding task done, say which of the two it was —
`periplus: 3 filtered`, or `periplus: nothing captured`.
<!-- always:end -->
<!-- A rule outside these markers reaches the model only when /pp is invoked,
     which is phase 2. Anything phase 1 has to obey belongs inside them. -->

## Phase 2 — filter

Two commands, in order:

1. **`/pp-classify`** — split what is not yet atomic, and give each row exactly
   one kind. Writes nothing outside `pre.csv`.
2. **`/pp-resolve`** — look the destination up from the kind, deliver each row,
   and drain `pre.csv`.

`/pp` is both, run back to back, and is what to reach for by default. Splitting
the run and stopping after the first half leaves the source with no comments at
all.

## Kinds

Exactly one per row. The set is closed: a note that seems to need a fourteenth
kind is a note that has not been split far enough.

This table names the kinds. It does not say where any of them goes: that is
`.periplus/config.json`, which `/pp-resolve` reads and this file never restates.

<!-- criteria-table:start -->
| kind | which is |
| --- | --- |
| `external-facts` | a fact about the world outside the code that the code depends on — a browser quirk, the target device, the expected user, an external API limit |
| `contracts` | an obligation on the caller that the signature and the types do not express |
| `current-limits` | what this implementation does not do or cannot do yet, which reads as an oversight without it |
| `block-headings` | a heading that labels the block of code below it |
| `undocumented-design` | the reasoning behind a design the design settled, which none of this repository's documents records |
| `unspecified-choices` | a value or a shape the design did not specify, chosen at the implementer's discretion — the reason for it is in neither the code nor the design |
| `why` | the reasoning behind a design or an approach |
| `rejected-alternatives` | an option that was considered and turned down |
| `upgrade-triggers` | the condition under which this implementation should be revisited |
| `tautology` | a restatement of what the code already shows — including a docstring summary naming what the function does |
| `doc-restatement` | a claim one of this repository's existing documents already makes — a pointer to that document included |
| `history` | the story of how the code got here, or what it used to be |
| `test-intent` | what a test is checking — describe/it already says it |
<!-- criteria-table:end -->

`current-limits` and `upgrade-triggers` most often arrive as one note. A limit is
a property of the code as it stands; the intention to lift it some day is a plan.
Split on that line — what is true of the code now, against what is to be done
later.

## The order the kinds are read in

Read from the top and stop at the first that holds.

```
1. it would let the next reader break the code if it went missing
                       → external-facts / contracts / current-limits
2. the code in front of you already shows it        → tautology
3. a document and a line in it can be named         → doc-restatement
4. the design settled it and no document records it → undocumented-design
5. the design demonstrably did not settle it        → unspecified-choices
6. a reason, and neither 4 nor 5 can be shown       → why
```

1 comes before 3 whatever the documents say. `why` is the residual.

### What counts as a document, for 3

Only what this repository keeps in a durable form. **The session does not count.**
A reason someone gave in conversation is a reason no document records, which is 4.

Name the document and the line. Then check that the line makes the same claim —
**a line that says something else is not a restatement**, and a note that
contradicts a stale document belongs at 4 or 6.

### What counts as settled, for 4 and 5

Read the documents this repository keeps, then the code. `/pp` can also settle it
from the session it is running in. `/pp-refactor` reads the design documents in
its place, named at its scope step.

**What the design documents do not settle, the implementation settled** — 5, not
6. 4 is what they settle and record no reason for.

3 searches every document this repository keeps. Only the design documents answer
4 and 5.

## Keep the language it was captured in

A note reaches its destination in the language you wrote it in phase 1. Filtering
routes a note and shortens it; it does not translate it.

This holds even when the surrounding file's comments are in another language. A
note that arrives in a different language from the code around it is a mismatch
to name to the user, who can then say which language the file should settle on.

## The files share one format

```
<timestamp>,<file>,<line>,<kind>,"<the note>"
```

No header row. The note is always quoted whatever is in it, a `"` inside it is
doubled to `""`, and it holds no newline.

| file | what is in it | how a row leaves |
| --- | --- | --- |
| `.periplus/pre.csv` | rows that have not been delivered | `/pp-resolve` |
| `.periplus/log.csv` | rows sent to the `periplus` destination | `/pp-discuss` |
| `.periplus/all.csv` | every row that was captured while writing code | it does not leave |
| `.periplus/swept.csv` | every row `/pp-refactor` cut out of existing code | it does not leave |
