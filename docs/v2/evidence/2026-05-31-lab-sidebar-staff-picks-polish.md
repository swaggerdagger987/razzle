# Evidence — Lab sidebar Staff Picks polish

**Atom:** `lab-sidebar-staff-picks-polish`  
**Verdict:** PASS

## Changes

- `LabSidebar.tsx` — orange Staff Picks banner; `hideOwnerAvatar` on grouped rows
- `lab.css` — `.lab-sidebar-staff-banner`, `.lab-sidebar-agent-group`

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_sidebar_staff_groups.py -q
npm run build --workspace=apps/web
```
