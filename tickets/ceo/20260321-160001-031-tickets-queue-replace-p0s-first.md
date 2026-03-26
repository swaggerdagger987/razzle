# CEO-031: Replace TICKETS.md Queue — CEO P0s First

**ID**: 20260321-160001-031
**Page**: Process
**Type**: execution
**Severity**: P0
**Created**: 2026-03-21 (CEO Review #3)

## Problem

TICKETS.md contains 3 phases of "Agent Connective Tissue" work (13+ tasks). CEO Reviews #1-3 have written 7 P0 tickets that address launch-blocking product issues. Zero P0 tickets have been consumed. The queue is executing in the wrong order.

## BEFORE

TICKETS.md queue:
1. Agent Presence — Layer 1 Foundation (8 tasks)
2. Agent Presence — Layer 1 Bureau Extension (3 tasks)
3. Agent Presence — Layer 2 Domain Ownership (2+ tasks)

CEO P0 tickets (001, 002, 003, 007, 019, 020, 021, 022, 023): not in queue.

## AFTER

TICKETS.md queue:
1. Landing page hero rewrite (CEO-001)
2. Landing page live data embed (CEO-002)
3. Bureau demo mode for non-Sleeper users (CEO-007)
4. Lab quick-start paths (CEO-021)
5. Server-side AI queries for Pro (CEO-020)
6. Page consolidation — standalone → Lab redirects (CEO-022)
7. Free tier panel rebalancing (CEO-024)

Agent Connective Tissue work preserved in `docs/plans/agent-connective-tissue-tickets.md` for execution after P0 queue is clear.

## Acceptance Criteria

- [ ] Current TICKETS.md agent work moved to `docs/plans/agent-connective-tissue-tickets.md`
- [ ] TICKETS.md replaced with CEO P0 ticket specs in priority order
- [ ] Each ticket in TICKETS.md has full task specs (accept-when criteria, implementation guidance)
