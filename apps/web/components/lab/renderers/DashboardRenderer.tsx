interface Props {
  data: unknown;
}

export function DashboardRenderer({ data }: Props) {
  const obj = (data ?? {}) as Record<string, unknown>;
  const sections = ["risers", "fallers", "highlights", "summary", "cards", "items"]
    .map((k) => ({ key: k, value: obj[k] }))
    .filter((s) => s.value != null);

  if (!sections.length) {
    return (
      <pre className="chunky overflow-auto bg-bg-card p-4 text-xs">{JSON.stringify(data, null, 2)}</pre>
    );
  }

  return (
    <div className="dashboard-panel">
      {sections.map(({ key, value }) => (
        <section key={key} className="dashboard-section chunky bg-bg-card p-4">
          <h3 style={{ fontFamily: "var(--font-display)" }}>{key}</h3>
          <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>
        </section>
      ))}
    </div>
  );
}
