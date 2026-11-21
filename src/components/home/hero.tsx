 
"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Heart, ShieldCheck, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TRUST_AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=60",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=60",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=60",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=60",
];

export function Hero() {
  const reduce = useReducedMotion();
  const fadeUp = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { y: 28 },
          animate: { y: 0 },
          transition: { duration: 0.65, delay, ease: [0.21, 0.47, 0.32, 0.98] as const },
        };

  return (
    <section className="relative overflow-hidden bg-ivory">
      <div className="wed-texture pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div
        className="pointer-events-none absolute -right-40 -top-40 size-[480px] rounded-full bg-rose-soft/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-24 size-[380px] rounded-full bg-sage-tint/60 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pb-28 lg:pt-20">
        {/* Copy */}
        <div className="max-w-xl">
          <motion.div {...fadeUp(0)}>
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-soft bg-white/80 px-3.5 py-1.5 text-xs font-medium text-burgundy shadow-xs backdrop-blur-sm">
              <Sparkles aria-hidden className="size-3.5 text-rose" />
              Bangladesh&apos;s trusted wedding marketplace
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.08)}
            className="mt-6 font-serif text-4xl font-semibold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]"
          >
            Everything You Need for Your{" "}
            <span className="relative inline-block text-burgundy">
              Perfect Wedding
              <svg
                aria-hidden
                viewBox="0 0 220 12"
                className="absolute -bottom-1 left-0 w-full text-rose-soft"
                preserveAspectRatio="none"
              >
                <path d="M3 9c40-6 140-8 214-4" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
              </svg>
            </span>
          </motion.h1>

          <motion.p {...fadeUp(0.16)} className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Discover trusted wedding professionals, explore beautiful venues, and bring your dream
            celebration to life — all in one place.
          </motion.p>

          <motion.div {...fadeUp(0.24)} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-7 text-base shadow-sm">
              <Link href="/services">
                Explore Wedding Services <ArrowRight aria-hidden className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-burgundy/30 px-7 text-base text-burgundy hover:bg-rose-tint hover:text-burgundy"
            >
              <Link href="/sign-up?role=vendor">
                <Heart aria-hidden className="size-4" /> Become a Vendor
              </Link>
            </Button>
          </motion.div>

          <motion.div {...fadeUp(0.32)} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {TRUST_AVATARS.map((src, i) => (
                  <Avatar key={i} className="size-9 border-2 border-white shadow-sm">
                    <AvatarImage src={src} alt="" />
                    <AvatarFallback className="bg-rose-tint text-[10px] text-burgundy">♥</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <div className="text-sm">
                <p className="font-semibold text-foreground">2,000+ couples</p>
                <p className="text-muted-foreground">planned their day with WedPlan</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <div className="flex" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <span className="text-muted-foreground">
                <strong className="font-semibold text-foreground">4.9</strong> average vendor rating
              </span>
            </div>
          </motion.div>
        </div>

        {/* Editorial image composition */}
        <motion.div
          {...(reduce
            ? {}
            : {
                initial: { scale: 0.96, y: 20 },
                animate: { scale: 1, y: 0 },
                transition: { duration: 0.8, delay: 0.15, ease: [0.21, 0.47, 0.32, 0.98] as const },
              })}
          className="relative mx-auto w-full max-w-lg lg:max-w-none"
        >
          <div className="relative aspect-[4/4.6] w-full sm:aspect-[4/4.2]">
            <img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80"
              alt="A bride and groom embracing during their wedding celebration"
              className="absolute inset-x-0 top-0 h-[68%] w-full rounded-t-[10rem] rounded-b-2xl object-cover shadow-lg"
              fetchPriority="high"
            />
            <img
              src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=700&q=80"
              alt="A romantic bridal bouquet with soft roses"
              className="absolute bottom-0 left-0 h-[42%] w-[52%] rounded-2xl border-4 border-white object-cover shadow-lg"
              loading="eager"
            />
            <img
              src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=700&q=80"
              alt="Elegantly decorated wedding reception tables"
              className="absolute bottom-[8%] right-0 h-[38%] w-[44%] rounded-2xl border-4 border-white object-cover shadow-lg"
              loading="eager"
            />

            <div className="absolute -left-3 top-[46%] flex items-center gap-2.5 rounded-xl border border-border bg-white/95 px-3.5 py-2.5 shadow-md backdrop-blur-sm sm:-left-6">
              <span className="flex size-9 items-center justify-center rounded-full bg-sage-tint text-[#4d5c44]">
                <ShieldCheck aria-hidden className="size-4" />
              </span>
              <div className="text-xs">
                <p className="font-semibold text-foreground">Verified Vendors</p>
                <p className="text-muted-foreground">Reviewed before listing</p>
              </div>
            </div>

            <div className="absolute -right-2 bottom-[46%] flex items-center gap-2.5 rounded-xl border border-border bg-white/95 px-3.5 py-2.5 shadow-md backdrop-blur-sm sm:-right-5">
              <span className="flex size-9 items-center justify-center rounded-full bg-rose-tint text-burgundy">
                <Heart aria-hidden className="size-4 fill-current" />
              </span>
              <div className="text-xs">
                <p className="font-semibold text-foreground">Easy Booking</p>
                <p className="text-muted-foreground">Request in one click</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
