const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Position = "QB" | "RB" | "WR" | "TE" | "K" | "DST";

export type ScoringPreviewRequest = {
  position: Position;
  stats: Record<string, number>;
  rules?: Record<string, unknown>;
};

export type ValuedPlayer = {
  player_id: string;
  name: string;
  position: Position;
  projected_points: number;
  replacement_points: number;
  vorp: number;
  rank: number;
  position_rank: number;
};

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`${path} failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function previewScore(request: ScoringPreviewRequest): Promise<{ points: number }> {
  return post("/scoring/preview", request);
}

export function previewVorp(request: {
  config: Record<string, unknown>;
  players: { player_id: string; name: string; position: Position; stats: Record<string, number> }[];
}): Promise<{ players: ValuedPlayer[] }> {
  return post("/valuation/vorp/preview", request);
}
