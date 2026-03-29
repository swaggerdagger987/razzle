---
id: S3-114
severity: S3
confidence: HIGH
category: performance
source: EDGE-CASES.md #33 + code investigation
status: OPEN
---

# _cache_locks dict grows unbounded — memory leak proportional to unique filter combos

## Root Cause

`backend/live_data/core.py:35` defines `_cache_locks = {}` — a dictionary of `threading.Lock` objects, one per unique cache key. New locks are created at line 56:

```python
with _cache_meta_lock:
    if key not in _cache_locks:
        _cache_locks[key] = threading.Lock()  # line 56
    key_lock = _cache_locks[key]
```

**Cleanup is insufficient**: `_cache_evict()` (line 85-88) cleans up stale locks, but only runs when `len(_cache) >= _CACHE_MAX_SIZE` (500). Between evictions, expired cache entries leave orphan locks in `_cache_locks`.

Cache keys are dynamically generated from user input — position, season, week, search terms, sort direction, limits, offsets. Examples:
- `analytics.py:1888` — `f"usage_trends:{season}:{position}:{window}:{limit}:{week}"` (5 dynamic params)
- `college.py:156` — `f"fetch_college_players:{search}:{position}:{positions}:{team}:{conference}:{sort_key}:{sort_dir}:{limit}:{offset}:{season}"` (9 dynamic params)

Each unique filter combination = new lock created and never removed until the next eviction cycle.

**Impact**: Each `threading.Lock` is ~100-200 bytes. 10K unique filter combos = ~1-2MB. Low per-instance but grows monotonically over process lifetime. On a long-running Render process, this is a slow memory leak.

**Contrast with S3-046**: That ticket covers `_waitlist_rate` dict. This is a different dict (`_cache_locks`) in a different file with a different growth pattern.

## Fix

Add lock cleanup to the cache expiry path, not just the eviction path. After a cached value expires (TTL check at line 58-62), also remove its lock:

```python
# In _cached(), after detecting expired entry (line 58-62):
if key in _cache and (now - _cache[key][1]) > ttl:
    del _cache[key]
    with _cache_meta_lock:
        _cache_locks.pop(key, None)  # clean up lock on expiry
```

Or alternatively, add periodic lock cleanup that runs every N calls regardless of cache size:

```python
# At end of _cached(), every 100 calls:
_cache_call_count += 1
if _cache_call_count % 100 == 0:
    with _cache_meta_lock:
        stale = [k for k in _cache_locks if k not in _cache]
        for k in stale:
            del _cache_locks[k]
```

## Files to Change

- `backend/live_data/core.py:56-62` — add lock cleanup on cache expiry
- `backend/live_data/core.py:85-88` — existing eviction cleanup is fine, keep it

## Accept When

1. `_cache_locks` dict does not grow larger than `_CACHE_MAX_SIZE` + small buffer
2. Expired cache keys also have their locks removed
3. Existing lock stampede protection still works (per-key locking)
4. No race conditions introduced in cleanup

## Do NOT Touch

- `_cache` dict itself — eviction logic is fine
- `_cache_meta_lock` — this is correct
- `_CACHE_MAX_SIZE` value — 500 is fine
- TTL values — these are correct
