---
name: pp-discuss
description: >
  Work through the pending periplus entries one at a time and send each to its
  destination — a comment in the source, a document the repository keeps, back to
  the log, or nowhere. Invoked as /pp-discuss. Changes files, one entry at a
  time, each with the user's agreement. Also use it when the user asks what is
  sitting in `.periplus/`, or asks what the implementation has been left to decide
  on its own.
---

Every entry taken up here reaches one of four destinations, and the log shrinks by
exactly the entries that left it.

What arrives in the log is document material. Three kinds route here by default —
`unspecified-choices`, `rejected-alternatives` and `upgrade-triggers` — and none
of them is a fact the code depends on. `docs` is what they are aimed at, but the
four destinations are not a ranking: which one an entry takes follows from whether
it has been settled, not from which outcome is the better one.

## Before starting

Read `.periplus/.log.md`, and `.periplus/config.json` when it exists — most
repositories run on the defaults and have no config file, which is not a problem
to report. An empty log: say so and stop — do not scan the source for comments to
fill a session with.

**Then survey what documents this repository keeps.** Look at `docs/`, at the
repository root, and at wherever else design writing has collected — ADRs, a
roadmap, a glossary, design notes, a long-form README section. Do this before
taking up the first entry, not while proposing a destination for it.

The shape varies by repository and there is no default to assume. A survey first
lets you propose a document by name; without one you end up asking "which document
should this go in?", which is not a proposal but an interrogation, and the user
came here to be shown a recommendation.

Open the code the first entry points at before saying anything about it. A note
was written next to code that no longer has to look the way it did, and an
opinion about where the note belongs is worth little without seeing what it
describes now.

## One entry at a time

Take entries in order, oldest first.

For each:

1. Show the entry and the code it points at.
2. Say which destination you think it takes, and why, in a sentence or two. Name
   the document when you say `docs`.
3. Ask, and wait for the answer before touching a file.

Presenting several entries together looks efficient and is not: each destination
is a different irreversible operation on a different file, and a single "yes, all
of those" cannot mean the same thing for a source edit, a document, and a
deletion. Batching also hides the disagreements — the entries a user would have
argued about are exactly the ones that get waved through in a list.

**Example of one round:**

```
- 2026-07-29T11:03 `src/limiter.py:42` [upgrade-triggers] one global lock; move
  to per-account locks if throughput becomes a problem

src/limiter.py:38-45 still has the single module-level Lock.

Part of this is code, not docs. "There is one lock on purpose" is what stops the
next reader from splitting it and introducing a race — deleting that would let
someone break the code. The throughput threshold itself is a plan, and this
repository has no roadmap to put it in, so that part stays in the log.

Comment I would write, on line 38:
    # one lock for the whole limiter, intentional
```

## The four destinations

**code** — write the qualifying part into the source, and only that part. This is
the salvage path, not a main road: what reaches the log is document material by
kind, so a code-worthy part arriving here means the note was not split far enough
upstream. The test is whether deleting it could let someone break the code — a
fact about the outside world, an obligation the signature does not express, or a
mark that something odd-looking is deliberate. Show the exact comment text before
writing it, since this is the moment the comment the discipline was designed to
intercept gets to exist after all. Write it in the language the entry is in —
picking is an extraction, and translating on the way out replaces the author's
wording with yours under their name.

**docs** — add it to a document this repository already keeps. Adding the next
numbered ADR to a repository that already keeps ADRs counts as adding to an
existing practice; so does appending to a roadmap that is already there. Starting
a document tree to hold one note does not — see `here`.

The document supplies the test, and it is not the same test everywhere:

- an ADR still needs all three of hard to reverse, surprising without context,
  and the result of a real trade-off, and it records the rejected alternatives —
  that is usually why the note was written at all
- a roadmap entry needs work someone actually intends to schedule
- a glossary entry needs a term used across the project, not in one module

Nothing in the repository's documents supplies a test it passes: it is `trash`,
not `docs`. Widening the destination is not licence to widen what qualifies.

**here** — it is not settled yet, so it stays in the log.

Staying is the normal outcome for a decision nobody has made. An unsettled note
cannot pass the test a document sets, and pushing one through anyway would write
an open question into the record as though it had been closed. Do not ask the user
for a condition under which the entry would leave: what would settle it is a
decision still owed, and the entry sitting in the log is the evidence that it is
owed. A `.log.md` that grows says how much design the implementation has been left
to decide, which is worth knowing and is not a fault to correct.

**trash** — delete it, after naming what makes it recoverable: the code itself,
`git log`, or a specific existing document. Naming the source gives the user the
one chance to disagree while the note still exists.

Then remove the settled entry from `.periplus/.log.md`. An entry acted on but left
in place will be argued about again next session, and the count will keep pointing
at work already done. An entry sent to `here` is the one case that stays.

## Ending

Stop when the entries run out, or when the user says stop. Report what moved:
`<N> to code, <M> to docs, <K> trashed, <R> held here.`

**If the same subject has now landed in the log twice, say so.** Whether the two
arrived in different sessions, in different words, or sit side by side in the same
run, that is what the log is for: one note is not a reason to write a document,
two on one subject are, and the log is where the evidence for it accumulates.
Propose the document by name rather than leaving both entries for a third pass.

## Boundaries

Edits source files, writes documents, removes log entries — each only after the
user has agreed to that specific destination for that specific entry. A blanket
confirmation does not carry across entries, and clearing the log wholesale would
throw away the notes without ever deciding where they belonged, which is the
failure this whole discipline exists to prevent.
