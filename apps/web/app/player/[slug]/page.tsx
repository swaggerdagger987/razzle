"use client";

import { LoadingState } from "@razzle/ui";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { usePlayerSheet } from "@/lib/player-sheet-context";

export default function PlayerDeepLinkPage() {
  const params = useParams<{ slug: string }>();
  const { openPlayer } = usePlayerSheet();

  useEffect(() => {
    if (!params.slug) return;
    openPlayer({
      slug: params.slug,
      playerId: params.slug,
      name: params.slug.replace(/-/g, " "),
    });
  }, [params.slug, openPlayer]);

  return (
    <section className="mx-auto max-w-lg px-6 py-16 text-center">
      <LoadingState message="opening player sheet..." />
    </section>
  );
}
