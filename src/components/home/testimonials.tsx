"use client";

import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { TESTIMONIALS } from "@/data/testimonials";
import { Quote, Star, StarHalf } from "lucide-react";

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: full }).map((_, i) => (
        <Star
          key={i}
          aria-hidden
          className="size-4 fill-amber-500 text-amber-500"
        />
      ))}
      {half ? (
        <StarHalf
          aria-hidden
          className="size-4 fill-amber-500 text-amber-500"
        />
      ) : null}
      {Array.from({ length: 5 - full - (half ? 1 : 0) }).map((_, i) => (
        <Star
          key={`e-${i}`}
          aria-hidden
          className="size-4 text-muted-foreground/40"
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section
      className="border-y border-border/70 bg-white/60 dark:bg-card/40"
      aria-labelledby="testimonials-heading"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Love stories"
          title='Couples Who Said "I Do" with WedPlan'
          description="Real words from newlyweds who found their perfect vendors on the platform."
        />
        <Reveal>
          <Carousel
            opts={{ align: "start", loop: true }}
            className="mx-auto w-full max-w-5xl px-1"
            aria-label="Customer testimonials"
          >
            <CarouselContent className="-ml-4">
              {TESTIMONIALS.map((t) => (
                <CarouselItem
                  key={t.id}
                  className="pl-4 sm:basis-1/2 lg:basis-1/3"
                >
                  <Card className="h-full border-border bg-card shadow-xs">
                    <CardContent className="flex h-full flex-col gap-4 p-6">
                      <Quote
                        aria-hidden
                        className="size-7 -scale-x-100 text-rose-soft"
                      />
                      <p className="flex-1 text-sm leading-relaxed text-foreground/90">
                        &ldquo;{t.text}&rdquo;
                      </p>
                      <Stars rating={t.rating} />
                      <div className="flex items-center gap-3 border-t border-border pt-4">
                        <Avatar className="size-10 border border-border">
                          <AvatarImage src={t.avatar} alt={t.name} />
                          <AvatarFallback className="bg-rose-tint text-burgundy">
                            {t.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {t.name} &amp; {t.partner}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {t.location} · {t.weddingDate}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs italic text-muted-foreground">
                        Booked {t.serviceName}
                      </p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious
              className="-left-4 border-border bg-card text-burgundy shadow-md sm:-left-6"
              aria-label="Previous testimonials"
            />
            <CarouselNext
              className="-right-4 border-border bg-card text-burgundy shadow-md sm:-right-6"
              aria-label="Next testimonials"
            />
          </Carousel>
        </Reveal>
      </div>
    </section>
  );
}
