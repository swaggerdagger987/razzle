---
id: 20260320-200018-018
severity: P2
confidence: HIGH
flow: ceo-review
flow_name: CEO Review — Global
found_by: Razzle (CEO)
date: 2026-03-20
status: TODO
type: personality
---

## Empty states and error messages are functional but lack Razzle's personality

**PRIORITY: P2** | **Type: personality**
**Page**: All pages
**Found by**: Razzle (CEO Review)

Loading states are great: "pulling film...", "checking the tape...", "scouting the competition..." -- these have Razzle's voice. But empty states and error messages fall back to generic patterns: "no active operations this season", "agent not found in the field", "something broke... try refreshing."

Empty states are opportunities for personality. They're also moments where users are frustrated or confused -- exactly when a little charm goes the furthest.

**BEFORE** (what it is now):
- "no active operations this season. try a different year."
- "agent not found in the field. check the callsign and try again."
- "the wire went dark. check your connection and retry."
- "something broke... try refreshing"

**AFTER** (what it should be):
- "no operations this season. either this manager took the year off, or we need better intel. try another season." (Caveat annotation: "everyone's got a down year")
- "can't find that agent. double-check the name -- even Razzle makes typos. rarely, but it happens."
- "connection dropped. the film room went dark. we'll be back -- check your internet and try again."
- "something went sideways. Razzle knocked the server off the table. refresh and we'll pretend it didn't happen."
- Add a small pixel art Razzle sprite (shrug pose or confused pose) next to error messages

**WHY**: Every empty state is a brand touchpoint. Generic error messages feel like the product was built by someone who doesn't care. Personality in error states signals that a real team (or tiger) built this and thought about every moment of the user's experience. This is a polish ticket, not a conversion ticket, but it compounds into brand loyalty.

### Task 1: Rewrite empty states and error messages with Razzle personality
**Accept when**: All empty states and error messages across all pages use Razzle's voice (confident, slightly self-deprecating, never cold) and include a small visual element (pixel art sprite or tiger emoji).
