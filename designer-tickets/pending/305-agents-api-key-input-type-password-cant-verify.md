# DES-305: Situation Room API key input uses type="password" — can't verify paste

**Priority**: P2
**Category**: UX
**Page**: agents.html
**Line**: 1667

## Problem

The OpenRouter API key input uses `type="password"`, which masks the input:

```html
<input class="config-input" id="cfgSharedKey" type="password" autocomplete="off"
       placeholder="paste your API key here" aria-label="API key for all agents">
```

Users paste their API key and can't verify it was pasted correctly. API keys are long random strings (sk-or-v1-abc123...) where a single missing character causes silent failure. Unlike passwords, API keys are not memorized — they're always copied from another source.

The Situation Room is the highest-value conversion surface. A user who pastes a key, clicks Run, and gets an error ("invalid key") may blame Razzle, not their clipboard.

## Expected

Use `type="text"` with a show/hide toggle button, or just `type="text"` since API keys aren't secret in the same way passwords are (they're already visible in the source they were copied from).

```html
<input class="config-input" id="cfgSharedKey" type="text" autocomplete="off"
       placeholder="paste your API key here" aria-label="API key for all agents"
       style="font-family:var(--font-mono); letter-spacing:0.5px;">
```

## Fix

Change `type="password"` to `type="text"` at line 1667. Optionally add a toggle button for users who want to hide it. 1 attribute change.
