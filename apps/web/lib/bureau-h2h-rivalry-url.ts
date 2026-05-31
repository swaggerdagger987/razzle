/** Query params for shared Bureau H2H rivalry links — keep user= when opponent changes. */

export function mergeBureauH2HRivalrySearchParams(
  existing: string | URLSearchParams,
  opts: { userId: string; opponentId?: string },
): string {
  const params = new URLSearchParams(
    typeof existing === "string" ? existing : existing.toString(),
  );
  params.set("user", opts.userId);
  if (opts.opponentId) params.set("opponent", opts.opponentId);
  else params.delete("opponent");
  return params.toString();
}
