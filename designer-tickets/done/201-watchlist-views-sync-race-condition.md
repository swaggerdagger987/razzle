<!-- PM: ready -->
---
id: DQ-363
priority: P2
area: frontend/lab.js
section: watchlist + saved views sync
type: race condition
status: open
---

# Watchlist and views pull/push fetches have no AbortController

## What's wrong

DQ-324 covers the silent `.catch(function(){})` on sync PUSH calls. But the corresponding PULL calls (fetching watchlist and views from server) also lack AbortController, creating a separate race condition.

If a user logs in, the watchlist pull fires. If they log out and back in quickly, two pulls race — the second might resolve before the first, then the first overwrites the merged data with stale results.

## Where

**Watchlist pull** — lab.js lines 286-340:
```javascript
fetch(base + "/api/user/watchlist", {
  headers: { "Authorization": "Bearer " + token }
}).then(...)  // no AbortController
```

**Views pull** — lab.js lines 4435-4493:
```javascript
fetch(base + "/api/user/views", {
  headers: { "Authorization": "Bearer " + token }
}).then(...)  // no AbortController
```

## Suggested fix

Add an AbortController to each pull function. Abort the previous request if a new one fires:

```javascript
let _watchlistPullAbort = null;
function pullWatchlistFromServer() {
  if (_watchlistPullAbort) _watchlistPullAbort.abort();
  _watchlistPullAbort = new AbortController();
  fetch(base + "/api/user/watchlist", {
    headers: { "Authorization": "Bearer " + token },
    signal: _watchlistPullAbort.signal
  }).then(...)
}
```

Same pattern for views pull.

## Why this matters

Pro users who connect from multiple devices depend on cloud sync. Race conditions during login can silently overwrite their watchlist with an older version — data loss with no warning.
