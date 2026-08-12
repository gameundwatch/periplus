---
name: pp
description: >
  Filter the notes captured in `.periplus/pre.csv` into the source, the log, or
  nowhere. Run at the end of any coding task where you would otherwise have
  written comments, and whenever the user says "periplus", "stop commenting
  everything", "keep a logbook", or complains that the code is turning into
  documentation.
---

# Periplus

Run three commands, in order. What each one does is in its own file.

1. `/pp-capture`
2. `/pp-classify`
3. `/pp-resolve`

All three, back to back. Stopping after `/pp-classify` leaves the source with no
comments at all.

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
