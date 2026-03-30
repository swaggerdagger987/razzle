---
id: DQ-187
priority: P3
category: css-architecture/inline-styles
status: open
cycle: 27
---

# lab.html `#columnPickerSearch` has massive inline style — should use `.input-chunky`

## What's wrong

The column picker search input in lab.html has a 7-property inline style that essentially recreates the `.input-chunky` class. This inline style:
- Can't be overridden by dark mode CSS cascade
- Won't benefit from future `.input-chunky` improvements
- Uses hardcoded `border-radius:8px` instead of `var(--radius-sm)`

## Where

`frontend/lab.html:3545`

```html
<input type="text" id="columnPickerSearch" placeholder="Search columns..."
  oninput="filterColumnPicker(this.value)"
  style="width:100%; padding:8px 12px; margin-bottom:10px; font-family:var(--font-mono); font-size:13px; border:3px solid var(--ink); border-radius:8px; background:var(--bg); box-sizing:border-box;">
```

## Fix

Replace with the `.input-chunky` class + minimal inline overrides:

```html
<input type="text" id="columnPickerSearch" class="input-chunky" placeholder="Search columns..."
  oninput="filterColumnPicker(this.value)"
  style="width:100%; margin-bottom:10px; background:var(--bg);">
```

## Test

1. Open Lab, click column picker.
2. Search input should look identical (same border, font, padding).
3. Toggle dark mode — input should invert correctly via CSS cascade.
