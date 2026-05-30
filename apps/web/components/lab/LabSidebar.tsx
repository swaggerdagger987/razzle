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

type GroupMode = "category" | "staff";

/** Catch-all desk for panels no specialist owns yet — Razzle runs the floor. */
const GENERAL_DESK = {
  id: "general",
  name: "Razzle",
  role: "Chief of Staff · the floor",
  avatar: "razzle",
} as const;

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

  /** Each analyst's desk = the panels that staffer owns in the registry.
   *  Panels no specialist owns fall to Razzle's general desk, kept last. */
  const staffDesks = useMemo(() => {
    const byAgent = new Map<string, PanelDefinition[]>();
    const general: PanelDefinition[] = [];
    for (const panel of panels) {
      const owner = agentForPanel(panel.slug);
      if (owner) {
        const arr = byAgent.get(owner.id) ?? [];
        arr.push(panel);
        byAgent.set(owner.id, arr);
      } else {
        general.push(panel);
      }
    }
    const desks: { desk: { id: string; name: string; role: string; avatar: string }; items: PanelDefinition[] }[] = [];
    for (const agent of AGENTS as AgentDefinition[]) {
      const items = byAgent.get(agent.id);
      if (items && items.length > 0) {
        desks.push({ desk: { id: agent.id, name: agent.name, role: agent.role, avatar: agent.avatar }, items });
      }
    }
    if (general.length > 0) {
      desks.push({ desk: GENERAL_DESK, items: general });
    }
    return desks;
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

      {!collapsed && (
        <div className="lab-sidebar-groupmode" role="group" aria-label="Group panels by">
          <button
            type="button"
            className={`lab-groupmode-btn${groupMode === "category" ? " active" : ""}`}
            aria-pressed={groupMode === "category"}
            onClick={() => setGroupMode("category")}
          >
            By Category
          </button>
          <button
            type="button"
            className={`lab-groupmode-btn${groupMode === "staff" ? " active" : ""}`}
            aria-pressed={groupMode === "staff"}
            onClick={() => setGroupMode("staff")}
          >
            By Staff
          </button>
        </div>
      )}

      <div className="lab-sidebar-inner">
        {groupMode === "staff" && !query ? (
          staffDesks.map(({ desk, items }) => (
            <div key={desk.id}>
              <button
                type="button"
                className="lab-sidebar-category lab-sidebar-deskhead"
                onClick={() => toggleCategory(`desk-${desk.id}`)}
              >
                <span className="lab-deskhead-id">
                  <img
                    src={`/agents/${desk.avatar}.svg`}
                    alt=""
                    className="lab-sidebar-agent"
                    width={20}
                    height={20}
                  />
                  <span className="cat-text">
                    {desk.name}
                    <span className="lab-desk-role">{desk.role}</span>
                  </span>
                </span>
                <span aria-hidden>{collapsedCats.has(`desk-${desk.id}`) ? "▸" : "▾"}</span>
              </button>
              {!collapsedCats.has(`desk-${desk.id}`) &&
                items.map((panel) => (
                  <SidebarItem
                    key={`${desk.id}-${panel.slug}`}
                    panel={panel}
                    activeSlug={activeSlug}
                    onNavigate={onCloseMobile}
                  />
                ))}
            </div>
          ))
        ) : (
          <>
            {groupMode === "category" && !query && (
              <div className="lab-sidebar-category">
                <span className="cat-text">Staff Picks</span>
              </div>
            )}
            {groupMode === "category" &&
              !query &&
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
