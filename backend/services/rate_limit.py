from __future__ import annotations

from collections import defaultdict, deque
from time import time


class SlidingWindowRateLimiter:
    def __init__(self) -> None:
        self._entries: dict[str, deque[float]] = defaultdict(deque)

    def allow(self, key: str, limit: int, window_seconds: int) -> bool:
        now = time()
        bucket = self._entries[key]

        while bucket and now - bucket[0] > window_seconds:
            bucket.popleft()

        if len(bucket) >= limit:
            return False

        bucket.append(now)
        return True

