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

Phase 1 is the session hook's — it injects the capture rule, and the rule is in
force while the code is being written. This is phase 2.

Run two commands, in order. What each one does is in its own file.

1. `/pp-classify`
2. `/pp-resolve`

Both, back to back. Stopping after `/pp-classify` leaves the source with no
comments at all.
