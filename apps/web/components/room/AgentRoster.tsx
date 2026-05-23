"use client";

const ROSTER = [
  { id: "razzle", emoji: "🐯", label: "Razzle", role: "Chief of Staff" },
  { id: "octo", emoji: "🐙", label: "Octo", role: "Quant" },
  { id: "bones", emoji: "🦴", label: "Bones", role: "Historian" },
] as const;

interface Props {
  active: string;
  onSelect: (id: string) => void;
}

export function AgentRoster({ active, onSelect }: Props) {
  return (
    <div className="agent-roster flex items-center gap-2">
      {ROSTER.map((a) => (
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
          <span className="text-[10px] uppercase">{a.label}</span>
        </button>
      ))}
    </div>
  );
}
