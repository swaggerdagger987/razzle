# DES-147: Sidebar lock icon invisible to screen readers

**Priority**: P2
**Category**: Accessibility
**Affects**: lab.html sidebar — every Pro-locked panel (30+)
**Cycle**: 14

## Problem

The lock icon on Pro-locked sidebar items is a CSS `::after` pseudo-element with `content: '\1F512'`. Pseudo-element content is NOT reliably announced by screen readers. A free user navigating the sidebar with a keyboard/screen reader has no indication which panels are locked vs free.

## Evidence

`lab.html:364-371`:
```css
.lab-sidebar-item.pro-locked.show-lock { opacity: 0.7; }
.lab-sidebar-item.pro-locked.show-lock::after {
  content: '\1F512';
  font-size: 10px;
  margin-left: 4px;
  opacity: 0.6;
}
```

No `aria-label`, no `role`, no visually-hidden text. The PRO section header (line 3209) also has its `cat-icon` span set to `display:none`.

## Fix

Add `aria-label` with " (Pro)" suffix to each `.pro-locked.show-lock` item via `_updateSidebarLocks()` in `lab.html:4160`:
```javascript
if (paid) {
  item.classList.remove('show-lock');
  item.removeAttribute('aria-label');
} else {
  item.classList.add('show-lock');
  item.setAttribute('aria-label', item.textContent.trim() + ' (Pro — locked)');
}
```

## Why it matters

Dynasty power users are keyboard-heavy (J/K nav, H for heat, ? for shortcuts). Some will be screen reader users. A locked panel that's indistinguishable from a free panel leads to confusion and a worse upgrade gate experience.
