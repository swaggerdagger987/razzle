---
id: S1-012
severity: S1
category: ux-flow
title: "Situation Room BYOK setup lacks cost/model guidance"
status: open
audit: DEEP-AUDIT-TICKETS.md
decomposed-to: ux/S1-023-byok-setup-lacks-cost-model-guidance.md
---

# S1-012: Situation Room requires API key setup with no in-app cost guidance

## Finding

Pro users need to bring their own OpenRouter API key. The 3-step setup guide is good but skips cost details, model selection, and spending limits.

## Root Cause

**File: `frontend/agents.html:1807-1839`** — Setup guide section

Current 3-step guide:
1. "Get an API key" — Sign up at openrouter.ai, most queries cost <$0.01 (lines 1813-1821)
2. "Type a scenario or pick one above" (lines 1823-1828)
3. "Hit 'Run All Agents'" (lines 1830-1835)

**File: `frontend/agents.html:1648-1653`** — API key input field
- Label: "API Key (all agents)"
- Help link: "Where do I get an API key?" → openrouter.ai

**What's missing**:
- How to create an OpenRouter account (step-by-step)
- Which model to select (recommended: claude-3.5-haiku or similar)
- How to set spending limits ($5/month suggested)
- What happens when credits run out
- Average cost per query (currently says "<$0.01" but no breakdown)

## Fix

Add an expandable FAQ section below the 3-step guide:

```
FAQ:
Q: How much does it cost?
A: Average query costs $0.003-0.01. Six agents × 1 query = ~$0.05. Set a $5/month limit on OpenRouter.

Q: Which model should I use?
A: We recommend claude-3.5-haiku (fast + cheap). The default works great.

Q: What if my credits run out?
A: You'll see an error message. Top up at openrouter.ai/credits.
```

## Impact

Users who've never used an API key will bounce at this step. This is the critical conversion moment from free to paid — friction here loses customers.

## Acceptance Criteria

- [ ] Setup guide includes cost breakdown (avg per query, typical monthly spend)
- [ ] Recommended model mentioned
- [ ] Spending limit guidance included
- [ ] Clear explanation of what happens when credits run out
