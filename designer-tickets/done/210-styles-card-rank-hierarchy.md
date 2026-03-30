<!-- PM: ready -->
---
id: DES-210
parent: 336 (Panel Cards Epic)
priority: P2
area: styles.css
section: card hierarchy utilities
type: root cause fix
status: open
---

# Add `.card-hero` and `.card-spotlight` CSS classes for rank hierarchy

**File**: `frontend/styles.css`

## What to do

Standalone panel pages (breakouts, buysell, consistency, etc.) render all player cards at identical visual weight. Add shared CSS classes:

```css
.card-hero {
  /* #1 result — full width, thicker border, stronger shadow */
  border-width: 3px;
  box-shadow: 5px 5px 0 var(--ink);
  padding: 20px;
}

.card-spotlight {
  /* #2-3 results — slightly elevated */
  border-width: 2px;
  box-shadow: 4px 4px 0 var(--ink);
}

/* Normal cards: default 2px border, 3px shadow (already exists) */
```

## Accept when

- `.card-hero` and `.card-spotlight` classes exist in styles.css
- Applying them creates visible visual hierarchy between top-3 and rest
- Dark mode compatible

## Depends on

Nothing. DES-211 and DES-212 consume these classes.
