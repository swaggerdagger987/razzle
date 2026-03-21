---
id: 20260320-200005-005
severity: P1
confidence: HIGH
flow: ceo-review
flow_name: CEO Review — Landing Page
found_by: Razzle (CEO)
date: 2026-03-20
status: TODO
type: structural
---

## Agent demo on landing page uses redacted text, hiding the value instead of showing it

**PRIORITY: P1** | **Type: structural**
**Page**: index.html
**Found by**: Razzle (CEO Review)

The AI agents section on the landing page shows two demo briefings with blacked-out/redacted text. The intent is "mysterious" -- like classified intel. But the effect is the opposite: the user can't see what the agents actually do, so they have no reason to care.

The redacted demo tells the user "we have something but we won't show you." That's not intrigue -- that's friction. Show a real, compelling, FULL example briefing. Let the quality of the output sell itself.

**BEFORE** (what it is now):
- Two agent briefing cards with redacted/blacked-out text
- Urgency badges visible (urgent/opportunity) but content obscured
- User cannot evaluate whether the AI output is good, generic, or impressive

**AFTER** (what it should be):
- Two fully visible example briefings showing what the agents actually produce
- Example 1 (Razzle briefing): A trade analysis showing a specific verdict with conviction -- "Accept this trade. Here's why." Include urgency tier, cross-agent references, specific player names and values.
- Example 2 (Diplomat briefing): A negotiation strategy for a specific trade target -- "Your leaguemate panic-sold WRs after Week 8 last year. Offer Diontae now while he's nervous about his WR depth."
- Use real-looking but fabricated league data so the examples feel personal and specific
- Add a subtle annotation: "This is what your agents see when they know your league" (Caveat font)
- Below the examples: "Connect your Sleeper league to unlock your agents" CTA

**WHY**: The agents are the premium product. They justify $80-150/year. But the landing page hides what they do behind redacted text. This is like a restaurant covering the menu photos with black tape and expecting diners to order. Show the output. Let the quality sell itself. A single compelling agent briefing -- with specific player names, conviction-driven verdicts, and cross-agent references -- will do more for conversion than any marketing copy.

### Task 1: Replace redacted demo briefings with fully visible, compelling examples
**Accept when**: The landing page shows at least two complete, unredacted agent briefing examples that demonstrate conviction-driven analysis with specific player names and actionable recommendations.
