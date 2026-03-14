# Razzle Ship Loop — Task Tracker

## Current State
- Phase: Pre-Launch Verification — N-8 Funnel Event Analytics
- Current Task: 1
- Current Stage: PASS
- Tasks Completed: 1/1
- Loop Iterations: 1

## Phase: Pre-Launch Verification — N-8 Funnel Event Analytics
**Exit Criterion**: Can answer "how many people registered/connected Sleeper/ran agent queries today?" from server-side data.

### Task 1: Add funnel event tracking
**Requirement**: Add events table and log_event() function. Instrument register, login, sleeper_connect, checkout, agent_query endpoints. Enhance analytics summary to include event counts.
**Accept when**: Events table created on startup. 6 funnel endpoints log events. Analytics summary returns event breakdowns.
**Depends on**: none
**Size**: M
**Status**: PASS
**Attempts**: 1
**Notes**: Added events table (event_type TEXT, detail TEXT, created_at TEXT) with indexes on type and created_at. Added log_event() in storage.py. Instrumented 6 endpoints in server.py: register, login, sleeper_connect (with username), checkout (with interval), agent_query (with byok/elite/free detail). Enhanced get_analytics_summary() with events_by_type and events_by_day queries. Exported log_event from __init__.py. All 59 tests pass.
