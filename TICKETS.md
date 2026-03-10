# Razzle Loop — Ticket Queue

> Drop phase specs here. The loop checks this file before auto-generating its next phase.
> When a ticket is consumed, it gets deleted from this file.
> Format: each ticket is a full phase spec (same format as LOOP-TASKS.md).
> Multiple tickets = multiple phases, executed in order (first one becomes next phase).

---

## Backend Cleanup: Add Structured Logging
**Exit Criterion**: Replace bare `except Exception` blocks with proper logging using Python's `logging` module. Add request logging middleware (method, path, status, duration). Log all errors with stack traces. Structured JSON format for production. Console format for local dev. No silent failures anywhere in the backend.
