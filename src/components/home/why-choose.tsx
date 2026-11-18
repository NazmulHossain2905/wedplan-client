"use client";

import { Reveal, StaggerGrid, StaggerItem } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { HOW_IT_WORKS, WHY_CHOOSE } from "@/data/testimonials";
import {
  BadgeDollarSign,
  CalendarCheck,
  Heart,
  Lock,
  Search,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  ShieldCheck,
  Search,
  CalendarCheck,
  BadgeDollarSign,
  Heart,
  Lock,
};

export function WhyChoose() {
  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      aria-labelledby="why-heading"
    >
      <SectionHeading
        eyebrow="Why WedPlan"
        title="Why Choose WedPlan?"
        description="Planning a wedding should feel like a celebration, not a chore. We take care of the details so you can take care of the moment."
      />
      <StaggerGrid className="grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {WHY_CHOOSE.map((benefit) => {
          const Icon = ICONS[benefit.icon] ?? Heart;
          return (
            <StaggerItem key={benefit.title} className="h-full">
              <div className="group h-full rounded-xl border border-border bg-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-rose-soft hover:shadow-md">
                <span className="flex size-12 items-center justify-center rounded-lg bg-rose-tint text-burgundy transition-colors duration-300 group-hover:bg-burgundy group-hover:text-rose-tint">
                  <Icon aria-hidden className="size-5.5" />
                </span>
                <h3 className="mt-5 font-serif text-lg font-semibold text-foreground">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerGrid>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section
      className="border-y border-border/70 bg-[#33232c] text-white"
      aria-labelledby="how-heading"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-rose-soft">
            Simple from start to &quot;I do&quot;
          </p>
          <h2 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl">
            How WedPlan Works
          </h2>
          <p className="mt-3 text-base leading-relaxed text-white/70">
            Four gentle steps between you and a beautifully planned wedding.
          </p>
        </Reveal>

        <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((step, i) => (
            <Reveal
              as="li"
              key={step.step}
              delay={i * 0.1}
              className="relative"
            >
              <div className="flex h-full flex-col rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-rose-soft/50">
                <span className="font-serif text-4xl font-semibold text-rose-soft/90">
                  {step.step}
                </span>
                <h3 className="mt-4 font-serif text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  {step.description}
                </p>
              </div>
              {i < HOW_IT_WORKS.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute -right-5 top-1/2 hidden -translate-y-1/2 text-rose-soft/60 lg:block"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="size-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      d="M5 12h14m0 0-6-6m6 6-6 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              ) : null}
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
