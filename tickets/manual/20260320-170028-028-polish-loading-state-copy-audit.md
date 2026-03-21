---
id: 20260320-170028-028
severity: P2
confidence: HIGH
flow: global
flow_name: Polish — Loading State Copy Audit
found_by: Backlog
date: 2026-03-20
status: TODO
type: structural
---

## Audit and replace all "Loading..." text with Razzle-voiced copy

**PRIORITY: P2** | **Type: structural**
**Page**: all pages
**Design doc**: docs/DESIGN.md

No loading state in the app should say "Loading..." or "Please wait." Every loading state should use Razzle's voice: "pulling film...", "crunching the numbers...", "hawkeye's reviewing the tape...", "octo's running simulations...", etc. Conduct a full audit of every loading state across all pages and replace generic copy with contextual, agent-voiced loading messages in Caveat font.

### Task 1: Replace all generic loading states with Razzle voice
**Accept when**: A full-text search for "Loading" (case-insensitive) across all frontend files returns zero generic loading messages. Every loading state uses contextual copy in Caveat font. Lab screener says "pulling film..." Bureau says agent-specific messages per loading phase. Situation Room says "the agents are conferring..." At least 10 unique loading messages across the app.
