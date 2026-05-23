import { extractItems } from "@/lib/panel-api";
import { formatCell } from "./TableRenderer";

interface Props {
  data: unknown;
}

export function CardsRenderer({ data }: Props) {
  const rows = extractItems(data);
  if (!rows.length) return <p className="text-ink-medium p-6">no cards yet</p>;

  return (
    <div className="panel-cards">
      {rows.map((row, i) => (
        <article key={i} className="panel-card chunky bg-bg-card p-4">
          <h3 style={{ fontFamily: "var(--font-display)" }}>
            {String(row.full_name ?? row.name ?? row.title ?? `Card ${i + 1}`)}
          </h3>
          <dl className="panel-card-stats">
            {Object.entries(row)
              .filter(([k]) => !["full_name", "name", "title", "player_id"].includes(k))
              .slice(0, 5)
              .map(([k, v]) => (
                <div key={k}>
                  <dt>{k.replace(/_/g, " ")}</dt>
                  <dd>{formatCell(v)}</dd>
                </div>
              ))}
          </dl>
        </article>
      ))}
    </div>
  );
}
