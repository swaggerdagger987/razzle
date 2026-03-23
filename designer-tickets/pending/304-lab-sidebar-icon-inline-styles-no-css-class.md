# DES-304: Lab sidebar agent icons use repeated inline styles instead of CSS class

**Priority**: P3
**Category**: Design System
**Page**: lab.html
**Lines**: 3211+

## Problem

Every sidebar category with an agent icon repeats the same inline style:

```html
<img src="/assets/agents/bones.svg" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;opacity:0.6" alt="Bones">
```

This pattern repeats for every agent icon in the sidebar (~6-8 instances). Each has identical `width:16px;height:16px;vertical-align:middle;margin-right:4px;opacity:0.6`.

## Impact

- Can't adjust icon size/opacity in dark mode or responsive breakpoints
- Repetitive inline styles that should be a single CSS class
- Maintenance burden: changing icon size requires editing every instance

## Expected

```css
.sidebar-agent-icon {
  width: 16px;
  height: 16px;
  vertical-align: middle;
  margin-right: 4px;
  opacity: 0.6;
}
```

```html
<img src="/assets/agents/bones.svg" class="sidebar-agent-icon" alt="Bones">
```

## Fix

1. Add `.sidebar-agent-icon` class to styles.css (or lab-panels.css)
2. Replace inline styles on all sidebar agent `<img>` tags with the class
