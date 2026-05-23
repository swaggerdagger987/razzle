"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import { AGENT_BY_ID } from "@razzle/agents";
import {
  AGENT_ACCENT,
  dismissNudgeId,
  getNudgeSessionCount,
  incrementNudgeSessionCount,
  MAX_NUDGES_PER_SESSION,
  pickEligibleNudge,
  type AgentNudgeDef,
  type NudgeSource,
} from "@/lib/agent-nudges";
import { getSelectedLeague } from "@/lib/sleeper";
import { useDevPlan } from "@/lib/use-dev-plan";

interface Props {
  source: NudgeSource;
  /** Delay before showing — avoids flash on fast navigations. */
  delayMs?: number;
}

export function AgentNudgeBar({ source, delayMs = 2500 }: Props) {
  const plan = useDevPlan();
  const [nudge, setNudge] = useState<AgentNudgeDef | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (plan !== "elite") return;
    if (getNudgeSessionCount() >= MAX_NUDGES_PER_SESSION) return;

    const league = getSelectedLeague();
    const hasLeague = Boolean(league?.league_id);
    const picked = pickEligibleNudge(source, hasLeague);
    if (!picked) return;

    const timer = window.setTimeout(() => {
      setNudge(picked);
      setVisible(true);
      incrementNudgeSessionCount();
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [plan, source, delayMs]);

  if (!nudge || !visible) return null;

  const agent = AGENT_BY_ID[nudge.agentId];
  const leagueId = getSelectedLeague()?.league_id;
  const href = nudge.href({ leagueId });
  const accent = AGENT_ACCENT[nudge.agentId];

  function onDismiss() {
    dismissNudgeId(nudge!.id);
    setVisible(false);
  }

  return (
    <div
      className="agent-nudge chunky bg-bg-card"
      style={{ borderColor: accent }}
      role="status"
      aria-live="polite"
    >
      <img src={`/agents/${agent.avatar}.svg`} alt="" width={18} height={18} className="shrink-0" />
      <span className="agent-nudge-name" style={{ color: accent }}>
        {agent.name}
      </span>
      <span className="agent-nudge-message">{nudge.message}</span>
      <Link href={href as Route} className="agent-nudge-link">
        {nudge.linkLabel} →
      </Link>
      <button type="button" className="agent-nudge-dismiss" onClick={onDismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
