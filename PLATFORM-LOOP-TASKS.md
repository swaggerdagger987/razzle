# Platform Loop — Phase 157 Task List

## Status
Current Phase: 157 (Situation Room — "What Can I Ask?" Format Reference Panel)
Current Task: 2
Current Stage: COMPLETE
Attempt: 1/3
Tasks Completed: 2/2
Loop Iterations: 2

---

## Phase Rationale

The system prompt mandates: "Razzle serves ALL fantasy formats. Dynasty, redraft, keeper, best ball, superflex, 2QB, IDP, DFS -- every format." The agent personas have 10+ use cases each across multiple formats, but users visiting the Situation Room have no idea what types of questions they can ask. The example chips show 6 generic scenarios, but there's no format-organized reference.

Adding a collapsible "What can I ask?" panel below the scenario examples gives users:
1. Immediate understanding of what the agents can do
2. Format-organized question suggestions (Redraft, Dynasty, Keeper/Best Ball, Universal)
3. One-click population of the scenario input from any suggestion
4. Confidence to ask real questions about their specific format

This is a conversion accelerator -- users who understand what they can ask are more likely to configure an API key and run their first query.

---

## Task 1: Format-Organized Question Reference Panel
**Requirement**: "Every agent must be deep enough that a user thinks 'I can't believe this thing just did that for me'" + agents must be "format-aware, not format-locked."
**Accept when**: (1) Collapsible `<details>` panel below scenario examples. (2) 4 columns: Redraft, Dynasty, Keeper/Best Ball, Universal. (3) 4-5 questions per column. (4) Clicking any question populates scenario input and closes panel. (5) Styled with Razzle design system. (6) Responsive on mobile.
**Depends on**: none
**Size**: S
**Primary role**: FRONTEND
**Status**: PASS — details/summary, 4-column grid, 19 clickable questions, auto-close on click, responsive CSS

## Task 2: QA + Syntax Verification
**Requirement**: No errors, page serves correctly.
**Accept when**: (1) agents.html inline JS passes. (2) Page serves 200. (3) HTML structure balanced.
**Depends on**: Task 1
**Size**: S
**Primary role**: QA
**Status**: PASS — JS syntax OK, page serves 200, details tag properly balanced
