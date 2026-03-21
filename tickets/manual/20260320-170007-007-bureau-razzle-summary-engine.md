---
id: 20260320-170007-007
severity: P0
confidence: HIGH
flow: bureau
flow_name: Bureau — Razzle Summary Template Engine
found_by: Backlog
date: 2026-03-20
status: TODO
type: structural
---

## Build the Razzle summary template engine for fill-in-the-blank briefings

**PRIORITY: P0** | **Type: structural**
**Page**: league-intel.html
**Design doc**: docs/bureau-design.md

Every Bureau tab needs a Razzle-voiced summary paragraph that reads like a scouting briefing, not a data dump. Build a template engine that takes structured data (odds, grades, tags) and produces natural-language briefings using fill-in-the-blank templates. Each agent has their own voice and templates. No LLM calls — pure client-side string interpolation with conditional branches based on data thresholds.

### Task 1: Implement template engine with agent-specific briefings
**Accept when**: The Overview tab shows a Razzle summary paragraph generated from templates (e.g., "you're sitting at {odds}% championship odds — {rank_descriptor} in a {league_size}-team league. {strength_sentence} {weakness_sentence}"). Self-Scout shows Hawkeye's briefing. Templates vary based on data (contender vs rebuilder gets different copy). All briefings use Caveat font and feel hand-written. At least 3 template variants per agent to avoid repetition.
