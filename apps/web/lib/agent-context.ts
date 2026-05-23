import { getSelectedLeague, getSleeperUser } from "./sleeper";

/** Sleeper + league ids for agent context injection. */
export function agentContextPayload(): { league_id?: string; user_id?: string } {
  const user = getSleeperUser();
  const league = getSelectedLeague();
  return {
    league_id: league?.league_id,
    user_id: user?.user_id,
  };
}
