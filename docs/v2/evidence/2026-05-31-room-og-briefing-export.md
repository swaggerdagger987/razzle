# Evidence — room-og-briefing-export

**Slice:** Room L5 — briefing OG export card + in-panel export button  
**Cycle:** 118  
**Date:** 2026-05-31

## Acceptance

```text
npm run build --workspace=apps/web  → exit 0
curl -s -o /tmp/room-briefing-og.png -w '%{http_code} %{size_download}' \
  'http://127.0.0.1:3000/og/briefing?download=1'
→ 200 59983
file /tmp/room-briefing-og.png → PNG 1200x630
```

## Files

- `apps/web/lib/room-briefing-og-snapshot.ts` — compact snapshot codec
- `apps/web/app/og/briefing/route.tsx` — dark Situation Room OG card + demo fallback
- `apps/web/components/room/BriefingShareBar.tsx` — export card link on completed briefings
- `apps/web/components/room/BriefingCard.tsx` — wires share bar when briefing renders

## Reality

PASS — demo OG shows urgency tier, question, staff excerpt, terracotta watermark; export encodes live briefing via snapshot param.
