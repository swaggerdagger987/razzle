# QA + UX Audit — Phases 5-9

**Date**: 2026-03-10
**Scope**: College Football Integration (P5), QA Fixes (P6), Lab Polish (P7), QA Audit (P8), Sidebar Intelligence (P9)

---

## QA FINDINGS

### CRITICAL

**1. XSS in Recent Panels onclick attribute**
- **File**: frontend/lab.html (in `_renderRecentPanels`)
- **Issue**: Panel name `p` injected unescaped into onclick attribute. While panel names are internally controlled, this is defense-in-depth failure.
- **Fix**: Use `escapeHtml(p)` in the onclick attribute value.

### HIGH

**2. localStorage calls missing try-catch in lab.js**
- **File**: frontend/lab.js — 8 locations
- **Issue**: localStorage.setItem calls in saveWatchlist, setUniverse, saveCurrentView, deleteSavedView, saveCustomScoringConfigs, toggleHeatColors, saveMyRoster lack try-catch. Private browsing or quota exceeded will throw.
- **Fix**: Wrap all localStorage operations in try-catch.

**3. localStorage calls missing try-catch in app.js**
- **File**: frontend/app.js (getAuthHeaders)
- **Issue**: Reads localStorage without try-catch.
- **Fix**: Add try-catch wrapper.

**4. Sidebar collapsed init missing try-catch**
- **File**: frontend/lab.html (sidebar init block)
- **Issue**: `localStorage.getItem('razzle_sidebar_collapsed')` called without try-catch.
- **Fix**: Wrap in try-catch.

### MEDIUM

**5. No guard for escapeHtml availability**
- **File**: frontend/lab.html
- **Issue**: `escapeHtml()` used in inline script but defined in app.js. If app.js fails to load, inline scripts break.
- **Fix**: Add inline fallback definition.

### LOW

**6. URL params not whitelisted**
- **File**: frontend/lab.html
- **Issue**: Universe param read from URL without strict whitelist.
- **Fix**: Add explicit includes check.

---

## UX FINDINGS

### HIGH

**1. Jargon panel names without descriptive tooltips**
- **Panels**: VORP, Snap Efficiency, Target Premium, Garbage Time, Drop Rate, Success Rate, TD Regression
- **Issue**: Fantasy football users won't understand these terms without context. Sidebar tooltips currently just repeat the panel name.
- **Fix**: Add descriptive tooltip text explaining what each panel measures.

**2. Near-duplicate panel naming**
- **Panels**: "Pace Tracker" vs "Season Pace", "FPTS Breakdown" vs "Scoring Breakdown"
- **Issue**: Users can't tell these apart.
- **Fix**: Rename "FPTS Breakdown" to "Points Breakdown". Keep Pace Tracker and Season Pace (different views: cards vs table).

**3. Mobile sidebar search lacks aria-label**
- **File**: frontend/lab.html
- **Issue**: In collapsed mode, search input has no aria-label.
- **Fix**: Add `aria-label="Search tools"` to search input.

### MEDIUM

**4. No first-time user hint**
- **Issue**: New users see no guidance on the 62 panels. No onboarding tooltip.
- **Fix**: Add one-time toast: "62 tools in the sidebar. Press ? for shortcuts."

**5. Category chevrons small on mobile**
- **Issue**: 10px chevron hard to tap on phones.
- **Fix**: Increase to 14px on mobile breakpoint.

### LOW

**6. Keyboard shortcut discovery**
- **Issue**: `?` shortcut exists but users must guess to press it.
- **Fix**: Add subtle hint near tool count.

---

## CLEAN AREAS

- CSS conflicts: None detected
- Event listener leaks: None detected
- Backend DB pattern: All get_db() correctly renamed to get_conn()
- XSS in main innerHTML: Properly escaped
- Panel render/switch: Working correctly
