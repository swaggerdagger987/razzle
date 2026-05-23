export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "pulling film...",
  className = "",
}: LoadingStateProps) {
  return (
    <div
      className={["loading-msg", className].filter(Boolean).join(" ")}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
