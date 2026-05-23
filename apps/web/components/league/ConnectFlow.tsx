"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FUNNEL, track } from "@/lib/analytics";
import { setSleeperSession, type SleeperLeague, type SleeperUser } from "@/lib/sleeper";

export function ConnectFlow() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [season, setSeason] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leagues, setLeagues] = useState<SleeperLeague[] | null>(null);
  const [user, setUser] = useState<SleeperUser | null>(null);

  async function connect(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    track(FUNNEL.bureauConnect);
    try {
      const userRes = await fetch(`https://api.sleeper.app/v1/user/${encodeURIComponent(username)}`);
      if (!userRes.ok) throw new Error("sleeper user not found");
      const sleeperUser = (await userRes.json()) as SleeperUser;
      const leaguesRes = await fetch(
        `https://api.sleeper.app/v1/user/${sleeperUser.user_id}/leagues/nfl/${season}`,
      );
      const leagueList = (await leaguesRes.json()) as SleeperLeague[];
      if (!Array.isArray(leagueList) || leagueList.length === 0) {
        throw new Error("no leagues found for that season");
      }
      setUser(sleeperUser);
      setLeagues(leagueList);
      setSleeperSession(sleeperUser, leagueList);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function pickLeague(league: SleeperLeague) {
    if (!user || !leagues) return;
    setSleeperSession(user, leagues, league);
    router.push(`/league/${league.league_id}`);
  }

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <header className="mb-8 text-center">
        <h1 className="text-4xl" style={{ fontFamily: "var(--font-display)" }}>
          Bureau of Intelligence
        </h1>
        <p className="mt-2 text-ink-medium">Your team analyzed first. Sleeper username only.</p>
      </header>

      {!leagues ? (
        <form onSubmit={connect} className="chunky flex flex-col gap-3 bg-bg-card p-6">
          <label className="text-sm font-bold">Sleeper username</label>
          <input
            autoFocus
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. swaggerdagger987"
            className="chunky bg-bg px-3 py-2 text-sm"
          />
          <label className="text-sm font-bold">Season</label>
          <input
            type="number"
            value={season}
            onChange={(e) => setSeason(Number(e.target.value))}
            className="chunky bg-bg px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="chunky chunky-hover mt-2 bg-orange py-3 text-white disabled:opacity-50"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {loading ? "pulling film..." : "Connect Sleeper"}
          </button>
          {error && <p className="text-sm text-red">{error}</p>}
        </form>
      ) : (
        <div className="chunky flex flex-col gap-2 bg-bg-card p-6">
          <p className="text-sm text-ink-medium">Pick a league for @{user?.username}</p>
          {leagues.map((league) => (
            <button
              key={league.league_id}
              type="button"
              onClick={() => pickLeague(league)}
              className="chunky chunky-hover bg-bg px-4 py-3 text-left text-sm hover:bg-orange-light"
            >
              {league.name}
              <span className="text-ink-light ml-2">{league.season}</span>
            </button>
          ))}
        </div>
      )}

      <p className="mt-6 text-center text-2xl text-ink-light" style={{ fontFamily: "var(--font-hand)" }}>
        no login required — public sleeper data only
      </p>
    </section>
  );
}
