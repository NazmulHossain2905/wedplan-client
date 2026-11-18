 
"use client";

import * as React from "react";
import { MapPin, Star } from "lucide-react";
import type { Service, User } from "@/types";
import { cn } from "@/lib/utils";
import { formatBDT } from "@/lib/demo-helpers";
import { useViewService } from "@/lib/use-view-service";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PremiumBadge } from "@/components/shared/badges";
import { SafeImage } from "@/components/shared/safe-image";
import { initials } from "@/lib/demo-helpers";

interface ServiceCardProps {
  service: Service;
  vendor?: User;
  className?: string;
}

export function ServiceCard({ service, vendor, className }: ServiceCardProps) {
  const viewService = useViewService();

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => viewService(service.id)}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-muted text-left"
        aria-label={`View details of ${service.serviceName}`}
      >
        <SafeImage
          src={service.images[0]}
          alt={service.serviceName}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-burgundy shadow-sm backdrop-blur-sm">
          {service.category}
        </span>
        {service.rating > 0 ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm">
            <Star aria-hidden className="size-3.5 fill-amber-500 text-amber-500" />
            {service.rating.toFixed(1)}
          </span>
        ) : null}
      </button>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <button
          type="button"
          onClick={() => viewService(service.id)}
          className="text-left font-serif text-lg font-semibold leading-snug text-foreground transition-colors hover:text-burgundy"
        >
          {service.serviceName}
        </button>

        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin aria-hidden className="size-4 shrink-0 text-rose" />
          <span className="truncate">{service.location}</span>
        </p>

        {vendor ? (
          <div className="flex items-center gap-2.5">
            <Avatar className="size-8 border border-border">
              <AvatarImage src={vendor.image} alt={vendor.name} />
              <AvatarFallback className="bg-rose-tint text-xs text-burgundy">
                {initials(vendor.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate text-sm font-medium text-foreground">
                {vendor.businessName ?? vendor.name}
              </span>
              {vendor.subscriptionPlan === "premium" ? <PremiumBadge compact /> : null}
            </div>
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between pt-2">
          <div>
            <p className="text-xs text-muted-foreground">Starting from</p>
            <p className="font-serif text-xl font-semibold text-burgundy">
              {formatBDT(service.price)}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-burgundy/30 text-burgundy hover:bg-rose-tint hover:text-burgundy"
            onClick={() => viewService(service.id)}
          >
            View Details
          </Button>
        </div>
      </div>
    </article>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  );
}
