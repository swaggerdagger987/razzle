"use client";

import { AGENT_BY_ID, type AgentId } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { Route } from "next";

interface Snippet {
  category: string;
  text: string;
  agent_id: AgentId;
  priority?: number;
  source?: string;
}

interface Props {
  playerId: string;
  playerName?: string;
  position?: string;
}

export function PlayerIntelCard({ playerId, playerName, position }: Props) {
  const query = useQuery({
    queryKey: ["intel", playerId],
    queryFn: async () => {
      const res = await fetch(`/api/intel/player/${encodeURIComponent(playerId)}`);
      if (!res.ok) return { snippets: [] as Snippet[] };
      return res.json() as Promise<{ snippets: Snippet[] }>;
    },
    staleTime: 5 * 60 * 1000,
  });

  const snippets = query.data?.snippets ?? [];
  if (query.isPending) {
    return (
      <p className="text-ink-medium mt-4 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
        checking the injury wire...
      </p>
    );
  }
  if (!snippets.length) return null;

  return (
    <section className="player-intel-card mt-4" aria-label="Contextual intel">
      <h3 className="text-sm font-bold uppercase tracking-wide text-ink-medium">Intel</h3>
      <ul className="mt-2 flex flex-col gap-2">
        {snippets.map((s, i) => {
          const agent = AGENT_BY_ID[s.agent_id as AgentId];
          return (
            <li key={`${s.category}-${i}`} className="chunky bg-bg-card p-3 text-sm">
              <span className="mr-2" aria-hidden>
                {agent?.emoji ?? "📋"}
              </span>
              <span className="text-ink-medium text-xs uppercase">{s.category}</span>
              <p className="mt-1">{s.text}</p>
              <Link
                href={
                  toRoom({
                    agentId: s.agent_id,
                    question: `${playerName ?? "This player"}: ${s.text} — what should I do with this?`,
                    panelSlug: "player-intel",
                    player: {
                      playerId,
                      name: playerName ?? playerId,
                      slug: (playerName ?? playerId).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                      position,
                    },
                  }) as Route
                }
                className="mt-2 inline-block text-xs text-orange underline"
              >
                ask {agent?.name ?? "staff"} →
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
