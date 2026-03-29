# S1-023: Situation Room BYOK setup lacks cost/model/spending-limit guidance

**Severity**: S1 (Major)
**Category**: ux-flow
**Source**: Deep Audit 2026-03-28, finding S1-012

## Problem

Pro users need to bring their own OpenRouter API key to use AI agents. The page
mentions "< $0.01 per query" and recommends a spending limit, but never explains
HOW to do any of this. Users who have never used an API key will bounce.

## Root Cause

- `frontend/agents.html:1668` — Link to OpenRouter with vague cost text:
  `"sign up at OpenRouter, most queries cost <$0.01"`
- `frontend/agents.html:1674` — Mentions spending limits but no instructions:
  `"we recommend using a dedicated key with a spending limit on openrouter.ai"`
- `frontend/agents.html:1835-1836` — 3-step setup guide Step 1 says
  `"Sign up at openrouter.ai"` but skips account creation details
- `frontend/agent-config.js:1680` — Model input defaults to `"openrouter/auto"`
  with no explanation of what models are available or recommended

Missing guidance:
1. No step-by-step OpenRouter account creation walkthrough
2. No recommended model (e.g., "use claude-3.5-haiku for best value")
3. No instructions on setting spending limits in OpenRouter dashboard
4. No explanation of what happens when credits run out (graceful error? silent fail?)
5. No typical query cost breakdown (e.g., "$0.003-0.008 per agent run")

## Expected

Add an expandable FAQ section or setup guide below the API key input that covers:
- OpenRouter signup takes 30 seconds (link to signup page)
- Recommended model: claude-3.5-haiku (~$0.005/query)
- How to set a $5/month spending limit (Settings → Limits in OpenRouter)
- What happens when you run out of credits (error message, not silent fail)

## Fix

1. Add expandable FAQ/guide section in `frontend/agents.html` below the BYOK config
2. Add recommended model tooltip next to model input in `frontend/agent-config.js`
3. Consider a "Test your key" button that makes a minimal API call to verify setup

## Scope

- 2 files: `frontend/agents.html`, `frontend/agent-config.js`
- ~30-50 lines of HTML/JS for FAQ section
