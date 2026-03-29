---
id: S2-118
severity: S2
confidence: HIGH
category: a11y
source: DQ-112
status: OPEN
---

# Agent SVG icons in Lab panel badges use empty alt=""

## Root Cause

Agent SVG icons used as panel attribution badges have `alt=""` (empty), making them invisible to screen readers. These icons convey meaning — they indicate which agent "owns" a panel.

**File**: `frontend/lab.html:4222`

```html
<img src="/assets/agents/{agent}.svg" width="16" height="16" alt="">
```

The sidebar category headers DO have proper alt text (lab.html:3230-3301, e.g., `alt="Bones"`), but the panel-level badge icons do not.

## Fix

Add descriptive alt text to panel badge icons:

```html
<img src="/assets/agents/{agent}.svg" width="16" height="16" alt="{Agent Name}">
```

## Acceptance Criteria

- [ ] All agent SVG `<img>` tags in Lab panel badges have descriptive alt text
- [ ] Screen reader announces agent name when encountering badge
- [ ] Sidebar category icons retain their existing alt text
