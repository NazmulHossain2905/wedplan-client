 
"use client";

import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";

export function CtaSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1600&q=80"
            alt="A couple walking together at sunset after their wedding ceremony"
            className="absolute inset-0 size-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#3a2129]/92 via-[#3a2129]/70 to-[#3a2129]/35" />
          <div className="relative flex flex-col items-start gap-6 px-6 py-14 sm:px-12 sm:py-20 lg:max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
              <Heart aria-hidden className="size-3.5 fill-rose-soft text-rose-soft" />
              For wedding professionals
            </span>
            <h2 className="font-serif text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Make Your Wedding Business Shine
            </h2>
            <p className="max-w-lg text-base leading-relaxed text-white/80">
              Join WedPlan and connect with thousands of couples actively planning their weddings.
              Publish your services, manage bookings, and grow your business — free to start.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 bg-white px-7 text-base text-burgundy hover:bg-rose-soft hover:text-burgundy-deep">
                <Link href="/sign-up?role=vendor">
                  Become a Vendor <ArrowRight aria-hidden className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-white/40 bg-transparent px-7 text-base text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/services">Explore the Marketplace</Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
