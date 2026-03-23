# DQ-212: Disabled buttons use opacity instead of color — unreadable on sand

**Priority**: P1
**Category**: Accessibility / Visual
**Page**: agents.html (Situation Room)

## What's wrong

Five disabled-state rules in agents.html use `opacity: 0.5` or lower to signal "disabled." On the warm sand background, opacity-dimmed text becomes unreadable — especially for low-vision users. WCAG requires 4.5:1 contrast ratio; opacity:0.5 on espresso-on-sand drops well below that.

## Where

- `agents.html:564` — `.scenario-run-all:disabled { opacity: 0.5; }`
- `agents.html:600` — `.scenario-agent-btn:disabled { opacity: 0.5; }`
- `agents.html:668` — `.context-badge.empty { opacity: 0.7; }`
- `agents.html:685` — `.config-badge-label.disabled { opacity: 0.85; }`
- `agents.html:687` — `.context-badge.locked .context-badge-dot { opacity: 0.4; }`

## Fix

Replace opacity with explicit color changes:
```css
.scenario-run-all:disabled {
  color: var(--ink-light);
  background: var(--bg-warm);
  cursor: not-allowed;
}
```

Keep the element fully opaque. Signal "disabled" through muted colors, not transparency.

## Not a dupe of

- DQ-110 (disabled pro locked states) — that's about Pro-gated content teasers, not button disabled states
