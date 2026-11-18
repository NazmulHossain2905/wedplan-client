import { ServiceCardSkeleton } from "@/components/services/service-card";
import { ServicesBrowser } from "@/components/services/services-browser";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Browse Wedding Services",
  description:
    "Explore verified wedding photographers, venues, decorators, caterers, makeup artists, and bridal fashion on WedPlan.",
};

function BrowserFallback() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 h-10 w-72 animate-pulse rounded-lg bg-muted" />
      <div className="mb-5 h-11 animate-pulse rounded-lg bg-muted" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ServiceCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<BrowserFallback />}>
      <ServicesBrowser />
    </Suspense>
  );
}
