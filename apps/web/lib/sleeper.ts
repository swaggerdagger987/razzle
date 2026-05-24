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

function readStoredJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    raw = null;
  }
  try {
    raw ??= window.sessionStorage.getItem(key);
  } catch {
    raw = null;
  }
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(value);
  try {
    window.localStorage.setItem(key, raw);
  } catch {
    // Fall back to current-tab storage below.
  }
  try {
    window.sessionStorage.setItem(key, raw);
  } catch {
    // Storage can be disabled; callers still keep in-memory state for the route.
  }
}

function removeStoredJson(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Best effort; session storage clear below still removes current-tab context.
  }
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Storage can be disabled.
  }
}

export function getSleeperUser(): SleeperUser | null {
  return readStoredJson<SleeperUser | null>(USER_KEY, null);
}

export function getSleeperLeagues(): SleeperLeague[] {
  return readStoredJson<SleeperLeague[]>(LEAGUES_KEY, []);
}

export function getSelectedLeague(): SleeperLeague | null {
  return readStoredJson<SleeperLeague | null>(LEAGUE_KEY, null);
}

export function setSleeperSession(user: SleeperUser, leagues: SleeperLeague[], league?: SleeperLeague) {
  writeStoredJson(USER_KEY, user);
  writeStoredJson(LEAGUES_KEY, leagues);
  if (league) writeStoredJson(LEAGUE_KEY, league);
}

export function setSelectedLeague(league: SleeperLeague) {
  writeStoredJson(LEAGUE_KEY, league);
}

export function clearSleeperSession() {
  removeStoredJson(USER_KEY);
  removeStoredJson(LEAGUES_KEY);
  removeStoredJson(LEAGUE_KEY);
}
