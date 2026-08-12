---
name: pp-refactor
description: >
  Point the periplus discipline at comments that already exist. Cuts the comments
  out of a named file or directory into `.periplus/pre.csv`, then runs
  /pp-classify and /pp-resolve over them, so what survives is written back and the
  rest becomes log entries or nothing. Invoked as /pp-refactor. Use it when the
  user asks to clean up comments in existing code, points at a file that has
  turned into documentation, or adopts periplus in a codebase that predates it.
  Destructive: it removes comments from the source before deciding where they go.
---

The same discipline pointed at code that already exists. `/pp` captures notes
that do not exist yet; this cuts comments that do. Classification and delivery
are `/pp-classify` and `/pp-resolve` unchanged.

The kinds, the split rule, and the destinations are defined in
`skills/pp/SKILL.md` and are not restated here. If the two ever disagree, `/pp`
is right.

## Scope first

Ask what to work on, or use what the user named: a file, a directory, the files
in a diff. Never take the whole repository on your own initiative.

Ask which documents are the design, in the same breath. **"There are none" is an
answer, not a missing one.**

Say how many files and how many comments are in scope before starting. If that
number is large, propose a smaller first pass.

## One file at a time, all the way through

```
cut → /pp-classify → /pp-resolve → next file
```

Finish a file before opening the next one.

### Cut

Remove every comment and docstring in the file from the source, and write them
into `.periplus/pre.csv`:

```
<timestamp>,<file>,<line>,,"<the comment>"
```

The timestamp is now. The kind is left empty. The `file:line` is where the
comment was before the file was rewritten. The comment is always quoted, a `"`
inside it is doubled to `""`, and a block comment that spanned several lines
arrives on one.

Split as you go, by the same rule phase 1 uses: one row per thing said. A comment
joined by a contrast or a plain "and" is two rows at the same `file:line`; one
joined by a cause stays whole. What that rule misses, `/pp-classify` splits.

**The source loses the comments here, before anything has decided where they
belong.** `git diff` is the only way back, and only while the change is
uncommitted.

Collect them all, including the ones that obviously belong where they are.

### Classify, then resolve

Run `/pp-classify`, then `/pp-resolve`. Both are unchanged here, with one
exception:

- **The archive is `.periplus/swept.csv`, not `all.csv`.**

4 and 5 are decided from the design documents named at the scope step. What they
do not settle, the implementation settled: 5.

Comments routed to `code` are written back rewritten, not restored — shortened to
the fact they carry. Keep the language each row is in: rewriting is not
translating.

## Output

Per file, one line per row:

```
<file>:<line> [<kind>] → <code|periplus|drop>
```

End with `<N> to code, <M> to periplus, <K> dropped, across <F> files. pre.csv
empty.` If it is not empty, that is the report instead: `<R> rows still in
pre.csv` — and the sweep is not done.

## Boundaries

**Never rewrite code.** This command moves comments.

**Never remove a comment that has not passed through `.periplus/pre.csv`.**

**`pre.csv` must be empty before this is over.**

Stopping early is allowed; stopping with rows left is not. When the user says
stop, or the scope turns out to be too large, finish the file you are in before
stopping.
