<!-- PM: ready -->
# DQ-410: First-Time Onboarding Toast References Invisible Sidebar on Mobile

**Priority**: P2 (UX friction)
**Category**: Onboarding / Mobile
**Page**: lab.html (Screener)

## Problem

Line ~1176 in lab.js shows the first-visit onboarding toast:
```
"Filter by position above, explore panels in the sidebar — press ? for shortcuts"
```

On mobile (480px and below), the sidebar is collapsed off-screen (`transform: translateX(100%)` at line ~590 in styles). The toast tells mobile users to "explore panels in the sidebar" — but there IS no visible sidebar. The instruction is nonsensical on mobile.

Additionally, the `?` keyboard shortcut hint is useless on mobile since there's no physical keyboard.

## Fix

Make the onboarding toast context-aware:
- Desktop: current text is fine
- Mobile (window.innerWidth < 768): "filter by position above. tap the menu icon for 70+ panels."

Or simplify to work universally: "filter by position above to get started."

## Evidence

- Line ~1176 in lab.js: hardcoded toast text
- Line ~590 in styles.css (or lab.html inline): sidebar hidden on mobile
- No `window.innerWidth` check before showing toast
- DQ-348 covers "misleading advice" generally, but NOT the mobile sidebar context
