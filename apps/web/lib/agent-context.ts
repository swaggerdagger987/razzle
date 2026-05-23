import { getSelectedLeague, getSleeperUser } from "./sleeper";

const HALLWAY_FROM_KEY = "razzle.hallway.from";

/** Persist Lab/Bureau surface for Room callback prompts (H-06). */
export function setHallwayReferrer(panelSlug: string | null): void {
  if (typeof window === "undefined") return;
  if (panelSlug) sessionStorage.setItem(HALLWAY_FROM_KEY, panelSlug);
  else sessionStorage.removeItem(HALLWAY_FROM_KEY);
}

export function getHallwayReferrer(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return sessionStorage.getItem(HALLWAY_FROM_KEY) ?? undefined;
}

/** Sleeper + league + player ids for agent context injection. */
export function agentContextPayload(): {
  league_id?: string;
  user_id?: string;
  referrer_panel?: string;
  player_id?: string;
} {
  const user = getSleeperUser();
  const league = getSelectedLeague();
  const referrer = getHallwayReferrer();
  let playerId: string | undefined;
  if (typeof window !== "undefined") {
    playerId = new URLSearchParams(window.location.search).get("id") ?? undefined;
  }
  return {
    league_id: league?.league_id,
    user_id: user?.user_id,
    ...(referrer ? { referrer_panel: referrer } : {}),
    ...(playerId ? { player_id: playerId } : {}),
  };
}
