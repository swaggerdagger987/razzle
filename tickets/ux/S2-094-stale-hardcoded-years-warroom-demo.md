---
id: S2-094
severity: S2
confidence: HIGH
category: content-accuracy
source: DQ-243+296+274+316
status: OPEN
---

# Stale hardcoded years in warroom demo content and sample prompts

## Root Cause

Multiple hardcoded year references that will become stale:

1. `frontend/warroom.js:1652`:
   ```javascript
   "Evaluating 2025 rookie draft class — who's the 1.01?"
   ```
   Sample prompt hardcodes 2025 instead of using current draft year.

2. Demo briefing cards and league data reference specific years/players that become stale each season. The sample prompts, demo content, and placeholder text should use dynamic year references or at minimum reference the current NFL season.

## Fix

1. Replace hardcoded year strings in sample prompts with dynamic calculation:
   ```javascript
   const draftYear = new Date().getMonth() >= 3 ? new Date().getFullYear() : new Date().getFullYear();
   ```
2. Audit all demo/sample content for hardcoded years
3. Consider using a `_currentDraftYear()` helper (already exists in backend)

## Files

- `frontend/warroom.js:1652` — sample prompts with hardcoded "2025"
- `frontend/warroom.js` — demo briefing content
- `frontend/index.html` — demo league data (if hardcoded)

## Acceptance Criteria

- No hardcoded year references in demo/sample content
- Sample prompts reference current or upcoming draft year dynamically
