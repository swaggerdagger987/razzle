# S3-046: _waitlist_rate dict only cleans up at 5000+ entries

**Severity**: S3 (Low)
**Category**: backend
**Source**: EDGE-CASES.md #69
**Found**: 2026-03-28
**Status**: OPEN

## Root Cause

`backend/server.py:2012-2030` — `_waitlist_rate` dict stores IP→timestamp for waitlist rate limiting. Cleanup only triggers when dict exceeds 5000 entries, and only removes entries older than 120 seconds.

```python
_waitlist_rate: dict[str, float] = {}  # Line 2012

# Lines 2024-2027: Cleanup only at 5000+
if len(_waitlist_rate) > 5000:
    stale = [k for k, v in _waitlist_rate.items() if now_ts - v > 120]
    for k in stale:
        del _waitlist_rate[k]
```

Under sustained traffic with many unique IPs, entries accumulate up to 5000 before any cleanup occurs. This is ~400KB of memory (trivial) but represents poor hygiene.

## Fix

Lower the cleanup threshold to 500, or add TTL-based periodic cleanup. Alternatively, use a `collections.OrderedDict` with max size and FIFO eviction.

## Files to Change

- `backend/server.py:2024` — lower threshold from 5000 to 500

## Accept When

1. `_waitlist_rate` never exceeds ~500 entries under normal traffic
2. Stale entries are cleaned up aggressively
