"use client";

import { AGENT_BY_ID, agentForPanel, type AgentDefinition } from "@razzle/agents";
import { getPanel } from "@razzle/panels";

interface HeaderProps {
  agent: AgentDefinition;
  slug: string;
}

export function PanelAgentHeader({ agent, slug }: HeaderProps) {
  const subtitle = getPanel(slug)?.blurb ?? agent.role;
  return (
    <header className="panel-agent-header mb-4 flex items-start gap-3">
      <img
        src={`/agents/${agent.avatar}.svg`}
        alt=""
        width={40}
        height={40}
        className="rounded-full"
      />
      <div>
        <p className="text-sm font-bold">{agent.name}</p>
        <p className="text-ink-medium text-xs">
          {agent.role} · {subtitle}
        </p>
      </div>
    </header>
  );
}

export function PanelAgentLoading({ agent }: { agent: AgentDefinition }) {
  return (
    <p className="text-ink-medium p-6" style={{ fontFamily: "var(--font-hand)" }}>
      {agent.loadingCopy}
    </p>
  );
}

/** Resolve panel owner from registry; fallback to Razzle. */
export function panelAgent(slug: string): AgentDefinition {
  return agentForPanel(slug) ?? AGENT_BY_ID.razzle;
}
