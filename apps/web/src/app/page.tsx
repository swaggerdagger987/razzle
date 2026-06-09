import Link from "next/link";

const positions = [
  { label: "QB", token: "var(--pos-qb)" },
  { label: "RB", token: "var(--pos-rb)" },
  { label: "WR", token: "var(--pos-wr)" },
  { label: "TE", token: "var(--pos-te)" },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <div>
        <h1 className="font-display text-5xl leading-tight">Razzle</h1>
        <p className="mt-2 text-lg text-ink-medium">
          The fantasy football research lab. Forever free.
        </p>
        <p className="font-hand mt-1 text-2xl text-ink-light">
          testing weekly what&apos;s stronger — our bad luck or the numbers
        </p>
      </div>

      <div className="card-chunky p-6">
        <p className="font-display text-base uppercase">The film room is under construction</p>
        <p className="mt-3 text-sm leading-6 text-ink-medium">
          Explore, Lab, Bureau, Situation Room. One operation, four doors. The scoring engine is
          already on —{" "}
          <Link href="/scoring" className="font-bold text-orange underline">
            try the scoring preview
          </Link>
          .
        </p>
        <div className="mt-5 flex gap-2">
          {positions.map((position) => (
            <span
              key={position.label}
              className="rounded-lg border-2 border-ink px-3 py-1 text-xs font-bold"
              style={{ background: position.token, color: "var(--text-on-accent)" }}
            >
              {position.label}
            </span>
          ))}
        </div>
        <p className="font-hand mt-5 text-xl text-ink-light">pulling film...</p>
      </div>
    </main>
  );
}
