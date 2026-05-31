# Evidence — Lab OG breakouts position filter

**Verdict:** PASS  
**curl:** `/og/breakouts?position=WR` → 200 61718 bytes PNG  
**Change:** `BreakoutsRenderer` passes `position` to `LabOgExportLink`.
