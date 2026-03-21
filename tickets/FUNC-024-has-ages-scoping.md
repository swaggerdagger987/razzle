# FUNC-024: Featured endpoint breakout_candidates silently fails if dynasty_risers throws

**Severity**: P2 — "This tool is annoying to use"
**Flow**: 1 (Landing → Lab)
**Found**: Session 28 (2026-03-20)
**Status**: RESOLVED — Ship Loop commit 6d54a5d added `has_ages = False` before try block (tools.py:34). Verified session 32.

## Summary

Ship Loop introduced a variable scoping bug in the `/api/featured` endpoint. The `has_ages` variable is defined inside the `try` block for dynasty_risers (line 38), but referenced in the separate `try` block for breakout_candidates (line 102). If the dynasty_risers query fails for any reason, `has_ages` is never defined, causing a `NameError` that silently empties the breakout_candidates section.

## Root Cause

`backend/live_data/tools.py:38-102`:
```python
# Block 1 (line 37-70)
try:
    has_ages = conn.execute(...)  # ← defined HERE
    ...
except Exception:
    results["dynasty_risers"] = []
    # has_ages is NEVER defined if this except runs

# Block 3 (line 101-130)
try:
    breakout_age_filter = "..." if has_ages else ""  # ← NameError if block 1 threw
    ...
except Exception:
    results["breakout_candidates"] = []  # ← silently returns empty
```

## Impact

If the dynasty_risers query ever fails (table issue, timeout, schema change), the breakout_candidates section disappears too — a cascade failure the user can't diagnose. The landing page shows empty breakout candidates with no error.

## Fix

Define `has_ages = False` before the try block:

```python
results = {}
has_ages = False  # ← default before any try blocks

# 1. Dynasty Risers
try:
    has_ages = conn.execute(...).fetchone()[0] > 10
    ...
```

## Confirmed

```python
# Simulated:
try:
    raise Exception('simulated DB error')
    has_ages = True
except Exception:
    pass
breakout_age_filter = "..." if has_ages else ""  # → NameError
```

## Introduced By

Ship Loop commit `5188dc0` ("Fix featured endpoint returning empty when player ages are NULL").
