# S3-047: Agent API key saved without validation

**Severity**: S3 (Low)
**Category**: frontend
**Source**: designer-tickets/DQ-430
**Found**: 2026-03-28
**Status**: OPEN

## Root Cause

`frontend/warroom.js:1472-1576` — When a user enters an OpenRouter API key in the Situation Room config, it's saved to localStorage immediately on blur without any validation test call.

```javascript
// warroom.js:1568-1579
input.addEventListener('change', () => {
  const cfg = loadAgentConfig();
  const existing = cfg[String(id)] || {};
  cfg[String(id)] = { ...existing, apiKey: input.value.trim() };
  saveAgentConfig(cfg);
  showStatus(AGENT_DEFS[id].name + ' key saved');
});
```

Invalid keys are only discovered at runtime when an agent query returns 401 (warroom.js:2427-2431). There's no persistent error badge or warning that the key is invalid.

## Fix

After saving, make a lightweight test call to OpenRouter to validate the key. Show a green checkmark or red X next to the input. If invalid, show persistent error state.

## Files to Change

- `frontend/warroom.js:1568-1579` — add validation call after save

## Accept When

1. Saving an invalid API key shows an error indicator
2. Saving a valid API key shows a success indicator
3. Invalid key state persists until key is changed
