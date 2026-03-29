---
id: S2-100
severity: S2
category: ux-flow
title: Situation Room BYOK setup guide lacks explicit model recommendation and FAQ
source: deep-audit
status: open
---

## Problem

The Situation Room's BYOK (Bring Your Own Key) setup flow has basic guidance but lacks specifics that would help first-time API key users confidently complete setup. The deep audit flagged this as a conversion barrier for Pro users.

**What exists** (adequate but generic):
- "sign up at openrouter.ai" link — `frontend/agents.html:1670`
- "most queries cost <$0.01" — `frontend/agents.html:1670,1837`
- "we recommend using a dedicated key with a spending limit" — `frontend/agents.html:1676-1677`
- 3-step setup guide — `frontend/agents.html:1829-1857`
- Default model "openrouter/auto" — `frontend/agents.html:1679-1684`

**What's missing** (specific enough to prevent bounce):
- No recommended model name (e.g., "claude-3.5-haiku" or "gpt-4o-mini")
- No suggested spending limit amount (e.g., "$5/month caps your risk")
- No FAQ section for common questions (What if my key stops working? What model is best for fantasy?)
- No explanation of what "openrouter/auto" actually does (routes to cheapest model)

## Root Cause

The setup guide was written for technical users who already understand API keys and model routing. Fantasy football users (the target audience) likely have no prior experience with LLM APIs.

## Fix

In `frontend/agents.html` setup guide section (lines 1829-1857), expand with:

1. **Step 1 expansion**: Add "Recommended: set a $5/month spending limit in your OpenRouter dashboard"
2. **Model recommendation**: Below the model config input (line 1684), add helper text: "Default 'openrouter/auto' picks the best model automatically. For best results, try 'anthropic/claude-3.5-haiku' (~$0.003/query)"
3. **Mini-FAQ**: Add 3-4 collapsible FAQ items below the setup guide:
   - "What does it cost?" → "Most queries cost $0.003-$0.01. A $5 budget covers ~1,000 queries."
   - "Which model should I use?" → "openrouter/auto (default) works great. For more detailed analysis, try claude-3.5-haiku."
   - "What if my key stops working?" → "Check your OpenRouter balance. You can add credits at openrouter.ai/credits."
   - "Is my key safe?" → Brief restatement of the localStorage disclosure + spending limit advice.

## Files

- `frontend/agents.html:1670` — config panel help text
- `frontend/agents.html:1679-1684` — model config section
- `frontend/agents.html:1829-1857` — setup guide

## Accept When

- Setup guide includes specific dollar amounts for spending limit and per-query cost
- Model recommendation is visible near the model input field
- A collapsible FAQ section exists below the setup guide
- A non-technical user can complete BYOK setup without external research
