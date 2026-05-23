import { extractItems } from "@/lib/panel-api";

interface Props {
  data: unknown;
}

export function TierRenderer({ data }: Props) {
  const obj = data as Record<string, unknown>;
  let tiers: Array<Record<string, unknown>> = [];

  if (Array.isArray(obj.tiers)) {
    tiers = obj.tiers as Array<Record<string, unknown>>;
  } else {
    tiers = extractItems(data).map((row) => ({
      tier: row.tier ?? row.tier_label ?? "Tier",
      players: row.players ?? [row.full_name ?? row.name],
    }));
  }

  if (!tiers.length) return <p className="text-ink-medium p-6">no tier data yet</p>;

  return (
    <div className="tier-stack">
      {tiers.map((tier, i) => (
        <section key={i} className="tier-block chunky bg-bg-card p-4">
          <h3 className="tier-label" style={{ fontFamily: "var(--font-display)" }}>
            {String(tier.tier ?? tier.label ?? `Tier ${i + 1}`)}
          </h3>
          <ul className="tier-players">
            {(Array.isArray(tier.players) ? tier.players : []).map((p, j) => (
              <li key={j}>
                {typeof p === "string" ? p : String((p as Record<string, unknown>).full_name ?? j)}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
