// Razzle V2 product analytics.
//
// Per DECISIONS.md: PostHog handles funnels, retention, session replay,
// and feature flags. Sentry handles errors. We never roll our own
// analytics_events table again.

"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

let initialized = false;

function init() {
  if (initialized || typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    capture_pageview: false,
    person_profiles: "identified_only",
    autocapture: true,
  });
  initialized = true;
}

export function track(event: string, props?: Record<string, unknown>) {
  init();
  if (initialized) posthog.capture(event, props);
}

export function identify(distinctId: string, traits?: Record<string, unknown>) {
  init();
  if (initialized) posthog.identify(distinctId, traits);
}

export function usePageview(pathname: string) {
  useEffect(() => {
    init();
    if (initialized) posthog.capture("$pageview", { path: pathname });
  }, [pathname]);
}

// Funnel-stage events (the ones we actually fire and chart):
export const FUNNEL = {
  landed: "razzle.landed",
  openedLab: "razzle.lab.opened",
  openedPanel: "razzle.lab.panel.opened",
  bureauConnect: "razzle.bureau.connect.submitted",
  bureauSelfScout: "razzle.bureau.self_scout.viewed",
  roomAsk: "razzle.room.ask",
  startedCheckout: "razzle.billing.checkout.started",
  subscribed: "razzle.billing.subscribed",
} as const;
