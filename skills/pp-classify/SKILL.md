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

Splitting and naming are one job. A row holds one kind when it cannot be split
further. What decides it is how many claims the row makes, not how many names you
managed to fit.

## Read

`.periplus/pre.csv`, one row per line, no header:

```
<timestamp>,<file>,<line>,<kind>,"<the note>"
```

Rows with an empty fourth field are yours. Rows that already carry a kind were
classified in an earlier run — leave them exactly as they are. No file, or no
empty rows: report `Nothing to classify.` and stop.

The kinds and what each one means are in `skills/pp/SKILL.md`, in the table
between the `criteria-table` markers. Read the section below that table too: it
holds the order the kinds are read in, and the table alone will not separate
them.

**Do not read `.periplus/config.json`.** Where a kind goes is `/pp-resolve`'s
business.

The repository's own documents are a different matter: step 3 of that order sends
you to them, and you are expected to go.

## Give every row a subject

Before naming anything, read each row with its subject filled in — the one the
sentence left out because the clause beside it had already supplied it.

```
「update_all はモデルを更新しないので a.floor_layer_index は古い。割り当てた値をそのまま返す」
  → update_all はモデルを更新しないので … は古い   [external-facts]
  → このアクションは割り当てた値をそのまま返す      [tautology]
```

Some rows arrive with no subject at all — write one for them.

A row with no predicate is not a sentence but a label, and a label is
`block-headings`.

## Split unless there is a reason not to

Assume a row is two. Wherever clauses are joined, split; if you do not, say why
in the report.

```
each row
  ├ subject can be supplied (it has a predicate)  → name the kind
  └ no predicate (a bare noun phrase)             → block-headings
```

A subordinating join — `〜ため`, `〜ので`, *because* — is one claim and stays
whole. Coordinated main clauses — contrast, plain conjunction, a full stop — are
two. It is the join that decides, never the number of sentences.

The split is recursive — a half can hold two kinds of its own, or two claims of
the same kind:

```
// parseConfig() からリネーム。旧名は1リリースだけ alias で残す
  → parseConfig() からリネーム        [history]
  → 旧名は alias で残してある          [contracts]
  → 次のリリースで消す                 [upgrade-triggers]
```

Splitting a row replaces it with the rows it became, at the same `file:line`,
carrying the same timestamp.

Write each half in the language the row was captured in. Splitting is a cut, not
a rewrite — the subject supplied above is the one exception.

## Search the documents, one row at a time

A row that reads as a reason gets step 3 of the order run on it: is this
something one of this repository's documents already says? Search when such a row
comes up, for that row. **Do not read the document tree first.**

File names are usually index enough to know where to look. Open the ones that
could hold it, and **read the line before claiming it**. If nothing turns up, the
row keeps the kind it would otherwise have had.

## What to write back

For each row settled: put the kind in the fourth field. Nothing else on the row
changes — the timestamp says when the note was captured, not when it was handled.
The note keeps its quotes, and a `"` inside it stays doubled to `""`.

```
2026-07-31T14:22,hooks/x.js,88,why,"タイムアウトが多発したため非同期にした"
```

Nothing else in `pre.csv` moves, and nothing outside it is touched.

## Output

One line per row, in file order:

```
<file>:<line> [<kind>] — <the note in a few words>
```

Mark the rows that came out of a split:

```
hooks/x.js:88 [history] — 以前は同期だった (split 1/2)
hooks/x.js:88 [why] — タイムアウトが多発したため非同期にした (split 2/2)
```

A row left whole where clauses were joined carries the reason instead:

```
hooks/x.js:88 [why] — タイムアウトが多発したため非同期にした (kept whole: cause)
```

A `doc-restatement` row carries the document and the line it was found at:

```
hooks/x.js:88 [doc-restatement] — 種別の集合は閉じている (docs/adr/0014-...md:17)
```

End with `<N> rows classified, <M> from splits. Run /pp-resolve to deliver them.`

## Boundaries

`.periplus/pre.csv` is the only file this writes. It does not deliver, it does
not write to `log.csv` or `all.csv`, and it does not remove rows.

Say in the report that classifying alone leaves the source with no comments, and
unless the user asked for the halves separately, go straight on to `/pp-resolve`.
