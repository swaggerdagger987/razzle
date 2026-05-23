export interface SleeperUser {
  user_id: string;
  username: string;
  display_name?: string;
  avatar?: string;
}

export interface SleeperLeague {
  league_id: string;
  name: string;
  season: string;
  total_rosters: number;
}

const USER_KEY = "razzle.sleeper.user";
const LEAGUES_KEY = "razzle.sleeper.leagues";
const LEAGUE_KEY = "razzle.sleeper.league";

export function getSleeperUser(): SleeperUser | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(sessionStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function getSleeperLeagues(): SleeperLeague[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(sessionStorage.getItem(LEAGUES_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getSelectedLeague(): SleeperLeague | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(sessionStorage.getItem(LEAGUE_KEY) || "null");
  } catch {
    return null;
  }
}

export function setSleeperSession(user: SleeperUser, leagues: SleeperLeague[], league?: SleeperLeague) {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  sessionStorage.setItem(LEAGUES_KEY, JSON.stringify(leagues));
  if (league) sessionStorage.setItem(LEAGUE_KEY, JSON.stringify(league));
}

export function setSelectedLeague(league: SleeperLeague) {
  sessionStorage.setItem(LEAGUE_KEY, JSON.stringify(league));
}

export function clearSleeperSession() {
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(LEAGUES_KEY);
  sessionStorage.removeItem(LEAGUE_KEY);
}
