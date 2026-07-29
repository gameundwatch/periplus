`src/payments.py`:

```python
import time

import requests

API_ROOT = "https://api.example-psp.com/v2"
MAX_ATTEMPTS = 4
# The provider rate-limits each account at 5 requests per second.
RATE_LIMIT_PER_SECOND_PER_ACCOUNT = 5


def charge(account_id, amount_cents, idempotency_key):
    """Do not call this inside an open DB transaction: the backoff can sleep for
    several seconds, and the transaction would hold its locks for all of it.
    """
    # Retrying a POST is safe only because the provider deduplicates on the
    # caller's idempotency key.
    for attempt in range(MAX_ATTEMPTS):
        response = requests.post(
            f"{API_ROOT}/charges",
            json={"account": account_id, "amount": amount_cents},
            headers={"Idempotency-Key": idempotency_key},
            timeout=10,
        )
        if response.status_code == 429 and attempt < MAX_ATTEMPTS - 1:
            time.sleep(_backoff_seconds(response, attempt))
            continue
        response.raise_for_status()
        return response.json()["charge_id"]


def _backoff_seconds(response, attempt):
    # Only the delta-seconds form of Retry-After is read; the HTTP-date form
    # falls through to the schedule below.
    retry_after = response.headers.get("Retry-After")
    if retry_after:
        try:
            return float(retry_after)
        except ValueError:
            pass
    # ponytail: no jitter, so concurrent workers on one account back off in lockstep.
    return (1 / RATE_LIMIT_PER_SECOND_PER_ACCOUNT) * 2**attempt
```

Backoff base is `1 / 5` rather than a magic `0.2`, so the schedule (0.2 / 0.4 / 0.8)
is derived from their stated rate limit instead of guessed at. Three sleeps max,
four attempts, `Retry-After` wins whenever it is present.

Two tests added to `tests/test_payments.py` — one that a 429 with `Retry-After: 2`
sleeps 2.0 and the next 429 without the header falls back to 0.4, one that it stops
at four calls and raises rather than looping. Existing test untouched. `3 passed`.

Notes:

- I could not find the caller-side `time.sleep` loop you mentioned — this repo
  contains only `src/payments.py` and its test, no callers. Nothing was deleted;
  you will want to strip that loop wherever it actually lives.
- Retries on 429 only. Connection errors and 5xx still fail on the first attempt,
  which is the conservative choice for a charge.

skipped: jitter, add when more than one worker can charge the same account at once.
skipped: urllib3's `Retry` on a Session, add when a second endpoint here needs the same.

---

## Periplus

Phase 1 captured 13 notes to `.periplus/pre.md` (`.periplus/config.json` sets
`capture: "comments"`, so docstrings were written straight into the source rather
than routed through capture). Phase 2 filtered them, and `pre.md` is now empty.

**To code (5)** — the 5/s per-account limit as a fact about their API, the
no-open-transaction obligation on callers, why retrying a POST is safe at all,
the unparsed HTTP-date form of `Retry-After`, and the absence of jitter.

**To `.periplus/log.md` (2)** — the jitter upgrade trigger, and urllib3's `Retry`
as a rejected alternative with the condition to revisit it. `/pp-list` will show
both.

**Dropped (6)** — "retry loop with exponential backoff on 429" (block heading),
"returns the charge id" (tautology), the `raise_for_status` explanation (the code
shows it), the pointer to `docs/adr/0001` (doc reference — the reasoning it
carried is now stated in one line at the loop instead), the history of the old
caller-side sleep loop, and both test-intent notes.

The 0.2 / 0.4 / 0.8 schedule started as a comment and became an assertion in
`test_charge_stops_after_max_attempts` instead.
