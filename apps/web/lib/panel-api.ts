import type { PanelDefinition } from "@razzle/panels";
import { z } from "zod";

const GenericSchema = z.record(z.string(), z.unknown());

const UpgradeDetailSchema = z.object({
  error: z.string().optional(),
  required: z.string().optional(),
  current: z.string().optional(),
  message: z.string().optional(),
});

export class UpgradeRequiredError extends Error {
  readonly required: string;
  readonly current: string;

  constructor(detail: { message?: string; required?: string; current?: string }) {
    super(detail.message ?? "Pro plan required");
    this.name = "UpgradeRequiredError";
    this.required = detail.required ?? "pro";
    this.current = detail.current ?? "free";
  }
}

export function isUpgradeRequiredError(err: unknown): err is UpgradeRequiredError {
  return err instanceof UpgradeRequiredError;
}

export async function fetchPanelData(panel: PanelDefinition): Promise<unknown> {
  // Slug route applies tier gating + catalog defaults
  const res = await fetch(`/api/panels/${panel.slug}`);
  if (res.status === 402) {
    const body = await res.json().catch(() => ({}));
    const detailRaw = (body as { detail?: unknown }).detail;
    const parsed = UpgradeDetailSchema.safeParse(detailRaw);
    const detail = parsed.success ? parsed.data : {};
    throw new UpgradeRequiredError({
      message: detail.message ?? "Pro plan required — upgrade or use DEV toolbar",
      required: detail.required,
      current: detail.current,
    });
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
