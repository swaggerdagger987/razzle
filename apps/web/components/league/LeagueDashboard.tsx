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

const NEEDS_SLEEPER_MESSAGE = "connect your sleeper account first";

interface Props {
  leagueId: string;
  feature: BureauFeatureSlug;
}

function SleeperRequiredState({ title }: { title: string }) {
  return (
    <div className="chunky bg-bg-card p-6">
      <p className="text-sm uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
        Bureau context missing
      </p>
      <h1 className="mt-2 text-3xl" style={{ fontFamily: "var(--font-display)" }}>
        Connect Sleeper to unlock {title}.
      </h1>
      <p className="mt-3 max-w-2xl text-ink-medium">
        {title} needs your Sleeper user so Razzle can find your roster in this league. No user, no tape.
      </p>
      <Link href="/league" className="btn-chunky mt-5 inline-flex bg-orange text-white">
        connect sleeper →
      </Link>
    </div>
  );
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
      setData(null);
      setErr(`unknown feature: ${feature}`);
      return;
    }

    setData(null);
    setErr(null);

    const user = getSleeperUser();
    const body: Record<string, unknown> = { league_id: leagueId };
    if (config.needsUser) {
      if (!user?.user_id) {
        setErr(NEEDS_SLEEPER_MESSAGE);
        return;
      }
      body.user_id = user.user_id;
    }
    if (feature === "head-to-head") {
      const opponent = searchParams.get("opponent");
      if (opponent) body.opponent_user_id = opponent;
    }

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
  const needsSleeper = err === NEEDS_SLEEPER_MESSAGE;
  const featureTitle = BUREAU_ENDPOINTS[feature]?.title ?? "this Bureau tab";

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
        {!HIDDEN_BUREAU_SLUGS.has(feature) && needsSleeper && <SleeperRequiredState title={featureTitle} />}
        {!HIDDEN_BUREAU_SLUGS.has(feature) && err && !needsSleeper && (
          <p className="text-red">something fumbled: {err}</p>
        )}
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
