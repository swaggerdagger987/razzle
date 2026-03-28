---
id: S2-018
severity: S2
category: performance
finding_ref: EDGE-32
confidence: HIGH
---

# S2-018: 40 threads competing for SQLite — lock contention risk

## Root Cause

`render.yaml:15`:
```yaml
startCommand: uvicorn backend.server:app --host 0.0.0.0 --port $PORT --workers 2
```

`backend/server.py:422`:
```python
loop.set_default_executor(ThreadPoolExecutor(max_workers=20))
```

`backend/db.py:92`:
```python
conn.execute("PRAGMA busy_timeout=30000")
```

2 uvicorn workers x 20 ThreadPoolExecutor threads = 40 threads all potentially hitting
SQLite simultaneously. With WAL mode, reads don't block reads, but writes still serialize.
The 30-second busy_timeout means threads can wait up to 30s for a write lock.

Under load (e.g., Draft Day traffic spike), this causes thread starvation as 40 threads
queue behind SQLite's single-writer lock.

## What to Fix

Reduce ThreadPoolExecutor from 20 to 8 workers:
```python
loop.set_default_executor(ThreadPoolExecutor(max_workers=8))
```

This gives 2 workers x 8 threads = 16 concurrent threads, which is more appropriate
for SQLite's single-writer model. Most requests are reads (which parallelize in WAL mode),
so throughput should not decrease.

## Files to Change

- `backend/server.py` — Change `max_workers=20` to `max_workers=8`

## Acceptance Criteria

- [ ] ThreadPoolExecutor max_workers reduced to 8
- [ ] No visible performance regression on read-heavy workloads
- [ ] busy_timeout can be reduced from 30000 to 10000 as contention decreases

## Do NOT

- Do not reduce uvicorn workers below 2 (needed for availability during restarts)
- Do not switch to a different database — SQLite is sufficient for target scale
