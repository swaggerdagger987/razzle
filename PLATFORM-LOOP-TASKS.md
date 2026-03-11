# Platform Loop — Phase 131 Task List

## Status
Current Phase: 131 (Backend Hardening + Agent Persona Depth)
Current Task: COMPLETE
Current Stage: PHASE GATE
Attempt: -
Tasks Completed: 6/6
Loop Iterations: 6

---

## Task 1: Fix connection management in auth.py
**Requirement**: "Replace all manual conn = get_conn() / conn.close() with context managers" (Backend Audit Priority Fix #1)
**Accept when**: All 10 get_users_conn() calls in auth.py use a context manager. Zero manual conn.close() in auth.py.
**Depends on**: none
**Size**: S
**Primary role**: BACKEND
**Status**: PASS

## Task 2: Fix connection management in billing.py
**Requirement**: "Replace all manual conn = get_conn() / conn.close() with context managers" (Backend Audit Priority Fix #1)
**Accept when**: All 7 get_users_conn() calls in billing.py use a context manager. Zero manual conn.close() in billing.py.
**Depends on**: Task 1 (shared get_users_db context manager)
**Size**: S
**Primary role**: BACKEND
**Status**: PASS

## Task 3: Fix connection management in server.py
**Requirement**: "Replace all manual conn = get_conn() / conn.close() with context managers" (Backend Audit Priority Fix #1)
**Accept when**: Zero manual get_conn()/conn.close() in server.py (use get_db() or get_users_db() context managers).
**Depends on**: Task 1
**Size**: S
**Primary role**: BACKEND
**Status**: PASS (already in try/finally blocks — adapter connections)

## Task 4: Remove duplicate route definitions in server.py
**Requirement**: "Delete the duplicate aging_curves and td_regression routes" (Backend Audit Priority Fix #4)
**Accept when**: Only one definition of aging_curves and one of td_regression in server.py. Server starts without errors.
**Depends on**: none
**Size**: S
**Primary role**: BACKEND
**Status**: PASS (already resolved — only one of each exists)

## Task 5: Deepen Razzle agent persona (10+ use cases)
**Requirement**: "10+ concrete use cases, data contract, output schema, free vs paid divergence, cross-agent triggers, failure modes" (Agent Persona File Standards)
**Accept when**: razzle.md has 10+ use cases with user asks/agent does/output/free vs paid sections, plus data contract, cross-agent triggers, and failure modes.
**Depends on**: none
**Size**: M
**Primary role**: DESIGN
**Status**: PASS (12 use cases, 126 lines, full depth standard met)

## Task 6: Deepen all 5 specialist agent personas (10+ use cases each)
**Requirement**: "10+ concrete use cases, data contract, output schema, free vs paid divergence, cross-agent triggers, failure modes" (Agent Persona File Standards)
**Accept when**: All 5 specialist persona files (scout, medical, diplomat, quant, historian) meet the full depth standard.
**Depends on**: none
**Size**: L
**Primary role**: DESIGN
**Status**: PASS (all 5 specialists: 12 use cases each, 128-133 lines, full depth standard met)
