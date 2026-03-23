# DQ-163: 3 loading text strings use generic verbs — violate voice guide

**Priority:** P3
**Area:** Brand Voice
**Type:** Design guide violation
**Impact:** Generic loading text breaks the personality-first voice defined in DESIGN.md

---

## Problem

DESIGN.md specifies personality-driven loading states: "pulling film...", "checking the tape...", "running the numbers..." — never generic verbs like "analyzing" or "crunching." Three loading strings violate this.

### Violations

1. **airyards.html** — "analyzing air yards data..."
   - Line 377 (HTML initial div)
   - Line 656 (JS innerHTML reset)

2. **explorer.html** + **lab-panels.js** — "crunching numbers..."
   - explorer.html:278 (HTML initial div)
   - explorer.html:658 (JS innerHTML reset)
   - lab-panels.js:7347 (inline in panel HTML string)

3. **lab.js** + **lab.html** — "analyzing draft classes..."
   - lab.js:8692 (dynamic: `analyzing ${position} draft classes...`)
   - lab.html:3780 (static fallback)

## Fix

Replace with personality text:
1. "analyzing air yards data..." -> "studying the routes..."
2. "crunching numbers..." -> "running the numbers..." (already in RAZZLE_LOADING array)
3. "analyzing draft classes..." -> "scouting the class..."

## Verification
- Load each page — loading text should match DESIGN.md personality voice.
