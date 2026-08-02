---
name: pp-refactor
description: >
  Point the periplus discipline at comments that already exist. Cuts the comments
  out of a named file or directory into `.periplus/.pre.md`, then runs
  /pp-classify and /pp-resolve over them, so what survives is written back and the
  rest becomes log entries or nothing. Invoked as /pp-refactor. Use it when the
  user asks to clean up comments in existing code, points at a file that has
  turned into documentation, or adopts periplus in a codebase that predates it.
  Destructive: it removes comments from the source before deciding where they go.
---

`/pp` is the discipline pointed at code being written. This is the same discipline
pointed at code that already exists.

The difference is only in how the notes arrive. `/pp` captures notes that do not
exist yet; this cuts comments that do. Once they are cut, the file is
indistinguishable from one whose author captured everything and wrote nothing, so
classification and delivery are `/pp-classify` and `/pp-resolve` unchanged.

The kinds, the split rule, and the destinations are defined in
`skills/pp/SKILL.md` and are not restated here. If the two ever disagree, `/pp` is
right.

## Scope first

Ask what to work on, or use what the user named: a file, a directory, the files
in a diff. Never take the whole repository on your own initiative. A comment sweep
touches every file it reaches, and the review burden lands on someone who only
asked about one module.

Say how many files and how many comments are in scope before starting. If that
number is large, propose a smaller first pass — one file is enough to find out
whether the user agrees with your judgement, and disagreeing after fifty files
have changed is expensive for both of you.

## One file at a time, all the way through

```
cut → /pp-classify → /pp-resolve → next file
```

Finish a file before opening the next one. Cutting the whole scope first would
leave every `file:line` in `.pre.md` pointing at coordinates the source no longer
has — removing a comment moves every line below it.

### Cut

Remove every comment and docstring in the file from the source, and write them
into `.periplus/.pre.md`:

```
- <created> `<file>:<line>` [] <the comment>
```

The timestamp is now. The kind is left empty. The `file:line` is where the comment
was before the file was rewritten.

Split as you go, by the same rule phase 1 uses: one row per thing said. A comment
joined by a contrast or a plain "and" is two rows at the same `file:line`; one
joined by a cause stays whole. What that rule misses, `/pp-classify` splits.

**The source loses the comments here, before anything has decided where they
belong.** That is what makes this command destructive and `/pp` not. What protects
you is that the file is modified and uncommitted: `git diff` shows exactly what
was cut, and `git restore` puts it back. Nothing in this skill can restore a
comment once the change has been committed — the rows in `.pre.md` are split
fragments, and the connectives that joined them are gone.

Collect them all, including the ones that obviously belong where they are.
Judging during the cut costs the attention classification needs, and an
unfiltered list is what makes the before-and-after reviewable.

### Classify, then resolve

Run `/pp-classify`, then `/pp-resolve`. Both are unchanged here, with one
exception:

- **The archive is `.periplus/.swept.md`, not `.all.md`.** These comments were
  written somewhere else, by someone else, under no discipline. Mixed into
  `.all.md` they would drown the record of what this discipline actually
  captures — and worse, a sweep over code that has already been through `/pp`
  would make its output indistinguishable from its input, so `/pp` letting
  something through would stop being visible.

`unspecified-choices` has no session to read here, so decide it from the
documents this repository keeps and from the code. That is an inference and it
will be wrong sometimes; `/pp-discuss` is where a wrong one gets corrected. A log
that fills up after a sweep is the finding, not a fault.

Comments routed to `code` are written back rewritten, not restored. Shortening a
comment to the fact it carries is the work this command exists to do. Keep the
language each row is in: rewriting is not translating, and these rows arrived in
whatever language the file was already written in.

## Output

Per file, one line per row:

```
<file>:<line> [<kind>] → <code|periplus|drop>
```

End with `<N> to code, <M> to periplus, <K> dropped, across <F> files. .pre.md
empty.` If it is not empty, that is the report instead: `<R> rows still in
.pre.md` — and the sweep is not done.

## Boundaries

**Never rewrite code.** This command moves comments. The moment it touches the
code it is no longer refactoring comments.

**Never remove a comment that has not passed through `.periplus/.pre.md`.** That
file is the record of what was cut, and without it a sweep is indistinguishable
from a mistake.

**`.pre.md` must be empty before this is over.** Rows in it are comments in
flight: cut out of the source and not yet put anywhere. Unlike `/pp`, where an
undelivered row only costs a note that was never written, here every row is a
comment that has already been removed from a file and has had its fate left
undecided.

Stopping early is allowed; stopping with rows left is not. When the user says
stop, or the scope turns out to be too large, finish the file you are in before
stopping. A file that has been cut but not resolved has lost its comments with
nothing written back.
