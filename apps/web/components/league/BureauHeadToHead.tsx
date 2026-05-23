"use client";

import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";

interface Props {
  data: Record<string, unknown>;
  leagueId: string;
}

type Manager = { user_id: string; team: string };

type TeamSummary = {
  user_id?: string;
  team: string;
  record: string;
  ppg: number;
};

type PosCompare = {
  position: string;
  your_count: number;
  their_count: number;
};

export function BureauHeadToHead({ data, leagueId }: Props) {
  const atlas = AGENT_BY_ID.atlas;
  const router = useRouter();
  const searchParams = useSearchParams();
  const managers = (data.managers as Manager[]) ?? [];
  const opponentId = String(data.opponent_user_id ?? searchParams.get("opponent") ?? "");
  const you = data.you as TeamSummary;
  const them = data.them as TeamSummary;
  const positionCompare = (data.position_compare as PosCompare[]) ?? [];
  const tradeFit = (data.trade_fit as { you_could_offer: string[]; you_could_target: string[] }) ?? {
    you_could_offer: [],
    you_could_target: [],
  };

  function pickOpponent(nextId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextId) params.set("opponent", nextId);
    else params.delete("opponent");
    router.push(`/league/${leagueId}/head-to-head?${params.toString()}` as Route);
  }

  const offer = tradeFit.you_could_offer.join(", ") || "—";
  const want = tradeFit.you_could_target.join(", ") || "—";

  return (
    <div className="flex flex-col gap-6">
      <header className="chunky bg-bg-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <img src={`/agents/${atlas.avatar}.svg`} alt="" className="h-10 w-10" />
          <div>
            <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              {atlas.name} · {atlas.role}
            </p>
            <p className="text-sm text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
              rivalry dossier — your roster vs one leaguemate
            </p>
          </div>
        </div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Head-to-Head
        </h1>
      </header>

      <section className="chunky bg-bg-card flex flex-wrap items-center gap-3 p-4">
        <label className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
          opponent
        </label>
        <select
          value={opponentId}
          onChange={(e) => pickOpponent(e.target.value)}
          className="chunky bg-bg-warm px-3 py-2 text-sm"
          aria-label="Head-to-head opponent"
        >
          {managers.map((m) => (
            <option key={m.user_id} value={m.user_id}>
              {m.team}
            </option>
          ))}
        </select>
      </section>

      {you && them && (
        <>
          <section className="grid gap-4 md:grid-cols-2">
            <div className="chunky bg-bg-card p-4">
              <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                you
              </p>
              <p className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
                {you.team}
              </p>
              <p className="text-ink-medium text-sm" style={{ fontFamily: "var(--font-mono)" }}>
                {you.record} · {you.ppg} ppg
              </p>
            </div>
            <div className="chunky bg-bg-card p-4">
              <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
                them
              </p>
              <p className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
                {them.team}
              </p>
              <p className="text-ink-medium text-sm" style={{ fontFamily: "var(--font-mono)" }}>
                {them.record} · {them.ppg} ppg
              </p>
            </div>
          </section>

          <section className="chunky bg-bg-card p-4">
            <p className="mb-3 text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              position depth
            </p>
            <div className="flex flex-col gap-2">
              {positionCompare.map((row) => {
                const edge = row.your_count - row.their_count;
                const edgeLabel =
                  edge > 0 ? `+${edge} you` : edge < 0 ? `+${Math.abs(edge)} them` : "even";
                return (
                  <div key={row.position} className="flex items-center gap-3 text-sm">
                    <span className="w-8 font-bold" style={{ fontFamily: "var(--font-mono)" }}>
                      {row.position}
                    </span>
                    <div className="bg-bg-warm flex h-3 flex-1 overflow-hidden rounded">
                      <div
                        className="h-full bg-orange"
                        style={{
                          width: `${(row.your_count / Math.max(1, row.your_count + row.their_count)) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-ink-light w-16 text-right text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                      {row.your_count}–{row.their_count} · {edgeLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="chunky bg-bg-card p-4">
            <p className="text-xs uppercase text-ink-light" style={{ fontFamily: "var(--font-mono)" }}>
              trade lanes
            </p>
            <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
              You could offer depth at {offer}. Target their surplus at {want}.
            </p>
            <Link
              href={
                toRoom({
                  agentId: "atlas",
                  question: `How do I beat ${them.team} (${them.record})? I'm deeper at ${offer} and thin at ${want}.`,
                  panelSlug: "head-to-head",
                }) as Route
              }
              className="mt-3 inline-block text-sm text-orange underline"
            >
              ask Atlas about this rivalry →
            </Link>
            <Link
              href={`/league/${leagueId}/trade-finder` as Route}
              className="ml-4 inline-block text-sm text-ink-medium underline"
            >
              open Trade Finder →
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
