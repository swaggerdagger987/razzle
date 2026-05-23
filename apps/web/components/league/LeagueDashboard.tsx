"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getSleeperUser } from "@/lib/sleeper";

export const BUREAU_FEATURES = [
  { slug: "self-scout", label: "Self-Scout", default: true },
  { slug: "roster-depth", label: "Roster Depth" },
  { slug: "build-profiles", label: "Build Profiles" },
  { slug: "power-rankings", label: "Power Rankings" },
  { slug: "trade-network", label: "Trade Network" },
  { slug: "waiver-tendencies", label: "Waiver Tendencies" },
  { slug: "head-to-head", label: "Head-to-Head" },
  { slug: "strength-of-schedule", label: "Schedule" },
  { slug: "monte-carlo", label: "Monte Carlo" },
] as const;

export type BureauFeatureSlug = (typeof BUREAU_FEATURES)[number]["slug"];

const ENDPOINT_BY_SLUG: Record<string, { path: string; needsUser: boolean; title: string }> = {
  "self-scout": { path: "/api/bureau/self-scout", needsUser: true, title: "Self-Scout" },
  "roster-depth": { path: "/api/bureau/roster-depth", needsUser: true, title: "Roster Depth" },
  "build-profiles": { path: "/api/bureau/build-profiles", needsUser: false, title: "Build Profiles" },
  "power-rankings": { path: "/api/bureau/power-rankings", needsUser: false, title: "Power Rankings" },
  "trade-network": { path: "/api/bureau/trade-network", needsUser: false, title: "Trade Network" },
  "waiver-tendencies": { path: "/api/bureau/waiver-tendencies", needsUser: false, title: "Waiver Tendencies" },
  "strength-of-schedule": { path: "/api/bureau/strength-of-schedule", needsUser: true, title: "Strength of Schedule" },
  "monte-carlo": { path: "/api/bureau/monte-carlo", needsUser: false, title: "Monte Carlo" },
};

interface Props {
  leagueId: string;
  feature: BureauFeatureSlug;
}

export function LeagueDashboard({ leagueId, feature }: Props) {
  const pathname = usePathname();
  const [data, setData] = useState<unknown>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (feature === "head-to-head") return;

    const config = ENDPOINT_BY_SLUG[feature];
    if (!config) {
      setErr(`unknown feature: ${feature}`);
      return;
    }

    const user = getSleeperUser();
    const body: Record<string, unknown> = { league_id: leagueId };
    if (config.needsUser) {
      if (!user?.user_id) {
        setErr("connect your sleeper account first");
        return;
      }
      body.user_id = user.user_id;
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
  }, [leagueId, feature]);

  return (
    <div className="league-dashboard mx-auto grid max-w-7xl gap-6 px-6 py-8 md:grid-cols-[220px_1fr]">
      <nav className="chunky h-fit bg-bg-card p-4">
        <h2 className="mb-3 text-xs uppercase text-ink-light">Bureau</h2>
        <ul className="flex flex-col gap-1">
          {BUREAU_FEATURES.map((f) => {
            const href =
              f.slug === "self-scout" ? `/league/${leagueId}` : `/league/${leagueId}/${f.slug}`;
            const active =
              f.slug === "self-scout"
                ? pathname === `/league/${leagueId}` || pathname?.endsWith("/self-scout")
                : pathname?.endsWith(`/${f.slug}`);
            return (
              <li key={f.slug}>
                <Link
                  href={href as Route}
                  className={`block rounded px-2 py-1 text-sm ${active ? "bg-orange text-white" : "hover:bg-orange-light"}`}
                >
                  {f.label}
                  {"default" in f && f.default && <span className="ml-1 text-[10px] text-ink-light">★</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <main>
        {feature === "head-to-head" && <HeadToHeadPlaceholder />}
        {feature !== "head-to-head" && err && <p className="text-red">something fumbled: {err}</p>}
        {feature !== "head-to-head" && !err && !data ? (
          <p className="text-ink-medium">pulling film...</p>
        ) : null}
        {feature !== "head-to-head" && data ? (
          <FeatureBody feature={feature} data={data as Record<string, unknown>} />
        ) : null}
      </main>
    </div>
  );
}

function HeadToHeadPlaceholder() {
  return (
    <div className="chunky bg-bg-card p-8 text-center">
      <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
        Head-to-Head
      </h1>
      <p className="mt-2 text-ink-medium">Pick an opponent from your league to compare. (Opponent picker — Phase 5.5.)</p>
    </div>
  );
}

function FeatureBody({ feature, data }: { feature: BureauFeatureSlug; data: Record<string, unknown> }) {
  if (feature === "self-scout") return <SelfScoutView data={data} />;
  if (Array.isArray(data.rows)) return <RowsTable rows={data.rows as Array<Record<string, unknown>>} title={ENDPOINT_BY_SLUG[feature]?.title} />;
  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          {ENDPOINT_BY_SLUG[feature]?.title ?? feature}
        </h1>
      </header>
      <pre className="chunky overflow-auto bg-bg-card p-4 text-xs">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

function SelfScoutView({ data }: { data: Record<string, unknown> }) {
  const team = data.team as Record<string, unknown> | undefined;
  const league = data.league as Record<string, unknown> | undefined;
  const build = data.build_profile as Record<string, unknown> | undefined;
  const rank = data.power_rank as Record<string, unknown> | undefined;
  const flags = (data.vulnerability_flags as Array<Record<string, unknown>>) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <header className="chunky bg-bg-card p-6">
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          {String(team?.name ?? "Your Team")}
        </h1>
        <p className="text-ink-medium">
          {String(league?.name ?? "")} · {String(team?.record ?? "")} · {String(team?.points_for ?? 0)} PF /{" "}
          {String(team?.points_against ?? 0)} PA
        </p>
        {rank && (
          <p className="mt-3 text-2xl text-orange" style={{ fontFamily: "var(--font-hand)" }}>
            #{String(rank.rank)} of {String(rank.total)}
          </p>
        )}
      </header>

      {build && (
        <section className="chunky bg-bg-card p-6">
          <h2 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
            Build Profile
          </h2>
          <p className="mt-1 text-2xl text-orange" style={{ fontFamily: "var(--font-display)" }}>
            {String(build.archetype)}
          </p>
          <p className="text-ink-medium">{String(build.reasoning)}</p>
        </section>
      )}

      {data.how_opponents_see_you != null && (
        <section className="chunky bg-bg-card p-6">
          <h2 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
            How opponents see you
          </h2>
          <p className="mt-2 text-lg leading-relaxed">{String(data.how_opponents_see_you)}</p>
        </section>
      )}

      {flags.length > 0 && (
        <section className="chunky bg-bg-card p-6">
          <h2 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
            Vulnerability Flags
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {flags.map((f, i) => (
              <li key={i} className={`chunky px-3 py-2 ${f.severity === "warning" ? "bg-yellow-light" : "bg-bg"}`}>
                <span className="font-bold">[{String(f.position).toUpperCase()}]</span> {String(f.message)}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function RowsTable({ rows, title }: { rows: Array<Record<string, unknown>>; title?: string }) {
  if (!rows.length) return <p className="text-ink-medium">no data yet — check back after the first week.</p>;
  const cols = Object.keys(rows[0] ?? {});
  return (
    <div className="flex flex-col gap-4">
      {title && (
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </h1>
      )}
      <div className="table-wrap chunky bg-bg-card">
        <table className="screener-table">
          <thead className="thead-shadow">
            <tr>
              {cols.map((c) => (
                <th key={c}>{c.replace(/_/g, " ")}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="screener-row">
                {cols.map((c) => (
                  <td key={c}>{String(row[c] ?? "")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
