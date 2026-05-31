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

async function throwOnPanel402(res: Response): Promise<void> {
  if (res.status !== 402) return;
  const body = await res.json().catch(() => ({}));
  const detailRaw = (body as { detail?: unknown }).detail;
  const parsed = UpgradeDetailSchema.safeParse(detailRaw);
  const detail = parsed.success ? parsed.data : {};
  throw Object.assign(
    new Error(detail.message ?? "Pro plan required — upgrade or use DEV toolbar"),
    { upgrade: detail },
  );
}

/** Panel fetch with 402 upgrade payload for ProGateFromPanelError. */
export async function panelApiGet<T>(url: string): Promise<T> {
  const res = await fetch(url);
  await throwOnPanel402(res);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchPanelData(panel: PanelDefinition): Promise<unknown> {
  return panelApiGet(`/api/panels/${panel.slug}`);
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
