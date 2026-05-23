import type { HTMLAttributes, ReactNode } from "react";

export interface ChunkyCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hero?: boolean;
  spotlight?: boolean;
}

export function ChunkyCard({
  children,
  className = "",
  hero = false,
  spotlight = false,
  ...props
}: ChunkyCardProps) {
  const classes = [
    "card",
    hero && "card-hero",
    spotlight && "card-spotlight",
    "card-hover",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
