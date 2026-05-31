# Evidence — lab-og-tolab-aging-position

**Date:** 2026-05-31  
**Atom:** `lab-og-tolab-aging-position` — aging RB in OG toLab watermark  
**Verdict:** PASS

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
npm run build --workspace=apps/web
```

## Results

| Check | Output |
|-------|--------|
| pytest | 10 passed |
| web build | exit 0 |

## Behavior

`TOLAB_DEFAULT_POSITION.aging` mirrors `AgingCurvesRenderer` default RB.

## Trust

T5, T6
