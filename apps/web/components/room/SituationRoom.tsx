"use client";

import { PixelRoom, type AgentId as PixelAgentId } from "@razzle/pixel-room";
import { AGENT_IDS, type AgentId } from "@razzle/agents";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Urgency } from "@razzle/types";
import { FUNNEL, track } from "@/lib/analytics";
import { agentContextPayload, setHallwayReferrer } from "@/lib/agent-context";
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

function toAgentId(id: string): AgentId {
  return (AGENT_IDS as readonly string[]).includes(id) ? (id as AgentId) : "razzle";
}

/** Canvas only renders 3 sprites today — map all six roster picks safely */
function toPixelAgent(id: AgentId): PixelAgentId {
  if (id === "octo" || id === "bones") return id;
  return "razzle";
}

export function SituationRoom() {
  const [activeAgent, setActiveAgent] = useState("razzle");
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [contextPlayer, setContextPlayer] = useState<string | null>(null);

  const selectedAgent = useMemo(() => toPixelAgent(toAgentId(activeAgent)), [activeAgent]);
  const workingAgent = useMemo(() => {
    if (turns.some((t) => t.pending)) return toPixelAgent(toAgentId(activeAgent));
    return null;
  }, [turns, activeAgent]);

  const onSelectAgent = useCallback((id: AgentId) => {
    setActiveAgent(id);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-room", "true");
    return () => document.documentElement.removeAttribute("data-room");
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const agent = params.get("agent");
    const q = params.get("q");
    const from = params.get("from");
    const playerName = params.get("name");
    if (agent && (AGENT_IDS as readonly string[]).includes(agent)) {
      setActiveAgent(agent);
    }
    if (q) setInput(q);
    if (from) setHallwayReferrer(from);
    setContextPlayer(playerName);
  }, []);

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
    <div className="room-shell room-wrapper" data-room="true">
      <header className="room-header">
        <div className="flex items-baseline gap-2">
          <span className="room-header-title">Situation Room</span>
          <span className="room-header-subtitle">
            full staff on the floor
            {contextPlayer ? ` · ${contextPlayer} in context` : ""}
          </span>
        </div>
        <AgentRoster active={activeAgent} onSelect={setActiveAgent} />
      </header>

      <div className="room-main">
        <PixelRoom
          selectedAgent={selectedAgent}
          workingAgent={workingAgent}
          onSelectAgent={(id) => onSelectAgent(id === "octo" || id === "bones" ? id : "razzle")}
        />

        <aside className="briefing-panel">
          <p className="briefing-panel-label">briefing feed</p>
          <div className="room-scrollback flex flex-1 flex-col gap-3 overflow-y-auto">
            {turns.length === 0 && (
              <p className="briefing-empty">ask a question — the staff walks the floor while they think</p>
            )}
            {turns.map((turn) => (
              <BriefingCard key={turn.id} {...turn} />
            ))}
          </div>

          <form onSubmit={onSubmit} className="briefing-input-row chunky">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="start/sit, trades, waivers..."
              className="briefing-input"
              aria-label="Ask the situation room"
            />
            <button type="submit" className="btn-chunky briefing-send">
              SEND
            </button>
          </form>

          <div className="quick-replies flex flex-wrap gap-2">
            {PRESET_QUESTIONS.map((q) => (
              <button key={q} type="button" onClick={() => void ask(q)} className="quick-reply-chip">
                {q}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
