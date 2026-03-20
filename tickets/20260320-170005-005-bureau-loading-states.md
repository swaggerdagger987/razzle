---
id: 20260320-170005-005
severity: P1
confidence: HIGH
flow: bureau
flow_name: Bureau — Loading & Error States
found_by: Office Hours Design Doc
date: 2026-03-20
status: TODO
type: structural
---

## Build Bureau loading sequence and error states

**PRIORITY: P1** | **Type: structural**
**Page**: league-intel.html
**Design doc**: docs/bureau-design.md (Error & Loading States section)

The Bureau needs charm in every state — loading, error, empty. No generic spinners.

**Loading sequence (after Connect click):**
1. Button text: "connecting..." (Caveat, animated dots)
2. Sleeper API calls: skeleton cards with "pulling your league data..." (Caveat)
3. League selector (if 2+ leagues): card list, most recent pre-selected
4. Roster + stats fetch (parallel): "hawkeye's reviewing the tape..."
5. Monte Carlo: spinning Octo animation with "octo's crunching 10,000 simulations..."
6. Full reveal: hero number fades in

**Error states (all in Caveat, warm tone):**
- Invalid username: "couldn't find that username on Sleeper. double-check the spelling."
- API down: "sleeper's servers are napping. try again in a minute." + retry button
- Rate limited: silent exponential backoff (500ms → 1s → 2s → 4s), show "this is taking a sec"
- No dynasty leagues: "looks like you're in redraft leagues. razzle is dynasty-first. explore the free Screener."
- Empty roster: "this league hasn't drafted yet. come back after the draft."
- Broken history chain: History tab shows "not enough league history" gracefully

### Task 1: Implement loading and error states
**Accept when**: Every loading phase has a Razzle-voiced message (not generic). Every error has a warm, helpful message with a recovery action. Multi-league selector appears for users with 2+ leagues.
