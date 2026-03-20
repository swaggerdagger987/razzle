---
id: 20260320-170003-003
severity: P0
confidence: HIGH
flow: bureau
flow_name: Bureau — Self-Scout Tab (FREE)
found_by: Office Hours Design Doc
date: 2026-03-20
status: TODO
type: structural
---

## Build the Self-Scout tab with Hawkeye's roster analysis

**PRIORITY: P0** | **Type: structural**
**Page**: league-intel.html
**Design doc**: docs/bureau-design.md (Self-Scout Tab section)

The Self-Scout tab is FREE — this is where the user's own roster gets analyzed in depth. Delivered by Hawkeye (eagle scout agent).

**Contents:**
1. Hawkeye agent header with quote: "i've been watching your roster. here's what the tape says."
2. Roster Grade Overview: overall letter grade (A-F), competitive window tag (CONTENDER/RETOOLING/REBUILDING)
3. Positional Depth Grid: 4 cards (QB/RB/WR/TE) with letter grade, starter name + PPG, bench depth count, average starter age, strength/weakness flag
4. Build Profile: archetype tag (Hero RB, Zero RB, Stars & Scrubs, Youth Movement, Win Now, Balanced)
5. Competitive Window: years remaining based on age curve + roster quality
6. Hawkeye's Recommendation: template-driven advice based on weakest position

**Data sources:** Rosters from Sleeper API, player stats from terminal.db /api/players endpoint.

**Grading logic:** Compare each position group's total PPG against league-wide positional averages. A = top 15%, B = 15-40%, C = 40-60%, D = 60-85%, F = bottom 15%.

### Task 1: Implement Self-Scout tab
**Accept when**: Clicking the Self-Scout tab shows Hawkeye's agent header, overall roster grade, 4 position depth cards with grades, build profile tag, competitive window, and a recommendation. All data computed from real Sleeper roster + terminal.db stats. Styled per DESIGN.md with teal accent (Hawkeye's color).
