"use client";

import {
  ServiceCard,
  ServiceCardSkeleton,
} from "@/components/services/service-card";
import { StaggerGrid, StaggerItem } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { usePublicServices } from "@/hooks/queries";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function FeaturedServices() {
  // Only approved + active services; featured ones are ranked first.
  const { data, isLoading } = usePublicServices({ limit: 6 });
  const featured = data?.services ?? [];

  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      aria-labelledby="featured-heading"
    >
      <SectionHeading
        eyebrow="Handpicked for you"
        title="Featured Wedding Services"
        description="Curated from our most loved vendors — photographers, venues, decorators, and artists ready to make your day unforgettable."
        action={
          <Button
            asChild
            variant="outline"
            className="border-burgundy/30 text-burgundy hover:bg-rose-tint hover:text-burgundy"
          >
            <Link href="/services">
              View All Services <ArrowRight aria-hidden className="size-4" />
            </Link>
          </Button>
        }
      />
      <StaggerGrid className="grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))
          : featured.map((service) => (
              <StaggerItem key={service.id} className="h-full">
                <ServiceCard service={service} vendor={service.vendor} />
              </StaggerItem>
            ))}
      </StaggerGrid>
    </section>
  );
}
