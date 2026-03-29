---
id: S2-012
severity: S2
category: ux-flow
title: "CSV export Pro-locked, PNG export ungated — strategy alignment needed"
status: open
audit: DEEP-AUDIT-TICKETS.md
duplicate-of: ux/S2-033
---

# S2-012: Export PNG and CSV Pro-locked for free users with no preview

## Finding

Free users see locked CSV buttons. PNG export for profiles appears ungated. The North Star says "every screenshot is a billboard" — locking exports contradicts the growth flywheel.

## Root Cause

**CSV gating** — `frontend/lab.js:45-46`:
```javascript
if (typeof isPaidUser === "function" && !isPaidUser()) {
  _showToast('CSV export is a Pro feature', 'warning', null, {href: '/pricing.html', text: 'upgrade now'});
```

**CSV locked UI** — `frontend/lab.html:4248-4256`:
```javascript
btn.classList.add('csv-locked');
btn.innerHTML = '&#x1F512; CSV';  // lock icon
```

**PNG export** — `frontend/lab.js:6742, 7331`:
Profile PNG export functions (exportProfileImage, exportProspectImage) do NOT check `isPaidUser()`. PNG export appears available to all users.

## Assessment

Current state:
- CSV: Pro-locked (free users see 🔒 icon, get toast with upgrade CTA)
- PNG: Ungated for player profiles

This is strategically sound if screenshots are the growth engine. PNG (shareable, watermarked) should stay free. CSV (raw data, harder to share) is reasonably Pro-locked.

**Optional enhancement**: Allow free users to export CSV with top 10 rows (preview), or add a visible watermark row.

## Acceptance Criteria

- [ ] Confirm PNG export remains free (growth flywheel)
- [ ] Consider limited CSV preview for free users (top 10 rows)
