---
id: DES-446
priority: P3
area: UX polish
section: Lab hover card
type: animation-bug
status: open
---

# hideHoverCard() display:none overrides CSS opacity transition

## What's wrong

The hover card has a nice CSS opacity transition via `.visible` class. But `hideHoverCard()` removes the `.visible` class and immediately sets `display = "none"` — killing the opacity fade-out before it can play.

Result: hover card appears with a smooth fade-in but disappears instantly.

## Where

`frontend/lab.js:2252-2253`:
```javascript
card.classList.remove("visible");    // starts opacity transition
card.style.display = "none";         // immediately hides, transition never plays
```

## Fix

Wait for transition to complete before hiding:
```javascript
function hideHoverCard() {
  clearTimeout(_hoverTimer);
  _hoverTimer = null;
  const card = document.getElementById("playerHoverCard");
  if (card) {
    card.classList.remove("visible");
    card.addEventListener("transitionend", function handler() {
      card.removeEventListener("transitionend", handler);
      card.style.display = "none";
    }, { once: true });
    // Safety fallback in case transition doesn't fire
    setTimeout(function() { card.style.display = "none"; }, 200);
  }
  _hoverCardVisible = false;
}
```

## Why it matters

Asymmetric animations (smooth in, instant out) feel broken. The CSS transition already exists — it's just being bypassed by the JS. Small fix, noticeable polish improvement.
