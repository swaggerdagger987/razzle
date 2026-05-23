"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import type { PanelDef } from "../registry";

const ListSchema = z.object({
  items: z.array(z.record(z.string(), z.unknown())),
});

interface Props {
  panel: PanelDef;
  endpoint: string;
  columns: Array<{ key: string; label: string; format?: (v: unknown) => string }>;
}

export function GenericTablePanel({ panel, endpoint, columns }: Props) {
  const q = useQuery({
    queryKey: ["panel", endpoint],
    queryFn: async () => {
      const r = await fetch(endpoint);
      if (!r.ok) throw new Error(`API ${r.status}`);
      return ListSchema.parse(await r.json());
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          {panel.title}
        </h1>
        <p className="text-sm text-ink-medium">{panel.blurb}</p>
      </header>

      {q.isPending && <p className="text-ink-medium">pulling film...</p>}
      {q.isError && <p className="text-red">something fumbled: {(q.error as Error).message}</p>}
      {q.isSuccess && (
        <div className="chunky overflow-auto bg-bg-card">
          <table className="w-full text-sm">
            <thead className="border-b-[3px] border-ink">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className="px-3 py-2 text-left font-bold">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {q.data.items.map((row, i) => (
                <tr key={i} className="border-b border-ink-faint hover:bg-orange-light">
                  {columns.map((c) => (
                    <td key={c.key} className="px-3 py-2">
                      {c.format ? c.format(row[c.key]) : String(row[c.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
