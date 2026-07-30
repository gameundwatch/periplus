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

Run the hook against the copy before handing it over, for the configurations that
have the discipline:

```
CLAUDE_PROJECT_DIR=<copy> node hooks/periplus-activate.js SessionStart
```

Phase 1 tells the model the directory is already there, which is only true because
the hook made it. Skipping this step gives the subagent an instruction that
contradicts what it finds, and the fixture ships without `.periplus/` on purpose —
running the hook over a bare copy is also what checks that it creates one.

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

The two assertions that used to check `.periplus/` was created and added to
`.gitignore` were measuring the model's obedience to an instruction that has since
moved into the hook, where `hooks/periplus-activate.test.js` covers it
deterministically. They now read the other way — that the model left `.gitignore`
alone — which at least fails when the instruction is ignored, but it is still
instruction-following rather than judgement.

Nothing here tests that a note reaches its destination in the language it was
captured in. Both prompts are in English, so every captured note is in English and
the rule cannot be observed. A task stated in another language would be needed.
