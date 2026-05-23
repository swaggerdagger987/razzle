"use client";

import { AGENTS, type AgentId } from "@razzle/agents";

interface Props {
  active: string;
  onSelect: (id: AgentId) => void;
}

export function AgentRoster({ active, onSelect }: Props) {
  return (
    <div className="agent-roster flex flex-wrap items-center gap-2">
      {AGENTS.map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={() => onSelect(a.id)}
          title={a.role}
          className={`chunky flex h-16 w-16 flex-col items-center justify-center text-2xl ${
            active === a.id ? "bg-orange text-white" : "bg-bg-card"
          }`}
          aria-pressed={active === a.id}
        >
          <span aria-hidden>{a.emoji}</span>
          <span className="text-[10px] uppercase">{a.name.split(" ").pop()}</span>
        </button>
      ))}
    </div>
  );
}
