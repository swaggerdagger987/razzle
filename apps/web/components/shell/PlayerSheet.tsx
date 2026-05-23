"use client";

import { PositionPill } from "@razzle/ui";
import Link from "next/link";
import type { Route } from "next";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AGENTS,
  AGENT_BY_ID,
  loadingCopyForAgent,
  suggestAgentForQuestion,
  type AgentId,
} from "@razzle/agents";
import { toLab, toRoom } from "@razzle/hallway";
import { agentContextPayload } from "@/lib/agent-context";
import { getSelectedLeague, getSleeperUser } from "@/lib/sleeper";
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
  const searchParams = useSearchParams();
  const isCollege = searchParams.get("universe") === "college";
  const hawkeye = AGENT_BY_ID.hawkeye;
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [askAgent, setAskAgent] = useState<AgentId>("dolphin");
  const [leagueName, setLeagueName] = useState<string | null>(null);
  const [leagueId, setLeagueId] = useState<string | null>(null);
  const [sleeperUser, setSleeperUser] = useState<string | null>(null);
  const [rosterStatus, setRosterStatus] = useState<string | null>(null);
  const [rosterLoading, setRosterLoading] = useState(false);

  useEffect(() => {
    const league = getSelectedLeague();
    const user = getSleeperUser();
    setLeagueName(league?.name ?? null);
    setLeagueId(league?.league_id ?? null);
    setSleeperUser(user?.username ?? null);
    setRosterStatus(null);

    if (!open || !player || !league?.league_id || !user?.user_id) return;

    setRosterLoading(true);
    fetch("/api/bureau/player-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        league_id: league.league_id,
        user_id: user.user_id,
        player_id: player.playerId,
      }),
    })
      .then((r) => r.json())
      .then((j) => {
        if (j.error) {
          setRosterStatus(null);
          return;
        }
        if (j.status === "yours") {
          setRosterStatus(j.starter ? "On your roster (starter)" : "On your roster (bench)");
        } else if (j.status === "owned") {
          setRosterStatus(`Owned by ${j.team_name}`);
        } else if (j.status === "fa") {
          setRosterStatus("Free agent in your league");
        }
      })
      .catch(() => setRosterStatus(null))
      .finally(() => setRosterLoading(false));
  }, [open, player?.playerId]);

  useEffect(() => {
    if (isCollege) setAskAgent("hawkeye");
  }, [isCollege, player?.playerId]);

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
          specialists: askAgent === "razzle" ? [] : [askAgent],
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
              {isCollege && (
                <li className="mb-3 border-b border-ink pb-3">
                  <Link
                    href={toLab("prospects", { player: player! }) as Route}
                    className="text-sm text-orange underline"
                    onClick={closePlayer}
                    style={{ fontFamily: "var(--font-hand)" }}
                  >
                    {hawkeye.name}: college → big board →
                  </Link>
                </li>
              )}
              {[
                { slug: "prospects", label: "Prospect Big Board" },
                { slug: "dashboard", label: "Dynasty Dashboard" },
                { slug: "rankings", label: "Dynasty Rankings" },
                { slug: "tradevalues", label: "Trade Values" },
                { slug: "buysell", label: "Buy / Sell" },
                { slug: "gamelog", label: "Game Log" },
                { slug: "breakouts", label: "Breakouts" },
                { slug: "weekly", label: "Weekly Heatmap" },
                { slug: "aging", label: "Aging Curves" },
              ].map(({ slug, label }) => (
                <li key={slug}>
                  <Link
                    href={
                      toLab(slug, {
                        player: {
                          playerId: player.playerId,
                          slug: player.slug,
                          name: player.name,
                          position: player.position,
                          team: player.team,
                        },
                      }) as Route
                    }
                    className="lab-sidebar-item"
                    onClick={closePlayer}
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li className="mt-4 border-t border-ink pt-3">
                <Link
                  href={
                    toRoom({
                      agentId: "octo",
                      question: `${player.name}: dynasty value and tier?`,
                    }) as Route
                  }
                  className="text-sm text-orange underline"
                  onClick={closePlayer}
                >
                  Ask Octo in Situation Room →
                </Link>
              </li>
            </ul>
          )}

          {tab === "league" && (
            <div className="player-sheet-section">
              {leagueName ? (
                <>
                  <p className="text-sm">
                    <strong>{player.name}</strong> in{" "}
                    <span style={{ fontFamily: "var(--font-mono)" }}>{leagueName}</span>
                    {sleeperUser && <> · @{sleeperUser}</>}
                  </p>
                  {rosterLoading && <p className="text-ink-medium mt-2 text-sm">pulling film...</p>}
                  {!rosterLoading && rosterStatus && (
                    <p className="mt-2 text-sm text-orange" style={{ fontFamily: "var(--font-hand)" }}>
                      {rosterStatus}
                    </p>
                  )}
                  <p className="text-ink-medium mt-2 text-sm">
                    Roster fit and trade context use your connected league — same context the film room sees.
                  </p>
                  <Link
                    href={leagueId ? `/league/${leagueId}` : "/league"}
                    className="chunky chunky-hover mt-4 inline-block bg-orange px-4 py-2 text-white"
                    onClick={closePlayer}
                  >
                    Open Bureau
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-ink-medium text-sm">
                    Connect Sleeper in the Context Bar to see league-specific trade value, roster fit, and
                    opponent context for {player.name}.
                  </p>
                  <Link href="/league" className="chunky chunky-hover mt-4 inline-block bg-orange px-4 py-2 text-white">
                    Connect League
                  </Link>
                </>
              )}
            </div>
          )}

          {tab === "ask" && (
            <form onSubmit={askAboutPlayer} className="player-sheet-ask">
              <div className="mb-3 flex flex-wrap gap-2">
                {AGENTS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAskAgent(a.id)}
                    className={`chunky px-2 py-1 text-xs ${askAgent === a.id ? "bg-orange text-white" : "bg-bg-card"}`}
                    aria-pressed={askAgent === a.id}
                  >
                    {a.emoji} {a.name}
                  </button>
                ))}
              </div>
              <textarea
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  if (e.target.value.trim()) {
                    setAskAgent(suggestAgentForQuestion(e.target.value, true));
                  }
                }}
                placeholder={
                  isCollege
                    ? `Scout ${player.name}'s draft profile and dynasty outlook...`
                    : `Ask ${AGENT_BY_ID[askAgent]?.name ?? "Razzle"} about ${player.name}...`
                }
                className="chunky w-full bg-bg p-3 text-sm"
                rows={3}
              />
              <button
                type="submit"
                disabled={asking}
                className="chunky chunky-hover bg-orange px-4 py-2 text-white disabled:opacity-50"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {asking ? loadingCopyForAgent(askAgent) : `Ask ${AGENT_BY_ID[askAgent]?.name ?? "Razzle"}`}
              </button>
              {answer && <p className="player-sheet-answer">{answer}</p>}
            </form>
          )}
        </div>
      </aside>
    </div>
  );
}
