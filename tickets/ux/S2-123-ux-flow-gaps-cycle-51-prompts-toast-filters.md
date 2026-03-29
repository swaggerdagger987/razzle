---
id: S2-123
severity: S2
confidence: MEDIUM
category: ux-flow
source: DQ-391+393+394+395+397+398+400
status: OPEN
---

# UX flow gaps from design QA cycle 51 — 7 items

## Findings

1. **DQ-391**: Pricing FAQ says Pro/Elite have "same features" — factually wrong. Pro lacks server-side AI.
   - `frontend/pricing.html:401` — FAQ answer text
   - **Fix**: Rewrite to say "Same analytical features. The difference is AI setup."

2. **DQ-393**: "Use in Situation Room" button on prompts.html saves to localStorage silently — no toast or feedback.
   - `frontend/prompts.html:264` — onclick handler
   - **Fix**: Add `_showToast('Saved to Situation Room')` after localStorage write.

3. **DQ-394**: Lab keyboard hint "H R B L I T D G A" is cryptic — no context.
   - `frontend/lab.html:3398` — hint text
   - **Fix**: Add tooltips or replace with "Press ? for shortcuts" link.

4. **DQ-395**: "Fantasy Only" toggle label describes result, not action — semantically confusing.
   - `frontend/lab.html:3386` — button label
   - **Fix**: Change to "Hide Non-Fantasy" or "Show Fantasy Players Only" with active state indicator.

5. **DQ-397**: Prompts.html truncated text at 120px max-height with no expand indicator.
   - `frontend/prompts.html:69-71` — CSS max-height
   - **Fix**: Add "..." fade or "show more" link.

6. **DQ-398**: Toast (z-index: 9999) and auth modal (z-index: 9999) share same z-index — collision risk.
   - `frontend/styles.css:647` (toast), `frontend/styles.css:1609` (auth modal overlay)
   - **Fix**: Bump toast to z-index: 10001 or auth modal to 10000.

7. **DQ-400**: Lab Smart Filters buried at end of filter bar — beginners miss discoverable UX.
   - `frontend/lab.html:3445-3453` — smart filter position in toolbar
   - **Fix**: Move smart filters earlier in the bar or add a subtle "Try Smart Filters" onboarding hint.

## Acceptance Criteria

- [ ] Each item addressed individually — can be split into sub-commits
- [ ] No regressions in keyboard shortcuts, filter behavior, or auth flow
