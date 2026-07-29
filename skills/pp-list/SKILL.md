---
name: pp-list
description: >
  List the pending entries in the periplus log with the exit each one is heading
  for, and flag the entries that have no exit. Invoked as /pp-list. Read-only — it
  reports and changes nothing. Also use it when the user asks what is sitting in
  `.periplus/`, or when a session-start pending count is high enough that new
  work should not start on top of it.
---

The periplus log holds notes that have not yet reached their destination. Every
entry is supposed to leave by one of three exits, so this reports what is still
sitting there and where each one is headed.

Reporting and acting are deliberately separated. Each exit is a different file
operation — editing source, writing an ADR, deleting a line — and the user
should be able to disagree with a proposed exit before anything moves.
`/pp-list` proposes; `/pp-discussion` carries out.

## Read

`.periplus/.log.md`, one entry per line:

```
- <ISO 8601 to the minute> `<file>:<line>` [<criterion>] <the note>
```

No file, or no lines matching that shape: report `Log is empty. Nothing pending.`
and stop. An empty log is the healthy state, not a problem to be solved — resist
the pull to go hunting through the source for comments to fill the report with.

Read `.periplus/config.json` when it exists. A criterion the user has moved to
`code` changes which exit its entries should now be heading for, so a report that
ignores the config will propose exits the repository has already ruled out.

## Propose an exit for each entry

**pick** — part of the note belongs in the source as a comment. The test is
whether deleting the note could let someone break the code: a fact about the
outside world that the code depends on, an obligation the signature does not
express, or a mark that something odd-looking is deliberate. Reasoning about a
trade-off fails this test — the code survives without it.

**promote** — the note carries the weight of an architecture decision. Three
things must hold together: hard to reverse, surprising without context, and the
result of a real trade-off. If any one is missing, it is not an ADR. A decision
that is easy to reverse will simply be reversed; one nobody would question needs
no explanation.

**discard** — the note is recoverable from the code itself, from `git log`, or
from a specific existing ADR. Name which one, so the claim can be checked.

Open the referenced `file:line` before proposing. An entry pointing at code that
has since moved or disappeared is usually a discard, but say that it went stale
rather than quietly proposing an exit — a stale entry often means the work it
described was already done.

## Output

One row per entry, oldest first:

```
<file>:<line> [<criterion>] — <the note in a few words>. exit: <pick|promote|discard>. <one clause of reasoning>
```

**Example:**

```
src/limiter.py:42 [upgrade-triggers] — one global lock, revisit on throughput. exit: promote. recurring: the same ceiling appears in three entries
src/checkout.ts:88 [rejected-alternatives] — considered a queue, chose direct write. exit: discard. no-trigger. the queue approach is visible in git log
src/render.css:12 [external-facts] — Safari 15 has no flex gap. exit: pick. no-trigger
```

Tag `no-trigger` on any entry whose own text names no condition that would make
it leave the log. This is independent of the exit you are proposing: the exit is
your recommendation now, the trigger is whether the entry could ever have left on
its own. An entry can well be both `exit: discard` and `no-trigger` — you are
proposing to remove it, and noting that nothing in it would have removed it.

The tag is diagnostic as much as it is a warning. Entries arriving without
triggers means notes are being written without an exit condition upstream, and
that is what turns a queue into a store.

End with `<N> entries, <M> with no trigger.` Then name, in one line, the single
entry most worth resolving now — the report is useful in proportion to how
obvious it makes the next move.

## Boundaries

Reads and reports. Editing source files, writing ADRs, and removing log entries
all belong to `/pp-discussion`, where each one happens against a specific
agreement. If the user wants the report kept, ask first, then write it beside the
log rather than into it — a report inside the log would be counted as entries on
the next run.
