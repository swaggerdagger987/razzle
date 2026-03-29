# S0-002: Elite LLM endpoint uses same model for all tiers

**Severity**: S0 (Critical)
**Category**: billing
**Source**: EDGE-CASES.md #30
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`backend/server.py:1062-1063` — Two model variables are defined but the LLM chat endpoint at line ~1157 uses `_LLM_MODEL` (haiku) for ALL authenticated users regardless of tier. `_LLM_FREE_MODEL` is defined but never used in the request handler.

```python
# server.py:1062-1063
_LLM_MODEL = os.environ.get("RAZZLE_LLM_MODEL", "anthropic/claude-3.5-haiku")
_LLM_FREE_MODEL = os.environ.get("RAZZLE_LLM_FREE_MODEL", "meta-llama/llama-3.1-8b-instruct:free")
```

At the `/api/llm/chat` endpoint (~line 1157):
```python
llm_body = {
    "model": _LLM_MODEL,  # Always haiku, regardless of user plan
```

Elite users paying $149.99/yr get the same model as everyone else. No tier-based model selection exists.

## Fix

In the LLM chat handler, select model based on user plan:
```python
user_plan = user.get("plan", "free")
if user_plan in ("elite", "elite_lifetime"):
    model = _LLM_MODEL  # Premium model (haiku or better)
elif user_plan in ("pro", "pro_lifetime"):
    model = _LLM_MODEL  # Same premium for Pro
else:
    model = _LLM_FREE_MODEL  # Free model for free users
```

## Files to Change

- `backend/server.py:~1157` — select model based on `user.get("plan")`

## Accept When

1. Free users get `_LLM_FREE_MODEL` (llama free tier)
2. Pro users get `_LLM_MODEL` (haiku)
3. Elite users get `_LLM_MODEL` or a higher-tier model (configurable via env var)
4. Lifetime variants (`pro_lifetime`, `elite_lifetime`) get same model as their base tier

## Do NOT Touch

- Model env var names — keep `RAZZLE_LLM_MODEL` and `RAZZLE_LLM_FREE_MODEL`
- Rate limiting logic — that's a separate concern
