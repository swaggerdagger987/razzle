---
id: S2-098
severity: S2
confidence: MEDIUM
category: security
source: 2026-03-14-evidence-collector.md (Finding 1)
status: OPEN
---

# BYOK API keys stored in plaintext localStorage — exfiltrable by XSS or extensions

## Root Cause

`frontend/warroom.js:1459-1575` — The BYOK (Bring Your Own Key) flow stores OpenRouter API keys in `localStorage` as plaintext JSON under the key `razzle_agent_config`.

Key storage locations:
- `warroom.js:1459` — `AGENT_CONFIG_KEY = 'razzle_agent_config'`
- `warroom.js:1465` — `loadAgentConfig()` reads from localStorage
- `warroom.js:1473` — `saveAgentConfig(cfg)` writes `JSON.stringify(cfg)` with raw apiKey field
- `warroom.js:1534` — `cfg[String(a.id)] = { ...existing, apiKey: key }` stores key
- `warroom.js:1575` — config panel save stores `apiKey: input.value.trim()`

The key persists indefinitely in localStorage with no expiry. Any XSS vulnerability or malicious browser extension running on the domain can read `localStorage.getItem('razzle_agent_config')` and extract all stored API keys.

**Mitigating factors:**
- The codebase has strong XSS protection (escapeHtml used consistently)
- The BYOK disclosure in the UI warns users about client-side key storage
- The server-side decrypt endpoint was already removed (good)
- Keys go directly from browser to OpenRouter, never through Razzle's server

## Fix

**Option A** (recommended): Use `sessionStorage` instead of `localStorage` for API keys. Keys are cleared when the browser tab closes, limiting exposure window. Users re-enter keys per session.

**Option B**: Basic obfuscation — base64 encode/decode the key before storing. Not real encryption but prevents casual inspection. Add a comment that this is not security, just obfuscation.

**Option C**: Clear API keys on signout. Currently S2-059 tracks signout leaving 33 localStorage keys — this should include clearing `razzle_agent_config` apiKey fields.

**Regardless of option**: Add `autocomplete="off"` and `data-lpignore="true"` to API key input fields to prevent password managers from capturing them.

## Files to Change

- `frontend/warroom.js:1459-1575` — change storage mechanism for apiKey field
- `frontend/app.js` (signout function) — clear agent config keys on signout

## Accept When

1. API keys are not stored in plaintext localStorage indefinitely
2. Signing out clears all stored API keys
3. BYOK functionality still works (enter key, use Situation Room, keys persist within session)

## Do NOT Touch

- Server-side LLM proxy (already correctly implemented)
- BYOK UI disclosure text (already warns users)
- OpenRouter API call logic in warroom.js
