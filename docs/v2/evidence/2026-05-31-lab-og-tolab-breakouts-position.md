# Evidence — lab-og-tolab-breakouts-position (2026-05-31)

**Atom:** `lab-og-tolab-breakouts-position`  
**Epic:** Lab L5 — OG hallway position defaults (atom 3/3)

## Commands

```bash
pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
npm run build --workspace=apps/web
curl -s -o /tmp/og-breakouts.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/breakouts?download=1"
file /tmp/og-breakouts.png
```

## Results

| Check | Result |
|-------|--------|
| pytest | 10 passed |
| web build | exit 0 |
| curl breakouts OG | 200, 67718 bytes |
| PNG type | PNG 1200×630 |

## Verdict

PASS — `TOLAB_DEFAULT_POSITION.breakouts = "WR"` mirrors WR-only demo/export rows; rankings intentionally has no default (cross-position board). Hallway position-default epic complete.

## Trust

T5 (screenshot-worthy export), T6 (hallway toLab includes position scope)
