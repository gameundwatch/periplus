---
name: pp-resolve
description: >
  Deliver every classified pre-comment to the destination its kind resolves to,
  and drain `.periplus/.pre.md`. Invoked as /pp-resolve, and the second half of
  /pp. Writes source files, `.periplus/.log.md`, and `.periplus/.all.md`. Use it
  after /pp-classify; /pp runs both.
---

The second half of phase 2. Every row carrying a kind leaves `.pre.md` here, and
`.pre.md` is empty when this is over.

Where a kind goes is a lookup, not a judgement. The judgement was made by
`/pp-classify` when it named the kind, and it is not made again here.

## Resolve the table first

Run, from the plugin's own directory:

```
node <this skill's directory>/../../hooks/periplus-activate.js criteria
```

It prints the kind table with this repository's `.periplus/config.json` applied,
and it names any setting it could not use. Report those lines to the user
verbatim — a misspelled kind in a config file is silently doing nothing, and this
is the only place it becomes visible.

If the command cannot be run, fall back to the shipped table in
`skills/pp/SKILL.md` and **say that you did**: `config could not be resolved;
filtered with the shipped defaults`. A repository that has customised its
destinations and is not told this would see its configuration quietly ignored.

## Read

`.periplus/.pre.md`. Rows carrying a kind are yours:

```
- <created> → <updated> `<file>:<line>` [<kind>] <the note>
```

A row still holding `[]` was never classified. Do not guess it — run
`/pp-classify` over the file first, then come back.

## Before writing a comment, try the code

This applies only to rows the table sends to **code**. A comment is what is left
when the code cannot carry the fact itself, so try making the code say it and see
whether the note disappears:

- a number that needs explaining wants a name
- a block that wants a heading wants extracting into a function
- a condition that wants explaining wants a named predicate
- an invariant that wants stating wants an assertion or a test

This is the step that keeps a source file from filling with prose, and the easy
one to skip, because writing the sentence is faster than changing the code. A
change to the code is still a change to the code: show it before making it.

A row settled this way is delivered like any other — it goes to `.all.md` under
its own kind, and it leaves `.pre.md`.

## Deliver

**code** — write it into the source at the row's `file:line`, as the shortest
statement of the fact rather than an account of how the code works. The reader
can see the code; what they cannot see is the world outside it. Keep the language
the row is in.

**periplus** — append the row to `.periplus/.log.md`, unchanged except for the
updated timestamp. An entry whose text names no condition under which it would
leave the log is inventory in a place meant to be temporary; add that condition
now, or expect `/pp-list` to flag it.

**drop** — write it nowhere.

Then, for every row regardless of destination: append it to `.periplus/.all.md`
with the updated timestamp set to now, and delete it from `.periplus/.pre.md`.
`.all.md` is the only record that the row ever existed, and it is what makes the
distribution of kinds measurable later. Nothing reads it during a run; it is
never edited and never drained.

Drain row by row, not at the end. What is left in `.pre.md` at any moment is then
exactly what has not been delivered, and a run that stops halfway is
distinguishable from one that never started.

## Output

```
<file>:<line> [<kind>] → <code|periplus|drop>
```

End with `<N> to code, <M> to periplus, <K> dropped. .pre.md empty.` If it is not
empty, that is the report instead: `<R> rows still in .pre.md` — and the work is
not done.

## Boundaries

Source edits are the point of this command, and they are also the irreversible
part. Show the comment text before writing it: this is the moment the comment the
discipline was built to intercept gets to exist after all, and it should exist on
purpose.

Never delete a row from `.pre.md` without it reaching `.all.md` first. That file
is the record of what was captured, and a row that vanishes without landing there
makes the discipline unmeasurable in exactly the way it was built to avoid.
