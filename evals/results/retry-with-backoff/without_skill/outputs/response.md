Retry loop lives in `charge()` now, `src/payments.py`:

```python
for attempt in range(1, MAX_ATTEMPTS + 1):
    response = requests.post(...)              # same idempotency_key every attempt
    if response.status_code != 429 or attempt == MAX_ATTEMPTS:
        break
    time.sleep(_backoff_seconds(response, attempt))

response.raise_for_status()
```

`_backoff_seconds` returns `Retry-After` when the header is there and parseable, otherwise 0.5 / 1.0 / 2.0 — 3.5s worst case across 4 attempts. Non-429 errors still raise on the first attempt. The transaction rule is a docstring warning on `charge()`; nothing in the repo can detect an open transaction, so it's a comment, not a guard.

5 tests pass (`python -m pytest` from the repo root): retry-after honoured, exponential fallback, gives up at 4 attempts with the key reused, 400 not retried, plus the original happy path.

- Skipped jitter — add when several workers retry the same account concurrently and re-collide.
- Skipped capping `Retry-After` — you said respect it; add a ceiling if the provider ever sends a wild value that parks a worker.
- Didn't use `urllib3.Retry` via an HTTPAdapter (fewer lines, handles 429 + Retry-After natively) because testing it needs a live socket or a new mocking dep; the hand-rolled loop is 12 lines and mocks cleanly. Say the word and I'll swap it.

Couldn't find the old `time.sleep` loop in the caller — there's no caller in this repo, only `src/payments.py`. If it lives elsewhere, delete it there.
