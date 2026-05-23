/**
 * The hallway — connective tissue between the four rooms.
 * See docs/v2/HALLWAY.md. Every vertical slice must wire through here.
 */

import type { AgentId } from "@razzle/agents";

/** The four product rooms — never silo. */
export type Room = "explore" | "lab" | "league" | "room";

export const ROOMS: Room[] = ["explore", "lab", "league", "room"];

export interface PlayerRef {
  playerId: string;
  slug: string;
  name: string;
  position?: string;
  team?: string;
}

/** Shared context that must survive room transitions. */
export interface HallwayContext {
  player?: PlayerRef;
  leagueId?: string;
  sleeperUserId?: string;
  panelSlug?: string;
  bureauFeature?: string;
  agentId?: AgentId;
  /** Pre-filled question for Room / Player Sheet Ask */
  question?: string;
}

/** Typed cross-room link — use these instead of raw href strings. */
export interface HallwayLink {
  from: Room;
  to: Room;
  label: string;
  href: string;
  agentId?: AgentId;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function playerQueryParams(p: PlayerRef): URLSearchParams {
  const q = new URLSearchParams();
  q.set("player", p.slug || slugify(p.name));
  q.set("id", p.playerId);
  q.set("name", p.name);
  if (p.position) q.set("pos", p.position);
  if (p.team) q.set("team", p.team);
  return q;
}

/** Explore with Player Sheet open (URL state). */
export function toExplore(ctx: Pick<HallwayContext, "player"> & { tab?: string }): string {
  if (!ctx.player) return "/explore";
  const q = playerQueryParams(ctx.player);
  if (ctx.tab) q.set("tab", ctx.tab);
  return `/explore?${q.toString()}`;
}

/** Lab panel — optional player context via query for future deep links. */
export function toLab(panelSlug: string, ctx?: Pick<HallwayContext, "player">): string {
  const base = `/lab/${panelSlug}`;
  if (!ctx?.player) return base;
  const q = playerQueryParams(ctx.player);
  return `${base}?${q.toString()}`;
}

/** Bureau / league intelligence. */
export function toLeague(leagueId?: string, feature?: string): string {
  if (!leagueId) return "/league";
  if (feature) return `/league/${leagueId}/${feature}`;
  return `/league/${leagueId}`;
}

/** Situation Room — optional agent + question prefill. */
export function toRoom(ctx?: Pick<HallwayContext, "agentId" | "question" | "panelSlug">): string {
  if (!ctx?.agentId && !ctx?.question && !ctx?.panelSlug) return "/room";
  const q = new URLSearchParams();
  if (ctx.agentId) q.set("agent", ctx.agentId);
  if (ctx.question) q.set("q", ctx.question);
  if (ctx.panelSlug) q.set("from", ctx.panelSlug);
  return `/room?${q.toString()}`;
}

/** Player Sheet tabs bridge every room. */
export function playerSheetTab(
  player: PlayerRef,
  tab: "stats" | "panels" | "league" | "ask",
  basePath = "/explore",
): string {
  const q = playerQueryParams(player);
  q.set("tab", tab);
  return `${basePath}?${q.toString()}`;
}

/** Standard hallway exits from Player Sheet — use in UI nudges. */
export function hallwayLinksFromPlayer(player: PlayerRef, leagueId?: string): HallwayLink[] {
  const links: HallwayLink[] = [
    {
      from: "explore",
      to: "lab",
      label: "Open in Lab panels",
      href: playerSheetTab(player, "panels"),
    },
    {
      from: "explore",
      to: "room",
      label: "Ask in Situation Room",
      href: toRoom({ agentId: "dolphin", question: `${player.name} injury and outlook?` }),
      agentId: "dolphin",
    },
  ];
  if (leagueId) {
    links.push({
      from: "explore",
      to: "league",
      label: "League context in Bureau",
      href: toLeague(leagueId),
    });
  }
  return links;
}

/**
 * Gate for vertical slices — council must check before marking slice done.
 * See docs/v2/HALLWAY.md § Slice checklist.
 */
export interface HallwaySliceChecklist {
  /** Player clicked in room A opens same player in Player Sheet */
  playerIdentityConsistent: boolean;
  /** Context bar shows league after connect on all four routes */
  leagueContextGlobal: boolean;
  /** agentContextPayload / build_context_block includes league + player when available */
  agentPromptWired: boolean;
  /** At least one explicit link/nudge to another room from this slice */
  crossRoomLinkPresent: boolean;
  /** Same agent id + voice in this slice matches packages/agents registry */
  agentRegistryAligned: boolean;
  /** Injury/medical surface routes to or mentions Dolphin */
  dolphinReachable: boolean;
}

export function hallwaySlicePassed(check: HallwaySliceChecklist): boolean {
  return Object.values(check).every(Boolean);
}

export const HALLWAY_STORAGE_KEYS = {
  sleeperUser: "razzle.sleeper.user",
  selectedLeague: "razzle.sleeper.league",
} as const;

/** Rooms and what carries between them */
export const HALLWAY_MAP: Record<Room, { carries: string[]; receives: string[] }> = {
  explore: {
    carries: ["player", "filters", "universe", "sort"],
    receives: ["league from context bar", "agent nudges from Bureau"],
  },
  lab: {
    carries: ["player", "panel slug", "season"],
    receives: ["player from Explore", "league for pro panels"],
  },
  league: {
    carries: ["league id", "user id", "manager/roster context"],
    receives: ["player from sheet", "panel insights → Room callbacks"],
  },
  room: {
    carries: ["league id", "user id", "player id", "specialist choice"],
    receives: ["everything — agents synthesize cross-room context"],
  },
};
