"use client";

import { VendorCard } from "@/components/services/vendor-card";
import { StaggerGrid, StaggerItem } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { User } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useVendors() {
  return useQuery({
    queryKey: ["vendors"],
    queryFn: () => api.vendors(),
    staleTime: 60 * 1000,
  });
}

export function FeaturedVendors() {
  const { data, isLoading } = useVendors();
  const vendors = (data?.vendors ?? []).slice(0, 6);

  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      aria-labelledby="vendors-heading"
    >
      <SectionHeading
        eyebrow="Meet the makers of magic"
        title="Featured Vendors"
        description="Talented, reviewed, and ready to bring your vision to life — meet the teams couples rave about."
      />
      <StaggerGrid className="grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))
          : vendors.map((vendor: User & { activeServiceCount: number }) => (
              <StaggerItem key={vendor.id} className="h-full">
                <VendorCard
                  vendor={vendor}
                  serviceCount={vendor.activeServiceCount}
                />
              </StaggerItem>
            ))}
      </StaggerGrid>
    </section>
  );
}
