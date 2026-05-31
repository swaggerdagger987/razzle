"use client";

import { AGENT_BY_ID, agentForPanel, type AgentDefinition, type AgentId } from "@razzle/agents";
import {
  PANELS,
  panelsByCategory,
  searchPanels,
  type PanelCategory,
  type PanelDefinition,
} from "@razzle/panels";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";
import { useMemo, useState } from "react";

const CATEGORY_LABELS: Record<PanelCategory, string> = {
  rankings: "Rankings",
  discovery: "Discovery",
  performance: "Performance",
  matchup: "Matchup",
  trends: "Trends",
  prospects: "Prospects",
  profile: "Profile",
  tools: "Tools",
  team: "Team",
  records: "Records",
  college: "College",
};

/** Launch-10 panels — agent-owned in sidebar Staff Picks */
const STAFF_PICKS = new Set([
  "weekly",
  "prospects",
  "rankings",
  "tradevalues",
  "breakouts",
  "gamelog",
  "efficiency",
  "aging",
  "buysell",
  "dashboard",
]);

/** Display order for Staff Picks agent groups (Hawkeye → Octo → Bones → Atlas → Razzle). */
const STAFF_AGENT_ORDER: AgentId[] = ["hawkeye", "octo", "bones", "atlas", "razzle"];

interface Props {
  activeSlug?: string;
  collapsed?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onToggle?: () => void;
}

export function LabSidebar({ activeSlug, collapsed = false, mobileOpen = false, onCloseMobile, onToggle }: Props) {
  const [query, setQuery] = useState("");
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());

  const panels = useMemo(() => (query ? searchPanels(query) : PANELS), [query]);

  const grouped = useMemo(() => {
    const map = new Map<PanelCategory, PanelDefinition[]>();
    for (const panel of panels) {
      const arr = map.get(panel.category) ?? [];
      arr.push(panel);
      map.set(panel.category, arr);
    }
    return map;
  }, [panels]);

  const staffByAgent = useMemo(() => {
    const map = new Map<AgentId, PanelDefinition[]>();
    for (const panel of PANELS) {
      if (!STAFF_PICKS.has(panel.slug)) continue;
      const owner = agentForPanel(panel.slug);
      const id = owner?.id ?? "razzle";
      const arr = map.get(id) ?? [];
      arr.push(panel);
      map.set(id, arr);
    }
    return STAFF_AGENT_ORDER.filter((id) => map.has(id)).map((id) => ({
      agent: AGENT_BY_ID[id] as AgentDefinition,
      panels: map.get(id) ?? [],
    }));
  }, []);

  function toggleCategory(cat: string) {
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  return (
    <aside
      className={`lab-sidebar${collapsed ? " collapsed" : ""}${mobileOpen ? " mobile-open" : ""}`}
      aria-label="Lab panels"
    >
      <div className="sidebar-search-wrap">
        <input
          className="sidebar-search"
          placeholder="search panels..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search panels"
        />
      </div>

      <div className="lab-sidebar-inner">
        {!query &&
          staffByAgent.map(({ agent, panels: staffPanels }) => (
            <div key={`staff-${agent.id}`}>
              <div
                className="lab-sidebar-category"
                style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "default" }}
              >
                <img
                  src={`/agents/${agent.avatar}.svg`}
                  alt=""
                  className="lab-sidebar-agent"
                  width={20}
                  height={20}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                  <span className="cat-text">{agent.name}</span>
                  <Link
                    href={
                      toRoom({
                        agentId: agent.id,
                        question: `${agent.name}, what's your read on my dynasty board?`,
                        panelSlug: "lab-sidebar",
                      }) as Route
                    }
                    className="text-orange"
                    style={{
                      fontSize: 10,
                      lineHeight: 1.2,
                      fontFamily: "var(--font-hand)",
                      textDecoration: "none",
                    }}
                    onClick={onCloseMobile}
                  >
                    ask {agent.name} →
                  </Link>
                </div>
              </div>
              {staffPanels.map((panel) => (
                <SidebarItem
                  key={`staff-${panel.slug}`}
                  panel={panel}
                  activeSlug={activeSlug}
                  badge="★"
                  onNavigate={onCloseMobile}
                />
              ))}
            </div>
          ))}

        {Array.from(grouped.entries()).map(([category, items]) => (
          <div key={category}>
            <button
              type="button"
              className="lab-sidebar-category"
              onClick={() => toggleCategory(category)}
            >
              <span className="cat-text">{CATEGORY_LABELS[category]}</span>
              <span aria-hidden>{collapsedCats.has(category) ? "▸" : "▾"}</span>
            </button>
            {!collapsedCats.has(category) &&
              items.map((panel) => (
                <SidebarItem
                  key={panel.slug}
                  panel={panel}
                  activeSlug={activeSlug}
                  onNavigate={onCloseMobile}
                />
              ))}
          </div>
        ))}
      </div>

      {onToggle && (
        <button type="button" className="lab-sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? "»" : "«"}
        </button>
      )}
    </aside>
  );
}

function SidebarItem({
  panel,
  activeSlug,
  badge,
  onNavigate,
}: {
  panel: PanelDefinition;
  activeSlug?: string;
  badge?: string;
  onNavigate?: () => void;
}) {
  const active = activeSlug === panel.slug;
  const owner = agentForPanel(panel.slug);
  return (
    <Link
      href={`/lab/${panel.slug}`}
      className={`lab-sidebar-item${active ? " active" : ""}`}
      data-icon={panel.icon}
      title={owner ? `${owner.name} · ${panel.blurb}` : panel.blurb}
      onClick={onNavigate}
    >
      {owner && (
        <img
          src={`/agents/${owner.avatar}.svg`}
          alt=""
          className="lab-sidebar-agent"
          width={18}
          height={18}
        />
      )}
      {panel.title}
      {panel.tier === "pro" && <span className="lab-pro-lock"> 🔒</span>}
      {badge && <span className="lab-staff-pick"> {badge}</span>}
    </Link>
  );
}

export function LabPanelGrid() {
  const grouped = panelsByCategory();
  return (
    <div className="lab-panel-grid">
            {Array.from(new Set(PANELS.map((p) => p.category))).map((cat) => (
        <section key={cat} className="lab-grid-section">
          <h2 className="lab-grid-heading">{CATEGORY_LABELS[cat]}</h2>
          <div className="lab-grid-cards">
            {panelsByCategory(cat).map((panel) => (
              <Link key={panel.slug} href={`/lab/${panel.slug}`} className="lab-grid-card chunky bg-bg-card">
                <span className="lab-grid-icon" aria-hidden>
                  {panel.icon}
                </span>
                <h3 style={{ fontFamily: "var(--font-display)" }}>{panel.title}</h3>
                <p className="text-ink-medium text-xs">{panel.blurb}</p>
                {panel.tier === "pro" && <span className="lab-pro-badge">PRO</span>}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
