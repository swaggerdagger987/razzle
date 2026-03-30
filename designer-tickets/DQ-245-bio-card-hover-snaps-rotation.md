---
id: DQ-245
priority: P3
category: polish
page: agents.html
---

# Bio card hover transform snaps rotation to 0deg

## What's wrong
Agent bio cards have a comic-strip rotation at rest:
```css
.warroom-bio-card:nth-child(odd) { transform: rotate(-0.5deg); }
.warroom-bio-card:nth-child(even) { transform: rotate(0.5deg); }
```

But the hover state overrides it to flat:
```css
.warroom-bio-card:hover {
  transform: translate(-2px, -2px) rotate(0deg) scale(1.02);
}
```

This causes a visible "snap" — the card flattens on hover, losing the playful rotation that makes it feel hand-placed. The design guide says elements should feel like stickers on a page. Stickers don't flatten when you touch them.

## Fix
Preserve the base rotation in the hover transform:
```css
.warroom-bio-card:nth-child(odd):hover {
  transform: translate(-2px, -2px) rotate(-0.5deg) scale(1.02);
}
.warroom-bio-card:nth-child(even):hover {
  transform: translate(-2px, -2px) rotate(0.5deg) scale(1.02);
}
```

## Files
- `frontend/agents.html` — `.warroom-bio-card` hover CSS
