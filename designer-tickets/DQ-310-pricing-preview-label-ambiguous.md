---
id: DQ-310
title: Free tier "70+ analytical panels (preview)" label is ambiguous
priority: P2
category: copy
page: pricing.html
---

## Problem
Line ~250 of pricing.html says the Free tier includes: "70+ analytical panels (preview)"

The word "(preview)" is ambiguous. A new user doesn't know if it means:
- Panels are locked and you can only see a blurred preview?
- Panels work but with limited data (preview mode)?
- Panels are in beta/preview and might change?
- Panels show a teaser card with an upgrade CTA?

The feature matrix later (line ~358) says "Full panel access (unlocked)" is Pro-only, which contradicts the impression that free users get "70+ panels."

## Expected
Clear language: either "70+ analytical panels (read-only)" or "70+ analytical panels (limited to 2025 season)" or whatever the actual free-tier limitation is.

## Fix
Replace "(preview)" with the actual limitation. If free users see all panels but with limited data depth, say "70+ analytical panels (current season only)." If panels are locked with teaser cards, say "70+ analytical panels (preview cards, unlock with Pro)."

## Files
- `frontend/pricing.html` — Free tier plan card (~line 250)
- `frontend/pricing.html` — feature matrix (~line 358)
