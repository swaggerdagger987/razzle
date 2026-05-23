import type { AgentId } from "@razzle/agents";
import type { PlayerRow } from "@/lib/api";

export interface MarginNote {
  agentId: AgentId;
  text: string;
}

/** L5 staff margin note — one line per row from stats already on the screener. */
export function marginNoteForRow(row: PlayerRow, universe: string): MarginNote | null {
  if (universe === "college") {
    return marginNoteForCollegeRow(row);
  }
  if (universe !== "nfl") return null;

  const age = row.age;
  const pos = row.position;
  const fpts = Number(row.fantasy_points_ppr ?? 0);
  const targets = Number(row.targets ?? row.receiving_targets ?? 0);

  if (age != null && age >= 28 && (pos === "RB" || pos === "WR" || pos === "TE")) {
    return { agentId: "dolphin", text: "peak window closing" };
  }
  if (age != null && age >= 30 && pos === "QB") {
    return { agentId: "dolphin", text: "vet QB — durability matters" };
  }
  if (targets >= 100) {
    return { agentId: "hawkeye", text: "heavy target volume" };
  }
  if (age != null && age <= 22 && fpts >= 180) {
    return { agentId: "hawkeye", text: "youth breakout tape" };
  }
  return null;
}

function marginNoteForCollegeRow(row: PlayerRow): MarginNote | null {
  const yards = Number(row.total_yards ?? 0);
  const rec = Number(row.receptions ?? 0);
  const passYds = Number(row.passing_yards ?? 0);
  const rushYds = Number(row.rushing_yards ?? 0);
  const pos = row.position;

  if (rec >= 80) {
    return { agentId: "hawkeye", text: "target hog on campus" };
  }
  if (pos === "QB" && passYds >= 3000) {
    return { agentId: "hawkeye", text: "volume passer — draft radar" };
  }
  if (pos === "RB" && rushYds >= 1000) {
    return { agentId: "hawkeye", text: "workhorse back" };
  }
  if (yards >= 1400) {
    return { agentId: "hawkeye", text: "elite yardage producer" };
  }
  if (yards >= 900) {
    return { agentId: "hawkeye", text: "draftable production" };
  }
  return null;
}
