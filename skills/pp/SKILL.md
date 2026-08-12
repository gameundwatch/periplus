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
