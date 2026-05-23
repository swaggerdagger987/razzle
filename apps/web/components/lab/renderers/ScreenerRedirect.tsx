"use client";

import type { PanelDefinition } from "@razzle/panels";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface Props {
  panel: PanelDefinition;
}

export function ScreenerRedirect({ panel }: Props) {
  const router = useRouter();

  useEffect(() => {
    router.replace("/explore");
  }, [router]);

  return (
    <div className="chunky bg-bg-card p-8 text-center">
      <p className="text-ink-medium mb-4">
        {panel.title} lives on Explore — the standalone screener home.
      </p>
      <Link href="/explore" className="chunky chunky-hover bg-orange px-6 py-3 text-white">
        Open Explore →
      </Link>
    </div>
  );
}
