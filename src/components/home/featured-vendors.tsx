"use client";

import { VendorCard } from "@/components/services/vendor-card";
import { StaggerGrid, StaggerItem } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { User } from "@/types";
import { useEffect, useState } from "react";

type VendorWithServiceCount = User & { activeServiceCount: number };

export function FeaturedVendors() {
  const [vendors, setVendors] = useState<VendorWithServiceCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadVendors() {
      try {
        const data = await api.vendors();
        if (!cancelled) setVendors(data.vendors.slice(0, 6));
      } catch {
        if (!cancelled) setVendors([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadVendors();

    return () => {
      cancelled = true;
    };
  }, []);

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
          : vendors.map((vendor) => (
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
