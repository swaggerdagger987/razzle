# FUNC-039: Agent Nudge Animation Keyframes Missing

**Severity**: P2
**Flow**: N/A (Agent Presence Layer)
**Status**: OPEN
**Session**: 36
**Date**: 2026-03-21

## Description

`agent-nudges.js` line 145 references CSS animation `nudgeFadeIn`:
```
animation:nudgeFadeIn 0.4s ease-out;
```

But `@keyframes nudgeFadeIn` is never defined in any CSS file. The animation silently fails —
the nudge card appears instantly instead of fading in.

## Evidence

- `grep -r "nudgeFadeIn" frontend/` only finds the reference in agent-nudges.js:145
- No `@keyframes nudgeFadeIn` in styles.css or any inline style block
- Browser behavior: CSS animation with undefined keyframes is ignored (no error, no animation)

## Fix

Add to styles.css (or inline in agent-nudges.js):
```css
@keyframes nudgeFadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

## Impact

Minor cosmetic issue. The nudge card pops in abruptly instead of fading in gracefully.
Only affects Elite users (nudge system is Elite-gated). Related to FUNC-038 (same component).
