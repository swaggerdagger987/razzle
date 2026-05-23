"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { FUNNEL, track, usePageview } from "@/lib/analytics";

function AnalyticsEffects() {
  const pathname = usePathname() ?? "/";
  usePageview(pathname);

  useEffect(() => {
    if (pathname === "/") track(FUNNEL.landed);
    else if (pathname === "/explore") track(FUNNEL.openedLab);
    else if (pathname.startsWith("/lab/")) track(FUNNEL.openedPanel, { panel: pathname.split("/")[2] });
    else if (pathname.startsWith("/league/") && !pathname.endsWith("/league")) track(FUNNEL.bureauSelfScout);
  }, [pathname]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <Suspense fallback={null}>
          <AnalyticsEffects />
        </Suspense>
        {children}
      </NuqsAdapter>
    </QueryClientProvider>
  );
}
