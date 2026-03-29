---
severity: S2
confidence: HIGH
category: refactor
source: bloat-audit-2026-03-29
---

# R1: Extract @cached_query decorator to eliminate 111 wrapper pairs

## What's Wrong

Every function in live_data/ follows this pattern:

```python
def fetch_X(season=None, position=None):
    return _cached("fetch_X:season:position", lambda: _fetch_X_uncached(season, position))

def _fetch_X_uncached(season, position):
    with get_db() as conn:
        # actual query logic
```

This wrapper+uncached pair is repeated **111 times** across 7 files. The wrapper adds 3-5 lines per function for zero logic — just cache key construction and a lambda.

## The Fix

Create a `@cached_query` decorator in `backend/live_data/core.py` that replaces the wrapper pattern:

```python
import functools

def cached_query(ttl=None, key_prefix=None):
    """Decorator that caches function results using the existing _cached() infrastructure.
    Cache key is auto-generated from function name + all arguments."""
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            prefix = key_prefix or fn.__name__
            # Build cache key from all args
            key_parts = [prefix]
            key_parts.extend(str(a) for a in args)
            key_parts.extend(f"{k}={v}" for k, v in sorted(kwargs.items()))
            cache_key = ":".join(key_parts)
            return _cached(cache_key, lambda: fn(*args, **kwargs), ttl=ttl)
        return wrapper
    return decorator
```

Then refactor each file. Example transformation:

BEFORE (7 lines):
```python
def fetch_featured():
    def _query():
        return _fetch_featured_uncached()
    return _cached("featured", _query)

def _fetch_featured_uncached():
    with get_db() as conn:
        # 50 lines of query logic
```

AFTER (3 lines):
```python
@cached_query()
def fetch_featured():
    with get_db() as conn:
        # 50 lines of query logic (unchanged)
```

## Files to Modify

1. `backend/live_data/core.py` — Add `cached_query` decorator (15 lines)
2. `backend/live_data/tools.py` — 28 wrapper pairs → 28 decorated functions
3. `backend/live_data/college.py` — 20 wrapper pairs
4. `backend/live_data/players.py` — 18 wrapper pairs
5. `backend/live_data/analytics.py` — 14 wrapper pairs
6. `backend/live_data/dynasty.py` — 13 wrapper pairs
7. `backend/live_data/dashboards.py` — 9 wrapper pairs
8. `backend/live_data/prospects.py` — 9 wrapper pairs

**Do one file at a time. Run tests after each. Commit each file separately.**

## Acceptance Criteria

- [ ] `cached_query` decorator exists in core.py
- [ ] All 111 `_cached()` call sites replaced with `@cached_query` decorators
- [ ] All `_fetch_*_uncached()` functions renamed to `fetch_*()` (the decorator handles caching)
- [ ] `PYTHONPATH=. python -m pytest tests/ -q` passes after each file
- [ ] `backend/live_data/__init__.py` still exports the same public API
- [ ] Line count across all 7 files decreases by 500+ lines
- [ ] No new imports needed by files that import from live_data

## Estimated Savings

~111 wrapper functions x 4 lines avg = **~450 lines eliminated**
Plus 111 `_uncached` function renames save namespace clutter.
