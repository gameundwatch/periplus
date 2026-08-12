---
name: pp-resolve
description: >
  Deliver every classified row to the destination its kind resolves to, and drain
  `.periplus/pre.csv`. Run by /pp, or after /pp-classify.
---

The second half of phase 2. Every row carrying a kind leaves `pre.csv` here, and
`pre.csv` is empty when this is over.

Where a kind goes is a lookup, not a judgement.

## Resolve the table first

Run, from the plugin's own directory:

```
node <this skill's directory>/../../hooks/periplus-activate.js criteria
```

It prints the kind table with this repository's `.periplus/config.json` applied,
and it names any setting it could not use. Report those lines to the user
verbatim.

If the command cannot be run, read `.periplus/config.json` directly — it holds
every kind, and it is written at session start if it is missing. Say that you
did: `criteria read from config.json; the hook could not be run`.

## Read

`.periplus/pre.csv`. Rows carrying a kind are yours:

```
<timestamp>,<file>,<line>,<kind>,"<the note>"
```

A row with an empty fourth field was never classified. Do not guess it — run
`/pp-classify` over the file first, then come back.

## Deliver

**code** — write it into the source at the row's `file:line`, as the shortest
statement of the fact rather than an account of how the code works.

Shorten it; do not translate it. **This holds even when the comments already in
the file are in another language.** A row arriving in a different language from
the code around it is a mismatch to name to the user, who can then say which
language the file should settle on.

**periplus** — append the row to `.periplus/log.csv`, unchanged. Where it goes
from there is `/pp-discuss`'s decision, not this command's.

**drop** — write it nowhere.

Then, for every row regardless of destination: append it to the archive
unchanged, and delete it from `.periplus/pre.csv`. The archive is
`.periplus/all.csv` unless whoever invoked this named another — `/pp-refactor`
does. The archive is never edited and never drained.

Drain row by row, not at the end.

## Output

```
<file>:<line> [<kind>] → <code|periplus|drop> — <the note in a few words>
```

When `/pp-classify` ran in the same pass, carry the marks it made onto the row.

End with `<N> to code, <M> to periplus, <K> dropped. pre.csv empty.` If it is not
empty, that is the report instead: `<R> rows still in pre.csv` — and the work is
not done.

## Boundaries

Show the comment text before writing it.

Never delete a row from `pre.csv` without it reaching the archive first.
