# Platform Loop — Phase 145 Task List

## Status
Current Phase: 145 (Format-Aware Agents + Backend Hardening)
Current Task: COMPLETE
Current Stage: PHASE GATE
Attempt: -
Tasks Completed: 5/5
Loop Iterations: 5

---

## Task 1: Format-Aware League Context in Agent Prompts
**Requirement**: "Agents must detect the user's league format from Sleeper settings and adapt their reasoning accordingly."
**Accept when**: warroom.js formatLeagueContext() includes explicit format detection, injects format-specific instructions into agent prompts
**Depends on**: none
**Size**: M
**Primary role**: FRONTEND
**Status**: PASS

## Task 2: Agent Persona Format-Awareness Sections
**Requirement**: "Format-aware logic — the agent detects league format and adjusts analysis."
**Accept when**: All 6 agent persona files include a "Format-Aware Logic" section
**Depends on**: none
**Size**: M
**Primary role**: FRONTEND
**Status**: PASS

## Task 3: SQLite Connection Pooling
**Requirement**: "Add connection pooling for Turso / SQLite" (Backend Audit Priority Fix #3)
**Accept when**: db.py implements connection pool, get_db() uses pooled connections
**Depends on**: none
**Size**: S
**Primary role**: BACKEND
**Status**: PASS

## Task 4: Structured Logging with Request IDs
**Requirement**: "Add structured logging with request IDs" (Backend Audit Priority Fix #7)
**Accept when**: Middleware assigns X-Request-ID, log entries include request_id, timing info logged
**Depends on**: none
**Size**: S
**Primary role**: BACKEND
**Status**: PASS

## Task 5: Tools Hub Inline JSON Extraction
**Requirement**: "The tools_hub endpoint returns a hardcoded JSON blob — should be a separate JSON file"
**Accept when**: tools_hub data in config file, endpoint reads from file, server.py reduced
**Depends on**: none
**Size**: S
**Primary role**: BACKEND
**Status**: PASS
