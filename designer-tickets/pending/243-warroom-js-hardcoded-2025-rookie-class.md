# DES-243: warroom.js hardcoded "2025 rookie draft class" in sample prompts

**Priority:** P2 — stale content
**Page:** agents.html (Situation Room)
**Cycle:** 23

## Problem

warroom.js:1652:
```javascript
"Evaluating 2025 rookie draft class — who's the 1.01?",
```

This is one of the sample prompts shown to users when they open the Situation Room. It references the 2025 rookie draft class. In 2026, the relevant draft class is 2026. The sample prompt makes the Situation Room look outdated.

## Fix

Use dynamic year:
```javascript
"Evaluating " + new Date().getFullYear() + " rookie draft class — who's the 1.01?",
```

Or use the `_currentDraftYear()` helper if available in scope.

## Why this matters

The Situation Room is the Pro/Elite showcase — the feature that justifies $80-150/year. Sample prompts are the first interaction. A stale year reference in the first thing users see makes the AI agents feel like a demo, not a live product. One-line fix.
