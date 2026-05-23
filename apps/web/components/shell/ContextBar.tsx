"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearSleeperSession,
  getSelectedLeague,
  getSleeperUser,
  type SleeperLeague,
  type SleeperUser,
} from "@/lib/sleeper";

export function ContextBar() {
  const pathname = usePathname();
  const [user, setUser] = useState<SleeperUser | null>(null);
  const [league, setLeague] = useState<SleeperLeague | null>(null);

  useEffect(() => {
    setUser(getSleeperUser());
    setLeague(getSelectedLeague());
  }, [pathname]);

  function disconnect() {
    clearSleeperSession();
    setUser(null);
    setLeague(null);
  }

  return (
    <div className="context-bar">
      <div className="context-bar-inner">
        <span className="context-bar-label">Context</span>
        {user ? (
          <>
            <span className="context-bar-chip">
              @{user.username}
              {league ? ` · ${league.name}` : ""}
            </span>
            {!league && (
              <Link href="/league" className="context-bar-link">
                pick league →
              </Link>
            )}
            {league && (
              <Link href={`/league/${league.league_id}`} className="context-bar-link">
                Bureau →
              </Link>
            )}
            <button type="button" onClick={disconnect} className="context-bar-disconnect">
              disconnect
            </button>
          </>
        ) : (
          <Link href="/league" className="context-bar-connect chunky chunky-hover">
            Connect Sleeper
          </Link>
        )}
      </div>
    </div>
  );
}
