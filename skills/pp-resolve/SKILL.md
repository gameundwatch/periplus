---
name: pp-resolve
description: >
  Deliver every classified pre-comment to the destination its kind resolves to,
  and drain `.periplus/pre.csv`. Invoked as /pp-resolve, and the second half of
  /pp. Writes source files, `.periplus/log.csv`, and the archive. Use it after
  /pp-classify; /pp runs both.
---

The second half of phase 2. Every row carrying a kind leaves `pre.csv` here, and
`pre.csv` is empty when this is over.

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

`.periplus/pre.csv`. Rows carrying a kind are yours:

```
<timestamp>,<file>,<line>,<kind>,"<the note>"
```

A row with an empty fourth field was never classified. Do not guess it — run
`/pp-classify` over the file first, then come back.

## Deliver

**code** — write it into the source at the row's `file:line`, as the shortest
statement of the fact rather than an account of how the code works. The reader
can see the code; what they cannot see is the world outside it.

Shorten it; do not translate it. The row is in the language it was thought in, and
that is the wording that holds the distinction the note was made to hold — a
translation is a rewrite performed with the original no longer in front of you,
and once it is written nothing marks it as second-hand. **This holds even when the
comments already in the file are in another language.** A row arriving in a
different language from the code around it is a mismatch worth naming to the user,
who can then say which language the file should settle on. It is not licence to
translate quietly, and quietly is how it happens — the surrounding file is right
there, and matching it feels like tidiness rather than a rewrite.

**periplus** — append the row to `.periplus/log.csv`, unchanged. Where it goes
from there, and whether it goes anywhere at all, is `/pp-discuss`'s decision and
not this command's.

**drop** — write it nowhere.

Then, for every row regardless of destination: append it to the archive unchanged,
and delete it from `.periplus/pre.csv`. The archive
is `.periplus/all.csv` unless whoever invoked this named another — `/pp-refactor`
does, because comments it swept out of existing code are a different population.
The archive is the only record that the row ever existed, and it is what makes the
distribution of kinds measurable later. Nothing reads it during a run; it is never
edited and never drained.

Drain row by row, not at the end. What is left in `pre.csv` at any moment is then
exactly what has not been delivered, and a run that stops halfway is
distinguishable from one that never started.

## Output

```
<file>:<line> [<kind>] → <code|periplus|drop>
```

End with `<N> to code, <M> to periplus, <K> dropped. pre.csv empty.` If it is not
empty, that is the report instead: `<R> rows still in pre.csv` — and the work is
not done.

## Boundaries

Source edits are the point of this command, and they are also the irreversible
part. Show the comment text before writing it: this is the moment the comment the
discipline was built to intercept gets to exist after all, and it should exist on
purpose.

Never delete a row from `pre.csv` without it reaching the archive first. That file
is the record of what was captured, and a row that vanishes without landing there
makes the discipline unmeasurable in exactly the way it was built to avoid.
