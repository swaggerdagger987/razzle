"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AGENT_BY_ID, agentForBureauSection, loadingCopyForAgent } from "@razzle/agents";
import { BUREAU_ENDPOINTS, BUREAU_FEATURES, HIDDEN_BUREAU_SLUGS, VISIBLE_BUREAU_FEATURES, type BureauFeatureSlug } from "@/lib/bureau-features";
import { getSleeperUser } from "@/lib/sleeper";
import { AgentNudgeBar } from "@/components/shell/AgentNudgeBar";
import { BureauFeatureBody } from "./BureauFeatureBody";

export { BUREAU_FEATURES, VISIBLE_BUREAU_FEATURES, type BureauFeatureSlug };

interface Props {
  leagueId: string;
  feature: BureauFeatureSlug;
}

export function LeagueDashboard({ leagueId, feature }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [data, setData] = useState<unknown>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (HIDDEN_BUREAU_SLUGS.has(feature)) return;

    const config = BUREAU_ENDPOINTS[feature];
    if (!config) {
      setErr(`unknown feature: ${feature}`);
      return;
    }

    const user = getSleeperUser();
    const body: Record<string, unknown> = { league_id: leagueId };
    if (config.needsUser) {
      const rivalryUser =
        feature === "head-to-head" ? searchParams.get("user") : null;
      if (rivalryUser) {
        body.user_id = rivalryUser;
      } else if (user?.user_id) {
        body.user_id = user.user_id;
      } else {
        setErr("connect your sleeper account first");
        return;
      }
    }
    if (feature === "head-to-head") {
      const opponent = searchParams.get("opponent");
      if (opponent) body.opponent_user_id = opponent;
    }

    setData(null);
    setErr(null);
    fetch(config.path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then((j) => {
        if (j.error) setErr(j.error);
        else setData(j);
      })
      .catch((e: Error) => setErr(e.message));
  }, [leagueId, feature, searchParams]);

  const featureOwner = agentForBureauSection(feature) ?? AGENT_BY_ID.razzle;

  return (
    <div className="league-dashboard mx-auto grid max-w-7xl gap-6 px-6 py-8 md:grid-cols-[220px_1fr]">
      <nav className="chunky h-fit bg-bg-card p-4">
        <h2 className="mb-3 text-xs uppercase text-ink-light">Bureau</h2>
        <ul className="flex flex-col gap-1">
          {VISIBLE_BUREAU_FEATURES.map((f) => {
            const href =
              f.slug === "self-scout" ? `/league/${leagueId}` : `/league/${leagueId}/${f.slug}`;
            const active =
              f.slug === "self-scout"
                ? pathname === `/league/${leagueId}` || pathname?.endsWith("/self-scout")
                : pathname?.endsWith(`/${f.slug}`);
            const owner = agentForBureauSection(f.slug) ?? AGENT_BY_ID.razzle;
            return (
              <li key={f.slug}>
                <Link
                  href={href as Route}
                  className={`flex items-center gap-2 rounded px-2 py-1 text-sm ${active ? "bg-orange text-white" : "hover:bg-orange-light"}`}
                  title={`${owner.name} · ${owner.role}`}
                >
                  <img
                    src={`/agents/${owner.avatar}.svg`}
                    alt=""
                    className="lab-sidebar-agent"
                    width={18}
                    height={18}
                  />
                  {f.label}
                  {"default" in f && f.default && <span className="ml-1 text-[10px] text-ink-light">★</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <main>
        <AgentNudgeBar source="bureau" />
        {HIDDEN_BUREAU_SLUGS.has(feature) && (
          <p className="text-ink-medium">this bureau tab isn&apos;t live yet — pick one from the nav.</p>
        )}
        {!HIDDEN_BUREAU_SLUGS.has(feature) && err && <p className="text-red">something fumbled: {err}</p>}
        {!HIDDEN_BUREAU_SLUGS.has(feature) && !err && !data ? (
          <p className="text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
            {loadingCopyForAgent(featureOwner.id)}
          </p>
        ) : null}
        {!HIDDEN_BUREAU_SLUGS.has(feature) && data ? (
          <BureauFeatureBody feature={feature} data={data as Record<string, unknown>} leagueId={leagueId} />
        ) : null}
      </main>
    </div>
  );
}
