import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Razzle",
  description:
    "The Screener is forever free. Pro unlocks 10 launch Lab panels. Elite adds six pixel staff in the Situation Room.",
};

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    interval: "forever",
    badge: "Screener",
    accent: "border-green shadow-[4px_4px_0_var(--green)]",
    features: [
      "Explore screener — NFL + college",
      "Custom formulas + saved views",
      "Player Sheet + margin notes",
      "3 free Lab panels (weekly, prospects, dashboard)",
    ],
    cta: { href: "/explore", label: "Open Explore" },
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9.99",
    interval: "/month",
    badge: "Lab + Bureau",
    accent: "",
    features: [
      "All 10 launch Lab panels",
      "7 Bureau behavioral tabs",
      "Trade values, breakouts, aging curves",
      "Monte Carlo + pressure map",
    ],
    cta: { href: "mailto:hello@razzle.lol?subject=Pro%20waitlist", label: "Join Pro waitlist" },
  },
  {
    id: "elite",
    name: "Elite",
    price: "$19.99",
    interval: "/month",
    badge: "Film room",
    accent: "border-purple shadow-[4px_4px_0_var(--purple)]",
    features: [
      "Everything in Pro",
      "Situation Room — six pixel staff",
      "Scenario re-sim + cross-agent triggers",
      "Elite proactive nudges on Lab + Bureau",
    ],
    cta: { href: "mailto:hello@razzle.lol?subject=Elite%20waitlist", label: "Join Elite waitlist" },
  },
] as const;

export default function PricingPage() {
  return (
    <section className="pricing-page mx-auto max-w-5xl px-6 py-12">
      <header className="pricing-hero mb-10 text-center">
        <h1 className="text-4xl" style={{ fontFamily: "var(--font-display)" }}>
          The Screener is <span className="text-orange">forever free</span>
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-ink-medium">
          10 launch Lab panels + 7 Bureau behavioral tabs + a six-sprite film room. Pay for depth, not
          access to the screener.
        </p>
      </header>

      <div className="plans-grid grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <article
            key={plan.id}
            className={`plan-card chunky relative bg-bg-card p-6 ${plan.accent}`}
          >
            <span
              className="plan-badge absolute -top-3 right-4 rotate-3 border-2 border-ink bg-orange px-3 py-0.5 text-xs text-white"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {plan.badge}
            </span>
            <h2 className="plan-name text-2xl" style={{ fontFamily: "var(--font-display)" }}>
              {plan.name}
            </h2>
            <p className="plan-price mt-2 text-3xl" style={{ fontFamily: "var(--font-display)" }}>
              {plan.price}
              <span className="text-base text-ink-light">{plan.interval}</span>
            </p>
            <ul className="plan-features mt-4 space-y-2 text-sm text-ink-medium">
              {plan.features.map((f) => (
                <li key={f} className="border-b border-dashed border-ink/20 pb-2">
                  {f}
                </li>
              ))}
            </ul>
            {plan.cta.href.startsWith("mailto:") ? (
              <a href={plan.cta.href} className="chunky chunky-hover mt-6 block bg-orange px-4 py-3 text-center text-white">
                {plan.cta.label}
              </a>
            ) : (
              <Link
                href={plan.cta.href}
                className="chunky chunky-hover mt-6 block bg-orange px-4 py-3 text-center text-white"
              >
                {plan.cta.label}
              </Link>
            )}
          </article>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-ink-light" style={{ fontFamily: "var(--font-hand)" }}>
        annual plans coming soon — checkout stub until Stripe ships
      </p>
    </section>
  );
}
