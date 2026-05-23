"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type PlayerSheetTab = "stats" | "panels" | "league" | "ask";

export interface PlayerSheetTarget {
  playerId: string;
  slug: string;
  name: string;
  position?: string;
  team?: string;
}

interface PlayerSheetContextValue {
  open: boolean;
  player: PlayerSheetTarget | null;
  tab: PlayerSheetTab;
  openPlayer: (player: PlayerSheetTarget, tab?: PlayerSheetTab) => void;
  closePlayer: () => void;
  setTab: (tab: PlayerSheetTab) => void;
}

const PlayerSheetContext = createContext<PlayerSheetContextValue | null>(null);

export function PlayerSheetProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [player, setPlayer] = useState<PlayerSheetTarget | null>(null);
  const [tab, setTab] = useState<PlayerSheetTab>("stats");

  const openPlayer = useCallback((next: PlayerSheetTarget, nextTab: PlayerSheetTab = "stats") => {
    setPlayer(next);
    setTab(nextTab);
    setOpen(true);
  }, []);

  const closePlayer = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    const slug = searchParams.get("player");
    if (!slug) return;
    const tabParam = (searchParams.get("tab") as PlayerSheetTab | null) ?? "stats";
    openPlayer(
      {
        slug,
        playerId: searchParams.get("id") ?? slug,
        name: searchParams.get("name") ?? slug.replace(/-/g, " "),
        position: searchParams.get("pos") ?? undefined,
        team: searchParams.get("team") ?? undefined,
      },
      tabParam,
    );
  }, [searchParams, openPlayer]);

  const value = useMemo(
    () => ({ open, player, tab, openPlayer, closePlayer, setTab }),
    [open, player, tab, openPlayer, closePlayer],
  );

  return <PlayerSheetContext.Provider value={value}>{children}</PlayerSheetContext.Provider>;
}

export function usePlayerSheet() {
  const ctx = useContext(PlayerSheetContext);
  if (!ctx) throw new Error("usePlayerSheet must be used within PlayerSheetProvider");
  return ctx;
}
