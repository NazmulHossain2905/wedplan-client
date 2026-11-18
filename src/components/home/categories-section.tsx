"use client";

import { CategoryCard } from "@/components/services/category-card";
import { StaggerGrid, StaggerItem } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { CATEGORIES } from "@/data/categories";
import { usePublicServices } from "@/hooks/queries";
import { useCallback } from "react";

export function CategoriesSection() {
  const { data } = usePublicServices({ limit: 100 });
  const services = data?.services ?? [];

  const countFor = useCallback(
    (name: string) => services.filter((s) => s.category === name).length,
    [services],
  );

  return (
    <section
      className="border-y border-border/70 bg-white/60"
      aria-labelledby="categories-heading"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Browse by category"
          title="Wedding Service Categories"
          description="Whatever your celebration needs, find it organised — from the first photoshoot to the final farewell."
        />
        <StaggerGrid className="grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
          {CATEGORIES.map((category) => (
            <StaggerItem key={category.id} className="h-full">
              <CategoryCard
                category={category}
                serviceCount={countFor(category.name)}
              />
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
