# evals

How the claims in the top-level README were measured, and what to re-run when
the discipline changes.

## Layout

```
fixtures/task-repo/     starting point for the /pp coding tasks
fixtures/sample-repo/   a repository with a log already full, for /pp-list and /pp-discussion
pp-list/evals.json      three prompts, no fixtures of their own
pp-discussion/evals.json
results/                the last run: two tasks, three configurations
viewer/viewer.html      Japanese-localised template for the skill-creator eval viewer
```

`results/` holds `changes.diff` rather than the repositories the runs produced —
the diff is against `fixtures/task-repo`, so the working tree is recoverable and
keeping both would be two sources for one fact.

## Running a round

Give each task to a subagent three times over a fresh copy of the fixture: once
told to read `skills/pp/SKILL.md`, once without it, and once for whatever variant
is being tested. Save the user-facing text to `outputs/response.md` and the diff
to `outputs/changes.diff`, then grade each assertion in `eval_metadata.json` into
`grading.json`.

Token counts and durations arrive in the task-completion notification and are not
recorded anywhere else — write them to `timing.json` as each run finishes or they
are gone.

## Viewing

The viewer script ships with the `skill-creator` plugin; `viewer/viewer.html` is
a localised copy of its template. Symlink the script next to it, then:

```
python3.12 evals/viewer/generate_review.py evals/results \
  --skill-name pp --benchmark evals/results/benchmark.json
```

It needs Python 3.10 or newer.

## What the last run showed

Two coding tasks, one run per configuration — read the deltas as directional, not
as measured variance. Pass rate 0.91 with the skill against 0.51 without, at
1.27x the tokens. A cheaper variant that swept comments out of the source instead
of capturing them first measured worse on both counts; `docs/adr/0008` records
why, and its outputs are kept here as the evidence.

## Known weaknesses

Both coding tasks have been iterated on for five rounds and are no longer unseen.
Two assertions — that `.periplus/` gets created and added to `.gitignore` — have
been 100% with the skill and 0% without in every round, so they confirm the
mechanism fires but say nothing about judgement.
