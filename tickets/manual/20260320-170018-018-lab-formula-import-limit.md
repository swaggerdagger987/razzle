---
id: 20260320-170018-018
severity: P1
confidence: HIGH
flow: lab
flow_name: Lab — Formula Import Limit Enforcement
found_by: Backlog
date: 2026-03-20
status: TODO
type: structural
---

## Enforce formula import limit for free users (3 formulas max)

**PRIORITY: P1** | **Type: structural**
**Page**: lab.html
**Design doc**: docs/NORTH_STAR.md

Free users can save up to 3 custom formulas in the Lab. Beyond that, they need to upgrade to Pro for unlimited formulas. The limit should be enforced both when creating new formulas and when installing from the Formula Store. When the limit is hit, show which formulas they have saved, offer to replace one, or show the Pro upgrade CTA. Pro users have unlimited formula slots.

### Task 1: Implement formula slot limiting with upgrade gate
**Accept when**: Free users can save exactly 3 formulas. Attempting to save a 4th shows a gate with their current 3 formulas, an option to replace one, and a "Go Pro for unlimited formulas" CTA. The limit applies to both user-created formulas and Formula Store installs. Pro users see no limit. Formula count is displayed in the UI (e.g., "2/3 formulas used").
