"use client";

import type { Urgency } from "@razzle/types";
import { encodeRoomBriefingOgSnapshot } from "@/lib/room-briefing-og-snapshot";

interface Props {
  question: string;
  briefing: string;
  urgency: Urgency;
  specialists: string[];
}

/** Exportable briefing card — mirrors BureauH2HShareBar for Situation Room GTM. */
export function BriefingShareBar({ question, briefing, urgency, specialists }: Props) {
  const ogParams = new URLSearchParams({ download: "1" });
  const snap = encodeRoomBriefingOgSnapshot({ question, briefing, urgency, specialists });
  if (snap) ogParams.set("snapshot", snap);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <a
        href={`/og/briefing?${ogParams.toString()}`}
        download="razzle-briefing.png"
        className="btn-chunky active text-xs"
        style={{ background: "var(--orange)", color: "var(--text-on-accent)" }}
      >
        export card
      </a>
    </div>
  );
}
