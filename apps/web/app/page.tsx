import Link from "next/link";

export default function Home() {
  return (
    <section className="marketing-landing mx-auto max-w-3xl px-6 py-16 text-center">
      <div className="mb-6 inline-block text-7xl" style={{ transform: "rotate(-3deg)" }} aria-hidden>
        🐯
      </div>
      <h1 className="mb-4 text-4xl leading-tight" style={{ fontFamily: "var(--font-display)" }}>
        The fantasy football <span className="text-orange">research lab</span> your leaguemates don&apos;t
        know about yet.
      </h1>
      <p className="mb-6 text-lg text-ink-medium">
        10 launch Lab panels. 7 Bureau behavioral tabs. Custom formulas on the screener. A six-sprite film
        room that already knows your league. The Screener is forever free.
      </p>
      <div className="mb-8 grid gap-3 text-left sm:grid-cols-3">
        <div className="chunky bg-bg-card p-4 text-sm">
          <strong className="text-orange">Explore</strong> — NFL + college screener, formulas, saved views
        </div>
        <div className="chunky bg-bg-card p-4 text-sm">
          <strong className="text-orange">Bureau</strong> — Self-Scout, H2H, pressure map, trade finder
        </div>
        <div className="chunky bg-bg-card p-4 text-sm">
          <strong className="text-orange">Film room</strong> — six pixel staff on a war table
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/explore"
          className="chunky chunky-hover bg-orange px-8 py-4 text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Open Explore
        </Link>
        <Link
          href="/lab"
          className="chunky chunky-hover bg-bg-card px-8 py-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Browse The Lab
        </Link>
        <Link
          href="/pricing"
          className="chunky chunky-hover bg-bg-card px-8 py-4 text-sm"
          style={{ fontFamily: "var(--font-display)" }}
        >
          See pricing
        </Link>
      </div>
      <p className="mt-10 text-2xl text-ink-light" style={{ fontFamily: "var(--font-hand)" }}>
        let&apos;s razzle dazzle em baby
      </p>
    </section>
  );
}
