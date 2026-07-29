import threading
import time
from collections import defaultdict

WINDOW_SECONDS = 60
MAX_PER_WINDOW = 100

_lock = threading.Lock()
_counts = defaultdict(int)
_window_start = time.monotonic()


def allow(account_id):
    global _window_start
    with _lock:
        now = time.monotonic()
        if now - _window_start >= WINDOW_SECONDS:
            _counts.clear()
            _window_start = now
        if _counts[account_id] >= MAX_PER_WINDOW:
            return False
        _counts[account_id] += 1
        return True
