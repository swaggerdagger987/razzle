// Razzle V2 typed API client.
//
// All requests funnel through here so the API origin, auth header, error
// handling, and analytics are wired in one place. The Next.js rewrite in
// next.config.mjs maps /api/* to the FastAPI backend in dev; in prod the
// SPA and API live behind the same domain so requests are same-origin.

import {
  PlayerRowSchema,
  ScreenerQuery,
  ScreenerResponseSchema,
  type PlayerRow,
  type ScreenerResponse,
} from "@razzle/types";
import { z } from "zod";

const API_BASE = "/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  init: RequestInit,
  schema: z.ZodType<T>,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    let detail: unknown = undefined;
    try {
      detail = await res.json();
    } catch {
      detail = await res.text();
    }
    throw new ApiError(`API ${res.status} on ${path}`, res.status, detail);
  }
  const json = await res.json();
  return schema.parse(json);
}

// --- Screener ---

export function runScreener(query: ScreenerQuery): Promise<ScreenerResponse> {
  return request(
    "/screener/query",
    { method: "POST", body: JSON.stringify(query) },
    ScreenerResponseSchema,
  ) as Promise<ScreenerResponse>;
}

const QuickSearchSchema = z.array(
  z.object({
    player_id: z.string(),
    full_name: z.string(),
    position: z.string(),
    team: z.string().optional(),
  }),
);

export function quickSearch(q: string, limit = 8) {
  const url = `/players/quick-search?q=${encodeURIComponent(q)}&limit=${limit}`;
  return request(url, { method: "GET" }, QuickSearchSchema);
}

const FilterOptionsSchema = z.object({
  positions: z.array(z.string()),
  teams: z.array(z.string()),
  seasons: z.array(z.number()),
});

export function getFilterOptions() {
  return request("/filter-options", { method: "GET" }, FilterOptionsSchema);
}

export type { PlayerRow };
