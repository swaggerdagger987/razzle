---
id: 20260320-200010-010
severity: P1
confidence: HIGH
flow: ceo-review
flow_name: CEO Review — Situation Room
found_by: Razzle (CEO)
date: 2026-03-20
status: TODO
type: structural
---

## Agent personas in the Situation Room have minimal visual presence -- emoji + tiny pixel art

**PRIORITY: P1** | **Type: structural**
**Page**: agents.html
**Found by**: Razzle (CEO Review)

The six agents are the premium product. They're what justifies $80-150/year. But on the Situation Room page, each agent is represented by a small emoji and a 32x48 pixel art avatar. The bio cards exist but the agents don't feel like characters you'd develop a relationship with.

Compare to how Sleeper presents its mascots or how KeepTradeCut brands its tools. The agents need visual weight. They need personality that leaps off the screen. A user should look at Hawkeye (Scout) and think "I want to hear what this eagle thinks about my waiver pickup."

**BEFORE** (what it is now):
- Agents shown as emoji + small pixel art avatars (32x48px)
- Bio cards with text descriptions of each agent's expertise
- Functional but flat -- the agents feel like menu items, not characters

**AFTER** (what it should be):
- Larger agent cards (at least 200px wide) with prominent pixel art sprites scaled up (128x192px, image-rendering: pixelated)
- Each card shows: agent name, title/role in display font, a one-line personality quote in Caveat ("I already looked at the tape." -- Hawkeye), and 3 expertise tags
- Agent cards are arranged in a 2x3 or 3x2 grid, not a list
- Hovering an agent card slightly enlarges it and shows the agent's "thinking" sprite frame
- Each agent card has a "Ask [Agent Name]" button that pre-selects that agent in the scenario input
- Razzle's card is visually distinct (larger, orange border, "Chief of Staff" badge)
- The pixel canvas with walking agents stays as ambient background below the agent cards

**WHY**: The agents are characters, not features. Characters create emotional attachment. Emotional attachment creates retention. A user who thinks of Hawkeye as "their scout" or The Fox as "their trade negotiator" will renew their subscription because they'd miss their agents. The current UI treats agents as interchangeable function buttons. The new UI treats them as a team you hire.

### Task 1: Redesign agent presentation with larger, character-driven cards
**Accept when**: Each agent has a visually prominent card with scaled-up pixel art, personality quote, expertise tags, and direct "Ask" button. Razzle's card is visually distinguished as the leader.
