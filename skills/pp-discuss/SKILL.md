---
name: pp-discuss
description: >
  Work through the pending periplus entries one at a time and send each to its
  destination — a comment in the source, a document the repository keeps, back to
  the log, or nowhere. Invoked as /pp-discuss. Changes files, one entry at a
  time, each with the user's agreement. Also use it when the user asks what is
  sitting in `.periplus/`, or when a session-start pending count is high enough
  that new work should not start on top of it.
---

Every entry taken up here reaches one of four destinations, and the log shrinks by
exactly the entries that left it.

What arrives in the log is document material. Only two kinds route here by default
— `rejected-alternatives` and `upgrade-triggers` — and neither is a fact the code
depends on. So `docs` is the main road, and the other three are the shoulders.

## Before starting

Read `.periplus/.log.md`, and `.periplus/config.json` when it exists — most
repositories run on the defaults and have no config file, which is not a problem
to report. Nothing pending: say so and stop. An empty log means the discipline is
working, so there is nothing to go looking for — do not scan the source for
comments to fill a session with.

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

Take entries in order, oldest first by the created timestamp — never by the
updated one, or every entry that has already survived a discussion sinks to the
back, and the rows that have resisted settling the longest are the last ones
looked at.

For each:

1. Show the entry and the code it points at.
2. Say which destination you think it takes, and why, in a sentence or two. Name
   the document when you say `docs`.
3. Ask, and wait for the answer before touching a file.

An entry whose updated timestamp is later than its created one has been here
before: it was taken up, argued about, and put back. Say so when you show it, and
do not re-run the argument that already failed to settle it once.

Presenting several entries together looks efficient and is not: each destination
is a different irreversible operation on a different file, and a single "yes, all
of those" cannot mean the same thing for a source edit, a document, and a
deletion. Batching also hides the disagreements — the entries a user would have
argued about are exactly the ones that get waved through in a list.

**Example of one round:**

```
- 2026-07-29T11:03 → 2026-07-29T11:03 `src/limiter.py:42` [upgrade-triggers] one
  global lock; move to per-account locks if throughput becomes a problem

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

**here** — it belongs in a document, and no practice in this repository holds it
yet. It stays in the log, and that is its trigger: it leaves when such a document
exists. Set its updated timestamp to now.

This is the honest answer for a repository that keeps no design writing, and it is
also the failure mode to watch — in a repository with no `docs/`, every entry fits
this description, and the log quietly becomes the store it was never meant to be.
The counter-pressure is recurrence: **the second time the same subject lands
here, that is the evidence for starting the practice.** Say so, and propose
creating the document rather than holding the note a third time. One note does not
justify a document tree; two notes on one subject do.

**trash** — delete it, after naming what makes it recoverable: the code itself,
`git log`, or a specific existing document. Naming the source gives the user the
one chance to disagree while the note still exists.

Then remove the settled entry from `.periplus/.log.md`. An entry acted on but left
in place will be argued about again next session, and the count that is supposed
to signal a healthy log will keep pointing at work already done. An entry sent to
`here` is the one case that stays, and its updated timestamp is what says so.

## Entries with no trigger

An entry whose own text names no condition that would make it leave is how a
temporary log turns into permanent storage. Do not let one pass unchanged.

`here` supplies a trigger by construction — the document that does not exist yet
is the condition. Any other reason for holding an entry does not, and there the
condition has to be worked out with the user and written into the entry.

Rewriting is the weaker option and should feel like it. A note nobody can act on
is usually a note nobody needed, so reach for a destination first and keep the
rewrite for the cases where the decision is real but its moment has not come.

The gap between the created and updated timestamps is what the next run of this
command reads, and it is the only way a later session can tell an entry nobody has
looked at from one that was discussed and survived. Leaving the timestamp alone
makes a discussion that changed nothing indistinguishable from a discussion that
never happened. The created timestamp never changes.

## Ending

Stop when the entries run out, or when the user says stop. Report what moved:
`<N> to code, <M> to docs, <K> trashed, <R> held here.`

If the same note keeps returning across sessions in different words, say so. A
recurring note is a document that has not been written yet — the repetition is the
evidence that the decision is real and keeps being rediscovered.

## Boundaries

Edits source files, writes documents, removes log entries — each only after the
user has agreed to that specific destination for that specific entry. A blanket
confirmation does not carry across entries, and clearing the log wholesale would
throw away the notes without ever deciding where they belonged, which is the
failure this whole discipline exists to prevent.
