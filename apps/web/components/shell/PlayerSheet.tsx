"use client";

import { PositionPill } from "@razzle/ui";
import Link from "next/link";
import { useState } from "react";
import { agentContextPayload } from "@/lib/agent-context";
import { usePlayerSheet, type PlayerSheetTab } from "@/lib/player-sheet-context";
import { PlayerStatsTab } from "./PlayerStatsTab";

const TABS: Array<{ id: PlayerSheetTab; label: string }> = [
  { id: "stats", label: "Stats" },
  { id: "panels", label: "Panels" },
  { id: "league", label: "League" },
  { id: "ask", label: "Ask" },
];

export function PlayerSheet() {
  const { open, player, tab, closePlayer, setTab } = usePlayerSheet();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  if (!open || !player) return null;

  async function askAboutPlayer(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !player) return;
    setAsking(true);
    setAnswer(null);
    try {
      const res = await fetch("/api/agents/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `${player.name}: ${question.trim()}`,
          format: "dynasty",
          player_id: player.playerId,
          ...agentContextPayload(),
        }),
      });
      const json = await res.json();
      setAnswer(json.briefing ?? "No briefing returned.");
    } catch (err) {
      setAnswer(`something fumbled: ${(err as Error).message}`);
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="player-sheet-backdrop" onClick={closePlayer} role="presentation">
      <aside
        className="player-sheet chunky"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${player.name} player sheet`}
      >
        <header className="player-sheet-header">
          <div>
            <h2 style={{ fontFamily: "var(--font-display)" }}>{player.name}</h2>
            <div className="player-sheet-meta">
              {player.position && <PositionPill position={player.position as "QB" | "RB" | "WR" | "TE"} />}
              {player.team && <span>{player.team}</span>}
            </div>
          </div>
          <button type="button" className="player-sheet-close" onClick={closePlayer} aria-label="Close">
            ✕
          </button>
        </header>

        <div className="player-sheet-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`player-sheet-tab${tab === t.id ? " active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="player-sheet-body">
          {tab === "stats" && <PlayerStatsTab playerId={player.playerId} />}

          {tab === "panels" && (
            <ul className="player-sheet-panel-list">
              {["gamelog", "percentiles", "career", "breakdown"].map((slug) => (
                <li key={slug}>
                  <Link href={`/lab/${slug}`} className="lab-sidebar-item" onClick={closePlayer}>
                    {slug.replace(/-/g, " ")}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {tab === "league" && (
            <div className="player-sheet-section">
              <p className="text-ink-medium text-sm">
                Connect Sleeper in the Context Bar to see league-specific trade value, roster fit, and
                opponent context for {player.name}.
              </p>
              <Link href="/league" className="chunky chunky-hover mt-4 inline-block bg-orange px-4 py-2 text-white">
                Connect League
              </Link>
            </div>
          )}

          {tab === "ask" && (
            <form onSubmit={askAboutPlayer} className="player-sheet-ask">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={`Ask Razzle about ${player.name}...`}
                className="chunky w-full bg-bg p-3 text-sm"
                rows={3}
              />
              <button
                type="submit"
                disabled={asking}
                className="chunky chunky-hover bg-orange px-4 py-2 text-white disabled:opacity-50"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {asking ? "pulling film..." : "Ask Razzle"}
              </button>
              {answer && <p className="player-sheet-answer">{answer}</p>}
            </form>
          )}
        </div>
      </aside>
    </div>
  );
}
