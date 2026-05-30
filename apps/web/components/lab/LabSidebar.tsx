"use client";

import { AGENTS, agentForPanel, type AgentDefinition } from "@razzle/agents";
import {
  PANELS,
  panelsByCategory,
  searchPanels,
  type PanelCategory,
  type PanelDefinition,
} from "@razzle/panels";
import Link from "next/link";
import { useMemo, useState } from "react";

type GroupMode = "category" | "staff";

/** Lab analysts in roster order — the desks panels are grouped under. */
const LAB_STAFF: AgentDefinition[] = AGENTS.filter((a) => a.surfaces.includes("lab"));

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

interface Props {
  activeSlug?: string;
  collapsed?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onToggle?: () => void;
}

export function LabSidebar({ activeSlug, collapsed = false, mobileOpen = false, onCloseMobile, onToggle }: Props) {
  const [query, setQuery] = useState("");
  const [groupMode, setGroupMode] = useState<GroupMode>("category");
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

  /** Panels grouped by the analyst who owns them, in roster order. */
  const byStaff = useMemo(() => {
    const owned = new Map<string, PanelDefinition[]>();
    const unassigned: PanelDefinition[] = [];
    for (const panel of panels) {
      const owner = agentForPanel(panel.slug);
      if (owner) {
        const arr = owned.get(owner.id) ?? [];
        arr.push(panel);
        owned.set(owner.id, arr);
      } else {
        unassigned.push(panel);
      }
    }
    const desks = LAB_STAFF.map((agent) => ({ agent, items: owned.get(agent.id) ?? [] })).filter(
      (desk) => desk.items.length > 0,
    );
    return { desks, unassigned };
  }, [panels]);

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

      <div className="lab-groupmode" role="group" aria-label="Group panels by">
        <button
          type="button"
          className={`lab-groupmode-btn${groupMode === "category" ? " active" : ""}`}
          onClick={() => setGroupMode("category")}
          aria-pressed={groupMode === "category"}
        >
          Category
        </button>
        <button
          type="button"
          className={`lab-groupmode-btn${groupMode === "staff" ? " active" : ""}`}
          onClick={() => setGroupMode("staff")}
          aria-pressed={groupMode === "staff"}
        >
          Staff
        </button>
      </div>

      <div className="lab-sidebar-inner">
        {groupMode === "category" ? (
          <>
            {!query && (
              <div className="lab-sidebar-category">
                <span className="cat-text">Staff Picks</span>
              </div>
            )}
            {!query &&
              PANELS.filter((p) => STAFF_PICKS.has(p.slug)).map((panel) => (
                <SidebarItem
                  key={`staff-${panel.slug}`}
                  panel={panel}
                  activeSlug={activeSlug}
                  badge="★"
                  onNavigate={onCloseMobile}
                />
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
          </>
        ) : (
          <>
            {byStaff.desks.map(({ agent, items }) => (
              <div key={agent.id}>
                <button
                  type="button"
                  className="lab-sidebar-category lab-staff-desk"
                  onClick={() => toggleCategory(`staff-${agent.id}`)}
                >
                  <img
                    src={`/agents/${agent.avatar}.svg`}
                    alt=""
                    className="lab-sidebar-agent"
                    width={18}
                    height={18}
                  />
                  <span className="cat-text">{agent.name}</span>
                  <span className="lab-staff-role">{agent.role}</span>
                  <span aria-hidden>{collapsedCats.has(`staff-${agent.id}`) ? "▸" : "▾"}</span>
                </button>
                {!collapsedCats.has(`staff-${agent.id}`) &&
                  items.map((panel) => (
                    <SidebarItem
                      key={`${agent.id}-${panel.slug}`}
                      panel={panel}
                      activeSlug={activeSlug}
                      hideAgentAvatar
                      onNavigate={onCloseMobile}
                    />
                  ))}
              </div>
            ))}
            {byStaff.unassigned.length > 0 && (
              <div>
                <button
                  type="button"
                  className="lab-sidebar-category"
                  onClick={() => toggleCategory("staff-unassigned")}
                >
                  <span className="cat-text">More Panels</span>
                  <span aria-hidden>{collapsedCats.has("staff-unassigned") ? "▸" : "▾"}</span>
                </button>
                {!collapsedCats.has("staff-unassigned") &&
                  byStaff.unassigned.map((panel) => (
                    <SidebarItem
                      key={`more-${panel.slug}`}
                      panel={panel}
                      activeSlug={activeSlug}
                      onNavigate={onCloseMobile}
                    />
                  ))}
              </div>
            )}
          </>
        )}
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
  hideAgentAvatar = false,
  onNavigate,
}: {
  panel: PanelDefinition;
  activeSlug?: string;
  badge?: string;
  hideAgentAvatar?: boolean;
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
      {owner && !hideAgentAvatar && (
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
