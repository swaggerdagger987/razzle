"use client";

import { AGENT_BY_ID, agentForPanel, type AgentDefinition, type AgentId } from "@razzle/agents";
import {
  PANELS,
  panelsByCategory,
  searchPanels,
  type PanelCategory,
  type PanelDefinition,
} from "@razzle/panels";
import Link from "next/link";
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

/** Display order for staff desk groups (hallway H-04). */
const STAFF_AGENT_ORDER: AgentId[] = ["hawkeye", "octo", "bones", "atlas", "dolphin", "razzle"];

type SidebarView = "category" | "staff";

interface Props {
  activeSlug?: string;
  collapsed?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onToggle?: () => void;
}

export function LabSidebar({ activeSlug, collapsed = false, mobileOpen = false, onCloseMobile, onToggle }: Props) {
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<SidebarView>("category");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

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
    for (const panel of panels) {
      const owner = agentForPanel(panel.slug);
      const id = owner?.id ?? "razzle";
      const arr = map.get(id) ?? [];
      arr.push(panel);
      map.set(id, arr);
    }
    const ordered = STAFF_AGENT_ORDER.filter((id) => map.has(id)).map((id) => ({
      agent: AGENT_BY_ID[id] as AgentDefinition,
      panels: map.get(id) ?? [],
    }));
    for (const [id, agentPanels] of map) {
      if (STAFF_AGENT_ORDER.includes(id)) continue;
      ordered.push({ agent: AGENT_BY_ID[id] as AgentDefinition, panels: agentPanels });
    }
    return ordered;
  }, [panels]);

  function toggleGroup(key: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const showStaffView = viewMode === "staff" && !query;

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
        {!query && !collapsed && (
          <div className="lab-sidebar-view-toggle" role="group" aria-label="Sidebar grouping">
            <button
              type="button"
              className={`lab-sidebar-view-btn${viewMode === "category" ? " active" : ""}`}
              onClick={() => setViewMode("category")}
              aria-pressed={viewMode === "category"}
            >
              Category
            </button>
            <button
              type="button"
              className={`lab-sidebar-view-btn${viewMode === "staff" ? " active" : ""}`}
              onClick={() => setViewMode("staff")}
              aria-pressed={viewMode === "staff"}
            >
              Staff
            </button>
          </div>
        )}
      </div>

      <div className="lab-sidebar-inner">
        {showStaffView
          ? staffByAgent.map(({ agent, panels: agentPanels }) => {
              const groupKey = `desk-${agent.id}`;
              return (
                <div key={groupKey}>
                  <button
                    type="button"
                    className="lab-sidebar-category lab-sidebar-desk"
                    onClick={() => toggleGroup(groupKey)}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <img
                        src={`/agents/${agent.avatar}.svg`}
                        alt=""
                        className="lab-sidebar-agent"
                        width={20}
                        height={20}
                      />
                      <span className="cat-text">{agent.name}</span>
                    </span>
                    <span aria-hidden>{collapsedGroups.has(groupKey) ? "▸" : "▾"}</span>
                  </button>
                  {!collapsedGroups.has(groupKey) &&
                    agentPanels.map((panel) => (
                      <SidebarItem
                        key={panel.slug}
                        panel={panel}
                        activeSlug={activeSlug}
                        onNavigate={onCloseMobile}
                      />
                    ))}
                </div>
              );
            })
          : Array.from(grouped.entries()).map(([category, items]) => (
              <div key={category}>
                <button
                  type="button"
                  className="lab-sidebar-category"
                  onClick={() => toggleGroup(category)}
                >
                  <span className="cat-text">{CATEGORY_LABELS[category]}</span>
                  <span aria-hidden>{collapsedGroups.has(category) ? "▸" : "▾"}</span>
                </button>
                {!collapsedGroups.has(category) &&
                  items.map((panel) => (
                    <SidebarItem
                      key={panel.slug}
                      panel={panel}
                      activeSlug={activeSlug}
                      showOwnerInTitle={Boolean(query)}
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
  showOwnerInTitle = false,
  onNavigate,
}: {
  panel: PanelDefinition;
  activeSlug?: string;
  badge?: string;
  /** When searching, prefix visible title with agent owner (hallway H-04). */
  showOwnerInTitle?: boolean;
  onNavigate?: () => void;
}) {
  const active = activeSlug === panel.slug;
  const owner = agentForPanel(panel.slug);
  const label =
    showOwnerInTitle && owner ? `${owner.name} · ${panel.title}` : panel.title;
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
      {label}
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
