---
id: S1-044
severity: S1
confidence: HIGH
category: infrastructure
source: FUNC-006, FUNC-036
status: OPEN
---

# Deployment gap: 30+ code fixes exist locally but are NOT deployed to production

## Root Cause

Multiple code fixes from the Ship Loop and Functional QA sessions exist in local branches (primarily `ship/launch-fixes`) but have never been merged to master and deployed to Render. The production site at razzle.lol serves old, broken code.

**Known fixes NOT on prod:**
- QB PPO cascade (FUNC-028/030/035) — efficiency, stock watch, awards all wrong
- Breakout PPG calculation (FUNC-017) — false breakout badges
- IEEE 754 ROUND() fixes (FUNC-040) — trailing float digits
- Stock watch thresholds (FUNC-013) — WR rising section shows scrubs
- Mini-screener field names (FUNC-026) — home page shows error
- Smart filter key mismatch (FUNC-027) — home CTA silently fails
- Agent SVGs, prompts.html, nav labels (FUNC-036) — agent presence invisible
- FAAB Strategy panel — code exists, not deployed
- Weekly Briefing — code exists, not deployed
- esbuild minification (FUNC-014) — JS served unminified
- headshot URLs empty on prod (FUNC-036) — DB not rebuilt

**Impact:** The core product experience is broken for real visitors from Twitter. Half the features that were "fixed" in the ship loop are invisible to users.

## Fix

This is NOT a code fix — it requires deployment actions:

1. Merge `ship/launch-fixes` → `master`
2. Rebuild `terminal.db` on Render (or upload clean copy)
3. Verify each fix on razzle.lol post-deploy
4. Run functional QA smoke tests against prod

## Owner Action Required

This ticket cannot be resolved by the Ship Loop alone — it requires a human to trigger deployment and verify on production.

## Accept When

1. razzle.lol serves the latest master branch code
2. QB efficiency shows correct PPO for Dak (600+ not 53)
3. Home page mini-screener shows player data
4. Agent presence visible on pages
5. JS is minified on prod
