# Evidence — Room briefing copy link (2026-05-31)

**Atom:** `room-briefing-copy-link`  
**Epic:** Room L5 — briefing GTM export

## Acceptance

```text
python3 -m pytest apps/api/tests/test_briefing_share_link.py apps/api/tests/test_briefing_og_route.py -q --noconftest
→ 7 passed

npm run build --workspace=apps/web → exit 0

curl http://127.0.0.1:3000/og/briefing?download=1 → 200 72168B PNG
```

## Change

- `BriefingShareBar` — copies OG preview URL (not Room path) for GTM threads; keeps preview + export buttons.
- `BriefingCard` — delegates share row to share bar.

## Trust

T5, T6
