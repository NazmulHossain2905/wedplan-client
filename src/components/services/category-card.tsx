 
"use client";

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: Category;
  serviceCount: number;
  className?: string;
}

export function CategoryCard({ category, serviceCount, className }: CategoryCardProps) {
  return (
    <Link
      href={`/services?category=${encodeURIComponent(category.name)}`}
      className={cn(
        "group relative block overflow-hidden rounded-xl shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
        className,
      )}
      aria-label={`Explore ${category.name} services`}
    >
      <div className="aspect-[4/5] w-full bg-muted sm:aspect-[3/4]">
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#2b141b]/85 via-[#2b141b]/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-5">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-rose-soft">
          {serviceCount} {serviceCount === 1 ? "service" : "services"}
        </p>
        <h3 className="font-serif text-xl font-semibold leading-snug text-white">
          {category.name}
        </h3>
        <p className="flex items-center gap-1 text-sm text-white/85">
          <MapPin aria-hidden className="size-3.5" /> Explore category
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-300 group-hover:translate-x-1"
          />
        </p>
      </div>
    </Link>
  );
}
