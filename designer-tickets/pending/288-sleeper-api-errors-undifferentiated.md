---
id: DES-288
title: Sleeper API errors show same message for different failure modes
severity: P2
category: UX/Copy
page: league-intel.html
---

## What's Wrong

Multiple distinct Sleeper API failure modes all show "sleeper's servers are napping. try again in a minute." Users can't tell whether:
- Their username is wrong (fixable)
- Sleeper is down (wait)
- Their network is offline (check WiFi)

Lines 2308-2309 show the same message for both HTTP errors and network failures:
```js
? "sleeper's servers are napping. try again in a minute."
: "sleeper's servers are napping. try again in a minute.";
```

Line 2147 (HTTP error) and 2151 (catch block) also show identical copy.

## Where

- `frontend/league-intel.html` lines 2147, 2151, 2308-2309, 2589-2590

## Fix

Differentiate error messages by failure type:
- **404 (user not found)**: "couldn't find that username on Sleeper. double-check the spelling." (line 2149 already does this — good)
- **5xx (server error)**: "sleeper's servers are napping. try again in a minute."
- **Network error / timeout**: "couldn't reach Sleeper — check your internet connection."
- **Rate limited**: "too many requests. give it 30 seconds."

Also: when Sleeper is down, suggest the demo league button that already exists (line 1993).

## Evidence

Line 2149 correctly handles 404 with a distinct message. But lines 2147 (non-404 HTTP) and 2151 (catch/network) are identical. Lines 2308-2309 have a ternary that returns the same string on both branches.
