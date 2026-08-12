---
name: pp-capture
description: >
  Capture comments to `.periplus/pre.csv` instead of writing
  them into the source. Run by /pp.
---

ACTIVE EVERY RESPONSE, in every file, including tests and configuration. Still
active if you are unsure — an uncertain note is captured like any other and
decided at the end. Off only when the user says so.

The trigger is writing code, not the arrival of a sentence.

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
belongs, and do not skip the ones that already look worthless. Docstrings go
here too.

Nothing is written into the source in this phase. Not one line.

**The task is not finished while `.periplus/pre.csv` has rows in it.** Before
calling any piece of work done, invoke `/pp` and run phase 2 over what you
captured.

When you call a coding task done, say which of the two it was —
`periplus: 3 filtered`, or `periplus: nothing captured`.
