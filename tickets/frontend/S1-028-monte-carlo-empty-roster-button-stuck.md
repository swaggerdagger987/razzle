---
id: S1-028
severity: S1
category: frontend
finding_ref: DQ-429
confidence: HIGH
---

# S1-028: Monte Carlo simulation button stuck disabled on empty roster

## Root Cause

`frontend/league-intel.html:8039-8042` -- When `allPlayerIds.length === 0`
(no roster loaded), the `runLeagueOdds()` function writes an error message
to `oddsDiv` and immediately returns.

The button is disabled at the start of the function (line 8007):
```js
oddsBtn.disabled = true;
oddsBtn.style.opacity = '0.5';
```

The button is only re-enabled in the success path (line 8114) and catch
block (line 8117). The early `return` at line 8041 bypasses both, so the
button stays permanently disabled with `opacity: 0.5`. The user cannot retry
even after loading a roster.

## What to Fix

Re-enable the button in the empty-roster early return:

```js
if (allPlayerIds.length === 0) {
  oddsDiv.innerHTML = '<p>No players found. Connect a league first.</p>';
  oddsBtn.disabled = false;
  oddsBtn.style.opacity = '1';
  return;
}
```

## Files to Change

- `frontend/league-intel.html` -- add button re-enable in empty roster path

## Acceptance Criteria

- [ ] Open Bureau without connecting a league, click Simulate -- button re-enables after error
- [ ] Connect a league, click Simulate with empty roster -- button re-enables
- [ ] Error message guides user to connect a league first
- [ ] Normal simulation flow still works (button disabled during run, enabled after)

## Do NOT

- Do not change the Monte Carlo simulation logic itself
