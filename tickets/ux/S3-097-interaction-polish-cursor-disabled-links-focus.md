---
id: S3-097
severity: S3
confidence: MEDIUM
category: ux
source: DQ-028+103+110+212+253+260+308+347+384+385+415+428+459
status: OPEN
---

# Interaction polish — cursors, disabled states, link hover, focus-visible gaps

## Problems

1. **4 interactive elements missing :active state** (DQ-028) — Press feedback absent on buttons.
2. **371 `cursor:pointer` but only 5 `cursor:not-allowed`** (DQ-103) — Disabled/locked elements have no visual cursor feedback.
3. **Pro-locked elements show no cursor or opacity change** (DQ-110) — Tapping a locked feature gives no indication it's locked until a toast appears.
4. **Disabled buttons use opacity instead of color** (DQ-212) — Opacity makes text unreadable on sand background. Should use a distinct disabled color.
5. **Text links have no hover underline** (DQ-253) — Clickable text looks identical to static text. No visual affordance.
6. **Standalone table rows lack cursor:pointer** (DQ-260) — Clickable rows in 40+ pages don't indicate clickability.
7. **Smart filters hidden in tiny dropdown** (DQ-308) — No explanation or onboarding for smart filter feature.
8. **Home page smart-chips missing :focus-visible** (DQ-347)
9. **Home mini-screener tabs lack :focus-visible** (DQ-384)
10. **Home mini-screener column headers lack :focus-visible** (DQ-385)
11. **Position breakdown badges have role="button" but no keyboard Enter handler** (DQ-415)
12. **Saved Views delete button invisible on touch/mobile** (DQ-428) — Relies on hover to show delete button.
13. **6 toolbar elements missing :focus-visible** (DQ-459)

## Fix

Add consistent interaction states: cursor, focus-visible, :active, disabled styling. Ensure all role="button" elements handle Enter key.

## Files

- `frontend/styles.css` — global disabled, link hover, focus-visible patterns
- `frontend/index.html` — home page interactions
- `frontend/lab.js` — position badges keyboard handler, saved views delete visibility
- 40+ standalone HTML files — cursor:pointer on clickable rows

## Acceptance Criteria

1. Disabled/locked elements show `cursor:not-allowed` and reduced opacity or grayed color
2. Text links show underline on hover
3. Clickable rows show pointer cursor
4. All role="button" elements respond to Enter key
5. Saved Views delete button accessible on mobile (always visible or long-press)
