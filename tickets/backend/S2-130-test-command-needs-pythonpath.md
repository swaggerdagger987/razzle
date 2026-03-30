---
severity: S2
confidence: HIGH
category: backend-ci
source: go-live-audit-2026-03-29
audit_ref: "Finding 6: Test command not reproducible without manual PYTHONPATH"
---

# pytest fails without manual PYTHONPATH=. — CI fragility

## What's Wrong

Running `pytest -q` from the repo root fails because `tests/conftest.py:6` does `from backend.server import app`, which requires the repo root on `sys.path`. The test only passes with `PYTHONPATH=. pytest -q`.

This is fragile for CI and for any developer who clones the repo. No `pyproject.toml`, `setup.py`, or `conftest.py` sys.path hack ensures it works out of the box.

## Root Cause

**File**: `tests/conftest.py:6` — `from backend.server import app`
**Missing**: No `pyproject.toml` or `setup.cfg` with package discovery, and no `sys.path` insert in conftest.

## The Fix

Add a `sys.path` insert at the top of `tests/conftest.py` so pytest works without PYTHONPATH:

**File**: `tests/conftest.py` — add before existing imports:

```python
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
```

Or alternatively, create a minimal `pyproject.toml` if one doesn't exist:

```toml
[project]
name = "razzle"
version = "0.1.0"

[tool.pytest.ini_options]
pythonpath = ["."]
```

Either approach makes `pytest -q` work from the repo root without manual env setup.

## Acceptance Criteria

- [ ] `pytest -q` passes from repo root without setting PYTHONPATH manually
- [ ] All 58+ existing tests still pass
- [ ] No new files needed if the conftest.py fix is used

## Context

Go-live audit finding. Makes the test suite reliable for CI and new contributors. Quick fix.
