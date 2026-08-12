---
name: pp
description: >
  Keep implementation-time notes out of the source until the code is finished.
  Comments are captured to `.periplus/pre.csv` while you work, then filtered once
  at the end into the source, into `.periplus/log.csv`, or nowhere. Invoke as /pp,
  which runs /pp-capture, then /pp-classify, then /pp-resolve. Use it on any coding task where
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

## Three commands, in order

1. **`/pp-capture`** — phase 1, the capture rule. The session hook injects it at
   session start; running it here re-arms it for the code written next.
2. **`/pp-classify`** — split what is not yet atomic, and give each row exactly
   one kind. Writes nothing outside `pre.csv`.
3. **`/pp-resolve`** — look the destination up from the kind, deliver each row,
   and drain `pre.csv`.

`/pp` is all three, run back to back, and is what to reach for by default.
Stopping after `/pp-classify` leaves the source with no comments at all.

The kinds, and the order they are read in, are in
`skills/pp-classify/SKILL.md`. Where a kind goes is `.periplus/config.json`,
which `/pp-resolve` reads.

## Keep the language it was captured in

A note reaches its destination in the language you wrote it in phase 1. Filtering
routes a note and shortens it; it does not translate it.

This holds even when the surrounding file's comments are in another language. A
note that arrives in a different language from the code around it is a mismatch
to name to the user, who can then say which language the file should settle on.

## The files share one format

```
<timestamp>,<file>,<line>,<kind>,"<the note>"
```

No header row. The note is always quoted whatever is in it, a `"` inside it is
doubled to `""`, and it holds no newline. Which file a row is in — `pre.csv`,
`log.csv`, `all.csv`, `swept.csv` — is what says how far it has got.
