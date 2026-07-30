---
name: pp
description: >
  Keep implementation-time notes out of the source until the code is finished.
  Comments are captured to `.periplus/pre.md` while you work, then filtered once
  at the end into the source, into `.periplus/log.md`, or nowhere. Invoke as /pp.
  Use it on any coding task where you would otherwise be writing comments — and
  whenever the user says "periplus", "stop commenting everything", "the code is
  turning into documentation", "keep a logbook", or complains about tautological
  comments, back-references to ADRs, or design rationale buried in the source.
  The plugin's session hook normally applies this automatically; invoke it
  explicitly when the hook is not active, in a subagent that did not inherit it,
  or when the user asks for it by name.
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
Every time you are about to write a comment, append it to `.periplus/pre.md`
instead, creating the file on the first note. The directory is already there and
already ignored — do not touch `.gitignore`.

```
- <file>:<line> <the note, as it occurred to you>
```

Write it as it came to you. Do not shorten it, do not decide where it belongs,
and do not skip the ones that already look worthless — judging them costs the
attention you are meant to be spending on the code, and the filter will catch
them in a moment anyway. Docstrings count: they are comments with better
punctuation, and they go here too.

Nothing is written into the source in this phase. Not one line.

**The task is not finished while `.periplus/pre.md` has entries in it.** Before
calling any piece of work done, invoke `/pp` and run phase 2 over what you
captured. Skipping it leaves the code with no comments at all, which is a worse
outcome than the noise this discipline exists to remove — treat an empty
`pre.md` as part of what "done" means, alongside passing tests.
<!-- always:end -->

## Phase 2 — filter

Take the entries one at a time, in order.

### Can the code say it instead?

A comment is what is left when the code cannot carry the fact itself. Try making
the code say it and see whether the note disappears:

- a number that needs explaining wants a name
- a block that wants a heading wants extracting into a function
- a condition that wants explaining wants a named predicate
- an invariant that wants stating wants an assertion or a test

This is the step that keeps a source file from filling with prose, and the easy
one to skip, because writing the sentence is faster than changing the code.

### Split it

A note is usually two things at once. Route the halves separately, or the smaller
half is carried off to a destination that was never meant for it:

- **what is true of the code right now** — a limit it has, a condition it relies on, an obligation it places on callers, the reason it took this shape
- **what should happen later** — a condition to revisit under, an alternative that was turned down, the story of how it got here

### Route each part

If `.periplus/config.json` exists, read it first: any criterion set there
overrides the destination in this table for this repository, and `capture` may
change how phase 1 collected the notes you are holding.

<!-- criteria-table:start -->
| the part you are holding | which is | it goes to |
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

**periplus** — move it to `.periplus/log.md` in the entry format below. `/pp-list`
reports what is waiting there.

**drop** — write it nowhere. Everything here is recoverable from the code, from
`git log`, or from an existing ADR, so keeping it would create a second source
that can go out of date on its own.

Then delete the entry from `.periplus/pre.md`.

`current-limits` and `upgrade-triggers` are the pair that most often arrive as one
note, and the split matters most there. A limit is a property of the code as it
stands and belongs beside it; the intention to lift that limit some day is a
plan, and belongs in the log. Read the source alone and you should learn what the
code does and does not handle. Read the log alone and you should learn what to do
about it one day. Sending the whole note to either destination costs you one of
those two readings.

## `.periplus/log.md` is a state, not an archive

It holds notes that have not reached their destination. Every entry leaves it
eventually, by one of three exits:

- **pick** — part of it belongs in the source after all
- **promote** — it carries the weight of an architecture decision and becomes an ADR under `docs/adr/`
- **discard** — it is recoverable from somewhere else

A log that stays near-empty is working. A log that grows means entries are not
being resolved, which is why the pending count is reported at every session start.

Entry format, one per line:

```
- <ISO 8601 to the minute> `<file>:<line>` [<criterion>] <the note, including the condition under which it leaves>
```

An entry naming no such condition is permanent inventory in a place meant to be
temporary; `/pp-list` tags those `no-trigger`.

## Commands

- `/pp-list` — list pending log entries with their proposed exits. Read-only.
- `/pp-discussion` — work through them one at a time and carry out the exits.
- `/pp-refactor` — run these same two phases over comments that already exist.

## Persistence

ACTIVE EVERY RESPONSE. Phase 1 runs on every comment you are about to write, in
every file, including tests and configuration. Phase 2 runs before you call the
task done. Still active if you are unsure — an uncertain note is captured like
any other and decided at the end.

Configure per repository in `.periplus/config.json`: any criterion can be set to
`code`, `periplus`, or `drop`, and `warnThreshold` sets the pending count that
triggers the session-start warning. `.periplus/` is not tracked, so a shared
config is copied in by hand.
