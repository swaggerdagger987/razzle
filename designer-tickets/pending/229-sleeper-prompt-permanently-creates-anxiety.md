# DES-229: Sleeper link prompt says "permanently" — creates conversion anxiety

**Priority:** P1 — conversion friction
**Page:** All (auth modal Sleeper prompt via app.js)
**Cycle:** 22

## Problem

app.js:1303: `"this will permanently link your Sleeper account to your Razzle account"`

The word "permanently" triggers loss aversion at a critical conversion moment. Users who just created an account are being asked to connect their Sleeper league — this is the bridge to the Bureau (the conversion engine). "Permanently" makes them hesitate or click "skip for now."

The actual behavior is reasonable: one Sleeper username per account, to prevent trial abuse (league-intel.html:2120 confirms this). But the copy frames it as irreversible and punitive instead of fair and simple.

## Fix

Replace the fine print with:

```
one Sleeper username per account — keeps the free trial fair for everyone
```

- Explains the WHY (fairness), not the HOW (permanent)
- Feels protective, not restrictive
- Matches the brand voice: direct, no-nonsense, on your side

## Why this matters

The Sleeper connection is the funnel: Screener -> connect Sleeper -> see Bureau summary -> "I need the deep-dive" -> Pro. If users skip the Sleeper prompt, the conversion engine never starts. Every unnecessary hesitation at this step costs users.
