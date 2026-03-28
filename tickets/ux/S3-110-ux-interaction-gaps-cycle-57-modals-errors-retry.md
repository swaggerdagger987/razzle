---
id: S3-110
severity: S3
confidence: MEDIUM
category: ux-flow
source: DQ-441+442+444+446+448+449
status: OPEN
---

# UX interaction gaps from design QA cycle 57 — 6 items

## Findings

1. **DQ-441**: Modal overlays (filter, column-picker) have zero open/close animation — instant display toggle.
   - `frontend/lab.html:896-956` — overlay display: none/block
   - **Fix**: Add 0.15s opacity/transform transition for open/close.

2. **DQ-442**: Error state and empty state are visually indistinguishable in standalone panels.
   - `frontend/breakouts.html:548,555`, `frontend/aging.html:745`
   - **Fix**: Error states should use red accent border; empty states should use neutral.

3. **DQ-444**: 5+ standalone panels lack retry button after API error.
   - `frontend/breakouts.html:548`, `frontend/aging.html:745`, buysell, scarcity, yoy
   - **Fix**: Add "Retry" button in error state that re-fetches data.
   - Note: S2-112 covers API error recovery in lab-panels.js; this covers standalone pages.

4. **DQ-446**: hideHoverCard() uses display:none which kills CSS opacity transition.
   - `frontend/lab.js:2252-2253`
   - **Fix**: Use opacity: 0 + pointer-events: none, then remove after transition.

5. **DQ-448**: Lab weekly row expand error shows text but no retry button.
   - `frontend/lab.js:2431`
   - **Fix**: Add retry link in error message.

6. **DQ-449**: breakouts.html error handler uses `.breakouts-empty` class for errors — wrong semantics.
   - `frontend/breakouts.html:325,548,555`
   - **Fix**: Use `.breakouts-error` class with distinct styling.

## Acceptance Criteria

- [ ] Each item can be fixed independently
- [ ] Error states visually distinct from empty states
- [ ] Retry buttons functional after API errors
