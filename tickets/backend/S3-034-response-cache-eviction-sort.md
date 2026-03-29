---
id: S3-034
severity: S3
category: performance
finding_ref: EDGE-70
confidence: HIGH
---

# S3-034: Response cache eviction uses O(n log n) sort

## Root Cause

`backend/server.py:59-62`:
```python
if len(_resp_cache) >= _RESP_CACHE_MAX:
    oldest = sorted(_resp_cache.items(), key=lambda x: x[1]["t"])
    for k, _ in oldest[:20]:
        _resp_cache.pop(k, None)
```

When the response cache reaches `_RESP_CACHE_MAX` (100 entries), every new cache write
triggers a full `sorted()` of all entries — O(n log n). Only the 20 oldest are evicted.

At 100 entries this is negligible, but it runs on every write once the cache is full.

## What to Fix

Replace `sorted()` with `heapq.nsmallest()` which is O(n) for extracting k smallest:

```python
import heapq
if len(_resp_cache) >= _RESP_CACHE_MAX:
    oldest = heapq.nsmallest(20, _resp_cache.items(), key=lambda x: x[1]["t"])
    for k, _ in oldest:
        _resp_cache.pop(k, None)
```

## Files to Change

- `backend/server.py` — Lines 59-62, replace sorted() with heapq.nsmallest()

## Acceptance Criteria

- [ ] Cache eviction uses heapq.nsmallest instead of sorted
- [ ] Same eviction behavior (oldest 20 entries removed)
- [ ] import heapq added at top of file

## Do NOT

- Do not change cache size or eviction count
- Do not add LRU cache from functools (different use case)
