# S2-058: Agents page OG metadata uses old agent role names

**Severity**: S2 (Medium)
**Category**: frontend
**Source**: designer-tickets/DQ-341
**Found**: 2026-03-28
**Status**: OPEN

## Root Cause

`frontend/agents.html:9` — The `<meta>` OG tags (used for social media previews when sharing the URL) reference old agent role names that don't match the current design.

The OG description likely mentions "Scout, Quant, Medic" or similar legacy names instead of the current agent names/roles. When someone shares the Situation Room URL on Twitter/Reddit, the social card shows outdated text.

## Fix

Update the OG tags to use current agent names and roles:
- Razzle (Chief of Staff)
- Dr. Dolphin (Medical Analyst)
- Hawkeye (Scout)
- Bones/The Fox (Diplomat)
- Octo/The Octopus (Quant)
- Atlas/The Elephant (Historian)

Also check `og:title`, `og:description`, and `twitter:description` tags.

## Files to Change

- `frontend/agents.html` — `<meta>` OG tags in `<head>`

## Accept When

1. OG description uses current agent names/roles
2. Social card preview (use og debugger tools) shows accurate text
3. Also check DQ-291 (same issue, may be duplicate)
