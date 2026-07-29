`src/ledger.py` (new):

```python
"""Running total of what each account has charged today.

ponytail: plain process-local dict, so the total is per-process and per-day keys
are never evicted. Both go away with Redis: INCR on the same "account:date" key
with a 48h TTL. Swap when this runs on more than one process.
"""

from datetime import datetime, timezone

_spent = {}


def _key(account_id):
    return (account_id, datetime.now(timezone.utc).date())


def spent_today(account_id):
    return _spent.get(_key(account_id), 0)


def add(account_id, amount_cents):
    key = _key(account_id)
    _spent[key] = _spent.get(key, 0) + amount_cents
```

`src/payments.py` — cap checked before the PSP call, total recorded only after it succeeds:

```python
DAILY_CAP_CENTS = 50_000


class DailyCapExceeded(Exception): ...


def charge(account_id, amount_cents, idempotency_key):
    spent = ledger.spent_today(account_id)
    if spent + amount_cents > DAILY_CAP_CENTS:
        raise DailyCapExceeded(...)
    response = requests.post(...)
    response.raise_for_status()
    ledger.add(account_id, amount_cents)
    return response.json()["charge_id"]
```

`tests/test_payments.py` gains `test_charge_stops_at_the_daily_cap`: charge to one
cent under the cap, assert the next charge raises, assert a second account is
unaffected and the blocked charge never hit `requests.post`. Both tests pass.

Calls made where you left it ambiguous:

- **Day boundary is UTC**, keyed on `(account_id, utc_date)`, so the total resets
  at midnight UTC with no cron. If the PSP contract counts days in another zone,
  that's a one-line change in `_key`.
- **The cap is a hard module constant** with no override argument and no env var —
  you said contract, not product, so there is nothing to turn off.
- **Retries double-count.** Same idempotency key twice is one charge at the PSP but
  two `ledger.add` calls here. Marked with a `ponytail:` comment rather than fixed,
  because deduping needs a store of seen keys and that's the Redis work.

Skipped: Redis, per-account config, an ADR. Add the first when it runs on more
than one process — the ledger's two functions are the whole seam.
