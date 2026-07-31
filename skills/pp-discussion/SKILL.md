---
name: pp-discussion
description: >
  Work through the pending periplus entries one at a time and carry out the exit
  agreed for each — picking part of a note into the source, promoting it to an
  ADR, or discarding it. Invoked as /pp-discussion. Changes files, one entry at a
  time, each with the user's agreement. Also use it when the user asks what is
  sitting in `.periplus/`, or when a session-start pending count is high enough
  that new work should not start on top of it.
---

Every entry taken up here leaves the log by one of three exits, and the log shrinks
by exactly the entries that were settled.

## Before starting

Read `.periplus/.log.md`, and `.periplus/config.json` when it exists — most
repositories run on the defaults and have no config file, which is not a problem
to report. Nothing pending: say so and stop. An empty log means the discipline is
working, so there is nothing to go looking for — do not scan the source for
comments to fill a session with.

Open the code the first entry points at before saying anything about it. A note
was written next to code that no longer has to look the way it did, and an
opinion about where the note belongs is worth little without seeing what it
describes now.

## One entry at a time

Take entries in order, oldest first by the created timestamp — never by the
updated one, or every entry that has already survived a discussion sinks to the
back, and the rows that have resisted settling the longest are the last ones
looked at.

For each:

1. Show the entry and the code it points at.
2. Say which exit you think it takes, and why, in a sentence or two.
3. Ask, and wait for the answer before touching a file.

An entry whose updated timestamp is later than its created one has been here
before: it was taken up, argued about, and put back. Say so when you show it, and
do not re-run the argument that already failed to settle it once. An entry that
survives a second discussion unchanged is usually one whose decision is real and
wants promoting rather than being held a third time.

Presenting several entries together looks efficient and is not: each exit is a
different irreversible operation on a different file, and a single "yes, all of
those" cannot mean the same thing for a source edit, a new ADR, and a deletion.
Batching also hides the disagreements — the entries a user would have argued
about are exactly the ones that get waved through in a list.

**Example of one round:**

```
- 2026-07-29T11:03 → 2026-07-29T11:03 `src/limiter.py:42` [upgrade-triggers] one
  global lock; move to per-account locks if throughput becomes a problem

src/limiter.py:38-45 still has the single module-level Lock.

I think this is a pick, not a promote. "There is one lock on purpose" is what
stops the next reader from splitting it and introducing a race — deleting that
would let someone break the code. The throughput threshold itself is reasoning,
and can stay in the log until it either triggers or stops mattering.

Comment I would write, on line 38:
    # one lock for the whole limiter, intentional
```

## The three exits

**pick** — write the qualifying part into the source, and only that part. A note
often carries both a fact the code depends on and the reasoning that led to the
choice; the fact goes in, the reasoning stays behind or leaves by another exit.
Show the exact comment text before writing it, since this is the moment the
comment the discipline was designed to intercept gets to exist after all. Write
it in the language the entry is in — picking is an extraction, and translating on
the way out replaces the author's wording with yours under their name.

**promote** — write an ADR under `docs/adr/`, numbered one past the highest
present. Hard to reverse, surprising without context, the result of a real
trade-off: all three, or it is not an ADR. Record the rejected alternatives —
that is usually why the note was written at all, and without them the ADR reads
as an arbitrary preference.

**discard** — delete it, after naming what makes it recoverable: the code itself,
`git log`, or a specific existing ADR. Naming the source gives the user the one
chance to disagree while the note still exists.

Then remove the settled entry from `.periplus/.log.md`. An entry acted on but left
in place will be argued about again next session, and the count that is supposed
to signal a healthy log will keep pointing at work already done.

## Entries with no trigger

An entry whose own text names no condition that would make it leave is how a
temporary log turns into permanent storage. Do not let one pass unchanged. Either
settle it now by one of the three exits, or work out with the user the condition
that would make it leave, and rewrite the entry to carry that condition.

Rewriting is the weaker option and should feel like it. A note nobody can act on
is usually a note nobody needed, so reach for an exit first and keep the rewrite
for the cases where the decision is real but its moment has not come.

## Entries that stay

An entry taken up here and left in the log — rewritten to carry a trigger, or
held because the user wants it held — gets its updated timestamp set to now. Its
created timestamp never changes.

The gap between the two is what the next run of this command reads, and it is the
only way a later session can tell an entry nobody has looked at from one that was
discussed and survived. Leaving the timestamp alone makes a discussion that
changed nothing indistinguishable from a discussion that never happened.

## Ending

Stop when the entries run out, or when the user says stop. Report what moved:
`<N> picked, <M> promoted, <K> discarded, <R> remaining.`

If the same note keeps returning across sessions in different words, say so. A
recurring note is an ADR that has not been written yet — the repetition is the
evidence that the decision is real and keeps being rediscovered.

## Boundaries

Edits source files, writes ADRs, removes log entries — each only after the user
has agreed to that specific exit for that specific entry. A blanket confirmation
does not carry across entries, and clearing the log wholesale would throw away
the notes without ever deciding where they belonged, which is the failure this
whole discipline exists to prevent.
