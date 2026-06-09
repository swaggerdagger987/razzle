"use client";

import { useEffect, useMemo, useState } from "react";
import { previewScore, previewVorp, type Position, type ValuedPlayer } from "./api";

const positions: Position[] = ["QB", "RB", "WR", "TE", "K", "DST"];

const positionToken: Record<string, string> = {
  QB: "var(--pos-qb)",
  RB: "var(--pos-rb)",
  WR: "var(--pos-wr)",
  TE: "var(--pos-te)",
};

type Inputs = {
  position: Position;
  rec: number;
  tePremium: number;
  passYd: number;
  passTd: number;
  rushYd: number;
  rushTd: number;
  receptions: number;
  recYd: number;
  recTd: number;
};

const initialInputs: Inputs = {
  position: "TE",
  rec: 1,
  tePremium: 0.5,
  passYd: 0,
  passTd: 0,
  rushYd: 12,
  rushTd: 0,
  receptions: 7,
  recYd: 82,
  recTd: 1,
};

type SamplePlayer = {
  player_id: string;
  name: string;
  position: Position;
  stats: Record<string, number>;
};

const samplePlayers: SamplePlayer[] = [
  { player_id: "chase", name: "Ja'Marr Chase", position: "WR", stats: { rec: 8, rec_yd: 96, rec_td: 1 } },
  { player_id: "bijan", name: "Bijan Robinson", position: "RB", stats: { rush_yd: 86, rush_td: 1, rec: 4, rec_yd: 28 } },
  { player_id: "laporta", name: "Sam LaPorta", position: "TE", stats: { rec: 7, rec_yd: 82, rec_td: 1 } },
  { player_id: "replacement-te", name: "Replacement TE", position: "TE", stats: { rec: 3, rec_yd: 31 } },
  { player_id: "replacement-rb", name: "Replacement RB", position: "RB", stats: { rush_yd: 42, rec: 2, rec_yd: 9 } },
  { player_id: "replacement-wr", name: "Replacement WR", position: "WR", stats: { rec: 4, rec_yd: 45 } },
];

export function ScoringPreviewPanel() {
  const [inputs, setInputs] = useState(initialInputs);
  const [points, setPoints] = useState<number | null>(null);
  const [valuedPlayers, setValuedPlayers] = useState<ValuedPlayer[]>([]);
  const [status, setStatus] = useState("ready");

  const request = useMemo(
    () => ({
      position: inputs.position,
      stats: {
        pass_yd: inputs.passYd,
        pass_td: inputs.passTd,
        rush_yd: inputs.rushYd,
        rush_td: inputs.rushTd,
        rec: inputs.receptions,
        rec_yd: inputs.recYd,
        rec_td: inputs.recTd,
      },
      rules: {
        receiving: { rec: inputs.rec, te_premium: inputs.tePremium },
      },
    }),
    [inputs],
  );

  useEffect(() => {
    let active = true;
    setStatus("running the numbers...");
    previewScore(request)
      .then((result) => {
        if (active) {
          setPoints(result.points);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (active) setStatus("film room offline");
      });
    return () => {
      active = false;
    };
  }, [request]);

  useEffect(() => {
    let active = true;
    previewVorp({
      config: {
        league_size: 2,
        scoring: request.rules,
        roster: { qb: 1, rb: 1, wr: 1, te: 1, flex: 0, k: 0, dst: 0 },
      },
      players: samplePlayers,
    })
      .then((result) => {
        if (active) setValuedPlayers(result.players);
      })
      .catch(() => {
        if (active) setValuedPlayers([]);
      });
    return () => {
      active = false;
    };
  }, [request.rules]);

  function updateNumber(key: keyof Inputs, value: string) {
    setInputs((current) => ({ ...current, [key]: Number(value) }));
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[340px_1fr]">
      <aside>
        <p className="font-display text-sm uppercase text-orange">Scoring Config</p>
        <h1 className="font-display mt-2 text-4xl leading-tight">Your league, your math.</h1>
        <p className="mt-4 text-sm leading-6 text-ink-medium">
          Change the league assumptions and the total recomputes through the scoring engine. This
          is the spine everything else hangs on.
        </p>
        <div className="card-chunky mt-8 p-5">
          <p className="font-display text-sm uppercase">Preview Points</p>
          <div className="mt-2 text-6xl font-bold">{points ?? "--"}</div>
          <p className="font-hand mt-2 text-xl text-ink-light">{status}</p>
        </div>
      </aside>

      <div className="grid content-start gap-6">
        <div className="flex flex-wrap gap-2">
          {positions.map((position) => (
            <button
              className="btn-chunky"
              data-active={position === inputs.position}
              key={position}
              onClick={() => setInputs((current) => ({ ...current, position }))}
            >
              {position}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <NumberInput label="PPR" value={inputs.rec} onChange={(v) => updateNumber("rec", v)} />
          <NumberInput label="TE Premium" value={inputs.tePremium} onChange={(v) => updateNumber("tePremium", v)} />
          <NumberInput label="Pass Yards" value={inputs.passYd} onChange={(v) => updateNumber("passYd", v)} />
          <NumberInput label="Pass TD" value={inputs.passTd} onChange={(v) => updateNumber("passTd", v)} />
          <NumberInput label="Rush Yards" value={inputs.rushYd} onChange={(v) => updateNumber("rushYd", v)} />
          <NumberInput label="Rush TD" value={inputs.rushTd} onChange={(v) => updateNumber("rushTd", v)} />
          <NumberInput label="Receptions" value={inputs.receptions} onChange={(v) => updateNumber("receptions", v)} />
          <NumberInput label="Rec Yards" value={inputs.recYd} onChange={(v) => updateNumber("recYd", v)} />
          <NumberInput label="Rec TD" value={inputs.recTd} onChange={(v) => updateNumber("recTd", v)} />
        </div>

        <section className="card-chunky overflow-hidden p-0">
          <div className="grid grid-cols-[1fr_80px_100px_100px] border-b-3 border-ink bg-bg-warm px-4 py-3 font-display text-sm uppercase">
            <span>Player</span>
            <span>Pos</span>
            <span>Points</span>
            <span>VORP</span>
          </div>
          {valuedPlayers.map((player) => (
            <div
              className="grid grid-cols-[1fr_80px_100px_100px] items-center px-4 py-3 text-sm font-bold [&:not(:last-child)]:border-b-2 [&:not(:last-child)]:border-dashed [&:not(:last-child)]:border-ink-faint"
              key={player.player_id}
            >
              <span>{player.name}</span>
              <span
                className="w-fit rounded-lg px-2 py-0.5 text-xs"
                style={{ background: positionToken[player.position], color: "var(--text-on-accent)" }}
              >
                {player.position}
                {player.position_rank}
              </span>
              <span>{player.projected_points.toFixed(1)}</span>
              <span>{player.vorp.toFixed(1)}</span>
            </div>
          ))}
          {valuedPlayers.length === 0 && (
            <p className="font-hand px-4 py-6 text-xl text-ink-light">pulling film...</p>
          )}
        </section>
      </div>
    </section>
  );
}

function NumberInput(props: { label: string; value: number; onChange: (value: string) => void }) {
  return (
    <label className="card-chunky grid gap-2 p-4">
      <span className="font-display text-sm uppercase">{props.label}</span>
      <input
        className="h-11 w-full rounded-lg border-2 border-ink bg-bg px-3 text-lg font-bold outline-none"
        step="0.1"
        type="number"
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
      />
    </label>
  );
}
