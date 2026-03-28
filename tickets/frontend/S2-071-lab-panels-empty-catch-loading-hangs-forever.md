---
id: S2-071
severity: S2
confidence: HIGH
category: reliability
source: DQ-445
status: OPEN
---

# 10+ lab-panels.js catch handlers are empty — loading hangs forever on API error

## Root Cause

Multiple panel fetch functions in `frontend/lab-panels.js` have empty or minimal catch blocks that don't dismiss the loading state:

- Line 332: empty catch
- Line 749: empty catch
- Line 1027: empty catch
- Line 1099: empty catch
- Line 1239: empty catch
- Line 1371: empty catch

When the API returns an error or the network is down, the loading spinner/skeleton continues indefinitely. The user has no indication that loading failed, no retry option, and must refresh the page.

## Fix

Each catch block should:
1. Hide the loading indicator
2. Show an error state with `razzleError()`
3. Optionally add a retry button

```js
.catch(function(err) {
  loadingEl.style.display = 'none';
  container.innerHTML = razzleError();
});
```

## Files

- `frontend/lab-panels.js:332,749,1027,1099,1239,1371` — empty catch blocks

## Acceptance Criteria

- All panel catch blocks dismiss loading state
- Error message shown when API fails
- No indefinite loading spinners
