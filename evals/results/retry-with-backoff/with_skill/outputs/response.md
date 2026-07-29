Retry lives in `charge()` now, `src/payments.py`:

```python
# The provider rate-limits at 5 requests per second per account.
RATE_LIMIT_WINDOW_SECONDS = 1 / 5
MAX_ATTEMPTS = 4


def charge(account_id, amount_cents, idempotency_key):
    # Not to be called inside an open DB transaction: a Retry-After can be
    # several seconds, and the sleep would hold the transaction's locks for it.
    # Retrying is safe because the provider deduplicates on the idempotency key.
    for attempt in range(MAX_ATTEMPTS):
        response = requests.post(...)
        if response.status_code != 429 or attempt == MAX_ATTEMPTS - 1:
            break
        time.sleep(_backoff_seconds(response, attempt))

    response.raise_for_status()
    return response.json()["charge_id"]


def _backoff_seconds(response, attempt):
    # Retry-After is also allowed to be an HTTP-date; only the seconds form is
    # read, and any other value falls back to the exponential schedule.
    try:
        return float(response.headers["Retry-After"])
    except (KeyError, TypeError, ValueError):
        return RATE_LIMIT_WINDOW_SECONDS * 2**attempt
```

Backoff base is one rate-limit window, so the schedule is 0.2 / 0.4 / 0.8s, and
`Retry-After` overrides it whenever the provider sends one. A final 429 leaves
the loop and hits `raise_for_status()`, so exhaustion surfaces as `HTTPError`
exactly as a 429 did before — no new exception type for callers to learn.

Four tests in `tests/test_payments.py` alongside the existing one: the
`Retry-After` value is slept for verbatim, the exponential schedule applies when
the header is absent, it stops at four POSTs and raises, and the idempotency key
is unchanged across retries. `time.sleep` is patched, so they run instantly. All
five pass.

The caller-side `time.sleep` loop this replaces isn't in this repo — delete it
wherever it lives, or the two will compound into ~16 attempts.

Skipped: jitter, and retries on 5xx / connection errors. Both are logged with
their triggers (`/pp-list`) — jitter when more than one worker can charge the
same account, 5xx when the provider is seen to flap.

## Periplus

15 notes captured to `.periplus/pre.md` while writing, filtered at the end:

- **to code (4)** — the 5 rps per-account limit, the no-open-transaction
  contract, why retrying is safe at all, and the `Retry-After` HTTP-date form we
  don't parse. All facts about the provider or obligations on the caller; none
  of them visible in the code.
- **to `.periplus/log.md` (3)** — urllib3 `Retry`/`HTTPAdapter` rejected (wrong
  layer for the idempotency header, needs a `Session`, untestable sleep), plus
  the jitter and 5xx triggers above.
- **dropped (8)** — "retry loop" heading, the arbitrary 4, a restatement of what
  `raise_for_status()` does, the ADR 0001 back-reference, the story of the old
  caller-side loop, and four test-intent notes the test names already carry.

The ADR pointer went nowhere but the fact inside it did: the note said "safe to
retry because the key is the caller's, see ADR 0001", so the external fact is
now one line in `charge()` and the pointer is gone — ADR 0001 stays the one
place that owns the decision.

`pre.md` is empty. `.periplus/` is gitignored.
