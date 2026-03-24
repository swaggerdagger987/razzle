---
id: DQ-357
priority: P1
area: frontend/lab.js
section: player profile modal
type: race condition / data corruption
status: open
---

# Dynasty sparkline fetch has no AbortController — rapid profile clicks render stale data

## What's wrong

`loadDynastySparkline()` at lab.js:6718 fires a raw `fetch()` to `/api/dynasty-history` with no AbortController. If a user opens player A's profile, then quickly opens player B's profile, player A's slower response can resolve AFTER player B's modal is already showing — overwriting B's sparkline with A's dynasty history data.

This is silent data corruption. The user sees the wrong sparkline with no indication it belongs to a different player.

## Where

`frontend/lab.js` line 6718:
```javascript
fetch(`/api/dynasty-history?players=${encodeURIComponent(playerId)}`)
  .then(r => r.ok ? r.json() : null)
  .then(data => { /* renders sparkline into whatever modal is open */ })
  .catch(err => { /* silent fail */ });
```

## Suggested fix

Add an AbortController scoped to the profile modal lifecycle. Abort the previous dynasty-history fetch when a new profile opens:

```javascript
let _dynastyAbort = null;
function loadDynastySparkline(playerId, container) {
  if (_dynastyAbort) _dynastyAbort.abort();
  _dynastyAbort = new AbortController();
  const el = container.querySelector('#profile-dynasty-sparkline');
  if (!el) return;
  fetch(`/api/dynasty-history?players=${encodeURIComponent(playerId)}`, { signal: _dynastyAbort.signal })
    .then(r => r.ok ? r.json() : null)
    .then(data => { /* existing render logic */ })
    .catch(err => { if (err.name !== 'AbortError') console.warn('dynasty sparkline:', err.message); });
}
```

## Why this matters

Power users rapidly clicking through player profiles is the #1 Lab workflow. Stale sparkline data makes the tool feel broken and untrustworthy — exactly the users most likely to screenshot and share on Reddit.
