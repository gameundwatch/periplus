---
name: pp-classify
description: >
  Give every captured pre-comment exactly one kind, splitting the rows that hold
  more than one. Invoked as /pp-classify, and the first half of /pp. Writes only
  `.periplus/pre.csv` — no source file, no log, no ADR. Use it when the kinds are
  worth reviewing before anything is delivered; otherwise run /pp, which does this
  and then /pp-resolve.
---

The first half of phase 2. Every row in `.periplus/pre.csv` comes out of this
carrying exactly one kind, and nothing outside that file has changed.

Splitting and naming are one job, not two. A row holds one kind when it cannot be
split further, so the way you find the split is by trying to name the kind and
finding that two names fit.

## Read

`.periplus/pre.csv`, one row per line, no header:

```
<timestamp>,<file>,<line>,<kind>,"<the note>"
```

Rows with an empty fourth field are yours. Rows that already carry a kind were
classified in an earlier run — leave them exactly as they are. No file, or no
empty rows: report `Nothing to classify.` and stop.

The kinds and what each one means are in `skills/pp/SKILL.md`, in the table
between the `criteria-table` markers. Read the first two columns. **Ignore the
destination column** — where a kind goes is `/pp-resolve`'s business, and knowing
that `history` is dropped is exactly the pressure that makes a note get called
something else so that it survives.

## Split until one kind fits

For each empty row, try to name its kind. If two names fit, the row is two rows.

Phase 1 already splits on contrast and on plain conjunction, so most rows arrive
atomic. What survives that is the split to make here, and it is recursive — a
half can hold two kinds of its own:

```
// parseConfig() からリネーム。旧名は1リリースだけ alias で残す
  → parseConfig() からリネーム        [history]
  → 旧名は alias で残してある          [contracts]
  → 次のリリースで消す                 [upgrade-triggers]
```

Splitting a row replaces it with the rows it became, at the same `file:line`,
carrying the same timestamp. The note was captured once; splitting it is something
done to it afterwards.

Write each half in the language the row was captured in. Splitting is a cut, not
a rewrite.

## What to write back

For each row settled: put the kind in the fourth field. Nothing else on the row
changes — the timestamp says when the note was captured, not when it was handled.
The note keeps its quotes, and a `"` inside it stays doubled to `""`.

```
2026-07-31T14:22,hooks/x.js,88,why,"タイムアウトが多発したため非同期にした"
```

Nothing else in `pre.csv` moves, and nothing outside it is touched. A source file
edited here would be a comment written before its destination was known, which is
the failure this whole discipline is built around.

## Output

One line per row, in file order:

```
<file>:<line> [<kind>] — <the note in a few words>
```

Mark the rows that came out of a split, so the user can see what was done to
their note:

```
hooks/x.js:88 [history] — 以前は同期だった (split 1/2)
hooks/x.js:88 [why] — タイムアウトが多発したため非同期にした (split 2/2)
```

End with `<N> rows classified, <M> from splits. Run /pp-resolve to deliver them.`

## Boundaries

`.periplus/pre.csv` is the only file this writes. It does not deliver, it does
not write to `log.csv` or `all.csv`, and it does not remove rows.

**Classifying and stopping is a worse state than not having started**, because
the rows now look handled and the source still has no comments. Say so in the
report, and unless the user asked for the halves separately, go straight on to
`/pp-resolve`.
