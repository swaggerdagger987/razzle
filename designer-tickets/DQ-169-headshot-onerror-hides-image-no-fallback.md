# DQ-169: Headshot onerror hides image but leaves layout gap — no fallback avatar

**Priority:** P3
**Area:** UX / Visual
**Type:** Missing fallback
**Impact:** When headshot images fail to load, invisible gap remains in player rows

---

## Problem

19+ standalone pages use `onerror="this.style.display='none'"` on player headshot images. When a headshot URL fails (404, timeout, CDN issue), the `<img>` element is hidden but the surrounding flex layout still reserves gap/margin space, creating a visible gap where the headshot should be.

### Pattern (identical across 19 pages)
```javascript
html += '<img class="xxx-headshot" src="' + escapeHtml(p.headshot_url) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">';
```

### Affected pages
airyards, awards, breakouts, buysell, consistency, efficiency, leaders, opportunity, redzone, reportcard, schedule, stocks, tradefinder, tradevalues, usage, vorp, yoy, team (+ 1 more)

### Separate issue from
- DQ-088 (agent icon SVGs missing onerror — different elements)
- DQ-097 (headshots missing width/height — CLS, different issue)

## Fix

Replace `display:none` with a fallback avatar. Two options:

**Option A:** Show initials circle (matches design aesthetic):
```javascript
onerror="this.outerHTML='<div style=\"width:32px;height:32px;border-radius:50%;background:var(--bg-warm);border:2px solid var(--ink-faint);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:11px;color:var(--ink-light);flex-shrink:0;\">?</div>'"
```

**Option B:** Collapse properly:
```javascript
onerror="this.style.display='none';this.style.margin='0';this.style.width='0';this.style.flexBasis='0'"
```

## Verification
- Block headshot CDN domain in devtools (or disconnect network after page load).
- Broken headshots should show fallback avatar or collapse cleanly, not leave invisible gaps.
