---
name: pp
description: >
  Keep implementation-time notes out of the source until the code is finished.
  Comments are captured to `.periplus/pre.csv` while you work, then filtered once
  at the end into the source, into `.periplus/log.csv`, or nowhere. Invoke as /pp,
  which runs /pp-classify and then /pp-resolve. Use it on any coding task where
  you would otherwise be writing comments — and whenever the user says "periplus",
  "stop commenting everything", "the code is turning into documentation", "keep a
  logbook", or complains about tautological comments, back-references to ADRs, or
  design rationale buried in the source. The plugin's session hook normally
  applies this automatically; invoke it explicitly when the hook is not active, in
  a subagent that did not inherit it, or when the user asks for it by name.
---

# Periplus

Two phases. While the code is being written you only capture. When the code is
finished you filter, once, with the finished thing in front of you.

Deciding where a note belongs while still writing is deciding without the
evidence. Much of what seems to need saying mid-implementation is answered by the
code you have not written yet — a value gets a name, a branch gets extracted, a
shape settles — and the note that felt necessary an hour ago turns out to
restate something the finished code shows plainly. Capturing first and filtering
last is what lets the code answer for itself.

## Phase 1 — capture

<!-- always:start -->
ACTIVE EVERY RESPONSE, in every file, including tests and configuration. Still
active if you are unsure — an uncertain note is captured like any other and
decided at the end. Off only when the user says so.

The trigger is writing code, not the arrival of a sentence. Before you create or
edit a source file, this task's notes already have their destination: by the time
a comment is forming in the line you are typing, the decision has been made, and
made wrong.

Every time you are about to write a comment, append it to `.periplus/pre.csv`
instead, creating the file on the first note. No header row. The directory is
already there and already ignored — do not touch `.gitignore`.

```
<timestamp>,<file>,<line>,,"<the note, as it occurred to you>"
```

The timestamp is ISO 8601 to the minute. The fourth field is the kind, which
phase 2 fills in — leave it empty. The note is always quoted, whatever is in it,
and a `"` inside it is doubled to `""`.

**One note per line, one thing per note.** A note joined by a contrast or a plain
"and" is two notes and goes on two lines: *it used to be synchronous, but
timeouts made it async* is *it used to be synchronous* and *timeouts made it
async*. A note joined by a cause is one note and stays whole: *it is async
because timeouts were frequent* says one thing.

Otherwise write it as it came to you. Do not shorten it, do not decide where it
belongs, and do not skip the ones that already look worthless — judging them
costs the attention you are meant to be spending on the code, and the filter will
catch them in a moment anyway. Docstrings count: they are comments with better
punctuation, and they go here too.

Nothing is written into the source in this phase. Not one line.

**The task is not finished while `.periplus/pre.csv` has rows in it.** Before
calling any piece of work done, invoke `/pp` and run phase 2 over what you
captured. Skipping it leaves the code with no comments at all, which is a worse
outcome than the noise this discipline exists to remove.

An empty `pre.csv` is not evidence the discipline ran. It is equally what a task
that never captured anything leaves behind, and that failure writes nothing into
the diff for anyone to catch later. So emptiness is not the report: when you call
a coding task done, say which of the two it was — `periplus: 3 filtered`, or
`periplus: nothing captured`. Saying the second is not a confession. Leaving it
indistinguishable from the first is how this discipline dies quietly.
<!-- always:end -->
<!-- A rule outside these markers reaches the model only when /pp is invoked,
     which is phase 2. Anything phase 1 has to obey belongs inside them. -->

## Phase 2 — filter

Two commands, in order:

1. **`/pp-classify`** — split what is not yet atomic, and give each row exactly
   one kind. Writes nothing outside `pre.csv`.
2. **`/pp-resolve`** — look the destination up from the kind, deliver each row,
   and drain `pre.csv`.

`/pp` is both, run back to back, and is what to reach for by default. The halves
exist for the case where the kinds are worth reviewing before anything is
written. Splitting the run and stopping after the first half leaves the source
with no comments at all, which is the outcome this discipline exists to prevent.

## Kinds

Exactly one per row. The set is closed: a note that seems to need a fourteenth
kind is a note that has not been split far enough.

This table names the kinds. It does not say where any of them goes: that is
`.periplus/config.json`, which `/pp-resolve` reads and this file never restates.

<!-- criteria-table:start -->
| kind | which is |
| --- | --- |
| `external-facts` | a fact about the world outside the code that the code depends on — a browser quirk, the target device, the expected user, an external API limit |
| `contracts` | an obligation on the caller that the signature and the types do not express |
| `current-limits` | what this implementation does not do or cannot do yet, which reads as an oversight without it |
| `block-headings` | a heading that labels the block of code below it |
| `undocumented-design` | the reasoning behind a design the design settled, which none of this repository's documents records |
| `unspecified-choices` | a value or a shape the design did not specify, chosen at the implementer's discretion — the reason for it is in neither the code nor the design |
| `why` | the reasoning behind a design or an approach |
| `rejected-alternatives` | an option that was considered and turned down |
| `upgrade-triggers` | the condition under which this implementation should be revisited |
| `tautology` | a restatement of what the code already shows — including a docstring summary naming what the function does |
| `doc-restatement` | a claim one of this repository's existing documents already makes — a pointer to that document included |
| `history` | the story of how the code got here, or what it used to be |
| `test-intent` | what a test is checking — describe/it already says it |
<!-- criteria-table:end -->

`current-limits` and `upgrade-triggers` are the pair that most often arrive as
one note, and the split matters most there. A limit is a property of the code as
it stands; the intention to lift that limit some day is a plan, and a plan is not
a property of anything. The line is the one ADR 0004 drew — what is true of the
code now, against what is to be done later.

## The order the kinds are read in

Several kinds can claim the same reason-shaped note, and the table cannot tell
them apart — the order below is what does. Read it from the top and stop at the
first that holds.

```
1. it would let the next reader break the code if it went missing
                       → external-facts / contracts / current-limits
2. the code in front of you already shows it        → tautology
3. a document and a line in it can be named         → doc-restatement
4. the design settled it and no document records it → undocumented-design
5. the design demonstrably did not settle it        → unspecified-choices
6. a reason, and neither 4 nor 5 can be shown       → why
```

**1 comes before 3 whatever the documents say.** A fact about the outside world
that some ADR happens to also record — that a `.gitignore` not ending in a
newline swallows the next line added — is still the thing that stops the next
reader breaking the code. What is written elsewhere does not change what a note
is about.

**2 comes before 3** because the nearer evidence wins: if the code shows it, the
note was redundant with or without a document. It is also the cheaper test — the
code is already open, and 3 costs a search.

**5 comes before 6** because 5 has to be shown, not assumed. Where it cannot be,
the note falls through to 6 rather than being guessed at. Reversed, the residual
would take everything and 5 would never be reached.

`why` is the residual. It holds the reasons that survive all five tests above,
which is not a failure of the note — it is the honest record that nothing
established who decided.

### What counts as a document, for 3

Only what this repository keeps in a durable form. **The session does not count.**
A reason someone gave in conversation is a reason no document records, which is
4. What 3 asks is whether it can be read back later, and a session cannot.

Name the document and the line. Then check that the line makes the same claim —
**a line that says something else is not a restatement**, and a note that
contradicts a stale document belongs at 4 or 6, where it survives. The citation
appears in the `/pp-classify` report and is stored nowhere, so nothing depends on
the line number staying put; requiring it is what makes the finding real rather
than a guess that the ADRs probably cover this.

### What counts as settled, for 4 and 5

Read the documents this repository keeps, then the code. `/pp` can also settle it
from the session it is running in, since the code and the notes were made there
and who chose the value is not in question. `/pp-refactor` has no such session,
so 4 and 5 will rarely be shown and most reasons will land in 6.

## Keep the language it was captured in

A note reaches its destination in the language you wrote it in phase 1. Filtering
routes a note and shortens it; it does not translate it. The note was written in
whatever language you were thinking in at the moment the code raised the question,
and that is the wording that holds the distinction the note was made to hold —
translation is a rewrite performed with the original no longer in front of you,
and once it is written nothing marks it as second-hand.

This holds even when the surrounding file's comments are in another language. A
note that arrives in a different language from the code around it is a mismatch
worth naming to the user, who can then say which language the file should settle
on. It is not licence to translate quietly.

## The files share one format

```
<timestamp>,<file>,<line>,<kind>,"<the note>"
```

No header row, and the note is quoted whatever is in it — the quoting is a rule
rather than a decision, so no row is read to find out whether it needs it. A `"`
inside the note is doubled to `""`, and the note holds no newline: a compliant
parser would read one record, but everything that counts rows splits the file on
lines, and a note that spans two makes the count silently wrong.

| file | what is in it | how a row leaves |
| --- | --- | --- |
| `.periplus/pre.csv` | rows that have not been delivered | `/pp-resolve` |
| `.periplus/log.csv` | rows whose kind sent them to periplus | docs, code, or trash |
| `.periplus/all.csv` | every row that was captured while writing code | it does not leave |
| `.periplus/swept.csv` | every row `/pp-refactor` cut out of existing code | it does not leave |

Which file a row is in is what says how far it has got, so the row itself does
not have to carry that. Neither does it carry its destination: that is the kind
and the config, and a copy of it here would be a second source able to disagree
with them. The same goes for where a row came from — the two archives are two
populations, and which file a row lands in is what tells them apart.

`log.csv` is a log. It holds notes that are not settled — what lands here is
document material, none of it a fact the code depends on, and `docs` is what it
is aimed at:

- **docs** — it goes into a document this repository already keeps
- **code** — part of it belongs in the source after all, which means it was not
  split far enough upstream
- **trash** — it is recoverable from somewhere else
- **here** — it is not settled yet, so it stays

Reaching `docs` is the point; not reaching it is not a failure. An unsettled note
does not pass the test a document sets, and that is the test working rather than
the log failing. What stays is the evidence for writing that document later — the
same subject arriving a second time is what says the gap is real. So a log that
grows is a reading of how much design the implementation has been left to decide,
and nothing has to be done about the number itself.

The two archives never lose a row either, and for a different reason: they are the
only record of which kinds are actually being written, and they are what makes the
discipline measurable rather than merely asserted. Nothing reads them during a
run. They are kept apart because they answer different questions — `all.csv` is
what this discipline produces, `swept.csv` is what was written without it.

## Commands

- `/pp-classify` — split and assign kinds. Writes only `pre.csv`.
- `/pp-resolve` — deliver each row and drain `pre.csv`.
- `/pp-discuss` — work through the pending log entries one at a time and send
  each to its destination.
- `/pp-refactor` — the same discipline pointed at comments that already exist. It
  cuts them out of the source first, so it is destructive where `/pp` is not.

## Configuration

`.periplus/config.json` holds the destinations, and it is the only thing that
does. It is written with every kind in it the first time a session starts, so it
is always there to read. Any kind can be sent to `code`, `periplus`, or `drop`;
the set of kinds itself is not configurable.

**A value already in the file is never changed, and a kind missing from it is
added at its default.** Writing a kind at the default it already had is the one
edit that cannot alter how the file reads, so the repair is safe in a way that
touching an existing value would not be. It is what carries a config written
before a kind existed — or a config still naming one that has been renamed —
across the version that changed the set. The old key stays where it is and is
reported as unknown, which is the notice that it can be deleted; guessing what it
was meant to say is not this hook's business.
`.periplus/` is not tracked, so a shared config is copied in by hand — and a
config generated here is indistinguishable from one a team wrote on purpose.
