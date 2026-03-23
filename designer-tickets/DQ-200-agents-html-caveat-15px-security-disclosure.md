---
id: DQ-200
priority: P3
category: typography
status: open
---

# DQ-200: Security disclosure text uses 15px Caveat — off-spec AND wrong font for important info

## Problem

Two violations in one element. In `agents.html` line 1673:
```html
<p style="font-family:'Caveat',cursive;font-size:15px;color:var(--ink-light);...">
  your key is stored in your browser's local storage. browser extensions on this page
  can technically see it...
</p>
```

**Violation 1**: 15px is not in the Caveat type scale (should be 18px or 24px).

**Violation 2**: This is a **security disclosure** about API key storage risk. DESIGN.md rule: "Caveat is never primary information." Security warnings are critical information, not margin-note personality. This should use Space Mono (data font) for seriousness.

**Note**: DQ-074 covers 15px font-size broadly (38 instances across 20 files). This ticket specifically calls out the Caveat + security info double violation which needs a font-family change, not just a size change.

## Fix

Switch to Space Mono at 12px for security disclosure:
```html
<p style="font-family:var(--font-mono);font-size:12px;color:var(--ink-light);...">
```

## Scope

1 inline style edit in `frontend/agents.html` line 1673.
