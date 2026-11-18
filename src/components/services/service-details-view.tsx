"use client";

import { BookingDialog } from "@/components/services/booking-dialog";
import {
  ServiceCard,
  ServiceCardSkeleton,
} from "@/components/services/service-card";
import { ServiceGallery } from "@/components/services/service-gallery";
import { PremiumBadge } from "@/components/shared/badges";
import { EmptyState } from "@/components/shared/empty-state";
import { Reveal } from "@/components/shared/reveal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { usePublicServices, useService } from "@/hooks/queries";
import { formatBDT, initials } from "@/lib/helpers";
import {
  BadgeCheck,
  CalendarDays,
  Heart,
  MapPin,
  SearchX,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

function BookingNotice({
  tone,
  children,
}: {
  tone: "info" | "warn";
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        tone === "warn"
          ? "rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          : "rounded-lg border border-border bg-muted/60 px-4 py-3 text-sm text-muted-foreground"
      }
    >
      {children}
    </div>
  );
}

export function ServiceDetailsView({ serviceId }: { serviceId: string }) {
  const { user, hydrated } = useAuth();
  const { data, isLoading, error } = useService(serviceId);
  const [bookingOpen, setBookingOpen] = React.useState(false);

  const service = data?.service;
  const vendor = service?.vendor;

  const isOwner = Boolean(user && service && user.id === service.vendorId);
  const isAdmin = user?.role === "admin";
  const isCustomer = user?.role === "customer";
  const canPreview = isOwner || isAdmin;
  const publiclyVisible = Boolean(
    service && service.status === "approved" && service.isAvailable,
  );

  const { data: relatedData, isLoading: relatedLoading } = usePublicServices(
    service ? { category: service.category, limit: 4 } : { limit: 4 },
  );
  const related = (relatedData?.services ?? [])
    .filter((s) => s.id !== serviceId)
    .slice(0, 3);

  if (isLoading || !hydrated) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-5 w-64" />
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Skeleton className="aspect-[16/10] w-full rounded-xl" />
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !service || (!publiclyVisible && !canPreview)) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={<SearchX aria-hidden />}
          title="Service not found"
          description="This service doesn't exist, or it is no longer publicly available. It may have been unpublished by the vendor or removed by an administrator."
          action={{ label: "Browse all services", href: "/services" }}
          className="mx-auto max-w-xl"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/services">Services</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-48 truncate sm:max-w-72">
              {service.serviceName}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {canPreview && !publiclyVisible ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Preview mode — this service is{" "}
          <strong>
            {service.status !== "approved"
              ? `${service.status} review`
              : service.isAvailable
                ? "approved"
                : "inactive"}
          </strong>{" "}
          and hidden from customers. Only you and administrators can see this
          page.
        </div>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* Main column */}
        <div className="min-w-0">
          <ServiceGallery
            images={service.images}
            serviceName={service.serviceName}
          />

          <div className="mt-8 space-y-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-full bg-rose-tint px-3 py-1 text-xs font-medium text-burgundy">
                {service.category}
              </span>
              {service.rating > 0 ? (
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <Star
                    aria-hidden
                    className="size-4 fill-amber-500 text-amber-500"
                  />
                  <strong className="text-foreground">
                    {service.rating.toFixed(1)}
                  </strong>
                  <span>({service.reviews} reviews)</span>
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin aria-hidden className="size-4 text-rose" />
                {service.location}
              </span>
            </div>

            <h1 className="font-serif text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              {service.serviceName}
            </h1>

            <p className="max-w-3xl whitespace-pre-line text-base leading-relaxed text-muted-foreground">
              {service.description}
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Price
                </p>
                <p className="mt-1 font-serif text-xl font-semibold text-burgundy">
                  {formatBDT(service.price)}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Location
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <MapPin aria-hidden className="size-4 text-rose" />{" "}
                  {service.location}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Availability
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <CalendarDays aria-hidden className="size-4 text-sage" />
                  {publiclyVisible
                    ? "Available for booking"
                    : "Not accepting bookings"}
                </p>
              </div>
            </div>
          </div>

          {/* Vendor */}
          <Separator className="my-8" />
          <section
            aria-label="Vendor information"
            className="rounded-xl border border-border bg-card p-6 shadow-xs"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="size-16 border-2 border-rose-soft/60">
                  <AvatarImage
                    src={vendor?.image}
                    alt={vendor?.name ?? "Vendor"}
                  />
                  <AvatarFallback className="bg-rose-tint text-burgundy">
                    {initials(vendor?.name ?? "W")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-serif text-xl font-semibold text-foreground">
                      {vendor?.businessName ?? vendor?.name}
                    </h2>
                    {vendor?.subscriptionPlan === "premium" ? (
                      <PremiumBadge />
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    by {vendor?.name}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    {vendor?.rating ? (
                      <span className="inline-flex items-center gap-1">
                        <Star
                          aria-hidden
                          className="size-3.5 fill-amber-500 text-amber-500"
                        />
                        {vendor.rating.toFixed(1)}
                      </span>
                    ) : null}
                    {vendor?.completedWeddings ? (
                      <span className="inline-flex items-center gap-1">
                        <Users aria-hidden className="size-3.5" />
                        {vendor.completedWeddings}+ weddings
                      </span>
                    ) : null}
                    {vendor?.location ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin aria-hidden className="size-3.5 text-rose" />
                        {vendor.location}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <Button
                asChild
                variant="outline"
                className="w-full border-burgundy/30 text-burgundy hover:bg-rose-tint hover:text-burgundy sm:w-auto"
              >
                <Link href={`/services?vendor=${service.vendorId}`}>
                  <BadgeCheck aria-hidden className="size-4" /> View Vendor
                  Services
                </Link>
              </Button>
            </div>
            {vendor?.bio ? (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {vendor.bio}
              </p>
            ) : null}
          </section>

          {/* Related services */}
          {relatedLoading ? (
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <ServiceCardSkeleton key={i} />
              ))}
            </div>
          ) : related.length > 0 ? (
            <section aria-label="Similar services" className="mt-12">
              <h2 className="mb-6 font-serif text-2xl font-semibold text-foreground">
                Similar Services You May Like
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((s) => (
                  <Reveal key={s.id} className="h-full">
                    <ServiceCard service={s} vendor={s.vendor} />
                  </Reveal>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {/* Booking sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Starting from</p>
            <p className="mt-1 font-serif text-3xl font-semibold text-burgundy">
              {formatBDT(service.price)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Final quote confirmed by the vendor after your request
            </p>

            <div className="mt-5 space-y-3">
              {isCustomer ? (
                publiclyVisible ? (
                  <Button
                    size="lg"
                    className="w-full gap-2"
                    onClick={() => setBookingOpen(true)}
                  >
                    <Heart aria-hidden className="size-4 fill-current" />{" "}
                    Request Booking
                  </Button>
                ) : (
                  <BookingNotice tone="warn">
                    This service is not currently available for booking.
                  </BookingNotice>
                )
              ) : null}

              {isOwner ? (
                <BookingNotice tone="warn">
                  This is your own service — you cannot book your own listing.
                </BookingNotice>
              ) : null}

              {user?.role === "vendor" && !isOwner ? (
                <BookingNotice tone="warn">
                  Booking requests can only be submitted by customer accounts.
                  Switch to a customer account to book this service.
                </BookingNotice>
              ) : null}

              {isAdmin ? (
                <BookingNotice tone="info">
                  Admins cannot submit customer booking requests.
                </BookingNotice>
              ) : null}

              <ul className="space-y-2.5 pt-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <BadgeCheck
                    aria-hidden
                    className="mt-0.5 size-4 shrink-0 text-sage"
                  />
                  Free booking request — no payment required now
                </li>
                <li className="flex items-start gap-2.5">
                  <BadgeCheck
                    aria-hidden
                    className="mt-0.5 size-4 shrink-0 text-sage"
                  />
                  Vendor responds directly in your dashboard
                </li>
                <li className="flex items-start gap-2.5">
                  <BadgeCheck
                    aria-hidden
                    className="mt-0.5 size-4 shrink-0 text-sage"
                  />
                  Cancel pending requests anytime
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      <BookingDialog
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        service={service}
        vendor={vendor}
      />
    </div>
  );
}
