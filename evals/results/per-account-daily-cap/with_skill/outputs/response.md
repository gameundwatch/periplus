`src/ledger.py` — module-level `defaultdict(int)` keyed by `(account_id, utc_date)`, with `spent_today()` and `record()`.

`src/payments.py` — `DAILY_CAP_CENTS = 50_000`, checked before the POST, recorded after `raise_for_status()` so failed charges don't eat the allowance. Refusal raises `DailyCapExceeded`. No override argument, no env var, no per-account setting — the only way to change it is to change the constant.

`tests/test_payments.py` — charges exactly the cap, asserts the next cent raises and that `requests.post` was never called, and that a second account is unaffected. 2 passed.

Calls I made without asking:
- Day boundary is UTC, not account-local. The contract says "day"; UTC is the only one both sides agree on without knowing where the account is.
- Exactly at the cap is allowed, only over is refused.
- A retry with the same idempotency key is one charge to the PSP but counts twice here.

Skipped: locking and key eviction — both disappear with the Redis move (`INCR` + TTL), so adding `threading.Lock` now is code with a scheduled deletion date. Add only if this stays in-process and goes multi-threaded first.

Five notes are waiting in `.periplus/log.md` (the Redis trigger, the rejected "ask the PSP for the total" option, the lock, key eviction, retry double-counting). `.periplus/` is gitignored. `/pp-list` to see them.
