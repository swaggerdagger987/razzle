---
id: DQ-361
priority: P2
area: 10+ frontend files
section: error handling UX
type: inconsistency / brand voice
status: open
---

# 10+ files hardcode "fumbled the data fetch" instead of using razzleError()

## What's wrong

app.js defines `razzleError()` (line ~428) as the centralized personality-driven error message function. But 10+ files bypass it with hardcoded inline strings. The inconsistencies:

- Some say "fumbled the data fetch... try again in a sec"
- Some say "fumbled the data fetch..."
- Some say "fumbled the data..."
- Some include a retry button, others don't
- Some use `var(--red)` color, others use `var(--orange)`

## Where

Files bypassing razzleError():
1. advantage.html:237 — `'fumbled the data fetch... try again in a sec'`
2. weeklymvp.html:335 — `'fumbled the data fetch... try again in a sec'`
3. playoffs.html:388 — `'fumbled the data fetch... try again in a sec'`
4. compare.js:73 — `'fumbled the data fetch... try again in a sec.'`
5. player.js:59 — `'fumbled the data fetch... try again in a sec.'`
6. lab.js:6336 — `'fumbled the data fetch... try again in a sec.'`
7. lab.js:9156 — `'fumbled the data fetch...'`
8. lab-panels.js:9096 — `'fumbled the data...'`
9. targets.html:463 — `'fumbled the data...'` (with retry button)
10. weekly.html:466 — `'fumbled the data...'` (with retry button)
11. lab.js:1358 — fallback string with razzleError() attempt

## Suggested fix

Replace all hardcoded error strings with calls to `razzleError()` or a new `razzleErrorHTML()` that returns a consistent block with retry button:

```javascript
function razzleErrorHTML(retryFn) {
  return `<div style="text-align:center;padding:40px;font-family:var(--font-hand);font-size:22px;color:var(--red);">
    ${razzleError()}
    ${retryFn ? `<button class="btn-chunky" onclick="${retryFn}" style="margin-left:12px">retry</button>` : ''}
  </div>`;
}
```

## Why this matters

Inconsistent error messages break brand voice. Some pages have retry buttons, some don't. Users on pages without retry have to manually reload. Centralize once, fix everywhere.
