# Evidence — Room briefing OG card (2026-05-31)

**Atom:** `room-briefing-og-card`  
**Epic:** Room L5 — briefing GTM export (atom 2/3)

## Acceptance

```text
PATH="$HOME/.local/bin:$PATH" python3 -m pytest apps/api/tests/test_briefing_og_route.py -q --noconftest
→ 2 passed

npm run build --workspace=apps/web
→ exit 0

curl -s -o /tmp/og-briefing.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/briefing?download=1'
→ 200 72168
file /tmp/og-briefing.png → PNG 1200×630
```

## Change

- `apps/web/app/og/briefing/route.tsx` — demo briefing card + live query params
- `BriefingCard.tsx` — `export card` link with question/briefing/urgency in URL

## Gate C

PASS — PNG ≥40KB with sample trade briefing rows (not loading-copy-only).

## Trust

T5 (shareable Room artifact), T6 (hallway link to `/room`).
