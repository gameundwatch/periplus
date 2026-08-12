# periplus

A ship's log for implementation-time decisions.

Coding agents write comments faster than anyone reads them, and the codebase ends
up documenting itself: tautologies, back-references to ADRs, migration stories,
and plans for later all competing with the code. Periplus works in two phases —
while the code is being written every comment is captured to `.periplus/pre.csv`
untouched, and once the code is finished they are filtered in one pass into the
source, into the log, or nowhere.

Deciding mid-implementation is deciding without the evidence: a note explaining
where `0.2` came from is obviously unnecessary once the constant ends up named,
but at the moment you wanted to write it the constant did not exist yet.

A note arrives at its destination in the language it was captured in. Filtering
routes and shortens; translating would be a rewrite of someone else's wording,
done with the original no longer in front of you.

The effect is not fewer comments — measured against an undisciplined baseline the
count comes out about the same. The effect is that the source carries only what is
true of the code now, while what is still undecided moves to the log.

The log is a **log**. What lands in it is document material, so entries leave it
mainly into a document the repository already keeps — or into the source, or
nowhere. An entry that is not settled yet stays, and staying is not a failure: it
cannot pass the test a document sets until someone decides it, and the entry
sitting there is the evidence that the decision is owed. A log that grows is a
reading of how much design the implementation has been left to decide, which is
the second thing periplus is for after keeping comments out of the source.

Every note carries exactly one **kind** — what the note is about — and the kind is
what decides where it goes. A note that holds two is two notes, split when it is
written down rather than when it is filed.

## Install

```
/plugin marketplace add gameundwatch/periplus
/plugin install periplus@periplus
```

Requires `node`. The discipline is injected at `SessionStart` and `SubagentStart`
in every repository, with no opt-in: writing code is the trigger, so there is no
flag to set and no per-repository enabling step. On first sight of a repository
the hook creates `.periplus/` and adds it to `.gitignore` — an empty directory is
how you can tell the discipline is live before anything has been captured into
it. The files inside are created lazily, on the first note and the first entry.

## Commands

- `/pp` — the discipline itself: `/pp-capture`, then `/pp-classify`, then
  `/pp-resolve`. The session hook normally handles phase 1 for you; invoke `/pp`
  when the hook is not active, in a subagent that did not inherit it, or to
  re-anchor mid-session.
- `/pp-capture` — phase 1 on its own. `/pp` runs it first, and that is what it is
  for; calling it alone only re-states the capture rule.
- `/pp-classify` — split each captured note until one kind fits, and record it.
  Writes only `pre.csv`, so the kinds can be reviewed before anything is delivered.
- `/pp-resolve` — deliver each note to what its kind resolves to, and drain
  `pre.csv`.
- `/pp-discuss` — work through the pending log entries one at a time and send
  each to its destination, one specific agreement per entry.
- `/pp-refactor` — the same discipline pointed at comments that already exist. It
  **cuts** them out of the source into `pre.csv` first, one file at a time, then
  runs the two halves over them. Destructive where `/pp` is not: the comments
  leave the file before anything has decided where they belong, so what protects
  you is that the change is uncommitted.

Reach for `/pp`. Running `/pp-classify` alone and stopping leaves the source with
no comments at all, which is the failure the discipline exists to prevent — the
session-start line reports rows left in that state.

`skills/pp-capture/SKILL.md` is the capture rule and nothing else. The hook
injects that file whole at session start, and no other file restates it, so there
is no second copy to drift from — a test asserts both.

## The files

```
<timestamp>,<file>,<line>,<kind>,"<the note>"
```

No header row. The note is the last field and is quoted whatever is in it, so
nothing has to be read to decide whether it needs quoting; a `"` inside it is
doubled to `""` and it never contains a newline.

| file | what is in it | how a row leaves |
| --- | --- | --- |
| `.periplus/pre.csv` | rows that have not been delivered | `/pp-resolve` |
| `.periplus/log.csv` | rows sent to the `periplus` destination | docs, code, trash — or it stays |
| `.periplus/all.csv` | every row captured while writing code | it does not leave |
| `.periplus/swept.csv` | every row `/pp-refactor` cut out of existing code | it does not leave |

One shape for all of them, so which file a row is in is what says how far it has
got and where it came from. The kind is empty at capture and filled by
`/pp-classify`; the timestamp says when the note was captured and never moves
after that.

The two archives are the only record of which kinds are actually being written,
which is what makes the discipline measurable rather than asserted. They are
kept apart because they answer different questions: `all.csv` is what this
discipline produces, `swept.csv` is what was written without it. Mixed together, a
sweep over code that had already been through `/pp` would make its output
indistinguishable from its input. Nothing reads either during a run.

## Kinds

Thirteen, and the set is closed — a note that seems to need a fourteenth is a note
that has not been split far enough. The destinations below are the shipped defaults;
any of them can be moved per repository (see Configuration).

| kind | which is | example | goes to |
| --- | --- | --- | --- |
| `external-facts` | a fact about the world outside the code that the code depends on — a browser quirk, the target device, the expected user, an external API limit | `Safari 15 has no flex gap` | **code** |
| `contracts` | an obligation on the caller that the signature and the types do not express | `the caller closes the file` | **code** |
| `current-limits` | what this implementation does not do or cannot do yet, which reads as an oversight without it | `only parses the seconds form of Retry-After` | **code** |
| `block-headings` | a heading that labels the block of code below it | `--- helpers ---` | **code** |
| `undocumented-design` | the reasoning behind a design the design settled, which none of this repository's documents records | `sorted before grouping so the output is stable` | **periplus** |
| `unspecified-choices` | a value or a shape the design did not specify, chosen at the implementer's discretion — the reason for it is in neither the code nor the design | `300 ms, because it felt responsive enough` | **periplus** |
| `why` | the reasoning behind a design or an approach | `the retry is here rather than in the caller` | **periplus** |
| `rejected-alternatives` | an option that was considered and turned down | `considered a queue, chose the direct write` | **periplus** |
| `upgrade-triggers` | the condition under which this implementation should be revisited | `move to per-account locks if throughput becomes a problem` | **periplus** |
| `tautology` | a restatement of what the code already shows, including a docstring summary naming what the function does | `increment the counter` | **drop** |
| `doc-restatement` | a claim one of this repository's existing documents already makes, a pointer to that document included | `see ADR 0007` | **drop** |
| `history` | the story of how the code got here, or what it used to be | `used to be synchronous; timeouts made it async` | **drop** |
| `test-intent` | what a test is checking — `describe`/`it` already says it | `checks that an empty cart returns zero` | **drop** |

`skills/pp-classify/SKILL.md` holds the operative table, in the command that reads
it. It names the kinds and nothing else — the destinations belong to
`config.json`, and the hook appends them when it prints the resolved table. The
table above is a rendering with examples and the shipped destinations added, and a
test keeps the two from drifting on which kinds exist.

## Configuration

Per repository, at `.periplus/config.json`. It is the only place a destination is
written down, so it is created with every kind in it the first time a session
starts. A value already in the file is never changed; a kind missing from it is
added at its default, which is the one edit that cannot alter how the file reads,
and it is what carries a config across a version that adds or renames a kind.
Malformed fields fall back to the defaults below, and anything that could not be
used is named when `/pp-resolve` prints the resolved table.

```json
{
  "criteria": {
    "external-facts": "code",
    "contracts": "code",
    "current-limits": "code",
    "block-headings": "code",
    "undocumented-design": "periplus",
    "unspecified-choices": "periplus",
    "why": "periplus",
    "rejected-alternatives": "periplus",
    "upgrade-triggers": "periplus",
    "tautology": "drop",
    "doc-restatement": "drop",
    "history": "drop",
    "test-intent": "drop"
  }
}
```

Four, five and four, and one line explains the split: what stays in the source is
the outside fact the code cannot show you.

Each kind takes `code`, `periplus`, or `drop`, and `criteria` is the whole file.

**The set of kinds is closed.** Destinations move; the vocabulary does not. Wanting
a fourteenth kind means wanting a category none of the thirteen covers, which is a
change to the discipline rather than to a setting — so a key that is not a kind is
reported as ignored rather than quietly accepted. A key left behind by a rename is
reported the same way, and deleting it is the reader's call, not the hook's.

`.periplus/` is not tracked, `config.json` included: the directory holds working
state, and a comment convention a team has agreed on is shared by copying the
file in, the same way a local tool config is. A generated config is a snapshot —
a fresh clone gets one that looks exactly like a config someone wrote on purpose,
and changes to the shipped defaults do not reach a repository that already has
one.

Only the phase 1 rule is injected at session start, about 300 tokens. The kind
table and the filter steps are read when phase 2 runs. `/pp-resolve` gets the
table with this repository's settings already applied:

```
node hooks/periplus-activate.js criteria
```

Everything routed to `drop` is recoverable from the code, from `git log`, or from
an existing ADR, so writing it anywhere would create a second source that can go
out of date on its own.

## Status line

The session-start line reports the log count once, and it is stale as soon as the
first note is captured. `hooks/periplus-statusline.js` keeps both counts on
screen: `[PERIPLUS]` while both files are empty, `[PERIPLUS:3!2]` for three log
entries and two unfiltered pre-comments. The numbers are line counts and nothing
more — neither turns into a warning. In a repository without `.periplus/` it
prints nothing.

Claude Code reads only the `agent` and `subagentStatusLine` keys out of a
plugin's own `settings.json`, so the status line has to live in yours. The
session-start hook asks for it until it is there, and one command sets it up:

```
node "$(ls -t ~/.claude/plugins/cache/*/periplus/*/hooks/periplus-activate.js | head -1)" install
```

That writes into `~/.claude/settings.json` (or `$CLAUDE_CONFIG_DIR`), copying
what was there to `settings.json.periplus-bak` first and leaving every other
setting alone. A status line you already have is kept and periplus is appended
after it:

```json
{
  "statusLine": {
    "type": "command",
    "command": "bash \".../ponytail-statusline.sh\"; printf ' '; node \"$(ls -t ~/.claude/plugins/cache/*/periplus/*/hooks/periplus-statusline.js | head -1)\""
  }
}
```

The glob is there because the plugin cache is versioned, and a path pinned to one
version stops working the next time you update. periplus goes last because only
one command can read the status line JSON on stdin and periplus is the one that
needs it — it takes the project directory from there rather than assuming the
command runs in it. The tag appears on the next session, and on Windows the
`statusLine` has to be written by hand.

## Files

- `CONTEXT.md` — the vocabulary: pre-comment, kind, criterion, and the four
  destinations code, docs, here, trash.
- `docs/motivation.md` — the problem this was written for, as originally stated.
- `docs/adr/` — why the plugin is shaped this way, including two decisions that
  were measured and reversed.

## Cost

Measured across two coding tasks, against the same tasks run without it:
**1.17x and 1.37x the tokens**. About 300 of that is the session-start injection;
the rest is the capture-and-filter work itself, which is what the discipline is.

A cheaper variant was tried and removed — writing comments inline and sweeping
them into `pre.csv` before phase 2. It measured *more* expensive (1.35x and 1.62x),
because reading comments back out of the source adds a round trip rather than
removing one, and it produced fewer log entries: a sweep only finds what someone
was willing to commit to the source.

## Tests

```
node --test hooks/*.test.js
```
