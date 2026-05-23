import type { PanelDefinition } from "@razzle/panels";
import { z } from "zod";

const GenericSchema = z.record(z.string(), z.unknown());

export async function fetchPanelData(panel: PanelDefinition): Promise<unknown> {
  // Slug route applies tier gating + catalog defaults
  const res = await fetch(`/api/panels/${panel.slug}`);
  if (res.status === 402) {
    const body = await res.json().catch(() => ({}));
    const detail = (body as { detail?: { message?: string } }).detail;
    throw new Error(detail?.message ?? "Pro plan required — use DEV toolbar to set elite");
  }
  if (!res.ok) throw new Error(`API ${res.status} on ${panel.slug}`);
  return res.json();
}

export function extractItems(data: unknown): Array<Record<string, unknown>> {
  const parsed = GenericSchema.safeParse(data);
  if (!parsed.success) return [];
  const obj = parsed.data;
  if (Array.isArray(obj.items)) return obj.items as Array<Record<string, unknown>>;
  if (Array.isArray(obj.rows)) return obj.rows as Array<Record<string, unknown>>;
  if (Array.isArray(obj.data)) return obj.data as Array<Record<string, unknown>>;
  return [];
}
