import { extractItems } from "@/lib/panel-api";

interface Props {
  data: unknown;
}

export function NetworkRenderer({ data }: Props) {
  const obj = data as Record<string, unknown>;
  const nodes = (Array.isArray(obj.nodes) ? obj.nodes : extractItems(data)) as Array<Record<string, unknown>>;
  const edges = (Array.isArray(obj.edges) ? obj.edges : []) as Array<Record<string, unknown>>;

  return (
    <div className="network-panel chunky bg-bg-card p-6">
      <div className="network-nodes">
        {nodes.slice(0, 12).map((node, i) => (
          <div key={i} className="network-node chunky bg-bg p-3">
            {String(node.label ?? node.name ?? node.full_name ?? `Node ${i + 1}`)}
          </div>
        ))}
      </div>
      {edges.length > 0 && (
        <ul className="network-edges mt-4 text-sm text-ink-medium">
          {edges.slice(0, 8).map((edge, i) => (
            <li key={i}>
              {String(edge.from ?? edge.source)} → {String(edge.to ?? edge.target)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
