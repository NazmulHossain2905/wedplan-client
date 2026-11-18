"use client";

import { PremiumBadge } from "@/components/shared/badges";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import type { User } from "@/types";
import { ArrowRight, MapPin, Star } from "lucide-react";
import Link from "next/link";

const covers = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=70",
  "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=800&q=70",
  "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=70",
  "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=70",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=70",
  "https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?auto=format&fit=crop&w=800&q=70",
];

interface VendorCardProps {
  vendor: User;
  serviceCount: number;
  className?: string;
}

export function VendorCard({
  vendor,
  serviceCount,
  className,
}: VendorCardProps) {
  const cover = covers[Math.abs(vendor.id.length * 7) % covers.length];
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
        className,
      )}
    >
      <div className="relative h-32 w-full bg-muted sm:h-36">
        <img
          src={cover}
          alt={`Portfolio of ${vendor.businessName ?? vendor.name}`}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
        {vendor.subscriptionPlan === "premium" ? (
          <PremiumBadge className="absolute right-3 top-3" />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5 pt-0">
        <div className="-mt-8 mb-1">
          <Avatar className="size-14 border-[3px] border-card shadow-sm">
            <AvatarImage src={vendor.image} alt={vendor.name} />
            <AvatarFallback className="bg-rose-tint text-burgundy">
              {initials(vendor.name)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div>
          <h3 className="font-serif text-lg font-semibold leading-snug text-foreground">
            {vendor.businessName ?? vendor.name}
          </h3>
          <p className="text-sm text-muted-foreground">by {vendor.name}</p>
        </div>
        <p className="text-sm text-muted-foreground">{vendor.specialty}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin aria-hidden className="size-3.5 text-rose" />
            {vendor.location}
          </span>
          {vendor.rating ? (
            <span className="inline-flex items-center gap-1">
              <Star
                aria-hidden
                className="size-3.5 fill-amber-500 text-amber-500"
              />
              {vendor.rating.toFixed(1)}
            </span>
          ) : null}
          <span>{serviceCount} listings</span>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="mt-auto w-full border-burgundy/30 text-burgundy hover:bg-rose-tint hover:text-burgundy"
        >
          <Link href={`/services?vendor=${vendor.id}`}>
            View Services <ArrowRight aria-hidden className="size-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
