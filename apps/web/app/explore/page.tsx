import { Suspense } from "react";
import { ExplorePageClient } from "@/components/explore/ExplorePageClient";
import { LoadingState } from "@razzle/ui";

export const metadata = {
  title: "Explore — Razzle Screener",
  description: "Filter any stat. Build any view. The dynasty screener — forever free.",
};

export default function ExplorePage() {
  return (
    <Suspense fallback={<LoadingState className="p-8" />}>
      <ExplorePageClient />
    </Suspense>
  );
}
