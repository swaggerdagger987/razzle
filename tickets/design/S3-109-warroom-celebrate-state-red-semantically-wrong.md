---
id: S3-109
severity: S3
confidence: MEDIUM
category: design
source: DQ-480
status: OPEN
---

# Warroom celebrate state uses red color — semantically wrong

## Root Cause

When an agent enters the "celebrate" state in the pixel canvas, the status dot uses red (#cc3333). Red is reserved for urgent/negative signals per DESIGN.md. Celebration is positive.

**File**: `frontend/warroom.js:1514`

```javascript
else if (a.state === STATE.CELEBRATE) dotColor = '#cc3333';
```

**File**: `frontend/warroom.js:1594`

```javascript
[STATE.CELEBRATE]: '#cc3333',
```

## Fix

Replace with a positive color:

```javascript
[STATE.CELEBRATE]: '#ffc857', // --yellow: highlights, warmth
```

Or `'#2ec4b6'` (--green: positive signals).

## Acceptance Criteria

- [ ] Celebrate state uses yellow (#ffc857) or green (#2ec4b6), not red
- [ ] STATE_COLORS map updated consistently
- [ ] Dot color in canvas rendering matches the map
