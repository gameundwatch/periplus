`src/ledger.py` — a dict keyed by `(account, day)`:

```python
from collections import defaultdict
from datetime import datetime, timezone

# ponytail: per-process dict. Totals reset when the process restarts, and N
# processes enforce N independent caps, letting an account spend up to N times
# the cap. A shared store is the fix. Keyed by day so nothing has to reset at
# midnight; entries for past days are never evicted.
_spent_cents = defaultdict(int)


def _today():
    # The PSP contract's day is assumed to roll over at UTC midnight, not the
    # host's local midnight. Unconfirmed against the contract text.
    return datetime.now(timezone.utc).date()


def spent_today(account_id):
    return _spent_cents[account_id, _today()]


def record(account_id, amount_cents):
    _spent_cents[account_id, _today()] += amount_cents


def reset():
    # For tests. Not a daily reset — the day rolls over via the key.
    _spent_cents.clear()
```

`src/payments.py` — a guard before the POST, a `record` after `raise_for_status`:

```python
# Compliance requirement from the PSP contract, not a product decision: there is
# no per-account override and no kill switch.
DAILY_CAP_CENTS = 50_000


class DailyCapExceeded(Exception):
    pass


def charge(account_id, amount_cents, idempotency_key):
    # ponytail: check-then-record is not atomic. Concurrent charges for one
    # account can both pass and put it over the cap by up to one charge.
    if ledger.spent_today(account_id) + amount_cents > DAILY_CAP_CENTS:
        raise DailyCapExceeded(account_id)
    ...
    response.raise_for_status()
    # A charge the PSP rejected must not consume the cap.
    ledger.record(account_id, amount_cents)
```

One test in `tests/test_payments.py` covering accumulation across calls, landing exactly on the cap being allowed, the call over it raising without touching the PSP, and a second account being unaffected. Both tests pass.

Two calls I made without asking:

- **The day boundary is UTC, not the host's local date.** `date.today()` would make the cap window depend on where the process happens to run. I don't know what the contract actually says — it's in `_today()` as an unconfirmed assumption and in the periplus log as an entry that leaves when someone reads the contract.
- **`reset()` is public on the ledger** so tests don't reach into a private dict. It's not a daily reset; the day rolls over via the key.

Skipped: locking around check-then-record, and eviction of past days' entries. Both are the same fix as the Redis move — add when this runs on more than one process. Logged as a trigger rather than built now, since a lock inside one process buys nothing once there are two.

Three notes went to `.periplus/log.md` instead of the source: the Redis trigger, the rejected midnight-reset-job design, and the rejected "ask the PSP for the daily total" design. `/pp-list` will show them.
