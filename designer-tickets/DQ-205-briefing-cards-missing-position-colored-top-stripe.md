---
id: DQ-205
priority: P2
category: design spec / brand identity
status: open
---

# Briefing cards missing position-colored 6px top stripe

## Problem

DESIGN.md line 159: "Cards: 3px ink border, offset shadow, position-colored top stripe (6px)." The Situation Room briefing cards have the correct 3px border and 4px shadow, but NO colored top stripe. Every agent has a distinct color (Razzle=#d97757, Dr. Dolphin=#2ec4b6, Hawkeye=#5b7fff, etc.) but the cards don't use it as a top stripe.

This is distinct from DQ-057 (dashboard cards) — this is specifically about the briefing output cards in agents.html.

## Evidence

agents.html line 858-864:
```css
.briefing-card {
  background: var(--bg-card);
  border: 3px solid var(--ink);
  border-radius: 12px;
  box-shadow: 4px 4px 0 var(--ink);
  overflow: hidden;
}
```

No `border-top` override. The agent's color only appears as a small dot in the header (warroom.js ~line 3238), not as a card-level stripe.

## Fix

Add `border-top: 6px solid` with the agent's color when rendering each briefing card. In warroom.js where briefing cards are created, add an inline style:

```javascript
cardDiv.style.borderTop = '6px solid ' + agent.color;
```

Or use a CSS class per agent:
```css
.briefing-card[data-agent="razzle"] { border-top: 6px solid var(--orange); }
.briefing-card[data-agent="dolphin"] { border-top: 6px solid var(--green); }
```

## Files
- `frontend/agents.html` line 858 (CSS)
- `frontend/warroom.js` ~line 3230 (card rendering)
