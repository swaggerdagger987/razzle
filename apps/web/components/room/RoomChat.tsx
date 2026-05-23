"use client";

import { useState } from "react";
import type { Urgency } from "@razzle/types";
import { FUNNEL, track } from "@/lib/analytics";
import { agentContextPayload } from "@/lib/agent-context";
import { AgentRoster } from "./AgentRoster";
import { BriefingCard } from "./BriefingCard";

const PRESET_QUESTIONS = [
  "Who should I start at flex this week?",
  "Rank my trade targets by ROS value.",
  "What's my championship probability?",
  "Should I sell high on my RB1?",
  "Best waiver pickup this week?",
];

export interface ChatTurn {
  id: string;
  question: string;
  briefing: string;
  urgency: Urgency;
  specialists: string[];
  cost?: number;
  pending?: boolean;
  error?: string;
}

export function RoomChat() {
  const [activeAgent, setActiveAgent] = useState("razzle");
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");

  async function ask(question: string) {
    const id = crypto.randomUUID();
    track(FUNNEL.roomAsk, { agent: activeAgent });
    setTurns((t) => [
      ...t,
      { id, question, briefing: "", urgency: "ROUTINE", specialists: [], pending: true },
    ]);
    try {
      const r = await fetch("/api/agents/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          specialists: activeAgent === "razzle" ? [] : [activeAgent],
          format: "dynasty",
          ...agentContextPayload(),
        }),
      });
      const j = await r.json();
      setTurns((t) =>
        t.map((row) =>
          row.id === id
            ? {
                ...row,
                pending: false,
                briefing: j.briefing,
                urgency: j.urgency ?? "ROUTINE",
                specialists: j.specialists_used ?? [],
                cost: j.cost_usd,
              }
            : row,
        ),
      );
    } catch (e) {
      setTurns((t) =>
        t.map((row) => (row.id === id ? { ...row, pending: false, error: (e as Error).message } : row)),
      );
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    void ask(input.trim());
    setInput("");
  }

  return (
    <section className="room-page mx-auto grid max-w-5xl gap-6 px-6 py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl" style={{ fontFamily: "var(--font-display)" }}>
            Situation Room
          </h1>
          <p className="text-ink-medium">Three agents on duty. Razzle decides who answers.</p>
        </div>
        <AgentRoster active={activeAgent} onSelect={setActiveAgent} />
      </header>

      <div className="room-scrollback flex flex-col gap-4">
        {turns.map((turn) => (
          <BriefingCard key={turn.id} {...turn} />
        ))}
      </div>

      <form onSubmit={onSubmit} className="chunky flex gap-2 bg-bg-card p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ask anything — start/sit, trades, waivers..."
          className="chunky flex-1 bg-bg px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="chunky chunky-hover bg-orange px-5 text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          SEND
        </button>
      </form>

      <div className="quick-replies flex flex-wrap gap-2">
        {PRESET_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => void ask(q)}
            className="chunky bg-bg-card px-3 py-2 text-xs hover:bg-orange-light"
          >
            {q}
          </button>
        ))}
      </div>
    </section>
  );
}
