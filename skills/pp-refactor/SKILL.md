---
name: pp-refactor
description: >
  Apply the periplus criteria to comments that already exist, instead of to a
  comment about to be written. Reads the comments out of a named file or
  directory into `.periplus/.pre.md`, then runs the same filter `/pp` uses, so
  what survives goes back into the source and the rest becomes log entries or
  nothing. Invoked as /pp-refactor. Use it when the user asks to clean up
  comments in existing code, points at a file that has turned into
  documentation, or adopts periplus in a codebase that predates it. Changes
  files, one at a time, each with the user's agreement.
---

`/pp` is the same two phases pointed at code being written. This one points them
at code that already exists: phase 1 collects the comments that are there instead
of the ones about to be typed, and phase 2 is unchanged.

Read `skills/pp/SKILL.md` for phase 2 — the criteria, the split, and the
can-the-code-say-it step are defined there and are not restated here. If the two
ever disagree, `/pp` is right.

## Scope first

Ask what to work on, or use what the user named: a file, a directory, the files
in a diff. Never take the whole repository on your own initiative. A comment
sweep touches every file it reaches, and the review burden lands on someone who
only asked about one module.

Say how many files and how many comments are in scope before starting. If that
number is large, propose a smaller first pass — one file is enough to find out
whether the user agrees with your judgement, and disagreeing after fifty files
have changed is expensive for both of you.

## Phase 1 — collect, and change nothing

Copy every comment and docstring in scope into `.periplus/.pre.md`:

```
- <file>:<line> <the comment, verbatim>
```

**Leave the source untouched.** This differs from `/pp`, where phase 1 captures
notes that do not exist yet and nothing can be lost. Here the comments are real,
and a session that ends between the phases would take them with it. Nothing is
removed from a file until its replacement is decided.

Collect them all, including the ones that obviously belong where they are.
Judging during collection costs the attention phase 2 needs, and an unfiltered
list is what makes the before-and-after reviewable.

## Phase 2 — filter, then rewrite one file at a time

Run the filter from `skills/pp/SKILL.md` over the collected entries. The three
destinations mean the same things, with one addition: a comment routed to `code`
may already be in the right place and in the right form, in which case it stays
untouched and its entry is simply removed from `.pre.md`.

Then, per file:

1. Show the diff — comments removed, comments rewritten shorter, comments left alone.
2. Show the log entries that file produced.
3. Ask, and wait before writing.
4. Once the file is written, delete that file's entries from `.pre.md` before
   moving to the next one.

Draining per file is what keeps the invariant checkable: at every Ask, what is
left in `.pre.md` is exactly the files not yet agreed. Drain only at the end and
a run that stops halfway is indistinguishable from one that never started.

One file per agreement. The `/pp-discussion` evaluation is the reason: told to
resolve a batch on one confirmation, an agent will edit several files before the
user sees anything, and the entries a user would have argued about are exactly
the ones a batch waves through.

A file whose comments all survive unchanged is a normal outcome. Say so and move
on rather than finding something to cut.

## Boundaries

Never delete a comment that has not passed through `.periplus/.pre.md` — the file
is the record of what was removed and why, and without it a sweep is
indistinguishable from a mistake. Never rewrite code in the process: extracting a
function to retire a heading comment is a suggestion for the user, not something
to do while they are reviewing comment diffs.

**`.pre.md` must be empty before this is over.** Entries in it are comments in
flight: lifted out of the source in phase 1 and not yet put anywhere. Unlike
`/pp`, where an unfiltered entry only costs a note that was never written, here
every entry is a comment that exists in a file and has had its fate left
undecided, so the collection has to be accounted for even when the sweep is
abandoned.

Stopping early is allowed; stopping with entries left is not. When the user says
stop, or declines a file, or the scope turns out to be too large, the remaining
entries are resolved in one of two ways before you report done: route them
through phase 2 as usual, or say plainly that they are being dropped uninspected
and delete them once the user agrees. Nothing was removed from the source, so
dropping them loses only the collection work — but it is the user's call, and it
is not the same outcome as a finished sweep.

Report what moved, and report the file's state so emptiness is a claim rather
than an assumption:
`<N> kept, <M> shortened, <K> removed, <L> logged, across <F> files. .pre.md empty.`
If it is not empty, that count is the report: `<R> entries still in .pre.md` —
and the sweep is not done.
