import type { Position } from "../index";

export interface PositionPillProps {
  position: Position;
  className?: string;
}

export function PositionPill({ position, className = "" }: PositionPillProps) {
  const key = position.toLowerCase();
  return (
    <span className={["pos-pill", key, className].filter(Boolean).join(" ")}>
      {position}
    </span>
  );
}
