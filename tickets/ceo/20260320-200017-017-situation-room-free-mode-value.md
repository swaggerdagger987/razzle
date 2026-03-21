---
id: 20260320-200017-017
severity: P1
confidence: HIGH
flow: ceo-review
flow_name: CEO Review — Situation Room
found_by: Razzle (CEO)
date: 2026-03-20
status: TODO
type: structural
---

## Situation Room free mode (5 queries/day, generic) needs to deliver enough value to create upgrade desire

**PRIORITY: P1** | **Type: structural**
**Page**: agents.html
**Found by**: Razzle (CEO Review)

The Situation Room's free tier gives 5 generic queries/day with no league context. This is correct strategically -- generic mode is the teaser, league context is the sell. But "generic mode" needs to be good enough that users think "if this is the FREE version, the paid version must be incredible."

The current free mode shows a "generic analysis" hint and has a Pro upsell zone with a blurred league preview. This is fine mechanically. But the free mode responses themselves need to be genuinely useful -- not watered down.

**BEFORE** (what it is now):
- Free mode: 5 queries/day, no league context, "generic analysis" label
- Pro upsell zone shows blurred league preview
- Free responses work but feel intentionally limited

**AFTER** (what it should be):
- Free mode responses should use the full agent personality and analytical depth -- just without league-specific data
- After each free-mode response, show a contextual upsell: "With your league connected, Razzle would also tell you: [specific example of what league context adds]" -- e.g., "which of your leaguemates needs this player most" or "how this affects your championship odds"
- The upsell should be SPECIFIC to the query they just asked, not generic
- Show a side-by-side preview: "Generic mode said X. With your league, it would also say Y."
- Make the upgrade path one click: "Connect your league + upgrade to Pro" button right in the response

**WHY**: Free mode is the trial for the Situation Room. If it's too weak, users won't bother upgrading because they'll think the whole product is weak. If it's strong but clearly shows what's MISSING (league context), users upgrade because they can see the gap. The upsell should be "look at what you're NOT getting" rather than "this is the limited version."

### Task 1: Add contextual, query-specific upsell after free-mode agent responses
**Accept when**: After each free-mode response, the UI shows a specific example of what league context would add to THAT query, with a one-click upgrade path.
