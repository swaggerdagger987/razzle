# DES-283: draftclass.html missing encodeURIComponent on player ID

**Priority**: P2
**Page**: draftclass.html (Draft Class panel)
**Affects**: Player profile navigation from Draft Class page

## Problem

`draftclass.html:552` navigates to player profiles using raw `pid` without URL encoding:

```js
if (pid) window.location.href = '/player/' + pid;
```

Every other page that links to player profiles uses `encodeURIComponent(pid)`:
- `airyards.html:649` — `'/player/' + encodeURIComponent(pid)`
- `awards.html:592` — `'/player/' + encodeURIComponent(pid)`
- `breakouts.html:632` — `'/player/' + encodeURIComponent(pid)`
- `lab-panels.js:282` — `'/player/' + encodeURIComponent(pid)`
- (30+ other instances)

## Fix

```js
// Before (draftclass.html:552)
if (pid) window.location.href = '/player/' + pid;

// After
if (pid) window.location.href = '/player/' + encodeURIComponent(pid);
```

One-word fix.

## Why This Matters

Defensive coding consistency. If a player_id ever contains special characters (space, slash, ampersand), this URL breaks while every other page works fine. The pattern exists everywhere else — this one instance was missed.
