# periplus

- 2026-07-20T09:14 `src/limiter.py:8` [upgrade-triggers] one module-level lock for the whole limiter; move to per-account locks if throughput becomes a problem
- 2026-07-21T16:40 `src/checkout.ts:16` [rejected-alternatives] considered pushing the order onto a queue and draining it async, chose the direct write because the queue added a failure mode nobody was on call for
- 2026-07-22T11:02 `src/render.css:6` [external-facts] Safari 15 does not honour flex gap, so the spacing here is margin-based
- 2026-07-23T14:55 `src/limiter.py:17` [rejected-alternatives] looked at a token bucket instead of the fixed window; fixed window is wrong at the boundary but nobody has hit it
- 2026-07-24T10:30 `src/checkout.ts:99` [why] this ordering matters
- 2026-07-25T08:05 `src/legacy_sync.py:44` [history] this used to be a cron job before the webhook landed
